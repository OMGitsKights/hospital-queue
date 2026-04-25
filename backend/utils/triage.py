"""
Triage logic — keyword-based emergency detection.
"""

EMERGENCY_KEYWORDS = [
    "chest pain", "breathlessness", "unconscious", "heavy bleeding",
    "severe injury", "stroke", "seizure", "poisoning", "heart attack",
    "cannot breathe", "choking", "collision", "burns", "fracture",
]


def is_emergency(symptoms: str) -> bool:
    """Return True if symptoms contain any emergency keyword."""
    if not symptoms:
        return False
    lower = symptoms.lower()
    return any(kw in lower for kw in EMERGENCY_KEYWORDS)
