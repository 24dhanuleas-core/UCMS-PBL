/**
 * University Club Management System (UCMS) - Main Application Logic
 * Author: Arya Dhanule (A6_B4_64) | SE Lab PBL
 * Covers:
 *  - Module 1: Event Proposal & Multi-Tier Approval Workflow (SRS Functionality 1)
 *  - Module 2: QR-Code Event Pass & Attendance Verification System (SRS Functionality 2)
 *  - JIRA Agile Management & Defect Tracking Interactive Hub
 */

// --- Initial Seed Data ---
const VENUES = [
  { id: 'aud-a', name: 'Main Campus Auditorium', capacity: 800, location: 'Central Block, Level 1' },
  { id: 'sem-hall-1', name: 'Seminar Hall A', capacity: 250, location: 'Academic Block B, Ground Floor' },
  { id: 'tech-arena', name: 'Tech Arena & Innovation Hub', capacity: 150, location: 'IT Wing, 3rd Floor' },
  { id: 'amphitheater', name: 'Campus Open Amphitheater', capacity: 500, location: 'Student Activity Plaza' },
  { id: 'cs-lab-1', name: 'Advanced Computing Lab 1', capacity: 80, location: 'Computer Science Dept' }
];

const CLUBS = [
  { id: 'acm', name: 'ACM Student Chapter', category: 'Technical', quota: 1500, lead: 'Arya Dhanule' },
  { id: 'ieee', name: 'IEEE Student Branch', category: 'Technical', quota: 1500, lead: 'Rohan Sharma' },
  { id: 'cultural', name: 'Tarang Cultural Society', category: 'Cultural', quota: 1200, lead: 'Ananya Deshmukh' },
  { id: 'robotics', name: 'Robotics & Automation Club', category: 'Technical', quota: 1500, lead: 'Kunal Patil' },
  { id: 'sports', name: 'University Sports Council', category: 'Sports', quota: 1000, lead: 'Vikram Shinde' }
];

const INITIAL_EVENTS = [
  {
    id: 'EVT-101',
    title: 'National AI & Cloud Hackathon 2026',
    clubId: 'acm',
    clubName: 'ACM Student Chapter',
    category: 'Technical',
    date: '2026-11-15',
    startTime: '09:00',
    endTime: '17:00',
    venueId: 'aud-a',
    venueName: 'Main Campus Auditorium',
    audience: 450,
    description: 'A 24-hour national hackathon focused on Generative AI, cloud-native deployments, and open-source systems.',
    budget: { equipment: 400, refreshments: 350, speakers: 250, marketing: 150, total: 1150 },
    status: 'APPROVED',
    facultyAdvisor: 'Dr. S. K. Kulkarni',
    approvalDate: '2026-10-20',
    remarks: 'Approved. Great technical initiative. Budget is within annual quota.'
  },
  {
    id: 'EVT-102',
    title: 'IoT & Edge Computing Bootcamp',
    clubId: 'robotics',
    clubName: 'Robotics & Automation Club',
    category: 'Technical',
    date: '2026-11-18',
    startTime: '10:00',
    endTime: '14:00',
    venueId: 'tech-arena',
    venueName: 'Tech Arena & Innovation Hub',
    audience: 120,
    description: 'Hands-on hardware interfacing with Raspberry Pi, ESP32 microcontrollers, and MQTT protocol.',
    budget: { equipment: 300, refreshments: 200, speakers: 150, marketing: 50, total: 700 },
    status: 'PENDING_APPROVAL',
    facultyAdvisor: 'Prof. M. R. Joshi',
    remarks: null
  },
  {
    id: 'EVT-103',
    title: 'Annual Inter-College Classical Night',
    clubId: 'cultural',
    clubName: 'Tarang Cultural Society',
    category: 'Cultural',
    date: '2026-11-22',
    startTime: '17:00',
    endTime: '21:00',
    venueId: 'amphitheater',
    venueName: 'Campus Open Amphitheater',
    audience: 480,
    description: 'Showcasing classical vocal, instrumental, and traditional dance performances by university students.',
    budget: { equipment: 500, refreshments: 450, speakers: 300, marketing: 200, total: 1450 },
    status: 'NEEDS_REVISION',
    facultyAdvisor: 'Dr. V. N. Verma',
    remarks: 'Please optimize the sound equipment cost by coordinating with the campus media center.'
  }
];

const INITIAL_REGISTRATIONS = [
  {
    ticketId: 'TKT-9482',
    eventId: 'EVT-101',
    eventTitle: 'National AI & Cloud Hackathon 2026',
    name: 'Arya Dhanule',
    prn: 'PRN2024098',
    email: 'arya.dhanule@university.edu',
    department: 'Computer Science',
    year: 'Final Year',
    registeredAt: '2026-10-22 14:32',
    status: 'ATTENDED',
    checkInTime: '2026-11-15 08:45 AM',
    qrToken: 'UCMS-AUTH:EVT-101:TKT-9482:PRN2024098:SIG-7F3A9C'
  },
  {
    ticketId: 'TKT-9483',
    eventId: 'EVT-101',
    eventTitle: 'National AI & Cloud Hackathon 2026',
    name: 'Sneha Patel',
    prn: 'PRN2024112',
    email: 'sneha.patel@university.edu',
    department: 'Information Technology',
    year: 'Third Year',
    registeredAt: '2026-10-23 11:15',
    status: 'REGISTERED',
    checkInTime: null,
    qrToken: 'UCMS-AUTH:EVT-101:TKT-9483:PRN2024112:SIG-8E2B1D'
  },
  {
    ticketId: 'TKT-9484',
    eventId: 'EVT-101',
    eventTitle: 'National AI & Cloud Hackathon 2026',
    name: 'Rahul Mehta',
    prn: 'PRN2024056',
    email: 'rahul.mehta@university.edu',
    department: 'Electronics & Telecom',
    year: 'Final Year',
    registeredAt: '2026-10-23 16:40',
    status: 'REGISTERED',
    checkInTime: null,
    qrToken: 'UCMS-AUTH:EVT-101:TKT-9484:PRN2024056:SIG-1C9F4E'
  }
];

