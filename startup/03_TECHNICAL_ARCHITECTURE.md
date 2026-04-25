# 🏗️ CareFlo - Technical Architecture

## **System Design & Implementation Details**

---

## 📐 Architecture Overview

CareFlo follows a **client-server architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                     USER BROWSER                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │         React Frontend (Port 3000)                │  │
│  │  - Components (App, Login, DoctorView, etc.)     │  │
│  │  - State Management (useState hooks)             │  │
│  │  - Styling (CSS, inline styles)                  │  │
│  └───────────────┬───────────────────────────────────┘  │
└────────────────── │ ─────────────────────────────────────┘
                   │
                   │ HTTP/REST API
                   │ (CORS enabled)
                   │
┌───────────────── │ ─────────────────────────────────────┐
│  ┌───────────────▼───────────────────────────────────┐  │
│  │      Flask Backend (Port 5001)                    │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  API Endpoints (/book, /login, /patients)  │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Authentication (JWT token-based)           │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Business Logic (Triage, Queue Management) │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────┬───────────────────────────────────┘  │
│                  │                                       │
│  ┌───────────────▼───────────────────────────────────┐  │
│  │           Data Storage Layer                      │  │
│  │  ┌──────────────┐  ┌───────────────────────────┐  │  │
│  │  │ JSON Files   │  │ In-Memory Dictionaries    │  │  │
│  │  │ - users.json │  │ - patients_queue          │  │  │
│  │  │ - presc.json │  │ - queues                  │  │  │
│  │  │              │  │ - TOKENS                  │  │  │
│  │  └──────────────┘  └───────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│                  SERVER (Python Process)                │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Frontend Architecture

### **Framework: React 19.2.3**

**Component Hierarchy:**
```
App.js (Root)
├── Login.js (Authentication)
├── AppointmentForm.js (Patient Booking)
│   ├── HospitalStatusBox.js (Queue status widget)
│   └── SymptomChecker.js (Triage modal)
├── ConfirmationPage.js (Booking success)
├── DoctorView.js (Doctor dashboard)
├── PatientProfile.js (Prescription vault)
└── ResetButton.js (Admin controls)
```

### **State Management**

**Primary State (in App.js):**
```javascript
const [authState, setAuthState] = useState({
  authenticated: false,
  role: null,        // 'patient', 'doctor', or 'admin'
  username: null
});

const [language, setLanguage] = useState("en"); // "en", "hi", "te"
const [confirmationData, setConfirmationData] = useState(null);
const [selectedHospital, setSelectedHospital] = useState("");
const [selectedDate, setSelectedDate] = useState("");
```

**Component-Level State Examples:**
- `AppointmentForm.js`: Form fields (hospital, department, date, shift, slot, symptoms)
- `DoctorView.js`: Patient lists, filters (hospital, date)
- `SymptomChecker.js`: Symptom input, triage result

### **Styling Approach**

**Primary:** Inline styles with JavaScript objects
```javascript
style={{
  padding: "20px",
  background: "#667eea",
  borderRadius: "8px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
}}
```

**Secondary:** External CSS files
- `App.css` → Global styles, animations
- `SymptomChecker.css` → Modal-specific styles

**Design System:**
- **Primary Color:** `#667eea` (Purple-blue)
- **Success Green:** `#27ae60`
- **Warning Orange:** `#f39c12`
- **Danger Red:** `#e74c3c`
- **Font:** System default (Arial, sans-serif)

---

## ⚙️ Backend Architecture

### **Framework: Flask (Python)**

**File Structure:**
```
backend/
├── app.py               # Main application file
├── users.json           # Persistent user storage
├── prescriptions.json   # Prescription records
└── backend.log          # Server logs
```

### **API Endpoints (RESTful)**

