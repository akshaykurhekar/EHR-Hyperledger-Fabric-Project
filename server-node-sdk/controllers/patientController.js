const invoke = require('../invoke');
const query = require('../query');
const responses = require('../utils/responses');

exports.submitClaim = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const payload = {
      patientId: userId,
      doctorId: req.body.doctorId,
      policyId: req.body.policyId,
      hospitalId: req.body.hospitalId,
      claimAmount: req.body.claimAmount,
      medicalRecordIds: req.body.medicalRecordIds || [],
      claimType: req.body.claimType,
      description: req.body.description,
      documents: req.body.documents || []
    };
    const result = await invoke.invokeTransaction('submitClaim', payload, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.grantAccess = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const { doctorIdToGrant } = req.body;
    const payload = { patientId: userId, doctorIdToGrant };
    const result = await invoke.invokeTransaction('grantAccess', payload, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.revokeAccess = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const { doctorIdToRevoke } = req.body;
    const payload = { patientId: userId, doctorIdToRevoke };
    const result = await invoke.invokeTransaction('revokeAccess', payload, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.getClaims = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const patientId = req.params.patientId;
    const result = await query.getQuery('getClaimsByPatient', { patientId }, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.getRecords = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const patientId = req.params.patientId;
    const result = await query.getQuery('getAllRecordsByPatientId', { patientId }, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.getProfile = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const patientId = req.params.patientId;
    const result = await query.getQuery('getPatientById', { patientId }, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.updateClaimDocuments = async (req,res,next) => {
  try{
    const userId = req.user.id;
    const { claimId, documents } = req.body;
    if(!claimId || !documents) throw new Error('Missing claimId or documents');
    
    // Get current claim
    const claimResult = await query.getQuery('getClaimById', { claimId }, userId);
    const claim = JSON.parse(claimResult);
    
    // Update documents
    claim.documents = documents;
    claim.updatedAt = new Date().toISOString();
    
    // Update claim on ledger (this requires a new chaincode function or we use getByKey and putState)
    // For now, we'll need to add an updateClaimDocuments function to chaincode
    const payload = { claimId, documents };
    const result = await invoke.invokeTransaction('updateClaimDocuments', payload, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};