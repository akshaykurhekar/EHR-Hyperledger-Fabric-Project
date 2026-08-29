const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');
const helper = require('../helper');
const invoke = require('../invoke');
const responses = require('../utils/responses');
const User = require('../models/User');
const generateUserId = require('../utils/generateUserId');

// Helper to get admin User object
async function getAdminUser(org, adminId) {
  const ccpPath = path.resolve(__dirname, '../..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', `${org}.example.com`, `connection-${org}.json`);
  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
  const caInfo = ccp.certificateAuthorities[`ca.${org}.example.com`];
  const caTLSCACerts = caInfo.tlsCACerts.pem;
  const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

  const walletPath = path.join(process.cwd(), 'wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  const adminIdentity = await wallet.get(adminId);
  if (!adminIdentity) throw new Error(`Admin identity "${adminId}" not found in wallet`);

  const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
  const adminUser = await provider.getUserContext(adminIdentity, adminId);
  return { ca, wallet, adminUser, ccp };
}

// Generic registration function
async function registerAndEnroll(org, adminId, enrollmentID, attrs) {
  const { ca, wallet, adminUser } = await getAdminUser(org, adminId);

  // Check if user already exists
  const existing = await wallet.get(enrollmentID);
  if (existing) return;

  const secret = await ca.register({ affiliation: `${org}.department1`, enrollmentID, role: 'client', attrs }, adminUser);
  const enrollment = await ca.enroll({
    enrollmentID,
    enrollmentSecret: secret,
    attr_reqs: attrs.map(a => ({ name: a.name, optional: false }))
  });
  
  // Verify attributes are in the enrollment certificate
  if (!enrollment.certificate) {
    throw new Error('Enrollment failed: no certificate returned');
  }

  const x509Identity = {
    credentials: {
      certificate: enrollment.certificate,
      privateKey: enrollment.key.toBytes(),
    },
    mspId: org.charAt(0).toUpperCase() + org.slice(1) + 'MSP',
    type: 'X.509',
  };
  await wallet.put(enrollmentID, x509Identity);
}

// -------------------- Login Controllers (Check MongoDB First) --------------------

exports.loginPatient = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).send(responses.error('Email and password are required'));
    }

    // Check MongoDB first
    const user = await User.findOne({ email: email.toLowerCase(), role: 'patient' });
    
    if (!user) {
      return res.status(200).send(responses.ok({ 
        needsRegistration: true,
        message: 'User not found. Please register first.'
      }));
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).send(responses.error('Invalid email or password'));
    }

    // Check if user is registered on chaincode (wallet)
    const wallet = await helper.getWallet();
    const identity = await wallet.get(user.userId);
    
    if (!identity) {
      return res.status(200).send(responses.ok({ 
        needsChaincodeRegistration: true,
        userId: user.userId,
        message: 'Please complete your registration on the blockchain. An admin will register you shortly.'
      }));
    }

    // User is fully registered - return success
    res.status(200).send(responses.ok({ 
      success: true, 
      userId: user.userId,
      role: 'patient',
      name: user.name,
      registeredOnChain: user.registeredOnChain
    }));
  } catch (err) { 
    next(err); 
  }
};

exports.loginDoctor = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).send(responses.error('Email and password are required'));
    }

    // Check MongoDB first
    const user = await User.findOne({ email: email.toLowerCase(), role: 'doctor' });
    
    if (!user) {
      return res.status(200).send(responses.ok({ 
        needsRegistration: true,
        message: 'User not found. Please register first.'
      }));
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).send(responses.error('Invalid email or password'));
    }

    // Check if user is registered on chaincode (wallet)
    const wallet = await helper.getWallet();
    const identity = await wallet.get(user.userId);
    
    if (!identity) {
      return res.status(200).send(responses.ok({ 
        needsChaincodeRegistration: true,
        userId: user.userId,
        message: 'Please complete your registration on the blockchain. An admin will register you shortly.'
      }));
    }

    // User is fully registered - return success
    res.status(200).send(responses.ok({ 
      success: true, 
      userId: user.userId,
      role: 'doctor',
      name: user.name,
      registeredOnChain: user.registeredOnChain
    }));
  } catch (err) { 
    next(err); 
  }
};

