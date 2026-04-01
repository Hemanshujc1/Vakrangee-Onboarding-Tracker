const logger = require('../utils/logger');

exports.verifyPan = async (req, res) => {
  try {
    const payload = req.body;
    
    if (!payload.pan || !payload.name) {
       return res.status(400).json({ status: "Error", statusDesc: "PAN and Name are required" });
    }

    const nsdlApiUrl = 'https://vkms.vakrangee.in/banking-kar-api-test/nsdl-pan-verification';
    const apiKey = process.env.NSDL_PAN_API_KEY;

    if (!apiKey) {
      logger.error('NSDL_PAN_API_KEY is not defined in backend environment variables');
      return res.status(500).json({ status: "Error", statusDesc: "Internal server configuration error" });
    }

    const response = await fetch(nsdlApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    logger.error('PAN Verification Error in backend: %o', error.message || error);
    return res.status(500).json({ 
      status: "Error", 
      statusDesc: "Verification failed due to internal server error or external API failure" 
    });
  }
};
