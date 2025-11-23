/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // load the network configuration
        // Patients can be registered in either Org1 or Org2, using Org1 as default
        const ccpPath = path.resolve(__dirname, '../..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Patient ID - can be passed as command line argument or hardcoded
        const patientId = process.argv[2] || 'patient01';
        const patientName = process.argv[3] || 'John Doe';
        const patientDob = process.argv[4] || '01/01/1990';
        const patientCity = process.argv[5] || 'City';

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get(patientId);
        if (userIdentity) {
            console.log(`An identity for the user "${patientId}" already exists in the wallet`);
            return;
        }

        // Check to see if we've already enrolled the hospitalAdmin user.
        const adminIdentity = await wallet.get('hospitalAdmin');
        if (!adminIdentity) {
            console.log('An identity for the hospitalAdmin user "hospitalAdmin" does not exist in the wallet');
            console.log('Run the registerOrg1Admin.js application before retrying');
            return;
        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'hospitalAdmin');

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: patientId,
            role: 'client',
            attrs: [{ name: 'role', value: 'patient', ecert: true },{ name: 'uuid', value: patientId, ecert: true }],
        }, adminUser);
        const enrollment = await ca.enroll({
            enrollmentID: patientId,
            enrollmentSecret: secret,
            attr_reqs: [{ name: "role", optional: false },{ name: "uuid", optional: false }]
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put(patientId, x509Identity);
        console.log(`Successfully registered and enrolled patient user "${patientId}" and imported it into the wallet`);

        // -----------------------Onboard Patient on Chaincode------------------ 
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: patientId, discovery: { enabled: true, asLocalhost: true } });
        
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');
        
        // Get the contract from the network.
        const contract = network.getContract('ehrChainCode');

        const args = {
            patientId: patientId,
            name: patientName,
            dob: patientDob,
            city: patientCity
        };

        const res = await contract.submitTransaction('onboardPatient', JSON.stringify(args));
        console.log("\n === Onboard Patient success === \n", res.toString());

        // Disconnect from the gateway.
        gateway.disconnect();

    } catch (error) {
        console.error(`Failed to register patient: ${error}`);
        process.exit(1);
      }
}

main();

