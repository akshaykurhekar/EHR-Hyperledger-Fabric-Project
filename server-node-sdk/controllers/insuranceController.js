const invoke = require('../invoke');
const query = require('../query');
const responses = require('../utils/responses');

exports.reviewClaim = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const { claimId, notes } = req.body;
    const payload = { claimId, agentId: userId, notes };
    const result = await invoke.invokeTransaction('reviewClaimByAgent', payload, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.approveClaim = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const { claimId, approvedAmount, notes } = req.body;
    const payload = { claimId, insuranceAgentId: userId, approvedAmount, notes };
    const result = await invoke.invokeTransaction('approveClaimByInsurance', payload, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.rejectClaim = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const { claimId, reason } = req.body;
    const payload = { claimId, insuranceAgentId: userId, reason };
    const result = await invoke.invokeTransaction('rejectClaimByInsurance', payload, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.getClaim = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const claimId = req.params.claimId;
    const result = await query.getQuery('getClaimById', { claimId }, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};
