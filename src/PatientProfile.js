import { useEffect, useState } from "react";
import * as AuthService from "./AuthService";

export default function PatientProfile() {
  const [prescriptions, setPrescriptions] = useState({});
  const [bookings, setBookings] = useState([]);
  const auth = AuthService.getAuth();

  useEffect(() => {
    // If logged-in patient, fetch bookings and prescriptions from backend
    if (auth && auth.token) {
      (async () => {
        try {
          const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || "http://localhost:5001"}/my-bookings`, {
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setBookings(data || []);
          }
        } catch (err) {
          console.error("Failed to fetch bookings", err);
        }
        try {
          const res2 = await fetch(`${process.env.REACT_APP_BACKEND_URL || "http://localhost:5001"}/prescriptions`, {
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          if (res2.ok) {
            const pres = await res2.json();
            // convert to mapping by reference or id
            const map = {};
            pres.forEach((p) => {
              const key = p.reference || p.id || "";
              map[key] = p;
            });
            setPrescriptions(map);
          }
        } catch (err) {
          console.error("Failed to fetch prescriptions", err);
        }
      })();
    } else {
      // Fallback to localStorage for unauthenticated or legacy users
      const savedPrescriptions = JSON.parse(localStorage.getItem("prescriptions")) || {};
      setPrescriptions(savedPrescriptions);
      const savedBookings = JSON.parse(localStorage.getItem("bookings")) || [];
      setBookings(savedBookings);
    }
  }, []);

  const containerStyle = {
    padding: 24,
    borderRadius: 12,
    background: "white",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
    maxWidth: 700,
  };

  const bookingCardStyle = {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    background: "#f5f7fb",
    border: "1px solid #e2e8f0",
  };

  const prescriptionBoxStyle = {
    marginTop: 12,
    padding: 12,
    borderRadius: 6,
    background: "#f0fdf4",
    border: "2px solid #10b981",
  };

  const sectionTitleStyle = {
    fontSize: 16,
    fontWeight: 600,
    color: "#1a202c",
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: 20 }}>📋 My Appointments & Prescriptions</h2>

      {bookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#718096" }}>
          <p style={{ fontSize: 16 }}>No appointments booked yet</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Your appointments will appear here</p>
        </div>
      ) : (
        <div>
          {bookings.map((booking, index) => {
            // Try multiple keys to find prescription (reference, id, or name_slot)
            const keyRef = booking.reference || booking.id || "";
            const keyNameSlot = `${booking.name}_${booking.slot}`.replace(/\s+/g, "_");
            const presEntry = prescriptions[keyRef] || prescriptions[keyNameSlot] || prescriptions[booking.name + booking.slot];
            
            return (
              <div key={index} style={bookingCardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1a202c", marginBottom: 8 }}>
                      {booking.hospital}
                    </h3>
                    <div style={{ fontSize: 13, color: "#718096", marginBottom: 4 }}>
                      <strong>Department:</strong> {booking.department}
                    </div>
                    <div style={{ fontSize: 13, color: "#718096", marginBottom: 4 }}>
                      <strong>📅 Date:</strong> {booking.date}
                    </div>
                    <div style={{ fontSize: 13, color: "#718096", marginBottom: 4 }}>
                      <strong>⏰ Time:</strong> {booking.slot}
                    </div>
                    <div style={{ fontSize: 13, color: "#718096" }}>
                      <strong>Shift:</strong> {booking.shift}
                    </div>
                  </div>
                  <div style={{ padding: "8px 12px", background: "#dbeafe", borderRadius: 6, textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "#0284c7", fontWeight: 600 }}>Status</div>
                    <div style={{ fontSize: 13, color: "#0284c7", fontWeight: 700 }}>✓ Confirmed</div>
                  </div>
                </div>

                {/* Prescription Section */}
                {presEntry && (presEntry.medications?.length > 0 || presEntry.text) ? (
                  <div style={prescriptionBoxStyle}>
                    <div style={sectionTitleStyle}>
                      💊 Prescription
                    </div>
                    {presEntry.medications && presEntry.medications.length > 0 ? (
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginTop: 8 }}>
                        <thead>
                          <tr style={{ background: "#dcfce7", borderBottom: "2px solid #10b981" }}>
                            <th style={{ padding: 8, textAlign: "left", fontWeight: 600, color: "#1a202c" }}>S. No.</th>
                            <th style={{ padding: 8, textAlign: "left", fontWeight: 600, color: "#1a202c" }}>Tablet(s)</th>
                            <th style={{ padding: 8, textAlign: "left", fontWeight: 600, color: "#1a202c" }}>Dosage</th>
                            <th style={{ padding: 8, textAlign: "left", fontWeight: 600, color: "#1a202c" }}>Frequency (B-L-D)</th>
                            <th style={{ padding: 8, textAlign: "left", fontWeight: 600, color: "#1a202c" }}>No. of Days</th>
                          </tr>
                        </thead>
                        <tbody>
                          {presEntry.medications.map((med, idx) => (
                            <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                              <td style={{ padding: 8, color: "#1a202c" }}>{idx + 1}</td>
                              <td style={{ padding: 8, color: "#1a202c" }}>{med.tablet}</td>
                              <td style={{ padding: 8, color: "#1a202c" }}>{med.dosage}</td>
                              <td style={{ padding: 8, color: "#1a202c", fontWeight: 600 }}>{med.frequency}</td>
                              <td style={{ padding: 8, color: "#1a202c" }}>{med.days}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : presEntry.text ? (
                      <div style={{ 
                        fontSize: 13, 
                        color: "#1a202c", 
                        lineHeight: "1.6",
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word"
                      }}>
                        {presEntry.text}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div style={{
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 6,
                    background: "#fef3c7",
                    border: "1px solid #fcd34d",
                    fontSize: 13,
                    color: "#92400e",
                  }}>
                    ⏳ Prescription not available yet. Please check back after your appointment.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Information Box */}
      <div style={{
        marginTop: 24,
        padding: 16,
        borderRadius: 8,
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
      }}>
        <h4 style={{ fontSize: 13, fontWeight: 600, color: "#1e40af", marginBottom: 8 }}>ℹ️ About Prescriptions</h4>
        <ul style={{ fontSize: 12, color: "#1e40af", margin: 0, paddingLeft: 20 }}>
          <li>Your doctor will add prescription details after your appointment</li>
          <li>Check back here regularly to view your prescriptions</li>
          <li>Keep a copy of your prescription for your records</li>
        </ul>
      </div>
    </div>
  );
}
