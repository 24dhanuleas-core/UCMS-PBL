"""
JIRA Cloud Integration & Automation Utility for University Club Management System (UCMS)
Author: Arya Dhanule (A6_B4_64) | SE Lab PBL

Automates:
 1. Connection authentication using Atlassian API Token & REST API
 2. Verification / Listing of JIRA Projects
 3. Discovery of Scrum / Agile Boards
 4. Creation of Sprints:
    - Sprint 1: Event Lifecycle & Multi-Tier Approvals (Velocity: 15 SP)
    - Sprint 2: QR Attendance & Digital Passes (Velocity: 16 SP)
 5. Creation of Product Backlog Items:
    - User Stories with Gherkin Acceptance Criteria & Story Points
    - Bugs / Defects with Steps to Reproduce, Severity & Root Cause
    - Future Backlog Items
 6. Assignment of stories to Sprint 1, Sprint 2, and Product Backlog
"""

import sys
import os
import json
import base64
import urllib.request
import urllib.error

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

DEFAULT_API_TOKEN = os.getenv("JIRA_API_TOKEN", "")

class JiraCloudClient:
    def __init__(self, domain, email, token=DEFAULT_API_TOKEN):
        domain = domain.strip().rstrip("/")
        if not domain.startswith("http"):
            domain = f"https://{domain}"
        if not domain.endswith(".atlassian.net") and "." not in domain.replace("https://", ""):
            domain = f"{domain}.atlassian.net"
            
        self.base_url = domain
        self.email = email.strip()
        self.token = token.strip()
        auth_str = f"{self.email}:{self.token}"
        self.auth_header = f"Basic {base64.b64encode(auth_str.encode('utf-8')).decode('utf-8')}"
        self.story_points_field = None
        self.issue_types_cache = {}

    def _request(self, endpoint, method="GET", data=None, api_version="3", is_agile=False):
        if is_agile:
            url = f"{self.base_url}/rest/agile/1.0/{endpoint.lstrip('/')}"
        else:
            url = f"{self.base_url}/rest/api/{api_version}/{endpoint.lstrip('/')}"

        headers = {
            "Authorization": self.auth_header,
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        req_data = json.dumps(data).encode("utf-8") if data is not None else None
        req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req) as response:
                status_code = response.getcode()
                if status_code == 204:
                    return {"status": "success", "code": 204}
                res_body = response.read().decode("utf-8")
                return json.loads(res_body) if res_body else {"status": "success"}
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            print(f"[-] HTTP Error {e.code} on {method} {url}")
            try:
                err_json = json.loads(err_body)
                print("    Error details:", json.dumps(err_json, indent=2))
                return {"error": e.code, "details": err_json}
            except Exception:
                print("    Raw response:", err_body)
                return {"error": e.code, "details": err_body}
        except Exception as e:
            print(f"[-] Connection Error: {e}")
            return {"error": "connection", "details": str(e)}

    def verify_credentials(self):
        print(f"[*] Verifying credentials against {self.base_url} for user '{self.email}'...")
        res = self._request("myself", api_version="3")
        if res and "error" not in res:
            display_name = res.get("displayName", "N/A")
            account_id = res.get("accountId", "N/A")
            print(f"[+] Successfully authenticated as: {display_name} (Account ID: {account_id})")
            return res
        else:
            print("[-] Authentication failed. Please verify your Jira domain, email address, and API token.")
            return None

    def list_projects(self):
        print("[*] Fetching existing Jira projects...")
        projects = self._request("project", api_version="3")
        if projects and isinstance(projects, list):
            print(f"[+] Found {len(projects)} accessible project(s):")
            for p in projects:
                print(f"    - Key: [{p.get('key')}] | Name: '{p.get('name')}' | ID: {p.get('id')}")
            return projects
        return []

    def detect_custom_fields(self):
        """Locates custom field ID for Story Points if configured."""
        fields = self._request("field", api_version="3")
        if fields and isinstance(fields, list):
            for f in fields:
                fname = f.get("name", "").lower()
                if fname in ["story points", "story point estimate", "story points estimate"]:
                    self.story_points_field = f.get("id")
                    print(f"[+] Detected Story Points field: '{f.get('name')}' -> ID: {self.story_points_field}")
                    return self.story_points_field
        print("[-] Story Points field not found; story points will be documented in issue descriptions.")
        return None

    def get_issue_types(self, project_key):
        """Fetches issue types for the project."""
        res = self._request(f"project/{project_key}", api_version="3")
        type_mapping = {}
        if res and "issueTypes" in res:
            for it in res["issueTypes"]:
                type_mapping[it.get("name").lower()] = it.get("name")
        self.issue_types_cache = type_mapping
        return type_mapping

    def _resolve_issue_type(self, desired_type):
        desired_lower = desired_type.lower()
        if desired_lower in self.issue_types_cache:
            return self.issue_types_cache[desired_lower]
        if "story" in self.issue_types_cache and "story" in desired_lower:
            return self.issue_types_cache["story"]
        if "bug" in self.issue_types_cache and "bug" in desired_lower:
            return self.issue_types_cache["bug"]
        if "task" in self.issue_types_cache:
            return self.issue_types_cache["task"]
        return desired_type

    def _text_to_adf(self, text):
        """Converts plaintext into Atlassian Document Format (ADF) for Jira REST API v3."""
        paragraphs = []
        for line in text.split("\n"):
            line = line.strip()
            if line:
                paragraphs.append({
                    "type": "paragraph",
                    "content": [{"type": "text", "text": line}]
                })
        if not paragraphs:
            paragraphs.append({
                "type": "paragraph",
                "content": [{"type": "text", "text": " "}]
            })
        return {
            "type": "doc",
            "version": 1,
            "content": paragraphs
        }

    def create_issue(self, project_key, summary, description, issue_type="Story", story_points=None, priority=None, labels=None):
        resolved_type = self._resolve_issue_type(issue_type)
        fields = {
            "project": {"key": project_key},
            "summary": summary,
            "description": self._text_to_adf(description),
            "issuetype": {"name": resolved_type}
        }
        if labels:
            fields["labels"] = labels
        if priority:
            fields["priority"] = {"name": priority}
        if story_points and self.story_points_field:
            fields[self.story_points_field] = float(story_points)

        res = self._request("issue", method="POST", data={"fields": fields}, api_version="3")
        if res and "key" in res:
            print(f"    [+] Created {resolved_type} [{res['key']}]: {summary}")
            return res["key"]
        else:
            # Fallback to API v2 if ADF v3 validation fails
            print(f"    [*] Retrying issue creation via API v2 for: {summary}...")
            fields["description"] = description
            res_v2 = self._request("issue", method="POST", data={"fields": fields}, api_version="2")
            if res_v2 and "key" in res_v2:
                print(f"    [+] Created {resolved_type} [{res_v2['key']}]: {summary}")
                return res_v2["key"]
            else:
                print(f"    [-] Failed to create issue '{summary}'")
                return None

    def get_or_create_board(self, project_key):
        print(f"[*] Locating Agile Board for project '{project_key}'...")
        res = self._request(f"board?projectKeyOrId={project_key}", is_agile=True)
        if res and "values" in res and len(res["values"]) > 0:
            # Prefer a scrum board
            for b in res["values"]:
                if b.get("type") == "scrum":
                    print(f"[+] Found Scrum Board: '{b.get('name')}' (ID: {b.get('id')})")
                    return b.get("id")
            # Fallback to first available board
            b = res["values"][0]
            print(f"[+] Found Board: '{b.get('name')}' (ID: {b.get('id')}, Type: {b.get('type')})")
            return b.get("id")
            
        print(f"[-] No existing Scrum board found automatically for project '{project_key}'.")
        return None

    def create_sprint(self, board_id, name, goal):
        print(f"[*] Creating Sprint: '{name}' on Board ID {board_id}...")
        payload = {
            "name": name,
            "originBoardId": board_id,
            "goal": goal
        }
        res = self._request("sprint", method="POST", data=payload, is_agile=True)
        if res and "id" in res:
            print(f"[+] Successfully created Sprint '{res.get('name')}' (Sprint ID: {res.get('id')})")
            return res.get("id")
        else:
            print(f"[-] Failed to create sprint '{name}'.")
            return None

    def move_issues_to_sprint(self, sprint_id, issue_keys):
        if not issue_keys:
            return
        print(f"[*] Moving {len(issue_keys)} issues to Sprint ID {sprint_id}: {issue_keys}...")
        payload = {"issues": issue_keys}
        res = self._request(f"sprint/{sprint_id}/issue", method="POST", data=payload, is_agile=True)
        if res and res.get("code") in [204, 200] or res.get("status") == "success":
            print(f"[+] Issues successfully assigned to Sprint ID {sprint_id}.")
            return True
        else:
            print(f"[-] Could not assign issues to sprint.")
            return False

    def build_full_ucms_backlog_and_sprints(self, project_key):
        print(f"\n{'='*70}")
        print(f"  CREATING BACKLOGS & SPRINTS IN JIRA PROJECT: {project_key}")
        print(f"{'='*70}\n")

        self.detect_custom_fields()
        self.get_issue_types(project_key)

        # 1. Locate Agile Board
        board_id = self.get_or_create_board(project_key)

        # 2. Define Sprint 1 User Stories
        sprint_1_definitions = [
            {
                "summary": "Club Officer Event Proposal Submission & Budget Tracking",
                "description": (
                    "As a Club Officer, I want to submit an event proposal with venue, date, time, and budget so that campus resources can be requested.\n\n"
                    "Acceptance Criteria (Gherkin Syntax):\n"
                    "Given valid event input fields (Title, Organizing Club, Date, Time, Venue, Itemized Budget),\n"
                    "When the officer clicks submit,\n"
                    "Then the system validates venue availability, ensures itemized budget sums <= $1,500 cap, and transitions proposal status to PENDING_APPROVAL."
                ),
                "points": 5,
                "priority": "High",
                "type": "Story",
                "labels": ["Module-1", "Proposal-Workflow", "Sprint-1"]
            },
            {
                "summary": "Automated Campus Venue Conflict Detection & Calendar Locking",
                "description": (
                    "As a System, I must detect overlapping date/time venue reservations to prevent auditorium double-booking across clubs.\n\n"
                    "Acceptance Criteria (Gherkin Syntax):\n"
                    "Given an existing reservation on date D from T1 to T2 at venue V,\n"
                    "When a new proposal requests venue V overlapping interval [T1, T2],\n"
                    "Then the system flags a venue collision alert, indicates the conflicting event, and blocks submission."
                ),
                "points": 5,
                "priority": "High",
                "type": "Story",
                "labels": ["Module-1", "Conflict-Detection", "Sprint-1"]
            },
            {
                "summary": "Faculty Advisor Review, Approval & Revision Workflow",
                "description": (
                    "As a Faculty Advisor, I want to review proposed events and approve, request revision, or reject them with feedback.\n\n"
                    "Acceptance Criteria (Gherkin Syntax):\n"
                    "Given a pending event proposal in the advisor portal,\n"
                    "When the advisor evaluates the proposal details,\n"
                    "Then the advisor can:\n"
                    " 1. Approve (locks venue on campus calendar and publishes to student registration portal)\n"
                    " 2. Request Revision (returns proposal to officer with mandatory feedback remarks)\n"
                    " 3. Reject (marks status as REJECTED with rejection justification)."
                ),
                "points": 5,
                "priority": "High",
                "type": "Story",
                "labels": ["Module-1", "Faculty-Review", "Sprint-1"]
            }
        ]

        # 3. Define Sprint 2 User Stories
        sprint_2_definitions = [
            {
                "summary": "Student Registration & High-Contrast 2D QR Entry Pass Generation",
                "description": (
                    "As a Student, I want to register for approved campus events and receive a cryptographically signed digital QR Entry Pass.\n\n"
                    "Acceptance Criteria (Gherkin Syntax):\n"
                    "Given an approved event published on the portal,\n"
                    "When an authenticated student enters PRN and university email to register,\n"
                    "Then the system generates a unique Ticket ID (TKT-XXXX), generates an authorization payload token, and renders a high-contrast 2D QR entry pass modal."
                ),
                "points": 5,
                "priority": "High",
                "type": "Story",
                "labels": ["Module-2", "QR-Pass", "Sprint-2"]
            },
            {
                "summary": "Real-Time Mobile Web QR Scanner with Atomic Duplicate Check-In Prevention",
                "description": (
                    "As an Event Organizer, I want to scan QR passes at the entrance to verify attendance and reject duplicate attempts in real time.\n\n"
                    "Acceptance Criteria (Gherkin Syntax):\n"
                    "Given an entry pass presented at venue entrance,\n"
                    "When scanned via the web camera viewfinder or manual token entry,\n"
                    "Then:\n"
                    " - If valid: mark status ATTENDED with timestamp and display GREEN SUCCESS badge.\n"
                    " - If already attended: abort check-in, log duplicate attempt, and flash RED DUPLICATE WARNING.\n"
                    " - If unregistered token: flash AMBER INVALID WARNING."
                ),
                "points": 8,
                "priority": "Highest",
                "type": "Story",
                "labels": ["Module-2", "Attendance-Scanner", "Sprint-2"]
            },
            {
                "summary": "Automated Certificate of Participation Generation for Verified Attendees",
                "description": (
                    "As an Attended Student, I want to view and download my official participation certificate unlocked by verified attendance.\n\n"
                    "Acceptance Criteria (Gherkin Syntax):\n"
                    "Given a registered student,\n"
                    "When ticket status == ATTENDED,\n"
                    "Then the system unlocks the Certificate of Participation with student details, club credentials, authorized signature, and verification watermark.\n"
                    "If ticket status is unverified, access remains disabled."
                ),
                "points": 3,
                "priority": "Medium",
                "type": "Story",
                "labels": ["Module-2", "Certificate", "Sprint-2"]
            }
        ]

        # 4. Define Product Backlog Items (Unassigned Stories & Tech Debt)
        backlog_definitions = [
            {
                "summary": "Role-Based Access Control (RBAC) & Central Admin Management Portal",
                "description": (
                    "As a Campus Administrator, I want to configure club tier quotas, audit venue schedules, and govern role permissions.\n\n"
                    "Acceptance Criteria:\n"
                    "Given an admin account, allow viewing all clubs, adjusting capacity limits, and exporting master compliance logs."
                ),
                "points": 5,
                "priority": "Medium",
                "type": "Story",
                "labels": ["Governance", "Backlog", "Module-Admin"]
            },
            {
                "summary": "Interactive Master Campus Event Calendar with Filtering & Venue Schedules",
                "description": (
                    "As a Student or Faculty member, I want to browse an interactive campus calendar filtered by club, category, and venue.\n\n"
                    "Acceptance Criteria:\n"
                    "Given published events, render a synchronized calendar displaying event slots and real-time venue utilization."
                ),
                "points": 3,
                "priority": "Medium",
                "type": "Story",
                "labels": ["Calendar", "Backlog", "Module-1"]
            },
            {
                "summary": "Event Participation Analytics & Demographics Export Dashboard",
                "description": (
                    "As a Club Officer, I want to inspect turnout rates, demographic breakdowns, and export verified attendance roster CSVs.\n\n"
                    "Acceptance Criteria:\n"
                    "Provide exportable CSV roster containing Ticket ID, Student Name, PRN, Department, and Scan Timestamps."
                ),
                "points": 5,
                "priority": "Low",
                "type": "Story",
                "labels": ["Analytics", "Backlog", "Module-2"]
            }
        ]

        # 5. Define Defects / Bugs in Backlog
        bug_definitions = [
            {
                "summary": "[BUG] Venue collision check false positive on adjacent boundary intervals",
                "description": (
                    "Steps to Reproduce:\n"
                    "1. Schedule Event A (10:00 - 12:00) at Main Auditorium.\n"
                    "2. Submit Event B (12:00 - 14:00) at Main Auditorium.\n"
                    "3. System threw erroneous venue collision alert.\n\n"
                    "Root Cause & Resolution:\n"
                    "Logic used inclusive comparison (<=, >=). Corrected to strict boundary inequality (start < evEnd && end > evStart)."
                ),
                "priority": "High",
                "type": "Bug",
                "labels": ["Bug", "Module-1", "Boundary-Testing"]
            },
            {
                "summary": "[BUG] Budget line items permitted negative numeric inputs, bypassing $1,500 annual cap",
                "description": (
                    "Steps to Reproduce:\n"
                    "1. Open proposal form.\n"
                    "2. Enter -500 in Marketing cost.\n"
                    "3. Total calculated as net reduced, allowing excessive equipment costs.\n\n"
                    "Root Cause & Resolution:\n"
                    "Added HTML5 min='0' validation and sanitized input in JS via Math.max(0, val)."
                ),
                "priority": "High",
                "type": "Bug",
                "labels": ["Bug", "Module-1", "Validation"]
            },
            {
                "summary": "[BUG] Rapid double-clicking on scanner simulation caused duplicate check-ins",
                "description": (
                    "Steps to Reproduce:\n"
                    "1. Open Scanner Console.\n"
                    "2. Rapidly double-click scan trigger in < 200ms.\n"
                    "3. Two attendance check-in timestamps were recorded.\n\n"
                    "Root Cause & Resolution:\n"
                    "Asynchronous race condition. Enforced immediate atomic status check guard before triggering DOM update."
                ),
                "priority": "Highest",
                "type": "Bug",
                "labels": ["Bug", "Module-2", "Concurrency"]
            },
            {
                "summary": "[BUG] QR canvas failed to render when student name contained international Unicode characters",
                "description": (
                    "Steps to Reproduce:\n"
                    "1. Register student with accented character in name (e.g. 'Müller').\n"
                    "2. QR canvas rendered blank.\n\n"
                    "Root Cause & Resolution:\n"
                    "Byte encoding mismatch. Encoded string with encodeURIComponent() and ASCII serializer prior to QR rendering."
                ),
                "priority": "Medium",
                "type": "Bug",
                "labels": ["Bug", "Module-2", "Encoding"]
            },
            {
                "summary": "[BUG] Certificate modal was accessible to students prior to event entrance check-in",
                "description": (
                    "Steps to Reproduce:\n"
                    "1. Register for event.\n"
                    "2. Invoke certificate modal directly prior to venue check-in.\n"
                    "3. Certificate rendered for unverified student.\n\n"
                    "Root Cause & Resolution:\n"
                    "Enforced guard condition: ticket.status must strictly equal 'ATTENDED' before rendering certificate modal."
                ),
                "priority": "High",
                "type": "Bug",
                "labels": ["Bug", "Module-2", "Security"]
            }
        ]

        # Step A: Create Sprint 1 Issues
        print("\n--- Creating Sprint 1 User Stories ---")
        sprint_1_keys = []
        for item in sprint_1_definitions:
            key = self.create_issue(
                project_key=project_key,
                summary=item["summary"],
                description=item["description"],
                issue_type=item["type"],
                story_points=item.get("points"),
                priority=item.get("priority"),
                labels=item.get("labels")
            )
            if key:
                sprint_1_keys.append(key)

        # Step B: Create Sprint 2 Issues
        print("\n--- Creating Sprint 2 User Stories ---")
        sprint_2_keys = []
        for item in sprint_2_definitions:
            key = self.create_issue(
                project_key=project_key,
                summary=item["summary"],
                description=item["description"],
                issue_type=item["type"],
                story_points=item.get("points"),
                priority=item.get("priority"),
                labels=item.get("labels")
            )
            if key:
                sprint_2_keys.append(key)

        # Step C: Create Backlog User Stories
        print("\n--- Creating Additional Product Backlog Stories ---")
        backlog_keys = []
        for item in backlog_definitions:
            key = self.create_issue(
                project_key=project_key,
                summary=item["summary"],
                description=item["description"],
                issue_type=item["type"],
                story_points=item.get("points"),
                priority=item.get("priority"),
                labels=item.get("labels")
            )
            if key:
                backlog_keys.append(key)

        # Step D: Create Bugs in Backlog
        print("\n--- Creating Defects & Bug Tracker Items in Backlog ---")
        bug_keys = []
        for item in bug_definitions:
            key = self.create_issue(
                project_key=project_key,
                summary=item["summary"],
                description=item["description"],
                issue_type=item["type"],
                priority=item.get("priority"),
                labels=item.get("labels")
            )
            if key:
                bug_keys.append(key)

        # Step E: Create Sprints on Board (if board found) and link issues
        sprint_1_id = None
        sprint_2_id = None
        if board_id:
            print("\n--- Setting Up Sprints on Agile Board ---")
            sprint_1_id = self.create_sprint(
                board_id=board_id,
                name="UCMS Sprint 1: Event Lifecycle & Multi-Tier Approvals",
                goal="Deliver Event Proposal Submission, Itemized Budget Calculation, Automated Venue Collision Locking, and Faculty Review Portal (15 SP)"
            )
            if sprint_1_id and sprint_1_keys:
                self.move_issues_to_sprint(sprint_1_id, sprint_1_keys)

            sprint_2_id = self.create_sprint(
                board_id=board_id,
                name="UCMS Sprint 2: QR Attendance & Digital Passes",
                goal="Deliver Student Registration, Client-Side QR Pass Generation, Real-Time Mobile Web Scanner, Duplicate Check-in Prevention, and Participation Certificates (16 SP)"
            )
            if sprint_2_id and sprint_2_keys:
                self.move_issues_to_sprint(sprint_2_id, sprint_2_keys)
        else:
            print("\n[!] Notice: Agile board not linked directly. All issues created are placed in the Project Product Backlog.")

        # Summary Report
        print(f"\n{'='*70}")
        print("  JIRA SYNC COMPLETION SUMMARY")
        print(f"{'='*70}")
        print(f"Project Key: {project_key}")
        print(f"Sprint 1 Issues ({len(sprint_1_keys)} items): {', '.join(sprint_1_keys) if sprint_1_keys else 'None'}")
        print(f"Sprint 2 Issues ({len(sprint_2_keys)} items): {', '.join(sprint_2_keys) if sprint_2_keys else 'None'}")
        print(f"Product Backlog Stories ({len(backlog_keys)} items): {', '.join(backlog_keys) if backlog_keys else 'None'}")
        print(f"Defect / Bug Backlog ({len(bug_keys)} items): {', '.join(bug_keys) if bug_keys else 'None'}")
        print(f"Total Issues Created: {len(sprint_1_keys) + len(sprint_2_keys) + len(backlog_keys) + len(bug_keys)}")
        print(f"{'='*70}\n")
        return {
            "sprint_1": sprint_1_keys,
            "sprint_2": sprint_2_keys,
            "backlog": backlog_keys,
            "bugs": bug_keys
        }

