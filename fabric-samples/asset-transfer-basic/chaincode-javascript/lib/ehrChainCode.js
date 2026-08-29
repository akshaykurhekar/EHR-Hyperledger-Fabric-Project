'use strict';

const stringify = require('json-stringify-deterministic');
const { Contract } = require('fabric-contract-api');

class ehrChainCode extends Contract {
  genId(ctx, prefix='ID'){ return `${prefix}-${ctx.stub.getTxID()}`; }
  recordIdGenerator(ctx){ return this.genId(ctx,'R'); }
  claimIdGenerator(ctx){ return this.genId(ctx,'CLAIM'); }

  // helper to get deterministic ISO timestamp from transaction context
  getTxTimestampISO(ctx){
    const ts = ctx.stub.getTxTimestamp();
    // ts.seconds may be a Long object or a number depending on environment
    let seconds = 0;
    if (ts && ts.seconds !== undefined) {
      if (typeof ts.seconds === 'object' && ts.seconds.low !== undefined) {
        seconds = ts.seconds.low;
      } else {
        seconds = ts.seconds;
      }
    }
    const nanos = ts && ts.nanos ? ts.nanos : 0;
    const millis = (seconds * 1000) + Math.floor(nanos / 1e6);
    return new Date(millis).toISOString();
  }

  getCallerAttributes(ctx){
    const role = ctx.clientIdentity.getAttributeValue('role');
    const uuid = ctx.clientIdentity.getAttributeValue('uuid');
    if(!role || !uuid) throw new Error('Missing role or uuid in client certificate attributes');
    return { role, uuid };
  }

  // --- Onboarding ---
  async onboardHospitalAdmin(ctx,args){
    const { hospitalId, name, address } = JSON.parse(args);
    const { role, uuid } = this.getCallerAttributes(ctx);
    const org = ctx.clientIdentity.getMSPID();
    if(org !== 'Org1MSP' || role !== 'hospital') throw new Error('Only Org1 hospital admin can onboard hospital admin');
    const key = `hospital-${hospitalId}`;
    const ex = await ctx.stub.getState(key);
    if(ex && ex.length) throw new Error(`Hospital ${hospitalId} exists`);
    const createdAt = this.getTxTimestampISO(ctx);
    const hospital = { hospitalId, name, address, adminId: uuid, createdAt };
    await ctx.stub.putState(key, Buffer.from(stringify(hospital)));
    return stringify(hospital);
  }

  async onboardInsuranceCompany(ctx,args){
    const { insuranceId, name, address } = JSON.parse(args);
    const { role, uuid } = this.getCallerAttributes(ctx);
    const org = ctx.clientIdentity.getMSPID();
    if(org !== 'Org2MSP' || role !== 'insuranceAdmin') throw new Error('Only Org2 insurance admin can onboard');
    const key = `insurance-${insuranceId}`;
    const ex = await ctx.stub.getState(key);
    if(ex && ex.length) throw new Error(`Insurance ${insuranceId} exists`);
    const createdAt = this.getTxTimestampISO(ctx);
    const ins = { insuranceId, name, address, adminId: uuid, createdAt };
    await ctx.stub.putState(key, Buffer.from(stringify(ins)));
    return stringify(ins);
  }

  async onboardDoctor(ctx,args){
    const { doctorId, hospitalId, name, city } = JSON.parse(args);
    const { role, uuid } = this.getCallerAttributes(ctx);
    if(role !== 'hospital') throw new Error('Only hospital admin can onboard doctors');
    const key = `doctor-${doctorId}`;
    const ex = await ctx.stub.getState(key);
    if(ex && ex.length) throw new Error(`Doctor ${doctorId} exists`);
    const createdAt = this.getTxTimestampISO(ctx);
    const doc = { doctorId, hospitalId, name, city, onboardedBy: uuid, createdAt };
    await ctx.stub.putState(key, Buffer.from(stringify(doc)));
    const hospDoctorsKey = `hospitalDoctors-${hospitalId}`;
    let list = []; const listBytes = await ctx.stub.getState(hospDoctorsKey);
    if(listBytes && listBytes.length) list = JSON.parse(listBytes.toString());
    if(!list.includes(doctorId)) list.push(doctorId);
    await ctx.stub.putState(hospDoctorsKey, Buffer.from(JSON.stringify(list)));
    return stringify(doc);
  }

