// utils/sendEmail.js
const nodemailer = require("nodemailer");
require("dotenv").config();
const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,   // your email
        pass: process.env.EMAIL_PASS,   // your app password
      },
    });

    const mailOptions = {
      from: `"EduFlow" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");

  } catch (error) {
    console.error("Email sending failed:", error.message);
  }
};

module.exports = sendEmail;
