# Database Schema

CareFlo uses flat-file JSON storage for persistence. This document describes the structure of these files.

## 1. Users (`users.json`)

Stores authentication and profile data for all system users.

### Schema
```json
{
  "username_string": {
    "password": "hashed_password_string",
    "role": "admin | doctor | patient",
    "name": "Full Name",
    "department": "Department Name (Doctors only)"
  }
}
```

### Example
```json
{
  "admin": {
    "password": "pbkdf2:sha256:...", 
    "role": "admin"
  },
  "johndoe": {
    "password": "...", 
    "role": "patient",
    "name": "John Doe"
  }
}
```

---

## 2. Prescriptions (`prescriptions.json`)

Stores prescription history linked to patients.

### Schema
```json
{
  "patient_username": [
    {
      "id": "uuid",
      "text": "Prescription content...",
      "reference": "appointment_reference_id",
      "hospital": "Hospital Name",
      "department": "Department Name",
      "doctor": "doctor_username",
      "slot": "Time Slot"
    }
  ]
}
```

---

## 3. Active Queue (In-Memory)

*Note: This data is heavily volatile and currently exists only in RAM.*

### Structure
```python
{
    "Hospital Name": {
        "YYYY-MM-DD": {
            "Department Name": [
                {
                    "id": "uuid",
                    "name": "Patient Name",
                    "shift": "morning | afternoon",
                    "slot": "10:00 AM",
                    "status": "waiting | in-progress | done",
                    "patient_username": "username"
                }
            ]
        }
    }
}
```
