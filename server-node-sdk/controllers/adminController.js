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

exports.assignDoctor = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const { doctorId, hospitalId } = req.body;
    if(!doctorId || !hospitalId) throw new Error('Missing doctorId or hospitalId');
    
    // Get doctor and update hospitalId
    const doctorResult = await query.getQuery('getDoctorById', { doctorId }, userId);
    const doctor = JSON.parse(doctorResult);
    
    // Update doctor's hospital assignment
    const payload = { doctorId, hospitalId };
    const result = await invoke.invokeTransaction('assignDoctorToHospital', payload, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.assignInsuranceAgent = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const { agentId, insuranceId } = req.body;
    if(!agentId || !insuranceId) throw new Error('Missing agentId or insuranceId');
    
    // Update agent's insurance assignment
    const payload = { agentId, insuranceId };
    const result = await invoke.invokeTransaction('assignAgentToInsurance', payload, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.listUsers = async (req,res,next) => {
  try{
    const userId = req.user.id;
    // Get all users from ledger (patients, doctors, agents)
    const patients = await query.getQuery('getAllPatients', {}, userId).catch(() => '[]');
    const doctors = await query.getQuery('getAllDoctors', {}, userId).catch(() => '[]');
    const agents = await query.getQuery('getAllAgents', {}, userId).catch(() => '[]');
    
    const result = {
      patients: JSON.parse(patients),
      doctors: JSON.parse(doctors),
      agents: JSON.parse(agents)
    };
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.deleteUser = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const targetUserId = req.params.userId;
    
    // Delete user from ledger
    const payload = { userId: targetUserId };
    const result = await invoke.invokeTransaction('deleteUser', payload, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};