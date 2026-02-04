# Features

CareFlo is a comprehensive Hospital Queue Management System designed to streamline appointment booking and patient flow. Below is a detailed list of features available in the project.

## Core Features

- **Authentication System**: Secure Login and Registration functionality using JWT tokens.
- **Role-Based Access Control (RBAC)**: Distinct interfaces and capabilities for different user roles:
  - **Admin**: System management.
  - **Doctor**: Patient and queue management.
  - **Patient**: Appointment booking and personal history.
- **Multi-Language Support**: The application is localized in:
  - English (en)
  - Hindi (hi)
  - Telugu (te)
- **Responsive UI**: A modern, responsive user interface built with React.

## Patient Features

- **Appointment Booking**:
  - Select Hospital and Department.
  - Choose Date and Time Slot (Morning/Afternoon shifts).
  - Receive a unique Reference Number upon confirmation.
- **Dashboard**:
  - View real-time queue status for specific hospitals and departments.
  - "My Appointments" section to track upcoming visits.
- **Prescriptions**:
  - View prescriptions added by doctors for completed appointments.
- **Profile Management**:
  - Integrated view for bookings and medical history.

## Doctor Features

- **Queue Management**:
  - View the list of patients currently in the queue (Waiting/In-Progress).
  - Filter patients by Hospital and Date.
- **Patient Interaction**:
  - **Mark as Done**: Complete a patient's visit to remove them from the active queue.
  - **Add Prescription**: Digital prescription entry linked to the patient's appointment.
- **Department Specific View**: Doctors default to their assigned department (e.g., Cardiology).

## Admin Features

- **Queue Reset**: Ability to clear all queues and reset the system state (useful for daily resets).

## Technical Capabilities

- **Backend API (Flask)**:
  - RESTful endpoints for bookings, auth, and queue management.
  - Health check endpoint (`/health`).
- **Data Persistence**:
  - JSON-based local storage for Users, Prescriptions, and Queue data.
  - In-memory data structures for high-performance queue operations.
- **Security**:
  - Password hashing.
  - Token-based authentication (Bearer token).
  - CORS (Cross-Origin Resource Sharing) enabled.
