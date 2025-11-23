const invoke = require('../invoke');
const query = require('../query');
const responses = require('../utils/responses');

exports.addDoctor = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const { doctorId, hospitalId, name, city } = req.body;
    if (!doctorId || !hospitalId || !name || !city) {
      throw new Error('Missing required fields: doctorId, hospitalId, name, city');
    }
    // Note: This endpoint assumes doctor is already registered/enrolled
    // Use /auth/registerDoctor to register AND onboard a new doctor
    const payload = { doctorId, hospitalId, name, city };
    const result = await invoke.invokeTransaction('onboardDoctor', payload, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.addInsuranceAgent = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const { agentId, insuranceId, name, city } = req.body;
    if (!agentId || !insuranceId || !name || !city) {
      throw new Error('Missing required fields: agentId, insuranceId, name, city');
    }
    // Note: This endpoint assumes agent is already registered/enrolled
    // Use /auth/registerInsuranceAgent to register AND onboard a new agent
    const payload = { agentId, insuranceId, name, city };
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
    if(!doctorId || !hospitalId) throw new Error('Missing required fields: doctorId, hospitalId');
    
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
    if(!agentId || !insuranceId) throw new Error('Missing required fields: agentId, insuranceId');
    
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