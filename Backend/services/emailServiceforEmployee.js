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
    console.error("SMTP error for add Employee model:", error);
  } else {
    console.log(" SMTP ready for add Employee model ✅");
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

    const html = `<div style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #ffffff;">
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
      </div> 
`;

    const mailOptions = {
        from: process.env.SMTP_USER,
        to,
        cc,
        subject,
        html,
        attachments: [{
            filename: 'Vakrangee_email_logo.jpg',
            path: path.join(__dirname, '../uploads/Vakrangee_email_logo.jpg'),
            cid: 'vakrangeelogo' 
        }]
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

module.exports = { sendWelcomeEmail };
