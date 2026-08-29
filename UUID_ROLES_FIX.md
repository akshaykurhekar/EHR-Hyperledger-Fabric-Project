# Fix for Missing UUID and Roles Issue

## Problem
When calling APIs, you're getting errors about missing UUID and roles. This happens because the chaincode is trying to access these attributes from the transaction context, but they're not available.

## Root Cause
In Hyperledger Fabric, user attributes (like `uuid` and `role`) are stored in the X.509 certificate when a user is enrolled. The chaincode accesses these via `GetAttributeValue()` function. If these attributes are missing, it means:

1. The user wasn't enrolled with attributes properly
2. The enrollment didn't request attributes correctly
3. The CA isn't configured to include attributes in certificates

## Solution

### Step 1: Verify User Registration
Ensure users are registered with attributes. The registration endpoints automatically add attributes:

- **Patients**: `role=patient`, `uuid=<userId>`
- **Doctors**: `role=doctor`, `uuid=<doctorId>`
- **Insurance Agents**: `role=insuranceAgent`, `uuid=<agentId>`

### Step 2: Re-enroll Users (if needed)
If users were registered before attributes were properly configured, you may need to re-register them:

1. Delete the user from the wallet (if exists)
2. Re-register using the appropriate endpoint:
   - `POST /auth/registerPatient`
   - `POST /auth/registerDoctor`
   - `POST /auth/registerInsuranceAgent`

### Step 3: Verify Enrollment Process
The enrollment code in `authController.js` should:
1. Register user with attributes: `ca.register({ ..., attrs: [...] })`
2. Enroll with attribute requests: `ca.enroll({ ..., attr_reqs: [...] })`

### Step 4: Check CA Configuration
Ensure your Fabric CA is configured to allow attributes. Check the CA configuration file for:
```yaml
affiliations:
  org1:
    - department1
    - department2

# Attributes should be enabled by default
```

### Step 5: Verify Chaincode Access
The chaincode should access attributes like this (Go example):
```go
uuid, found, err := cid.GetAttributeValue(ctx, "uuid")
if err != nil || !found {
    return fmt.Errorf("missing uuid attribute")
}

role, found, err := cid.GetAttributeValue(ctx, "role")
if err != nil || !found {
    return fmt.Errorf("missing role attribute")
}
```

## Testing
1. Register a new user: `POST /auth/registerPatient`
2. Login: `POST /auth/loginPatient`
3. Call an API that requires authentication
4. If you still get errors, the user may need to be re-registered

## Updated Middleware
The `requireUser` middleware has been updated to:
- Validate that the user identity exists in the wallet
- Extract user information from the certificate
- Provide better error messages if the user is not found

## Common Issues

### Issue: "User identity not found in wallet"
**Solution**: Register the user first using the registration endpoints.

### Issue: "Missing uuid and roles" (from chaincode)
**Solution**: 
1. Delete the user from wallet: Remove the identity file from `server-node-sdk/wallet/`
2. Re-register the user using the appropriate registration endpoint
3. Ensure the registration includes attributes (which it should automatically)

### Issue: Attributes not in certificate
**Solution**: 
1. Check CA logs to ensure attributes are being registered
2. Verify the enrollment process includes `attr_reqs`
3. Re-enroll the user with proper attribute requests

## Verification Script
You can verify a user has attributes by checking the certificate:
```bash
# The certificate is stored in the wallet
# Check if attributes are present in the certificate
```

## Notes
- Attributes are embedded in the X.509 certificate during enrollment
- The chaincode accesses them via `GetAttributeValue()` from the transaction context
- If attributes are missing, re-register the user with the proper registration endpoint
- The middleware now validates user existence before allowing API calls