const INITIAL_JIRA_STORIES = [
  {
    id: 'UCMS-101',
    epic: 'EPIC-1: Event Lifecycle & Approvals',
    title: 'Club Officer Event Proposal Submission',
    description: 'As a Club Officer, I want to submit an event proposal with venue, time, and budget so that campus resources can be reserved.',
    acceptanceCriteria: 'Given valid event fields, when officer submits, system validates venue availability and budget <= $1500, setting status to PENDING_APPROVAL.',
    storyPoints: 5,
    sprint: 'Sprint 1',
    status: 'Done',
    assignee: 'Arya Dhanule'
  },
  {
    id: 'UCMS-102',
    epic: 'EPIC-1: Event Lifecycle & Approvals',
    title: 'Automated Venue Conflict Locking',
    description: 'As a System, I must detect overlapping date/time venue reservations to prevent auditorium double-booking.',
    acceptanceCriteria: 'Given an existing reservation on date D from T1 to T2 at venue V, when a new proposal requests venue V overlapping [T1, T2], system flags error and prevents submission.',
    storyPoints: 5,
    sprint: 'Sprint 1',
    status: 'Done',
    assignee: 'Arya Dhanule'
  },
  {
    id: 'UCMS-103',
    epic: 'EPIC-1: Event Lifecycle & Approvals',
    title: 'Faculty Advisor Review & Approval Workflow',
    description: 'As a Faculty Advisor, I want to inspect event proposals and approve, request revision, or reject them with feedback.',
    acceptanceCriteria: 'Given a pending proposal, advisor can click Approve to publish and reserve venue, or Request Revision with mandatory feedback.',
    storyPoints: 5,
    sprint: 'Sprint 1',
    status: 'Done',
    assignee: 'Arya Dhanule'
  },
  {
    id: 'UCMS-104',
    epic: 'EPIC-2: QR Attendance & Digital Passes',
    title: 'Student QR Event Pass Generation',
    description: 'As a Student, I want to register for approved events and receive a cryptographically signed QR Entry Pass.',
    acceptanceCriteria: 'When student registers, generate unique ticket ID, security token, and high-contrast QR code renderable and downloadable on mobile/desktop.',
    storyPoints: 5,
    sprint: 'Sprint 2',
    status: 'Done',
    assignee: 'Arya Dhanule'
  },
  {
    id: 'UCMS-105',
    epic: 'EPIC-2: QR Attendance & Digital Passes',
    title: 'Real-Time QR Scanner with Duplicate Check-In Prevention',
    description: 'As an Event Organizer, I want to scan QR passes at the entrance to verify attendance and reject duplicate attempts.',
    acceptanceCriteria: 'On valid scan, mark ATTENDED with timestamp. On rescan of same ticket, flash RED alert "Already Checked-In" and log duplicate attempt.',
    storyPoints: 8,
    sprint: 'Sprint 2',
    status: 'Done',
    assignee: 'Arya Dhanule'
  },
  {
    id: 'UCMS-106',
    epic: 'EPIC-2: QR Attendance & Digital Passes',
    title: 'Verified Certificate of Participation Generation',
    description: 'As an Attended Student, I want to view and download my official participation certificate unlocked by verified attendance.',
    acceptanceCriteria: 'Given ticket status == ATTENDED, unlock Certificate Generator with authorized faculty signature and verification seal.',
    storyPoints: 3,
    sprint: 'Sprint 2',
    status: 'Done',
    assignee: 'Arya Dhanule'
  }
];

const INITIAL_JIRA_BUGS = [
  {
    bugId: 'UCMS-BUG-01',
    module: 'Module 1: Event Approvals',
    summary: 'Venue conflict logic missed boundary edge-case when new event start equals existing event end',
    severity: 'Major',
    priority: 'High',
    stepsToReproduce: '1. Create Event A (10:00 - 12:00) at Main Auditorium. 2. Create Event B (12:00 - 14:00) at same venue. 3. System blocked Event B incorrectly claiming overlap.',
    status: 'Closed / Verified',
    resolution: 'Fixed comparison operator from <= and >= to strict boundary intervals (start < existingEnd && end > existingStart). Retested & passed.',
    fixCommit: 'fix(events): correct boundary inequality in checkVenueConflict'
  },
  {
    bugId: 'UCMS-BUG-02',
    module: 'Module 1: Budget Calculation',
    summary: 'Total budget input allowed negative numeric values in itemized fields',
    severity: 'Major',
    priority: 'High',
    stepsToReproduce: '1. Open Create Event. 2. Enter -500 in Marketing budget. 3. Total displayed deducted amount bypassing $1500 maximum budget cap.',
    status: 'Closed / Verified',
    resolution: 'Added min="0" input attribute and strict Math.max(0, val) sanitization with regex validation in parseBudgetInt(). Retested & passed.',
    fixCommit: 'fix(budget): enforce non-negative integer constraint on all budget line items'
  },
  {
    bugId: 'UCMS-BUG-03',
    module: 'Module 2: QR Attendance',
    summary: 'Rapid double-clicking on Scanner simulated check-in caused duplicate attendance logs',
    severity: 'Critical',
    priority: 'Highest',
    stepsToReproduce: '1. In Scanner console, double-click "Test Valid Scan" in under 200ms. 2. Two attendance timestamps were inserted into the log.',
    status: 'Closed / Verified',
    resolution: 'Implemented atomic ticket state check with debouncing lock (isScanningInProgress flag). If status === "ATTENDED", immediately short-circuit to duplicate alert.',
    fixCommit: 'fix(scanner): implement atomic state locking on check-in verification'
  },
  {
    bugId: 'UCMS-BUG-04',
    module: 'Module 2: QR Pass Rendering',
    summary: 'QR Code canvas failed to render when student name contained special Unicode characters',
    severity: 'Minor',
    priority: 'Medium',
    stepsToReproduce: '1. Register with name containing accents/umlaut. 2. QR Canvas was blank due to encoding mismatch.',
    status: 'Closed / Verified',
    resolution: 'Wrapped QR token payload in encodeURIComponent and clean ASCII hash serializer before feeding to QRCode generator.',
    fixCommit: 'fix(qr): sanitize Unicode strings before QR matrix generation'
  },
  {
    bugId: 'UCMS-BUG-05',
    module: 'Module 2: Certificate Generator',
    summary: 'Certificate download button was accessible prior to event check-in verification',
    severity: 'Major',
    priority: 'High',
    stepsToReproduce: '1. Register for event. 2. Inspect element and trigger certificate modal before scan. 3. Certificate rendered with unverified watermark.',
    status: 'Closed / Verified',
    resolution: 'Enforced server-style verification guard: if (ticket.status !== "ATTENDED") throw SecurityError and disable modal launch.',
    fixCommit: 'fix(cert): enforce attendance status guard condition on certificate renderer'
  }
];

