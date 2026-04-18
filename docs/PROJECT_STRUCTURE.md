# Project Structure

```
DeReFund/
├── backend/                    # Node.js + Express API Server
│   ├── src/
│   │   ├── config/            # Environment and app configuration
│   │   │   └── index.js
│   │   ├── controllers/       # Route handlers
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   ├── campaignController.js
│   │   │   ├── disasterController.js
│   │   │   ├── donationController.js
│   │   │   ├── milestoneController.js
│   │   │   ├── uploadController.js
│   │   │   └── volunteerVerificationController.js
│   │   ├── db/                # Database configuration
│   │   │   ├── client.js     # PostgreSQL client
│   │   │   ├── tables/        # Drizzle ORM table definitions
│   │   │   │   ├── index.js
│   │   │   │   ├── enums.js   # Database enums
│   │   │   │   ├── users.js
│   │   │   │   ├── userVerification.js
│   │   │   │   ├── disasterCases.js
│   │   │   │   ├── campaigns.js
│   │   │   │   ├── donations.js
│   │   │   │   ├── milestones.js
│   │   │   │   ├── volunteerVerifications.js
│   │   │   │   ├── adminLogs.js
│   │   │   │   └── customTypes.js
│   │   │   └── schema.js      # Schema entry point
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.js        # JWT authentication
│   │   │   ├── errorHandler.js
│   │   │   └── upload.js      # File upload handling
│   │   ├── routes/            # API route definitions
│   │   │   ├── index.js
│   │   │   ├── auth.js
│   │   │   ├── campaigns.js
│   │   │   ├── disasters.js
│   │   │   ├── donations.js
│   │   │   ├── milestones.js
│   │   │   ├── admin.js
│   │   │   ├── volunteerVerification.js
│   │   │   └── upload.js
│   │   ├── services/          # Business logic
│   │   ├── utils/            # Utilities
│   │   │   └── validators.js
│   │   └── index.js          # Backend entry point
│   ├── database/
│   │   └── migrations/       # Drizzle migrations
│   ├── scripts/
│   ├── package.json
│   └── .env.example
│
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   │   ├── common/        # Shared components
│   │   │   ├── layout/        # Layout components
│   │   │   └── ui/            # UI primitives
│   │   ├── context/           # React contexts
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Page components
│   │   │   ├── public/        # Public pages
│   │   │   ├── donor/         # Donor-specific pages
│   │   │   ├── ngo/           # NGO-specific pages
│   │   │   └── admin/         # Admin-specific pages
│   │   ├── utils/             # Utilities
│   │   │   ├── api.js         # API client
│   │   │   └── animations.js
│   │   ├── App.jsx            # Main App component
│   │   └── main.jsx           # React entry point
│   ├── public/
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── contracts/                  # Solidity smart contracts
│   ├── contracts/             # Solidity contract files (.sol)
│   ├── scripts/               # Hardhat deployment scripts
│   ├── test/                  # Contract tests
│   ├── hardhat.config.js
│   ├── package.json
│   └── .env.example
│
├── docs/                      # Project documentation
│   ├── PROJECT_OVERVIEW.md
│   ├── PROJECT_STRUCTURE.md
│   ├── SETUP_GUIDE.md
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   └── USER_GUIDE.md
│
├── setup-all.ps1              # Quick setup script
├── package.json               # Root package.json (optional)
└── README.md
```

## Directory Descriptions

### Backend (`backend/`)

**Core Directories:**
- `src/controllers/` - Request handlers for each route
- `src/routes/` - Express router definitions
- `src/db/tables/` - Drizzle ORM table schemas
- `src/middleware/` - Express middleware (auth, error handling, uploads)
- `src/services/` - Business logic layer
- `src/utils/` - Helper functions and validators

### Frontend (`frontend/`)

**Core Directories:**
- `src/pages/` - Page components organized by user role
- `src/components/` - Reusable UI components
- `src/context/` - React context providers
- `src/hooks/` - Custom React hooks
- `src/utils/` - API client and utilities

### Contracts (`contracts/`)

**Contents:**
- Smart contract source files (.sol)
- Hardhat configuration
- Deployment and test scripts

## Key Files

| File | Purpose |
|------|---------|
| `backend/src/index.js` | Express server entry point |
| `frontend/src/main.jsx` | React application entry point |
| `frontend/src/App.jsx` | Main app with routing configuration |
| `backend/src/db/schema.js` | Database schema definitions |
| `contracts/hardhat.config.js` | Hardhat blockchain configuration |
