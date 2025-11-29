const express = require("express");
const router = express.Router();
const { uploadAssignment,fetchPdf,fetchAllAssignments,fetchAllAssignments1 } = require("../db/studentassignment");
const upload = require("../middleware/upload.js");
// Use the named controller function here
router.post("/upload", upload.single("file"), uploadAssignment);
router.get("/student-assignment", fetchPdf);
router.post("/professor",fetchAllAssignments);
router.post("/professor1/:id",fetchAllAssignments1);
// router.post("/professor1/:id/decline",fetchAllAssignments1);
module.exports = router;
