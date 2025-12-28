const Brevo = require("@getbrevo/brevo");
require("dotenv").config();

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.API_KEY
);

const sendEmail = async (to, subject, text) => {
  try {
    let sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.subject = subject;

    // Convert plain text to nice HTML
    sendSmtpEmail.htmlContent = `
      <div style="font-family:Arial; max-width:600px; margin:auto; background:#f8fafc; padding:20px; border-radius:10px;">
        <h2 style="color:#2563eb;">EduFlow</h2>
        <p>${text.replace(/\n/g, "<br>")}</p>
        <hr>
        <p style="font-size:12px; color:gray;">Thank you,<br>EduFlow Team</p>
      </div>
    `;

    sendSmtpEmail.sender = {
      name: "EduFlow",
      email: process.env.EMAIL
    };

    sendSmtpEmail.to = [{ email: to }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Brevo Email Sent ✔");
  } catch (error) {
    console.error("Brevo Mail Error:", error.message);
  }
};

module.exports = sendEmail;
