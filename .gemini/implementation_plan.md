# Freequo - Third-Party Integration Implementation Plan

## Overview
This document outlines the step-by-step integration of third-party services to make Freequo production-ready.

## Current State
- ✅ React frontend with Vite
- ✅ Express.js backend
- ✅ MongoDB models (Users, Jobs, Proposals, Payments, Notifications)
- ✅ JWT authentication  
- ✅ Role-based access (Client, Freelancer, Admin)
- ❌ Using local MongoDB (needs Atlas migration)
- ❌ No file uploads
- ❌ No email notifications
- ❌ Mock payment system

---

## Phase 1: MongoDB Atlas Connection ✅ (Existing - Needs Config Update)
**Status**: Ready - just need to update connection string

### Tasks:
1. Create MongoDB Atlas free cluster
2. Update MONGODB_URI in .env with Atlas connection string
3. Whitelist IP addresses (0.0.0.0/0 for development)

---

## Phase 2: Cloudinary - File Uploads
**Priority**: HIGH - Needed for profile images, resumes, job attachments

### Backend Setup:
1. Install cloudinary and multer packages
2. Create upload middleware
3. Create upload controller and routes
4. Update User model to store avatar URL
5. Update Job model to store attachment URLs

### Frontend Setup:
1. Create file upload components
2. Integrate with profile edit pages
3. Add image preview functionality

### Files to Create:
- `backend/config/cloudinary.js`
- `backend/middleware/upload.js`
- `backend/controllers/uploadController.js`
- `backend/routes/upload.js`

---

## Phase 3: EmailJS - Email Notifications
**Priority**: MEDIUM - For user notifications

### Emails to Send:
1. Welcome email on signup
2. Job posted confirmation (to client)
3. New proposal notification (to client)
4. Proposal accepted/rejected (to freelancer)
5. Payment confirmation (to both parties)

### Setup:
1. Create EmailJS account and templates
2. Add email service configuration
3. Update controllers to send emails at key events

### Files to Create:
- `backend/services/emailService.js`
- `src/services/emailService.js` (for frontend notifications)

---

## Phase 4: Razorpay - Test Payments
**Priority**: HIGH - Core feature for marketplace

### Backend Setup:
1. Install razorpay package
2. Create payment controller with Razorpay integration
3. Create order creation endpoint
4. Create payment verification endpoint
5. Update payment tracking in database

### Frontend Setup:
1. Install razorpay-checkout script
2. Create payment component
3. Handle payment callbacks
4. Update payment status display

### Files to Create/Update:
- `backend/config/razorpay.js`
- `backend/controllers/paymentController.js` (update)
- `backend/routes/payments.js` (update)
- `src/components/Payment/RazorpayPayment.jsx`

---

## Phase 5: Firebase Authentication (Optional Enhancement)
**Priority**: LOW - Current JWT auth works well

### Note: 
Your current JWT authentication is solid. Firebase would add:
- Google Sign-in
- Phone authentication
- Password reset emails

Recommend keeping current auth and adding Firebase only if you need social login.

---

## Environment Variables Required

### Backend (.env):
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/freequo

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Razorpay (Test Mode)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-secret-key

# EmailJS (Optional - can use frontend-only)
EMAILJS_SERVICE_ID=service_xxxxxx
EMAILJS_TEMPLATE_ID=template_xxxxxx
EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxx
```

### Frontend (.env):
```env
VITE_API_URL=http://localhost:5000/api
VITE_USE_API=true
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
VITE_EMAILJS_SERVICE_ID=service_xxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxx
```

---

## Implementation Order

1. **MongoDB Atlas** - 10 minutes (just config change)
2. **Cloudinary** - 30-45 minutes
3. **Razorpay** - 45-60 minutes  
4. **EmailJS** - 30 minutes

Total estimated time: ~2-3 hours

---

## Let's Start!
I'll implement each phase step by step, starting with Cloudinary for file uploads.
