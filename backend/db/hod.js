const Assignment1 = require("../model/hod");
const User = require("../model/user");
const uploadAssignment = async (req, res) => {
  try {
    const filePath = req.body.fileUrl;
    const user = await User.findOne({ email: req.body.forwadedto });

if (!user) {
  return res.status(404).json({ message: "User not found" });
}

const { role } = user;
const forwardto=role;
console.log(forwardto);
    const data = await Assignment1.create({
      email: req.body.email,
      title: req.body.title,
      professor: req.body.professor,
      forwardto:req.body.forwadedto,
      fileUrl: filePath,
      department:req.body.department,
      status: req.body.status,
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

const getForwardedAssignmentDetails = async (req, res) => {
  try {
    const {email} = req.body; // ✅ GET request uses query
    console.log("HOD EMAIL 👉", email);

    // 1️⃣ Fetch ALL assignments for this HOD
    const assignments = await Assignment1.find({forwardto: email });

    if (!assignments.length) {
      return res.status(200).json([]); // ✅ return empty array
    }

    // 2️⃣ Check HOD exists
    const hodUser = await User.findOne({ 
 email }).select("email department role");

    if (!hodUser) {
      return res.status(404).json({
        message: "HOD not found in User database"
      });
    }

    // 3️⃣ Process assignments one by one
    const result = [];
    for (const assignment of assignments) {
      // Find professor
      const professorUser = await User.findOne({
        email: assignment.professor
      }).select("email department role");

      if (!professorUser) continue; // skip invalid professor

      // 4️⃣ Department validation
      if (hodUser.department !== professorUser.department) continue;
      // 5️⃣ Push valid assignment
      result.push({
        _id: assignment._id,
        email: assignment.email,
        title: assignment.title,
        fileUrl: assignment.fileUrl,
        status: assignment.status,
        professor: assignment.professor,
        hod: assignment.hod,
        department: hodUser.department,
        uploadedAt: assignment.uploadedAt,
        __v: assignment.__v
      });
    }

    // ✅ ALWAYS ARRAY
    return res.status(200).json(result);

  } catch (error) {
    console.error("FETCH ASSIGNMENT ERROR 👉", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
};


module.exports={uploadAssignment,getForwardedAssignmentDetails};