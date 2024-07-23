const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/verifytoken");
const { verifyAdmin } = require("../middleware/verifyAdmin");
const {
  getCourse,
  updateCourse,
  getCourseByID,
  uploadCourse,
  deleteCourse,
} = require("../Controller/courseController");

router.get("/all", getCourse);
router.get("/:id", verifyToken, getCourseByID);

router.put("/:id/videos", verifyToken, verifyAdmin, updateCourse);

router.post("/upload", verifyToken ,verifyAdmin, uploadCourse);

router.delete("/delete/:id",verifyToken ,verifyAdmin, deleteCourse);
module.exports = router;
