const express = require("express");
const router = express.Router();
const { sendEmail } = require("../utils/bulkupload.js");  // import the function
const upload = require("../middleware/upload1.js");
const csv = require("csv-parser");
// const validator = require("validator");
const cloudinary = require("cloudinary").v2;
const stream = require("stream"); // ✅ import stream for PassThrough
const User = require("../model/user");
// simple password generator
function generatePassword() {
    return Math.random().toString(12).slice(-8);
}
cloudinary.config({ 
  cloud_name: 'dc93tf6uf', 
  api_key: '712382633241427', 
  api_secret: 'RMjpwrbP1gspJ2dkjlnf3qCerKY'
});

router.post("/send-emails", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "CSV file is required",
      });
    }

    const usersFromCSV = [];
    const createdUsers = [];
    const existingUsers = [];
    const invalidEmails = [];
    const duplicateRows = [];

    // 🔹 Read CSV from buffer
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    bufferStream
      .pipe(csv())
      .on("data", (row) => {
        usersFromCSV.push(row);
      })
      .on("end", async () => {

        for (const user of usersFromCSV) {
          const email = user.email?.trim();
          const fullName = user.fullName?.trim();
          const role = user.role?.trim();
          const department = user.department?.trim();

          // ❌ Invalid email
          if (!email) {
            invalidEmails.push(email || "Empty email");
            continue;
          }

          // ❌ Existing user
          const exists = await User.exists({ email });
          if (exists) {
            existingUsers.push(email);
            duplicateRows.push({
              fullName,
              email,
              role,
              department,
            });
            continue;
          }

          // ✅ Create new user
          const password = generatePassword();

          await User.create({
            email,
            fullName,
            role,
            department,
            password,
          });

          await sendEmail(email, password);
          createdUsers.push(email);
        }

        // 🧾 Create duplicate CSV (if needed)
        let duplicateCsvUrl = null;

        if (duplicateRows.length > 0) {
          const header = "fullName,email,role,department\n";
          const rows = duplicateRows
            .map(
              (u) =>
                `"${u.fullName}","${u.email}","${u.role}","${u.department}"`
            )
            .join("\n");

          const duplicateCsvBuffer = Buffer.from(header + rows);

          // ☁️ Upload duplicate CSV to Cloudinary
          await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                resource_type: "raw",
                folder: "uploads",
                public_id: "duplicate-users",
              },
              (error, result) => {
                if (error) return reject(error);
                duplicateCsvUrl = result.secure_url;
                resolve();
              }
            ).end(duplicateCsvBuffer);
          });
        }

        return res.json({
          success: true,
          message: "CSV processed successfully",
          data: {
            createdCount: createdUsers.length,
            createdUsers,
            existingUsers,
            invalidEmails,
            duplicateCsvAvailable: duplicateRows.length > 0,
            duplicateCsvUrl,
          },
        });
      })
      .on("error", (err) => {
        console.error("CSV parsing error:", err);
        return res.status(500).json({
          success: false,
          message: "Error parsing CSV file",
        });
      });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Error processing CSV file",
    });
  }
});

module.exports = router;
