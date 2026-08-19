# AGENTX INDIA 2026 — Hackathon Management Platform

> **Build. Automate. Impact.**  
> A complete, production-ready hackathon management platform for **AGENTX INDIA 2026** (24-Hour AI Agent Hackathon, 30 August 2026).

---

## 🌟 Overview

AGENTX INDIA 2026 is a full-stack platform managing the entire lifecycle of a national AI Agent hackathon:

**Public Landing Page → 2-Member Team Registration → ₹199 UPI Payment (QR / Deep Link) → UTR Submission → Admin Manual Verification → Sequential Team ID (`AX001`-`AX100`) → Admin Control Dashboard → Certificate Generation → Public QR Code Verification**

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Vanilla CSS Design System, Lucide Icons, Canvas-Confetti.
- **Backend**: Python 3.11, FastAPI, SQLAlchemy ORM, Pydantic, Native Bcrypt, PyJWT.
- **Database**: SQLite (built-in, seamless migration path to PostgreSQL for production).
- **Payment System**: UPI QR Code + UTR / Transaction ID Submission + Admin Manual Verification.
- **Certificate Engine**: High-resolution PNG & Vector PDF generator with embedded QR codes using Pillow & ReportLab.
- **Security**: JWT Admin Authentication, Password Hashing, Rate Limiting, Input Validation, File Security.

---

## ⚡ Core Business Logic Rules

1. **Team Size**: Exactly **2 members per team**.
2. **Registration Fee**: **₹199 per team — 2 members**.
3. **Maximum Team Cap**: Strictly **100 confirmed teams** (200 participants max). When 100 confirmed teams are reached, registration automatically locks across frontend and backend.
4. **Payment Verification**: Payment is made via UPI QR or deep link. The participant submits their 12-digit UTR / Transaction ID (and optional payment screenshot).
5. **Admin Verification & Team ID Assignment**: Sequential Team IDs (`AX001`, `AX002`, ..., `AX100`) are generated **only after an authenticated Admin manually verifies the UTR against bank records** and changes payment status from `PENDING` to `VERIFIED`.
6. **Anti-Fraud Protections**: Duplicate UTR submissions across teams are blocked server-side.

---

## 📁 Repository Structure

```
d:/hackthon/
├── backend/
│   ├── app/
│   │   ├── auth/            # JWT & Bcrypt Admin Security
│   │   ├── certificates/    # PNG & PDF Certificate Generator with QR codes
│   │   ├── database/        # SQLAlchemy Engine & Session
│   │   ├── email/           # SMTP Confirmation Mailer
│   │   ├── models/          # ORM Models (Admin, Registration, Payment, Certificate, AuditLog)
│   │   ├── payments/        # UPI Screenshot Security & UTR Validation
│   │   ├── routes/          # API Routers (Public, Registration, Payments, Certificates, Admin)
│   │   ├── schemas/         # Pydantic Request & Response Schemas
│   │   └── main.py          # FastAPI Application Entry Point
│   ├── seed.py              # Mock Database Seeder
│   └── requirements.txt     # Backend Dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Hero, About, Tracks, Timeline, FAQ, Contact, ShareModal, UPIQRCode, Footer
│   │   ├── pages/           # Home, Register, PaymentPage, Success, VerifyCertificate, PolicyPages, AdminLogin, AdminDashboard
│   │   ├── services/        # API Axios/Fetch Wrapper
│   │   ├── styles/          # Design System CSS
│   │   ├── App.jsx          # React Router Setup
│   │   └── main.jsx         # React Entry Point
│   ├── index.html           # HTML Template
│   ├── vite.config.js       # Vite Proxy & Server Settings
│   └── package.json         # Frontend Dependencies
├── .env.example             # Configuration Template
├── .env                     # Development Configuration
└── README.md                # Documentation
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 2. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python seed.py               # Seed default admin, tracks, & settings
uvicorn app.main:app --port 8000
```
Backend API interactive documentation is available at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --port 5173
```
Open web application at: `http://localhost:5173/`

---

## 🔑 Admin Credentials (Initial Default)

- **Login URL**: `http://localhost:5173/admin/login`
- **Username**: `admin`
- **Password**: `admin@agentx2026`

---

## 💳 UPI Payment Configuration

In `.env`:
```env
UPI_ID=9618164396-3@ybl
UPI_DISPLAY_NAME=agentx2026
FEE_PER_TEAM=199.0
```
Admin can also customize the UPI ID, Display Name, and upload a custom payment QR code directly from the **Event Settings** tab in the Admin Dashboard.

---

## 📜 Certificate Verification System

1. **Certificate Generation**: Admin clicks **Bulk Generate Participation Certificates** in Admin Dashboard (`/admin`).
2. **QR Code Destination**: Every certificate includes a high-contrast QR code pointing to `https://agentxindia.com/verify/{CERTIFICATE_ID}`.
3. **Public Verification Portal**: Users navigate to `/verify` or scan the QR code to view live validation status.
4. **Downloads**: High-resolution A4 landscape PNG and vector PDF downloads are served directly via API.

---

## 🛡️ License & Credits

Built for **AGENTX INDIA 2026** — 24-Hour AI Agent Hackathon.
All rights reserved.
