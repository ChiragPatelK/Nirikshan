# Nirikshan AI (निरीक्षण)

### AI-Powered Explainable Monitoring for MPLADS

> **Detect earlier. Explain clearly. Track continuously. Investigate smarter.**  
> *Problem Statement SIH26102 — Ministry of Statistics & Programme Implementation (MoSPI), Government of India*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61dafb)](client)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green)](server)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

Nirikshan AI is a monitoring and anomaly-analysis platform for the **Members of Parliament Local Area Development Scheme (MPLADS)**. It combines rule-based checks, peer comparison, statistical analysis, optional machine learning, contextual information, and database-grounded AI explanations to help monitoring officers identify works that may require investigation.

**Core principle:** AI detects and explains. Humans investigate and decide.

---

## 🚀 Free Deployment Guide

### Option 1: Render.com (Recommended — 100% Free Full-Stack Web Service)

Render hosts both the Node.js Express API and the React frontend on a single service with zero CORS configuration:

1. Create a free account at [render.com](https://render.com).
2. Click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository** and connect:  
   `https://github.com/ChiragPatelK/Nirikshan`
4. Configure the service settings:
   - **Name:** `nirikshan-ai`
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Click **Deploy Web Service**.
6. Render will build the client and start your server at a free HTTPS URL like:  
   `https://nirikshan-ai.onrender.com`

*(Alternatively, use the included `render.yaml` Blueprint for 1-click infrastructure deployment).*

---

### Option 2: Vercel (Free Serverless & Edge Hosting)

1. Sign up or log in to [vercel.com](https://vercel.com).
2. Click **Add New** → **Project**.
3. Import the `Nirikshan` GitHub repository.
4. Leave settings as default (the included `vercel.json` and `api/index.js` handle API routing and the Vite build).
5. Click **Deploy**.

---

## 1. Problem

MPLADS implementation involves multiple stages such as recommendation, sanction, expenditure, and completion. Monitoring large volumes of work and payment data manually can make it difficult to identify unusual patterns early.

Nirikshan AI is designed to surface potential issues such as:

- Unusual expenditure compared with the sanctioned amount
- Cost deviations from comparable works
- Unusually long execution duration
- Unusual payment patterns
- Repeated vendor patterns that may require review
- Potential duplicate or highly similar works
- Unusual fund-utilization patterns
- Changes in risk status over time

The platform does **not** automatically declare fraud. A flagged work represents a pattern that may require human review.

---

## 2. Key Features

### Dashboard
- Total works
- Risk distribution
- Priority alerts
- Fund utilization
- State/region patterns
- Vendor/payment patterns
- Trends
- Map-based location/context where reliable location data is available

### Work Risk Passport
A work-level monitoring view containing:

- Work identity
- MP
- State
- Work description
- Recommended amount
- Sanction amount
- Total expenditure
- Completion information
- Vendors
- Payment history
- Work status
- Risk level
- Risk history
- Contextual information
- **Why Flagged** evidence

### Universal Search

Search across:

- Work
- Work description
- MP
- State
- IDA
- Vendor
- Work ID where available
- Dates
- Amounts
- Status
- Source dataset

Example:

```text
Show high-risk works in Karnataka.
Why was this work flagged?
Which vendors have unusual patterns?
How much has been disbursed for this MP?
Find works similar to this one.
```

### AI Assistant

The chatbot is **database-first**. It queries structured application data before generating an answer. The LLM, when enabled, explains or formats results rather than acting as the source of truth.

### Anomaly Engine

Hybrid detection using:

1. Deterministic rules
2. Peer-group statistics
3. Pattern analysis
4. Optional machine learning

### Data Import

Supports MPLADS CSV datasets with validation, processing, and import summaries.

### What Changed?

After an import, surface:

- New works
- Updated expenditure
- New completions
- New risk signals
- Risk-level changes
- New vendor patterns

### Map

Uses **Leaflet + OpenStreetMap** where reliable geographic information is available.

The application must never fabricate coordinates. If precise coordinates are unavailable, show the available administrative location instead.

---

## 3. Risk Levels

| Level | Meaning |
|---|---|
| Low | No significant anomaly signal identified |
| Watch | Pattern deserves observation |
| High | Multiple or stronger anomaly signals require review |
| Critical | Strong combination of signals requiring priority investigation |

These labels indicate **risk/review priority**, not proof of fraud or misconduct.

Every important alert should show evidence explaining why it was generated.

Example:

```text
Why Flagged

• Expenditure is substantially above the peer benchmark.
• Execution duration is longer than comparable works.
• Multiple payment events occurred within a short period.

Interpretation:
This combination is unusual for comparable works and should be reviewed.
```

---

## 4. MPLADS Data

The target data consists of Lok Sabha and Rajya Sabha datasets covering six major data families:

1. Allocated limit for MPs
2. Amount consented for calamity
3. Works recommended
4. Works sanctioned
5. Work completed
6. Expenditure on completed and ongoing works

### Important Data Note

The recommended, sanctioned, and completed datasets do not necessarily contain a literal official **Work ID** column.

The expenditure dataset contains a **Work ID**.

The application must never invent an official Work ID. If an internal identifier is required for processing, it must be clearly named as an internal key.

---

## 5. Work Lifecycle

```text
Recommendation
      ↓
Sanction
      ↓
Expenditure during execution
      ↓
Completion
```

Expenditure can occur while a work is still ongoing.

---

## 6. Anomaly Detection

A single threshold is not sufficient to determine whether a work is anomalous.

Where sufficient data exists, compare works with appropriate peer groups using dimensions such as:

- Similar work category/type
- Region/state
- Time period
- Comparable financial scale

Possible signals:

### Cost deviation
Compare expenditure with sanction amount, remaining sanctioned amount, and comparable works.

### Duration deviation
For completed works:

```text
Completion Date - Sanction Date
```

For ongoing works:

```text
Current Date - Sanction Date
```

### Payment pattern
Analyze payment count, frequency, amounts, concentration, and status.

### Vendor pattern
Identify unusual patterns across works. A vendor appearing on many works is **not automatically suspicious**.

### Potential duplicate
Use normalized text and similarity techniques. Label results:

> **Potential duplicate — investigate**

Do not automatically declare fraud or wrongdoing.

---

## 7. Context Engine

Potential context can include:

- Calamity-related work context
- Reliable historical weather/context data where feasible
- Administrative location information

Future versions may add:

- Terrain
- Soil/land type
- Accessibility
- Satellite imagery
- Other reliable external datasets

Context should be presented as information that **may partially explain an anomaly**, not as automatic justification.

---

## 8. System Architecture

```text
                 MPLADS Data
                      │
                      ▼
              Data Import / ETL
                      │
                      ▼
              Unified Data Layer
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
   Feature Engineering      Context Enrichment
          │                       │
          └───────────┬───────────┘
                      ▼
              Anomaly Engine
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
     Rules       Peer Statistics      ML
       └──────────────┼──────────────┘
                      ▼
                Evidence Layer
                      │
                      ▼
                 Risk Engine
                      │
              ┌───────┴────────┐
              ▼                ▼
       Risk Passport       Dashboard
              │                │
              └───────┬────────┘
                      ▼
                AI Assistant
```

### Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Styling | MoSPI Design System / Source Serif 4 / Public Sans |
| Charts | Recharts |
| Maps | Leaflet + OpenStreetMap |
| Backend | Node.js + Express |
| Analytics | Statistical Benchmarks & Anomaly Scoring |
| Search | Filter & Index Query Engine |
| AI | Database-Grounded Assistant |
| API | REST |

---

## 9. Prototype Architecture

The prototype is **demo-first**, so PostgreSQL does not block development.

```text
Demo Repository
      ↓
Application Services
      ↓
REST API
      ↓
React Frontend
```

PostgreSQL can later replace the demo repository without requiring major frontend changes.

Backend structure:

```text
server/
├── data/
│   └── demoData.js
├── repositories/
│   └── demoRepository.js
├── services/
│   ├── riskEngine.js
│   ├── searchService.js
│   ├── importService.js
│   └── chatService.js
└── routes/
    ├── dashboard.js
    ├── works.js
    ├── search.js
    ├── alerts.js
    ├── states.js
    ├── vendors.js
    ├── importRoute.js
    └── chat.js
```

---

## 10. Multi-Role Governance

NIRIKSHAN AI implements official role-based viewpoints:
- **Ministry (National):** Full country overview, state-by-state fund utilization, aggregated risk alerts.
- **State Nodal Authority (SNA):** State-specific jurisdiction, district-level breakdown.
- **District Authority (IDA):** District-focused inspection queues, agency accountability.
- **Member of Parliament (MP):** Simplified constituency overview, local works, sanction tracking.

---

## 11. User Workflow

```text
Dashboard
   ↓
Priority Alert
   ↓
Work Risk Passport
   ↓
Why Flagged
   ↓
Evidence / Payment History / Risk History
   ↓
Search Similar Works or Vendors
   ↓
Map / Context
   ↓
Human Investigation
```

---

## 12. Local Development

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/ChiragPatelK/Nirikshan.git
cd Nirikshan

# Install dependencies (root & client)
npm install
npm run install-client

# Run both backend and frontend concurrently
npm run dev
```

- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`

### Production Build & Test Locally

```bash
# Build the React frontend
npm run build

# Start the full-stack production server
npm start
```
Open `http://localhost:5000` to preview the production build.

---

## 📁 Repository Structure

```
├── api/                   # Serverless entry point for Vercel
├── client/                # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable government design components (RiskBadge, KPICard, Navbar)
│   │   ├── context/       # RoleContext (Ministry, SNA, District, MP)
│   │   ├── pages/         # Dashboard, WorkPassport, Alerts, Works, Map, Vendors
│   │   └── services/      # API communication layer
│   └── index.html         # MoSPI header & theme initialization
├── server/                # Express backend
│   ├── data/              # Demo MPLADS datasets & benchmarks
│   ├── repositories/      # In-memory and file data repositories
│   ├── routes/            # REST API endpoints (/api/dashboard, /api/works, etc.)
│   └── services/          # Risk Engine, Chatbot, Search & CSV Import
├── package.json           # Root build orchestration
├── render.yaml            # Render infrastructure-as-code blueprint
└── vercel.json            # Vercel deployment configuration
```

---

## 🔒 License

This project is open-source under the [MIT License](LICENSE).
