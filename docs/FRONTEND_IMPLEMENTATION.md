# CareFlo - Frontend Implementation Guide

This document provides a comprehensive overview of the frontend architecture, components, and implementation details for the CareFlo Hospital Queue Management System.

## 🏗️ Architecture Overview

The frontend is a **Single Page Application (SPA)** built with **React.js**. It communicates with a Flask backend via a REST API. The application uses a role-based architecture where the UI adapts dynamically based on whether the logged-in user is an **Admin**, **Doctor**, or **Patient**.

### Technology Stack

*   **Framework**: React.js (v18+)
*   **Styling**: Vanilla CSS with CSS Variables for theming
*   **State Management**: React `useState` & `useEffect` (Local State)
*   **Authentication**: JWT (JSON Web Tokens) stored in LocalStorage
*   **Validation**: Custom form validation
*   **Internationalization**: Custom translation helper (English, Hindi, Telugu)

---

## 📂 Project Structure

```
src/
├── App.js                 # Main entry point & routing logic
├── App.css                # Global styles and CSS variables
├── AuthService.js         # Authentication logic (Login/Register/Logout)
├── constants.js           # Configuration constants (Hospitals, Departments)
├── translations.js        # Multi-language translation dictionaries
├── components/            
│   ├── AppointmentForm.js # Patient booking form
│   ├── ConfirmationPage.js# Booking success view
│   ├── DoctorView.js      # Doctor's dashboard for queue management
│   ├── Login.js           # User authentication form
│   ├── PatientProfile.js  # Patient history and prescriptions
│   ├── ResetButton.js     # Debug tool for resetting queues
└── ...
```

---

## 🧩 Core Components

### 1. `App.js` (The Controller)
*   **Responsibility**: Acts as the central hub for the application.
*   **Logic**:
    *   Checks authentication status on load.
    *   Renders the `Login` screen if unauthenticated.
    *   Renders the specific view based on User Role (`DoctorView` vs. Patient View).
    *   Manages global state like `language`, `selectedHospital`, and `selectedDate`.
    *   Handles top-level navigation (Logout, Language Switcher).

### 2. `DoctorView.js` (Provider Dashboard)
*   **Features**:
    *   **Real-time Polling**: Fetches patient lists every 5 seconds to ensure the queue is up-to-date.
    *   **Filtering**: Allows doctors to filter the queue by **Hospital** and **Department**.
    *   **Queue Management**: Splits patients into **Morning** and **Afternoon** slots.
    *   **Patient Actions**:
        *   **Mark as Done**: Removes the patient from the physical queue.
        *   **Add Rx**: Opens a text area to write and save a digital prescription.
    *   **Notifications**: Visual alerts when a new appointment is booked in real-time.

### 3. `AppointmentForm.js` (Patient Booking)
*   **Features**:
    *   Dynamic dropdowns for Hospital and Department selection.
    *   Date picker with slot availability checks.
    *   Validates user input before submission.
    *   Triggers a "booked" event that the Doctor Dashboard listens to.

### 4. `PatientProfile.js` (Patient History)
*   **Features**:
    *   Displays a list of past prescriptions.
    *   Allows patients to view their medical history digitalized.

---

## 🎨 Styling & Theming (`App.css`)

The application uses a **modern, accessible design system** defined in `App.css` using CSS Variables (`:root`).

### Color Palette
*   **Primary**: Gradients of Violet/Purple (`#667eea` -> `#764ba2`)
*   **Status Colors**:
    *   ✅ Success: Emerald Green (`#10b981`)
    *   ⚠️ Warning: Amber (`#f59e0b`)
    *   ❌ Error: Red (`#ef4444`)
*   **Backgrounds**: Light clean grays for reduced eye strain.

### Design Principles
*   **Glassmorphism**: Subtle shadows and transparency effects on cards.
*   **Responsive**: Media queries ensure the layout works on Mobile (<768px) and Desktop.
*   **Animations**: custom `@keyframes` for `fadeIn` and `slideIn` entrance animations.

---

## 🔐 Authentication Flow

1.  **Login**: User credentials sent to `/auth/login`.
2.  **Token Storage**: JWT received and stored in `localStorage` under key `auth`.
3.  **Session Persistence**: On refresh, `AuthService.getAuth()` retrieves the token to keep the user logged in.
4.  **Route Protection**: API calls use `AuthService.authFetch()` which automatically appends `Authorization: Bearer <token>` headers.
5.  **Logout**: Clears `localStorage` and resets React state.

---

## 🌐 Internationalization (i18n)

The app supports **English**, **Hindi**, and **Telugu**.
*   **Implementation**: A `translations.js` file maps keys to strings in each language.
*   **Usage**: Components receive a `language` prop and fetch the correct string dynamically (e.g., `translations[lang].welcome`).

---

## 🔌 API Integration

The frontend communicates with the backend endpoints:
*   `GET /patients`: Fetch current queue.
*   `POST /book`: Book a new appointment.
*   `POST /patient-done`: precise patient completion.
*   `POST /prescriptions`: Save/Update prescriptions.
*   `GET /prescriptions`: Retrieve patient history.

---

## 🛠 Future Improvements (Frontend)

*   [ ] Implement React Context or Redux for global state management to avoid prop drilling.
*   [ ] Add a dark mode toggle using CSS variable inversion.
*   [ ] Improve accessibility (ARIA attributes) for screen readers.
