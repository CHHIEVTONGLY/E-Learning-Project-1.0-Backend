const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getUserDetails,
  updateCourse,
  googleIntegration,
  updateUserProfile,
} = require("../Controller/userController");
const {
  createUserValidator,
  loginValidator,
} = require("../validation/validation");

const { verifyToken } = require("../middleware/verifytoken");

router.post("/login", loginValidator, login);
router.post("/register", createUserValidator, register);

// Google login

router.post("/register-google", googleIntegration);

// Update course into user information after sucessfully purchased
router.put("/:userID/purchase/:courseID", updateCourse);

// Update user profile
router.put("/profile/:id", verifyToken, updateUserProfile);

router.get("/me", verifyToken, getUserDetails);
module.exports = router;
