const User = require("../model/user");
const bcrypt = require("bcryptjs");
const  sendEmail  = require("../utils/checkemail");

const otpStore = {}; // simple dev store

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 }; // 10 mins

    const html = `<p>Your OTP: <b>${otp}</b> (expires in 10 minutes)</p>`;
    await sendEmail(email, "Password reset OTP", html);

    return res.json({ message: "OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function verifyOtpAndReset(req, res) {
  try {
    const { email, otp, password, confirmPassword } = req.body;
    if (!email || !otp || !password || !confirmPassword)
      return res.status(400).json({ message: "All fields required" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const record = otpStore[email];
    if (!record) return res.status(400).json({ message: "OTP not found" });
    if (record.expires < Date.now()) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired" });
    }
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    const hashed = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate({ email }, { password: hashed });

    delete otpStore[email];
    return res.json({ message: "Password updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { forgotPassword, verifyOtpAndReset };
