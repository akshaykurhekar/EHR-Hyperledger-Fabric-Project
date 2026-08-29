# Postman API Testing Guide

## Base URL
```
http://localhost:5000
```

## Important Headers
All authenticated endpoints require:
```
x-userid: <userId>
Content-Type: application/json
```

---

## 1. Authentication APIs (`/auth`)

### 1.1 Register Patient
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

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "success": true,
    "userId": "patient01",
    "chaincodeResult": "..."
  }
}
```

---

### 1.2 Login Patient
**POST** `/auth/loginPatient`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "patient01"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "success": true,
    "userId": "patient01"
  }
}
```

---

### 1.3 Register Hospital Admin
**POST** `/auth/registerHospitalAdmin`

**Headers:**
```
Content-Type: application/json
```

**Note**: No `x-userid` header required. Uses `adminId` from body.

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
- For first hospital admin, use `adminId: "hospitalAdmin"` (system admin)
- For additional hospital admins, use existing hospital admin ID as `adminId`

---

### 1.4 Register Insurance Admin
**POST** `/auth/registerInsuranceAdmin`

**Headers:**
```
Content-Type: application/json
```

**Note**: No `x-userid` header required. Uses `adminId` from body.

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
- For first insurance admin, use `adminId: "insuranceAdmin"` (system admin)
- For additional insurance admins, use existing insurance admin ID as `adminId`

---

### 1.5 Register Doctor (Onboard Doctor)
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
- **Note**: Use hospital admin ID (e.g., `Hospital01`) as `adminId`, not `hospitalAdmin`

---

### 1.6 Register Insurance Agent (Onboard Agent)
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
- **Note**: Use insurance admin ID (e.g., `Insurance01`) as `adminId`, not `insuranceAdmin`

---

## 2. Patient APIs (`/patient`)

### 2.1 Submit Insurance Claim
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
  "medicalRecordIds": ["R-abc123", "R-def456"],
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

### 2.2 Update Claim Documents
**POST** `/patient/claim/updateDocuments`

**Headers:**
```
Content-Type: application/json
x-userid: patient01
```

**Body:**
```json
{
  "claimId": "CLAIM-001",
  "documents": [
    {
      "type": "invoice",
      "url": "https://example.com/invoice.pdf"
    },
    {
      "type": "receipt",
      "url": "https://example.com/receipt.pdf"
    }
  ]
}
```

---

### 2.3 Grant Doctor Access
**POST** `/patient/grantAccess`

**Headers:**
```
Content-Type: application/json
x-userid: patient01
```

**Body:**
```json
{
  "doctorIdToGrant": "doctor01"
}
```

---

### 2.4 Revoke Doctor Access
**POST** `/patient/revokeAccess`

**Headers:**
```
Content-Type: application/json
x-userid: patient01
```

**Body:**
```json
{
  "doctorIdToRevoke": "doctor01"
}
```

---

### 2.5 Get Patient Claims
**GET** `/patient/:patientId/claims`

**Headers:**
```
x-userid: patient01
```

**Example:** `GET /patient/patient01/claims`

---

### 2.6 Get Patient Records
**GET** `/patient/:patientId/records`

**Headers:**
```
x-userid: patient01
```

**Example:** `GET /patient/patient01/records`

---

### 2.7 Get Patient Profile
**GET** `/patient/:patientId/profile`

**Headers:**
```
x-userid: patient01
```

**Example:** `GET /patient/patient01/profile`

---

## 3. Doctor APIs (`/doctor`)

