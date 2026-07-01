# Aura Jewelry — Premium E-Commerce Platform

A production-ready full-stack jewelry e-commerce website designed with Ivory, Gold, and Rose Gold luxury aesthetics, featuring token-based authentication, soft delete management, administrative CRUD panel, and Razorpay sandbox payments integration.

## Technologies Used

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS v4, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express.js, Multer local file uploads
- **Database**: MongoDB & Mongoose ODM
- **Payments**: Razorpay Integration

---

## Folder Structure

```
beads&beyond/
├── server/                 # Express REST API Backend
│   ├── config/             # DB & Configurations
│   ├── controllers/        # Logical API Request Handlers
│   ├── middleware/         # JWT Auth, Uploads, Error Handling
│   ├── models/             # Mongoose Schemas (11 Collections)
│   ├── routes/             # Express API Endpoints
│   ├── services/           # Payment & Third-party integrations
│   ├── scripts/            # Database Seeding
│   └── uploads/            # Local Image Uploads (products, banners)
└── client/                 # Next.js 15 Client Frontend
    └── src/
        ├── app/            # App Router Pages & Styles
        ├── components/     # Header, Footer, Product Cards
        └── context/        # Global Auth & Cart State
```

---

## Setup & Running Locally

### Prerequisites
- Node.js installed locally
- MongoDB running locally (`mongodb://localhost:27017/aura-jewelry`) or a MongoDB Atlas connection string.

### 1. Server Setup
Navigate to the `server` directory:
```bash
cd server
npm install
```

Create a `.env` file from the template:
```bash
cp .env.example .env
```
Ensure your MongoDB and Razorpay variables are correct.

**Seed the database** (Creates categories, 6 sample items, coupons, and a default administrator account):
```bash
npm run seed
```
- **Admin Email**: `admin@aurajewelry.com`
- **Admin Password**: `adminpassword123`
- **Default User**: `jane@example.com` / `userpassword123`

Start the Express development server:
```bash
npm run dev
```
Runs at `http://localhost:5000`.

### 2. Client Setup
Navigate to the `client` directory:
```bash
cd ../client
npm install
npm run dev
```
Open `http://localhost:3000` to browse the luxury storefront.

---

## Razorpay Payment Integration (Sandbox Mock Flow)
For easy local testing without configuring live bank credentials:
- If Razorpay API keys are not specified or set to placeholder/sandbox keys, the server triggers a **Fallback simulation checkout**.
- The client prompts a beautiful mock payment confirmation modal where you can simulate sandbox transaction success.
- Successful verification logs the payment in the database and advances the order status to `Confirmed`/`Paid` just like the live integration.

---

## Deployment Guide

### Backend (Deploying to Render)
1. Push the repository to GitHub.
2. In Render, create a new **Web Service**.
3. Point to the `server/` root directory.
4. Set Build Command: `npm install`
5. Set Start Command: `node app.js`
6. Add Environment variables from your `server/.env`.

### Frontend (Deploying to Vercel)
1. Create a new project in Vercel.
2. Link the repository.
3. Configure the Root Directory to `client/`.
4. Set the Framework Preset to **Next.js**.
5. Deploy.