| Endpoint | Method | Auth Required | Role | Purpose |
|----------|--------|---------------|------|---------|
| `/health` | GET | ❌ No | Any | Health check |
| `/auth/login` | POST | ❌ No | Any | User login |
| `/auth/register` | POST | ❌ No | Any | Patient registration |
| `/auth/logout` | POST | ✅ Yes | Any | Logout (token invalidation) |
| `/book` | POST | ✅ Yes | Patient | Book appointment |
| `/queues` | GET | ✅ Yes | Any | Get queue counts |
| `/patients` | GET | ✅ Yes | Doctor | Get patient list for department |
| `/my-bookings` | GET | ✅ Yes | Patient | Get patient's own bookings |
| `/prescriptions` | POST | ✅ Yes | Doctor | Add prescription |
| `/prescriptions` | GET | ✅ Yes | Patient/Doctor | Get prescriptions |
| `/patient-done` | POST | ✅ Yes | Doctor | Mark patient checkup complete |
| `/hospital-busyness` | GET | ✅ Yes | Any | Get hospital queue status |
| `/reset` | POST | ✅ Yes | Admin | Reset all queues |

### **Authentication System**

**Flow Diagram:**
```
1. User submits credentials
   ↓
2. Backend validates against users.json
   ↓
3. Password checked with werkzeug.check_password_hash()
   ↓
4. Generate UUID token: uuid.uuid4().hex
   ↓
5. Store in TOKENS dict: {token: {username, role, department}}
   ↓
6. Return token to frontend
   ↓
7. Frontend stores in localStorage
   ↓
8. All future requests include: Authorization: Bearer <token>
```

**Decorator-Based Authorization:**
```python
@app.route("/book", methods=["POST"])
@token_required            # Validates token exists
@role_required(["patient"])  # Ensures user is a patient
def book():
    # Only authenticated patients can execute this
```

---

## 🗄️ Data Models

### **1. User Model**
```json
{
  "username": {
    "password": "<bcrypt_hash>",
    "role": "patient|doctor|admin",
    "name": "Full Name",
    "department": "Cardiology"  // Only for doctors
  }
}
```

**Storage:** `backend/users.json`

**Example:**
```json
{
  "doctor": {
    "password": "pbkdf2:sha256:600000$...",
    "role": "doctor",
    "department": "Cardiology"
  },
  "patient123": {
    "password": "pbkdf2:sha256:600000$...",
    "role": "patient",
    "name": "Arjun Sundar"
  }
}
```

---

### **2. Patient Queue Model**

**In-Memory Structure:**
```python
patients_queue = {
  "Apollo Hospital": {
    "2026-02-10": {
      "Cardiology": [
        {
          "id": "8a3f9d42-...",
          "name": "Arjun Sundar",
          "shift": "morning",
          "slot": "10:00 AM",
          "status": "waiting",  # waiting|in-progress|done
          "patient_username": "patient123",
          "symptoms": "routine checkup",
          "is_emergency": false
        }
      ]
    }
  }
}
```

**Indexing Strategy:**
- Primary Key: Hospital → Date → Department → Array of patients
- Patient Lookup: O(n) within department (acceptable for small queues)
- Emergency Sorting: Applied at query time

---

### **3. Prescription Model**

**Storage:** `backend/prescriptions.json`

```json
{
  "patient123": [
    {
      "id": "f7e8d9c6-...",
      "medications": [
        {
          "tablet": "Aspirin",
          "dosage": "1-0-1",
          "days": "7"
        }
      ],
      "reference": "REF-8a3f9d42",
      "hospital": "Apollo Hospital",
      "department": "Cardiology",
      "slot": "10:00 AM",
      "doctor": "doctor"
    }
  ]
}
```

**Design Decision:** Nested under patient username for fast lookup.

---

## 🔐 Security Implementation

### **1. Password Security**
```python
from werkzeug.security import generate_password_hash, check_password_hash

# Registration
hashed = generate_password_hash("mypassword")  # PBKDF2-SHA256

# Login
is_valid = check_password_hash(stored_hash, input_password)
```

**Algorithm:** PBKDF2-SHA256 with 600,000 iterations (werkzeug default)

### **2. Token Management**
```python
# Token generation
token = uuid.uuid4().hex  # Example: "8a3f9d4271b2..."

# Token storage (in-memory, ephemeral)
TOKENS[token] = {"username": "patient123", "role": "patient"}

# Token validation
@token_required
def protected_route():
    user = request.user  # Injected by decorator
```

**Limitations (for production):**
- Tokens stored in-memory → Lost on server restart
- No expiry mechanism → Tokens valid forever (until logout)

