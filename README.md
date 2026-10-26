# AuditPulse - Enterprise Digital Audit & Compliance Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-SQLite%20(ACID%20Embedded)-blue.svg)](https://sqlite.org/)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript%20%2B%20Vite-61DAFB.svg)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)

AuditPulse is an enterprise-grade digital audit and compliance platform designed to track audit tasks, execute compliance checks, perform digital document verification using cryptographic SHA-256 fingerprints, enhance transparency, and eliminate manual paperwork.

---

## ⚡ How to Run This Project

### Scenario 1: If the project is ALREADY on this laptop

1. **Option A (1-Click Run):**
   - Double-click the **`start.bat`** script in the project root directory.
   - It will verify dependencies and immediately launch both the backend server and frontend.

2. **Option B (Command Line):**
   - Open PowerShell or Command Prompt in the project directory:
     ```bash
     cd "D:\chrome download\audit-pulse\audit-pulse"
     npm run dev
     ```

3. **Access the Application:**
   - **Frontend UI:** Open your browser at **[http://localhost:5173](http://localhost:5173)**
   - **Backend REST API:** Open **[http://localhost:5000/api](http://localhost:5000/api)**
   - **API Health Check:** **[http://localhost:5000/api/health](http://localhost:5000/api/health)**

---

### Scenario 2: If the project is SHARED (ZIP) or PULLED from Git onto a new machine

#### Prerequisites
- **Node.js** (version 20 or higher recommended, e.g., Node 22 or 24) — download from [nodejs.org](https://nodejs.org/).
- **npm** (comes automatically with Node.js).

#### Setup Steps
1. **Extract or Clone the Repository:**
   - If you received `audit-pulse-shareable.zip`, extract it to any folder on your laptop.
   - If cloning from Git:
     ```bash
     git clone <repository-url>
     cd audit-pulse
     ```

2. **Install Dependencies:**
   - Open terminal in the project folder and run:
     ```bash
     npm install
     ```

3. **Start the Development Platform:**
   - Run the concurrent start command:
     ```bash
     npm run dev
     ```
   - *This single command concurrently launches the Express 5 backend on port `5000` (auto-initializing and seeding the SQLite database) and the Vite React frontend on port `5173` with reverse proxy.*

4. **Open in Browser:**
   - Visit **`http://localhost:5173`** to use the application.

#### Alternative: Run with Docker (Zero Node.js install required)
If you have Docker Desktop installed, you can run the entire platform with one command:
```bash
docker compose up --build
```
Access the application directly at `http://localhost:5000`.

---

## 🏛️ Platform Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        AuditPulse Architecture                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌──────────────────────────────────────┐  HTTP Proxy   ┌──────────────────────────────────────┐
│        Frontend (React 19)           │ ◄═══════════► │       Backend (Node / Express 5)     │
│  - Port 5173 (Dev with Vite HMR)     │  /api /upload │  - Port 5000                         │
│  - TypeScript & Tailwind CSS v4      │               │  - RESTful API Endpoints             │
│  - Dynamic KPI Dashboard             │               │  - Multer File Storage (/uploads)    │
│  - SHA-256 Verification Modal        │               │  - SHA-256 Cryptographic Engine      │
│  - Role Simulation Switcher          │               │  - Chronological Activity Trail      │
└──────────────────────────────────────┘               └──────────────────┬───────────────────┘
                                                                          │
                                                                          ▼
                                                       ┌──────────────────────────────────────┐
                                                       │        SQLite Relational Database    │
                                                       │  - data/audit_pulse.sqlite           │
                                                       │  - Zero-config, persistent, embedded │
                                                       │  - Automatic seed data on 1st run    │
                                                       └──────────────────────────────────────┘
```

---

## 📋 Core Features & Functionality

### 1. Audit Workspaces & Lifecycle Management
- Full lifecycle status transitions: `Draft` → `Planned` → `In Progress` → `Under Review` → `Completed` → `Archived`.
- Organize audits with scopes, owner, assigned auditors, target deadlines, departments, and priority levels (`Critical`, `High`, `Medium`, `Low`).
- Pre-loaded templates for **ISO 27001**, **SOC 2 Type II**, and **Internal Operational Controls** for instant workspace creation.

### 2. Configurable Compliance Checks
- Clear separation between **Workflow Status** (`Not Started`, `In Progress`, `Under Review`, `Completed`, `Blocked`) and **Evaluation Result** (`Pass`, `Fail`, `Partially Met`, `Pending`, `Not Applicable`).
- Directly link required evidence documents to specific compliance clauses.

### 3. Digital Document Verification & Cryptographic Fingerprinting
- **Real File Uploads:** Upload supporting evidence (PDFs, images, spreadsheets, reports) up to 50MB.
- **SHA-256 Checksum:** Automatic cryptographic hash generated and stored upon upload to guarantee file authenticity.
- **Auditor Verification Workflow:** Reviewers mark evidence as `Verified`, `Rejected`, or `Requires Revision` with custom feedback and timestamps.
- **Tamper Detection:** Live verification tool validates that stored files match their registered hash with zero alteration.
- **Evidence Downloads:** Direct file downloads and downloadable **AuditPulse Digital Evidence Certificates**.

### 4. Tasks & Corrective Action Plans (CAPA)
- Actionable task assignment with due dates, priority, comments count, and status tracking (`Not Started`, `In Progress`, `Submitted`, `Under Review`, `Completed`, `Overdue`).
- Automatically turn failed compliance checks into **Findings**.
- Create and assign **Corrective Actions** linked to findings with verification sign-offs.

### 5. Transparency & Immutable Activity Trail
- Chronological, tamper-evident activity logging for every user action (creation, status update, document review, finding resolution).
- Real-time KPI dashboard displaying pass rates, overdue counts, document verification percentages, and open findings.

### 6. Role Simulation Matrix
Switch between roles instantly in the navbar to test role permissions:
- **Admin**: Full administrative governance and configuration.
- **Audit Manager**: Audit planning, scope definition, and sign-offs.
- **Auditor**: Check evaluation, evidence verification, and finding logging.
- **Contributor**: Task execution and evidence submission.
- **Viewer**: Read-only oversight for executives and stakeholders.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & system status |
| `GET` | `/api/stats` | Dynamic dashboard KPIs & compliance rates |
| `GET` | `/api/audits` | List all audits |
| `POST` | `/api/audits` | Create new audit (supports template instantiation) |
| `GET` | `/api/audits/:id` | Get full audit details with tasks, checks, and findings |
| `PUT` | `/api/audits/:id` | Update audit details / status |
| `DELETE` | `/api/audits/:id` | Delete audit and cascade related records |
| `GET` | `/api/tasks` | List audit tasks (supports `?audit_id=`) |
| `POST` | `/api/tasks` | Create task and assign to user |
| `PUT` | `/api/tasks/:id` | Update task status (`In Progress`, `Completed`, etc.) |
| `GET` | `/api/checks` | List compliance checks |
| `PUT` | `/api/checks/:id/evaluate` | Evaluate check result (`Pass`, `Fail`, `Pending`) |
| `GET` | `/api/documents` | List evidence documents |
| `POST` | `/api/documents/upload` | Multipart file upload with SHA-256 fingerprinting |
| `POST` | `/api/documents/:id/review` | Auditor verification (`Verified`, `Rejected`) |
| `GET` | `/api/documents/:id/verify` | Cryptographic integrity & tamper detection check |
| `GET` | `/api/documents/:id/download` | Download evidence file or digital certificate |
| `GET` | `/api/findings` | List findings and linked corrective actions |
| `POST` | `/api/findings` | Record new audit finding |
| `POST` | `/api/findings/:id/actions` | Add corrective action plan (CAPA) |
| `PUT` | `/api/findings/:id/actions/:actionId` | Update corrective action status |
| `GET` | `/api/activities` | Audit trail & chronological system log |
| `GET` | `/api/templates` | Pre-defined audit templates (ISO 27001, SOC 2) |
| `GET` | `/api/users` | Platform users and departments |

---

## 🗄️ Database Schema (SQLite)

The system automatically initializes and seeds an embedded SQLite database at `data/audit_pulse.sqlite`:
- `organizations`: Enterprise tenant and metadata.
- `users`: User profiles with roles (Admin, Audit Manager, Auditor, Contributor, Viewer).
- `audits`: Top-level audit activities, scopes, and target dates.
- `audit_tasks`: Actionable assignments with priorities and deadlines.
- `compliance_checks`: Verifiable criteria with pass/fail evaluation.
- `evidence_documents`: Uploaded evidence, file paths, SHA-256 checksums, and verification records.
- `findings`: Non-compliance issues and risk observations.
- `corrective_actions`: CAPA plans linked to findings.
- `activity_logs`: Immutable chronological audit trail.
- `audit_templates`: Reusable frameworks for standardized auditing.

---

## 📦 How to Re-Package for Sharing

To create a clean, lightweight (~150 KB) ZIP archive ready for emailing, LMS submission, or sharing:
```powershell
powershell -ExecutionPolicy Bypass -File .\package-project.ps1
```
This generates `audit-pulse-shareable.zip` in the parent directory, automatically excluding heavy `node_modules` and temporary build cache files.
