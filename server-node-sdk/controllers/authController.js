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
    const { adminId, doctorId, hospitalId, name, city } = req.body;
    if (!adminId || !doctorId || !hospitalId || !name || !city) throw new Error('Missing required fields');

    await registerAndEnroll('org1', adminId, doctorId, [
      { name: 'role', value: 'doctor', ecert: true },
      { name: 'uuid', value: doctorId, ecert: true }
    ]);

    const payload = { doctorId, hospitalId, name, city };
    const result = await invoke.invokeTransaction('onboardDoctor', payload, adminId);
    res.status(200).send(responses.ok({ success: true, doctorId, chaincodeResult: result }));
  } catch (err) { next(err); }
};

exports.registerInsuranceAgent = async (req, res, next) => {
  try {
    const { adminId, agentId, insuranceId, name, city } = req.body;
    if (!adminId || !agentId || !insuranceId || !name || !city) throw new Error('Missing required fields');

    await registerAndEnroll('org2', adminId, agentId, [
      { name: 'role', value: 'insuranceAgent', ecert: true },
      { name: 'uuid', value: agentId, ecert: true }
    ]);

    const payload = { agentId, insuranceId, name, city };
    const result = await invoke.invokeTransaction('onboardInsuranceAgent', payload, adminId);
    res.status(200).send(responses.ok({ success: true, agentId, chaincodeResult: result }));
  } catch (err) { next(err); }
};
