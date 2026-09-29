# FinSight 360

### AI Relationship Intelligence & Opportunity Engine
> *"Know Your Customers. Know What Matters Next."*

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Automated Tests](https://img.shields.io/badge/tests-34%2F34%20passing-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)]()
[![Architecture](https://img.shields.io/badge/Architecture-MERN%20%2B%20AI%20Intelligence-navy.svg)]()

---

## 📌 Disclaimer & Portfolio Notice
**FinSight 360 is an independent educational and portfolio software project.**
- This application is **NOT** affiliated with ICICI Bank or any real banking institution.
- It does **NOT** use proprietary banking infrastructure, real customer data, or live regulatory systems.
- All customer profiles, account balances, credit limits, phone numbers, and company names are fictional and generated strictly for demonstration purposes.
- This platform does **NOT** provide actual credit approvals, loans, guarantees, investment recommendations, or regulated financial advice.

---

## 🧭 Problem & Solution

### The Core Question
In modern wealth and retail banking, Relationship Managers (RMs) manage portfolios of 50 to 200+ customers. RMs face cognitive overload from siloed transactions, forgotten follow-ups, fragmented emails, and dormant accounts:
> *"Which customers should I contact today, why should I contact them, and what should I do next?"*

### The FinSight 360 Solution
FinSight 360 transforms raw customer accounts and logs into **Actionable Relationship Intelligence**:

```
Customer Data + History + Follow-ups + Stated Needs + Engagement Signals
                                ↓
                 Signal & Intelligence Engine
                                ↓
  Relationship Health + Opportunity Detection + "Why Today?" Action Engine
                                ↓
      Suggested Next Actions + AI Customer Brief + Follow-up Tracker
```

---

## ✨ Key Features & Capabilities

### 1. 🎯 RM Command Center (Dashboard)
- **Real-Time KPIs**: Total Portfolio, Active Relationships, Attention Needed, Open Opportunity Pipeline (₹), Pending Tasks, New Leads, Average Health, Conversion Rate.
- **Today's Priorities Action Feed**: Ranked queue of customers requiring contact today with explicit reasons.
- **Portfolio Health Distribution**: Tiered breakdown (*Critical, Needs Attention, Good, Champion*).
- **Opportunity & Signal Tickers**: Live notifications of cross-sell events and dormancy alerts.

### 2. ⚡ "Why Today?" Priority Engine (Priority Center)
- **Deterministic Multi-Factor Scoring (0–100)**: Transparent weighting factoring dormancy (>60d: +25 pts), overdue tasks (+35 pts), active opportunities (+20 pts), and KYC flags (+15 pts).
- **Categorization**: *High Priority (80–100)*, *Medium Priority (60–79)*, *Monitor (40–59)*, *Low Priority (0–39)*.
- **Explainable Reasons**: Explicit human-readable bullet points explaining *why* action is recommended today.

### 3. 👤 Customer 360 (`/customers/:id`)
- **Relationship Health Indicator**: Live score (0–100) with an interactive **"Why 78?"** breakdown modal showing exact dimension weights (Engagement 25%, Recency 25%, Frequency 15%, Follow-up Reliability 15%, Depth 10%, KYC 10%).
- **Interactive Relationship Graph**: Visual SVG node canvas mapping *Customer ↔ Holdings ↔ Stated Goals ↔ Signals ↔ Opportunities ↔ Follow-ups*.
- **Unified Chronological Timeline**: Database-derived timeline of onboarding, accounts opened, meetings, signals, and follow-ups.
- **"What Changed?" Trend Analysis**: Rolling 30-day velocity comparison detecting surges or drop-offs in engagement.

### 4. 🤖 AI Customer Brief with Zero-Downtime Deterministic Fallback
- Generates executive call preparation briefs before RM outreach:
  - Executive Customer Summary
  - Relationship History & Inactivity Window
  - Primary Recommended Call Objective
  - 4 Structured Talking Points
  - Suitable Product Recommendations
  - Intelligence Rationale
- **AI Architecture**: Uses Google Gemini 1.5 Flash when `GEMINI_API_KEY` is provided. Seamlessly runs FinSight's internal deterministic rule-based engine when offline or unconfigured.

### 5. 📊 Relationship Radar
- Multi-dimensional matrix quadrant analysis (*Champions, High Opportunity, Needs Attention, Dormant*).
- Interactive Scatter Chart plotting **Relationship Health (X)** vs **Engagement (Y)** with bubble size representing Total Relationship Value.

### 6. 📋 Sales Pipeline & Kanban Board
- 7-Stage Pipeline (*NEW → CONTACTED → QUALIFIED → PROPOSAL → DOCUMENTATION → CONVERTED → LOST*).
- Single-click stage advancement with instant database persistence.
- 1-Click **"Convert to Customer"** workflow that creates a new customer profile, opens initial product accounts, creates KYC records, and runs initial health scoring.

### 7. 📅 Follow-up Center
- Categorized queues (*Today, Upcoming, Overdue, Completed*).
- Scheduling, rescheduling, and completion logger with outcome notes that update customer engagement recency.

### 8. 🛡️ KYC & Compliance Simulation
- Regulatory compliance tracker (*Verified, Pending, Submitted, Additional Information Required*).
- Identity, Address, and PAN document audit checklists with simulation verification triggers.

### 9. 🔍 Global Instant Search (`Ctrl+K`)
- Instant multi-entity fuzzy search grouping results across Customers, Leads, Follow-ups, and Opportunities.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Recharts, React Router v7, Axios, date-fns |
| **Backend** | Node.js, Express.js, Mongoose, JWT, bcryptjs, express-rate-limit, date-fns |
| **Database** | MongoDB / MongoDB Atlas (with automatic zero-config Embedded In-Memory MongoDB fallback) |
| **AI Integration** | Google Gemini API (`@google/generative-ai`) with deterministic fallback |
| **Design System** | Enterprise Light Banking Theme (Deep Navy `#0F2744`, Slate `#1E293B`, White/Off-White `#F8FAFC`, Emerald, Amber, Rose) |

---

## 🏛️ System Architecture

```
                               ┌──────────────────────────┐
                               │   FinSight 360 Frontend  │
                               │   React 18 + Tailwind    │
                               └─────────────┬────────────┘
                                             │ REST API (JWT)
                                             ▼
                               ┌──────────────────────────┐
                               │     Express.js API       │
                               │  Controllers & Security  │
                               └──────┬────────────┬──────┘
                                      │            │
             ┌────────────────────────┘            └────────────────────────┐
             ▼                                                              ▼
┌──────────────────────────┐                                  ┌──────────────────────────┐
│  Relationship Engine     │                                  │     Gemini AI Service    │
│  - Health Scoring (0-100)│                                  │  - Structured Prompting  │
│  - Signal Detection      │                                  │  - Google Gemini 1.5     │
│  - Priority "Why Today?" │                                  │  - Deterministic Fallback│
└────────────┬─────────────┘                                  └─────────────┬────────────┘
             │                                                              │
             └────────────────────────┬─────────────────────────────────────┘
                                      ▼
                       ┌──────────────────────────────┐
                       │     MongoDB Collections      │
                       │  - Customers  - Leads        │
                       │  - FollowUps  - Interactions │
                       │  - Signals    - Opps         │
                       │  - Products   - KYCRecords   │
                       └──────────────────────────────┘
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js >= 18.x (Tested on v24.x)
- npm >= 9.x

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/finsight-360.git
cd finsight-360
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

*(Optional)* In `backend/.env`, you can provide your own MongoDB URI or Gemini API key. If left blank, the app **automatically spins up an embedded in-memory MongoDB database and uses the built-in deterministic AI engine with zero setup required!*

Start the backend API server:
```bash
npm start
# or for development mode:
npm run dev
```
*API Server runs on `http://localhost:5001` (Health check: `http://localhost:5001/api/health`)*

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Senior Relationship Manager** | `rm@finsight.demo` | `Demo@123` |

*You can also click the **"Sign In as Senior RM (Demo@123)"** button on the login screen for instant 1-click demo access.*

---

## 🧪 Automated Testing Suite

The codebase includes two complete automated test suites:

### 1. Database & Unit Test Suite
```bash
cd backend
npm test
```
*Validates database seeding, collection counts, bcrypt auth, deterministic health formulas, signal detection, priority ranking, and KYC sync.*

### 2. Live End-to-End API Integration Suite
```bash
cd backend
node src/tests/e2e.test.js
```
*Validates all 21 HTTP routes, session authorization, Customer 360 generation, timeline assembly, lead conversion, follow-up state changes, and global search.*

---

## 📦 Seed Data Breakdown

The database seed generates realistic relational entities across 8 Indian metropolitan cities (*Jaipur, Delhi, Mumbai, Pune, Bengaluru, Hyderabad, Ahmedabad, Chennai*):

- **50 Fictional Customers** (Structured across *Young Professional, Salaried, Self-Employed, High Value, Family Banking, Dormant, New Customer*)
- **78 Leads** with product categories and valuation metrics
- **174 Interactions** with sentiment, outcomes, and channel tags
- **58 Follow-ups** across Today, Upcoming, Overdue, and Completed states
- **173 Relationship Signals** (Dormancy, Need intent, High engagement, KYC pending)
- **50 Solution Opportunities** with confidence scores and action triggers
- **50 KYC Records** with document checklists
- **10 Banking Solutions** in the Product Catalog
- **32 Action Notifications**

---

## 🚢 Production Deployment

### Frontend (Vercel / Netlify)
1. Build command: `npm run build`
2. Output directory: `dist`
3. Environment variables: `VITE_API_URL=https://your-backend-api.onrender.com/api`

### Backend (Render / Railway / Fly.io)
1. Build command: `npm install`
2. Start command: `node src/server.js`
3. Environment variables:
   - `PORT=5001`
   - `MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/finsight360`
   - `JWT_SECRET=your_production_secret_key`
   - `GEMINI_API_KEY=your_gemini_api_key`
   - `NODE_ENV=production`

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