  async onboardInsuranceAgent(ctx,args){
    const { agentId, insuranceId, name, city } = JSON.parse(args);
    const { role, uuid } = this.getCallerAttributes(ctx);
    if(role !== 'insuranceAdmin') throw new Error('Only insurance admin can onboard agents');
    const key = `agent-${agentId}`;
    const ex = await ctx.stub.getState(key);
    if(ex && ex.length) throw new Error(`Agent ${agentId} exists`);
    const createdAt = this.getTxTimestampISO(ctx);
    const agent = { agentId, insuranceId, name, city, onboardedBy: uuid, createdAt };
    await ctx.stub.putState(key, Buffer.from(stringify(agent)));
    const agentsKey = `insuranceAgents-${insuranceId}`;
    let list = []; const listBytes = await ctx.stub.getState(agentsKey);
    if(listBytes && listBytes.length) list = JSON.parse(listBytes.toString());
    if(!list.includes(agentId)) list.push(agentId);
    await ctx.stub.putState(agentsKey, Buffer.from(JSON.stringify(list)));
    return stringify(agent);
  }

  // --- Patient ---
  async onboardPatient(ctx,args){
    const { patientId, name, dob, city } = JSON.parse(args);
    const key = `patient-${patientId}`;
    const ex = await ctx.stub.getState(key);
    if(ex && ex.length) throw new Error(`Patient ${patientId} exists`);
    const createdAt = this.getTxTimestampISO(ctx);
    const patient = { patientId, name, dob, city, authorizedDoctors: [], createdAt };
    await ctx.stub.putState(key, Buffer.from(JSON.stringify(patient)));
    return stringify(patient);
  }

  async getPatientById(ctx,args){
    const { patientId } = JSON.parse(args);
    const key = `patient-${patientId}`;
    const bytes = await ctx.stub.getState(key);
    if(!bytes || !bytes.length) throw new Error(`Patient ${patientId} not found`);
    return bytes.toString();
  }

  async grantAccess(ctx,args){
    const { patientId, doctorIdToGrant } = JSON.parse(args);
    const { role, uuid } = this.getCallerAttributes(ctx);
    if(role !== 'patient') throw new Error('Only patients can grant access');
    if(uuid !== patientId) throw new Error('Caller not owner');
    const key = `patient-${patientId}`;
    const bytes = await ctx.stub.getState(key);
    if(!bytes || !bytes.length) throw new Error(`Patient ${patientId} not found`);
    const patient = JSON.parse(bytes.toString());
    if(!patient.authorizedDoctors) patient.authorizedDoctors = [];
    if(patient.authorizedDoctors.includes(doctorIdToGrant)) return JSON.stringify({ message: `Doctor ${doctorIdToGrant} already authorized` });
    patient.authorizedDoctors.push(doctorIdToGrant);
    await ctx.stub.putState(key, Buffer.from(JSON.stringify(patient)));
    const docPatientsKey = `doctorPatients-${doctorIdToGrant}`;
    let dp = []; const dpBytes = await ctx.stub.getState(docPatientsKey);
    if(dpBytes && dpBytes.length) dp = JSON.parse(dpBytes.toString());
    if(!dp.includes(patientId)) dp.push(patientId);
    await ctx.stub.putState(docPatientsKey, Buffer.from(JSON.stringify(dp)));
    return JSON.stringify({ message: `Doctor ${doctorIdToGrant} authorized for patient ${patientId}` });
  }

  async revokeAccess(ctx,args){
    const { patientId, doctorIdToRevoke } = JSON.parse(args);
    const { role, uuid } = this.getCallerAttributes(ctx);
    if(role !== 'patient') throw new Error('Only patients can revoke access');
    if(uuid !== patientId) throw new Error('Caller not owner');
    const key = `patient-${patientId}`;
    const bytes = await ctx.stub.getState(key);
    if(!bytes || !bytes.length) throw new Error(`Patient ${patientId} not found`);
    const patient = JSON.parse(bytes.toString());
    if(!patient.authorizedDoctors) patient.authorizedDoctors = [];
    const idx = patient.authorizedDoctors.indexOf(doctorIdToRevoke);
    if(idx !== -1) patient.authorizedDoctors.splice(idx,1);
    await ctx.stub.putState(key, Buffer.from(JSON.stringify(patient)));
    const docPatientsKey = `doctorPatients-${doctorIdToRevoke}`;
    const dpBytes = await ctx.stub.getState(docPatientsKey);
    if(dpBytes && dpBytes.length){ let dp = JSON.parse(dpBytes.toString()); const j = dp.indexOf(patientId); if(j !== -1) dp.splice(j,1); await ctx.stub.putState(docPatientsKey, Buffer.from(JSON.stringify(dp))); }
    return JSON.stringify({ message: `Doctor ${doctorIdToRevoke} revoked for patient ${patientId}` });
  }

