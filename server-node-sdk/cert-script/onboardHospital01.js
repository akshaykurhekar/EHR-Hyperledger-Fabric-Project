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
        const ccpPath = path.resolve(__dirname, '../..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        // const ccpPath = path.resolve(__dirname, '..', '..','HLF-Alpha_token-Faucet', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get('Hospital01');
        if (userIdentity) {
            console.log('An identity for the user "Hospital01" already exists in the wallet');
            return;
        }

        // Check to see if we've already enrolled the hospitalAdmin user.
        const adminIdentity = await wallet.get('hospitalAdmin');
        if (!adminIdentity) {
            console.log('An identity for the hospitalAdmin user "hospitalAdmin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'hospitalAdmin');

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: 'Hospital01',
            role: 'client',
            attrs: [{ name: 'role', value: 'hospital', ecert: true },{ name: 'uuid', value: 'Hospital01', ecert: true }],
        }, adminUser);
        const enrollment = await ca.enroll({
            enrollmentID: 'Hospital01',
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
        await wallet.put('Hospital01', x509Identity);
        console.log('Successfully registered and enrolled hospitalAdmin user "Hospital01" and imported it into the wallet');

        // -----------------------Onboard Hospital on Chaincode------------------ 
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'Hospital01', discovery: { enabled: true, asLocalhost: true } });
        
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');
        
        // Get the contract from the network.
        const contract = network.getContract('ehrChainCode');

        const args = {
            hospitalId: "Hospital01",
            name: "ABC Hospital",
            address: "123 Medical Street, City"
        };

        const res = await contract.submitTransaction('onboardHospitalAdmin', JSON.stringify(args));
        console.log("\n === Onboard Hospital Admin success === \n", res.toString());

        // Disconnect from the gateway.
        gateway.disconnect();

    } catch (error) {
        console.error(`Failed to register user "Hospital01": ${error}`);
        process.exit(1);
      }
}

main();
