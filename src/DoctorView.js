import { useEffect, useState } from "react";
import * as AuthService from "./AuthService";
import { HOSPITALS, DEPARTMENTS } from "./constants";

// Prescription Table Component
function PrescriptionTable({ medications, onUpdate }) {
  const [rows, setRows] = useState(medications && medications.length > 0 ? medications : [{ tablet: "", dosage: "", frequency: "", days: "" }]);

  const handleChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
    onUpdate(newRows);
  };

  const addRow = () => {
    setRows([...rows, { tablet: "", dosage: "", frequency: "", days: "" }]);
  };

  const removeRow = (index) => {
    if (rows.length > 1) {
      const newRows = rows.filter((_, i) => i !== index);
      setRows(newRows);
      onUpdate(newRows);
    }
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 8,
    marginBottom: 8,
    fontSize: 12,
  };

  const headerStyle = {
    background: "#f0fdf4",
    border: "1px solid #10b981",
    padding: 8,
    fontWeight: 600,
    color: "#1a202c",
    textAlign: "left",
  };

  const cellStyle = {
    border: "1px solid #e2e8f0",
    padding: 8,
  };

  const inputStyle = {
    width: "100%",
    padding: 6,
    border: "1px solid #d0d0d0",
    borderRadius: 4,
    fontFamily: "inherit",
    fontSize: 12,
    boxSizing: "border-box",
  };

  const deleteBtnStyle = {
    padding: "4px 8px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: 3,
    cursor: "pointer",
    fontSize: 11,
  };

  return (
    <div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...headerStyle, width: "5%" }}>S. No.</th>
            <th style={{ ...headerStyle, width: "30%" }}>Tablet(s)</th>
            <th style={{ ...headerStyle, width: "20%" }}>Dosage</th>
            <th style={{ ...headerStyle, width: "25%" }}>Frequency (B-L-D)</th>
            <th style={{ ...headerStyle, width: "15%" }}>No. of Days</th>
            <th style={{ ...headerStyle, width: "5%" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td style={cellStyle}>{index + 1}</td>
              <td style={cellStyle}>
                <input
                  type="text"
                  value={row.tablet}
                  onChange={(e) => handleChange(index, "tablet", e.target.value)}
                  placeholder="e.g., Aspirin"
                  style={inputStyle}
                />
              </td>
              <td style={cellStyle}>
                <input
                  type="text"
                  value={row.dosage}
                  onChange={(e) => handleChange(index, "dosage", e.target.value)}
                  placeholder="e.g., 500mg"
                  style={inputStyle}
                />
              </td>
              <td style={cellStyle}>
                <input
                  type="text"
                  value={row.frequency}
                  onChange={(e) => handleChange(index, "frequency", e.target.value)}
                  placeholder="e.g., 1-1-1"
                  style={inputStyle}
                  title="Format: Breakfast-Lunch-Dinner (e.g., 1-1-1, 1-0-1)"
                />
              </td>
              <td style={cellStyle}>
                <input
                  type="text"
                  value={row.days}
                  onChange={(e) => handleChange(index, "days", e.target.value)}
                  placeholder="e.g., 10"
                  style={inputStyle}
                />
              </td>
              <td style={cellStyle}>
                <button
                  style={deleteBtnStyle}
                  onClick={() => removeRow(index)}
                  disabled={rows.length === 1}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={addRow}
        style={{
          padding: "6px 12px",
          background: "#10b981",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        + Add Medication
      </button>
    </div>
  );
}

export default function DoctorView({ selectedHospital, selectedDate }) {
  const [patients, setPatients] = useState({ morning: [], afternoon: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedHospitalLocal, setSelectedHospitalLocal] = useState("");
  const [selectedDepartmentLocal, setSelectedDepartmentLocal] = useState("General");
  const [notifications, setNotifications] = useState([]);
  const [prescriptions, setPrescriptions] = useState({});
  const [expandedPatient, setExpandedPatient] = useState(null);

  const auth = AuthService.getAuth();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";

  // Use local selections, fallback to auth data
  const hospital = selectedHospitalLocal || auth?.hospital || "";
  const department = selectedDepartmentLocal || auth?.department || "General";

  // Load prescriptions from localStorage on mount
  useEffect(() => {
    const savedPrescriptions = JSON.parse(localStorage.getItem("prescriptions")) || {};
    setPrescriptions(savedPrescriptions);
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      let url = `${BACKEND_URL}/patients`;
      const params = new URLSearchParams();
      if (selectedDate) params.append("date", selectedDate);
      if (hospital) params.append("hospital", hospital);
      if (department) params.append("department", department);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await AuthService.authFetch(url);
      if (!res.ok) {
        if (res.status === 401) {
          setError("Authentication required");
          return;
        }
        throw new Error("Failed to fetch patients");
      }
      const data = await res.json();
      setPatients(data);
      // fetch prescriptions for returned patients (if any)
      try {
        const allPatients = [...(data.morning || []), ...(data.afternoon || [])];
        for (const pat of allPatients) {
          const pUser = pat.patient_username;
          if (pUser) {
            try {
              const presRes = await AuthService.authFetch(`${BACKEND_URL}/prescriptions?patient_username=${encodeURIComponent(pUser)}`);
              if (presRes.ok) {
                const pres = await presRes.json();
                // pick latest prescription if any
                if (Array.isArray(pres) && pres.length > 0) {
                  const latest = pres[pres.length - 1];
                  setPrescriptions((prev) => ({ ...prev, [pUser]: latest }));
                }
              }
            } catch (err) {
              // ignore per-patient prescription fetch errors
            }
          }
        }
      } catch (err) {
        // ignore
      }
      setError("");
    } catch (err) {
      setError("Failed to fetch patients");
      setPatients({ morning: [], afternoon: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    const id = setInterval(fetchPatients, 5000);
    return () => clearInterval(id);
  }, [selectedDate, hospital, department]);

  // Listen for appointment notifications from booking events
  useEffect(() => {
    const handleAppointmentBooked = (event) => {
      const appointmentData = event.detail;
      // Show notification if the appointment is for this doctor's department and hospital
      if (appointmentData.department === department && appointmentData.hospital === hospital) {
        const notificationId = Date.now();
        const message = `Patient ${appointmentData.name} booked appointment for ${appointmentData.department}`;
        setNotifications(prev => [...prev, { id: notificationId, message }]);
        // Auto-remove notification after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notificationId));
        }, 5000);
      }
    };

    window.addEventListener("appointmentBooked", handleAppointmentBooked);
    return () => window.removeEventListener("appointmentBooked", handleAppointmentBooked);
  }, [department, hospital]);

  const handleDone = async (patient) => {
    try {
      // Use hospital and date from patient record (included in response from backend)
      const hospitalToUse = patient.hospital || hospital;
      const dateToUse = patient.date || selectedDate;

      if (!hospitalToUse || !dateToUse) {
        alert("Hospital or date information missing");
        return;
      }

      const res = await AuthService.authFetch(`${BACKEND_URL}/patient-done`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospital: hospitalToUse,
          date: dateToUse,
          department: department,
          patient_id: patient.id,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to mark patient as done");
      }

      await res.json();

      // Remove the booking from localStorage to free up the slot
      const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
      const filtered = bookings.filter(b =>
        !(b.date === dateToUse &&
          b.hospital === hospitalToUse &&
          b.department === department &&
          b.slot === patient.slot &&
          b.name === patient.name)
      );
      localStorage.setItem("bookings", JSON.stringify(filtered));

      fetchPatients(); // Refresh list
    } catch (err) {
      alert("Error marking patient as done: " + err.message);
    }
  };

  const savePrescription = async (patient, medications) => {
    // Prefer patient_username if available
    const patientUsername = patient.patient_username || null;
    const payload = {
      patient_username: patientUsername,
      medications: medications, // Array of {tablet, dosage, days}
      reference: patient.reference || null,
      hospital: patient.hospital || hospital,
      department: department,
      slot: patient.slot || null,
    };

    try {
      const res = await AuthService.authFetch(`${BACKEND_URL}/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to save prescription");
      }
      const data = await res.json();
      // update local cache
      const key = patientUsername || patient.id || `${patient.name}_${patient.slot}`;
      setPrescriptions((prev) => ({ ...prev, [key]: data.prescription }));
    } catch (err) {
      console.error("Save prescription error:", err);
      // fallback to localStorage so work isn't lost
      const key = patient.patient_username || patient.id || `${patient.name}_${patient.slot}`;
      const updatedPrescriptions = { ...prescriptions, [key]: { medications } };
      setPrescriptions(updatedPrescriptions);
      localStorage.setItem("prescriptions", JSON.stringify(updatedPrescriptions));
    }
  };

  const getPrescription = (patient) => {
    const key = patient.patient_username || patient.id || `${patient.name}_${patient.slot}`;
    const val = prescriptions[key];
    if (!val) return [];
    // if val is an object from backend, return its medications array
    if (typeof val === "object" && val.medications) return val.medications || [];
    // fallback for old text format
    return typeof val === "string" ? [] : [];
  };

  const morningCount = patients.morning.length;
  const afternoonCount = patients.afternoon.length;
  const totalCount = morningCount + afternoonCount;

  const containerStyle = {
    padding: 24,
    borderRadius: 12,
    background: "white",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
    maxWidth: 500,
  };

  const patientCardStyle = {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    background: "#f5f7fb",
    border: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  };

  const buttonStyle = {
    padding: "6px 12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    transition: "all 0.2s",
  };

  const statsStyle = {
    display: "flex",
    gap: 16,
    marginBottom: 20,
    flexWrap: "wrap",
  };

  const statBoxStyle = {
    flex: 1,
    minWidth: 100,
    padding: 12,
    borderRadius: 8,
    textAlign: "center",
    background: "linear-gradient(135deg, #f5f7fb 0%, #f0f4f8 100%)",
    border: "1px solid #e2e8f0",
  };

  const selectorStyle = {
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #e2e8f0",
    fontSize: 13,
    fontFamily: "inherit",
    cursor: "pointer",
    background: "white",
  };

  const notificationStyle = {
    position: "fixed",
    top: 20,
    right: 20,
    maxWidth: 400,
    padding: 16,
    borderRadius: 8,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
    animation: "slideIn 0.3s ease-out",
  };

  const emergencyBadgeStyle = {
    padding: "2px 6px",
    background: "#fee2e2",
    color: "#dc2626",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "bold",
    border: "1px solid #fecaca",
    display: "inline-block",
    marginLeft: "8px",
    verticalAlign: "middle"
  };

  return (
    <div style={containerStyle}>
      <h3 style={{ marginBottom: 4 }}>Doctor Dashboard</h3>

      {/* Hospital and Department Selectors */}
      <div style={{ marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 12, color: "#718096", display: "block", marginBottom: 4, fontWeight: 600 }}>
            🏥 Select Hospital
          </label>
          <select
            value={selectedHospitalLocal}
            onChange={(e) => setSelectedHospitalLocal(e.target.value)}
            style={selectorStyle}
          >
            <option value="">-- Select Hospital --</option>
            {HOSPITALS.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 12, color: "#718096", display: "block", marginBottom: 4, fontWeight: 600 }}>
            🩺 Select Department
          </label>
          <select
            value={selectedDepartmentLocal}
            onChange={(e) => setSelectedDepartmentLocal(e.target.value)}
            style={selectorStyle}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {hospital && (
        <div style={{ fontSize: 13, color: "#718096", marginBottom: 16 }}>
          Selected: <strong>{hospital}</strong> • <strong>{department}</strong>
        </div>
      )}

      {selectedDate && selectedHospital && (
        <div style={{ fontSize: 12, color: "#718096", marginBottom: 12 }}>
          {selectedHospital} • {selectedDate}
        </div>
      )}

      {/* Notifications */}
      {notifications.map((notif) => (
        <div key={notif.id} style={notificationStyle}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>📢 New Appointment</div>
          <div style={{ fontSize: 13 }}>{notif.message}</div>
        </div>
      ))}

      {/* Queue Statistics */}
      <div style={statsStyle}>
        <div style={statBoxStyle}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#667eea" }}>{morningCount}</div>
          <div style={{ fontSize: 12, color: "#718096" }}>Morning</div>
          <div style={{ fontSize: 10, color: "#a0aec0" }}>9:00 AM - 12:00 PM</div>
        </div>
        <div style={statBoxStyle}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#764ba2" }}>{afternoonCount}</div>
          <div style={{ fontSize: 12, color: "#718096" }}>Afternoon</div>
          <div style={{ fontSize: 10, color: "#a0aec0" }}>2:00 PM - 5:00 PM</div>
        </div>
        <div style={statBoxStyle}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#00d4aa" }}>{totalCount}</div>
          <div style={{ fontSize: 12, color: "#718096" }}>Total</div>
          <div style={{ fontSize: 10, color: "#a0aec0" }}>Today</div>
        </div>
      </div>

      {error && <p style={{ color: "#ef4444", marginBottom: 12 }}>{error}</p>}

      {/* Morning Patients */}
      {patients.morning.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#1a202c" }}>
            🌅 Morning Patients ({morningCount})
          </h4>
          {patients.morning.map((p) => (
            <div key={p.id} style={{ ...patientCardStyle, flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#1a202c" }}>
                    {p.name}
                    {p.is_emergency && <span style={emergencyBadgeStyle}>🚨 EMERGENCY</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "#718096", marginTop: 2 }}>
                    {p.slot}
                    {p.symptoms && <span style={{ fontStyle: "italic", marginLeft: 8 }}>- {p.symptoms}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    style={buttonStyle}
                    onClick={() => setExpandedPatient(expandedPatient === p.id ? null : p.id)}
                  >
                    {expandedPatient === p.id ? "Hide Rx" : "Add Rx"}
                  </button>
                  <button
                    style={buttonStyle}
                    onClick={() => handleDone(p)}
                  >
                    Done
                  </button>
                </div>
              </div>
              {expandedPatient === p.id && (
                <div style={{ width: "100%", marginTop: 12, paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#1a202c" }}>💊 Prescription</label>
                  <PrescriptionTable
                    medications={getPrescription(p)}
                    onUpdate={(meds) => savePrescription(p, meds)}
                  />
                  <small style={{ color: "#718096", display: "block", marginTop: 8 }}>Patient will see this prescription in their profile</small>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Afternoon Patients */}
      {patients.afternoon.length > 0 && (
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#1a202c" }}>
            🌇 Afternoon Patients ({afternoonCount})
          </h4>
          {patients.afternoon.map((p) => (
            <div key={p.id} style={{ ...patientCardStyle, flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#1a202c" }}>
                    {p.name}
                    {p.is_emergency && <span style={emergencyBadgeStyle}>🚨 EMERGENCY</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "#718096", marginTop: 2 }}>
                    {p.slot}
                    {p.symptoms && <span style={{ fontStyle: "italic", marginLeft: 8 }}>- {p.symptoms}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    style={buttonStyle}
                    onClick={() => setExpandedPatient(expandedPatient === p.id ? null : p.id)}
                  >
                    {expandedPatient === p.id ? "Hide Rx" : "Add Rx"}
                  </button>
                  <button
                    style={buttonStyle}
                    onClick={() => handleDone(p)}
                  >
                    Done
                  </button>
                </div>
              </div>
              {expandedPatient === p.id && (
                <div style={{ width: "100%", marginTop: 12, paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#1a202c" }}>💊 Prescription</label>
                  <PrescriptionTable
                    medications={getPrescription(p)}
                    onUpdate={(meds) => savePrescription(p, meds)}
                  />
                  <small style={{ color: "#718096", display: "block", marginTop: 8 }}>Patient will see this prescription in their profile</small>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalCount === 0 && !loading && (
        <div style={{ textAlign: "center", padding: 20, color: "#718096" }}>
          <p>No patients in queue</p>
          {!selectedDate && <p style={{ fontSize: 12 }}>Select a date to view patients</p>}
        </div>
      )}

      {loading && <p style={{ textAlign: "center", color: "#718096" }}>Loading...</p>}
    </div>
  );
}
