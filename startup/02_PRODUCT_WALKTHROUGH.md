# 📱 CareFlo - Complete Product Walkthrough

## **Step-by-Step Guide Through Every Feature**

---

## 🏁 Getting Started

### **1. Application Launch**

When you open CareFlo at `http://localhost:3000`, you're greeted with:

1. **Login/Registration Screen**
   - Clean, minimal interface
   - Two options:
     - ✅ **Login** (for existing users)
     - ✅ **Register** (for new patients)

### **2. User Registration Flow** (First-Time Patients)

**Step 1:** Click "Register" tab
```
Fields Required:
- Username (unique identifier)
- Password (securely hashed)
- Full Name (for appointments)
```

**Step 2:** Submit registration
- System creates account instantly
- Auto-login after registration
- Redirects to patient dashboard

**Behind the Scenes:**
- Password hashed using `werkzeug.security`
- Stored in `backend/users.json`
- JWT token generated for session

---

## 👤 Patient Journey

### **Step 1: Login & Language Selection**

**What You See:**
```
🌐 Select Language: [English] [हिंदी] [తెలుగు]

Signed in: patient123 (patient)              [Logout]
```

**Features:**
- 🌍 **Language Toggle:** Click any language to see entire UI translate
- 👁️ **Identity Display:** Always know who you're logged in as
- 🚪 **Quick Logout:** One click to sign out

---

### **Step 2: Book an Appointment**

**Navigation:**
- Default tab: "📅 Book Appointment"
- Alternative: "📋 My Prescriptions" (switch via tabs)

#### **Booking Form - Field by Field**

**A. Hospital Selection**
```
🏥 Select Hospital:
[Dropdown Menu]
↓
- Apollo Hospital
- Kamineni Hospital
- Care Hospital
- AIG Hospital
- Yashoda Hospital
- Government Hospital
- Medicover Hospital
```

**Real-Time Feature:** As you select a hospital, a "Hospital Busyness Status" box appears:

```
╔══════════════════════════════════════╗
║  🏥 Apollo Hospital                  ║
║  Status: 🟢 Available                ║
║  Queue Count: 2 patients             ║
║  Estimated Wait: < 5 min             ║
╚══════════════════════════════════════╝
```

**Status Indicators:**
- 🟢 **Green (Available):** 0 patients
- 🟠 **Orange (Moderate):** 1-5 patients
- 🔴 **Red (Busy):** 6+ patients

---

**B. Department Selection**
```
🏥 Select Department:
[Dropdown Menu]
↓
- Cardiology (Heart & Circulatory)
- Orthopedics (Bones & Joints)
- Neurology (Brain & Nervous System)
- Pediatrics (Children's Health)
- Dermatology (Skin Conditions)
- Ophthalmology (Eye Care)
- ENT (Ear, Nose & Throat)
- General Medicine
- Psychiatry (Mental Health)
- Obstetrics (Pregnancy & Childbirth)
```

**Smart Feature: "Not Sure Which Department?"**
- Click to open **Symptom Checker Modal**
- Describe symptoms in plain language
- Get department suggestions

**Symptom Checker Example:**
```
Symptom Input: "chest pain and breathlessness"
↓
🚨 EMERGENCY DETECTED!
Recommended: Cardiology
Priority: URGENT - Visit ER immediately
```

---

**C. Date & Time Selection**
```
📅 Appointment Date: [Calendar Picker]
  - Minimum: Today
  - Maximum: 30 days ahead

⏰ Shift:
  ( ) Morning (9 AM - 1 PM)
  ( ) Afternoon (2 PM - 6 PM)
```

**Real-Time Queue Count:**
```
Current Queue for Cardiology on 2026-02-10:
Morning: 3 patients waiting
Afternoon: 1 patient waiting
```

---

**D. Slot Selection**
```
🕐 Select Time Slot:

Morning Slots:          Afternoon Slots:
○ 9:00 AM              ○ 2:00 PM
○ 9:30 AM              ○ 2:30 PM
○ 10:00 AM             ○ 3:00 PM
○ 10:30 AM             ○ 3:30 PM
○ 11:00 AM             ○ 4:00 PM
○ 11:30 AM             ○ 4:30 PM
○ 12:00 PM             ○ 5:00 PM
○ 12:30 PM             ○ 5:30 PM
```

**Visual Feedback:**
- Selected slot: **Blue highlight**
- Hover effect: Smooth color transition

---

**E. Optional: Add Symptoms**
```
💬 Describe Your Symptoms (Optional):
[Text Area - Multi-line input]

Examples:
- "Severe chest pain since morning"
- "High fever for 3 days"
- "Persistent headache"
```

**AI Triage Feature:**
- Keywords like "chest pain", "breathlessness", "unconscious" trigger emergency flag
- Your appointment gets marked **🚨 EMERGENCY**
- Doctors see you highlighted in **red** on their dashboard
- You jump ahead in the queue

---

**F. Confirm Booking**
```
[Book Appointment] ← Click to submit
```

---

### **Step 3: Confirmation Page**

**Success! You see:**

