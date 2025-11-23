const helper = require('../helper');
const invoke = require('../invoke');
const responses = require('../utils/responses');

exports.registerPatient = async (req,res,next) => {
  try{
    const { adminId, userId, name, dob, city } = req.body;
    if(!adminId || !userId || !name || !dob || !city) {
      throw new Error('Missing required fields: adminId, userId, name, dob, city');
    }
    
    // Register and enroll patient with CA
    const attrs = [
      { name: 'role', value: 'patient', ecert: true },
      { name: 'uuid', value: userId, ecert: true }
    ];
    await helper.registerAndEnroll({ org: 'org1', adminId, enrollmentID: userId, attrs });
    
    // Onboard patient on chaincode
    const payload = { patientId: userId, name, dob, city };
    const result = await invoke.invokeTransaction('onboardPatient', payload, userId);
    res.status(200).send(responses.ok({ success: true, userId, chaincodeResult: result }));
  } catch(err){ next(err); }
};

exports.loginPatient = async (req,res,next) => {
  try{
    const { userId } = req.body;
    const result = await helper.login(userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.registerHospitalAdmin = async (req,res,next) => {
  try{
    const { userId, hospitalId, name, address } = req.body;
    if(!userId) throw new Error('userId (hospital admin) required as caller identity');
    const payload = JSON.stringify({ hospitalId, name, address });
    const result = await invoke.invokeTransaction('onboardHospitalAdmin', payload, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.registerInsuranceAdmin = async (req,res,next) => {
  try{
    const { userId, insuranceId, name, address } = req.body;
    if(!userId) throw new Error('userId (insurance admin) required');
    const payload = JSON.stringify({ insuranceId, name, address });
    const result = await invoke.invokeTransaction('onboardInsuranceCompany', payload, userId);
    res.status(200).send(responses.ok(result));
  } catch(err){ next(err); }
};

exports.registerDoctor = async (req,res,next) => {
  try{
    const { adminId, doctorId, hospitalId, name, city } = req.body;
    if(!adminId || !doctorId || !hospitalId || !name || !city) {
      throw new Error('Missing required fields: adminId, doctorId, hospitalId, name, city');
    }
    
    // Register and enroll doctor with CA
    const attrs = [
      { name: 'role', value: 'doctor', ecert: true },
      { name: 'uuid', value: doctorId, ecert: true }
    ];
    await helper.registerAndEnroll({ org: 'org1', adminId, enrollmentID: doctorId, attrs });
    
    // Onboard doctor on chaincode (requires hospital admin to call)
    const payload = { doctorId, hospitalId, name, city };
    const result = await invoke.invokeTransaction('onboardDoctor', payload, adminId);
    res.status(200).send(responses.ok({ success: true, doctorId, chaincodeResult: result }));
  } catch(err){ next(err); }
};

exports.registerInsuranceAgent = async (req,res,next) => {
  try{
    const { adminId, agentId, insuranceId, name, city } = req.body;
    if(!adminId || !agentId || !insuranceId || !name || !city) {
      throw new Error('Missing required fields: adminId, agentId, insuranceId, name, city');
    }
    
    // Register and enroll agent with CA
    const attrs = [
      { name: 'role', value: 'insuranceAgent', ecert: true },
      { name: 'uuid', value: agentId, ecert: true }
    ];
    await helper.registerAndEnroll({ org: 'org2', adminId, enrollmentID: agentId, attrs });
    
    // Onboard agent on chaincode (requires insurance admin to call)
    const payload = { agentId, insuranceId, name, city };
    const result = await invoke.invokeTransaction('onboardInsuranceAgent', payload, adminId);
    res.status(200).send(responses.ok({ success: true, agentId, chaincodeResult: result }));
  } catch(err){ next(err); }
};