exports.loginInsuranceAgent = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).send(responses.error('Email and password are required'));
    }

    // Check MongoDB first
    const user = await User.findOne({ email: email.toLowerCase(), role: 'insuranceAgent' });
    
    if (!user) {
      return res.status(200).send(responses.ok({ 
        needsRegistration: true,
        message: 'User not found. Please register first.'
      }));
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).send(responses.error('Invalid email or password'));
    }

    // Check if user is registered on chaincode (wallet)
    const wallet = await helper.getWallet();
    const identity = await wallet.get(user.userId);
    
    if (!identity) {
      return res.status(200).send(responses.ok({ 
        needsChaincodeRegistration: true,
        userId: user.userId,
        message: 'Please complete your registration on the blockchain. An admin will register you shortly.'
      }));
    }

    // User is fully registered - return success
    res.status(200).send(responses.ok({ 
      success: true, 
      userId: user.userId,
      role: 'insuranceAgent',
      name: user.name,
      registeredOnChain: user.registeredOnChain
    }));
  } catch (err) { 
    next(err); 
  }
};

// -------------------- Registration Controllers (New Flow) --------------------

exports.registerPatient = async (req, res, next) => {
  try {
    const { email, password, name, dob, city, doctorId } = req.body;
    
    if (!email || !password || !name || !dob || !city) {
      return res.status(400).send(responses.error('Missing required fields: email, password, name, dob, city'));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).send(responses.error('User with this email already exists'));
    }

    // Generate unique userId
    const userId = generateUserId('patient');

    // Create user in MongoDB
    const user = new User({
      userId,
      email: email.toLowerCase(),
      password,
      role: 'patient',
      name,
      dob,
      city,
      registeredOnChain: false
    });

    await user.save();

    // Return userId for admin to register on chaincode
    res.status(200).send(responses.ok({ 
      success: true, 
      userId,
      message: 'Registration successful. Your userId has been generated. An admin will complete your blockchain registration shortly.',
      needsAdminRegistration: true,
      registrationData: {
        adminId: 'hospitalAdmin',
        userId,
        name,
        dob,
        city,
        doctorId: doctorId || null
      }
    }));
  } catch (err) { 
    if (err.code === 11000) {
      return res.status(400).send(responses.error('User with this email or userId already exists'));
    }
    next(err); 
  }
};

exports.registerDoctor = async (req, res, next) => {
  try {
    const { email, password, name, hospitalId, city } = req.body;
    
    if (!email || !password || !name || !hospitalId || !city) {
      return res.status(400).send(responses.error('Missing required fields: email, password, name, hospitalId, city'));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).send(responses.error('User with this email already exists'));
    }

    // Generate unique userId
    const userId = generateUserId('doctor');

    // Create user in MongoDB
    const user = new User({
      userId,
      email: email.toLowerCase(),
      password,
      role: 'doctor',
      name,
      hospitalId,
      city,
      registeredOnChain: false
    });

    await user.save();

    // Return userId for admin to register on chaincode
    res.status(200).send(responses.ok({ 
      success: true, 
      userId,
      message: 'Registration successful. Your userId has been generated. An admin will complete your blockchain registration shortly.',
      needsAdminRegistration: true,
      registrationData: {
        adminId: 'hospitalAdmin', // or get from header if available
        userId,
        name,
        hospitalId,
        city
      }
    }));
  } catch (err) { 
    if (err.code === 11000) {
      return res.status(400).send(responses.error('User with this email or userId already exists'));
    }
    next(err); 
  }
};

exports.registerInsuranceAgent = async (req, res, next) => {
  try {
    const { email, password, name, insuranceId, city } = req.body;
    
    if (!email || !password || !name || !insuranceId || !city) {
      return res.status(400).send(responses.error('Missing required fields: email, password, name, insuranceId, city'));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).send(responses.error('User with this email already exists'));
    }

    // Generate unique userId
    const userId = generateUserId('insuranceAgent');

    // Create user in MongoDB
    const user = new User({
      userId,
      email: email.toLowerCase(),
      password,
      role: 'insuranceAgent',
      name,
      insuranceId,
      city,
      registeredOnChain: false
    });

    await user.save();

    // Return userId for admin to register on chaincode
    res.status(200).send(responses.ok({ 
      success: true, 
      userId,
      message: 'Registration successful. Your userId has been generated. An admin will complete your blockchain registration shortly.',
      needsAdminRegistration: true,
      registrationData: {
        adminId: 'insuranceAdmin', // or get from header if available
        userId,
        name,
        insuranceId,
        city
      }
    }));
  } catch (err) { 
    if (err.code === 11000) {
      return res.status(400).send(responses.error('User with this email or userId already exists'));
    }
    next(err); 
  }
};

