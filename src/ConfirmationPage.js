import React, { useEffect, useState } from "react";
import { getTranslation } from "./translations";

export default function ConfirmationPage({ 
  appointmentData, 
  onBookAnother, 
  language 
}) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Trigger confetti animation
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!appointmentData) return null;

  const { name, hospital, department, date, time, referenceNumber } = appointmentData;

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Confetti Effect */}
        {showConfetti && <Confetti />}

        {/* Success Message */}
        <div style={styles.header}>
          <div style={styles.celebration}>🎉</div>
          <h2 style={styles.title}>
            {getTranslation(language, "appointmentConfirmed")}
          </h2>
        </div>

        {/* Appointment Details */}
        <div style={styles.details}>
          <h3>{getTranslation(language, "appointmentDetails")}</h3>
          <div style={styles.detailRow}>
            <span>{getTranslation(language, "patientName")}:</span>
            <strong>{name}</strong>
          </div>
          <div style={styles.detailRow}>
            <span>{getTranslation(language, "selectHospital")}:</span>
            <strong>{hospital}</strong>
          </div>
          <div style={styles.detailRow}>
            <span>{getTranslation(language, "selectDepartment")}:</span>
            <strong>{department}</strong>
          </div>
          <div style={styles.detailRow}>
            <span>{getTranslation(language, "selectDate")}:</span>
            <strong>{date}</strong>
          </div>
          <div style={styles.detailRow}>
            <span>⏰ {getTranslation(language, "availableTimeSlots")}:</span>
            <strong>{time}</strong>
          </div>
          <div style={{ ...styles.detailRow, borderTop: "2px solid #eee", paddingTop: 12, marginTop: 12 }}>
            <span>{getTranslation(language, "referenceNumber")}</span>
            <strong style={styles.referenceNumber}>{referenceNumber}</strong>
          </div>
        </div>

        {/* Check-in Instructions */}
        <div style={styles.instructions}>
          <h4>{getTranslation(language, "checkIn")}</h4>
          <ul>
            <li>{getTranslation(language, "pleaseArriveEarly")}</li>
            <li>{getTranslation(language, "showQRAtDesk")}</li>
          </ul>
          <div style={styles.qrPlaceholder}>
            📱 QR Code: {referenceNumber}
          </div>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.buttonPrimary} onClick={onBookAnother}>
            {getTranslation(language, "bookAnother")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Confetti() {
  const confetti = Array.from({ length: 30 }).map((_, i) => (
    <div key={i} style={getConfettiStyle(i)} />
  ));

  return <div style={styles.confettiContainer}>{confetti}</div>;
}

function getConfettiStyle(index) {
  const leftPos = Math.random() * 100;
  const delay = Math.random() * 0.5;
  const duration = 2 + Math.random() * 1;

  return {
    position: "fixed",
    left: `${leftPos}%`,
    top: "-10px",
    width: "10px",
    height: "10px",
    backgroundColor: ["#ff6b6b", "#4ecdc4", "#ffe66d", "#95e1d3"][
      index % 4
    ],
    borderRadius: "50%",
    animation: `fall ${duration}s linear ${delay}s forwards`,
    pointerEvents: "none",
    zIndex: 10000,
  };
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  container: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "30px",
    maxWidth: "500px",
    width: "90%",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    animation: "slideUp 0.5s ease-out",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
  },
  celebration: {
    fontSize: "48px",
    marginBottom: "10px",
  },
  title: {
    color: "#27ae60",
    margin: 0,
    fontSize: "24px",
  },
  details: {
    backgroundColor: "#f9f9f9",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    fontSize: "14px",
  },
  referenceNumber: {
    fontSize: "16px",
    color: "#e74c3c",
    fontFamily: "monospace",
    letterSpacing: "2px",
  },
  instructions: {
    backgroundColor: "#e8f5e9",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    borderLeft: "4px solid #27ae60",
  },
  qrPlaceholder: {
    textAlign: "center",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "6px",
    marginTop: "10px",
    fontSize: "12px",
    color: "#666",
    border: "2px dashed #27ae60",
  },
  actions: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
  },
  buttonPrimary: {
    padding: "10px 20px",
    background: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  confettiContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 10001,
    pointerEvents: "none",
  },
};

// Add keyframe animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fall {
    to {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(styleSheet);
