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
    // Parse the JSON string result to return as array
    const history = JSON.parse(result);
    res.status(200).send(responses.ok(history));
  } catch(err){ next(err); }
};
