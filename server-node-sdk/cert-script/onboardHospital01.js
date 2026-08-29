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
        // Load the network configuration
        const ccpPath = path.resolve(
            __dirname,
            '../..',
            'fabric-samples',
            'test-network',
            'organizations',
            'peerOrganizations',
            'org1.example.com',
            'connection-org1.json'
        );
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create CA client
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Setup wallet
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check if Hospital01 identity exists
        let userIdentity = await wallet.get('Hospital01');
        if (!userIdentity) {
            // Check if hospitalAdmin exists
            const adminIdentity = await wallet.get('hospitalAdmin');
            if (!adminIdentity) {
                console.error('HospitalAdmin identity missing. Run enrollAdmin.js first.');
                return;
            }

            // Build hospitalAdmin user for CA
            const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
            const adminUser = await provider.getUserContext(adminIdentity, 'hospitalAdmin');

            // Register Hospital01 with attributes
            const secret = await ca.register(
                {
                    affiliation: 'org1.department1',
                    enrollmentID: 'Hospital01',
                    role: 'client',
                    attrs: [
                        { name: 'role', value: 'hospital', ecert: true },
                        { name: 'uuid', value: 'Hospital01', ecert: true },
                    ],
                },
                adminUser
            );

            // Enroll Hospital01
            const enrollment = await ca.enroll({
                enrollmentID: 'Hospital01',
                enrollmentSecret: secret,
                attr_reqs: [
                    { name: 'role', optional: false },
                    { name: 'uuid', optional: false },
                ],
            });

            userIdentity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'Org1MSP',
                type: 'X.509',
            };

            await wallet.put('Hospital01', userIdentity);
            console.log('Successfully registered and enrolled "Hospital01" into the wallet');
        } else {
            console.log('An identity for "Hospital01" already exists in the wallet');
        }

        // ---------------- Onboard Hospital on Chaincode ----------------
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'Hospital01', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('ehrChainCode');

        const args = {
            hospitalId: 'Hospital01',
            name: 'ABC Hospital',
            address: '123 Medical Street, City',
        };

        const res = await contract.submitTransaction('onboardHospitalAdmin', JSON.stringify(args));
        console.log('\n=== Onboard Hospital Admin success ===\n', res.toString());

        gateway.disconnect();

    } catch (error) {
        console.error(`Failed to onboard Hospital01: ${error}`);
        process.exit(1);
    }
}

main();