**Production Recommendations:**
- Use Redis for token storage
- Implement JWT with expiry (e.g., 24 hours)
- Add refresh token mechanism

### **3. CORS (Cross-Origin Resource Sharing)**
```python
from flask_cors import CORS
CORS(app)  # Allow all origins (development only)
```

**Production Fix:** Restrict to specific frontend domain
```python
CORS(app, origins=["https://careflo.io"])
```

---

## 🧠 AI Triage Logic

### **Emergency Detection Algorithm**

**Keyword-Based Triage:**
```python
EMERGENCY_KEYWORDS = [
    "chest pain", "breathlessness", "unconscious", 
    "heavy bleeding", "severe injury", "stroke", 
    "seizure", "poisoning", "heart attack",
    "cannot breathe", "choking", "collision", 
    "burns", "fracture"
]

def triage_patient(symptoms):
    if not symptoms:
        return False
    symptoms_lower = symptoms.lower()
    return any(keyword in symptoms_lower for keyword in EMERGENCY_KEYWORDS)
```

**Example:**
```python
triage_patient("severe chest pain")  # → True (emergency)
triage_patient("routine checkup")    # → False (normal)
```

**Impact on Queue:**
- Emergency patients: `is_emergency: true`
- Sorted to top in doctor dashboard
- Visual highlight (red border)

**Future Enhancements:**
- Machine learning model (train on symptom-diagnosis datasets)
- Severity scoring (1-10 scale instead of binary)
- Integration with triage protocols (CTAS, ESI)

---

## 🌍 Internationalization (i18n)

### **Translation System**

**File:** `src/translations.js`

```javascript
const translations = {
  en: {
    bookAppointment: "Book Appointment",
    selectHospital: "Select Hospital"
  },
  hi: {
    bookAppointment: "अपॉइंटमेंट बुक करें",
    selectHospital: "अस्पताल चुनें"
  },
  te: {
    bookAppointment: "అపాయింట్‌మెంట్ బుక్ చేయండి",
    selectHospital: "ఆసుపత్రిని ఎంచుకోండి"
  }
};

export function getTranslation(key, lang) {
  return translations[lang]?.[key] || translations.en[key];
}
```

**Usage in Components:**
```javascript
import { getTranslation } from "./translations";

<button>{getTranslation("bookAppointment", language)}</button>
```

**Supported Languages:**
- 🇬🇧 English (en)
- 🇮🇳 Hindi (hi)
- 🇮🇳 Telugu (te)

**Coverage:** 100+ UI strings translated

---

## 📊 Performance Considerations

### **Frontend Optimization**

**1. State Lifting:**
- Shared state (language, auth) lifted to `App.js`
- Passed as props to child components
- Avoids redundant API calls

**2. Conditional Rendering:**
```javascript
{authState.role === "doctor" ? (
  <DoctorView />
) : (
  <AppointmentForm />
)}
```
- Only renders active view
- Reduces DOM size

**3. Debouncing (Future):**
- Symptom checker input debouncing (300ms)
- Reduces real-time triage API calls

### **Backend Optimization**

**1. In-Memory Queue:**
- O(1) access for hospital/date/department lookup
- Trade-off: Data lost on restart (acceptable for MVP)

**2. JSON File Caching:**
- Users and prescriptions loaded once at startup
- Only written on updates (registration, prescription creation)

**3. Indexing Strategy:**
```python
# Efficient patient lookup by department
patients_queue[hospital][date][department]  # O(1)

# Emergency sorting at query time
result["morning"].sort(key=lambda x: x.get("is_emergency"), reverse=True)
```

---

## 🚀 Deployment Architecture

### **Current (Development):**
```
Frontend: npm start → localhost:3000 (React dev server)
Backend: python app.py → localhost:5001 (Flask debug mode)
```

### **Production Recommendation:**

