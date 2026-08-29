# Registration Fix for Doctor and Insurance Agent

## Issues Fixed

1. **UUID and Role Missing**: Fixed by ensuring attributes are properly set during enrollment
2. **Authorization Failed**: Fixed by using the correct adminId (from header or body) with proper role
3. **userId Missing**: Fixed by supporting both `doctorId`/`agentId` and `userId` in request body

## Changes Made

### 1. `registerDoctor` Endpoint
- Now accepts both `doctorId` and `userId` in request body
- Uses `req.user.id` from `x-userid` header (via requireUser middleware) as `adminId`
- Falls back to `adminId` from body if header not available
- Better error messages

### 2. `registerInsuranceAgent` Endpoint
- Now accepts both `agentId` and `userId` in request body
- Uses `req.user.id` from `x-userid` header (via requireUser middleware) as `adminId`
- Falls back to `adminId` from body if header not available
- Uses `org2` for insurance-related transactions
- Better error messages

## Postman Request Bodies

### Register Doctor

**Endpoint:** `POST /auth/registerDoctor`

**Headers:**
```
Content-Type: application/json
x-userid: Hospital01
```

**Important:** 
- The `x-userid` header must be a registered **hospital admin** (e.g., `Hospital01`)
- The hospital admin must have `role='hospital'` and `uuid` attributes in their certificate
- This is the admin making the request (must be registered first using `/auth/registerHospitalAdmin`)

**Request Body (Option 1 - using doctorId):**
```json
{
  "adminId": "Hospital01",
  "doctorId": "doctor01",
  "hospitalId": "Hospital01",
  "name": "Dr. Jane Smith",
  "city": "New York"
}
```

**Request Body (Option 2 - using userId):**
```json
{
  "adminId": "Hospital01",
  "userId": "doctor01",
  "hospitalId": "Hospital01",
  "name": "Dr. Jane Smith",
  "city": "New York"
}
```

**Request Body (Option 3 - adminId from header only):**
```json
{
  "doctorId": "doctor01",
  "hospitalId": "Hospital01",
  "name": "Dr. Jane Smith",
  "city": "New York"
}
```

**Note:** If `x-userid` header is provided, `adminId` in body is optional (will use header value).

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "doctorId": "doctor01",
    "userId": "doctor01",
    "chaincodeResult": "..."
  }
}
```

---

### Register Insurance Agent

**Endpoint:** `POST /auth/registerInsuranceAgent`

**Headers:**
```
Content-Type: application/json
x-userid: Insurance01
```

**Important:** 
- The `x-userid` header must be a registered **insurance admin** (e.g., `Insurance01`)
- The insurance admin must have `role='insuranceAdmin'` and `uuid` attributes in their certificate
- This is the admin making the request (must be registered first using `/auth/registerInsuranceAdmin`)

**Request Body (Option 1 - using agentId):**
```json
{
  "adminId": "Insurance01",
  "agentId": "agent01",
  "insuranceId": "Insurance01",
  "name": "Agent John",
  "city": "New York"
}
```

**Request Body (Option 2 - using userId):**
```json
{
  "adminId": "Insurance01",
  "userId": "agent01",
  "insuranceId": "Insurance01",
  "name": "Agent John",
  "city": "New York"
}
```

**Request Body (Option 3 - adminId from header only):**
```json
{
  "agentId": "agent01",
  "insuranceId": "Insurance01",
  "name": "Agent John",
  "city": "New York"
}
```

**Note:** If `x-userid` header is provided, `adminId` in body is optional (will use header value).

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "agentId": "agent01",
    "userId": "agent01",
    "chaincodeResult": "..."
  }
}
```

---

## Prerequisites

### Before Registering a Doctor:

1. **Register Hospital Admin first:**
   ```bash
   POST /auth/registerHospitalAdmin
   Headers: Content-Type: application/json
   Body:
   {
     "adminId": "hospitalAdmin",
     "userId": "Hospital01",
     "hospitalId": "Hospital01",
     "name": "City General Hospital",
     "address": "123 Main St, City, State"
   }
   ```

