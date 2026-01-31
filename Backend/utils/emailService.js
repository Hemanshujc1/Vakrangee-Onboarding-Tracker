/// Done
const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  // Check if SMTP credentials are provided
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log("========================================");
    console.log("[EMAIL SERVICE] SMTP Credentials not found. Printing email to console.");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    console.log("========================================");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Vakrangee Support" <noreply@vakrangee.in>',
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email sending failed');
  }
};

module.exports = sendEmail;
