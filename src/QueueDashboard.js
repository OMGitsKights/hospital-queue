import { useState } from "react";
import { DEPARTMENTS } from "./constants";

export default function QueueDashboard({ hospital }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const bookings =
    JSON.parse(localStorage.getItem("bookings")) || [];

  if (!hospital) {
    return (
      <div>
        <h2>📊 Live Queue Dashboard</h2>
        <p>No hospital selected</p>
      </div>
    );
  }

  const getCount = (department, shift) =>
    bookings.filter(
      (b) =>
        b.hospital === hospital &&
        b.department === department &&
        b.shift === shift
    ).length;

  const getColor = (count) => {
    if (count <= 2) return "green";
    if (count <= 4) return "orange";
    return "red";
  };

  const handleReset = () => {
    const confirmReset = window.confirm(
      "⚠️ Are you sure you want to reset all queues?\n\nThis action cannot be undone."
    );

    if (!confirmReset) return;

    localStorage.removeItem("bookings");
    setRefreshKey((k) => k + 1);
  };

  return (
    <div key={refreshKey}>
      <h2>📊 Live Queue Dashboard</h2>
      <h3>{hospital}</h3>

      {DEPARTMENTS.map((dept) => {
        const morning = getCount(dept, "Morning");
        const afternoon = getCount(dept, "Afternoon");

        if (morning === 0 && afternoon === 0) return null;

        return (
          <div key={dept} style={{ marginBottom: "14px" }}>
            <strong>{dept}</strong>
            <div style={{ color: getColor(morning) }}>
              🌅 Morning: {morning} patients
            </div>
            <div style={{ color: getColor(afternoon) }}>
              🌇 Afternoon: {afternoon} patients
            </div>
          </div>
        );
      })}

      <hr />

      <button
        onClick={handleReset}
        style={{
          backgroundColor: "#d9534f",
          color: "white",
          padding: "6px 12px",
          border: "none",
          cursor: "pointer",
        }}
      >
        🔄 Reset Queue
      </button>
    </div>
  );
}
