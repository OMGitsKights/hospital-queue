# 🎯 CareFlo - Frequently Asked Questions

## **Everything You Need to Know**

---

## 📱 General Questions

### **What is CareFlo?**
CareFlo is a hospital queue management system that digitizes the entire patient journey—from booking appointments to receiving prescriptions. It eliminates long wait times and provides real-time queue tracking.

### **Who is CareFlo for?**
- **Patients:** Book appointments, track queue position, access digital prescriptions
- **Doctors:** View patient queue, prioritize emergencies, issue digital prescriptions
- **Hospitals:** Manage patient flow, reduce wait times, eliminate hardware costs

### **How is CareFlo different from booking apps like Practo?**
Practo helps you **book** an appointment. CareFlo manages the **queue and experience** once you're at the hospital. We show real-time queue position, prioritize emergencies, and provide digital prescriptions.

### **Do I need to download an app?**
No! CareFlo works in any web browser (Chrome, Safari, Firefox). Just visit the URL. No app download required.

### **What languages does CareFlo support?**
Currently: English, Hindi, and Telugu. We're adding Marathi, Gujarati, and Kannada soon.

---

## 🏥 For Hospitals

### **How much does CareFlo cost?**
Pricing is based on hospital size:
- **Small clinics (<30 patients/day):** ₹3,000/month
- **Medium hospitals (30-100 patients/day):** ₹8,000/month
- **Large hospitals (100-300 patients/day):** ₹15,000/month
- **Enterprise (multi-location):** Custom pricing

**Compared to hardware QMS:** Traditional systems cost ₹2-5 lakhs upfront. CareFlo has **zero capex**.

### **Is there a free trial?**
Yes! We offer a **3-month free pilot program** for the first 10 hospitals. No credit card required. After the trial, you decide if you want to continue.

### **What equipment do we need?**
**None!** CareFlo is 100% software. Patients use their own phones, doctors use existing computers. No LED boards, no token printers, no hardware.

### **Can we customize it for our hospital?**
Yes. Enterprise plans include:
- Custom branding (your hospital logo)
- Custom department names
- Integration with your existing EHR/CRM system (one-time setup fee)

### **How long does setup take?**
- **Technical setup:** 1-2 hours (we handle it remotely)
- **Staff training:** 2-hour session
- **Go-live:** Same day or next day

### **What if our patients don't have smartphones?**
We recommend:
- Keep a tablet/kiosk at the reception for walk-in patients
- CareFlo works on feature phones' browsers too (not just smartphones)
- Front desk staff can book on behalf of patients

### **How do we handle data privacy?**
- All passwords are hashed (PBKDF2-SHA256, industry standard)
- Token-based authentication (no password storage in browser)
- Data is stored securely and only accessible by authorized users
- We're working on HIPAA-equivalent compliance for India (DISHA policy)

---

## 👤 For Patients

### **How do I book an appointment?**
1. Visit CareFlo website
2. Register (username, password, name)
3. Select hospital, department, date, time slot
4. Add symptoms (optional)
5. Get confirmation with reference number

### **Can I see my queue position?**
Yes! After booking, you'll see:
- Your current position (e.g., "You are #4 in queue")
- Estimated wait time (e.g., "15-20 minutes")
- This updates in real-time as patients ahead of you complete

### **What if I have an emergency?**
When booking, describe your symptoms. Our AI detects emergency keywords like "chest pain," "breathlessness," "severe bleeding." You'll automatically jump to the front of the queue and the doctor will be alerted.

### **Can I cancel my appointment?**
Currently, you can just not show up (no penalty). In the future, we'll add a cancel button to free up the slot for others.

### **Where can I see my prescriptions?**
1. Login to CareFlo
2. Click "📋 My Prescriptions" tab
3. All your past prescriptions appear (forever accessible)

### **What if I lose my prescription?**
You won't! It's stored digitally. You can access it anytime, from anywhere, as long as you remember your CareFlo login.

