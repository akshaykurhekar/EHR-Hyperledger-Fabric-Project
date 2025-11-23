const { Gateway } = require('fabric-network');
const helper = require('./helper');

module.exports.invokeTransaction = async (fcn, argsObj, userId, org='org1') => {
  const ccp = helper.getCCP(org);
  const wallet = await helper.getWallet();
  const gateway = new Gateway();
  try {
    await gateway.connect(ccp, { wallet, identity: userId, discovery: { enabled:true, asLocalhost:true } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('ehrChainCode');
    const payload = typeof argsObj === 'string' ? argsObj : JSON.stringify(argsObj || {});
    const result = await contract.submitTransaction(fcn, payload);
    await gateway.disconnect();
    return result.toString();
  } catch (err) {
    try { await gateway.disconnect(); } catch(e){}
    throw err;
  }
};