```
╔═══════════════════════════════════════════════════════╗
║          ✅ Appointment Confirmed!                    ║
╠═══════════════════════════════════════════════════════╣
║  Patient: Arjun Sundar                                ║
║  Hospital: Apollo Hospital                            ║
║  Department: Cardiology                               ║
║  Date: 10 Feb 2026                                    ║
║  Shift: Morning (9:00 AM - 1:00 PM)                   ║
║  Slot: 10:00 AM                                       ║
║  Reference #: REF-8a3f9d42                            ║
║                                                        ║
║  📊 Current Queue Position: #4                        ║
║  ⏱️ Estimated Wait Time: ~20 minutes                  ║
╚═══════════════════════════════════════════════════════╝

[Book Another Appointment]
```

**What Happens Behind the Scenes:**
1. POST request to `/book` endpoint
2. Patient record created with unique ID
3. Symptoms analyzed for emergency keywords
4. Queue count incremented
5. Real-time dashboard updates for doctors

**Pro Tip:** Save your **Reference Number** - you can use it to track your appointment!

---

### **Step 4: View Your Prescriptions**

**Navigation:** Click "📋 My Prescriptions" tab

**What You See:**
```
═══════════════════════════════════════════════════════
📋 MY PRESCRIPTIONS
═══════════════════════════════════════════════════════

╔═══════════════════════════════════════════════════════╗
║  📄 Prescription #1                                   ║
╠═══════════════════════════════════════════════════════╣
║  Date: 08 Feb 2026                                    ║
║  Doctor: Dr. Sharma (username: doctor)                ║
║  Hospital: Apollo Hospital                            ║
║  Department: Cardiology                               ║
║                                                        ║
║  💊 MEDICATIONS:                                      ║
║  ┌─────────────────────────────────────────────────┐  ║
║  │ Tablet: Aspirin                                 │  ║
║  │ Dosage: 1-0-1 (Morning & Night)                 │  ║
║  │ Duration: 7 days                                │  ║
║  └─────────────────────────────────────────────────┘  ║
║  ┌─────────────────────────────────────────────────┐  ║
║  │ Tablet: Lisinopril                              │  ║
║  │ Dosage: 1-0-0 (Morning only)                    │  ║
║  │ Duration: 30 days                               │  ║
║  └─────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════╝

[Download PDF] [Print]
```

**Features:**
- ✅ Digital history - never lose a prescription
- ✅ Structured medication data (tablet, dosage, duration)
- ✅ Doctor attribution (know who prescribed what)
- ✅ Accessible anytime, anywhere

---

## 👨‍⚕️ Doctor Journey

### **Step 1: Doctor Login**

**Credentials (Demo):**
```
Username: doctor
Password: doctorpass
```

**Auto-Department Assignment:**
- Each doctor is assigned to a department (e.g., Cardiology)
- Dashboard auto-filters to show only their department's patients

---

### **Step 2: Doctor Dashboard**

**What You See:**

```
═══════════════════════════════════════════════════════
👨‍⚕️ DOCTOR DASHBOARD - Cardiology
═══════════════════════════════════════════════════════

Filters:
Hospital: [All Hospitals ▼]
Date: [2026-02-10 📅]

─────────────────────────────────────────────────────────
🌅 MORNING SHIFT (9 AM - 1 PM)
─────────────────────────────────────────────────────────

╔════════════════════════════════════════════════════╗
║ 🚨 EMERGENCY PATIENT                               ║
╠════════════════════════════════════════════════════╣
║ Name: Rajesh Kumar                                 ║
║ Slot: 9:30 AM                                      ║
║ Symptoms: "severe chest pain, breathlessness"      ║
║ Hospital: Apollo Hospital                          ║
║ Status: 🟡 Waiting                                 ║
║                                                     ║
║ [View Details] [Start Checkup] [Mark as Done]     ║
╚════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════╗
║ Patient: Arjun Sundar                              ║
╠════════════════════════════════════════════════════╣
║ Slot: 10:00 AM                                     ║
║ Symptoms: "routine checkup"                        ║
║ Hospital: Apollo Hospital                          ║
║ Status: 🟡 Waiting                                 ║
║                                                     ║
║ [View Details] [Start Checkup] [Mark as Done]     ║
╚════════════════════════════════════════════════════╝

─────────────────────────────────────────────────────────
🌆 AFTERNOON SHIFT (2 PM - 6 PM)
─────────────────────────────────────────────────────────

(1 patient waiting...)
```

**Key Features:**

1. **🚨 Emergency Highlighting:**
   - Red border + "EMERGENCY PATIENT" badge
   - Appear at top of queue
   - Symptoms visible before patient enters

2. **Smart Queue Sorting:**
   - Emergencies first
   - Then by slot time
   - Separate morning/afternoon tabs

3. **Filtering Options:**
   - Filter by hospital (for doctors working across locations)
   - Filter by date (see future appointments or review past)

---

### **Step 3: Patient Checkup & Prescription**

**Click "View Details" on a Patient Card:**