  // --- Records ---
  async addRecord(ctx,args){
    const { patientId, diagnosis, prescription, notes } = JSON.parse(args);
    const { role, uuid } = this.getCallerAttributes(ctx);
    if(role !== 'doctor') throw new Error('Only doctors can add records');
    const patientKey = `patient-${patientId}`;
    const pBytes = await ctx.stub.getState(patientKey);
    if(!pBytes || !pBytes.length) throw new Error(`Patient ${patientId} not found`);
    const patient = JSON.parse(pBytes.toString());
    if(!patient.authorizedDoctors || !patient.authorizedDoctors.includes(uuid)) throw new Error(`Doctor ${uuid} not authorized`);
    const txid = ctx.stub.getTxID();
    const recordId = `R-${txid}`;
    const recordKey = ctx.stub.createCompositeKey('record',[patientId,recordId]);
    const timestamp = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
    const record = { recordId, patientId, doctorId: uuid, diagnosis, prescription, notes: notes||'', timestamp };
    await ctx.stub.putState(recordKey, Buffer.from(JSON.stringify(record)));
    const patientRecordsKey = `patientRecords-${patientId}`;
    let pr = []; const prBytes = await ctx.stub.getState(patientRecordsKey);
    if(prBytes && prBytes.length) pr = JSON.parse(prBytes.toString());
    pr.push(recordKey);
    await ctx.stub.putState(patientRecordsKey, Buffer.from(JSON.stringify(pr)));
    return JSON.stringify({ message: `Record ${recordId} added`, record });
  }

  async getAllRecordsByPatientId(ctx,args){
    const { patientId } = JSON.parse(args);
    const iterator = await ctx.stub.getStateByPartialCompositeKey('record',[patientId]);
    const results = [];
    try {
      // Use iterator.next() method for better compatibility
      let res = await iterator.next();
      while (!res.done) {
        if (res.value) {
          try {
            results.push(JSON.parse(res.value.value.toString('utf8')));
          } catch (e) {
            // Skip invalid records
          }
        }
        res = await iterator.next();
      }
    } finally {
      await iterator.close();
    }
    return JSON.stringify(results);
  }

  async getRecordById(ctx,args){
    const { patientId, recordId } = JSON.parse(args);
    const recordKey = ctx.stub.createCompositeKey('record',[patientId,recordId]);
    const bytes = await ctx.stub.getState(recordKey);
    if(!bytes || !bytes.length) throw new Error(`Record ${recordId} not found`);
    return bytes.toString();
  }

  // --- Claims ---
  async submitClaim(ctx,args){
    const { patientId, doctorId, policyId, hospitalId, claimAmount, medicalRecordIds, claimType, description, documents } = JSON.parse(args);
    const { role, uuid } = this.getCallerAttributes(ctx);
    if(role !== 'patient') throw new Error('Only patient can submit claim');
    if(uuid !== patientId) throw new Error('Caller not owner');
    const pKey = `patient-${patientId}`; const pBytes = await ctx.stub.getState(pKey);
    if(!pBytes || !pBytes.length) throw new Error(`Patient ${patientId} not found`);
    const claimId = this.claimIdGenerator(ctx); const claimKey = `claim-${claimId}`;
    const now = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
    const claim = { claimId, patientId, doctorId, policyId, hospitalId, claimAmount, medicalRecordIds: medicalRecordIds||[], claimType, description: description||'', documents: documents||[], status: 'PENDING_DOCTOR_VERIFICATION', createdAt: now, updatedAt: now, history:[{at:now,by:patientId,action:'SUBMITTED'}] };
    await ctx.stub.putState(claimKey, Buffer.from(JSON.stringify(claim)));
    const patientClaimsKey = `patientClaims-${patientId}`; let pc = []; const pcBytes = await ctx.stub.getState(patientClaimsKey);
    if(pcBytes && pcBytes.length) pc = JSON.parse(pcBytes.toString());
    pc.push(claimId); await ctx.stub.putState(patientClaimsKey, Buffer.from(JSON.stringify(pc)));
    return JSON.stringify({ message: 'Claim submitted', claim });
  }

