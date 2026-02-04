# CareFlo - Hospital Queue Management System

**CareFlo** is a streamlined solution for managing hospital appointments, reducing waiting times, and improving the overall patient experience through a digital queue system.

![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/frontend-React-61DAFB)
![Flask](https://img.shields.io/badge/backend-Flask-000000)

## 📋 Features

*   **Role-Based Access**: Specialized portals for Admins, Doctors, and Patients.
*   **Real-time Queue Status**: Visual indicators of waiting lines.
*   **Digital Prescriptions**: Doctors can issue prescriptions directly within the app.
*   **Multi-Language Support**: English, Hindi, and Telugu.
*   **Secure Authentication**: Token-based login system.

See [FEATURES.md](./docs/FEATURES.md) for a complete list.

## 🚀 Quick Start

### Prerequisites
*   Node.js (v14+)
*   Python (v3.8+)

### 1. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
# Install dependencies (Flask, Flask-CORS)
pip install flask flask-cors werkzeug
# Run the server
python app.py
```
The server will start on `http://localhost:5001`.

### 2. Frontend Setup
Navigate to the project root:
```bash
# Install dependencies
npm install
# Start the application
npm start
```
The app will run on `http://localhost:3000`.

## 📚 Documentation

We have detailed documentation to help you understand and contribute to the project:

*   **[Architecture](./docs/ARCHITECTURE.md)**: High-level system design.
*   **[API Documentation](./docs/API.md)**: Specifications for backend endpoints.
*   **[Database Schema](./docs/DATABASE.md)**: Data structure details.
*   **[Development Guide](./docs/DEVELOPMENT.md)**: Setup and coding standards.
*   **[Contributing](./docs/CONTRIBUTING.md)**: How to get involved.
*   **[Roadmap](./docs/ROADMAP.md)**: Future plans and requested features.

## 👥 Roles & Credentials (Default)

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `adminpass` |
| **Doctor** | `doctor` | `doctorpass` |
| **Patient** | `patient` | `patientpass` |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./docs/LICENSE.md) file for details.
