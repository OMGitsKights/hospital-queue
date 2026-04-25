# 🚀 CareFlo - Quick Start Guide

## **Get CareFlo Running in 5 Minutes**

---

## 📋 Prerequisites

Before you start, make sure you have:

- ✅ **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- ✅ **Python** (v3.8 or higher) - [Download here](https://www.python.org/)
- ✅ **Text Editor** (VS Code, Sublime, etc.)
- ✅ **Terminal/Command Prompt**

**Check Your Installations:**
```bash
node --version   # Should show v14.x.x or higher
python --version # Should show 3.8.x or higher
npm --version    # Should show 6.x.x or higher
```

---

## ⚡ Installation Steps

### **Step 1: Get the Code**

**Option A: Clone from GitHub**
```bash
git clone https://github.com/yourusername/hospital-queue.git
cd hospital-queue
```

**Option B: Download ZIP**
1. Download the project ZIP file
2. Extract to your desired location
3. Open terminal in that folder

---

### **Step 2: Start the Backend Server**

```bash
# Navigate to backend folder
cd backend

# Install Python dependencies
pip install flask flask-cors werkzeug

# Run the server
python app.py
```

**Expected Output:**
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://0.0.0.0:5001
Press CTRL+C to quit
```

✅ **Success!** Backend is running on `http://localhost:5001`

**Test it:** Open browser and visit `http://localhost:5001/health`
- You should see: `{"status":"ok"}`

---

### **Step 3: Start the Frontend Application**

**Open a NEW terminal window** (keep the backend running!)

```bash
# Navigate to project root (if in backend folder)
cd ..

# Install dependencies
npm install

# Start the React app
npm start
```

**Installation Time:** First run takes 1-2 minutes

**Expected Output:**
```
Compiled successfully!

You can now view hospital-queue in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.x:3000
```

✅ **Success!** Your browser should automatically open CareFlo at `http://localhost:3000`

---

## 🎯 First Time Setup

### **Default Login Credentials**

CareFlo comes with 3 pre-configured accounts:

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `adminpass` |
| **Doctor** | `doctor` | `doctorpass` |
| **Patient** | `patient` | `patientpass` |

---

## 👨‍⚕️ Quick Demo - Doctor Workflow

### **1. Login as Doctor**
```
Username: doctor
Password: doctorpass
```

### **2. View Patient Queue**
- You'll see the doctor dashboard
- Initially, no patients in queue
- Filters available: Hospital, Date

### **3. Keep this window open** (we'll come back to it)

---

## 👤 Quick Demo - Patient Workflow

### **1. Open a New Incognito/Private Browser Window**
Visit: `http://localhost:3000`

### **2. Register a New Patient**
```
Click "Register" tab

Username: testpatient1
Password: test123
Name: John Doe

Click [Register]
```

### **3. Book Your First Appointment**
```
Hospital: Apollo Hospital
Department: Cardiology
Date: (Select today's date)
Shift: Morning
Slot: 10:00 AM
Symptoms: "routine checkup"

Click [Book Appointment]
```

✅ **Success!** You'll see a confirmation with a reference number.

### **4. Switch Back to Doctor Window**
- **Refresh the page** (or wait 5 seconds for auto-update)
- You'll now see **John Doe** in the morning queue!

### **5. Complete a Checkup (Doctor View)**
```
1. Click "View Details" on the patient card
2. Fill in prescription:
   - Tablet: Aspirin
   - Dosage: 1-0-1
   - Days: 7
3. Click [Save Prescription]
4. Click [Mark Patient as Done]
```

### **6. View Prescription (Patient View)**
```
1. Switch back to patient window
2. Click "📋 My Prescriptions" tab
3. You'll see the prescription from the doctor!
```

**🎉 Congratulations!** You've completed a full patient journey.

---

## 🌍 Test Multilingual Support

### **1. Change Language**
At the top of the page:
```
🌐 Select Language: [English] [हिंदी] [తెలుగు]
```

### **2. Click "हिंदी" (Hindi)**
- All UI text translates to Hindi
- Form fields, buttons, labels - all localized!

### **3. Try Telugu (తెలుగు)**
- Complete UI translation

---

## 🚨 Test Emergency Triage

### **1. Book an Emergency Appointment**
```
Book new appointment with symptoms:
"severe chest pain and breathlessness"
```

### **2. Check Doctor Dashboard**
- The patient appears with **🚨 EMERGENCY** badge
- Highlighted in **red**
- Appears at **top of queue**

---

## 🛑 Troubleshooting

### **Problem: Backend won't start**

**Error:** `ModuleNotFoundError: No module named 'flask'`

**Solution:**
```bash
pip install --upgrade pip
pip install flask flask-cors werkzeug
```

**Still not working?** Try:
```bash
python3 -m pip install flask flask-cors werkzeug
python3 app.py
```

---

### **Problem: Frontend shows "Proxy error"**

**Error:** `Proxy error: Could not proxy request /auth/login`

**Cause:** Backend server is not running

**Solution:**
1. Check if backend terminal is still running
2. Visit `http://localhost:5001/health` - should show `{"status":"ok"}`
3. If not, restart backend: `python app.py`

---

### **Problem: Port already in use**

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Option 1: Kill the process
# On Mac/Linux:
lsof -ti:3000 | xargs kill

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Option 2: Use a different port
PORT=3001 npm start
```

---

### **Problem: "Invalid credentials" on login**

**Cause:** users.json might be corrupted

**Solution:**
```bash
cd backend
rm users.json  # Delete the file
python app.py  # Restart - it will recreate with defaults
```

---

### **Problem: npm install fails**

**Error:** `Error: EACCES: permission denied`

**Solution:**
```bash
# Try with sudo (Mac/Linux)
sudo npm install

# Or fix npm permissions permanently:
sudo chown -R $USER:$(id -gn $USER) ~/.npm
```

---

## 🔄 Starting Fresh (Reset Data)

### **Reset Queue Data**
**Method 1:** Login as Admin
```
Username: admin
Password: adminpass

Click [Reset All Queues]
```

**Method 2:** Restart Backend
- Stop backend (Ctrl+C)
- Restart: `python app.py`
- In-memory queue resets automatically

### **Reset All Users**
```bash
cd backend
rm users.json
rm prescriptions.json
python app.py  # Recreates defaults
```

---

## 📂 Project Structure Overview

```
hospital-queue/
├── backend/
│   ├── app.py              # Main Flask server
│   ├── users.json          # User accounts (auto-created)
│   └── prescriptions.json  # Prescription storage (auto-created)
│
├── src/
│   ├── App.js              # Main React component
│   ├── Login.js            # Login/Register component
│   ├── AppointmentForm.js  # Booking form
│   ├── DoctorView.js       # Doctor dashboard
│   ├── PatientProfile.js   # Patient prescriptions
│   └── translations.js     # Multilingual support
│
├── public/
│   └── index.html          # HTML template
│
├── package.json            # Frontend dependencies
└── README.md               # Project overview
```

---

## ⚙️ Configuration (Optional)

### **Change Backend Port**
Edit `backend/app.py` (last line):
```python
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
    #                              ^^^^ Change this
```

### **Change Frontend Port**
Create `.env` file in project root:
```
PORT=3001
```

### **Add New Hospital**
Edit `src/constants.js`:
```javascript
export const HOSPITALS = [
  "Apollo Hospital",
  "Your New Hospital",  // Add here
  // ...
];
```

### **Add New Department**
Edit `src/constants.js`:
```javascript
export const DEPARTMENTS = [
  "Cardiology",
  "Your New Department",  // Add here
  // ...
];
```

---

## 📱 Access from Mobile Device (Same Network)

### **1. Find Your Computer's IP Address**

**Mac/Linux:**
```bash
ifconfig | grep "inet "
# Look for something like: 192.168.1.100
```

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address"
```

### **2. Access from Mobile**
Open mobile browser and visit:
```
http://192.168.1.100:3000
(Replace with your IP address)
```

**Note:** Backend must be configured to accept external connections (default: `host="0.0.0.0"` ✅)

---

## 🎬 Demo Mode Checklist

### **Before Your Expo Presentation:**

**1. Pre-load Demo Data**
- ✅ Create 2-3 patient accounts
- ✅ Book sample appointments (mix of normal & emergency)
- ✅ Add 1-2 completed prescriptions

**2. Test All Features**
- ✅ Patient registration
- ✅ Appointment booking
- ✅ Language switching (English → Hindi → Telugu)
- ✅ Doctor dashboard updates
- ✅ Emergency patient highlighting
- ✅ Prescription creation
- ✅ Patient done workflow

**3. Prepare Split-Screen Demo**
- ✅ Left window: Doctor view
- ✅ Right window: Patient view
- ✅ Show real-time sync (patient books → appears in doctor queue)

**4. Clear Previous Test Data**
- ✅ Login as admin → Reset queues
- ✅ Start with clean slate

---

## 🚀 Next Steps

Now that CareFlo is running, explore:

1. **[Product Walkthrough](./02_PRODUCT_WALKTHROUGH.md)** - Detailed feature guide
2. **[Technical Architecture](./03_TECHNICAL_ARCHITECTURE.md)** - How it works under the hood
3. **[Business Model](./05_BUSINESS_MODEL.md)** - Market opportunity & revenue
4. **[Deployment Guide](./07_DEPLOYMENT_GUIDE.md)** - Going to production

---

## 🆘 Still Need Help?

**Common Questions:**

**Q: Can I use this in production?**
A: Current version is MVP. For production, migrate to PostgreSQL and add proper authentication.

**Q: How do I add more doctors?**
A: Currently manual - edit `backend/users.json` and add entry with `"role": "doctor"`

**Q: Does data persist across restarts?**
A: Users & prescriptions: YES (JSON files). Queue: NO (in-memory, resets on restart).

**Q: Can I deploy this to a real hospital?**
A: MVP ready for pilot testing. For 100+ daily patients, follow [Deployment Guide](./07_DEPLOYMENT_GUIDE.md) for scaling recommendations.

---

**Happy Coding! 🌊 Welcome to CareFlo!**
