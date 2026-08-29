# EHR CareCrypt Frontend - User Guide

## Overview

This is a comprehensive React frontend application for the EHR CareCrypt healthcare management system. It provides role-based access with beautiful, modern UI and full integration with the backend API.

## Features Implemented

### ✅ Authentication & Registration
- **Login Page**: Role-based login (Admin, Doctor, Insurance Agent, Patient)
- **Registration System**: Submit registration requests that require admin approval
- **Session Management**: Persistent login using localStorage

### ✅ Admin Dashboard
- View all registration requests (pending, approved, rejected)
- Approve/reject registration requests
- Create user accounts using auth APIs
- Statistics dashboard showing request counts

### ✅ Patient Dashboard
- **Claims Management**:
  - Submit new insurance claims with document upload
  - View all claims with status tracking
  - Update claim documents
- **Medical Records**: View all medical records
- **Profile**: View patient profile information
- **Access Control**: Grant/revoke doctor access to medical records

### ✅ Doctor Dashboard
- **Patient Management**:
  - View assigned patients
  - Add medical records for patients
  - View patient medical records
- **Claim Verification**:
  - View pending claims requiring verification
  - Verify or reject claims with notes
- **Profile**: View doctor profile

### ✅ Insurance Agent Dashboard
- **Claim Review**:
  - View all pending claims
  - Review claim details and related medical records
  - Approve claims with approved amount
  - Reject claims with rejection reason
- **Profile**: View agent profile

### ✅ Notification System
- Real-time notifications for:
  - Claim submissions
  - Claim verifications
  - Claim approvals/rejections
- Notification panel with mark as read functionality
- Visual indicators for unread notifications

### ✅ Document Upload
- File upload support for insurance claims
- Multiple file selection
- File list display

## UI/UX Features

- **Modern Design**: Clean, professional interface with rounded corners
- **Consistent Theming**: Color-coded roles (Admin: Purple, Doctor: Blue, Insurance: Green, Patient: Pink)
- **Responsive Layout**: Works on desktop and tablet devices
- **Smooth Transitions**: Hover effects and animations
- **Toast Notifications**: User-friendly success/error messages
- **Loading States**: Visual feedback during API calls

## Getting Started

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## Usage Flow

### 1. Registration Flow
1. User visits `/register`
2. Selects role (Patient, Doctor, Hospital Admin, Insurance Admin)
3. Fills out registration form
4. Submits request (stored in localStorage)
5. Admin reviews and approves/rejects
6. Upon approval, account is created via auth API

### 2. Login Flow
1. User visits `/login`
2. Selects role
3. Enters User ID
4. Authenticated and redirected to role-specific dashboard

### 3. Patient Workflow
1. Login as patient
2. Submit insurance claim with documents
3. Grant doctor access if needed
4. View claim status updates via notifications
5. Check medical records

### 4. Doctor Workflow
1. Login as doctor
2. View assigned patients
3. Add medical records
4. Verify pending claims
5. Receive notifications for new claims

### 5. Insurance Agent Workflow
1. Login as insurance agent
2. View pending claims
3. Review claim details and records
4. Approve or reject claims
5. Patients receive notifications

### 6. Admin Workflow
1. Login as admin
2. View registration requests
3. Approve/reject requests
4. Accounts are created automatically upon approval

## API Integration

All API calls are made to `http://localhost:5000` (configurable in `src/services/api.js`).

The frontend automatically includes the `x-userid` header for authenticated requests.

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.jsx              # Main layout with sidebar and header
│   │   ├── NotificationPanel.jsx   # Notification dropdown
│   │   └── ProtectedRoute.jsx      # Route protection
│   ├── contexts/
│   │   └── AuthContext.jsx         # Authentication context
│   ├── pages/
│   │   ├── Login.jsx               # Login page
│   │   ├── Register.jsx            # Registration page
│   │   ├── admin/
│   │   │   └── AdminDashboard.jsx   # Admin dashboard
│   │   ├── patient/
│   │   │   └── PatientDashboard.jsx # Patient dashboard
│   │   ├── doctor/
│   │   │   └── DoctorDashboard.jsx  # Doctor dashboard
│   │   └── insurance/
│   │       └── InsuranceDashboard.jsx # Insurance dashboard
│   ├── services/
│   │   ├── api.js                  # Axios instance with interceptors
│   │   ├── registrationService.js  # Registration request management
│   │   └── notificationService.js  # Notification utilities
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles with Tailwind
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Configuration

### Backend URL
Update the API base URL in `src/services/api.js` if your backend runs on a different port.

### Notification Polling
Notifications are polled every 5 seconds. Adjust the interval in `NotificationPanel.jsx` if needed.

## Notes

- Registration requests are stored in localStorage (in production, implement a backend endpoint)
- Notifications are stored per user in localStorage
- Session management uses localStorage
- File uploads are handled client-side (documents are stored as filenames in the claim)

## Future Enhancements

- WebSocket integration for real-time notifications
- Backend API for registration requests
- File storage service for document uploads
- Advanced filtering and search
- Export functionality
- Mobile responsive improvements

