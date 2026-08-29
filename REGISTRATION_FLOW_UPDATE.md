# Registration Flow Update

## Overview
This update implements a new registration and login flow that:
1. Uses email/password authentication instead of userId-only login
2. Generates unique userIds automatically for each user
3. Stores user credentials in MongoDB
4. Requires admin to complete blockchain registration after user registration

## Changes Made

### Backend Changes

#### 1. MongoDB Integration
- **File**: `server-node-sdk/config/database.js`
  - MongoDB connection setup
- **File**: `server-node-sdk/models/User.js`
  - User model with password hashing (bcrypt)
  - Stores email, password, role, and role-specific fields
  - Tracks `registeredOnChain` status

#### 2. Updated Authentication Controller
- **File**: `server-node-sdk/controllers/authController.js`
  - **Login endpoints** now:
    - Accept `email` and `password` instead of `userId`
    - Check MongoDB first
    - Return `needsRegistration: true` if user doesn't exist
    - Return `needsChaincodeRegistration: true` if user exists but not on blockchain
    - Verify password using bcrypt
  
  - **Registration endpoints** now:
    - Accept `email`, `password`, and role-specific fields
    - Generate unique userId automatically using UUID
    - Store user in MongoDB with hashed password
    - Return userId for admin to complete blockchain registration
  
  - **New endpoints**:
    - `POST /auth/completePatientRegistration` - Admin completes patient blockchain registration
    - `POST /auth/completeDoctorRegistration` - Admin completes doctor blockchain registration
    - `POST /auth/completeInsuranceAgentRegistration` - Admin completes agent blockchain registration

#### 3. User ID Generation
- **File**: `server-node-sdk/utils/generateUserId.js`
  - Generates unique userIds in format: `{role}-{12-char-uuid}`
  - Example: `patient-a1b2c3d4e5f6`, `doctor-g7h8i9j0k1l2`

#### 4. Updated Routes
- **File**: `server-node-sdk/routes/authRoutes.js`
  - New registration endpoints (with password)
  - Updated login endpoints (with email/password)
  - Admin completion endpoints

#### 5. Dependencies Added
- **File**: `server-node-sdk/package.json`
  - `mongoose` - MongoDB ODM
  - `bcryptjs` - Password hashing
  - `uuid` - Unique ID generation

### Frontend Changes

#### 1. Updated Login Component
- **File**: `frontend/src/pages/Login.jsx`
  - Changed from userId input to email/password inputs
  - Handles `needsRegistration` response (redirects to registration)
  - Handles `needsChaincodeRegistration` response (shows warning but allows login)

#### 2. Updated Registration Component
- **File**: `frontend/src/pages/Register.jsx`
  - Added email and password fields
  - Password confirmation
  - Role-specific fields based on selected role
  - Shows generated userId after successful registration

#### 3. Updated Auth Context
- **File**: `frontend/src/contexts/AuthContext.jsx`
  - Updated `login` function to accept `email` and `password`
  - Handles different response types:
    - `needsRegistration` - User needs to register
    - `needsChaincodeRegistration` - User registered but pending blockchain registration
    - Success - Full login

## New Flow

### User Registration Flow
1. User visits `/register`
2. Selects role (patient/doctor/insurance agent)
3. Enters email, password, and role-specific fields
4. System generates unique userId
5. User stored in MongoDB with hashed password
6. User receives userId and message that admin will complete registration
7. User can login but will see pending status

### User Login Flow
1. User visits `/login`
2. Enters email and password
3. System checks MongoDB:
   - If user doesn't exist → `needsRegistration: true` → redirect to registration
   - If user exists but not on blockchain → `needsChaincodeRegistration: true` → allow login with warning
   - If user fully registered → success → redirect to dashboard

### Admin Completion Flow
1. Admin calls completion endpoint with userId
2. System:
   - Registers user on Fabric CA
   - Enrolls user with role and uuid attributes
   - Onboards user on chaincode
   - Updates MongoDB `registeredOnChain: true`

## API Endpoints

### Registration (Public)
- `POST /auth/registerPatient`
  ```json
  {
    "email": "patient@example.com",
    "password": "password123",
    "name": "John Doe",
    "dob": "01/01/1990",
    "city": "New York",
    "doctorId": "doctor01" // optional
  }
  ```

- `POST /auth/registerDoctor`
  ```json
  {
    "email": "doctor@example.com",
    "password": "password123",
    "name": "Dr. Jane Smith",
    "hospitalId": "Hospital01",
    "city": "New York"
  }
  ```

- `POST /auth/registerInsuranceAgent`
  ```json
  {
    "email": "agent@example.com",
    "password": "password123",
    "name": "Agent Name",
    "insuranceId": "Insurance01",
    "city": "New York"
  }
  ```

### Login (Public)
- `POST /auth/loginPatient`
- `POST /auth/loginDoctor`
- `POST /auth/loginInsuranceAgent`
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### Admin Completion (Protected)
- `POST /auth/completePatientRegistration`
- `POST /auth/completeDoctorRegistration`
- `POST /auth/completeInsuranceAgentRegistration`
  ```json
  {
    "userId": "patient-a1b2c3d4e5f6"
  }
  ```

## Setup Instructions

### 1. Install MongoDB
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### 2. Install Dependencies
```bash
cd server-node-sdk
npm install
```

### 3. Configure MongoDB Connection
Set environment variable (optional, defaults to `mongodb://localhost:27017/ehr-carecrypt`):
```bash
export MONGODB_URI=mongodb://localhost:27017/ehr-carecrypt
```

### 4. Start Server
```bash
npm run dev
```

## Testing

### Test Registration
1. Go to `/register`
2. Select role
3. Fill in email, password, and required fields
4. Submit
5. Note the generated userId

### Test Login
1. Go to `/login`
2. Enter registered email and password
3. Should see pending status if not completed by admin

### Test Admin Completion
1. Use Postman or curl to call completion endpoint
2. User should now be fully registered on blockchain

## Migration Notes

- Existing users registered via old endpoints will need to register again with email/password
- Legacy endpoints are still available for backward compatibility:
  - `POST /auth/registerPatientLegacy`
  - `POST /auth/registerDoctorLegacy`
  - `POST /auth/registerInsuranceAgentLegacy`

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `sudo systemctl status mongodb`
- Check connection string in `config/database.js`

### Password Hashing Issues
- Ensure `bcryptjs` is installed: `npm install bcryptjs`

### User ID Generation Issues
- Ensure `uuid` is installed: `npm install uuid`

### Infinite Loading on Login
- Fixed by proper error handling in AuthContext
- Check browser console for errors
- Verify API endpoint is responding

