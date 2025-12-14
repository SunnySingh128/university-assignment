const multer = require("multer");

// Use memory storage so we can parse CSV in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
