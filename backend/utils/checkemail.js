const Brevo = require("@getbrevo/brevo");
require("dotenv").config();

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.API_KEY
);

async function sendEmail(to, subject, otp) {
  try {
    let sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.subject = subject;

    // Professional Email Template
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; border-radius:10px; background:#f9fafb;">
        <h2 style="color:#2563eb;">EduFlow Password Reset</h2>
        <p>Hello,</p>
        <p>You requested to reset your password. Please use the OTP below:</p>
        <div style="font-size:32px; font-weight:bold; letter-spacing:5px; color:#111; background:#e0f2fe; padding:15px; text-align:center; border-radius:8px;">
          ${otp}
        </div>
        <p style="margin-top:20px;">This OTP is valid for <b>5 minutes</b>. Do not share it with anyone.</p>
        <p>If you didn’t request this, please ignore this email.</p>
        <hr>
        <p style="color:gray; font-size:12px;">Thank you,<br>EduFlow Team</p>
      </div>
    `;

    sendSmtpEmail.sender = {
      name: "EduFlow",
      email: process.env.EMAIL,
    };

    sendSmtpEmail.to = [{ email: to }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Password Reset OTP Sent ✔");
  } catch (err) {
    console.error("Brevo Mail Error:", err.message);
    throw err;
  }
}

module.exports = sendEmail;
