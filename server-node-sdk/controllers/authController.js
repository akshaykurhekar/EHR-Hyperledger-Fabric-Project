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
