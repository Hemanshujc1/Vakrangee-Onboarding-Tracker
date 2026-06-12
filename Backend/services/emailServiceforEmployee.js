// Email Services for the Add employee module 
const nodemailer = require("nodemailer");
require("dotenv").config();
const path = require('path');
const logger = require('../utils/logger');



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
    logger.error('SMTP error for add Employee model: %o', error);
  } else {
    logger.info('SMTP ready for add Employee model ✅');
  }
});



const sendWelcomeEmail = async (to, firstName, email, password, jobTitle, startDate, location, hrName, hrDesignation, cc) => {
    const subject = 'Letter of Selection from Vakrangee Ltd.';
    
    // Date Formatting Helper (e.g., January 12th, 2026)
    const formatDate = (dateString) => {
        if (!dateString) return 'TBD';
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();

        const getOrdinal = (n) => {
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };

        return `${month} ${getOrdinal(day)}, ${year}`;
    };

    const joiningDate = formatDate(startDate);
    const HR_Name = hrName || 'HR Team';
    const HR_Designation = hrDesignation || 'Human Resources';
    const loc = location || 'Vakrangee Corporate Office';

    const html = `
    <div style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #ffffff;">
        <div style="color: #333333; line-height: 1.6; font-size: 14px;">
          <p>
            Dear <strong>${firstName}</strong>,
          </p>
  
          <p>
            <strong>Congratulations!</strong> Further to your application for
            employment dated <strong>${joiningDate}</strong>, with us and subsequent selection process, we are delighted to offer
            you the position as
            <strong>"${jobTitle}"</strong> with Vakrangee Ltd. Your base location would be <strong>${loc}</strong>, which can be revised from time to time as per the requirement of the company.
          </p>
  
          <p>
            You shall join the services of the Company on or before
            <strong>${joiningDate}</strong>. We shall appreciate your confirmation of acceptance of the above by <strong>${joiningDate}</strong>. Non-acceptance before the stipulated date shall make this offer redundant automatically. 
          </p>
  
          <p>
            We welcome you to the Vakrangee family and wish you a long rewarding
            and fulfilling career with us.
          </p>
  
          <p>
            Please find below your login credentials to access the Vakrangee
            Onboarding Portal:
          </p>
  
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 6px 0;">
              <strong>Portal Link:</strong>
              <a
                href="${process.env.FRONTEND_URL}"
                style="color: #4F46E5; text-decoration: none;"
              >
                ${process.env.FRONTEND_URL}
              </a>
            </p>
            <p style="margin: 6px 0;">
              <strong>Username:</strong> ${email}
            </p>
            <p style="margin: 6px 0;">
              <strong>Password:</strong> ${password}
            </p>
          </div>
  
          <p>
            Please log in and update your profile and password at the earliest.
          </p>
  
          <p>
            <em>
              P.S.: As discussed and agreed by you, your offer letter and appointment letter will be
              given to you on your joining us.
            </em>
          </p>
  
          <p style="margin-top: 30px;">
            Thanks & regards,
            <br />
            <strong>${HR_Name}</strong>
            <br />
            ${HR_Designation}
          </p>
        </div>
  </div> 
`;

    const mailOptions = {
        from: process.env.SMTP_USER,
        to,
        cc,
        subject,
        html,
    };

    try {
        logger.info(`Attempting to send Letter of Selection email to: ${to}`);
        await transporter.sendMail(mailOptions);
        logger.info(`Letter of Selection email sent successfully to ${to}`);
        return { success: true };
    } catch (error) {
        logger.error('Error sending Letter of Selection email to %s: %o', to, error);
        return { success: false, error: error.message };
    }
};

// ── Reminder Email ────────────────────────────────────────────────────────────

/**
 * Sends a reminder email to an employee listing all pending items.
 *
 * @param {string} to              - Employee email address
 * @param {string} firstName       - Employee first name
 * @param {Array}  pendingDocs     - Array of { label } for pending documents
 * @param {Array}  pendingForms    - Array of { label } for pending forms
 * @param {string} hrName          - HR sender name
 * @param {string} hrDesignation   - HR sender designation
 */
