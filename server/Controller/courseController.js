const courseModel = require("../Model/CourseModel");
const asyncHandler = require("express-async-handler");

const getCourse = asyncHandler(async (req, res) => {
  const course = await courseModel.find({}).limit(5).select("-video");
  res.status(200).send(course);
});

const updateCourse = asyncHandler(async (req, res) => {
  try {
    const courseID = req.params.id;
    const { title, url, timeLength } = req.body;
    const response = await courseModel.findById(courseID);

    if (!response) return res.status(404).send("Eror: Course not found");

    response.video.push({ title: title, url: url, timeLength: timeLength });
    const updatedCourse = await response.save();

    res.json(updatedCourse);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

const getCourseByID = asyncHandler(async (req, res) => {
  try {
    const ID = req.params.id;

    const course = await courseModel.findById(ID);

    res.send(course);
  } catch (e) {
    console.error(e);
  }
});

const uploadCourse = asyncHandler(async (req, res) => {
  const { title, thumbnail, description, price } = req.body;
  const response = new courseModel({
    title: title,
    thumbnail: thumbnail,
    description: description,
    price: price,
  });

  const result = await response.save();
  res.status(200).json(result);
});

const deleteCourse = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const course = await courseModel.findById(id);

  if (!course) return res.status(404).json("Course not found");

  await courseModel.findByIdAndDelete(id);
  res.status(200).json("Delete successfully");
});
module.exports = {
  getCourse,
  updateCourse,
  getCourseByID,
  uploadCourse,
  deleteCourse,
};
