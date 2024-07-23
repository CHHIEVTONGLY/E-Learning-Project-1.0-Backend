const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const course = new Schema(
  {
    title: { type: String, unique: true, required: true },
    thumbnail: { type: String, required: true },
    description: { type: String, unique: true, required: true },
    price: { type: Number, required: true },
    video: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        timeLength: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const courseModel = mongoose.model("Course", course);

module.exports = courseModel;
