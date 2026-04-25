import { useState, useEffect } from "react";
import * as AuthService from "./AuthService";
import { HOSPITALS } from "./constants";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";

export default function HospitalStatusBox() {
  const [hospitals, setHospitals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchHospitalStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/hospital-busyness`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch hospital status");
      }

      const data = await response.json();
      setHospitals(data);
      setError("");
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message);
      console.error("Error fetching hospital status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalStatus();
    
    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(fetchHospitalStatus, 5000);
    
    // Listen for booking events from localStorage
    const handleStorageChange = () => {
      console.log("Booking detected, refreshing hospital status");
      fetchHospitalStatus();
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        right: "20px",
        top: "100px",
        width: "280px",
        background: "white",
        border: "2px solid #34495e",
        borderRadius: "8px",
        padding: "16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        fontFamily: "Arial, sans-serif",
        maxHeight: "600px",
        overflowY: "auto",
        zIndex: 1000,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h3 style={{ margin: 0, color: "#34495e" }}>
          🏥 Hospital Status
        </h3>
        <button
          onClick={fetchHospitalStatus}
          style={{
            background: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "4px 8px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold",
          }}
          title="Refresh status"
        >
          ↻
        </button>
      </div>

      {lastUpdated && (
        <p style={{ fontSize: "10px", color: "#95a5a6", margin: "0 0 8px 0" }}>
          Updated: {lastUpdated}
        </p>
      )}

      {loading && <p style={{ color: "#7f8c8d" }}>Loading...</p>}
      {error && <p style={{ color: "#e74c3c" }}>Error: {error}</p>}

      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {HOSPITALS.map((hospital) => {
            const info = hospitals[hospital];
            if (!info) return null;
            
            return (
              <div
                key={hospital}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px",
                  background: "#ecf0f1",
                  borderRadius: "6px",
                  borderLeft: `4px solid ${info.color}`,
                }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: info.color,
                    flexShrink: 0,
                    animation: info.status === "busy" ? "pulse 1.5s infinite" : "none",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: "#2c3e50",
                    }}
                  >
                    {hospital}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#7f8c8d" }}>
                    {info.status === "available" && "✓ Available"}
                    {info.status === "moderate" && "⏱ Moderate Wait"}
                    {info.status === "busy" && "✕ Busy"}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "11px",
                      color: "#95a5a6",
                    }}
                  >
                    Queue: {info.queue_count} | {info.estimated_wait}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && Object.keys(hospitals).length === 0 && (
        <p style={{ color: "#7f8c8d", fontSize: "12px" }}>
          No hospitals available
        </p>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