  async verifyClaimByDoctor(ctx,args){
    const { claimId, doctorId, verified, notes } = JSON.parse(args);
    const { role, uuid } = this.getCallerAttributes(ctx);
    if(role !== 'doctor') throw new Error('Only doctor can verify claim');
    const claimKey = `claim-${claimId}`; const claimBytes = await ctx.stub.getState(claimKey);
    if(!claimBytes || !claimBytes.length) throw new Error(`Claim not found`);
    const claim = JSON.parse(claimBytes.toString());
    if(claim.doctorId !== doctorId) throw new Error('Doctor not assigned');
    if(claim.status !== 'PENDING_DOCTOR_VERIFICATION') throw new Error('Claim not in doctor stage');
    const updatedAt = this.getTxTimestampISO(ctx);
    claim.doctorVerified = !!verified;
    claim.doctorNotes = notes||'';
    claim.status = verified ? 'PENDING_INSURANCE_REVIEW' : 'DOCTOR_REJECTED';
    claim.updatedAt = updatedAt;
    claim.history = claim.history || [];
    claim.history.push({ at: updatedAt, by: doctorId, action: verified ? 'DOCTOR_APPROVED' : 'DOCTOR_REJECTED', notes: notes||'' });
    await ctx.stub.putState(claimKey, Buffer.from(JSON.stringify(claim))); return JSON.stringify({ message: 'Doctor verification recorded', claim });
  }

  async reviewClaimByAgent(ctx,args){
    const { claimId, agentId, notes } = JSON.parse(args);
    const { role, uuid } = this.getCallerAttributes(ctx);
    if(role !== 'insuranceAgent') throw new Error('Only insurance agent can review claim');
    const claimKey = `claim-${claimId}`; const claimBytes = await ctx.stub.getState(claimKey);
    if(!claimBytes || !claimBytes.length) throw new Error('Claim not found');
    const claim = JSON.parse(claimBytes.toString());
    if(claim.status !== 'PENDING_INSURANCE_REVIEW') throw new Error('Claim not ready');
    const updatedAt = this.getTxTimestampISO(ctx);
    claim.agentId = agentId; claim.agentNotes = notes||''; claim.status = 'PENDING_INSURANCE_APPROVAL'; claim.updatedAt = updatedAt;
    claim.history.push({ at: claim.updatedAt, by: agentId, action: 'AGENT_REVIEWED', notes: notes||'' });
    await ctx.stub.putState(claimKey, Buffer.from(JSON.stringify(claim))); return JSON.stringify({ message: 'Agent review recorded', claim });
  }

  async approveClaimByInsurance(ctx,args){
    const { claimId, insuranceAgentId, approvedAmount, notes } = JSON.parse(args);
    const { role, uuid } = this.getCallerAttributes(ctx);
    if(role !== 'insuranceAgent') throw new Error('Only insurance agent can approve claim');
    const claimKey = `claim-${claimId}`; const claimBytes = await ctx.stub.getState(claimKey);
    if(!claimBytes || !claimBytes.length) throw new Error('Claim not found');
    const claim = JSON.parse(claimBytes.toString());
    if(claim.status !== 'PENDING_INSURANCE_APPROVAL') throw new Error('Claim not in insurance stage');
    const updatedAt = this.getTxTimestampISO(ctx);
    claim.approvedAmount = approvedAmount; claim.insuranceAgentId = insuranceAgentId; claim.insuranceNotes = notes||''; claim.status = 'INSURANCE_APPROVED';
    claim.updatedAt = updatedAt; claim.history.push({ at: claim.updatedAt, by: insuranceAgentId, action: 'INSURANCE_APPROVED', notes: notes||'' });
    await ctx.stub.putState(claimKey, Buffer.from(JSON.stringify(claim))); return JSON.stringify({ message: 'Claim approved', claim });
  }