// -------------------- Admin Registration on Chaincode --------------------

// This endpoint is called by admin to complete user registration on blockchain
exports.completePatientRegistration = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const adminId = req.body.adminId || 'hospitalAdmin';
    
    if (!userId) {
      return res.status(400).send(responses.error('userId is required'));
    }

    // Get user from MongoDB
    const user = await User.findOne({ userId, role: 'patient' });
    if (!user) {
      return res.status(404).send(responses.error('User not found'));
    }

    if (user.registeredOnChain) {
      return res.status(200).send(responses.ok({ 
        success: true, 
        message: 'User already registered on blockchain',
        userId 
      }));
    }

    // Register and enroll on blockchain
    await registerAndEnroll('org1', adminId, userId, [
      { name: 'role', value: 'patient', ecert: true },
      { name: 'uuid', value: userId, ecert: true }
    ]);

    // Onboard patient on chaincode
    const payload = { patientId: userId, name: user.name, dob: user.dob, city: user.city };
    const result = await invoke.invokeTransaction('onboardPatient', payload, userId);

    // Update MongoDB
    user.registeredOnChain = true;
    await user.save();

    res.status(200).send(responses.ok({ 
      success: true, 
      userId, 
      chaincodeResult: result,
      message: 'Patient successfully registered on blockchain'
    }));
  } catch (err) { 
    next(err); 
  }
};

exports.completeDoctorRegistration = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const adminId = req.user?.id || req.body.adminId || 'hospitalAdmin';
    
    if (!userId) {
      return res.status(400).send(responses.error('userId is required'));
    }

    // Get user from MongoDB
    const user = await User.findOne({ userId, role: 'doctor' });
    if (!user) {
      return res.status(404).send(responses.error('User not found'));
    }

    if (user.registeredOnChain) {
      return res.status(200).send(responses.ok({ 
        success: true, 
        message: 'User already registered on blockchain',
        userId 
      }));
    }

    // Register and enroll on blockchain
    await registerAndEnroll('org1', 'hospitalAdmin', userId, [
      { name: 'role', value: 'doctor', ecert: true },
      { name: 'uuid', value: userId, ecert: true }
    ]);

    // Onboard doctor on chaincode
    const payload = { doctorId: userId, hospitalId: user.hospitalId, name: user.name, city: user.city };
    const result = await invoke.invokeTransaction('onboardDoctor', payload, adminId);

    // Update MongoDB
    user.registeredOnChain = true;
    await user.save();

    res.status(200).send(responses.ok({ 
      success: true, 
      userId, 
      chaincodeResult: result,
      message: 'Doctor successfully registered on blockchain'
    }));
  } catch (err) { 
    next(err); 
  }
};

exports.completeInsuranceAgentRegistration = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const adminId = req.user?.id || req.body.adminId || 'insuranceAdmin';
    
    if (!userId) {
      return res.status(400).send(responses.error('userId is required'));
    }

    // Get user from MongoDB
    const user = await User.findOne({ userId, role: 'insuranceAgent' });
    if (!user) {
      return res.status(404).send(responses.error('User not found'));
    }

    if (user.registeredOnChain) {
      return res.status(200).send(responses.ok({ 
        success: true, 
        message: 'User already registered on blockchain',
        userId 
      }));
    }

    // Register and enroll on blockchain
    await registerAndEnroll('org2', 'insuranceAdmin', userId, [
      { name: 'role', value: 'insuranceAgent', ecert: true },
      { name: 'uuid', value: userId, ecert: true }
    ]);

    // Onboard agent on chaincode
    const payload = { agentId: userId, insuranceId: user.insuranceId, name: user.name, city: user.city };
    const result = await invoke.invokeTransaction('onboardInsuranceAgent', payload, adminId, 'org2');

    // Update MongoDB
    user.registeredOnChain = true;
    await user.save();

    res.status(200).send(responses.ok({ 
      success: true, 
      userId, 
      chaincodeResult: result,
      message: 'Insurance agent successfully registered on blockchain'
    }));
  } catch (err) { 
    next(err); 
  }
};

// -------------------- Legacy Endpoints (for backward compatibility) --------------------

