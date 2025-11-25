const invoke = require('../invoke');
const query = require('../query');
const responses = require('../utils/responses');

exports.addRecord = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const { patientId, diagnosis, prescription, notes } = req.body;
    const payload = { patientId, diagnosis, prescription, notes };
    const result = await invoke.invokeTransaction('addRecord', payload, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.verifyClaim = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const { claimId, verified, notes } = req.body;
    const payload = { claimId, doctorId: userId, verified, notes };
    const result = await invoke.invokeTransaction('verifyClaimByDoctor', payload, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.listPatients = async (req,res,next) => {
  try{
    const doctorId = req.params.doctorId;
    const result = await query.getQuery('getPatientsByDoctor', { doctorId }, doctorId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.getRecordsByPatient = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const patientId = req.params.patientId;
    const result = await query.getQuery('getAllRecordsByPatientId', { patientId }, userId);
    // Parse the JSON string result to return as array
    const records = JSON.parse(result);
    res.status(200).send(responses.ok(records));
  } catch(err){ next(err); }
};

exports.getProfile = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const doctorId = req.params.doctorId;
    const result = await query.getQuery('getDoctorById', { doctorId }, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};