**Option 1: Traditional VM Deployment**
```
┌────────────────────────────────────────┐
│         Nginx (Reverse Proxy)          │
│  - HTTPS termination (SSL/TLS)        │
│  - Serves static React build          │
│  - Proxies /api/* to Flask            │
└────────────────┬───────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼──────┐          ┌───────▼────────┐
│  React   │          │   Flask        │
│  (Static)│          │   (Gunicorn)   │
│  Port 80 │          │   Port 5001    │
└──────────┘          └────────┬───────┘
                               │
                      ┌────────▼────────┐
                      │   PostgreSQL    │
                      │   (Production)  │
                      └─────────────────┘
```

**Commands:**
```bash
# Frontend build
npm run build
# Serve with nginx

# Backend production server
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

**Option 2: Docker Containerization**
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npx", "serve", "-s", "build", "-l", "3000"]

# Backend Dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5001", "app:app"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  frontend:
    build: ./
    ports:
      - "3000:3000"
  
  backend:
    build: ./backend
    ports:
      - "5001:5001"
    volumes:
      - ./backend/data:/app/data
```

---

## 🔧 Development Workflow

### **Setup Instructions**

**1. Backend:**
```bash
cd backend
pip install flask flask-cors werkzeug
python app.py
```

**2. Frontend:**
```bash
npm install
npm start
```

**3. Access:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001`
- Health Check: `http://localhost:5001/health`

### **Testing Strategy**

**Manual Testing:**
1. Register new patient
2. Book appointment with emergency symptoms
3. Login as doctor → Verify emergency highlight
4. Mark patient done
5. Login as patient → Verify prescription appears

**Future Automated Tests:**
- Jest (React components)
- Pytest (Flask endpoints)
- Selenium (E2E user flows)

---

## 📈 Scalability Roadmap

### **Current Limitations:**
1. **In-memory queue** → Lost on restart
2. **JSON files** → Slow for 1000+ users
3. **No caching** → Redundant DB reads
4. **Single-threaded Flask** → Bottleneck at high concurrency

### **Phase 1: Database Migration**
```
JSON Files → PostgreSQL
- users table (id, username, password_hash, role, department)
- patients table (id, queue_id, symptoms, is_emergency)
- prescriptions table (id, patient_id, medications, doctor_id)
```

### **Phase 2: Caching Layer**
```
Redis:
- Token storage (SETEX with TTL)
- Queue counts (HINCRBY for atomic increments)
- Hospital busyness cache (5-minute TTL)
```

### **Phase 3: Horizontal Scaling**
```
Load Balancer (AWS ELB)
├── Flask Instance 1 (Auto-scaling group)
├── Flask Instance 2
└── Flask Instance N

Shared State:
- PostgreSQL (RDS)
- Redis (ElastiCache)
```

---

## 🛡️ Error Handling

### **Frontend Error Handling:**
```javascript
try {
  const response = await fetch("/book", {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error("Booking failed");
  }
  
  const result = await response.json();
  // Success handling
} catch (error) {
  alert("Error: " + error.message);
}
```

### **Backend Error Handling:**
```python
try:
    patients = patients_queue[hospital][date][department]
except KeyError:
    return jsonify({"error": "Invalid hospital/date/department"}), 400
```

---

## 📚 Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 19.2.3 | UI components |
| | JavaScript | ES6+ | Logic |
| | CSS | 3 | Styling |
| **Backend** | Python | 3.8+ | Server logic |
| | Flask | 2.x | Web framework |
| | Flask-CORS | Latest | CORS handling |
| | Werkzeug | Latest | Password hashing |
| **Data** | JSON | - | File storage |
| | Python Dict | - | In-memory queue |
| **Dev Tools** | npm | 8+ | Package management |
| | pip | Latest | Python packages |

---

## 🎯 Next Steps (Technical Enhancements)

1. **WebSocket Integration** → Real-time queue updates (no polling)
2. **JWT with Expiry** → More secure token management
3. **PostgreSQL Migration** → Production-grade persistence
4. **Unit Test Coverage** → 80%+ code coverage
5. **CI/CD Pipeline** → GitHub Actions for automated deployment
6. **Monitoring** → Sentry for error tracking, Datadog for metrics
7. **API Rate Limiting** → Prevent abuse
8. **Database Backups** → Automated daily backups

---

**For detailed API documentation, see:** [API.md](../docs/API.md)
**For database schema, see:** [DATABASE.md](../docs/DATABASE.md)
