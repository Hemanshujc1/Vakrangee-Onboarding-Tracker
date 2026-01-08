const { sendHRAdminAssignmentEmail } = require('../services/emailServiceforAdmin');
const { sendWelcomeEmail } = require('../services/emailServiceforEmployee'); // Assuming original service is here or needs to be moved/renamed

exports.sendAdminWelcomeEmail = async (req, res) => {
    try {
        const { email, firstName, password, cc, portalUrl } = req.body;
        
        // Pass extra params if needed, or default
        const result = await sendHRAdminAssignmentEmail(
            email, 
            firstName, 
            email, // username is email
            password, 
            portalUrl || process.env.FRONTEND_URL || 'http://localhost:5173', // fallback
            cc
        );

        if (result.success) {
            res.status(200).json({ message: 'Admin welcome email sent successfully' });
        } else {
            res.status(500).json({ message: 'Failed to send email', error: result.error });
        }
    } catch (error) {
        console.error('Email Controller Error:', error);
        res.status(500).json({ message: 'Server error sending email', error: error.message });
    }
};

exports.sendEmployeeWelcomeEmail = async (req, res) => {
    try {
        // ... Logic for employee welcome email (using existing service)
        // Admin
        const { email, firstName, password, role, startDate, location, hrName, hrDesignation, cc } = req.body;
        
        const result = await sendWelcomeEmail(email, firstName, email, password, role, startDate, location, hrName, hrDesignation, cc);
        
        if (result.success) {
            res.status(200).json({ message: 'Employee welcome email sent successfully' });
        } else {
            res.status(500).json({ message: 'Failed to send email', error: result.error });
        }
    } catch (error) {
         console.error('Email Controller Error:', error);
        res.status(500).json({ message: 'Server error sending email', error: error.message });
    }
};
