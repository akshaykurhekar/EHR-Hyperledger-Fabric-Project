# Order of Execution - EHR Hyperledger Fabric Project

## Prerequisites
- Docker installed and running
- Node.js installed
- Hyperledger Fabric binaries installed

---

## Step-by-Step Execution Order

### Step 1: Install Fabric Binaries and Samples
```bash
$ ./install-fabric.sh
```
**Purpose**: Downloads Hyperledger Fabric binaries and fabric-samples repository

---

### Step 2: Start the Test Network with CA and CouchDB
```bash
$ cd fabric-samples/test-network
$ ./network.sh up createChannel -ca -s couchdb
```
**Purpose**: 
- Creates a test network with Certificate Authority (CA)
- Creates a channel named `mychannel`
- Uses CouchDB as state database
- Sets up Org1 (Hospital) and Org2 (Insurance Company)

**Verify**: 
```bash
$ docker ps
```
Should show running containers: orderer, peer0.org1, peer0.org2, ca_org1, ca_org2, couchdb0, couchdb1

---

### Step 3: Deploy Chaincode
```bash
$ ./network.sh deployCC -ccn ehrChainCode -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript
```
**Purpose**: 
- Packages and deploys the EHR chaincode (`ehrChainCode`)
- Installs on all peers
- Commits to the channel

**Verify**: Check for successful chaincode deployment messages

---

### Step 4: Register Organization Admins
```bash
$ cd ../../server-node-sdk/
$ node cert-script/registerOrg1Admin.js
$ node cert-script/registerOrg2Admin.js
```
**Purpose**: 
- Registers and enrolls `hospitalAdmin` for Org1
- Registers and enrolls `insuranceAdmin` for Org2
- Creates admin identities in the wallet

**Verify**: Check wallet folder for `hospitalAdmin.id` and `insuranceAdmin.id`

---

### Step 5: Onboard Hospital
```bash
$ node cert-script/onboardHospital01.js
```
**Purpose**: 
- Registers hospital identity (`Hospital01`)
- Onboards hospital to the chaincode
- Creates hospital record on blockchain

**Verify**: Success message showing hospital onboarded

<!-- ---

### Step 6: Onboard Doctor
```bash
$ node cert-script/onboardDoctor.js
```
**Purpose**: 
- Registers doctor identity (`Doctor-Rama04`)
- Onboards doctor to the chaincode
- Associates doctor with hospital
- **Note**: Uses `hospitalAdmin` identity to call chaincode (fixed)

**Verify**: Success message showing doctor onboarded

**Alternative**: After Step 10 (server running), you can use API `POST /auth/registerDoctor` instead

--- -->

### Step 7: Onboard Insurance Company
```bash
$ node cert-script/onboardInsuranceCompany.js
```
**Purpose**: 
- Registers insurance company identity (`insuranceCompany01`)
- Onboards insurance company to the chaincode

**Verify**: Success message showing insurance company onboarded

---

### Step 8: Onboard Insurance Agent 
```bash
$ node cert-script/onboardInsuranceAgent.js
```
**Purpose**: 
- Registers insurance agent identity (`insuranceAgent-Rama`)
- Onboards agent to the chaincode
- Associates agent with insurance company

**Verify**: Success message showing agent onboarded

---

### Step 9: Register Patient (Optional - via cert-script)
```bash
$ node cert-script/registerPatient.js [patientId] [name] [dob] [city]
```
**Example**:
```bash
$ node cert-script/registerPatient.js patient01 "John Doe" "01/01/1990" "New York"
```
**Purpose**: 
- Registers patient identity with CA
- Onboards patient to the chaincode

**Note**: After Step 10 (server running), **prefer using API** `POST /auth/registerPatient` instead of this script. The API provides the same functionality and is easier to use.

---

### Step 10: Start Node.js Server
```bash
$ npm install  # If not already done
$ npm run dev  # Development mode with nodemon
# OR
$ npm start    # Production mode
```
**Purpose**: 
- Starts Express.js server on port 5000 (default)
- Enables API endpoints for interacting with blockchain

**Verify**: 
- Server should start on `http://localhost:5000`
- Check console for "Server running on port 5000"

---

### Step 11: Test APIs
Use Postman collection or curl to test APIs:
- Base URL: `http://localhost:5000`
- All APIs require `x-userid` header (except registration endpoints)

**Example**:
```bash
# Register Patient via API
curl -X POST http://localhost:5000/auth/registerPatient \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "hospitalAdmin",
    "userId": "patient02",
    "name": "Jane Doe",
    "dob": "02/02/1995",
    "city": "Los Angeles"
  }'
```

---

## Optional: Setup Fabric Explorer

### Step 12: Setup Explorer (Optional)
```bash
$ cd fabric-explorer/
$ sudo cp -r ../fabric-samples/test-network/organizations/ .
$ export EXPLORER_CONFIG_FILE_PATH=./config.json
$ export EXPLORER_PROFILE_DIR_PATH=./connection-profile
$ export FABRIC_CRYPTO_PATH=./organizations
```
**Edit** `connection-profile/test-network.json` - check adminPrivateKey path

**Start Explorer**:
```bash
$ docker-compose up -d
```
**Access**: `http://localhost:8080`

---

## Shutting Down

### To Stop Network
```bash
$ cd fabric-samples/test-network
$ ./network.sh down
```

### To Stop Explorer
```bash
$ cd fabric-explorer
$ docker-compose down
```

---

## Troubleshooting

1. **Network not starting**: Check Docker is running
2. **Chaincode deployment fails**: Ensure network is up and channel created
3. **Wallet errors**: Delete wallet folder and re-run registration scripts
4. **Port conflicts**: Change port in `app.js` if 5000 is in use
5. **CA connection issues**: Verify CA containers are running (`docker ps`)

---

## Quick Reference

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `./install-fabric.sh` | Install binaries |
| 2 | `./network.sh up createChannel -ca -s couchdb` | Start network |
| 3 | `./network.sh deployCC -ccn ehrChainCode ...` | Deploy chaincode |
| 4 | `node cert-script/registerOrg1Admin.js` | Register Org1 admin |
| 4 | `node cert-script/registerOrg2Admin.js` | Register Org2 admin |
| 5 | `node cert-script/onboardHospital01.js` | Onboard hospital |
| 6 | `node cert-script/onboardDoctor.js` | Onboard doctor |
| 7 | `node cert-script/onboardInsuranceCompany.js` | Onboard insurance |
| 8 | `node cert-script/onboardInsuranceAgent.js` | Onboard agent |
| 9 | `node cert-script/registerPatient.js ...` | Register patient (optional) |
| 10 | `npm run dev` | Start API server |