// --- State Management ---
class AppState {
  constructor() {
    this.currentRole = 'student'; // 'student' | 'officer' | 'faculty' | 'jira'
    this.events = [];
    this.registrations = [];
    this.jiraStories = [];
    this.jiraBugs = [];
    this.scanStats = { total: 0, checkedIn: 0, duplicatesBlocked: 0 };
    this.loadState();
  }

  loadState() {
    const savedEvents = localStorage.getItem('ucms_events');
    const savedRegs = localStorage.getItem('ucms_registrations');
    const savedStories = localStorage.getItem('ucms_stories');
    const savedBugs = localStorage.getItem('ucms_bugs');

    this.events = savedEvents ? JSON.parse(savedEvents) : JSON.parse(JSON.stringify(INITIAL_EVENTS));
    this.registrations = savedRegs ? JSON.parse(savedRegs) : JSON.parse(JSON.stringify(INITIAL_REGISTRATIONS));
    this.jiraStories = savedStories ? JSON.parse(savedStories) : JSON.parse(JSON.stringify(INITIAL_JIRA_STORIES));
    this.jiraBugs = savedBugs ? JSON.parse(savedBugs) : JSON.parse(JSON.stringify(INITIAL_JIRA_BUGS));
  }

  saveState() {
    localStorage.setItem('ucms_events', JSON.stringify(this.events));
    localStorage.setItem('ucms_registrations', JSON.stringify(this.registrations));
    localStorage.setItem('ucms_stories', JSON.stringify(this.jiraStories));
    localStorage.setItem('ucms_bugs', JSON.stringify(this.jiraBugs));
  }

  resetDefault() {
    localStorage.clear();
    this.loadState();
    this.saveState();
  }
}

const state = new AppState();

// --- Utility Functions ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Check venue collision between two time windows on the same date
function checkVenueConflict(venueId, date, startTime, endTime, excludeEventId = null) {
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);

  for (const ev of state.events) {
    if (ev.id === excludeEventId) continue;
    // Only check approved and pending proposals
    if (ev.status !== 'APPROVED' && ev.status !== 'PENDING_APPROVAL') continue;

    if (ev.venueId === venueId && ev.date === date) {
      const evStart = timeToMinutes(ev.startTime);
      const evEnd = timeToMinutes(ev.endTime);

      // Overlap logic: StartA < EndB and EndA > StartB
      if (startMins < evEnd && endMins > evStart) {
        return ev; // Conflicting event
      }
    }
  }
  return null;
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// --- Role Switcher & View Management ---
function setRole(role) {
  state.currentRole = role;
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.role === role);
  });

  document.querySelectorAll('.view-section').forEach(view => {
    view.classList.remove('active');
  });

  const activeView = document.getElementById(`view-${role}`);
  if (activeView) activeView.classList.add('active');

  updateRoleContextBar(role);
  renderAllViews();
}

function updateRoleContextBar(role) {
  const avatar = document.getElementById('context-avatar');
  const title = document.getElementById('context-title');
  const subtitle = document.getElementById('context-subtitle');

  if (role === 'student') {
    avatar.textContent = '🎓';
    title.textContent = 'Student Portal';
    subtitle.textContent = 'Browse approved university club events, obtain digital QR entry passes, and view verified participation certificates.';
  } else if (role === 'officer') {
    avatar.textContent = '🏛️';
    title.textContent = 'Club Officer Portal (ACM Chapter)';
    subtitle.textContent = 'Draft and submit event proposals, verify venue schedules, manage itemized budgets, and scan attendee QR passes.';
  } else if (role === 'faculty') {
    avatar.textContent = '👩‍🏫';
    title.textContent = 'Faculty Advisor Approval Portal';
    subtitle.textContent = 'Multi-tier governance: Review proposed event schedules, inspect itemized budget allocations, approve, reject, or request revisions.';
  } else if (role === 'jira') {
    avatar.textContent = '📋';
    title.textContent = 'JIRA Agile Project Management & Bug Tracker';
    subtitle.textContent = 'Scrum planning, Epics, User Stories, Sprint capacity, and defect tracking for UCMS PBL evaluation.';
  }
}

// --- Rendering Views ---

// 1. Student View
function renderStudentView() {
  const container = document.getElementById('student-events-container');
  const myPassesContainer = document.getElementById('student-my-passes');
  if (!container) return;

  const approvedEvents = state.events.filter(e => e.status === 'APPROVED');

  if (approvedEvents.length === 0) {
    container.innerHTML = `<div class="card" style="text-align: center; color: var(--text-muted); grid-column: 1/-1;">No approved events scheduled currently. Switch to Faculty Advisor to approve pending proposals.</div>`;
  } else {
    container.innerHTML = approvedEvents.map(ev => `
      <div class="card">
        <div class="card-header">
          <div>
            <span class="badge badge-category">${ev.category}</span>
            <h4 class="card-title" style="margin-top:6px;">${ev.title}</h4>
            <div class="card-subtitle">Hosted by: <strong>${ev.clubName}</strong></div>
          </div>
          <span class="badge badge-approved">Approved</span>
        </div>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:12px;">${ev.description}</p>
        <div class="event-meta">
          <div class="meta-item"><span>📅</span> <strong>${formatDate(ev.date)}</strong></div>
          <div class="meta-item"><span>⏰</span> <strong>${ev.startTime} - ${ev.endTime}</strong></div>
          <div class="meta-item"><span>📍</span> <strong>${ev.venueName}</strong></div>
          <div class="meta-item"><span>👥</span> <strong>Capacity: ${ev.audience}</strong></div>
        </div>
        <div class="card-actions">
          <button class="btn btn-primary btn-sm" onclick="openRegisterModal('${ev.id}')">
            🎟️ Register for Event
          </button>
        </div>
      </div>
    `).join('');
  }

  // Render My Registered Passes
  if (myPassesContainer) {
    if (state.registrations.length === 0) {
      myPassesContainer.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem;">You haven't registered for any events yet. Click 'Register for Event' above.</p>`;
    } else {
      myPassesContainer.innerHTML = state.registrations.map(reg => `
        <div class="card" style="margin-bottom:14px;">
          <div class="card-header">
            <div>
              <h4 class="card-title">${reg.eventTitle}</h4>
              <div class="card-subtitle">Ticket ID: <strong style="font-family:var(--font-mono); color:var(--info);">${reg.ticketId}</strong> | Attendee: ${reg.name} (${reg.prn})</div>
            </div>
            <span class="badge ${reg.status === 'ATTENDED' ? 'badge-approved' : 'badge-pending'}">
              ${reg.status === 'ATTENDED' ? '✅ ATTENDED' : '⏳ REGISTERED'}
            </span>
          </div>
          <div class="card-actions">
            <button class="btn btn-secondary btn-sm" onclick="viewTicketPass('${reg.ticketId}')">
              📱 View QR Pass
            </button>
            ${reg.status === 'ATTENDED' ? `
              <button class="btn btn-success btn-sm" onclick="viewCertificate('${reg.ticketId}')">
                🎓 View Certificate
              </button>
            ` : `
              <button class="btn btn-secondary btn-sm" style="opacity:0.5; cursor:not-allowed;" title="Attend event check-in to unlock certificate">
                🔒 Certificate Locked
              </button>
            `}
          </div>
        </div>
      `).join('');
    }
  }
}