```
╔════════════════════════════════════════════════════╗
║  PATIENT DETAILS - Arjun Sundar                    ║
╠════════════════════════════════════════════════════╣
║  User ID: patient123                               ║
║  Appointment Slot: 10:00 AM                        ║
║  Department: Cardiology                            ║
║  Symptoms: "routine checkup for blood pressure"    ║
║                                                     ║
║  ──────────────────────────────────────────────    ║
║  📝 WRITE PRESCRIPTION                             ║
║  ──────────────────────────────────────────────    ║
║                                                     ║
║  Medication #1:                                    ║
║  Tablet Name: [Input]                              ║
║  Dosage: [1-0-1 ▼]                                 ║
║  Days: [7 ▼]                                       ║
║                                                     ║
║  [+ Add Another Medication]                        ║
║                                                     ║
║  ──────────────────────────────────────────────    ║
║  [Save Prescription] [Mark Patient as Done]        ║
╚════════════════════════════════════════════════════╝
```

**Dosage Dropdown Options:**
```
1-0-0 (Morning only)
1-1-0 (Morning + Afternoon)
1-0-1 (Morning + Night)
1-1-1 (Three times a day)
0-0-1 (Night only)
```

**Days Dropdown:** 1, 3, 7, 10, 14, 21, 30, 60, 90

---

**Click "Mark Patient as Done":**
- Patient removed from queue
- Queue count decrements
- Slot becomes available again
- Prescription auto-saved to patient's profile

**Success Message:**
```
✅ Patient "Arjun Sundar" marked as completed!
Slot 10:00 AM is now available.
```

---

## 🎛️ Admin Journey

### **Admin Login**
```
Username: admin
Password: adminpass
```

### **Admin Controls**

**Admin Dashboard:**
```
═══════════════════════════════════════════════════════
🛠️ ADMIN DASHBOARD
═══════════════════════════════════════════════════════

System Statistics:
- Total Active Patients: 47
- Hospitals: 7
- Departments: 10
- Prescriptions Issued Today: 23

─────────────────────────────────────────────────────────

🚨 DANGER ZONE

[Reset All Queues]
⚠️ This will clear all appointment data.
Use at end of day or for system maintenance.

```

**Reset Functionality:**
- Clears in-memory queue data
- Resets patient counts to zero
- Preserves user accounts & prescriptions
- Useful for daily queue resets

---

## 🔧 Technical Features (Under the Hood)

### **1. Real-Time Updates**

**How It Works:**
- Frontend polls `/patients` endpoint every 5 seconds
- Doctor dashboard auto-refreshes queue
- Patients marked "done" disappear instantly

### **2. Security**

**Authentication Flow:**
```
1. User enters username/password
2. Backend validates credentials (password hash check)
3. Server generates JWT token (UUID-based)
4. Token stored in localStorage
5. All API calls include: Authorization: Bearer <token>
6. Backend validates token on every request
```

**Role-Based Access:**
- `/book` endpoint: Patients only
- `/patients` endpoint: Doctors only
- `/reset` endpoint: Admins only

### **3. Data Persistence**

**Storage Locations:**
- `backend/users.json` → User accounts
- `backend/prescriptions.json` → Digital prescriptions
- In-memory → Active queue (resets on server restart)

**Future Enhancement:** Migrate to PostgreSQL for production

---

## 🌍 Multilingual Experience

**Language Toggle Demo:**

**English:**
```
Book Appointment
Select Hospital: Apollo Hospital
```

**Hindi (हिंदी):**
```
अपॉइंटमेंट बुक करें
अस्पताल चुनें: अपोलो अस्पताल
```

**Telugu (తెలుగు):**
```
అపాయింట్‌మెంట్ బుక్ చేయండి
ఆసుపత్రిని ఎంచుకోండి: అపోలో ఆసుపత్రి
```

**Supported Elements:**
- ✅ Form labels
- ✅ Button text
- ✅ Status messages
- ✅ Error messages
- ✅ Department names

---

## 📊 Analytics & Insights (Future Feature Preview)

**Planned Dashboard Metrics:**
- Average wait time per department
- Peak hours heatmap
- No-show rate tracking
- Doctor efficiency scores
- Patient satisfaction ratings

---

## 🎬 Demo Script for Expo

**5-Minute Live Demo:**

1. **[0:00-1:00]** Login as Patient → Show language toggle
2. **[1:00-2:00]** Book appointment with symptoms → Show emergency triage
3. **[2:00-3:00]** Login as Doctor → Show emergency patient highlighted
4. **[3:00-4:00]** Write prescription → Mark patient done
5. **[4:00-5:00]** Login back as Patient → Show prescription vault

**Key Talking Points:**
- "Notice how the emergency patient jumps to the top of the queue"
- "See how the doctor can view symptoms before the patient enters"
- "This prescription is now permanently stored in the patient's digital vault"
- "All of this works on any mobile browser - zero hardware needed"

---

## ✨ Conclusion

CareFlo transforms the hospital experience by:
- ✅ Reducing patient anxiety (transparent wait times)
- ✅ Improving emergency response (AI triage)
- ✅ Digitizing records (prescription vault)
- ✅ Empowering doctors (symptom preview)
- ✅ Cutting costs (no hardware)

**Next Steps:** Book a demo at [team@careflo.io](mailto:team@careflo.io)
