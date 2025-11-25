const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const org1ConnPath = path.resolve(__dirname, '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
const org2ConnPath = path.resolve(__dirname, '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org2.example.com', 'connection-org2.json');

const ccpOrg1 = JSON.parse(fs.readFileSync(org1ConnPath, 'utf8'));
const ccpOrg2 = JSON.parse(fs.readFileSync(org2ConnPath, 'utf8'));

module.exports.getCCP = (org='org1') => org === 'org1' ? ccpOrg1 : ccpOrg2;
module.exports.getWalletPath = () => path.join(__dirname, 'wallet');
module.exports.getWallet = async () => await Wallets.newFileSystemWallet(module.exports.getWalletPath());

// Register & enroll user with attributes (role, uuid) — simplifies enrol flow for scripts
module.exports.registerAndEnroll = async ({ org='org1', caName, adminId, enrollmentID, attrs=[] }) => {
  // NOTE: adapt to your CA setup: this is skeleton code to be used in cert-scripts
  const ccp = module.exports.getCCP(org);
  const caInfo = ccp.certificateAuthorities[Object.keys(ccp.certificateAuthorities)[0]];
  const ca = new FabricCAServices(caInfo.url, { trustedRoots: caInfo.tlsCACerts.pem, verify:false }, caInfo.caName);
  const wallet = await module.exports.getWallet();
  const adminIdentity = await wallet.get(adminId);
  if(!adminIdentity) throw new Error(`Admin identity ${adminId} not in wallet`);

  try {
    // register
    const secret = await ca.register({
      enrollmentID: enrollmentID,
      role: 'client',
      attrs: attrs // array like [{name:'role', value:'patient', ecert:true}, ...]
    }, adminIdentity);
    // enroll
    const enrollment = await ca.enroll({ enrollmentID: enrollmentID, enrollmentSecret: secret, attr_reqs: attrs.map(a=>({name:a.name,wanted:true})) });
    const x509Identity = {
      credentials: { certificate: enrollment.certificate, privateKey: enrollment.key.toBytes() },
      mspId: org === 'org1' ? 'Org1MSP' : 'Org2MSP',
      type: 'X.509'
    };
    await wallet.put(enrollmentID, x509Identity);
    return true;
  } catch (err) {
    throw err;
  }
};

module.exports.registerUser = async (adminId, doctorId, userId, role, metadata) => {
  // fallback lightweight — writes metadata file to wallet folder for non-CA flows
  const walletPath = module.exports.getWalletPath();
  const metaFile = path.join(walletPath, `${userId}.meta.json`);
  const obj = { userId, role, metadata, createdAt: new Date().toISOString() };
  fs.writeFileSync(metaFile, JSON.stringify(obj, null, 2));
  return { success: true, userId };
};

module.exports.login = async (userId) => {
  const wallet = await module.exports.getWallet();
  const id = await wallet.get(userId);
  if(!id) throw new Error('Identity not found in wallet: ' + userId);
  return { success: true, userId };
};
