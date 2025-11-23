const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');
const helper = require('../helper');
const invoke = require('../invoke');
const responses = require('../utils/responses');

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

// -------------------- Controllers --------------------

exports.registerPatient = async (req, res, next) => {
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

exports.loginPatient = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const result = await helper.login(userId);
    res.status(200).send(responses.ok(result));
  } catch (err) { next(err); }
};

exports.loginDoctor = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const result = await helper.login(userId);
    res.status(200).send(responses.ok(result));
  } catch (err) { next(err); }
};

exports.loginInsuranceAgent = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const result = await helper.login(userId);
    res.status(200).send(responses.ok(result));
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

exports.registerDoctor = async (req, res, next) => {
  try {
    // Get adminId from authenticated user (header) or body
    const adminId = req.user?.id || req.body.adminId;
    const { doctorId, userId, hospitalId, name, city } = req.body;
    
    // Support both doctorId and userId for consistency
    const newDoctorId = doctorId || userId;
    
    if (!adminId || !newDoctorId || !hospitalId || !name || !city) {
      throw new Error('Missing required fields: adminId (or x-userid header), doctorId/userId, hospitalId, name, city');
    }

    // Use 'hospitalAdmin' for CA registration (has registrar permissions)
    // The adminId from request is used for chaincode invocation
    await registerAndEnroll('org1', 'hospitalAdmin', newDoctorId, [
      { name: 'role', value: 'doctor', ecert: true },
      { name: 'uuid', value: newDoctorId, ecert: true }
    ]);

    // Use adminId (hospital admin) to invoke - chaincode will verify role='hospital'
    const payload = { doctorId: newDoctorId, hospitalId, name, city };
    const result = await invoke.invokeTransaction('onboardDoctor', payload, adminId);
    res.status(200).send(responses.ok({ success: true, doctorId: newDoctorId, userId: newDoctorId, chaincodeResult: result }));
  } catch (err) { next(err); }
};

exports.registerInsuranceAgent = async (req, res, next) => {
  try {
    // Get adminId from authenticated user (header) or body
    const adminId = req.user?.id || req.body.adminId;
    const { agentId, userId, insuranceId, name, city } = req.body;
    
    // Support both agentId and userId for consistency
    const newAgentId = agentId || userId;
    
    if (!adminId || !newAgentId || !insuranceId || !name || !city) {
      throw new Error('Missing required fields: adminId (or x-userid header), agentId/userId, insuranceId, name, city');
    }

    // Use 'insuranceAdmin' for CA registration (has registrar permissions)
    // The adminId from request is used for chaincode invocation
    await registerAndEnroll('org2', 'insuranceAdmin', newAgentId, [
      { name: 'role', value: 'insuranceAgent', ecert: true },
      { name: 'uuid', value: newAgentId, ecert: true }
    ]);

    // Use adminId (insurance admin) to invoke - chaincode will verify role='insuranceAdmin'
    // Use org2 for insurance-related transactions
    const payload = { agentId: newAgentId, insuranceId, name, city };
    const result = await invoke.invokeTransaction('onboardInsuranceAgent', payload, adminId, 'org2');
    res.status(200).send(responses.ok({ success: true, agentId: newAgentId, userId: newAgentId, chaincodeResult: result }));
  } catch (err) { next(err); }
};
