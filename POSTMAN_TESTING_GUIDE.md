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
x-userid: hospitalAdmin
```

**Body:**
```json
{
  "userId": "hospitalAdmin02",
  "hospitalId": "Hospital01",
  "name": "City General Hospital",
  "address": "123 Main St, City, State"
}
```

---

### 1.4 Register Insurance Admin
**POST** `/auth/registerInsuranceAdmin`

**Headers:**
```
Content-Type: application/json
x-userid: insuranceAdmin
```

**Body:**
```json
{
  "userId": "insuranceAdmin01",
  "insuranceId": "Insurance01",
  "name": "Health Insurance Co",
  "address": "456 Insurance Ave, City, State"
}
```

---

### 1.5 Register Doctor
**POST** `/auth/registerDoctor`

**Headers:**
```
Content-Type: application/json
x-userid: hospitalAdmin
```

**Body:**
```json
{
  "adminId": "hospitalAdmin",
  "doctorId": "doctor01",
  "hospitalId": "Hospital01",
  "name": "Dr. Jane Smith",
  "city": "New York"
}
```

---

### 1.6 Register Insurance Agent
**POST** `/auth/registerInsuranceAgent`

**Headers:**
```
Content-Type: application/json
x-userid: insuranceAdmin
```

**Body:**
```json
{
  "adminId": "insuranceAdmin01",
  "agentId": "agent01",
  "insuranceId": "Insurance01",
  "name": "Agent John",
  "city": "New York"
}
```

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
x-userid: hospitalAdmin
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

---

### 5.2 Assign Doctor to Hospital
**POST** `/admin/hospital/doctor/assign`

**Headers:**
```
Content-Type: application/json
x-userid: hospitalAdmin
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
x-userid: insuranceAdmin
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

---

### 5.4 Assign Agent to Insurance
**POST** `/admin/insurance/agent/assign`

**Headers:**
```
Content-Type: application/json
x-userid: insuranceAdmin
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
x-userid: hospitalAdmin
```

---

### 5.6 List All Doctors
**GET** `/admin/doctors`

**Headers:**
```
x-userid: hospitalAdmin
```

---

### 5.7 List All Users
**GET** `/admin/users`

**Headers:**
```
x-userid: hospitalAdmin
```

---

### 5.8 Delete User
**DELETE** `/admin/user/:userId`

**Headers:**
```
x-userid: hospitalAdmin
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
x-userid: hospitalAdmin
```

**Example:** `GET /claims/byHospital/Hospital01`

---

## 7. Ledger APIs (`/ledger`)

### 7.1 Fetch Entire Ledger
**POST** `/ledger/fetch`

**Headers:**
```
Content-Type: application/json
x-userid: hospitalAdmin
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
x-userid: hospitalAdmin
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

### Step 1: Setup (Run once)
1. Register Hospital Admin: `POST /auth/registerHospitalAdmin`
2. Register Insurance Admin: `POST /auth/registerInsuranceAdmin`

### Step 2: Register Users
1. Register Patient: `POST /auth/registerPatient`
2. Register Doctor: `POST /auth/registerDoctor`
3. Register Insurance Agent: `POST /auth/registerInsuranceAgent`

### Step 3: Login
1. Login Patient: `POST /auth/loginPatient`

### Step 4: Create Medical Records
1. Add Record: `POST /doctor/addRecord` (as doctor)

### Step 5: Submit and Process Claims
1. Submit Claim: `POST /patient/claim/submit` (as patient)
2. Verify Claim: `POST /doctor/claim/verify` (as doctor)
3. Review Claim: `POST /insurance/claim/review` (as agent)
4. Approve/Reject Claim: `POST /insurance/claim/approve` or `/insurance/claim/reject` (as agent)

---

## Common Issues and Solutions

### Issue: "Missing userId" error
**Solution:** Add `x-userid` header with a valid user ID that exists in the wallet.

### Issue: "User identity not found in wallet"
**Solution:** Register the user first using the appropriate registration endpoint.

### Issue: "Missing uuid and roles" error
**Solution:** 
1. Ensure users are registered with proper attributes (role and uuid)
2. The registration endpoints automatically add these attributes
3. If the error persists, re-register the user

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
hospital_admin: hospitalAdmin
insurance_admin: insuranceAdmin
```

Then use them in requests like: `{{base_url}}/auth/registerPatient`

