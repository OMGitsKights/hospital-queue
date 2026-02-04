import React from "react";
import { getTranslation } from "./translations";
import * as AuthService from "./AuthService";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";

export default function ResetButton({ setSelectedHospital, setResetToken, setBookingSignal, language }) {
  const role = AuthService.getRole();
  if (role !== "admin") return null; // only admins see reset
  const resetBtnStyle = {
    position: "fixed",
    right: "20px",
    bottom: "20px",
    zIndex: 9999,
    padding: "8px 12px",
    background: "#ff6b6b",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  };

  const handleReset = async () => {
    const confirmReset = window.confirm(getTranslation(language, "confirmReset"));
    if (!confirmReset) return;

    try {
      const res = await AuthService.authFetch(`${BACKEND_URL}/reset`, { method: "POST" });
      if (res.status === 401) {
        alert(getTranslation(language, "unauthorized"));
        return;
      }
      if (!res.ok) throw new Error("Reset failed");
      localStorage.removeItem("bookings");
      if (typeof setSelectedHospital === "function") setSelectedHospital("");
      if (typeof setResetToken === "function") setResetToken((t) => t + 1);
      if (typeof setBookingSignal === "function") setBookingSignal((s) => s + 1);
      alert(getTranslation(language, "queueResetSuccess"));
    } catch (err) {
      alert("Backend not running. Please start backend server.");
    }
  };

  return (
    <button style={resetBtnStyle} onClick={handleReset}>
      {getTranslation(language, "resetQueue")}
    </button>
  );
}
