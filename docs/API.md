# CareFlo API Documentation

This document outlines the RESTful API endpoints available in the CareFlo Hospital Queue Management System.

## Base URL

All endpoints are relative to: `http://localhost:5000` (or the configured backend host).

## Headers

Most endpoints require authentication.
- **Authorization**: `Bearer <token>`

## Authentication

### Login
**POST** `/auth/login`

Returns a JWT-like token for session management.

**Request:**
```json
{
  "username": "patient_username",
  "password": "password"
}
```

**Response (Success):**
```json
{
  "token": "34234-234234-234234",
  "role": "patient",
  "username": "patient_username"
}
```

### Register (Patient)
**POST** `/auth/register`

Creates a new patient account.

**Request:**
```json
{
  "username": "newuser",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "token": "...",
  "role": "patient",
  "username": "newuser"
}
```

### Logout
**POST** `/auth/logout`
*Requires Token*

Invalidates the current session token.

---

## Appointments & Queue

### Book Appointment
**POST** `/book`
*Requires Token (Patient)*

**Request:**
```json
{
  "name": "Patient Name",
  "hospital": "City Hospital",
  "department": "Cardiology",
  "shift": "morning",
  "date": "2023-10-27",
  "slot": "10:00 AM",
  "reference": "optional-ref-id"
}
```

### Get Queue Status
**GET** `/queues`
*Requires Token*

Query Parameters:
- `date` (optional): Filter queues by date (YYYY-MM-DD).

**Response:**
```json
{
  "City Hospital": {
    "2023-10-27": {
      "Cardiology": {
        "morning": 5,
        "afternoon": 2
      }
    }
  }
}
```

### My Bookings
**GET** `/my-bookings`
*Requires Token (Patient)*

Returns all appointments for the logged-in patient.

---

## Doctor Interfaces

### Get Patients List
**GET** `/patients`
*Requires Token (Doctor)*

Query Parameters:
- `date`: Filter by date.
- `hospital`: Filter by hospital.
- `department`: Filter by department (defaults to doctor's assigned department).

### Mark Patient Done
**POST** `/patient-done`
*Requires Token (Doctor)*

Removes a patient from the active queue and marks them as visited.

**Request:**
```json
{
  "hospital": "City Hospital",
  "date": "2023-10-27",
  "department": "Cardiology",
  "patient_id": "uuid-string"
}
```

---

## Prescriptions

### Add Prescription
**POST** `/prescriptions`
*Requires Token (Doctor)*

**Request:**
```json
{
  "patient_username": "target_patient",
  "text": "Take 2 pills daily...",
  "reference": "booking-ref-id",
  "hospital": "City Hospital",
  "department": "Cardiology",
  "slot": "10:00 AM"
}
```

### Get Prescriptions
**GET** `/prescriptions`
*Requires Token*

- **Patients**: Returns their own prescriptions.
- **Doctors**: Requires `patient_username` query parameter.

---

## System

### Health Check
**GET** `/health`

Returns `{"status": "ok"}`.

### Reset System (Admin)
**POST** `/reset`
*Requires Token (Admin)*

Clears all active queues and appointments.
