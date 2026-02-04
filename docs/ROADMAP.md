# Project Roadmap

This document serves as a high-level plan for the future development of CareFlo.

## Short Term (Next Minor Version)
- [ ] **Data Persistence**: Migrate Queue data from in-memory to JSON persistence to survive server restarts.
- [ ] **Input Validation**: Add stricter validation on frontend booking forms (e.g., date ranges).
- [ ] **Profile Editing**: Allow patients to update their name/password.

## Medium Term (v1.0)
- [ ] **Database Migration**: Move from JSON files to SQLite or PostgreSQL for better scalability.
- [ ] **Notifications**: Integration with an SMS/Email service (e.g., Twilio) to notify patients when their turn is approaching.
- [ ] **Doctor Dashboard**: Analytics for doctors (patients seen per day, average time per patient).

## Long Term
- [ ] **Mobile App**: React Native mobile application for patients.
- [ ] **Telemedicine**: Integrated video call links for remote consultations.
- [ ] **Hospital Integration**: HL7 standard support for integrating with existing hospital legacy systems.
