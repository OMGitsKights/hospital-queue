import { useState } from "react";
import AppointmentForm from "./AppointmentForm";
import ConfirmationPage from "./ConfirmationPage";
import ResetButton from "./ResetButton";
import Login from "./Login";
import DoctorView from "./DoctorView";
import PatientProfile from "./PatientProfile";
import * as AuthService from "./AuthService";
import { getTranslation } from "./translations";

export default function App() {
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [resetToken, setResetToken] = useState(0);
  const [bookingSignal, setBookingSignal] = useState(0);
  const [language, setLanguage] = useState("en");
  const [confirmationData, setConfirmationData] = useState(null);
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [authState, setAuthState] = useState({
    authenticated: AuthService.isAuthenticated(),
    role: AuthService.getRole(),
    username: AuthService.getUsername(),
  });

  const refreshAuth = () => {
    setAuthState({
      authenticated: AuthService.isAuthenticated(),
      role: AuthService.getRole(),
      username: AuthService.getUsername(),
    });
  };

  const handleBookingConfirmed = (appointmentData) => {
    setConfirmationData(appointmentData);
  };

  const handleBookAnother = () => {
    setConfirmationData(null);
  };

  const handleLogout = () => {
    AuthService.logout();
    refreshAuth();
  };

  if (!authState.authenticated) {
    return (
      <div style={{ padding: 20 }}>
        <Login onLogin={refreshAuth} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "40px", padding: "20px", minHeight: "100vh" }}>
      <div style={{ width: "100%" }}>
        {/* Language Selector and Logout */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontWeight: "bold" }}>🌐 Select Language:</span>
          {["en", "hi", "te"].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              style={{
                padding: "6px 12px",
                background: language === lang ? "#27ae60" : "#eee",
                color: language === lang ? "white" : "black",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: language === lang ? "bold" : "normal",
              }}
            >
              {lang === "en" ? "English" : lang === "hi" ? "हिंदी" : "తెలుగు"}
            </button>
          ))}

          <div style={{ marginLeft: "auto" }}>
            <span style={{ marginRight: 12 }}>Signed in: {authState.username} ({authState.role})</span>
            <button onClick={handleLogout} style={{ padding: "6px 10px" }}>
              Logout
            </button>
          </div>
        </div>

        <h1>Welcome to CareFlo!</h1>
        {authState.role === "doctor" ? (
          <DoctorView selectedHospital={selectedHospital} selectedDate={selectedDate} />
        ) : (
          <div>
            {/* Patient Navigation Tabs */}
            <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowPatientProfile(false)}
                style={{
                  padding: "8px 16px",
                  background: !showPatientProfile ? "#667eea" : "#eee",
                  color: !showPatientProfile ? "white" : "black",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: !showPatientProfile ? "bold" : "normal",
                  fontSize: 13,
                }}
              >
                📅 Book Appointment
              </button>
              <button
                onClick={() => setShowPatientProfile(true)}
                style={{
                  padding: "8px 16px",
                  background: showPatientProfile ? "#667eea" : "#eee",
                  color: showPatientProfile ? "white" : "black",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: showPatientProfile ? "bold" : "normal",
                  fontSize: 13,
                }}
              >
                📋 My Prescriptions
              </button>
            </div>

            {showPatientProfile ? (
              <PatientProfile />
            ) : (
              !confirmationData ? (
                <AppointmentForm
                  onHospitalSelect={setSelectedHospital}
                  setSelectedDate={setSelectedDate}
                  resetToken={resetToken}
                  bookingSignal={bookingSignal}
                  onBookingDone={() => setBookingSignal((s) => s + 1)}
                  onBookingConfirmed={handleBookingConfirmed}
                  language={language}
                />
              ) : (
                <ConfirmationPage
                  appointmentData={confirmationData}
                  onBookAnother={handleBookAnother}
                  language={language}
                />
              )
            )}
          </div>
        )}
      </div>

      <div style={{ width: 360 }}>
        {authState.role === "doctor" ? null : null}
      </div>

      <ResetButton
        setSelectedHospital={setSelectedHospital}
        setResetToken={setResetToken}
        setBookingSignal={setBookingSignal}
        language={language}
      />
    </div>
  );
}
