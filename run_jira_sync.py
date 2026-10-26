"""
Execute full UCMS Backlog and Sprint creation on Jira Cloud
Site: https://rbunagpur-team-knet124p.atlassian.net
Project: SCRUM
"""

import os
import urllib.request
import json
import base64
import time

# Auto-load .env file if present
def load_dotenv():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    if k.strip() not in os.environ:
                        os.environ[k.strip()] = v.strip()

load_dotenv()

DOMAIN = os.getenv("JIRA_DOMAIN", "https://rbunagpur-team-knet124p.atlassian.net")
if not DOMAIN.startswith("http"):
    DOMAIN = f"https://{DOMAIN}"
EMAIL = os.getenv("JIRA_EMAIL", "24dhanuleas@rbunagpur.in")
TOKEN = os.getenv("JIRA_API_TOKEN", "")
PROJECT_KEY = os.getenv("JIRA_PROJECT_KEY", "SCRUM")
SPRINT_1_ID = 1
SPRINT_2_ID = 3
STORY_POINTS_FIELD = "customfield_10016"

if not TOKEN:
    print("[-] Warning: JIRA_API_TOKEN is not set in environment or .env file.")

auth_str = f"{EMAIL}:{TOKEN}"
AUTH_HEADER = f"Basic {base64.b64encode(auth_str.encode('utf-8')).decode('utf-8')}"

