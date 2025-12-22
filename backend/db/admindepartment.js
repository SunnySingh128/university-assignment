const model=require('../model/user');
const User=require("../model/user")
async function getAllDepartments(req, res) {
  try {
    // Group users by department and count them
    const departmentCounts = await model.aggregate([
      {
        $group: {
          _id: "$department", // group by department field
          total: { $sum: 1 }  // count how many users in each department
        }
      },
      {
        $project: {
          _id: 0,
          department: "$_id",
          total: 1
        }
      }
    ]);

    res.status(200).json(departmentCounts);
  } catch (error) {
    console.error("Error fetching department counts:", error);
    res.status(500).json({ message: "Server error", error });
  }
}
async function getUser(req, res) {
  try {
    // Fetch all users and select only the required fields
    const users = await model.find({}, { fullName: 1, email: 1, role: 1, department: 1, _id: 1 });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
   console.log(users)
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error", error });
  }
}
async function getAllProfessors(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // 1️⃣ Find student and get department
    const student = await model.findOne(
      { email },
      { department: 1, _id: 0 }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const studentDept = student.department;

    // 2️⃣ Find professors from same department (include email)
    const professors = await model.find(
      { role: "professor", department: studentDept },
      { email: 1, _id: 0 }   // ✅ FIX HERE
    );

    if (professors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No professors found in this department"
      });
    }

    // 3️⃣ Extract professor emails
    const professorEmails = professors.map(p => p.email);
console.log(professorEmails)
    res.status(200).json({
      success: true,
      department: studentDept,
      professors: professorEmails
    });

  } catch (error) {
    console.error("Error fetching professors:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}
const updateUserByEmail = async (req, res) => {
  try {
    const { _id, fullName, email, role, department } = req.body;
   console.log(req.body);
    if (!_id) {
      return res.status(400).json({
        message: "User ID is required"
      });
    }
console.log(".....checking");
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        fullName,
        email,
        role,
        department
      },
      {
        new: true,
        runValidators: true
      }
    );
    console.log(updatedUser);
    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("UPDATE USER ERROR 👉", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
};




async function DeleteUser(req,res){
  try {
     try {
    const { email } = req.body; // or req.params, depending on your route

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email and only return the _id field
    const user1 = await model.findOne({ email: email }, { _id: 1 });

    if (!user1) {
      return res.status(404).json({ message: "User not found" });
    }
    const id=user1._id;
    const user = await model.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error", error });
  }
}catch(error){
  console.error("Error deleting user:",error);
  res.status(500).json({message:"Server error",error});
}
}
module.exports={getAllDepartments,getUser,DeleteUser,getAllProfessors,updateUserByEmail};
