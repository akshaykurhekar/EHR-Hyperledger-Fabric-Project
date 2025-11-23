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

        const doctorId = 'Doctor-Rama05';

        // Check if doctor already exists
        let userIdentity = await wallet.get(doctorId);
        if (!userIdentity) {
            // Hospital admin must exist
            const adminIdentity = await wallet.get('hospitalAdmin');
            if (!adminIdentity) {
                console.error('HospitalAdmin identity missing. Run enrollAdmin.js first.');
                return;
            }

            const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
            const adminUser = await provider.getUserContext(adminIdentity, 'hospitalAdmin');

            // Register doctor with attributes
            const secret = await ca.register(
                {
                    affiliation: 'org1.department1',
                    enrollmentID: doctorId,
                    role: 'client',
                    attrs: [
                        { name: 'role', value: 'doctor', ecert: true },
                        { name: 'uuid', value: doctorId, ecert: true },
                    ],
                },
                adminUser
            );

            // Enroll doctor
            const enrollment = await ca.enroll({
                enrollmentID: doctorId,
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

            await wallet.put(doctorId, userIdentity);
            console.log(`Successfully registered and enrolled "${doctorId}" into the wallet`);
        } else {
            console.log(`An identity for "${doctorId}" already exists in the wallet`);
        }

        // ---------------- Onboard Doctor using hospitalAdmin ----------------
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'hospitalAdmin', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('ehrChainCode');

        const args = {
            doctorId: doctorId,
            hospitalId: 'Hospital01',
            name: 'Dr. Raj',
            city: 'Pune',
        };

        const res = await contract.submitTransaction('onboardDoctor', JSON.stringify(args));
        console.log('\n=== Onboard Doctor success ===\n', res.toString());

        gateway.disconnect();

    } catch (error) {
        console.error(`Failed to onboard doctor: ${error}`);
        process.exit(1);
    }
}

main();
