const express = require("express");
const router = express.Router();
const { forgotPassword, verifyOtpAndReset } = require("../controller/authController");

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtpAndReset);

module.exports = router;
