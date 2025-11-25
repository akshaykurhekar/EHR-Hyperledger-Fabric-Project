# EHR Hyperledger Fabric Project - Complete Setup Guide

This is the **complete setup guide** for the Electronic Health Record (EHR) blockchain system built on Hyperledger Fabric. Follow these steps in order to set up and run the entire system.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Network Setup](#network-setup)
4. [Chaincode Deployment](#chaincode-deployment)
5. [Admin Registration](#admin-registration)
6. [Server Setup](#server-setup)
7. [Initial Testing](#initial-testing)
8. [API Testing](#api-testing)
9. [Troubleshooting](#troubleshooting)
10. [Project Structure](#project-structure)

---

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software

1. **Docker & Docker Compose**
   - Docker version 20.10 or later
   - Docker Compose version 1.29 or later
   - Verify installation:
     ```bash
     docker --version
     docker compose version
     ```

2. **Node.js & npm**
   - Node.js version 16.x or later (LTS recommended)
   - npm version 8.x or later
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

3. **Git**
   - For cloning repositories
   - Verify installation:
     ```bash
     git --version
     ```

4. **curl** (usually pre-installed)
   - For downloading scripts

### System Requirements

- **OS**: Linux, macOS, or Windows (WSL2 recommended for Windows)
- **RAM**: Minimum 8GB (16GB recommended)
- **Disk Space**: At least 10GB free space
- **CPU**: Multi-core processor recommended

### Docker Prerequisites

Ensure Docker is running:
```bash
docker ps
```

If Docker is not running, start it:
- **Linux**: `sudo systemctl start docker`
- **macOS**: Open Docker Desktop
- **Windows**: Start Docker Desktop

---

## Installation Steps

### Step 1: Clone/Download the Project

If you haven't already, ensure you have the project files in your workspace:

```bash
# Navigate to your project directory
cd /path/to/EHR-Hyperledger-Fabric-Project
```

### Step 2: Install Hyperledger Fabric Binaries and Samples

Run the installation script to download Fabric binaries and samples:

```bash
# Make script executable (if needed)
chmod +x install-fabric.sh

# Run installation script
./install-fabric.sh binary samples
```

**What this does:**
- Downloads Hyperledger Fabric binaries (peer, orderer, configtxgen, etc.)
- Downloads fabric-samples repository
- Sets up the necessary tools for running Fabric networks

**Expected output:**
- Script downloads binaries to `fabric-samples/bin/`
- Downloads fabric-samples repository

**Time:** 5-10 minutes (depending on internet speed)

---

## Network Setup

### Step 3: Start the Hyperledger Fabric Test Network

Navigate to the test-network directory and start the network:

```bash
cd fabric-samples/test-network
```

Start the network with Certificate Authority (CA) and CouchDB:

```bash
./network.sh up createChannel -ca -s couchdb
```

**What this command does:**
- `up`: Starts the network (creates Docker containers)
- `createChannel`: Creates a channel named `mychannel`
- `-ca`: Enables Certificate Authority for user registration
- `-s couchdb`: Uses CouchDB as the state database (instead of LevelDB)

**Expected output:**
- Network starts successfully
- Channel `mychannel` is created
- Containers are running

**Verify network is running:**
```bash
docker ps
```

You should see these containers running:
- `orderer.example.com` - Ordering service
- `peer0.org1.example.com` - Peer for Organization 1 (Hospital)
- `peer0.org2.example.com` - Peer for Organization 2 (Insurance)
- `ca_org1.example.com` - CA for Organization 1
- `ca_org2.example.com` - CA for Organization 2
- `couchdb0` - CouchDB for Organization 1
- `couchdb1` - CouchDB for Organization 2

**Time:** 2-3 minutes

**Note:** Keep this terminal open. The network must remain running for the system to work.

---

## Chaincode Deployment

### Step 4: Deploy the EHR Chaincode

Deploy the EHR chaincode to the network:

```bash
./network.sh deployCC -ccn ehrChainCode -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript
```

**What this command does:**
- `deployCC`: Deploys chaincode
- `-ccn ehrChainCode`: Names the chaincode `ehrChainCode`
- `-ccp ../asset-transfer-basic/chaincode-javascript/`: Path to chaincode source
- `-ccl javascript`: Specifies JavaScript as the chaincode language

**Expected output:**
- Chaincode is packaged
- Chaincode is installed on all peers
- Chaincode is committed to the channel
- Chaincode is ready to use

**Verify deployment:**
Look for success messages like:
- "Chaincode installed on peer0.org1"
- "Chaincode installed on peer0.org2"
- "Chaincode definition committed on channel 'mychannel'"

**Time:** 2-3 minutes

---

## Admin Registration

### Step 5: Register Organization Admins

Navigate to the server-node-sdk directory:

```bash
cd ../../server-node-sdk
```

Register the organization admins (these are system admins that can register other users):

```bash
# Register Org1 Admin (Hospital Admin)
node cert-script/registerOrg1Admin.js

# Register Org2 Admin (Insurance Admin)
node cert-script/registerOrg2Admin.js
```

**What these scripts do:**
- Register and enroll `hospitalAdmin` for Organization 1
- Register and enroll `insuranceAdmin` for Organization 2
- Create admin identities in the wallet directory
- These admins can register other users

**Expected output:**
- "Successfully enrolled admin user and imported it into the wallet"
- Wallet folder should contain `hospitalAdmin.id` and `insuranceAdmin.id`

**Verify:**
```bash
ls wallet/
```

You should see:
- `hospitalAdmin.id`
- `insuranceAdmin.id`

**Time:** 1-2 minutes

---

## Server Setup

### Step 6: Install Node.js Dependencies

Install all required npm packages:

```bash
# Make sure you're in server-node-sdk directory
cd server-node-sdk

# Install dependencies
npm install
```

**What this does:**
- Installs Express.js (web framework)
- Installs Fabric SDK (`fabric-network`, `fabric-ca-client`)
- Installs other dependencies (cors, morgan, nodemon)

**Expected output:**
- Dependencies are installed
- `node_modules/` folder is created

**Time:** 2-3 minutes

### Step 7: Start the Node.js Server

Start the Express server:

```bash
npm run dev
```

**What this does:**
- Starts the Express server on port 5000
- Enables hot-reload with nodemon (auto-restarts on file changes)

**Expected output:**
```
Server is running on port 5000
EHR Server Running
```

**Verify server is running:**
Open a new terminal and test:
```bash
curl http://localhost:5000/
```

You should get:
```json
{"status":"EHR Server Running"}
```

**Time:** Immediate

**Note:** Keep this terminal open. The server must remain running for APIs to work.

---

## Initial Testing

### Step 8: Register First Hospital Admin via API

Now that the server is running, register your first hospital admin using the API:

**Using curl:**
```bash
curl -X POST http://localhost:5000/auth/registerHospitalAdmin \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "hospitalAdmin",
    "userId": "Hospital01",
    "hospitalId": "Hospital01",
    "name": "City General Hospital",
    "address": "123 Main St, City, State"
  }'
```

**Using Postman:**
- Method: `POST`
- URL: `http://localhost:5000/auth/registerHospitalAdmin`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "adminId": "hospitalAdmin",
    "userId": "Hospital01",
    "hospitalId": "Hospital01",
    "name": "City General Hospital",
    "address": "123 Main St, City, State"
  }
  ```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "userId": "Hospital01",
    "hospitalId": "Hospital01",
    "chaincodeResult": "..."
  }
}
```

### Step 9: Register First Insurance Admin via API

```bash
curl -X POST http://localhost:5000/auth/registerInsuranceAdmin \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "insuranceAdmin",
    "userId": "Insurance01",
    "insuranceId": "Insurance01",
    "name": "Health Insurance Co",
    "address": "456 Insurance Ave, City, State"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "userId": "Insurance01",
    "insuranceId": "Insurance01",
    "chaincodeResult": "..."
  }
}
```

---

## API Testing
  
### Step 10: Test Complete Workflow

Now you can test the complete system. Follow the execution order:

1. **Register Doctor:**
   ```bash
   curl -X POST http://localhost:5000/auth/registerDoctor \
     -H "Content-Type: application/json" \
     -H "x-userid: Hospital01" \
     -d '{
       "adminId": "Hospital01",
       "doctorId": "doctor01",
       "hospitalId": "Hospital01",
       "name": "Dr. Jane Smith",
       "city": "New York"
     }'
   ```

2. **Register Patient:**
   ```bash
   curl -X POST http://localhost:5000/auth/registerPatient \
     -H "Content-Type: application/json" \
     -d '{
       "adminId": "hospitalAdmin",
       "userId": "patient01",
       "name": "John Doe",
       "dob": "01/01/1990",
       "city": "New York"
     }'
   ```

3. **Register Insurance Agent:**
   ```bash
   curl -X POST http://localhost:5000/auth/registerInsuranceAgent \
     -H "Content-Type: application/json" \
     -H "x-userid: Insurance01" \
     -d '{
       "adminId": "Insurance01",
       "agentId": "agent01",
       "insuranceId": "Insurance01",
       "name": "Agent John",
       "city": "New York"
     }'
   ```

### Documentation References

For complete API documentation and testing:

1. **API_EXECUTION_ORDER.md** - Step-by-step execution order for all APIs
2. **POSTMAN_TESTING_GUIDE.md** - Complete Postman testing guide with all endpoints
3. **API-README.md** - Detailed API documentation

### Postman Collection

Import the Postman collection:
- File: `EHR-APIs.postman_collection.json`
- Base URL: `http://localhost:5000`

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Docker Containers Not Running

**Problem:** `docker ps` shows no containers

**Solution:**
```bash
cd fabric-samples/test-network
./network.sh up createChannel -ca -s couchdb
```

#### 2. Port 5000 Already in Use

**Problem:** Server fails to start - "EADDRINUSE: address already in use"

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change port in server-node-sdk/app.js
```

#### 3. "Missing uuid/roles" Error

**Problem:** API returns error about missing uuid or roles

**Solution:**
- Ensure user was registered using the registration endpoints (not manually)
- Re-register the user using the appropriate registration API
- Check that `adminId` in request body matches an existing admin

**For Hospital Admin:**
- Use `POST /auth/registerHospitalAdmin` with `adminId: "hospitalAdmin"` in body
- Then use the registered ID (e.g., `Hospital01`) in `x-userid` header for subsequent calls

#### 4. "User identity not found in wallet"

**Problem:** API returns "User identity not found in wallet"

**Solution:**
- Register the user first using the appropriate registration endpoint
- Ensure the `x-userid` header matches the registered userId exactly

#### 5. Chaincode Deployment Fails

**Problem:** Chaincode deployment shows errors

**Solution:**
```bash
# Bring down network
./network.sh down

# Clean up
docker system prune -a

# Restart network and redeploy
./network.sh up createChannel -ca -s couchdb
./network.sh deployCC -ccn ehrChainCode -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript
```

#### 6. Wallet Folder Issues

**Problem:** Wallet folder missing or corrupted

**Solution:**
```bash
cd server-node-sdk
rm -rf wallet
mkdir wallet

# Re-register admins
node cert-script/registerOrg1Admin.js
node cert-script/registerOrg2Admin.js
```

#### 7. Network Connection Errors

**Problem:** Cannot connect to Fabric network

**Solution:**
- Ensure network is running: `docker ps`
- Check network logs: `docker logs peer0.org1.example.com`
- Restart network if needed

#### 8. Node Modules Issues

**Problem:** npm install fails or dependencies missing

**Solution:**
```bash
cd server-node-sdk
rm -rf node_modules package-lock.json
npm install
```

---

## Project Structure

```
EHR-Hyperledger-Fabric-Project/
│
├── fabric-samples/              # Hyperledger Fabric samples
│   ├── test-network/           # Test network scripts
│   └── asset-transfer-basic/
│       └── chaincode-javascript/  # EHR chaincode
│
├── server-node-sdk/            # Node.js API server
│   ├── app.js                  # Main server file
│   ├── controllers/            # API controllers
│   ├── routes/                 # API routes
│   ├── middleware/             # Middleware (auth, etc.)
│   ├── cert-script/            # Certificate scripts
│   ├── wallet/                 # User identities (created at runtime)
│   └── package.json            # Node.js dependencies
│
├── API_EXECUTION_ORDER.md      # Complete API execution order
├── POSTMAN_TESTING_GUIDE.md    # Postman testing guide
├── API-README.md                # API documentation
├── API_TESTING_SUMMARY.md       # Testing summary
├── FINAL.md                     # This file (setup guide)
└── install-fabric.sh           # Fabric installation script
```

---

## Quick Start Checklist

Use this checklist to verify your setup:

- [ ] Docker and Docker Compose installed and running
- [ ] Node.js and npm installed
- [ ] Fabric binaries installed (`./install-fabric.sh`)
- [ ] Network is running (`docker ps` shows containers)
- [ ] Channel created (`mychannel`)
- [ ] Chaincode deployed (`ehrChainCode`)
- [ ] Admins registered (`hospitalAdmin`, `insuranceAdmin` in wallet)
- [ ] Node.js dependencies installed (`npm install`)
- [ ] Server running on port 5000
- [ ] First hospital admin registered via API
- [ ] First insurance admin registered via API
- [ ] Can access health check endpoint (`GET /`)

---

## Next Steps

After completing the setup:

1. **Read API Documentation:**
   - `API_EXECUTION_ORDER.md` - Follow the execution order
   - `POSTMAN_TESTING_GUIDE.md` - Test all APIs

2. **Test the System:**
   - Register users (doctors, patients, agents)
   - Create medical records
   - Submit and process insurance claims

3. **Explore the Code:**
   - Chaincode: `fabric-samples/asset-transfer-basic/chaincode-javascript/`
   - API Controllers: `server-node-sdk/controllers/`
   - Routes: `server-node-sdk/routes/`

---

## Stopping the System

When you're done testing:

1. **Stop the Node.js Server:**
   - Press `Ctrl+C` in the server terminal

2. **Stop the Fabric Network:**
   ```bash
   cd fabric-samples/test-network
   ./network.sh down
   ```

This will:
- Stop all Docker containers
- Remove containers and volumes
- Clean up the network

**Note:** This will delete all data on the blockchain. For production, use proper backup procedures.

---

## Support and Documentation

- **Setup Issues:** Refer to [Troubleshooting](#troubleshooting) section
- **API Usage:** See `API_EXECUTION_ORDER.md` and `POSTMAN_TESTING_GUIDE.md`
- **API Reference:** See `API-README.md`
- **UUID/Roles Issues:** See `UUID_ROLES_FIX.md`

---

## Summary

You have successfully set up:
- ✅ Hyperledger Fabric test network
- ✅ EHR chaincode deployed
- ✅ Node.js API server
- ✅ Admin identities registered
- ✅ System ready for testing

**The system is now ready to use!**

Start testing APIs using Postman or curl, following the execution order in `API_EXECUTION_ORDER.md`.

---

**Last Updated:** 2024
**Version:** 1.0

