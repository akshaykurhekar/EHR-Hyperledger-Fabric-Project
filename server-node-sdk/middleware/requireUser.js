const { Wallets } = require('fabric-network');
const helper = require('../helper');
const { X509Certificate } = require('crypto');

// Helper to extract attributes from certificate
function extractAttributesFromCert(certificate) {
  try {
    const cert = new X509Certificate(certificate);
    const subject = cert.subject;
    const attributes = {};
    
    // Parse subject for attributes (if stored there)
    // In Fabric, attributes are typically in the certificate extensions
    // We'll extract from the certificate's raw data
    const certText = cert.toString();
    
    // Try to extract from certificate text or use userId as uuid
    // Note: In Fabric, attributes are usually accessed via GetAttributeValue in chaincode
    // This middleware validates the identity exists and adds it to req.user
    return attributes;
  } catch (err) {
    return {};
  }
}

module.exports = async (req, res, next) => {
  try {
    const userId = req.headers['x-userid'] || req.body.userId || req.query.userId;
    if(!userId) {
      return res.status(401).send({ 
        success: false, 
        message: 'Missing userId (x-userid header or body.userId)' 
      });
    }

    // Verify user identity exists in wallet
    const wallet = await helper.getWallet();
    const identity = await wallet.get(userId);
    
    if (!identity) {
      return res.status(401).send({ 
        success: false, 
        message: `User identity "${userId}" not found in wallet. Please register/login first.` 
      });
    }

    // Extract certificate and attributes
    let uuid = userId; // Default to userId
    let role = null;
    
    if (identity.credentials && identity.credentials.certificate) {
      try {
        const cert = new X509Certificate(identity.credentials.certificate);
        // In Fabric, attributes are stored in certificate extensions
        // For now, we'll use userId as uuid and try to infer role from context
        // The actual attributes should be available in chaincode via GetAttributeValue
        uuid = userId;
        
        // Try to extract role from certificate if available
        // This is a fallback - the chaincode should get it from GetAttributeValue
      } catch (err) {
        // If certificate parsing fails, continue with defaults
        console.warn(`Could not parse certificate for user ${userId}:`, err.message);
      }
    }

    // Add user info to request
    req.user = { 
      id: userId,
      uuid: uuid,
      role: role,
      mspId: identity.mspId
    };
    
    next();
  } catch (err) {
    return res.status(500).send({ 
      success: false, 
      message: `Error validating user: ${err.message}` 
    });
  }
};
