'use strict';

const fs = require('fs');
const path = require('path');
const { Wallets, Gateway } = require('fabric-network');


const invokeTransaction = async (fcn, args, userID) => {

    const orgID = 'Org1';
    const channelName = 'mychannel';
    const chaincodeName = 'ehrChainCode';

    const ccpPath = path.resolve(__dirname, '..', 'fabric-samples','test-network', 'organizations', 'peerOrganizations', `${orgID}.example.com`.toLowerCase(), `connection-${orgID}.json`.toLowerCase());
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
            status: false,
            message: `An identity for the user ${userID} does not exist.`
        };
    }
       
    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: userID, discovery: { enabled: true, asLocalhost: true } });
    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork(channelName);
    // Get the contract from the network.
    const contract = network.getContract(chaincodeName);
    
    console.log("arguments at invoke: ", JSON.stringify(args))
    // Submit transaction
    let result = await contract.submitTransaction(fcn, JSON.stringify(args));
    // let result = await contract.submitTransaction(func, args.id, args.createdBy, args.title, args.details);
    result = JSON.parse(result);
    console.log(`Response from ${fcn} chaincode:}`, result);
    
    // Disconnect from the gateway.
    gateway.disconnect();
            
    return result;  
}

module.exports = {invokeTransaction};