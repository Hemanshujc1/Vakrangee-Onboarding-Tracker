const nodemailer = require("nodemailer");
require("dotenv").config();
const path = require('path');
const logger = require('../utils/logger');


// for Email/Zoho service
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),              
  secure: process.env.SMTP_SECURE === "true",  
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    logger.error('SMTP error for add Admin model: %o', error);
  } else {
    logger.info('SMTP ready for add Admin model ✅');
  }
});


const sendHRAdminAssignmentEmail = async (
    to,
    firstName,
    email,
    password,
    portalUrl,
    cc,
    hrName,
    hrDesignation
  ) => {
    const subject = "HR Admin Access – Vakrangee Onboarding Portal";
    
    // Default fallback if not provided
    const HR_Name = hrName || "System Admin";
    const HR_Designation = hrDesignation || "Administration";

    const html = `
      <div style="font-family: Arial, sans-serif; font-size:14px; color:#333;">
        <p>Dear <strong>${firstName}</strong>,</p>
        <p>
          You have been assigned as an <strong>HR Admin</strong> for the Vakrangee
          Onboarding Portal.
        </p>
        <p>
          Please use the login details below to access the portal and complete your
          basic details in the <strong>Profile</strong> section.
        </p>
        <div style="background:#f3f4f6; padding:12px; border-radius:6px; margin:16px 0;">
          <p style="margin:4px 0;"><strong>Portal:</strong> 
            <a href="${portalUrl}" style="color:#4F46E5;">${portalUrl}</a>
          </p>
          <p style="margin:4px 0;"><strong>Username:</strong> ${email}</p>
          <p style="margin:4px 0;"><strong>Password:</strong> ${password}</p>
        </div>
        <p>
          We request you to log in at the earliest and update your profile information.
        </p>
        <p style="margin-top: 30px;">
            Thanks & regards,
            <br />
            <strong>${HR_Name}</strong>
            <br />
            ${HR_Designation}
        </p>
      </div>
    `;
  
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      cc,
      subject,
      html,
      // attachments: [{
      //   filename: 'Vakrangee_email_logo.jpg',
      //   path: path.join(__dirname, '../assets/Vakrangee_email_logo.jpg'),
      //   cid: 'vakrangeelogo'
      // }]
    };
  
    try {
        logger.info(`Attempting to send HR Admin assignment email to: ${to}`);
        await transporter.sendMail(mailOptions);
        logger.info(`HR Admin assignment email sent successfully to ${to}`);
        return { success: true };
    } catch (error) {
        logger.error('Error sending HR Admin assignment email to %s: %o', to, error);
        return { success: false, error: error.message };
    }
  };
  
module.exports = { sendHRAdminAssignmentEmail };