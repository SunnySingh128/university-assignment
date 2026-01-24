const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { uploadAssignment,fetchPdf,fetchAllAssignments,fetchAllAssignments1 } = require("../db/studentassignment");
const upload = require("../middleware/upload.js");
// Use the named controller function here


router.post("/upload", authenticateToken, upload.single("file"), uploadAssignment);
// cloudinary



router.get("/student-assignment", authenticateToken, fetchPdf);
router.post("/professor", authenticateToken, fetchAllAssignments);
router.post("/professor1/:id", authenticateToken, fetchAllAssignments1);
// router.post("/professor1/:id/decline",fetchAllAssignments1);
module.exports = router;
