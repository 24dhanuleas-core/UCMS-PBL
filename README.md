# University Club Management System (UCMS)

> **Software Engineering Project-Based Learning (PBL) Activity**  
> **Student:** Arya Dhanule (Roll No: 64, Batch: A6_B4)  
> **Institution:** Ramdeobaba University (RBU), Nagpur  

---

## 📌 Project Overview

In higher education institutions, student-led organizations conduct dozens of extracurricular activities annually. Managing event proposals, venue allocations, budgets, and attendance through fragmented channels (forms, manual sheets, chats) results in double-booking, overspending, attendance fabrication, and administrative delays.

The **University Club Management System (UCMS)** is an integrated web platform connecting **Students**, **Club Officers**, **Faculty Advisors**, and **Campus Administrators**.

### 🌟 Core Modules Implemented & Tested

1. **Module 1: Event Proposal & Multi-Tier Approval Workflow**
   - **Automated Venue Collision Locking:** Master campus calendar engine prevents overlapping auditorium reservations.
   - **Itemized Budget Quotas:** Enforces tier limits ($1,500 maximum cap) with client-side sanitization.
   - **State Machine Workflow:** Governed review transitions (`Draft` &rarr; `PENDING_APPROVAL` &rarr; `APPROVED` / `NEEDS_REVISION` / `REJECTED`).

2. **Module 2: QR-Code Event Pass & Attendance Verification System**
   - **High-Contrast 2D QR Barcode Passes:** Encrypted ticket token payload (`UCMS-AUTH:{EventId}:{TicketId}:{PRN}:SIG-{Hash}`).
   - **Real-Time Scanner Console:** Viewfinder simulation with webcam and fast-token validation.
   - **Atomic Duplicate Prevention:** Immediate race-condition check prevents double check-ins.
   - **Verified Participation Certificates:** Dynamically unlocked with verification watermark once attendance is verified.

---

## 🚀 Live Demo & Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/ucms-project.git
   cd ucms-project
   ```

2. **Run the Application:**
   Simply open `index.html` in any modern web browser, or serve it using a lightweight local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   ```
   Navigate to `http://localhost:8000` in your browser.

---

## 🎯 JIRA Agile Scrum Integration

The project was managed using the **Agile Scrum Framework** on Atlassian Jira Cloud:

- **Sprint 1: Event Lifecycle & Multi-Tier Approvals (Velocity: 15 Story Points)**
  - `UCMS-101`: Club Officer Event Proposal Submission & Budget Tracking (5 SP)
  - `UCMS-102`: Automated Campus Venue Conflict Detection & Calendar Locking (5 SP)
  - `UCMS-103`: Faculty Advisor Review, Approval & Revision Workflow (5 SP)
- **Sprint 2: QR Attendance & Digital Passes (Velocity: 16 Story Points)**
  - `UCMS-104`: Student Registration & High-Contrast 2D QR Entry Pass Generation (5 SP)
  - `UCMS-105`: Real-Time Mobile Web QR Scanner with Atomic Duplicate Check-In Prevention (8 SP)
  - `UCMS-106`: Automated Certificate of Participation Generation for Verified Attendees (3 SP)
- **Product Backlog:** RBAC Governance, Master Calendar, and Demographics Analytics.
- **Defect Tracker:** 5 tracked defects with reproduction steps, root cause analysis, and retesting evidence.

### Running the Jira Cloud Sync Script

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Fill in your Jira Cloud domain, email, and API token in .env

# 3. Run synchronization
python run_jira_sync.py
```

---

## 🧪 Testing & Quality Assurance

- **Comprehensive Test Suite:** 32 executed test cases covering Boundary Value Analysis (BVA), Equivalence Partitioning (EP), Functional, Integration, and Security testing.
- **Artifacts:**
  - `UCMS_Test_Cases_and_Bug_Tracker.xlsx`: Formatted Excel execution sheet with Defect Matrix.
  - `UCMS_PBL_Project_Report.md`: Full IEEE Std 830-aligned project report with Mermaid diagrams and code fix diffs.

---

## 📁 Repository Structure

```
ucms-project/
├── index.html                           # Main interactive single-page application UI
├── style.css                            # Modern glassmorphic responsive styling
├── app.js                               # Application state machine, venue lock & scanner engine
├── qrcode.min.js                        # Client-side 2D QR code generator library
├── jira_sync.py                         # Reusable Jira Cloud REST API automation client
├── run_jira_sync.py                     # Script to populate sprints, stories, and defects
├── generate_excel.py                    # Generator for the Excel test cases workbook
├── UCMS_PBL_Project_Report.md           # Formal PBL submission report
├── UCMS_Test_Cases_and_Bug_Tracker.xlsx # Formatted 32-case QA spreadsheet
├── .env.example                         # Environment configuration template
├── .gitignore                           # Git ignore rules for secrets and caches
└── README.md                            # Project documentation
```

---

## 📄 License & Attribution

Developed for Software Engineering (SE Lab) Individual Project-Based Learning (PBL) by **Arya Dhanule** (Roll No: 64, Batch: A6_B4).
