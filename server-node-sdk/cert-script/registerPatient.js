/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // Load the network configuration (Org1 for patients)
        const ccpPath = path.resolve(__dirname, '../..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new file system based wallet for managing identities
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Patient data (can come from API request or command line)
        const patientId = process.argv[2] || 'patient01';
        const patientName = process.argv[3] || 'John Doe';
        const patientDob = process.argv[4] || '1990-01-01';
        const patientCity = process.argv[5] || 'NY';

        // Check if patient already exists in wallet
        const userIdentity = await wallet.get(patientId);
        if (userIdentity) {
            console.log(`An identity for the user "${patientId}" already exists in the wallet`);
            return;
        }

        // Check hospitalAdmin exists
        const adminIdentity = await wallet.get('hospitalAdmin');
        if (!adminIdentity) {
            throw new Error('Admin identity "hospitalAdmin" not found in wallet. Run registerOrg1Admin.js first.');
        }

        // Build proper User object for CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'hospitalAdmin');

        // Register the patient with CA
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: patientId,
            role: 'client',
            attrs: [
                { name: 'role', value: 'patient', ecert: true },
                { name: 'uuid', value: patientId, ecert: true }
            ]
        }, adminUser); // <-- must pass adminUser, not adminIdentity

        // Enroll the patient and import into wallet
        const enrollment = await ca.enroll({
            enrollmentID: patientId,
            enrollmentSecret: secret,
            attr_reqs: [
                { name: "role", optional: false },
                { name: "uuid", optional: false }
            ]
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
        console.log(`Successfully registered and enrolled patient "${patientId}" into the wallet`);

        // ----------------------- Onboard patient on chaincode ------------------
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: patientId, discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('ehrChainCode');

        const args = { patientId, name: patientName, dob: patientDob, city: patientCity };
        const res = await contract.submitTransaction('onboardPatient', JSON.stringify(args));

        console.log("\n=== Onboard Patient success ===\n", res.toString());

        gateway.disconnect();

    } catch (error) {
        console.error(`Failed to register patient: ${error}`);
        process.exit(1);
    }
}

main();
