# API Execution Order Guide

This document provides the **correct order of execution** for all APIs to ensure proper setup and avoid UUID/roles errors.

## Prerequisites

1. **Fabric Network Running**: Ensure Hyperledger Fabric test-network is running
2. **System Admins Enrolled**: `hospitalAdmin` and `insuranceAdmin` must be enrolled in the wallet (run `enrollAdmin.js` scripts)

---

## Execution Order

### Phase 1: Initial Setup (System Admins)

**Note**: The first hospital admin and insurance admin should be registered manually via scripts or using the system admin credentials.

#### 1.1 Register First Hospital Admin
**POST** `/auth/registerHospitalAdmin`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "adminId": "hospitalAdmin",
  "userId": "Hospital01",
  "hospitalId": "Hospital01",
  "name": "City General Hospital",
  "address": "123 Main St, City, State"
}
```

**What this does:**
- Registers and enrolls `Hospital01` with `role='hospital'` and `uuid='Hospital01'` attributes
- Onboards the hospital on the blockchain

---

#### 1.2 Register First Insurance Admin
**POST** `/auth/registerInsuranceAdmin`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "adminId": "insuranceAdmin",
  "userId": "Insurance01",
  "insuranceId": "Insurance01",
  "name": "Health Insurance Co",
  "address": "456 Insurance Ave, City, State"
}
```

**What this does:**
- Registers and enrolls `Insurance01` with `role='insuranceAdmin'` and `uuid='Insurance01'` attributes
- Onboards the insurance company on the blockchain

---

### Phase 2: Register Additional Admins (Optional)

#### 2.1 Register Additional Hospital Admin
**POST** `/auth/registerHospitalAdmin`

**Headers:**
```
Content-Type: application/json
x-userid: Hospital01
```

**Body:**
```json
{
  "adminId": "Hospital01",
  "userId": "Hospital02",
  "hospitalId": "Hospital02",
  "name": "Regional Medical Center",
  "address": "789 Health Blvd, City, State"
}
```

---

#### 2.2 Register Additional Insurance Admin
**POST** `/auth/registerInsuranceAdmin`

**Headers:**
```
Content-Type: application/json
x-userid: Insurance01
```

**Body:**
```json
{
  "adminId": "Insurance01",
  "userId": "Insurance02",
  "insuranceId": "Insurance02",
  "name": "Premium Insurance Co",
  "address": "321 Coverage St, City, State"
}
```

---

### Phase 3: Onboard Doctors

#### 3.1 Register and Onboard Doctor (Recommended)
**POST** `/auth/registerDoctor`

**Headers:**
```
Content-Type: application/json
x-userid: Hospital01
```

**Body:**
```json
{
  "adminId": "Hospital01",
  "doctorId": "doctor01",
  "hospitalId": "Hospital01",
  "name": "Dr. Jane Smith",
  "city": "New York"
}
```

**What this does:**
- Registers and enrolls `doctor01` with `role='doctor'` and `uuid='doctor01'` attributes
- Onboards the doctor on the blockchain
- Assigns doctor to hospital

**Alternative**: If doctor is already registered, use `/admin/hospital/doctor/add` to just onboard.

---

### Phase 4: Onboard Insurance Agents

#### 4.1 Register and Onboard Insurance Agent
**POST** `/auth/registerInsuranceAgent`

**Headers:**
```
Content-Type: application/json
x-userid: Insurance01
```

**Body:**
```json
{
  "adminId": "Insurance01",
  "agentId": "agent01",
  "insuranceId": "Insurance01",
  "name": "Agent John",
  "city": "New York"
}
```

**What this does:**
- Registers and enrolls `agent01` with `role='insuranceAgent'` and `uuid='agent01'` attributes
- Onboards the agent on the blockchain
- Assigns agent to insurance company

---

### Phase 5: Register Patients

