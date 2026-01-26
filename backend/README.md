# Freequo Backend API

A complete, production-ready backend for the Freequo freelance marketplace built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication**: JWT-based auth with role support (Client, Freelancer, Admin)
- **Job Management**: CRUD operations, filtering, search, categories
- **Proposals System**: Bidding, status tracking, duplicate prevention
- **Payments**: Escrow system, payment release, earnings tracking
- **Notifications**: Real-time notification system
- **Admin Panel**: User management, job moderation, platform stats
- **Security**: Password hashing, input validation, CORS

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   ├── authController.js      # Auth operations
│   ├── userController.js      # User management
│   ├── jobController.js       # Job CRUD
│   ├── proposalController.js  # Proposal handling
│   ├── dashboardController.js # Dashboard stats
│   ├── paymentController.js   # Payment operations
│   ├── notificationController.js
│   └── adminController.js     # Admin operations
├── middleware/
│   ├── auth.js            # JWT verification & role auth
│   └── validation.js      # Input validation
├── models/
│   ├── User.js
│   ├── Job.js
│   ├── Proposal.js
│   ├── Payment.js
│   └── Notification.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── jobs.js
│   ├── proposals.js
│   ├── dashboard.js
│   ├── payments.js
│   ├── notifications.js
│   └── admin.js
├── scripts/
│   └── seedData.js        # Database seeder
├── .env                   # Environment variables
├── .env.example          # Example env file
├── package.json
└── server.js             # Entry point
```

## 🛠️ Setup

### Prerequisites

- Node.js (v18+)
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Navigate to backend folder**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   # Copy example env file
   cp .env.example .env
   
   # Edit .env with your values
   ```

4. **Start MongoDB**:
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Seed database** (optional):
   ```bash
   npm run seed
   ```

6. **Start server**:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/password` | Update password |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/freelancers` | Get freelancers list |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/profile` | Update profile |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | Get all jobs |
| GET | `/api/jobs/:id` | Get job details |
| POST | `/api/jobs` | Create job (Client) |
| PUT | `/api/jobs/:id` | Update job |
| DELETE | `/api/jobs/:id` | Delete job |
| GET | `/api/jobs/categories` | Get categories |
| GET | `/api/jobs/client/my-jobs` | Get client's jobs |
| PUT | `/api/jobs/:id/assign` | Assign freelancer |
| PUT | `/api/jobs/:id/complete` | Mark complete |

### Proposals
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/proposals` | Submit proposal |
| GET | `/api/proposals/job/:jobId` | Get job proposals |
| GET | `/api/proposals/my-proposals` | Get my proposals |
| PUT | `/api/proposals/:id/status` | Update status |
| DELETE | `/api/proposals/:id` | Withdraw proposal |
| GET | `/api/proposals/check/:jobId` | Check if applied |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/client` | Client dashboard |
| GET | `/api/dashboard/freelancer` | Freelancer dashboard |
| GET | `/api/dashboard/admin` | Admin dashboard |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments` | Create payment |
| PUT | `/api/payments/:id/release` | Release payment |
| GET | `/api/payments/client` | Client payments |
| GET | `/api/payments/freelancer` | Freelancer earnings |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all read |
| DELETE | `/api/notifications/:id` | Delete notification |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/:id/status` | Update user status |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/jobs` | Get all jobs |
| DELETE | `/api/admin/jobs/:id` | Delete job |
| GET | `/api/admin/stats` | Platform stats |

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## 👥 Demo Accounts

After seeding, use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@freequo.com | admin123 |
| Client | john@company.com | demo123 |
| Freelancer | sarah@gmail.com | demo123 |
| Freelancer | mike@gmail.com | demo123 |
| Freelancer | emma@gmail.com | demo123 |

## 🧪 Testing with Postman

1. Import the API endpoints into Postman
2. Create an environment with `baseUrl = http://localhost:5000`
3. Login to get a token
4. Add token to collection authorization

## 📦 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-very-secure-secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend.com
```

### Deploy to Railway/Render/Heroku

1. Push to GitHub
2. Connect to deployment platform
3. Set environment variables
4. Deploy

## 📄 License

MIT License