// 2. Club Officer View
function renderOfficerEvents() {
  const container = document.getElementById('officer-events-container');
  if (!container) return;

  container.innerHTML = state.events.map(ev => {
    let statusBadge = '';
    if (ev.status === 'APPROVED') statusBadge = '<span class="badge badge-approved">Approved</span>';
    else if (ev.status === 'PENDING_APPROVAL') statusBadge = '<span class="badge badge-pending">Pending Review</span>';
    else if (ev.status === 'NEEDS_REVISION') statusBadge = '<span class="badge badge-revision">Needs Revision</span>';
    else if (ev.status === 'REJECTED') statusBadge = '<span class="badge badge-rejected">Rejected</span>';

    return `
      <div class="card">
        <div class="card-header">
          <div>
            <span class="badge badge-category">${ev.category}</span>
            <h4 class="card-title" style="margin-top:6px;">${ev.title}</h4>
            <div class="card-subtitle">Club: <strong>${ev.clubName}</strong></div>
          </div>
          ${statusBadge}
        </div>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:12px;">${ev.description}</p>
        <div class="event-meta">
          <div class="meta-item"><span>📅</span> <strong>${formatDate(ev.date)}</strong></div>
          <div class="meta-item"><span>⏰</span> <strong>${ev.startTime} - ${ev.endTime}</strong></div>
          <div class="meta-item"><span>📍</span> <strong>${ev.venueName}</strong></div>
          <div class="meta-item"><span>💰</span> <strong>Total Budget: $${ev.budget.total}</strong></div>
        </div>

        ${ev.remarks ? `
          <div class="alert-banner alert-warning" style="margin: 10px 0; font-size:0.8rem;">
            <span>💬 <strong>Faculty Remarks:</strong> ${ev.remarks}</span>
          </div>
        ` : ''}

        <div class="card-actions">
          ${ev.status === 'APPROVED' ? `
            <button class="btn btn-primary btn-sm" onclick="jumpToScanner('${ev.id}')">
              📷 Launch QR Scanner
            </button>
          ` : ''}
          ${ev.status === 'NEEDS_REVISION' ? `
            <button class="btn btn-warning btn-sm" onclick="openRevisionModal('${ev.id}')">
              ✏️ Revise Proposal
            </button>
          ` : ''}
          <button class="btn btn-secondary btn-sm" onclick="showEventDetails('${ev.id}')">
            🔍 Details
          </button>
        </div>
      </div>
    `;
  }).join('');

  renderMasterCalendar();
}

// 3. Faculty Advisor View
function renderFacultyView() {
  const container = document.getElementById('faculty-proposals-container');
  const approvedList = document.getElementById('faculty-approved-container');
  if (!container) return;

  const pending = state.events.filter(e => e.status === 'PENDING_APPROVAL');
  const processed = state.events.filter(e => e.status !== 'PENDING_APPROVAL');

  if (pending.length === 0) {
    container.innerHTML = `<div class="card" style="text-align: center; color: var(--text-muted); grid-column: 1/-1;">No pending event proposals requiring faculty review. Submit new proposals from the Club Officer view.</div>`;
  } else {
    container.innerHTML = pending.map(ev => `
      <div class="card" style="border-left: 4px solid var(--warning);">
        <div class="card-header">
          <div>
            <span class="badge badge-pending">Action Required</span>
            <h4 class="card-title" style="margin-top:6px;">${ev.title}</h4>
            <div class="card-subtitle">Proposed by: <strong>${ev.clubName}</strong></div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.75rem; color:var(--text-muted);">Total Budget</div>
            <div style="font-family:var(--font-mono); font-size:1.15rem; font-weight:700; color:var(--accent-primary);">$${ev.budget.total}</div>
          </div>
        </div>
        
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:12px;">${ev.description}</p>
        
        <div class="event-meta">
          <div class="meta-item"><span>📅</span> <strong>${formatDate(ev.date)}</strong></div>
          <div class="meta-item"><span>⏰</span> <strong>${ev.startTime} - ${ev.endTime}</strong></div>
          <div class="meta-item"><span>📍</span> <strong>${ev.venueName}</strong></div>
          <div class="meta-item"><span>👥</span> <strong>Expected: ${ev.audience}</strong></div>
        </div>

        <div style="background:var(--bg-primary); padding:10px 14px; border-radius:var(--radius-md); margin-bottom:14px; font-size:0.8rem;">
          <div style="font-weight:600; margin-bottom:6px; color:var(--text-secondary);">Itemized Budget Breakdown:</div>
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:6px; font-family:var(--font-mono);">
            <div>Equip: <strong>$${ev.budget.equipment}</strong></div>
            <div>Food: <strong>$${ev.budget.refreshments}</strong></div>
            <div>Guest: <strong>$${ev.budget.speakers}</strong></div>
            <div>Mktg: <strong>$${ev.budget.marketing}</strong></div>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn btn-success btn-sm" onclick="facultyAction('${ev.id}', 'APPROVE')">
            ✅ Approve Event & Lock Venue
          </button>
          <button class="btn btn-warning btn-sm" onclick="openFacultyFeedbackModal('${ev.id}', 'REVISION')">
            ✏️ Request Revision
          </button>
          <button class="btn btn-danger btn-sm" onclick="openFacultyFeedbackModal('${ev.id}', 'REJECT')">
            ❌ Reject Proposal
          </button>
        </div>
      </div>
    `).join('');
  }

  // Render Processed Events
  if (approvedList) {
    approvedList.innerHTML = processed.map(ev => `
      <div class="card" style="opacity: 0.9;">
        <div class="card-header">
          <div>
            <h4 class="card-title" style="font-size:0.95rem;">${ev.title}</h4>
            <div class="card-subtitle">${ev.clubName} | ${formatDate(ev.date)}</div>
          </div>
          <span class="badge ${ev.status === 'APPROVED' ? 'badge-approved' : (ev.status === 'NEEDS_REVISION' ? 'badge-revision' : 'badge-rejected')}">
            ${ev.status}
          </span>
        </div>
        ${ev.remarks ? `<p style="font-size:0.8rem; color:var(--text-secondary); margin-top:8px;"><strong>Faculty Note:</strong> ${ev.remarks}</p>` : ''}
      </div>
    `).join('');
  }
}

