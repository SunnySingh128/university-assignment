const Assignment = require("../model/studentassignment");// or Student model
const User=require('../model/user');
const Assignment1=require("../model/hod.js");

const uploadAssignment = async (req, res) => {
  try {
    const filePath = req.file.path;

    const data = await Assignment.create({
      email: req.body.email,
      title: req.body.title,
      professor: req.body.professor,
      fileUrl: filePath,
      status: "Submitted"
    });
    return res.json({
      success: true,
      message: `your assignment has been uploaded successfully`,
      data,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
};


const fetchPdf = async (req, res) => {
  try {
    const email = req.query.email;
         if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const department= await User.findOne({ email }).select("department");
    console.log(department);
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
// Assuming you have models: Professor, Assignment, User

async function fetchAllAssignments(req, res) {
  try {
    console.log("sunny")
    const { professor } = req.body;  // professor name comes from frontend, e.g., "suhani"
    // 1. Check if professor exists in ANY assignment
    const professor1 = await Assignment.findOne({ professor: professor });
    console.log(professor +"print hoja");
    const department= await User.findOne({email:professor}).select("department");
    if (!professor1) {
      return res.status(404).json({
        success: false,
        message: "Professor not found",
      });
    }

    // 2. Fetch all assignments of this professor from studentassignment
    const assignments = await Assignment.find({ professor: professor })
      .select("email title fileUrl uploadedAt status");

    // 3. Fetch all assignments from hod (Assignment1)
    const forwadedAssignments = await Assignment1.find({ forwardto: professor })

    // 4. Combine both arrays
           console.log(forwadedAssignments);
    const allAssignments = [...assignments, ...forwadedAssignments];
    if (!allAssignments || allAssignments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No assignments found",
      });
    }

    // 5. Return results
    return res.json({
      success: true,
      total: allAssignments.length,
      assignments: allAssignments,
      department:department.department,
    });

  } catch (error) {
    console.log("Error fetching assignments:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

async function fetchAllAssignments1(req, res) {
  try {
    const assignmentId = req.params.id;
    const { status,feedback } = req.body;
    console.log(status);
    // find assignment
    console.log(assignmentId)
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }
    // update status
    assignment.status = status === "accepted" ? "accepted" : "rejected";
      if(status === "rejected"){
        assignment.feedback = feedback;
      }
    await assignment.save();

    res.json({
      success: true,
      message: `Assignment ${assignment.status} successfully`,
      updatedAssignment: assignment,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

module.exports={uploadAssignment,fetchPdf,fetchAllAssignments,fetchAllAssignments1};