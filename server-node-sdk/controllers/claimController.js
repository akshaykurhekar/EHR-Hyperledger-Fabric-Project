const invoke = require('../invoke');
const query = require('../query');
const responses = require('../utils/responses');

exports.getClaimsByStatus = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const status = req.query.status;
    const result = await query.getQuery('getClaimsByStatus', { status }, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};