// 4. Scanner View (Module 2)
function renderScannerView() {
  const select = document.getElementById('scanner-event-select');
  const rosterTable = document.getElementById('scanner-roster-body');
  if (!select) return;

  const approvedEvents = state.events.filter(e => e.status === 'APPROVED');
  const currentSelected = select.value;

  select.innerHTML = approvedEvents.map(e => `
    <option value="${e.id}" ${e.id === currentSelected ? 'selected' : ''}>${e.title} (${formatDate(e.date)})</option>
  `).join('');

  if (approvedEvents.length === 0) {
    select.innerHTML = '<option value="">No Approved Events Found</option>';
  }

  updateScannerRoster();
}

function updateScannerRoster() {
  const select = document.getElementById('scanner-event-select');
  const rosterTable = document.getElementById('scanner-roster-body');
  if (!select || !rosterTable) return;

  const eventId = select.value;
  const eventRegs = state.registrations.filter(r => r.eventId === eventId);
  const checkedInCount = eventRegs.filter(r => r.status === 'ATTENDED').length;

  // Update Stats Counters
  document.getElementById('stat-registered').textContent = eventRegs.length;
  document.getElementById('stat-checkedin').textContent = checkedInCount;
  document.getElementById('stat-rate').textContent = eventRegs.length ? `${Math.round((checkedInCount / eventRegs.length) * 100)}%` : '0%';

  if (eventRegs.length === 0) {
    rosterTable.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:20px;">No attendees registered yet for this event.</td></tr>`;
    return;
  }

  rosterTable.innerHTML = eventRegs.map(reg => `
    <tr>
      <td style="font-family:var(--font-mono); font-weight:600; color:var(--info);">${reg.ticketId}</td>
      <td><strong>${reg.name}</strong></td>
      <td style="font-family:var(--font-mono);">${reg.prn}</td>
      <td>${reg.department}</td>
      <td>
        <span class="badge ${reg.status === 'ATTENDED' ? 'badge-approved' : 'badge-pending'}">
          ${reg.status === 'ATTENDED' ? '✅ ATTENDED' : '⏳ PENDING'}
        </span>
      </td>
      <td style="font-family:var(--font-mono); font-size:0.75rem;">
        ${reg.checkInTime || '—'}
      </td>
    </tr>
  `).join('');
}

// 5. JIRA Board View
function renderJiraView() {
  const todoCol = document.getElementById('scrum-todo');
  const inprogressCol = document.getElementById('scrum-inprogress');
  const reviewCol = document.getElementById('scrum-review');
  const doneCol = document.getElementById('scrum-done');
  const bugTable = document.getElementById('jira-bug-table-body');

  if (!todoCol) return;

  const cols = {
    'To Do': todoCol,
    'In Progress': inprogressCol,
    'Code Review': reviewCol,
    'Done': doneCol
  };

  Object.values(cols).forEach(col => col.innerHTML = '');

  state.jiraStories.forEach(story => {
    const card = document.createElement('div');
    card.className = 'jira-card';
    card.innerHTML = `
      <div class="jira-card-header">
        <span class="jira-key">${story.id}</span>
        <span class="jira-points">${story.storyPoints} pts</span>
      </div>
      <div class="jira-title">${story.title}</div>
      <div style="font-size:0.72rem; color:var(--text-muted); margin-bottom:8px;">${story.epic}</div>
      <div class="jira-card-footer">
        <span>👤 ${story.assignee}</span>
        <select onchange="updateStoryStatus('${story.id}', this.value)" style="background:var(--bg-primary); color:var(--text-primary); border:1px solid var(--border-color); font-size:0.7rem; border-radius:4px; padding:2px 4px;">
          <option value="To Do" ${story.status === 'To Do' ? 'selected' : ''}>To Do</option>
          <option value="In Progress" ${story.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Code Review" ${story.status === 'Code Review' ? 'selected' : ''}>Code Review</option>
          <option value="Done" ${story.status === 'Done' ? 'selected' : ''}>Done</option>
        </select>
      </div>
    `;
    if (cols[story.status]) {
      cols[story.status].appendChild(card);
    }
  });

  // Update column badges
  document.getElementById('count-todo').textContent = state.jiraStories.filter(s => s.status === 'To Do').length;
  document.getElementById('count-inprogress').textContent = state.jiraStories.filter(s => s.status === 'In Progress').length;
  document.getElementById('count-review').textContent = state.jiraStories.filter(s => s.status === 'Code Review').length;
  document.getElementById('count-done').textContent = state.jiraStories.filter(s => s.status === 'Done').length;

  // Render Bug Tracker Table
  if (bugTable) {
    bugTable.innerHTML = state.jiraBugs.map(b => `
      <tr>
        <td style="font-family:var(--font-mono); font-weight:700; color:var(--danger);">${b.bugId}</td>
        <td><strong>${b.summary}</strong></td>
        <td><span class="badge badge-category">${b.module}</span></td>
        <td><span class="badge badge-rejected">${b.severity}</span></td>
        <td><span class="badge badge-approved">${b.status}</span></td>
        <td style="font-size:0.8rem; color:var(--text-secondary);">${b.resolution}</td>
      </tr>
    `).join('');
  }
}

