/// Done
const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async ({ to, subject, text, html }) => {
  // Check if SMTP credentials are provided
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    logger.warn("========================================");
    logger.warn("[EMAIL SERVICE] SMTP Credentials not found. Printing email to console.");
    logger.warn(`To: ${to}`);
    logger.warn(`Subject: ${subject}`);
    logger.warn(`Body: ${text}`);
    logger.warn("========================================");
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
    logger.info(`Email sent: ${info.messageId}`);
  } catch (error) {
    logger.error('Error sending email: %o', error);
    throw new Error('Email sending failed');
  }
};

module.exports = sendEmail;
