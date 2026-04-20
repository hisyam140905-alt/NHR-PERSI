Add a new module called “SIAP PERSI Assessment” into an existing hospital web dashboard.
Do not redesign the existing website.
Only design new pages and components that integrate with the current dashboard layout.
The module is used by hospitals to submit quality assessment data, which will then be reviewed by an admin panel.
The system automatically calculates scores based on parameter values.
SYSTEM OVERVIEW
The SIAP PERSI assessment consists of three components:
RSBK (Hospital Capability) — 15%
Clinical Audit — 60%
Patient Reported Measurement — 25%
Each component uses numbered parameters for scoring.
SPECIALTIES
Only three specialties exist:
Cardiology
Oncology
Neurology
All medical staff, facilities, and equipment must follow Indonesian hospital classification standards. 
Resume 24 Kemampuan Layanan Rum…
PARAMETER SYSTEM
Every assessment item is filled using numeric parameters.
Use dropdown selection:
1 = Compliant / Available
2 = Not Compliant / Not Available
3 = Partial / Shared Service
The system should automatically convert these numbers into scores.
Example scoring logic:
1 = score 100
2 = score 0
3 = score 50
MODULE FLOW
Hospital User Flow
Dashboard
→ SIAP PERSI Module
→ Select Specialty
→ Fill RSBK
→ Fill Clinical Audit
→ Fill Patient Report
→ Submit Assessment
Admin Flow
Admin Dashboard
→ Review Submissions
→ Approve / Reject
→ Finalize Score
PAGE 1 — SIAP PERSI OVERVIEW
Add a new dashboard page.
Components:
Assessment progress tracker
Steps:
1 RSBK
2 Clinical Audit
3 Patient Report
4 Result
Cards showing:
RSBK Score
Audit Score
Patient Score
Final Score
Charts:
Radar chart
RSBK
Audit
Patient
Button:
Continue Assessment
PAGE 2 — SELECT SPECIALTY
Display three cards.
Cardiology
Oncology
Neurology
Each card contains:
Medical icon
Description
Start Assessment button
PAGE 3 — RSBK FORM
Evaluate hospital service capability.
Three sections:
Medical Staff
Facilities
Medical Equipment
Each item uses parameter dropdown.
Example input:
Parameter value
1 = Available
2 = Not Available
3 = Shared / Partial
MEDICAL STAFF PARAMETERS
Cardiology
Sp.JP
Sp.BTKV
Sp.PD
Sp.An
Sp.Rad
Oncology
Sp.PD Hematology Oncology
Sp.B Onkologi
Sp.Onk.Rad
Sp.PA
Sp.Rad
Neurology
Sp.N
Sp.BS
Sp.Rad
Sp.PD
Sp.An
FACILITIES PARAMETERS
ICU
HCU
Operating Room
Isolation Room
Chemotherapy Room
Radiotherapy Room
NICU / PICU
Rehabilitation Room
MEDICAL EQUIPMENT PARAMETERS
Cardiology
ECG
ECHO
Holter Monitor
Cathlab
Defibrillator
Ventilator
Oncology
CT Scan
MRI
Radiotherapy LINAC
Gamma Camera
Chemotherapy Pump
Neurology
EEG
MRI
CT Scan
Angiography System
Neuronavigation
PAGE 4 — CLINICAL AUDIT
Hospitals review 30 patient records.
Each indicator uses parameter scoring.
Example indicators
Diagnosis
Complete medical history
Physical examination documented
Diagnostic tests appropriate
Treatment
Treatment follows guideline
Correct procedure performed
Appropriate medication
Outcome
Complication rate
Length of stay
Mortality
Readmission
Dropdown parameter:
1 = Compliant
2 = Non Compliant
3 = Partial
System calculates average score automatically.
PAGE 5 — PATIENT REPORTED MEASUREMENT
Two sections.
PREM
Doctor communication
Waiting time
Facility comfort
Clarity of explanation
PROM
Symptom improvement
Quality of life improvement
Daily activity ability
Treatment satisfaction
Use parameter scale:
1 = Excellent
2 = Moderate
3 = Poor
Convert automatically to score.
PAGE 6 — AUTO SCORE CALCULATION
Show automatic calculation panel.
Formula
Final Score
RSBK × 0.15
Clinical Audit × 0.60
PREM PROM × 0.25
Display result:
Large score number
Example
88.2
Grade classification
A ≥ 85
B ≥ 70
C ≥ 55
D < 55
PAGE 7 — SUBMISSION PAGE
Hospital submits assessment.
Buttons:
Save Draft
Submit Assessment
After submission:
Status becomes
Pending Review
ADMIN REVIEW DASHBOARD
Create a separate admin interface.
Admin can see:
Hospital name
Specialty
Submission date
Status
Status labels
Pending
Approved
Revision Required
ADMIN REVIEW PAGE
Admin can open submission details.
Show:
All parameters filled by hospital
Calculated scores
Charts
Admin actions:
Approve
Reject
Request Revision
Admin can add comment.
ADMIN ANALYTICS
Admin dashboard charts:
Average SIAP PERSI Score
Top Hospitals
Score Distribution
COMPONENTS NEEDED
Parameter dropdown input
Form section cards
Progress stepper
Score cards
Radar charts
Table list
Admin review panel
DESIGN STYLE
Healthcare dashboard
Minimal
Clean
Professional
Rounded cards
Soft shadows
Clear hierarchy
Use 12-column grid layout.
OUTPUT
Create UI components and pages for a SIAP PERSI assessment module integrated into an existing hospital dashboard system, including hospital input forms and an admin review dashboard.