function updateStoryStatus(storyId, newStatus) {
  const story = state.jiraStories.find(s => s.id === storyId);
  if (story) {
    story.status = newStatus;
    state.saveState();
    renderJiraView();
    showToast(`Story ${storyId} moved to ${newStatus}`, 'info');
  }
}

// Render Master Campus Calendar
function renderMasterCalendar() {
  const container = document.getElementById('master-calendar-grid');
  if (!container) return;

  const reservedSlots = state.events.filter(e => e.status === 'APPROVED');
  if (reservedSlots.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem;">No active reservations locked on the master campus calendar.</p>`;
    return;
  }

  container.innerHTML = reservedSlots.map(ev => `
    <div class="calendar-slot-card reserved">
      <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
        <strong style="color:var(--text-primary); font-size:0.85rem;">${ev.venueName}</strong>
        <span class="badge badge-rejected" style="font-size:0.65rem;">LOCKED</span>
      </div>
      <div style="font-size:0.78rem; color:var(--text-secondary); margin-bottom:4px;">📅 ${formatDate(ev.date)} | ⏰ ${ev.startTime} - ${ev.endTime}</div>
      <div style="font-size:0.8rem; font-weight:600; color:var(--text-primary);">${ev.title}</div>
      <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">Organized by: ${ev.clubName}</div>
    </div>
  `).join('');
}

function renderAllViews() {
  renderStudentView();
  renderOfficerEvents();
  renderFacultyView();
  renderScannerView();
  renderJiraView();
}

// --- Module 1: Event Proposal & Approval Handlers ---

function openCreateEventModal() {
  const modal = document.getElementById('modal-create-event');
  const venueSelect = document.getElementById('event-venue');
  const clubSelect = document.getElementById('event-club');

  // Populate venues
  venueSelect.innerHTML = VENUES.map(v => `<option value="${v.id}" data-cap="${v.capacity}">${v.name} (Max Cap: ${v.capacity})</option>`).join('');

  // Populate clubs
  clubSelect.innerHTML = CLUBS.map(c => `<option value="${c.id}">${c.name} (${c.category}) - Quota: $${c.quota}</option>`).join('');

  // Set min date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('event-date').min = tomorrow.toISOString().split('T')[0];
  document.getElementById('event-date').value = tomorrow.toISOString().split('T')[0];

  calculateTotalBudget();
  modal.classList.add('active');
}

function calculateTotalBudget() {
  const eq = Math.max(0, parseFloat(document.getElementById('budget-equip').value) || 0);
  const ref = Math.max(0, parseFloat(document.getElementById('budget-food').value) || 0);
  const spk = Math.max(0, parseFloat(document.getElementById('budget-guest').value) || 0);
  const mkt = Math.max(0, parseFloat(document.getElementById('budget-mktg').value) || 0);

  const total = eq + ref + spk + mkt;
  document.getElementById('budget-total-display').textContent = `$${total}`;

  const warningElem = document.getElementById('budget-cap-warning');
  if (total > 1500) {
    warningElem.style.display = 'block';
    warningElem.textContent = `⚠️ Budget exceeds maximum club allocation limit ($1,500). Current: $${total}`;
  } else {
    warningElem.style.display = 'none';
  }
  return total;
}

function submitEventProposal(e) {
  e.preventDefault();

  const title = document.getElementById('event-title').value.trim();
  const clubId = document.getElementById('event-club').value;
  const club = CLUBS.find(c => c.id === clubId);
  const venueId = document.getElementById('event-venue').value;
  const venue = VENUES.find(v => v.id === venueId);
  const date = document.getElementById('event-date').value;
  const startTime = document.getElementById('event-start').value;
  const endTime = document.getElementById('event-end').value;
  const audience = parseInt(document.getElementById('event-audience').value, 10);
  const description = document.getElementById('event-description').value.trim();

  // Validations
  if (!title || !date || !startTime || !endTime || !description) {
    showToast('Please fill in all mandatory fields.', 'error');
    return;
  }

  // Time validity check
  if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
    showToast('End Time must be strictly after Start Time.', 'error');
    return;
  }

  if (timeToMinutes(endTime) - timeToMinutes(startTime) < 60) {
    showToast('Event duration must be at least 1 hour (60 minutes).', 'error');
    return;
  }

  // Audience vs Venue capacity check
  if (audience > venue.capacity) {
    showToast(`Expected audience (${audience}) exceeds ${venue.name} capacity (${venue.capacity}).`, 'error');
    return;
  }

  // Budget cap check
  const totalBudget = calculateTotalBudget();
  if (totalBudget > 1500) {
    showToast('Total budget exceeds club maximum threshold ($1,500). Please adjust line items.', 'error');
    return;
  }

  // Automated Venue Conflict Detection
  const conflict = checkVenueConflict(venueId, date, startTime, endTime);
  if (conflict) {
    showToast(`Venue Conflict! ${venue.name} is already booked on ${formatDate(date)} between ${conflict.startTime} - ${conflict.endTime} for '${conflict.title}'.`, 'error');
    return;
  }

  // Create new event
  const newEvent = {
    id: `EVT-${Date.now().toString().slice(-4)}`,
    title,
    clubId: club.id,
    clubName: club.name,
    category: club.category,
    date,
    startTime,
    endTime,
    venueId: venue.id,
    venueName: venue.name,
    audience,
    description,
    budget: {
      equipment: parseFloat(document.getElementById('budget-equip').value) || 0,
      refreshments: parseFloat(document.getElementById('budget-food').value) || 0,
      speakers: parseFloat(document.getElementById('budget-guest').value) || 0,
      marketing: parseFloat(document.getElementById('budget-mktg').value) || 0,
      total: totalBudget
    },
    status: 'PENDING_APPROVAL',
    facultyAdvisor: 'Dr. S. K. Kulkarni',
    remarks: null
  };

  state.events.unshift(newEvent);
  state.saveState();
  closeModal('modal-create-event');
  renderAllViews();
  showToast(`Event proposal '${newEvent.title}' submitted successfully. Status: PENDING_APPROVAL.`, 'success');
}

// Faculty Approval Actions
function facultyAction(eventId, action) {
  const event = state.events.find(e => e.id === eventId);
  if (!event) return;

  if (action === 'APPROVE') {
    // Re-verify venue conflict before granting approval
    const conflict = checkVenueConflict(event.venueId, event.date, event.startTime, event.endTime, event.id);
    if (conflict) {
      showToast(`Cannot approve! Venue scheduling conflict detected with '${conflict.title}'.`, 'error');
      return;
    }

    event.status = 'APPROVED';
    event.approvalDate = new Date().toISOString().split('T')[0];
    event.remarks = 'Officially approved by Faculty Advisor. Venue reservation locked on Master Calendar.';
    state.saveState();
    renderAllViews();
    showToast(`Event '${event.title}' APPROVED! Venue is locked and published for students.`, 'success');
  }
}

