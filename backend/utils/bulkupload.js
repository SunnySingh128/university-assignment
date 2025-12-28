const Brevo = require("@getbrevo/brevo");
require("dotenv").config();

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.API_KEY
);

const sendEmail = async (receiver, password) => {
  try {
    let sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "Your University Account Credentials";

    sendSmtpEmail.htmlContent = `
      <div style="font-family:Arial; max-width:600px; margin:auto; background:#f8fafc; padding:20px; border-radius:10px;">
        <h2 style="color:#2563eb;">University Admin</h2>
        <p>Your university account has been created successfully.</p>

        <div style="background:#e0f2fe; padding:15px; border-radius:8px;">
          <p><b>Email:</b> ${receiver}</p>
          <p><b>Password:</b> ${password}</p>
        </div>

        <p>Please login and change your password immediately.</p>

        <hr>
        <p style="font-size:12px; color:gray;">Regards,<br>University Admin Team</p>
      </div>
    `;

    sendSmtpEmail.sender = {
      name: "University Admin",
      email: process.env.EMAIL
    };

    sendSmtpEmail.to = [{ email: receiver }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Admin credentials sent to ${receiver}`);
  } catch (err) {
    console.error("Brevo Admin Mail Error:", err.message);
  }
};

module.exports = {
  sendEmail
};