#### 5.1 Register Patient
**POST** `/auth/registerPatient`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "adminId": "hospitalAdmin",
  "userId": "patient01",
  "name": "John Doe",
  "dob": "01/01/1990",
  "city": "New York"
}
```

**What this does:**
- Registers and enrolls `patient01` with `role='patient'` and `uuid='patient01'` attributes
- Onboards the patient on the blockchain

---

### Phase 6: Login Users (Optional - for verification)

#### 6.1 Login Patient
**POST** `/auth/loginPatient`

**Body:**
```json
{
  "userId": "patient01"
}
```

---

### Phase 7: Hospital Admin Operations

All these APIs require `x-userid: Hospital01` (or your hospital admin ID) header.

#### 7.1 Add Doctor (if already registered)
**POST** `/admin/hospital/doctor/add`

**Headers:**
```
Content-Type: application/json
x-userid: Hospital01
```

**Body:**
```json
{
  "doctorId": "doctor02",
  "hospitalId": "Hospital01",
  "name": "Dr. Bob Johnson",
  "city": "Boston"
}
```

**Note**: Use this only if doctor is already registered. Otherwise use `/auth/registerDoctor`.

---

#### 7.2 Assign Doctor to Hospital
**POST** `/admin/hospital/doctor/assign`

**Headers:**
```
Content-Type: application/json
x-userid: Hospital01
```

**Body:**
```json
{
  "doctorId": "doctor01",
  "hospitalId": "Hospital01"
}
```

---

#### 7.3 List All Hospitals
**GET** `/admin/hospitals`

**Headers:**
```
x-userid: Hospital01
```

---

#### 7.4 List All Doctors
**GET** `/admin/doctors`

**Headers:**
```
x-userid: Hospital01
```

---

#### 7.5 List All Users
**GET** `/admin/users`

**Headers:**
```
x-userid: Hospital01
```

---

#### 7.6 Delete User
**DELETE** `/admin/user/:userId`

**Headers:**
```
x-userid: Hospital01
```

**Example:** `DELETE /admin/user/patient01`

---

### Phase 8: Insurance Admin Operations

All these APIs require `x-userid: Insurance01` (or your insurance admin ID) header.

#### 8.1 Add Insurance Agent (if already registered)
**POST** `/admin/insurance/agent/add`

**Headers:**
```
Content-Type: application/json
x-userid: Insurance01
```

**Body:**
```json
{
  "agentId": "agent02",
  "insuranceId": "Insurance01",
  "name": "Agent Mary",
  "city": "Los Angeles"
}
```

---

#### 8.2 Assign Agent to Insurance
**POST** `/admin/insurance/agent/assign`

**Headers:**
```
Content-Type: application/json
x-userid: Insurance01
```

**Body:**
```json
{
  "agentId": "agent01",
  "insuranceId": "Insurance01"
}
```

---

### Phase 9: Patient Operations

All these APIs require `x-userid: patient01` (or your patient ID) header.

#### 9.1 Submit Insurance Claim
**POST** `/patient/claim/submit`

**Headers:**
```
Content-Type: application/json
x-userid: patient01
```

**Body:**
```json
{
  "doctorId": "doctor01",
  "policyId": "POL-001",
  "hospitalId": "Hospital01",
  "claimAmount": 5000,
  "medicalRecordIds": ["R-abc123"],
  "claimType": "medical",
  "description": "Emergency surgery",
  "documents": [
    {
      "type": "invoice",
      "url": "https://example.com/invoice.pdf"
    }
  ]
}
```

---

#### 9.2 Update Claim Documents
**POST** `/patient/claim/updateDocuments`

**Headers:**
```
Content-Type: application/json
x-userid: patient01
```

**Body:**
```json
{
  "claimId": "CLAIM-xxx",
  "documents": [
    {
      "type": "receipt",
      "url": "https://example.com/receipt.pdf"
    }
  ]
}
```

---

#### 9.3 Grant Doctor Access
**POST** `/patient/grantAccess`

**Headers:**
```
Content-Type: application/json
x-userid: patient01
```

**Body:**
```json
{
  "doctorId": "doctor01"
}
```

---

#### 9.4 Revoke Doctor Access
**POST** `/patient/revokeAccess`

**Headers:**
```
Content-Type: application/json
x-userid: patient01
```

**Body:**
```json
{
  "doctorId": "doctor01"
}
```

---

#### 9.5 Get Patient Claims
**GET** `/patient/patient01/claims`

**Headers:**
```
x-userid: patient01
```

---

#### 9.6 Get Patient Records
**GET** `/patient/patient01/records`

**Headers:**
```
x-userid: patient01
```

---

#### 9.7 Get Patient Profile
**GET** `/patient/patient01/profile`

**Headers:**
```
x-userid: patient01
```

---

### Phase 10: Doctor Operations

All these APIs require `x-userid: doctor01` (or your doctor ID) header.

#### 10.1 Add Medical Record
**POST** `/doctor/addRecord`

**Headers:**
```
Content-Type: application/json
x-userid: doctor01
```

**Body:**
```json
  {
    "patientId": "patient01",
    "diagnosis": "Fever",
    "treatment": "Prescribed medication",
    "notes": "Patient responded well"
  }
```

---

#### 10.2 Verify Claim
**POST** `/doctor/claim/verify`

**Headers:**
```
Content-Type: application/json
x-userid: doctor01
```

**Body:**
```json
  {
    "claimId": "CLAIM-xxx",
    "verified": true,
    "notes": "Claim is valid"
  }
