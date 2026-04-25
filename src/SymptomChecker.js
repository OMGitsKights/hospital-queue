import React from "react";
import "./SymptomChecker.css";

// Symptom to department mapping
const SYMPTOM_MAP = [
    {
        id: "heart",
        title: "Chest Pain / Heart Issues",
        description: "Chest discomfort, palpitations, shortness of breath",
        department: "Cardiology",
        image: "/symptomImages/heart.png",
        emoji: "❤️",
    },
    {
        id: "joints",
        title: "Bone / Joint Pain",
        description: "Fractures, arthritis, back pain, sports injuries",
        department: "Orthopedics",
        image: "/symptomImages/joints.png",
        emoji: "🦴",
    },
    {
        id: "skin",
        title: "Skin Issues",
        description: "Rashes, acne, skin infections, allergies",
        department: "Dermatology",
        image: "/symptomImages/skin.png",
        emoji: "🩹",
    },
    {
        id: "ear",
        title: "Ear Problems",
        description: "Ear pain, hearing issues, ear infections",
        department: "ENT",
        image: "/symptomImages/ear.png",
        emoji: "👂",
    },
    {
        id: "throat",
        title: "Throat / Nose Issues",
        description: "Sore throat, nasal congestion, sinus problems",
        department: "ENT",
        image: "/symptomImages/throat.png",
        emoji: "🤧",
    },
    {
        id: "womens",
        title: "Women's Health",
        description: "Pregnancy, gynecological issues, prenatal care",
        department: "Gynecology",
        image: "/symptomImages/womens_health.png",
        emoji: "🤰",
    },
    {
        id: "xray",
        title: "Need Imaging / Scan",
        description: "X-ray, CT scan, MRI, ultrasound",
        department: "Radiology",
        image: null,
        emoji: "🔬",
    },
    {
        id: "surgery",
        title: "Surgical Consultation",
        description: "Need surgical evaluation or procedure",
        department: "General Surgery",
        image: null,
        emoji: "⚕️",
    },
    {
        id: "general",
        title: "General Checkup",
        description: "Routine checkup, fever, general wellness",
        department: "General",
        image: null,
        emoji: "🩺",
    },
];

export default function SymptomChecker({ isOpen, onClose, onSelectDepartment, language = "en" }) {
    if (!isOpen) return null;

    const handleSymptomClick = (symptom) => {
        onSelectDepartment(symptom.department);
        onClose();
    };

    return (
        <div className="symptom-checker-overlay" onClick={onClose}>
            <div className="symptom-checker-modal" onClick={(e) => e.stopPropagation()}>
                <div className="symptom-checker-header">
                    <h2>🩺 What are your symptoms?</h2>
                    <button className="close-button" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="symptom-grid">
                    {SYMPTOM_MAP.map((symptom) => (
                        <div
                            key={symptom.id}
                            className="symptom-card"
                            onClick={() => handleSymptomClick(symptom)}
                        >
                            <div className="symptom-image">
                                {symptom.image ? (
                                    <img
                                        src={symptom.image}
                                        alt={symptom.title}
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                            e.target.nextSibling.style.display = "block";
                                        }}
                                    />
                                ) : null}
                                <div
                                    className="symptom-emoji"
                                    style={{ display: symptom.image ? "none" : "block" }}
                                >
                                    {symptom.emoji}
                                </div>
                            </div>
                            <h3>{symptom.title}</h3>
                            <p>{symptom.description}</p>
                            <div className="symptom-department">→ {symptom.department}</div>
                        </div>
                    ))}
                </div>

                <div className="symptom-checker-footer">
                    <small>💡 Not finding your symptom? Select "General" for a checkup</small>
                </div>
            </div>
        </div>
    );
}
