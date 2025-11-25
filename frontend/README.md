# EHR CareCrypt Frontend

A modern React frontend application for the EHR CareCrypt healthcare management system built on Hyperledger Fabric.

## Features

- **Role-Based Authentication**: Login for Admin, Doctor, Insurance Agent, and Patient
- **Registration System**: Submit registration requests that require admin approval
- **Admin Dashboard**: Review and approve/reject registration requests, manage user accounts
- **Patient Dashboard**: Submit insurance claims, view medical records, manage doctor access
- **Doctor Dashboard**: View assigned patients, add medical records, verify claims
- **Insurance Agent Dashboard**: Review, approve, or reject insurance claims
- **Document Upload**: Upload documents for insurance claims
- **Notifications**: Real-time notifications for claim status updates
- **Modern UI**: Beautiful, responsive design with rounded corners and consistent theming

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend API running on `http://localhost:5000`

### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components (Layout, ProtectedRoute)
│   ├── contexts/         # React contexts (AuthContext)
│   ├── pages/            # Page components
│   │   ├── admin/       # Admin dashboard
│   │   ├── patient/     # Patient dashboard
│   │   ├── doctor/      # Doctor dashboard
│   │   └── insurance/   # Insurance agent dashboard
│   ├── services/         # API services and utilities
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── package.json
├── vite.config.js        # Vite configuration
└── tailwind.config.js    # Tailwind CSS configuration
```

## API Integration

The frontend communicates with the backend API at `http://localhost:5000`. All API calls are handled through the `api.js` service which automatically includes the `x-userid` header for authenticated requests.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Technologies Used

- React 18
- React Router 6
- Vite
- Tailwind CSS
- Axios
- React Toastify
- React Icons

## Notes

- Registration requests are stored in localStorage (in production, this should be a backend endpoint)
- Notifications are stored in localStorage per user
- The app uses localStorage for session management