def main():
    if "--help" in sys.argv or "-h" in sys.argv:
        print("Usage: python jira_sync.py <domain> <email> [api_token] [project_key]")
        print("Example: python jira_sync.py myteam.atlassian.net user@example.com")
        return

    print("===================================================================")
    print("  UCMS JIRA Cloud Automation Client - Arya Dhanule (A6_B4_64)      ")
    print("===================================================================")

    domain = sys.argv[1] if len(sys.argv) > 1 else os.getenv("JIRA_DOMAIN", "")
    email = sys.argv[2] if len(sys.argv) > 2 else os.getenv("JIRA_EMAIL", "")
    token = sys.argv[3] if len(sys.argv) > 3 else os.getenv("JIRA_API_TOKEN", DEFAULT_API_TOKEN)
    project_key = sys.argv[4] if len(sys.argv) > 4 else os.getenv("JIRA_PROJECT_KEY", "")

    if not domain:
        domain = input("Enter your Atlassian Jira domain (e.g. yourcompany.atlassian.net): ").strip()
    if not email:
        email = input("Enter your Atlassian account email address: ").strip()

    if not domain or not email:
        print("[-] Error: Jira Domain and Email are required.")
        print("Usage: python jira_sync.py <domain> <email> [api_token] [project_key]")
        return

    client = JiraCloudClient(domain=domain, email=email, token=token)
    user_info = client.verify_credentials()
    if not user_info:
        return

    projects = client.list_projects()
    if not project_key:
        if len(projects) == 1:
            project_key = projects[0].get("key")
            print(f"[*] Auto-selected only available project: [{project_key}]")
        elif len(projects) > 1:
            matching = [p.get("key") for p in projects if p.get("key") == "UCMS"]
            if matching:
                project_key = matching[0]
                print(f"[*] Selected matching project: [{project_key}]")
            else:
                project_key = input("Enter the target Project Key from above (e.g. UCMS): ").strip().upper()
        else:
            project_key = input("Enter target Project Key (e.g. UCMS): ").strip().upper()

    if project_key:
        client.build_full_ucms_backlog_and_sprints(project_key)

if __name__ == "__main__":
    main()
