// config/uploadConfig.js
const multer = require("multer");

// Configure multer storage
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

module.exports = upload;