```

---

#### 10.3 Get Patient Records (Doctor View)
**GET** `/doctor/records/patient01`

**Headers:**
```
x-userid: doctor01
```

---

#### 10.4 Get Doctor's Patients
**GET** `/doctor/doctor01/patients`

**Headers:**
```
x-userid: doctor01
```

---

#### 10.5 Get Doctor Profile
**GET** `/doctor/doctor01/profile`

**Headers:**
```
x-userid: doctor01
```

---

### Phase 11: Insurance Agent Operations

All these APIs require `x-userid: agent01` (or your agent ID) header.

#### 11.1 Review Claim
**POST** `/insurance/claim/review`

**Headers:**
```
Content-Type: application/json
x-userid: agent01
```

**Body:**
```json
{
  "claimId": "CLAIM-xxx",
  "reviewNotes": "Documents verified"
}
```

---

#### 11.2 Approve Claim
**POST** `/insurance/claim/approve`

**Headers:**
```
Content-Type: application/json
x-userid: agent01
```

**Body:**
```json
{
  "claimId": "CLAIM-xxx",
  "approvedAmount": 4500,
  "notes": "Approved with deduction"
}
```

---

#### 11.3 Reject Claim
**POST** `/insurance/claim/reject`

**Headers:**
```
Content-Type: application/json
x-userid: agent01
```

**Body:**
```json
{
  "claimId": "CLAIM-xxx",
  "rejectionReason": "Insufficient documentation"
}
```

---

#### 11.4 Get Claim Details
**GET** `/insurance/claim/CLAIM-xxx`

**Headers:**
```
x-userid: agent01
```

---

#### 11.5 Get Claim Records
**GET** `/insurance/claim/CLAIM-xxx/records`

**Headers:**
```
x-userid: agent01
```

---

#### 11.6 Get Agent Profile
**GET** `/insurance/agent/agent01/profile`

**Headers:**
```
x-userid: agent01
```

---

### Phase 12: Claims Queries

#### 12.1 Get Claims by Status
**GET** `/claims/byStatus?status=pending`

**Headers:**
```
x-userid: agent01
```

**Status values:** `pending`, `verified`, `reviewed`, `approved`, `rejected`

---

#### 12.2 Get Claims by Patient
**GET** `/claims/byPatient/patient01`

**Headers:**
```
x-userid: patient01
```

---

#### 12.3 Get Claims by Doctor
**GET** `/claims/byDoctor/doctor01`

**Headers:**
```
x-userid: doctor01
```

---

#### 12.4 Get Claims by Hospital
**GET** `/claims/byHospital/Hospital01`

**Headers:**
```
x-userid: Hospital01
```

---

### Phase 13: Ledger Operations

#### 13.1 Fetch Entire Ledger
**POST** `/ledger/fetch`

**Headers:**
```
  e: application/json
x-userid: Hospital01
```

**Body:**
```json
{}
```

---

#### 13.2 Get Asset History
**GET** `/ledger/history/patient01`

**Headers:**
```
x-userid: Hospital01
```

---

## Important Notes

### 1. UUID/Roles Error Fix
If you get "Missing uuid/roles" errors:
- **Cause**: User was not registered with attributes properly
- **Solution**: Re-register the user using the appropriate registration endpoint
- The registration endpoints automatically add `role` and `uuid` attributes during enrollment

### 2. Header Requirements
- **All authenticated endpoints** require `x-userid` header
- **Registration endpoints** may or may not require `x-userid` depending on whether they need an existing admin

### 3. Registration vs Onboarding
- **Registration**: Creates user identity in wallet with attributes (`/auth/register*`)
- **Onboarding**: Adds user to blockchain ledger (`/admin/*/add`)
- **Use registration endpoints** for new users (they do both)
- **Use admin add endpoints** only if user is already registered

### 4. Admin ID in Body
- `registerHospitalAdmin` and `registerInsuranceAdmin` require `adminId` in body
- For first admin, use system admin (`hospitalAdmin` or `insuranceAdmin`)
- For subsequent admins, use existing admin ID

### 5. Order Matters
- Always register admins before users
- Register doctors before assigning them
- Register patients before submitting claims
- Complete registration before attempting operations

---

## Quick Reference: Minimum Setup

For a working system, execute in this order:

1. Register first hospital admin: `POST /auth/registerHospitalAdmin` (with `adminId: "hospitalAdmin"`)
2. Register first insurance admin: `POST /auth/registerInsuranceAdmin` (with `adminId: "insuranceAdmin"`)
3. Register doctor: `POST /auth/registerDoctor` (with `x-userid: Hospital01`)
4. Register patient: `POST /auth/registerPatient` (with `adminId: "hospitalAdmin"`)
5. Register agent: `POST /auth/registerInsuranceAgent` (with `x-userid: Insurance01`)

After this, all other operations should work!