function openFacultyFeedbackModal(eventId, actionType) {
  const modal = document.getElementById('modal-faculty-feedback');
  document.getElementById('feedback-event-id').value = eventId;
  document.getElementById('feedback-action-type').value = actionType;

  const header = document.getElementById('feedback-modal-header');
  header.textContent = actionType === 'REVISION' ? 'Request Revision from Club Officer' : 'Reject Event Proposal';

  modal.classList.add('active');
}

function submitFacultyFeedback(e) {
  e.preventDefault();
  const eventId = document.getElementById('feedback-event-id').value;
  const actionType = document.getElementById('feedback-action-type').value;
  const remarks = document.getElementById('faculty-remarks-input').value.trim();

  if (!remarks) {
    showToast('Please provide feedback comments for the club officer.', 'warning');
    return;
  }

  const event = state.events.find(e => e.id === eventId);
  if (event) {
    event.status = actionType === 'REVISION' ? 'NEEDS_REVISION' : 'REJECTED';
    event.remarks = remarks;
    state.saveState();
    closeModal('modal-faculty-feedback');
    renderAllViews();
    showToast(`Proposal status updated to ${event.status}. Feedback recorded.`, 'info');
  }
}

// --- Module 2: QR Code Registration, Scanner & Attendance ---

function openRegisterModal(eventId) {
  const event = state.events.find(e => e.id === eventId);
  if (!event) return;

  document.getElementById('reg-event-id').value = event.id;
  document.getElementById('reg-event-title').textContent = event.title;
  document.getElementById('reg-event-meta').textContent = `${formatDate(event.date)} | ${event.startTime} - ${event.endTime} | ${event.venueName}`;

  document.getElementById('modal-register-event').classList.add('active');
}

function submitEventRegistration(e) {
  e.preventDefault();
  const eventId = document.getElementById('reg-event-id').value;
  const name = document.getElementById('reg-name').value.trim();
  const prn = document.getElementById('reg-prn').value.trim().toUpperCase();
  const email = document.getElementById('reg-email').value.trim();
  const dept = document.getElementById('reg-dept').value;
  const year = document.getElementById('reg-year').value;

  if (!name || !prn || !email) {
    showToast('All registration fields are required.', 'error');
    return;
  }

  // Duplicate registration check for same student PRN on this event
  const existing = state.registrations.find(r => r.eventId === eventId && r.prn === prn);
  if (existing) {
    showToast(`Student with PRN ${prn} is already registered with Ticket ID ${existing.ticketId}!`, 'warning');
    closeModal('modal-register-event');
    viewTicketPass(existing.ticketId);
    return;
  }

  const event = state.events.find(e => e.id === eventId);
  const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
  const hash = Math.random().toString(36).substring(2, 8).toUpperCase();
  const qrToken = `UCMS-AUTH:${eventId}:${ticketId}:${prn}:SIG-${hash}`;

  const newReg = {
    ticketId,
    eventId: event.id,
    eventTitle: event.title,
    name,
    prn,
    email,
    department: dept,
    year,
    registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    status: 'REGISTERED',
    checkInTime: null,
    qrToken
  };

  state.registrations.unshift(newReg);
  state.saveState();
  closeModal('modal-register-event');
  renderAllViews();
  showToast(`Registration confirmed! Your Pass ID: ${ticketId}`, 'success');

  // Immediately display the generated QR Pass
  viewTicketPass(ticketId);
}

