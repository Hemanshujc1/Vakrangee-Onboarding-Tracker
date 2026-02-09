const { sendHRAdminAssignmentEmail } = require('../services/emailServiceforAdmin');
const { sendWelcomeEmail } = require('../services/emailServiceforEmployee'); 
const logger = require('../utils/logger'); 

exports.sendAdminWelcomeEmail = async (req, res) => {
    try {
        const { email, firstName, password, cc, portalUrl, hrName, hrDesignation } = req.body;
        
        const result = await sendHRAdminAssignmentEmail(
            email, 
            firstName, 
            email, 
            password, 
            portalUrl || process.env.FRONTEND_URL || 'http://localhost:5173', // fallback
            cc,
            hrName,
            hrDesignation
        );

        if (result.success) {
            res.status(200).json({ message: 'Admin welcome email sent successfully' });
        } else {
            res.status(500).json({ message: 'Failed to send email', error: result.error });
        }
    } catch (error) {
        logger.error('Email Controller Error (Admin Welcome): %o', error);
        res.status(500).json({ message: 'Server error sending email', error: error.message });
    }
};


exports.sendEmployeeWelcomeEmail = async (req, res) => {
    try {
        // Logic for employee welcome email (using existing service)
        // Admin
        const { email, firstName, password, jobTitle, startDate, location, hrName, hrDesignation, cc } = req.body;
        
        const result = await sendWelcomeEmail(email, firstName, email, password, jobTitle, startDate, location, hrName, hrDesignation, cc);
        
        if (result.success) {
            res.status(200).json({ message: 'Employee welcome email sent successfully' });
        } else {
            res.status(500).json({ message: 'Failed to send email', error: result.error });
        }
    } catch (error) {
         logger.error('Email Controller Error (Employee Welcome): %o', error);
        res.status(500).json({ message: 'Server error sending email', error: error.message });
    }
};