  async rejectClaimByInsurance(ctx,args){
    const { claimId, insuranceAgentId, reason } = JSON.parse(args);
    const { role, uuid } = this.getCallerAttributes(ctx);
    if(role !== 'insuranceAgent') throw new Error('Only insurance agent can reject claim');
    const claimKey = `claim-${claimId}`; const claimBytes = await ctx.stub.getState(claimKey);
    if(!claimBytes || !claimBytes.length) throw new Error('Claim not found');
    const claim = JSON.parse(claimBytes.toString());
    if(claim.status !== 'PENDING_INSURANCE_APPROVAL') throw new Error('Claim not in insurance stage');
    const updatedAt = this.getTxTimestampISO(ctx);
    claim.rejectionReason = reason||''; claim.insuranceAgentId = insuranceAgentId; claim.status = 'INSURANCE_REJECTED';
    claim.updatedAt = updatedAt; claim.history.push({ at: claim.updatedAt, by: insuranceAgentId, action: 'INSURANCE_REJECTED', notes: reason||'' });
    await ctx.stub.putState(claimKey, Buffer.from(JSON.stringify(claim))); return JSON.stringify({ message: 'Claim rejected', claim });
  }

  async getClaimById(ctx,args){
    const { claimId } = JSON.parse(args);
    const claimKey = `claim-${claimId}`; const bytes = await ctx.stub.getState(claimKey);
    if(!bytes || !bytes.length) throw new Error('Claim not found'); return bytes.toString();
  }

  async getClaimsByPatient(ctx,args){
    const { patientId } = JSON.parse(args); const indexKey = `patientClaims-${patientId}`; const bytes = await ctx.stub.getState(indexKey);
    if(!bytes || !bytes.length) return stringify([]); const ids = JSON.parse(bytes.toString()); const claims = [];
    for(const id of ids){ const cb = await ctx.stub.getState(`claim-${id}`); if(cb && cb.length) claims.push(JSON.parse(cb.toString())); } return stringify(claims);
  }

  async getClaimsByStatus(ctx,args){
    const { status } = JSON.parse(args); const iter = await ctx.stub.getStateByRange('claim-','claim-~'); const results = [];
    for await(const r of iter){ try{ const v = JSON.parse(r.value.value.toString('utf8')); if(v.status === status) results.push(v); }catch(e){} } return stringify(results);
  }
async getAllHospitals(ctx,args){
    const iter = await ctx.stub.getStateByRange('hospital-','hospital-~');
    const results = [];
    for await(const r of iter){ try{ results.push(JSON.parse(r.value.value.toString('utf8'))); }catch(e){} }
    return stringify(results);
  }

  async getAllDoctors(ctx,args){
    const iter = await ctx.stub.getStateByRange('doctor-','doctor-~');
    const results = [];
    for await(const r of iter){ try{ results.push(JSON.parse(r.value.value.toString('utf8'))); }catch(e){} }
    return stringify(results);
  }

  async getPatientsByDoctor(ctx,args){
    const { doctorId } = JSON.parse(args);
    const docPatientsKey = `doctorPatients-${doctorId}`;
    const bytes = await ctx.stub.getState(docPatientsKey);
    if(!bytes || !bytes.length) return stringify([]);
    const patientIds = JSON.parse(bytes.toString());
    const patients = [];
    for(const patientId of patientIds){
      const pKey = `patient-${patientId}`;
      const pBytes = await ctx.stub.getState(pKey);
      if(pBytes && pBytes.length) patients.push(JSON.parse(pBytes.toString()));
    }
    return stringify(patients);
  }

  async getDoctorById(ctx,args){
    const { doctorId } = JSON.parse(args);
    const key = `doctor-${doctorId}`;
    const bytes = await ctx.stub.getState(key);
    if(!bytes || !bytes.length) throw new Error(`Doctor ${doctorId} not found`);
    return bytes.toString();
  }

  async getAgentById(ctx,args){
    const { agentId } = JSON.parse(args);
    const key = `agent-${agentId}`;
    const bytes = await ctx.stub.getState(key);
    if(!bytes || !bytes.length) throw new Error(`Agent ${agentId} not found`);
    return bytes.toString();
  }

