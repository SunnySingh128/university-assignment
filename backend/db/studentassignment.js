const Assignment = require("../model/studentassignment");
const uploadAssignment = async (req, res) => {
  try {
    console.log(req.file);
    const filePath = req.file.path;

    const data = await Assignment.create({
      email: req.body.email,
      title: req.body.title,
      fileUrl: filePath,
      status: "Submitted"
    });

    return res.json({
      message: "Assignment uploaded successfully",
      data,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const fetchPdf = async (req, res) => {
  try {
    const email = req.query.email;

    // Find all assignments for this email
    const assignments = await Assignment.find({ email });
console.log(assignments);
    // If no assignments found
    if (!assignments || assignments.length === 0) {
      return res.status(404).json({ error: "No assignments found" });
    }

    // Send all assignments as JSON
    return res.json({
      success: true,
      assignments: assignments
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports={uploadAssignment,fetchPdf};