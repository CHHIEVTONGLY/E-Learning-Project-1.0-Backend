const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const user = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    isSSO: { type: Boolean, default: false },
    password: {
      type: String,
      required: function () {
        return !this.isSSO; // password is required only if isSSO is false
      },
    },
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
