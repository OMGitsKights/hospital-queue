import { useState } from "react";
import AppointmentForm from "./AppointmentForm";
import QueueDashboard from "./QueueDashboard";

export default function App() {
  const [selectedHospital, setSelectedHospital] = useState("");

  return (
    <div style={{ display: "flex", gap: "40px", padding: "20px" }}>
      {/* LEFT PANEL */}
      <div style={{ width: "30%" }}>
        <QueueDashboard hospital={selectedHospital} />
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width: "70%" }}>
        <h1>🏥 Hospital Queue Optimization System</h1>
        <AppointmentForm onHospitalSelect={setSelectedHospital} />
      </div>
    </div>
  );
}
