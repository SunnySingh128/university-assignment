const model = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendemail');
const crypto = require("crypto");

function generateRandomPassword(length = 10) {
  return crypto.randomBytes(length)
    .toString("base64")        // convert random bytes to readable string
    .slice(0, length)          // cut to desired length
    .replace(/\+/g, "A")       // remove + (email safe)
    .replace(/\//g, "B");      // remove / (email safe)
}

async function register(req, res) {
  try {
    const { fullName, email, role, department} = req.body;
       console.log(req.body);
    if (!fullName || !email || !role || !department) {
      return res.status(400).send("Please fill all fields");
    }

    // if (password !== confirmPassword) {
    //   return res.status(400).send("Passwords do not match");
    // }

    // Check if email already exists
    const alreadyUser = await model.findOne({ email });
    if (alreadyUser) {
      return res.status(400).send("User already registered with this email");
    }

    // Hash passwor

    // Create user
        const randomPassword = generateRandomPassword(5);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
    const user = await model.create({
      fullName,
      email,
      role,
      department,
      password: hashedPassword,
    });

    // ✉️ Send login credentials to user
    const message = `
Hello ${fullName},

Your university account has been created by the admin.

Login Details:
Email: ${email}
Password: ${randomPassword}

Please login and change your password immediately.

Regards,
University Admin
    `;

    await sendEmail(email, "Your University Login Credentials", message);

    return res.status(201).json({
      message: "User created & email sent successfully!",
      user,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
async function fetchAllCounts(req, res) {
  console.log("hitting the api")
  try {
    // total users

    // role-based counts
    const studentCount = await model.countDocuments({ role: "student" });
    const professorCount = await model.countDocuments({ role: "professor" });
    const hodCount = await model.countDocuments({ role: "hod" });

    // department-wise counts
const departmentCounts = await model.aggregate([
  {
    $group: {
      _id: "$department",        // group users by department name
      count: { $sum: 1 }         // count number of users per department
    }
  },
  {
    $project: {
      _id: 0,
      department: "$_id",
      count: 1
    }
  },
  {
    $sort: { department: 1 }     // optional: sort alphabetically
  }
]);

    res.status(200).json({
          departmentCounts,
      studentCount,
      professorCount,
      hodCount,
    });
  } catch (error) {
    console.error("Error fetching user counts:", error);
    res.status(500).json({ message: "Server error", error });
  }
}


module.exports = { register,fetchAllCounts };
