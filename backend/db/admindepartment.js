const model=require('../model/user');
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
    const users = await model.find({}, { fullName: 1, email: 1, role: 1, department: 1, _id: 0 });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error", error });
  }
}
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
module.exports={getAllDepartments,getUser,DeleteUser};