  async getAllPatients(ctx,args){
    const iter = await ctx.stub.getStateByRange('patient-','patient-~');
    const results = [];
    for await(const r of iter){ try{ results.push(JSON.parse(r.value.value.toString('utf8'))); }catch(e){} }
    return stringify(results);
  }

  async getAllAgents(ctx,args){
    const iter = await ctx.stub.getStateByRange('agent-','agent-~');
    const results = [];
    for await(const r of iter){ try{ results.push(JSON.parse(r.value.value.toString('utf8'))); }catch(e){} }
    return stringify(results);
  }

  async assignDoctorToHospital(ctx,args){
    const { doctorId, hospitalId } = JSON.parse(args);
    const { role, uuid } = this.getCallerAttributes(ctx);
    if(role !== 'hospital') throw new Error('Only hospital admin can assign doctors');
    const docKey = `doctor-${doctorId}`;
    const docBytes = await ctx.stub.getState(docKey);
    if(!docBytes || !docBytes.length) throw new Error(`Doctor ${doctorId} not found`);
    const doctor = JSON.parse(docBytes.toString());
    const oldHospitalId = doctor.hospitalId;
    doctor.hospitalId = hospitalId;
    doctor.updatedAt = new Date().toISOString();
    await ctx.stub.putState(docKey, Buffer.from(stringify(doctor)));
    
    // Update hospital doctors list
    if(oldHospitalId && oldHospitalId !== hospitalId){
      const oldHospDoctorsKey = `hospitalDoctors-${oldHospitalId}`;
      const oldListBytes = await ctx.stub.getState(oldHospDoctorsKey);
      if(oldListBytes && oldListBytes.length){
        let oldList = JSON.parse(oldListBytes.toString());
        const idx = oldList.indexOf(doctorId);
        if(idx !== -1) oldList.splice(idx,1);
        await ctx.stub.putState(oldHospDoctorsKey, Buffer.from(JSON.stringify(oldList)));
      }
    }
    const hospDoctorsKey = `hospitalDoctors-${hospitalId}`;
    let list = []; const listBytes = await ctx.stub.getState(hospDoctorsKey);
    if(listBytes && listBytes.length) list = JSON.parse(listBytes.toString());
    if(!list.includes(doctorId)) list.push(doctorId);
    await ctx.stub.putState(hospDoctorsKey, Buffer.from(JSON.stringify(list)));
    return stringify(doctor);
  }

  async assignAgentToInsurance(ctx,args){
    const { agentId, insuranceId } = JSON.parse(args);
    const { role, uuid } = this.getCallerAttributes(ctx);
    if(role !== 'insuranceAdmin') throw new Error('Only insurance admin can assign agents');
    const agentKey = `agent-${agentId}`;
    const agentBytes = await ctx.stub.getState(agentKey);
    if(!agentBytes || !agentBytes.length) throw new Error(`Agent ${agentId} not found`);
    const agent = JSON.parse(agentBytes.toString());
    const oldInsuranceId = agent.insuranceId;
    agent.insuranceId = insuranceId;
    agent.updatedAt = new Date().toISOString();
    await ctx.stub.putState(agentKey, Buffer.from(stringify(agent)));
    
    // Update insurance agents list
    if(oldInsuranceId && oldInsuranceId !== insuranceId){
      const oldAgentsKey = `insuranceAgents-${oldInsuranceId}`;
      const oldListBytes = await ctx.stub.getState(oldAgentsKey);
      if(oldListBytes && oldListBytes.length){
        let oldList = JSON.parse(oldListBytes.toString());
        const idx = oldList.indexOf(agentId);
        if(idx !== -1) oldList.splice(idx,1);
        await ctx.stub.putState(oldAgentsKey, Buffer.from(JSON.stringify(oldList)));
      }
    }
    const agentsKey = `insuranceAgents-${insuranceId}`;
    let list = []; const listBytes = await ctx.stub.getState(agentsKey);
    if(listBytes && listBytes.length) list = JSON.parse(listBytes.toString());
    if(!list.includes(agentId)) list.push(agentId);
    await ctx.stub.putState(agentsKey, Buffer.from(JSON.stringify(list)));
    return stringify(agent);
  }

