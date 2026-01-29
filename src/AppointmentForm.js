import { useEffect, useState } from "react";
import {
  HOSPITALS,
  DEPARTMENTS,
  MORNING_SLOTS,
  AFTERNOON_SLOTS,
} from "./constants";

export default function AppointmentForm({ onHospitalSelect }) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [hospital, setHospital] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (hospital) onHospitalSelect(hospital);
  }, [hospital, onHospitalSelect]);

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

  const handleBook = () => {
    if (!name || !hospital || !department || !date || !slot) {
      setMessage("❌ Please fill all fields");
      return;
    }

    const shift = MORNING_SLOTS.includes(slot) ? "Morning" : "Afternoon";

    const confirm = window.confirm(
      `Hi ${name}!\n\nConfirm appointment:\n\n🏥 ${hospital}\n🩺 ${department}\n📅 ${date}\n⏰ ${slot}`
    );

    if (!confirm) return;

    bookings.push({ hospital, department, date, slot, shift });
    localStorage.setItem("bookings", JSON.stringify(bookings));

    setSlot(""); // ✅ disappears
    setMessage("✅ Appointment confirmed");
  };

  return (
    <div>
      <h2>Book Appointment</h2>

      <input
        placeholder="Patient Name"
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
        <option value="">Select Hospital</option>
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

      <h3>Available Time Slots</h3>

      <h4>🌅 Morning</h4>
      {renderSlots(MORNING_SLOTS)}

      <h4>🌇 Afternoon</h4>
      {renderSlots(AFTERNOON_SLOTS)}

      <br />
      <button onClick={handleBook}>Book</button>
      <p>{message}</p>
    </div>
  );
}