const sendReminderEmail = async (to, firstName, pendingDocs, pendingForms, hrName, hrDesignation) => {
    const subject = 'Action Required: Complete Your Onboarding — Vakrangee Ltd.';

    const HR_Name        = hrName        || 'HR Team';
    const HR_Designation = hrDesignation || 'Human Resources';
    const portalUrl      = process.env.FRONTEND_URL || '#';

    // Build document list HTML
    const docListHtml = pendingDocs.length > 0
        ? `
        <p style="margin: 12px 0 6px; font-weight: bold; color: #1e3a5f;">📄 Documents to Upload:</p>
        <ul style="margin: 0; padding-left: 20px; color: #374151;">
          ${pendingDocs.map(d => `<li style="margin: 4px 0;">${d.label}</li>`).join('')}
        </ul>`
        : '';

    // Build form list HTML
    const formListHtml = pendingForms.length > 0
        ? `
        <p style="margin: 16px 0 6px; font-weight: bold; color: #1e3a5f;">📋 Forms to Complete:</p>
        <ul style="margin: 0; padding-left: 20px; color: #374151;">
          ${pendingForms.map(f => `<li style="margin: 4px 0;">${f.label}</li>`).join('')}
        </ul>`
        : '';

    const html = `
<div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

    <!-- Header -->
    <div style="background-color: #1e3a5f; padding: 28px 32px;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 0.3px;">Vakrangee Onboarding Portal</h1>
      <p style="color: #93c5fd; margin: 6px 0 0; font-size: 13px;">Action Required — Onboarding Reminder</p>
    </div>

    <!-- Body -->
    <div style="padding: 28px 32px; color: #333333; font-size: 14px; line-height: 1.7;">
      <p>Dear <strong>${firstName}</strong>,</p>

      <p>
        We hope you are doing well. This is a friendly reminder that there are some
        pending items on your Vakrangee Onboarding Portal that require your attention.
      </p>

      <div style="background-color: #fff7ed; border-left: 4px solid #f97316; border-radius: 6px; padding: 16px 20px; margin: 20px 0;">
        <p style="margin: 0 0 4px; font-weight: bold; color: #c2410c; font-size: 13px;">⚠️ PENDING ITEMS</p>
        ${docListHtml}
        ${formListHtml}
      </div>

      <p>
        Please log in to the portal at your earliest convenience to complete these items:
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <a
          href="${portalUrl}"
          style="display: inline-block; background-color: #1e3a5f; color: #ffffff; text-decoration: none;
                 padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: bold; letter-spacing: 0.4px;"
        >
          Go to Onboarding Portal →
        </a>
      </div>

      <p style="color: #6b7280; font-size: 13px;">
        If you have already completed these items, please ignore this email. It may take
        a few minutes for the status to update on our end.
      </p>

      <p style="margin-top: 28px;">
        Thanks &amp; regards,<br />
        <strong>${HR_Name}</strong><br />
        <span style="color: #6b7280;">${HR_Designation}</span><br />
        <span style="color: #6b7280;">Vakrangee Ltd.</span>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f3f4f6; padding: 16px 32px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; font-size: 11px; color: #9ca3af; line-height: 1.5;">
        This is an automated reminder from the Vakrangee Onboarding System.
        Please do not reply to this email. For assistance, contact your HR representative.
      </p>
    </div>

  </div>
</div>`;

    const mailOptions = {
        from: `"Vakrangee HR" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
    };

    try {
        logger.info(`Sending reminder email to: ${to}`);
        await transporter.sendMail(mailOptions);
        logger.info(`Reminder email sent successfully to ${to}`);
        return { success: true };
    } catch (error) {
        logger.error('Error sending reminder email to %s: %o', to, error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendWelcomeEmail, sendReminderEmail };


/*
 <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />

        <div style="text-align:left; margin-bottom:20px;">
            <img
              src="cid:vakrangeelogo"
              alt="Vakrangee - A Legacy of 35+ Years"
              style="width:100%; max-width:560px; border-radius:8px;"
            />
          </div>
          
        <div style="font-size: 11px; color: #6b7280; line-height: 1.5;">
          <p>
            <strong>DISCLAIMER:</strong> The information contained in this electronic message and
            any attachments to this message are intended for the exclusive use of the
            addressee(s) and may contain proprietary, confidential or privileged
            information. If you are not the intended recipient you are notified that
            disclosing, copying, distributing or taking any action in reliance on the
            contents of this information is strictly prohibited. Please notify the
            sender immediately and destroy all copies of this message and any
            attachments.
          </p>
  
          <p>
            <strong>WARNING:</strong> Computer viruses can be transmitted via email. The
            recipient should check this email and any attachments for the presence of
            viruses. The company accepts no liability for any damage caused by any virus
            transmitted by this email.
          </p>
        </div>
*/