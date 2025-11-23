# EHR Blockchain API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [Request/Response Examples](#requestresponse-examples)
6. [Error Handling](#error-handling)
7. [Testing Guide](#testing-guide)

---

## Overview

This API provides a RESTful interface to interact with the Electronic Health Record (EHR) blockchain system built on Hyperledger Fabric. The system manages patient records, medical claims, and insurance processing through a decentralized ledger.

### Base URL
```
http://localhost:5000
```

### Technology Stack
- **Backend**: Node.js with Express
- **Blockchain**: Hyperledger Fabric
- **Chaincode**: JavaScript (ehrChainCode)
- **Database**: CouchDB (for state database)

---

## Getting Started

### Prerequisites
1. Hyperledger Fabric network running
2. Chaincode deployed (`ehrChainCode`)
3. Node.js server running (`npm run dev`)
4. User identities registered in wallet

### Setup Steps

1. **Start Fabric Network**
   ```bash
   cd fabric-samples/test-network
   ./network.sh up createChannel -ca -s couchdb
   ./network.sh deployCC -ccn ehrChainCode -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript
   ```

2. **Register Admin Identities**
   ```bash
   cd server-node-sdk
   node cert-script/registerOrg1Admin.js
   node cert-script/registerOrg2Admin.js
   ```

3. **Onboard Entities**
   ```bash
   node cert-script/onboardHospital01.js
   node cert-script/onboardDoctor.js
   node cert-script/onboardInsuranceCompany.js
   node cert-script/onboardInsuranceAgent.js
   ```

4. **Start Server**
   ```bash
   npm run dev
   ```

---

## Authentication

### Authentication Method
All protected endpoints require user identification via one of the following methods:

1. **Header** (Recommended):
   ```
   x-userid: <userId>
   ```

2. **Request Body**:
   ```json
   {
     "userId": "<userId>"
   }
   ```

3. **Query Parameter**:
   ```
   ?userId=<userId>
   ```

### User Roles
- `patient` - Patients who can manage their records and submit claims
- `doctor` - Doctors who can add records and verify claims
- `hospital` - Hospital administrators who can onboard doctors
- `insuranceAdmin` - Insurance company administrators
- `insuranceAgent` - Insurance agents who process claims

### Role-Based Access Control
The chaincode enforces role-based access control. Each user's certificate contains role and uuid attributes that are validated on-chain.

---

## API Endpoints

### 1. Authentication APIs (`/auth`)

#### Register Patient
Register a new patient in the system.

**Endpoint:** `POST /auth/registerPatient`

**Authentication:** Not required

**Request Body:**
```json
{
  "adminId": "hospitalAdmin",
  "doctorId": "Doctor-Rama04",
  "userId": "patient01",
  "name": "John Doe",
  "dob": "01/01/1990",
  "city": "New York"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "patient01",
    "role": "patient",
    "message": "patient01 registered and enrolled successfully."
  }
}
```

---

#### Login Patient
Authenticate and retrieve patient information.

**Endpoint:** `POST /auth/loginPatient`

**Authentication:** Not required

**Request Body:**
```json
{
  "userId": "patient01"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "patient01",
    "role": "patient"
  }
}
```

---

#### Register Hospital Admin
Register a hospital administrator on the blockchain.

**Endpoint:** `POST /auth/registerHospitalAdmin`

**Authentication:** Required (hospital role)

**Request Body:**
```json
{
  "userId": "Hospital01",
  "hospitalId": "Hospital01",
  "name": "ABC Hospital",
  "address": "123 Medical Street, City"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hospitalId": "Hospital01",
    "name": "ABC Hospital",
    "address": "123 Medical Street, City",
    "adminId": "Hospital01",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### Register Insurance Admin
Register an insurance company administrator on the blockchain.

**Endpoint:** `POST /auth/registerInsuranceAdmin`

**Authentication:** Required (insuranceAdmin role)

**Request Body:**
```json
{
  "userId": "insuranceCompany01",
  "insuranceId": "insuranceCompany01",
  "name": "XYZ Insurance Company",
  "address": "456 Insurance Avenue, City"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "insuranceId": "insuranceCompany01",
    "name": "XYZ Insurance Company",
    "address": "456 Insurance Avenue, City",
    "adminId": "insuranceCompany01",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 2. Patient APIs (`/patient`)

#### Submit Insurance Claim
Submit a new insurance claim for processing.

**Endpoint:** `POST /patient/claim/submit`

**Authentication:** Required (patient role)

**Request Body:**
```json
{
  "doctorId": "Doctor-Rama04",
  "policyId": "POL123",
  "hospitalId": "Hospital01",
  "claimAmount": 5000,
  "medicalRecordIds": ["R-abc123", "R-def456"],
  "claimType": "Surgery",
  "description": "Emergency surgery performed",
  "documents": ["doc1.pdf", "doc2.pdf"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Claim submitted",
    "claim": {
      "claimId": "CLAIM-xyz789",
      "patientId": "patient01",
      "doctorId": "Doctor-Rama04",  
      "policyId": "POL123",
      "hospitalId": "Hospital01",
      "claimAmount": 5000,
      "medicalRecordIds": ["R-abc123", "R-def456"],
      "claimType": "Surgery",
      "description": "Emergency surgery performed",
      "documents": ["doc1.pdf", "doc2.pdf"],
      "status": "PENDING_DOCTOR_VERIFICATION",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "history": [
        {
          "at": "2024-01-01T00:00:00.000Z",
          "by": "patient01",
          "action": "SUBMITTED"
        }
      ]
    }
  }
}
```

---

#### Grant Doctor Access
Grant a doctor access to view patient records.

**Endpoint:** `POST /patient/grantAccess`

**Authentication:** Required (patient role, must be the patient themselves)

**Request Body:**
```json
{
  "doctorIdToGrant": "Doctor-Rama04"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Doctor Doctor-Rama04 authorized for patient patient01"
  }
}
```

---

#### Revoke Doctor Access
Revoke a doctor's access to patient records.

**Endpoint:** `POST /patient/revokeAccess`

**Authentication:** Required (patient role, must be the patient themselves)

**Request Body:**
```json
{
  "doctorIdToRevoke": "Doctor-Rama04"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Doctor Doctor-Rama04 revoked for patient patient01"
  }
}
```

---

#### Get Patient Claims
Retrieve all claims for a specific patient.

**Endpoint:** `GET /patient/:patientId/claims`

**Authentication:** Required (patient role)

**URL Parameters:**
- `patientId` - The patient ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "claimId": "CLAIM-xyz789",
      "patientId": "patient01",
      "status": "PENDING_DOCTOR_VERIFICATION",
      "claimAmount": 5000,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### Get Patient Records
Retrieve all medical records for a specific patient.

**Endpoint:** `GET /patient/:patientId/records`

**Authentication:** Required (patient role)

**URL Parameters:**
- `patientId` - The patient ID
Authentication APIs (/auth)
POST /auth/registerPatient
POST /auth/loginPatient
POST /auth/registerHospitalAdmin
POST /auth/registerInsuranceAdmin
Patient APIs (/patient)
POST /patient/claim/submit
POST /patient/grantAccess
POST /patient/revokeAccess
GET /patient/:patientId/claims
GET /patient/:patientId/records
Doctor APIs (/doctor)
POST /doctor/addRecord
POST /doctor/claim/verify
GET /doctor/:doctorId/patients
Insurance APIs (/insurance)
POST /insurance/claim/review
POST /insurance/claim/approve
POST /insurance/claim/reject
GET /insurance/claim/:claimId
Admin APIs (/admin)
POST /admin/hospital/doctor/add
POST /admin/insurance/agent/add
GET /admin/hospitals
GET /admin/doctors
Claims APIs (/claims)
GET /claims/byStatus?status=<status>
Ledger APIs (/ledger)
POST /ledger/fetch
GET /ledger/history/:assetId
Root
GET / - Health check