2. **Then register doctor:**
   ```bash
   POST /auth/registerDoctor
   Headers: 
     Content-Type: application/json
     x-userid: Hospital01
   Body:
   {
     "adminId": "Hospital01",
     "doctorId": "doctor01",
     "hospitalId": "Hospital01",
     "name": "Dr. Jane Smith",
     "city": "New York"
   }
   ```

### Before Registering an Insurance Agent:

1. **Register Insurance Admin first:**
   ```bash
   POST /auth/registerInsuranceAdmin
   Headers: Content-Type: application/json
   Body:
   {
     "adminId": "insuranceAdmin",
     "userId": "Insurance01",
     "insuranceId": "Insurance01",
     "name": "Health Insurance Co",
     "address": "456 Insurance Ave, City, State"
   }
   ```

2. **Then register insurance agent:**
   ```bash
   POST /auth/registerInsuranceAgent
   Headers: 
     Content-Type: application/json
     x-userid: Insurance01
   Body:
   {
     "adminId": "Insurance01",
     "agentId": "agent01",
     "insuranceId": "Insurance01",
     "name": "Agent John",
     "city": "New York"
   }
   ```

---

## Common Errors and Solutions

### Error: "Missing role or uuid in client certificate attributes"

**Cause:** The `adminId` (hospital/insurance admin) doesn't have proper attributes in their certificate.

**Solution:**
1. Re-register the hospital/insurance admin using the registration endpoint
2. Ensure the admin was registered with attributes (should be automatic)
3. Check that the `x-userid` header matches a registered admin ID

### Error: "Only hospital admin can onboard doctors"

**Cause:** The `adminId` being used doesn't have `role='hospital'` in their certificate.

**Solution:**
1. Ensure you're using a hospital admin ID (not `hospitalAdmin` system admin)
2. The hospital admin must be registered using `/auth/registerHospitalAdmin`
3. Use the hospital admin ID (e.g., `Hospital01`) in both `x-userid` header and `adminId` in body

### Error: "Only insurance admin can onboard agents"

**Cause:** The `adminId` being used doesn't have `role='insuranceAdmin'` in their certificate.

**Solution:**
1. Ensure you're using an insurance admin ID (not `insuranceAdmin` system admin)
2. The insurance admin must be registered using `/auth/registerInsuranceAdmin`
3. Use the insurance admin ID (e.g., `Insurance01`) in both `x-userid` header and `adminId` in body

### Error: "User identity not found in wallet"

**Cause:** The user ID in `x-userid` header doesn't exist in the wallet.

**Solution:**
1. Register the hospital/insurance admin first
2. Ensure the `x-userid` header matches the registered admin ID exactly
3. Check wallet folder: `server-node-sdk/wallet/`

### Error: "Missing required fields"

**Cause:** Required fields are missing from request body.

**Solution:**
- For doctor: Ensure `adminId` (or `x-userid` header), `doctorId`/`userId`, `hospitalId`, `name`, `city` are provided
- For agent: Ensure `adminId` (or `x-userid` header), `agentId`/`userId`, `insuranceId`, `name`, `city` are provided

---

## Testing Checklist

- [ ] Hospital admin is registered with `role='hospital'` and `uuid` attributes
- [ ] Insurance admin is registered with `role='insuranceAdmin'` and `uuid` attributes
- [ ] `x-userid` header contains the correct admin ID
- [ ] Request body contains all required fields
- [ ] `adminId` in body matches `x-userid` header (or omit `adminId` to use header value)
- [ ] Hospital/insurance IDs match existing registered admins

---

## Summary

The key fixes:
1. ✅ Support for both `doctorId`/`agentId` and `userId` in request body
2. ✅ Use authenticated user from `x-userid` header as `adminId`
3. ✅ Better error messages indicating what's missing
4. ✅ Proper organization (org1 for doctors, org2 for agents)
5. ✅ Chaincode validates that caller has correct role (hospital/insuranceAdmin)

The registration flow now:
1. Register hospital/insurance admin first
2. Use that admin's ID in `x-userid` header
3. Register doctor/agent with proper attributes
4. Chaincode validates the admin has correct role before allowing registration