  async updateClaimDocuments(ctx,args){
    const { claimId, documents } = JSON.parse(args);
    const { role, uuid } = this.getCallerAttributes(ctx);
    if(role !== 'patient') throw new Error('Only patient can update claim documents');
    const claimKey = `claim-${claimId}`;
    const claimBytes = await ctx.stub.getState(claimKey);
    if(!claimBytes || !claimBytes.length) throw new Error('Claim not found');
    const claim = JSON.parse(claimBytes.toString());
    if(claim.patientId !== uuid) throw new Error('Caller not owner');
    claim.documents = documents || [];
    claim.updatedAt = new Date().toISOString();
    claim.history = claim.history || [];
    claim.history.push({ at: claim.updatedAt, by: uuid, action: 'DOCUMENTS_UPDATED' });
    await ctx.stub.putState(claimKey, Buffer.from(JSON.stringify(claim)));
    return stringify(claim);
  }

  async getClaimsByDoctor(ctx,args){
    const { doctorId } = JSON.parse(args);
    const iter = await ctx.stub.getStateByRange('claim-','claim-~');
    const results = [];
    for await(const r of iter){
      try{
        const v = JSON.parse(r.value.value.toString('utf8'));
        if(v.doctorId === doctorId) results.push(v);
      }catch(e){}
    }
    return stringify(results);
  }

  async getClaimsByHospital(ctx,args){
    const { hospitalId } = JSON.parse(args);
    const iter = await ctx.stub.getStateByRange('claim-','claim-~');
    const results = [];
    for await(const r of iter){
      try{
        const v = JSON.parse(r.value.value.toString('utf8'));
        if(v.hospitalId === hospitalId) results.push(v);
      }catch(e){}
    }
    return stringify(results);
  }

  async deleteUser(ctx,args){
    const { userId } = JSON.parse(args);
    const { role } = this.getCallerAttributes(ctx);
    if(role !== 'hospital') throw new Error('Only hospital admin can delete users');
    
    // Try to delete from different user types
    const keys = [`patient-${userId}`, `doctor-${userId}`, `agent-${userId}`];
    let deleted = false;
    for(const key of keys){
      const bytes = await ctx.stub.getState(key);
      if(bytes && bytes.length){
        await ctx.stub.deleteState(key);
        deleted = true;
        break;
      }
    }
    if(!deleted) throw new Error(`User ${userId} not found`);
    return stringify({ message: `User ${userId} deleted successfully` });
  }

  async fetchLedger(ctx){
    const { role } = this.getCallerAttributes(ctx);
    if(role !== 'hospital') throw new Error('Only hospital role can fetch full ledger');
    const results = []; const iterator = await ctx.stub.getStateByRange('',''); let res = await iterator.next();
    while(!res.done){ const sv = Buffer.from(res.value.value.toString()).toString('utf8'); try{ results.push(JSON.parse(sv)); }catch(e){ results.push(sv); } res = await iterator.next(); } return stringify(results);
  }

  async queryHistoryOfAsset(ctx,args){
    const { assetId } = JSON.parse(args);
    if (!assetId) throw new Error('assetId is required');
    const iterator = await ctx.stub.getHistoryForKey(assetId);
    const out = [];
    try {
      while(true) {
        const r = await iterator.next();
        if(r.value) {
          const tx = {
            txId: r.value.txId,
            timestamp: r.value.timestamp ? r.value.timestamp.toISOString() : null,
            isDelete: r.value.isDelete
          };
          try {
            if(r.value.value && r.value.value.length && !r.value.isDelete) {
              tx.asset = JSON.parse(r.value.value.toString('utf8'));
            }
          } catch(e) {
            tx.asset = null;
          }
          out.push(tx);
        }
        if(r.done) {
          break;
        }
      }
    } finally {
      await iterator.close();
    }
    return stringify(out);
  }

  async getByKey(ctx,args){
    const { key } = JSON.parse(args); const bytes = await ctx.stub.getState(key); if(!bytes || !bytes.length) throw new Error(`Key ${key} not found`); return bytes.toString();
  }

  async queryByCouch(ctx,args){
    const { query } = JSON.parse(args); if(!query) throw new Error('Query required'); const iter = await ctx.stub.getQueryResult(query); const results = [];
    for await(const r of iter){ try{ results.push(JSON.parse(r.value.toString('utf8'))); }catch(e){ results.push(r.value.toString('utf8')); } } return stringify(results);
  }
}

module.exports = ehrChainCode;