### 3.1 Add Medical Record
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
  "diagnosis": "Common cold",
  "prescription": "Rest, fluids, paracetamol 500mg",
  "notes": "Patient should follow up in 3 days if symptoms persist"
}
```

---

### 3.2 Verify Claim
**POST** `/doctor/claim/verify`

**Headers:**
```
Content-Type: application/json
x-userid: doctor01
```

**Body:**
```json
{
  "claimId": "CLAIM-001",
  "verified": true,
  "notes": "Medical records verified. Treatment was necessary."
}
```

---

### 3.3 Get Patient Records (Doctor View)
**GET** `/doctor/records/:patientId`

**Headers:**
```
x-userid: doctor01
```

**Example:** `GET /doctor/records/patient01`

---

### 3.4 Get Patients Assigned to Doctor
**GET** `/doctor/:doctorId/patients`

**Headers:**
```
x-userid: doctor01
```

**Example:** `GET /doctor/doctor01/patients`

---

### 3.5 Get Doctor Profile
**GET** `/doctor/:doctorId/profile`

**Headers:**
```
x-userid: doctor01
```

**Example:** `GET /doctor/doctor01/profile`

---

## 4. Insurance APIs (`/insurance`)

### 4.1 Review Claim
**POST** `/insurance/claim/review`

**Headers:**
```
Content-Type: application/json
x-userid: agent01
```

**Body:**
```json
{
  "claimId": "CLAIM-001",
  "notes": "Reviewing claim documents and medical records"
}
```

---

### 4.2 Approve Claim
**POST** `/insurance/claim/approve`

**Headers:**
```
Content-Type: application/json
x-userid: agent01
```

**Body:**
```json
{
  "claimId": "CLAIM-001",
  "approvedAmount": 4500,
  "notes": "Claim approved with 10% deduction for non-covered items"
}
```

---

### 4.3 Reject Claim
**POST** `/insurance/claim/reject`

**Headers:**
```
Content-Type: application/json
x-userid: agent01
```

**Body:**
```json
{
  "claimId": "CLAIM-001",
  "reason": "Treatment not covered under policy terms"
}
```

---

### 4.4 Get Claim Details
**GET** `/insurance/claim/:claimId`

**Headers:**
```
x-userid: agent01
```

**Example:** `GET /insurance/claim/CLAIM-001`

---

### 4.5 Get Records for Claim
**GET** `/insurance/claim/:claimId/records`

**Headers:**
```
x-userid: agent01
```

**Example:** `GET /insurance/claim/CLAIM-001/records`

---

### 4.6 Get Insurance Agent Profile
**GET** `/insurance/agent/:agentId/profile`

**Headers:**
```
x-userid: agent01
```

**Example:** `GET /insurance/agent/agent01/profile`

---

## 5. Admin APIs (`/admin`)

### 5.1 Add Doctor to Hospital
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
  "city": "New York"
}
```

**Note**: Use this endpoint only if doctor is already registered. Otherwise use `/auth/registerDoctor` which registers AND onboard the doctor.

---

### 5.2 Assign Doctor to Hospital
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

