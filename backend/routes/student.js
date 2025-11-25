const express = require("express");
const router = express.Router();
const { uploadAssignment,fetchPdf } = require("../db/studentassignment");
const upload = require("../middleware/upload.js");
// Use the named controller function here
router.post("/upload", upload.single("file"), uploadAssignment);
router.get("/student-assignment", fetchPdf);
module.exports = router;
