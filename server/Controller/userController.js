const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const user = require("../Model/UserModel");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

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
    const users = await user.findById(req.user.id).select("-password");
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

module.exports = { register, login, getUserDetails, updateCourse };
