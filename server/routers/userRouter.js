const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getUserDetails,
  updateCourse
} = require("../Controller/userController");
const {
  createUserValidator,
  loginValidator,
} = require("../validation/validation");

const { verifyToken } = require("../middleware/verifytoken");

router.post("/login", loginValidator, login);
router.post("/register", createUserValidator, register);

router.put("/:userID/purchase/:courseID", updateCourse);

router.get("/me", verifyToken, getUserDetails);
module.exports = router;
