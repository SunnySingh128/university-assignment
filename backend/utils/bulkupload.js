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
    try {
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
