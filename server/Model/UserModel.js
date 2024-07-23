const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const user = new Schema(
  {
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    role: {
      type: String,
      enum: ["member", "admin"],
      default: "member",
    },
  },

  { timestamps: true }
);

const userModel = mongoose.model("users", user);

module.exports = userModel;
