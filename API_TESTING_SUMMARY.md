# API Testing Summary

## What Was Fixed

### 1. Hospital Admin Registration (`controllers/authController.js`)
- **Before**: `registerHospitalAdmin` didn't register/enroll with attributes, causing "missing uuid/roles" errors
- **After**: 
  - Now properly registers and enrolls hospital admin with `role='hospital'` and `uuid` attributes
  - Uses `adminId` from request body (system admin or existing hospital admin)
  - Calls chaincode with the newly registered userId (not hardcoded)

### 2. Insurance Admin Registration (`controllers/authController.js`)
- **Before**: `registerInsuranceAdmin` didn't register/enroll with attributes
- **After**: 
  - Now properly registers and enrolls insurance admin with `role='insuranceAdmin'` and `uuid` attributes
  - Uses `adminId` from request body (system admin or existing insurance admin)

### 3. Admin Controller Fixes (`controllers/adminController.js`)
- **Before**: `addDoctor` and `addInsuranceAgent` used `JSON.stringify` incorrectly
- **After**: 
  - Fixed payload format to use objects (invoke.js handles stringification)
  - Added proper validation for required fields
  - Added comments clarifying when to use registration vs add endpoints

### 4. Route Updates (`routes/authRoutes.js`)
- Removed `requireUser` middleware from `registerHospitalAdmin` and `registerInsuranceAdmin`
- These endpoints now use `adminId` from body instead of header

### 5. Middleware Enhancement (`middleware/requireUser.js`)
- Validates user identity exists in wallet
- Extracts user information from certificate
- Provides better error messages
- Adds user context (uuid, role, mspId) to request object

## Files Created

1. **POSTMAN_TESTING_GUIDE.md** - Complete guide with all 39 endpoints, headers, and body examples (UPDATED)
2. **UUID_ROLES_FIX.md** - Troubleshooting guide for UUID/roles issues
3. **API_TESTING_SUMMARY.md** - This file
4. **API_EXECUTION_ORDER.md** - Comprehensive execution order guide with all APIs in correct sequence (NEW)

## Files Modified

1. **server-node-sdk/middleware/requireUser.js** - Enhanced to validate users and extract attributes
2. **server-node-sdk/controllers/authController.js** - Fixed hospital/insurance admin registration to include attributes
3. **server-node-sdk/controllers/adminController.js** - Fixed payload formats and added validation
4. **server-node-sdk/routes/authRoutes.js** - Removed requireUser from admin registration endpoints

## How to Use

### Quick Start
1. Import the Postman collection or use the guide in `POSTMAN_TESTING_GUIDE.md`
2. Set base URL: `http://localhost:5000`
3. Start with registration endpoints
4. Use `x-userid` header for authenticated endpoints

### Testing Order (CRITICAL - Follow exactly!)
1. **Register First Hospital Admin**: `POST /auth/registerHospitalAdmin`
   - Body must include: `adminId: "hospitalAdmin"`, `userId`, `hospitalId`, `name`, `address`
2. **Register First Insurance Admin**: `POST /auth/registerInsuranceAdmin`
   - Body must include: `adminId: "insuranceAdmin"`, `userId`, `insuranceId`, `name`, `address`
3. **Register Doctor**: `POST /auth/registerDoctor`
   - Headers: `x-userid: Hospital01` (use the hospital admin ID you just created)
   - Body must include: `adminId: "Hospital01"`, `doctorId`, `hospitalId`, `name`, `city`
4. **Register Patient**: `POST /auth/registerPatient`
   - Body must include: `adminId: "hospitalAdmin"`, `userId`, `name`, `dob`, `city`
5. **Register Insurance Agent**: `POST /auth/registerInsuranceAgent`
   - Headers: `x-userid: Insurance01` (use the insurance admin ID you just created)
   - Body must include: `adminId: "Insurance01"`, `agentId`, `insuranceId`, `name`, `city`
6. **Then proceed with other operations**

**See `API_EXECUTION_ORDER.md` for complete detailed order**

### Headers Required
```
x-userid: <userId>
Content-Type: application/json
```

## Common Issues Resolved

### Issue: "Missing userId"
- **Solution**: Add `x-userid` header with valid user ID

### Issue: "User identity not found in wallet"
- **Solution**: Register user first using registration endpoints

### Issue: "Missing uuid and roles" (from chaincode)
- **Root Cause**: User was not registered with attributes, or wrong userId is being used in headers
- **For Hospital Admin**: 
  - Make sure you used `/auth/registerHospitalAdmin` with `adminId` in body
  - Use the registered hospital admin ID (e.g., `Hospital01`) in `x-userid` header, NOT `hospitalAdmin`
- **For Insurance Admin**: 
  - Make sure you used `/auth/registerInsuranceAdmin` with `adminId` in body
  - Use the registered insurance admin ID (e.g., `Insurance01`) in `x-userid` header, NOT `insuranceAdmin`
- **Solution**: 
  1. Delete user from wallet
  2. Re-register using proper registration endpoint with correct `adminId`
  3. Attributes are automatically added during registration
  4. Use the registered userId (not system admin ID) in subsequent API calls

## Next Steps

1. Import Postman collection or follow the guide
2. Test all endpoints systematically
3. If UUID/roles errors persist, re-register affected users
4. Check chaincode logs for detailed error messages

## Support

Refer to:
- **`API_EXECUTION_ORDER.md`** - Complete execution order with all APIs (START HERE!)
- **`POSTMAN_TESTING_GUIDE.md`** - Detailed endpoint documentation with correct request bodies
- **`UUID_ROLES_FIX.md`** - Troubleshooting guide for UUID/roles issues
- **`API_ENDPOINTS.txt`** - Quick reference endpoint list

## Key Changes Summary

1. ✅ **Hospital Admin Registration**: Now properly registers with attributes
2. ✅ **Insurance Admin Registration**: Now properly registers with attributes  
3. ✅ **Request Bodies**: All updated with correct fields (adminId, userId, etc.)
4. ✅ **Headers**: Use registered admin IDs (Hospital01, Insurance01) not system admin IDs
5. ✅ **Execution Order**: Documented in `API_EXECUTION_ORDER.md`
6. ✅ **Onboarding Doctor API**: Available at `/auth/registerDoctor` (registers AND onboard)

