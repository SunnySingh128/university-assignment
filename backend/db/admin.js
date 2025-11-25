const model=require('../model/admin');
const model1=require('../model/user');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const dotenv=require('dotenv');
const Department=require('../model/departmentcreation');
dotenv.config();
async function register(req,res){
  const {email,role,password}=req.body;
  
  if(!email||!role||!password){
    return res.status(400).json({message:"Please fill all the fields"});
  }
  const user=await model.findOne({email});
  if(user){
    return res.status(400).json({message:"User already exists"});
  }
  const salt=await bcrypt.genSalt(10);
  const hash=await bcrypt.hash(password,salt);
  await model.create({email,role,password:hash});
  res.status(201).json({message:"User created successfully"});
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
console.log(email,password);
    // Check for missing fields
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

 const admin = await model.findOne({ email });
 if (!admin) {
    // Find user by email
    const user = await model1.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }
    console.log("jai")

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send token and role only
    res.status(200).json({
      message: "User logged in successfully",
      token,
      role: user.role
    });
  }else{
      const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
     res.status(200).json({
      message: "admin logged in successfully",
      role: admin.role,
    });
  }

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    // check if department already exists
    // const existing = await Department.findOne({ name });
    // if (existing) {
    //   return res.status(400).json({ message: "Department already exists" });
    // }

    // create department
    const department = new Department({ name });
    await department.save();

    res.status(201).json({
      message: "Department created successfully",
      department
    });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({ message: "Server error", error });
  }

};
 async function  getAllDepartments1 (req, res) {
  try {
    const departments = await Department.find();

    if (!departments || departments.length === 0) {
      return res.status(404).json({ message: "No departments found" });
    }

    res.status(200).json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports={register,login,createDepartment,getAllDepartments1};