// Legacy registerPatient - now requires admin to call this
exports.registerPatientLegacy = async (req, res, next) => {
  try {
    const { adminId, userId, name, dob, city } = req.body;
    if (!adminId || !userId || !name || !dob || !city) throw new Error('Missing required fields');

    await registerAndEnroll('org1', adminId, userId, [
      { name: 'role', value: 'patient', ecert: true },
      { name: 'uuid', value: userId, ecert: true }
    ]);

    const payload = { patientId: userId, name, dob, city };
    const result = await invoke.invokeTransaction('onboardPatient', payload, userId);

    res.status(200).send(responses.ok({ success: true, userId, chaincodeResult: result }));
  } catch (err) { next(err); }
};

exports.registerHospitalAdmin = async (req, res, next) => {
  try {
    const { adminId, userId, hospitalId, name, address } = req.body; 
    if (!adminId || !userId || !hospitalId || !name || !address) {
      throw new Error('Missing required fields: adminId, userId, hospitalId, name, address');
    }

    // Register and enroll hospital admin with attributes
    await registerAndEnroll('org1', adminId, userId, [
      { name: 'role', value: 'hospital', ecert: true },
      { name: 'uuid', value: userId, ecert: true }
    ]);

    // Onboard hospital on chaincode using the newly registered hospital admin
    const payload = { hospitalId, name, address };
    const result = await invoke.invokeTransaction('onboardHospitalAdmin', payload, userId);

    res.status(200).send(responses.ok({ success: true, userId, hospitalId, chaincodeResult: result }));
  } catch (err) {
    next(err);
  }
};

exports.registerInsuranceAdmin = async (req, res, next) => {
  try {
    const { adminId, userId, insuranceId, name, address } = req.body;
    if (!adminId || !userId || !insuranceId || !name || !address) {
      throw new Error('Missing required fields: adminId, userId, insuranceId, name, address');
    }

    // Register and enroll insurance admin with attributes
    await registerAndEnroll('org2', adminId, userId, [
      { name: 'role', value: 'insuranceAdmin', ecert: true },
      { name: 'uuid', value: userId, ecert: true }
    ]);

    // Onboard insurance company on chaincode using the newly registered insurance admin
    const payload = { insuranceId, name, address };
    const result = await invoke.invokeTransaction('onboardInsuranceCompany', payload, userId);
    res.status(200).send(responses.ok({ success: true, userId, insuranceId, chaincodeResult: result }));
  } catch (err) { next(err); }
};

// Legacy registerDoctor - for admin use
exports.registerDoctorLegacy = async (req, res, next) => {
  try {
    const adminId = req.user?.id || req.body.adminId;
    const { doctorId, userId, hospitalId, name, city } = req.body;
    const newDoctorId = doctorId || userId;
    
    if (!adminId || !newDoctorId || !hospitalId || !name || !city) {
      throw new Error('Missing required fields: adminId (or x-userid header), doctorId/userId, hospitalId, name, city');
    }

    await registerAndEnroll('org1', 'hospitalAdmin', newDoctorId, [
      { name: 'role', value: 'doctor', ecert: true },
      { name: 'uuid', value: newDoctorId, ecert: true }
    ]);

    const payload = { doctorId: newDoctorId, hospitalId, name, city };
    const result = await invoke.invokeTransaction('onboardDoctor', payload, adminId);
    res.status(200).send(responses.ok({ success: true, doctorId: newDoctorId, userId: newDoctorId, chaincodeResult: result }));
  } catch (err) { next(err); }
};

// Legacy registerInsuranceAgent - for admin use
exports.registerInsuranceAgentLegacy = async (req, res, next) => {
  try {
    const adminId = req.user?.id || req.body.adminId;
    const { agentId, userId, insuranceId, name, city } = req.body;
    const newAgentId = agentId || userId;
    
    if (!adminId || !newAgentId || !insuranceId || !name || !city) {
      throw new Error('Missing required fields: adminId (or x-userid header), agentId/userId, insuranceId, name, city');
    }

    await registerAndEnroll('org2', 'insuranceAdmin', newAgentId, [
      { name: 'role', value: 'insuranceAgent', ecert: true },
      { name: 'uuid', value: newAgentId, ecert: true }
    ]);

    const payload = { agentId: newAgentId, insuranceId, name, city };
    const result = await invoke.invokeTransaction('onboardInsuranceAgent', payload, adminId, 'org2');
    res.status(200).send(responses.ok({ success: true, agentId: newAgentId, userId: newAgentId, chaincodeResult: result }));
  } catch (err) { next(err); }
};
