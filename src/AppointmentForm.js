import { useEffect, useState } from "react";
import {
  HOSPITALS,
  DEPARTMENTS,
  MORNING_SLOTS,
  AFTERNOON_SLOTS,
} from "./constants";
import { getTranslation } from "./translations";
import * as AuthService from "./AuthService";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001"; // keep in sync with backend

export default function AppointmentForm({ onHospitalSelect, setSelectedDate, resetToken, bookingSignal, onBookingDone, onBookingConfirmed, language = "en" }) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [hospital, setHospital] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [queueCounts, setQueueCounts] = useState({ morning: 0, afternoon: 0 });

  const generateReferenceNumber = () => {
    return "CF" + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  const fetchQueues = async () => {
    try {
      const url = new URL(`${BACKEND_URL}/queues`);
      if (date) url.searchParams.append("date", date);
      const res = await AuthService.authFetch(url.toString());
      if (res.status === 401) {
        setMessage(getTranslation(language, "pleaseLogin"));
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch queues");
      const data = await res.json();
      const hosp = data[hospital] || {};
      const dept = hosp[department] || { morning: 0, afternoon: 0 };
      setQueueCounts({ morning: dept.morning || 0, afternoon: dept.afternoon || 0 });
    } catch (err) {
      setQueueCounts({ morning: 0, afternoon: 0 });
    }
  };

  useEffect(() => {
    if (hospital) onHospitalSelect(hospital);
  }, [hospital, onHospitalSelect]);

  // Notify parent about selected date so dashboard can query for that date
  useEffect(() => {
    if (typeof setSelectedDate === "function") setSelectedDate(date || "");
  }, [date, setSelectedDate]);

  // Clear form fields when a reset is signaled from parent
  useEffect(() => {
    setName("");
    setDepartment(DEPARTMENTS[0]);
    setHospital("");
    setDate("");
    setSlot("");
    setMessage("");
  }, [resetToken]);

  // Refresh queue counts when hospital/department/date change or when booking/reset happens
  useEffect(() => {
    if (!hospital || !department || !date) {
      setQueueCounts({ morning: 0, afternoon: 0 });
      return;
    }
    fetchQueues();
  }, [hospital, department, date, resetToken, bookingSignal]);

  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

  const isPastDate = (d) => d < today;

  const isSlotBooked = (s) =>
    bookings.some(
      (b) =>
        b.date === date &&
        b.hospital === hospital &&
        b.department === department &&
        b.slot === s
    );

  const renderSlots = (slots) => {
    if (!date || isPastDate(date)) return <p>No slots available</p>;

    const available = slots.filter((s) => !isSlotBooked(s));
    if (available.length === 0) return <p>No slots available</p>;

    return available.map((s) => (
      <label key={s}>
        <input
          type="radio"
          checked={slot === s}
          onChange={() => setSlot(s)}
        />{" "}
        {s}
        <br />
      </label>
    ));
  };

  const handleBook = async () => {
    // Ensure patient is logged in
    if (!AuthService.isAuthenticated() || AuthService.getRole() !== "patient") {
      setMessage(getTranslation(language, "pleaseLogin"));
      return;
    }
    if (!name || !hospital || !department || !date || !slot) {
      setMessage(getTranslation(language, "fillAllFields"));
      return;
    }

    const shift = MORNING_SLOTS.includes(slot) ? "morning" : "afternoon";
    const referenceNumber = generateReferenceNumber();

    const confirm = window.confirm(
      `${getTranslation(language, "confirmAppointment")}\n\n🏥 ${hospital}\n🩺 ${department}\n📅 ${date}\n⏰ ${slot}`
    );

    if (!confirm) return;

    // Try to post booking to backend so dashboard reflects it
    try {
      const res = await AuthService.authFetch(`${BACKEND_URL}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, hospital, department, shift, date, slot, reference: referenceNumber }),
      });

      if (res.status === 401) {
        setMessage(getTranslation(language, "pleaseLogin"));
        return;
      }
      if (!res.ok) throw new Error("Booking failed");
      // notify parent to refresh dashboard immediately
      if (typeof onBookingDone === "function") onBookingDone();
      // refresh local view of counts after successful booking
      fetchQueues();
    } catch (err) {
      setMessage(getTranslation(language, "backendNotReachable"));
    }

    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    bookings.push({ name, hospital, department, date, slot, shift, reference: referenceNumber });
    localStorage.setItem("bookings", JSON.stringify(bookings));

    // Show confirmation page
    if (typeof onBookingConfirmed === "function") {
      onBookingConfirmed({
        name,
        hospital,
        department,
        date,
        time: slot,
        referenceNumber,
      });

      // Dispatch event to notify doctors about new appointment
      const appointmentEvent = new CustomEvent("appointmentBooked", {
        detail: {
          name,
          hospital,
          department,
          date,
          time: slot,
          referenceNumber,
        },
      });
      window.dispatchEvent(appointmentEvent);
    }

    setSlot("");
    setMessage(getTranslation(language, "appointmentConfirmed"));
  };

  return (
    <div>
      <h2>{getTranslation(language, "bookAppointment")}</h2>

      <input
        placeholder={getTranslation(language, "patientName")}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br /><br />

      <select value={department} onChange={(e) => setDepartment(e.target.value)}>
        {DEPARTMENTS.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>

      <select value={hospital} onChange={(e) => setHospital(e.target.value)}>
        <option value="">{getTranslation(language, "selectHospital")}</option>
        {HOSPITALS.map((h) => (
          <option key={h}>{h}</option>
        ))}
      </select>

      <input
        type="date"
        min={today}
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {hospital && department && date && (
        <div style={{ marginTop: 12, padding: 8, border: "1px solid #eee", borderRadius: 6 }}>
          <strong>{getTranslation(language, "currentQueue")} {department} {getTranslation(language, "at")} {hospital}:</strong>
          <div>{getTranslation(language, "morning")}: {queueCounts.morning}</div>
          <div>{getTranslation(language, "afternoon")}: {queueCounts.afternoon}</div>
          <div>{getTranslation(language, "totalPatients")}: {queueCounts.morning + queueCounts.afternoon}</div>
          <small style={{ color: "#666" }}>{getTranslation(language, "liveInfo")}</small>
        </div>
      )}

      <h3>{getTranslation(language, "availableTimeSlots")}</h3>

      <h4>{getTranslation(language, "morning")}</h4>
      {renderSlots(MORNING_SLOTS)}

      <h4>{getTranslation(language, "afternoon")}</h4>
      {renderSlots(AFTERNOON_SLOTS)}

      <br />
      <button onClick={handleBook}>{getTranslation(language, "book")}</button>
      <p>{message}</p>
    </div>
  );
}


