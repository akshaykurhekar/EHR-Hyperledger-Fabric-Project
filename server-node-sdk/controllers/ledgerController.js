const query = require('../query');
const responses = require('../utils/responses');

exports.fetchLedger = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const result = await query.getQuery('fetchLedger', {}, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.queryHistory = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const assetId = req.params.assetId;
    const result = await query.getQuery('queryHistoryOfAsset', { assetId }, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};