def request(endpoint, method="GET", data=None, is_agile=False):
    prefix = "/rest/agile/1.0/" if is_agile else "/rest/api/3/"
    url = f"{DOMAIN}{prefix}{endpoint.lstrip('/')}"
    headers = {
        "Authorization": AUTH_HEADER,
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    req_data = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            code = resp.getcode()
            if code == 204:
                return {"status": "success", "code": 204}
            body = resp.read().decode("utf-8")
            return json.loads(body) if body else {"status": "success"}
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8")
        print(f"[-] HTTP Error {e.code} on {method} {url}: {err}")
        return {"error": e.code, "details": err}
    except Exception as e:
        print(f"[-] Error: {e}")
        return {"error": str(e)}

def text_to_adf(text):
    paragraphs = []
    for line in text.split("\n"):
        line = line.strip()
        if line:
            paragraphs.append({
                "type": "paragraph",
                "content": [{"type": "text", "text": line}]
            })
    if not paragraphs:
        paragraphs.append({"type": "paragraph", "content": [{"type": "text", "text": " "}]})
    return {
        "type": "doc",
        "version": 1,
        "content": paragraphs
    }

def create_issue(summary, description, issue_type_id="10004", story_points=None, labels=None, priority=None):
    fields = {
        "project": {"key": PROJECT_KEY},
        "summary": summary,
        "description": text_to_adf(description),
        "issuetype": {"id": issue_type_id}
    }
    if story_points:
        fields[STORY_POINTS_FIELD] = float(story_points)
    if labels:
        fields["labels"] = labels
    if priority:
        fields["priority"] = {"name": priority}

    res = request("issue", method="POST", data={"fields": fields})
    if res and "key" in res:
        print(f"[+] Created [{res['key']}]: {summary} ({story_points or 'N/A'} SP)")
        return res["key"]
    else:
        print(f"[-] Failed to create: {summary}")
        return None

def move_to_sprint(sprint_id, keys):
    if not keys:
        return
    res = request(f"sprint/{sprint_id}/issue", method="POST", data={"issues": keys}, is_agile=True)
    if res and (res.get("code") in [200, 204] or res.get("status") == "success"):
        print(f"[+] Successfully moved {keys} to Sprint ID {sprint_id}")
    else:
        print(f"[-] Error moving to sprint {sprint_id}: {res}")

def main():
    print("===================================================================")
    print("  Creating Full UCMS Agile Backlogs & Sprints in JIRA")
    print("===================================================================")

    # 1. Sprint 1 User Stories
    sprint_1_items = [
        {
            "summary": "Club Officer Event Proposal Submission & Budget Tracking",
            "desc": (
                "As a Club Officer, I want to submit an event proposal with venue, date, time, and budget so that campus resources can be requested.\n\n"
                "Acceptance Criteria (Gherkin Syntax):\n"
                "Given valid event input fields (Title, Organizing Club, Date, Time, Venue, Itemized Budget),\n"
                "When the officer clicks submit,\n"
                "Then validate venue availability, ensure itemized budget sums <= $1,500 cap, and transition proposal status to PENDING_APPROVAL."
            ),
            "sp": 5,
            "type_id": "10004", # Story
            "labels": ["Module-1", "Proposal-Workflow", "Sprint-1"],
            "priority": "High"
        },
        {
            "summary": "Automated Campus Venue Conflict Detection & Calendar Locking",
            "desc": (
                "As a System, I must detect overlapping date/time venue reservations to prevent auditorium double-booking across clubs.\n\n"
                "Acceptance Criteria (Gherkin Syntax):\n"
                "Given an existing reservation on date D from T1 to T2 at venue V,\n"
                "When a new proposal requests venue V overlapping interval [T1, T2],\n"
                "Then flag a venue collision alert, indicate the conflicting event, and block submission."
            ),
            "sp": 5,
            "type_id": "10004", # Story
            "labels": ["Module-1", "Conflict-Detection", "Sprint-1"],
            "priority": "High"
        },
        {
            "summary": "Faculty Advisor Review, Approval & Revision Workflow",
            "desc": (
                "As a Faculty Advisor, I want to review proposed events and approve, request revision, or reject them with feedback.\n\n"
                "Acceptance Criteria (Gherkin Syntax):\n"
                "Given a pending event proposal in the advisor portal,\n"
                "When the advisor evaluates proposal details,\n"
                "Then the advisor can:\n"
                " 1. Approve (locks venue on Master Calendar and publishes to student portal)\n"
                " 2. Request Revision (returns proposal to officer with mandatory remarks)\n"
                " 3. Reject (marks status as REJECTED with rejection justification)."
            ),
            "sp": 5,
            "type_id": "10004", # Story
            "labels": ["Module-1", "Faculty-Review", "Sprint-1"],
            "priority": "High"
        }
    ]

    # 2. Sprint 2 User Stories
    sprint_2_items = [
        {
            "summary": "Student Registration & High-Contrast 2D QR Entry Pass Generation",
            "desc": (
                "As a Student, I want to register for approved campus events and receive a cryptographically signed digital QR Entry Pass.\n\n"
                "Acceptance Criteria (Gherkin Syntax):\n"
                "Given an approved event published on the portal,\n"
                "When an authenticated student enters PRN and university email to register,\n"
                "Then generate a unique Ticket ID (TKT-XXXX), security token, and render high-contrast 2D QR entry pass modal."
            ),
            "sp": 5,
            "type_id": "10004", # Story
            "labels": ["Module-2", "QR-Pass", "Sprint-2"],
            "priority": "High"
        },
        {
            "summary": "Real-Time Mobile Web QR Scanner with Atomic Duplicate Check-In Prevention",
            "desc": (
                "As an Event Organizer, I want to scan QR passes at the entrance to verify attendance and reject duplicate attempts in real time.\n\n"
                "Acceptance Criteria (Gherkin Syntax):\n"
                "Given an entry pass presented at venue entrance,\n"
                "When scanned via the web camera viewfinder or manual token entry,\n"
                "Then:\n"
                " - If valid: mark status ATTENDED with timestamp and display GREEN SUCCESS badge.\n"
                " - If already attended: abort check-in, log duplicate attempt, and flash RED DUPLICATE WARNING.\n"
                " - If unregistered token: flash AMBER INVALID WARNING."
            ),
            "sp": 8,
            "type_id": "10004", # Story
            "labels": ["Module-2", "Attendance-Scanner", "Sprint-2"],
            "priority": "Highest"
        },
        {
            "summary": "Automated Certificate of Participation Generation for Verified Attendees",
            "desc": (
                "As an Attended Student, I want to view and download my official participation certificate unlocked by verified attendance.\n\n"
                "Acceptance Criteria (Gherkin Syntax):\n"
                "Given a registered student,\n"
                "When ticket status == ATTENDED,\n"
                "Then unlock the Certificate of Participation with student details, club credentials, authorized signature, and verification watermark.\n"
                "If ticket status is unverified, access remains disabled."
            ),
            "sp": 3,
            "type_id": "10004", # Story
            "labels": ["Module-2", "Certificate", "Sprint-2"],
            "priority": "Medium"
        }
    ]

    # 3. Product Backlog Items (Unassigned Stories)
    backlog_items = [
        {
            "summary": "Role-Based Access Control (RBAC) & Central Admin Management Portal",
            "desc": (
                "As a Campus Administrator, I want to configure club tier quotas, audit venue schedules, and govern role permissions.\n\n"
                "Acceptance Criteria:\n"
                "Given an admin account, allow viewing all clubs, adjusting capacity limits, and exporting master compliance logs."
            ),
            "sp": 5,
            "type_id": "10004", # Story
            "labels": ["Governance", "Product-Backlog", "Module-Admin"],
            "priority": "Medium"
        },
        {
            "summary": "Interactive Master Campus Event Calendar with Filtering & Venue Schedules",
            "desc": (
                "As a Student or Faculty member, I want to browse an interactive campus calendar filtered by club, category, and venue.\n\n"
                "Acceptance Criteria:\n"
                "Given published events, render a synchronized calendar displaying event slots and real-time venue utilization."
            ),
            "sp": 3,
            "type_id": "10004", # Story
            "labels": ["Calendar", "Product-Backlog", "Module-1"],
            "priority": "Medium"
        },
        {
            "summary": "Event Participation Analytics & Demographics Export Dashboard",
            "desc": (
                "As a Club Officer, I want to inspect turnout rates, demographic breakdowns, and export verified attendance roster CSVs.\n\n"
                "Acceptance Criteria:\n"
                "Provide exportable CSV roster containing Ticket ID, Student Name, PRN, Department, and Scan Timestamps."
            ),
            "sp": 5,
            "type_id": "10004", # Story
            "labels": ["Analytics", "Product-Backlog", "Module-2"],
            "priority": "Low"
        }
    ]

    # 4. Defect / Bug Backlog Items
    bug_items = [
        {
            "summary": "[BUG] Venue collision check false positive on adjacent boundary intervals",
            "desc": (
                "Steps to Reproduce:\n"
                "1. Schedule Event A (10:00 - 12:00) at Main Auditorium.\n"
                "2. Submit Event B (12:00 - 14:00) at Main Auditorium.\n"
                "3. System threw erroneous venue collision alert.\n\n"
                "Root Cause & Resolution:\n"
                "Logic used inclusive comparison (<=, >=). Corrected to strict boundary inequality (start < evEnd && end > evStart)."
            ),
            "type_id": "10006", # Bug
            "labels": ["Bug", "Module-1", "Boundary-Testing"],
            "priority": "High"
        },
        {
            "summary": "[BUG] Budget line items permitted negative numeric inputs, bypassing $1,500 annual cap",
            "desc": (
                "Steps to Reproduce:\n"
                "1. Open proposal form.\n"
                "2. Enter -500 in Marketing cost.\n"
                "3. Total calculated as net reduced, allowing excessive equipment costs.\n\n"
                "Root Cause & Resolution:\n"
                "Added HTML5 min='0' validation and sanitized input in JS via Math.max(0, val)."
            ),
            "type_id": "10006", # Bug
            "labels": ["Bug", "Module-1", "Validation"],
            "priority": "High"
        },
        {
            "summary": "[BUG] Rapid double-clicking on scanner simulation caused duplicate check-ins",
            "desc": (
                "Steps to Reproduce:\n"
                "1. Open Scanner Console.\n"
                "2. Rapidly double-click scan trigger in < 200ms.\n"
                "3. Two attendance check-in timestamps were recorded.\n\n"
                "Root Cause & Resolution:\n"
                "Asynchronous race condition. Enforced immediate atomic status check guard before triggering DOM update."
            ),
            "type_id": "10006", # Bug
            "labels": ["Bug", "Module-2", "Concurrency"],
            "priority": "Highest"
        },
        {
            "summary": "[BUG] QR canvas failed to render when student name contained international Unicode characters",
            "desc": (
                "Steps to Reproduce:\n"
                "1. Register student with accented character in name (e.g. 'Müller').\n"
                "2. QR canvas rendered blank.\n\n"
                "Root Cause & Resolution:\n"
                "Byte encoding mismatch. Encoded string with encodeURIComponent() and ASCII serializer prior to QR rendering."
            ),
            "type_id": "10006", # Bug
            "labels": ["Bug", "Module-2", "Encoding"],
            "priority": "Medium"
        },
        {
            "summary": "[BUG] Certificate modal was accessible to students prior to event entrance check-in",
            "desc": (
                "Steps to Reproduce:\n"
                "1. Register for event.\n"
                "2. Invoke certificate modal directly prior to venue check-in.\n"
                "3. Certificate rendered for unverified student.\n\n"
                "Root Cause & Resolution:\n"
                "Enforced guard condition: ticket.status must strictly equal 'ATTENDED' before rendering certificate modal."
            ),
            "type_id": "10006", # Bug
            "labels": ["Bug", "Module-2", "Security"],
            "priority": "High"
        }
    ]

    # Create Sprint 1
    print("\n--- Creating Sprint 1 Stories ---")
    sprint_1_keys = []
    for item in sprint_1_items:
        k = create_issue(item["summary"], item["desc"], item["type_id"], item.get("sp"), item.get("labels"), item.get("priority"))
        if k:
            sprint_1_keys.append(k)
        time.sleep(0.3)

    if sprint_1_keys:
        move_to_sprint(SPRINT_1_ID, sprint_1_keys)

    # Create Sprint 2
    print("\n--- Creating Sprint 2 Stories ---")
    sprint_2_keys = []
    for item in sprint_2_items:
        k = create_issue(item["summary"], item["desc"], item["type_id"], item.get("sp"), item.get("labels"), item.get("priority"))
        if k:
            sprint_2_keys.append(k)
        time.sleep(0.3)

    if sprint_2_keys:
        move_to_sprint(SPRINT_2_ID, sprint_2_keys)

    # Create Backlog Stories
    print("\n--- Creating Backlog User Stories ---")
    backlog_keys = []
    for item in backlog_items:
        k = create_issue(item["summary"], item["desc"], item["type_id"], item.get("sp"), item.get("labels"), item.get("priority"))
        if k:
            backlog_keys.append(k)
        time.sleep(0.3)

    # Create Bugs in Backlog
    print("\n--- Creating Defects / Bugs in Backlog ---")
    bug_keys = []
    for item in bug_items:
        k = create_issue(item["summary"], item["desc"], item["type_id"], None, item.get("labels"), item.get("priority"))
        if k:
            bug_keys.append(k)
        time.sleep(0.3)

    print("\n" + "="*70)
    print("  JIRA SYNC COMPLETED SUCCESSFULLY!")
    print("="*70)
    print(f"Sprint 1 ({len(sprint_1_keys)} stories, 15 SP): {sprint_1_keys}")
    print(f"Sprint 2 ({len(sprint_2_keys)} stories, 16 SP): {sprint_2_keys}")
    print(f"Product Backlog Stories ({len(backlog_keys)} stories, 13 SP): {backlog_keys}")
    print(f"Defect Tracker / Bugs ({len(bug_keys)} bugs): {bug_keys}")
    print(f"Total New Items Created: {len(sprint_1_keys) + len(sprint_2_keys) + len(backlog_keys) + len(bug_keys)}")
    print("="*70)

if __name__ == "__main__":
    main()
