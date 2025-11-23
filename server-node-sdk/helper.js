'use strict';

const fs = require('fs');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const { Wallets, Gateway } = require('fabric-network');


const registerUser = async (adminID, doctorId, userID, userRole, args) => {
    // const adminID = 'admin';
    const orgID = 'Org1';
    
    const ccpPath = path.resolve(__dirname, '..', 'fabric-samples','test-network', 'organizations', 'peerOrganizations', `${orgID}.example.com`.toLowerCase(), `connection-${orgID}.json`.toLowerCase());
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    const orgMSP = ccp.organizations[orgID].mspid;

    // Create a new CA client for interacting with the CA.
    const caOrg = ccp.organizations[orgID].certificateAuthorities[0]
    const caURL = ccp.certificateAuthorities[caOrg].url;
    const ca = new FabricCAServices(caURL);

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const userIdentity = await wallet.get(userID);
    if (userIdentity) {
        console.log(`An identity for the user ${userID} already exists in the wallet.`);
        return {
            statusCode: 200,
            message: `${userID} has already been enrolled.`
        };
    } else {
        console.log(`An identity for the user ${userID} does not exist so creating one in the wallet.`);
    }

    // Check to see if we've already enrolled the admin user.
    const adminIdentity = await wallet.get(adminID);
    if (!adminIdentity) {
        console.log(`An identity for the admin user ${adminID} does not exist in the wallet.`);
        console.log('Run the enrollAdmin.js application before retrying.');
        return {
            statusCode: 200,
            message: `An identity for the admin user does not exist in the wallet`
        };
    }

    // build a user object for authenticating with the CA //Verify
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, adminID);

    // Register the user, enroll the user, and import the new identity into the wallet.
    // if affiliation is specified by client, the affiliation value must be configured in CA
    const secret = await ca.register({
        affiliation: `${orgID}.department1`.toLowerCase(), //TODO: as per affiliation in config .${userRole}
        enrollmentID: userID,
        role: 'client',
        attrs: [
            {name: 'role', value: userRole, ecert: true},           
            {name: 'uuid', value: userID, ecert: true},           
        ]
    }, adminUser);
    const enrollment = await ca.enroll({
        enrollmentID: userID,
        enrollmentSecret: secret,
        attr_reqs: [
            {name: 'role', optional: false},          
            {name: 'uuid', optional: false},          
        ]
    });
    const x509Identity = {
        credentials: {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes(),
        },
        mspId: orgMSP,
        type: 'X.509',
    };
    await wallet.put(userID, x509Identity);
    console.log(`Successfully registered and enrolled user ${userID} and imported it into the wallet`);
    
     // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: doctorId, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('ehrChainCode');

        const args01 = {
            patientId:userID,
            hospitalName: args.hospitalName,
            name:args.name,
            city:args.city
        }

        const buffer = await contract.submitTransaction('onboardPatient', JSON.stringify(args01));
        // Disconnect from the gateway.
        gateway.disconnect();

    return {
        statusCode: 200,
        userID: userID,
        role: userRole,
        message: `${userID} registered and enrolled successfully.`,
        chaincodeRes: buffer.toString()
    };
}

const login = async (userID) => {

    const orgID = 'Org1';

    const ccpPath = path.resolve(__dirname, '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', `${orgID}.example.com`.toLowerCase(), `connection-${orgID}.json`.toLowerCase());
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(userID);
    if (!identity) {
        console.log(`An identity for the user ${userID} does not exist in the wallet`);
        console.log('Run the registerUser.js application before retrying');
        return {
            statusCode: 200,
            message: `An identity for the user ${userID} does not exist.`
        };
    } else {
        return {
            statusCode: 200,
            userID: userID,           
            message: `User login successful:: ${userID} .`
        };
    }
}

module.exports = {registerUser, login};
