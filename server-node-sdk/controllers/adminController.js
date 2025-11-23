const invoke = require('../invoke');
const query = require('../query');
const responses = require('../utils/responses');

exports.addDoctor = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const { doctorId, hospitalId, name, city } = req.body;
    const payload = JSON.stringify({ doctorId, hospitalId, name, city });
    const result = await invoke.invokeTransaction('onboardDoctor', payload, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.addInsuranceAgent = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const { agentId, insuranceId, name, city } = req.body;
    const payload = JSON.stringify({ agentId, insuranceId, name, city });
    const result = await invoke.invokeTransaction('onboardInsuranceAgent', payload, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.listHospitals = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const result = await query.getQuery('getAllHospitals', {}, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.listDoctors = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const result = await query.getQuery('getAllDoctors', {}, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};