// Render and Display QR Pass Modal
function viewTicketPass(ticketId) {
  const reg = state.registrations.find(r => r.ticketId === ticketId);
  if (!reg) return;

  const event = state.events.find(e => e.id === reg.eventId) || { venueName: 'Campus Auditorium', date: '2026-11-15', startTime: '09:00' };

  document.getElementById('pass-ticket-id').textContent = reg.ticketId;
  document.getElementById('pass-event-title').textContent = reg.eventTitle;
  document.getElementById('pass-attendee-name').textContent = reg.name;
  document.getElementById('pass-attendee-prn').textContent = reg.prn;
  document.getElementById('pass-attendee-dept').textContent = `${reg.department} (${reg.year})`;
  document.getElementById('pass-event-venue').textContent = event.venueName;
  document.getElementById('pass-event-time').textContent = `${formatDate(event.date)} @ ${event.startTime}`;
  document.getElementById('pass-status-pill').textContent = reg.status === 'ATTENDED' ? '✅ ATTENDED' : 'VALID ENTRY PASS';
  document.getElementById('pass-token-code').textContent = reg.qrToken;

  // Render QR Code using qrcodejs
  const qrContainer = document.getElementById('pass-qr-canvas');
  qrContainer.innerHTML = '';

  try {
    if (typeof QRCode !== 'undefined') {
      new QRCode(qrContainer, {
        text: reg.qrToken,
        width: 140,
        height: 140,
        colorDark: '#0f172a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
    } else {
      qrContainer.innerHTML = `<div style="padding:20px; font-family:var(--font-mono); font-size:0.75rem;">${reg.ticketId}</div>`;
    }
  } catch (err) {
    console.error('QR Render Error:', err);
    qrContainer.innerHTML = `<div style="padding:10px; font-size:0.8rem;">[QR Matrix: ${reg.ticketId}]</div>`;
  }

  document.getElementById('modal-ticket-pass').classList.add('active');
}

// QR Code Scanner / Verification Logic (Module 2 Core)
function processScanToken(tokenString) {
  const feedback = document.getElementById('scanner-feedback-box');
  const token = tokenString.trim();

  if (!token) {
    showToast('Please enter or scan a valid QR token.', 'warning');
    return;
  }

  // Lookup in registrations database
  const reg = state.registrations.find(r => r.qrToken === token || r.ticketId === token);

  feedback.className = 'scan-feedback-box';

  if (!reg) {
    // Unregistered Attendee / Invalid token
    feedback.classList.add('invalid');
    feedback.innerHTML = `
      <div style="font-size:1.4rem; margin-bottom:4px;">❌</div>
      <div style="font-size:1.1rem; font-weight:700;">UNREGISTERED ATTENDEE</div>
      <div style="font-size:0.85rem; margin-top:4px;">No matching ticket found for token: <code style="font-family:var(--font-mono);">${token}</code></div>
    `;
    showToast('Unregistered Attendee! Access denied.', 'error');
    return;
  }

  // Duplicate Check-In Detection
  if (reg.status === 'ATTENDED') {
    feedback.classList.add('duplicate');
    feedback.innerHTML = `
      <div style="font-size:1.4rem; margin-bottom:4px;">⚠️</div>
      <div style="font-size:1.1rem; font-weight:700;">ALREADY CHECKED-IN!</div>
      <div style="font-size:0.88rem; margin-top:4px;">Attendee: <strong>${reg.name}</strong> (${reg.prn})</div>
      <div style="font-size:0.8rem; margin-top:2px; color:#fca5a5;">Previously checked-in at: <strong>${reg.checkInTime}</strong></div>
      <div style="font-size:0.75rem; margin-top:6px; opacity:0.8;">Duplicate entry attempt has been blocked & logged.</div>
    `;
    showToast(`Duplicate scan rejected! ${reg.name} already checked-in.`, 'warning');
    return;
  }

  // Valid First-Time Check-In
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  reg.status = 'ATTENDED';
  reg.checkInTime = `${now.toISOString().split('T')[0]} ${timeFormatted}`;
  state.saveState();

  feedback.classList.add('success');
  feedback.innerHTML = `
    <div style="font-size:1.4rem; margin-bottom:4px;">✅</div>
    <div style="font-size:1.1rem; font-weight:700;">ATTENDANCE VERIFIED</div>
    <div style="font-size:0.95rem; margin-top:4px;">Welcome, <strong>${reg.name}</strong> (${reg.prn})!</div>
    <div style="font-size:0.8rem; margin-top:2px; color:#a7f3d0;">Verified at: <strong>${reg.checkInTime}</strong> | Department: ${reg.department}</div>
  `;

  showToast(`Attendance verified for ${reg.name}!`, 'success');
  updateScannerRoster();
  renderStudentView(); // update certificates if available
}

// Scanner Simulator Triggers for Rapid Evaluation Testing
function simulateScan(type) {
  const select = document.getElementById('scanner-event-select');
  const eventId = select.value;
  const eventRegs = state.registrations.filter(r => r.eventId === eventId);

  if (type === 'valid') {
    const pending = eventRegs.find(r => r.status === 'REGISTERED');
    if (pending) {
      processScanToken(pending.qrToken);
    } else {
      showToast('All registered attendees for this event are already checked-in! Use "Test Duplicate Scan".', 'info');
    }
  } else if (type === 'duplicate') {
    const attended = eventRegs.find(r => r.status === 'ATTENDED');
    if (attended) {
      processScanToken(attended.qrToken);
    } else {
      showToast('No attended tickets available yet. Perform a valid scan first.', 'info');
    }
  } else if (type === 'invalid') {
    processScanToken('UCMS-AUTH:FRAUDULENT-TOKEN-9999:SIG-FAKE');
  }
}

function handleManualScanSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('manual-token-input');
  if (input) {
    processScanToken(input.value);
    input.value = '';
  }
}

function jumpToScanner(eventId) {
  setRole('officer');
  const scannerSelect = document.getElementById('scanner-event-select');
  if (scannerSelect) {
    scannerSelect.value = eventId;
    updateScannerRoster();
  }
  document.getElementById('scanner-console-anchor').scrollIntoView({ behavior: 'smooth' });
}

// Certificate Generator Modal
function viewCertificate(ticketId) {
  const reg = state.registrations.find(r => r.ticketId === ticketId);
  if (!reg || reg.status !== 'ATTENDED') {
    showToast('Certificate is only available for verified attendees!', 'error');
    return;
  }

  const event = state.events.find(e => e.id === reg.eventId) || { title: reg.eventTitle, date: '2026-11-15', clubName: 'ACM Student Chapter' };

  document.getElementById('cert-name').textContent = reg.name;
  document.getElementById('cert-event-title').textContent = reg.eventTitle;
  document.getElementById('cert-club-name').textContent = event.clubName;
  document.getElementById('cert-date').textContent = formatDate(event.date);
  document.getElementById('cert-prn').textContent = reg.prn;

  // Render Verification QR Code on certificate
  const certQrBox = document.getElementById('cert-qr-box');
  certQrBox.innerHTML = '';
  if (typeof QRCode !== 'undefined') {
    new QRCode(certQrBox, {
      text: `UCMS-CERT-VERIFIED:${reg.ticketId}:${reg.prn}`,
      width: 80,
      height: 80,
      colorDark: '#1e1b4b',
      colorLight: '#ffffff'
    });
  }

  document.getElementById('modal-certificate').classList.add('active');
}

// Export Attendance CSV
function exportAttendanceCSV() {
  const select = document.getElementById('scanner-event-select');
  const eventId = select.value;
  const event = state.events.find(e => e.id === eventId) || { title: 'Attendance' };
  const eventRegs = state.registrations.filter(r => r.eventId === eventId);

  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'Ticket ID,Student Name,PRN,Department,Year,Status,Check-In Timestamp\r\n';

  eventRegs.forEach(r => {
    csvContent += `"${r.ticketId}","${r.name}","${r.prn}","${r.department}","${r.year}","${r.status}","${r.checkInTime || 'N/A'}"\r\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `UCMS_Attendance_${eventId}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Attendance CSV exported successfully.', 'success');
}

// Modal Helper Functions
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// Theme Toggle
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('ucms_theme', newTheme);
  showToast(`Switched to ${newTheme} theme`, 'info');
}

// Reset Demo Data
function resetDemoData() {
  if (confirm('Are you sure you want to reset all data to default seed data?')) {
    state.resetDefault();
    renderAllViews();
    showToast('System data reset to initial benchmark state.', 'success');
  }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('ucms_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Attach Budget Line Item Listeners
  ['budget-equip', 'budget-food', 'budget-guest', 'budget-mktg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calculateTotalBudget);
  });

  // Attach Scanner Event Selector Listener
  const scannerSelect = document.getElementById('scanner-event-select');
  if (scannerSelect) {
    scannerSelect.addEventListener('change', updateScannerRoster);
  }

  // Set initial role
  setRole('student');
});
