const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const user = require("../Model/UserModel");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const s3 = require("../config/s3Config");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");

const register = asyncHandler(async (req, res) => {
  const result = validationResult(req);
  const { email, username } = req.body;

  const existingUsername = await user.findOne({ username });
  if (existingUsername) {
    return res.status(400).json({ message: "Username already exists." });
  }

  const existingUser = await user.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email is already registered" });
  } else {
    if (result.isEmpty()) {
      const { username, email, password } = req.body;
      const hashPassword = await bcrypt.hash(password, 10);
      const newUser = new user({
        username: username,
        email: email,
        password: hashPassword,
        picture:
          "https://upload.wikimedia.org/wikipedia/commons/5/5a/Black_question_mark.png",
      });

      const result = await newUser.save();
      result.password = "";
      return res
        .status(202)
        .send({ message: "Successfully registered", user: newUser });
    }
    return res.status(400).send({ errors: result.array() });
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const userFound = await user.findOne({ email: email });

    if (!userFound) {
      console.log("Failed to login: User not found");
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const passwordMatch = await bcrypt.compare(password, userFound.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // jwt token
    const token = jwt.sign(
      {
        id: userFound._id,
        email: userFound.email,
      },
      process.env.SECRET_KEY,
      { expiresIn: "12h" }
    );

    // If both email and password are correct, login is successful
    console.log("Successfully logged in");
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const getUserDetails = asyncHandler(async (req, res) => {
  try {
    const users = await user.findById(req.user.id).select("-password -role ");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const updateCourse = async (req, res) => {
  const userID = req.params.userID;
  const courseID = req.params.courseID;

  try {
    // Find the user by userID
    const getUser = await user.findById(userID);

    if (!getUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize purchasedCourses if it's undefined (optional, depending on your schema)
    getUser.purchasedCourses = getUser.purchasedCourses || [];

    // Check if courseID already exists in purchasedCourses array
    if (!getUser.purchasedCourses.includes(courseID)) {
      // Add the new courseID to purchasedCourses array
      getUser.purchasedCourses.push(courseID);
    } else {
      return res.status(400).json({ message: "Course already purchased" });
    }

    // Save the updated user object back to the database
    await getUser.save();

    // Return success response
    res.status(200).json({
      message: "Course added to purchased courses successfully",
      user: getUser, // Return the updated user object
    });
  } catch (error) {
    console.error("Error adding purchased course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const googleIntegration = async (req, res) => {
  const { email, name, picture } = req.body;

  try {
    console.log("Request received with body:", req.body);

    let users = await user.findOne({ email });

    if (!users) {
      // Register new user
      users = new user({ email: email, username: name, picture, isSSO: true });
      await users.save();
    } else if (!users.isSSO) {
      // User exists but is not an SSO user
      return res.status(400).json({
        message: "Email is already registered with a different method",
      });
    } else {
      console.log("User found and is an SSO user:", users);
    }

    // Generate token
    const token = jwt.sign(
      { email: users.email, id: users._id },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Error handling Google registration/login:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  const userID = req.params.id;
  const { username, email, password, newPassword, confirmPassword } = req.body;
  const picture = req.file; // `profile` from multer

  if (!picture && !req.body.picture) {
    return res.status(400).json({ message: "Picture is required" });
  }
  let pictureUrl;

  if (picture) {
    const uploadParams = {
      Bucket: "pprojectbucket", // Replace with your bucket name
      Key: `${uuidv4()}-${picture.originalname}`, // Unique file name
      Body: picture.buffer,
      ContentType: picture.mimetype,
    };
    try {
      // Upload new picture to S3
      await s3.send(new PutObjectCommand(uploadParams));
      pictureUrl = `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Error uploading new profile picture", error: err });
    }
  } else if (req.body.picture) {
    pictureUrl = req.body.picture; // URL directly from body
  }

  try {
    // Check if the user ID from the token matches the user ID in the request parameters
    if (req.user._id.toString() !== userID) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Find the user by ID
    const users = await user.findById(userID);
    if (!users) {
      return res.status(404).json({ error: "User not found" });
    }

    // Object to store updated fields
    const updateUserProfile = {};

    // Update fields if provided
    if (username) updateUserProfile.username = username;
    if (email) updateUserProfile.email = email;
    if (pictureUrl) updateUserProfile.picture = pictureUrl;

    // If password-related fields are provided, handle password update
    if (password || newPassword || confirmPassword) {
      if (!password) {
        return res
          .status(400)
          .json({ message: "Current password is required to update password" });
      }

      const isMatch = await bcrypt.compare(password, users.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect current password" });
      }

      if (newPassword && newPassword !== confirmPassword) {
        return res
          .status(400)
          .json({ message: "New password and confirm password do not match" });
      }

      if (newPassword) {
        updateUserProfile.password = await bcrypt.hash(newPassword, 10);
      }
    }

    // Update user profile
    const updatedUser = await user.findByIdAndUpdate(
      userID,
      updateUserProfile,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      message: "User profile updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  register,
  login,
  getUserDetails,
  updateCourse,
  googleIntegration,
  updateUserProfile,
};