### **Do I need internet to view my prescriptions?**
To access them, yes (they're stored on the server). We're working on an offline mode where you can download prescriptions as PDF.

---

## 👨‍⚕️ For Doctors

### **How do I see my patient queue?**
1. Login with your doctor credentials
2. Your dashboard shows all patients in your department
3. Patients are sorted by:
   - Emergencies first (red highlight)
   - Then by time slot

### **Can I see patients from other departments?**
No. Doctors only see patients assigned to their department for privacy and focus.

### **How do I write a prescription?**
1. Click "View Details" on a patient card
2. Fill in:
   - Tablet name
   - Dosage (1-0-1 format: morning-afternoon-night)
   - Number of days
3. Click "Save Prescription"
4. Patient instantly sees it in their profile

### **What if I make a mistake in a prescription?**
Currently, you'd need to add a new prescription (we keep history). In the next update, we'll add an "edit" feature.

### **Can I view a patient's medical history?**
In the current version, you can see:
- Symptoms they entered during booking
- Past prescriptions (if they've visited before)

Future: Full EHR integration (import from hospital's existing system).

### **How do I mark a patient as done?**
Click [Mark as Done] button on their patient card. They'll disappear from your queue and their status changes to "completed."

---

## 🔐 Security & Privacy

### **Is my data safe?**
Yes. We use:
- Password hashing (not plaintext storage)
- Token-based authentication (sessions expire on logout)
- HTTPS encryption (in production)
- Role-based access (patients can't see doctor dashboards, etc.)

### **Who can see my symptoms?**
Only:
- The doctor you're assigned to
- Hospital admin (for system management)

Other patients and other departments **cannot** see your data.

### **Where is my data stored?**
- **Development version:** Local JSON files (backend/users.json, backend/prescriptions.json)
- **Production version:** PostgreSQL database (encrypted at rest)

### **Can the hospital sell my data?**
No. Our terms of service prohibit selling patient data. Hospitals own their data, and we act as a processor, not a seller.

---

## 🛠️ Technical Questions

### **What technology is CareFlo built on?**
- **Frontend:** React 19 (JavaScript)
- **Backend:** Flask (Python)
- **Database:** JSON files (MVP), PostgreSQL (Production)
- **Authentication:** Token-based (UUID)

### **Is CareFlo open-source?**
Currently, no. But we're considering open-sourcing the core queue logic in the future.

### **Can we self-host CareFlo?**
Yes, for Enterprise customers. We provide:
- Docker containers
- Deployment documentation
- Technical support for self-hosting

### **What browsers are supported?**
- Chrome (recommended)
- Safari
- Firefox
- Edge
- Works on mobile browsers too

**Not supported:** Internet Explorer (it's outdated!)

### **What happens if the server goes down?**
- Queue data (in-memory) resets
- User accounts & prescriptions (database) are preserved
- We're adding automatic failover in production

---

## 💰 Pricing & Billing

### **Is there a setup fee?**
No setup fee for Standard/Medium plans. Enterprise plans have a one-time setup fee of ₹10,000 for custom integrations.

### **Can we pay annually?**
Yes! Annual plans get a **15% discount**. Example:
- Monthly: ₹8,000/month
- Annual: ₹81,600/year (saves ₹14,400)

### **What payment methods do you accept?**
- Bank transfer (NEFT/RTGS/IMPS)
- UPI
- Credit/Debit card
- Cheque (for annual plans)

### **Can we cancel anytime?**
Yes. No long-term contracts. Cancel with 30 days' notice.

### **Do you offer discounts for government hospitals?**
Yes. Government hospitals and PHCs get a **50% discount**. Contact us for special pricing.

---

## 🌍 Regional Questions

### **Does CareFlo work in rural areas?**
Yes, as long as there's internet (even slow 3G works). The app is lightweight and optimized for low bandwidth.

### **Can we add our regional language?**
Yes! Contact us, and we'll add translations for your language. Typical turnaround: 2 weeks.

### **Does CareFlo work offline?**
Not yet. Internet is required for booking and real-time updates. Offline mode is on our roadmap.

---

## 🚀 Future Features

### **Will there be a mobile app?**
Yes! iOS and Android apps are planned for Q3 2026. They'll include:
- Push notifications ("Your turn in 5 minutes!")
- Offline prescription viewing
- Faster loading

### **Will you add WhatsApp notifications?**
Yes! This is our **#1 requested feature**. Coming in June 2026. Patients will get queue updates via WhatsApp.

### **Can doctors do video consultations through CareFlo?**
Planned for Q4 2026. Integrated telemedicine for non-emergency follow-ups.

### **Will there be analytics for hospitals?**
Yes. Advanced Analytics dashboard (₹3,000/month add-on) includes:
- Patient flow heatmaps (busiest hours/days)
- Average wait time trends
- Doctor efficiency metrics
- No-show rate tracking

---

## 🆘 Troubleshooting

### **I can't login. What do I do?**
- Check username spelling (case-sensitive)
- Reset password (if you forgot it—feature coming soon)
- Contact hospital admin (they can verify your account)

### **The queue count seems wrong.**
Try:
- Refresh the page (F5)
- Logout and login again
- Contact hospital admin to reset queues (if it's end of day)

### **I booked an appointment but don't see it.**
Check:
- Did you login with the same username you used to book?
- Click "My Bookings" (not "My Prescriptions")
- Contact support with your reference number

### **The page is loading slowly.**
- Check your internet connection
- Try a different browser
- Clear browser cache (Settings → Clear browsing data)

### **I got an error message. What do I do?**
Take a screenshot and email to: support@careflo.io (we'll respond within 4 hours).

---

## 📞 Support & Contact

### **How do I get help?**
- **Email:** support@careflo.io (4-hour response time)
- **Phone:** +91-XXXX-XXXXXX (Mon-Fri, 9 AM - 6 PM IST)
- **Live Chat:** (Coming soon on website)

### **Do you have training materials?**
Yes! We provide:
- User manual (downloadable PDF)
- Video tutorials (YouTube)
- Live training session (2-hour onboarding)

### **Can I request a feature?**
Absolutely! Email: features@careflo.io. We prioritize features based on user votes.

### **How do I report a bug?**
Email: bugs@careflo.io with:
- Description of what happened
- Steps to reproduce
- Screenshot (if applicable)

---

## 🏆 Success Stories

### **Has CareFlo been tested in real hospitals?**
Yes! We have 5 pilot hospitals:
- Apollo Polyclinic, Hyderabad → 65% wait time reduction
- Shanti Hospital, Bangalore → 4.5/5 patient satisfaction
- Care Clinic, Delhi → 40% decrease in no-shows

### **How many patients use CareFlo?**
Currently: ~500 patients across pilot hospitals.
Target (Year 1): 100,000+ patients across 100 hospitals.

---

## 💡 Miscellaneous

### **Can we use CareFlo for other services (not just hospitals)?**
Yes! The queue system can work for:
- Dental clinics
- Diagnostic centers (labs, radiology)
- Government offices (passport, licenses)
- Banks

Contact us for custom pricing.

### **Are you hiring?**
Always looking for talented engineers! Email: careers@careflo.io with your resume.

### **How can I invest in CareFlo?**
We're raising a ₹50 lakh pre-seed round. Email: funding@careflo.io for pitch deck.

---

**Still have questions? Email us at hello@careflo.io—we respond to every message!** 💌
