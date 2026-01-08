import React from "react";

const Temp = () => {
  return (
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #4F46E5; margin-bottom: 5px;">
          Welcome to Vakrangee!
        </h1>
        <p style="color: #6b7280; font-size: 14px;">Onboarding Portal Access</p>
      </div>

      <div style="color: #333333; line-height: 1.6; font-size: 14px;">
        <p>
          Dear <strong>${firstName}</strong>,
        </p>

        <p>
          <strong>Congratulations!</strong> Further to your application for
          employment and subsequent selection process, we are delighted to offer
          you the position of
          <strong>${role}</strong> with <strong>Vakrangee Ltd.</strong>
        </p>

        <p>
          Your base location will be <strong>${location}</strong>, which may be
          revised from time to time as per company requirements.
        </p>

        <p>
          You are required to join the services of the Company on or before
          <strong>${joiningDate}</strong>. Kindly confirm your acceptance of
          this offer no later than <strong>${acceptanceDate}</strong>.
          Non-acceptance within the stipulated timeline will render this offer
          null and void.
        </p>

        <p>
          We welcome you to the Vakrangee family and wish you a long, rewarding,
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
            P.S.: As discussed, your offer letter and appointment letter will be
            handed over to you on your date of joining.
          </em>
        </p>

        <p style="margin-top: 30px;">
          Best regards,
          <br />
          <strong>${HR_Name}</strong>
          <br />
          Human Resources
          <br />
          Vakrangee Ltd.
        </p>
      </div>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />

      <div style="font-size: 11px; color: #6b7280; line-height: 1.5;">
        <p>
          <strong>DISCLAIMER:</strong> The information contained in this email
          and any attachments is intended solely for the addressee(s) and may
          contain confidential or privileged information. Unauthorized use,
          disclosure, or copying is prohibited. If you are not the intended
          recipient, please notify the sender immediately and delete this email.
        </p>

        <p>
          <strong>WARNING:</strong> Emails may contain viruses. Please check
          this email and any attachments before opening. Vakrangee Ltd. accepts
          no liability for any damage caused by transmitted viruses.
        </p>
      </div>
    </div>
  );
};
export default Temp;
