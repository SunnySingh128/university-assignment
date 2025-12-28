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
const nodemailer = require("nodemailer");

// Create a reusable SMTP transporter
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true only for port 465
    auth: {
        user: process.env.EMAIL_USER,   // your email
        pass: process.env.EMAIL_PASS,   // your app password
    },
    tls: {
        rejectUnauthorized: false,
    }
});

// Function to send email
const sendEmail = async (receiver, password) => {
    console.log("sunny singh");
    try {
        console.log("Sending email to:", receiver);
        const mailOptions = {
            from: `"Admin" <${process.env.EMAIL_USER}>`,
            to: receiver,
            subject: "Your New Password",
            text: `

Your university account has been created by the admin.

Login Details:
Email: ${receiver}
Password: ${password}

Please login and change your password immediately.

Regards,
University Admin
    `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to: ${receiver}`);
    } catch (err) {
        console.log("Email Error:", err);
    }
};

// export
module.exports = {
    sendEmail
};