### 5.3 Add Insurance Agent
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
  "city": "New York"
}
```

**Note**: Use this endpoint only if agent is already registered. Otherwise use `/auth/registerInsuranceAgent` which registers AND onboard the agent.

---

### 5.4 Assign Agent to Insurance
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

### 5.5 List All Hospitals
**GET** `/admin/hospitals`

**Headers:**
```
x-userid: Hospital01
```

---

### 5.6 List All Doctors
**GET** `/admin/doctors`

**Headers:**
```
x-userid: Hospital01
```

---

### 5.7 List All Users
**GET** `/admin/users`

**Headers:**
```
x-userid: Hospital01
```

---

### 5.8 Delete User
**DELETE** `/admin/user/:userId`

**Headers:**
```
x-userid: Hospital01
```

**Example:** `DELETE /admin/user/patient01`

---

## 6. Claims APIs (`/claims`)

### 6.1 Get Claims by Status
**GET** `/claims/byStatus?status=<status>`

**Headers:**
```
x-userid: agent01
```

**Example:** `GET /claims/byStatus?status=pending`

**Status values:** `pending`, `verified`, `reviewed`, `approved`, `rejected`

---

### 6.2 Get Claims by Patient
**GET** `/claims/byPatient/:patientId`

**Headers:**
```
x-userid: patient01
```

**Example:** `GET /claims/byPatient/patient01`

---

### 6.3 Get Claims by Doctor
**GET** `/claims/byDoctor/:doctorId`

**Headers:**
```
x-userid: doctor01
```

**Example:** `GET /claims/byDoctor/doctor01`

---

### 6.4 Get Claims by Hospital
**GET** `/claims/byHospital/:hospitalId`

**Headers:**
```
x-userid: Hospital01
```

**Example:** `GET /claims/byHospital/Hospital01`

---

## 7. Ledger APIs (`/ledger`)

### 7.1 Fetch Entire Ledger
**POST** `/ledger/fetch`

**Headers:**
```
Content-Type: application/json
x-userid: Hospital01
```

**Body:**
```json
{}
```

---

### 7.2 Get Asset History
**GET** `/ledger/history/:assetId`

**Headers:**
```
x-userid: Hospital01
```

**Example:** `GET /ledger/history/patient01`

---

## 8. Root

### 8.1 Health Check
**GET** `/`

**No headers required**

**Response:** 200 OK
```json
{
  "status": "EHR Server Running"
}
```

---

## Testing Workflow

**⚠️ IMPORTANT: Follow this exact order to avoid UUID/roles errors!**

### Step 1: Setup (Run once - REQUIRED FIRST)
1. **Register First Hospital Admin**: `POST /auth/registerHospitalAdmin`
   - Body: `{ "adminId": "hospitalAdmin", "userId": "Hospital01", "hospitalId": "Hospital01", ... }`
   - This registers Hospital01 with proper role and uuid attributes

2. **Register First Insurance Admin**: `POST /auth/registerInsuranceAdmin`
   - Body: `{ "adminId": "insuranceAdmin", "userId": "Insurance01", "insuranceId": "Insurance01", ... }`
   - This registers Insurance01 with proper role and uuid attributes

### Step 2: Register Users (After Step 1)
1. **Register Doctor**: `POST /auth/registerDoctor`
   - Headers: `x-userid: Hospital01`
   - Body: `{ "adminId": "Hospital01", "doctorId": "doctor01", ... }`
   - This registers AND onboard the doctor

2. **Register Patient**: `POST /auth/registerPatient`
   - Body: `{ "adminId": "hospitalAdmin", "userId": "patient01", ... }`

3. **Register Insurance Agent**: `POST /auth/registerInsuranceAgent`
   - Headers: `x-userid: Insurance01`
   - Body: `{ "adminId": "Insurance01", "agentId": "agent01", ... }`
   - This registers AND onboard the agent

### Step 3: Login (Optional - for verification)
1. Login Patient: `POST /auth/loginPatient`

### Step 4: Create Medical Records
1. Add Record: `POST /doctor/addRecord` (as doctor)
   - Headers: `x-userid: doctor01`

### Step 5: Submit and Process Claims
1. Submit Claim: `POST /patient/claim/submit` (as patient)
   - Headers: `x-userid: patient01`
2. Verify Claim: `POST /doctor/claim/verify` (as doctor)
   - Headers: `x-userid: doctor01`
3. Review Claim: `POST /insurance/claim/review` (as agent)
   - Headers: `x-userid: agent01`
4. Approve/Reject Claim: `POST /insurance/claim/approve` or `/insurance/claim/reject` (as agent)
   - Headers: `x-userid: agent01`

**📋 For detailed execution order, see `API_EXECUTION_ORDER.md`**

---

## Common Issues and Solutions

### Issue: "Missing userId" error
**Solution:** Add `x-userid` header with a valid user ID that exists in the wallet.

### Issue: "User identity not found in wallet"
**Solution:** Register the user first using the appropriate registration endpoint.

### Issue: "Missing uuid and roles" error
**Solution:** 
1. **Root Cause**: User was not registered with attributes properly, or wrong userId is being used
2. **For Hospital Admin**: Make sure you registered using `/auth/registerHospitalAdmin` with `adminId` in body
3. **For Insurance Admin**: Make sure you registered using `/auth/registerInsuranceAdmin` with `adminId` in body
4. **For Doctors/Agents**: Use `/auth/registerDoctor` or `/auth/registerInsuranceAgent` which automatically add attributes
5. **Re-register**: If error persists, delete user from wallet and re-register using the appropriate registration endpoint
6. **Check Headers**: Ensure you're using the correct userId in `x-userid` header (e.g., `Hospital01` not `hospitalAdmin`)

### Issue: 401 Unauthorized
**Solution:** 
1. Check that `x-userid` header is set correctly
2. Verify the user exists in the wallet (use login endpoint first)
3. Ensure the user has the correct role for the endpoint

---

## Postman Collection Variables

Set these variables in your Postman environment:

```
base_url: http://localhost:5000
patient_id: patient01
doctor_id: doctor01
agent_id: agent01
hospital_admin_id: Hospital01
insurance_admin_id: Insurance01
```

Then use them in requests like: `{{base_url}}/auth/registerPatient`

