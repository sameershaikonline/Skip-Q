# 🚀 Skip-Q — JNTUH TBI IDEATHON 2026 Pitch & Bootcamp Master Guide

> **Institution**: JNTUH Technology Business Incubator (JTBI)  
> **Event**: IDEATHON 2026 (Idea Refinement Bootcamp — 20 & 21 August 2026)  
> **Target Outcome**: Pre-Incubation Cohort Selection, Mentorship & Startup Seed Grants  

---

## 🎯 Quick Navigation & Pitch Links
- **Patient Live App**: https://skipq-user.vercel.app
- **Hospital Caller Portal**: https://skipq-hospital.vercel.app
- **Super Admin Governance Hub**: https://skipq-admin.vercel.app
- **GitHub Repository**: https://github.com/sameir-dev/Skip-Q.git

---

## 📋 1. Business Model Canvas (BMC) — Tailored for Day 1 Workshops

### 1. Problem
- **Massive Time Loss**: Patients spend 2 to 4 hours waiting in congested, noisy OPD waiting rooms.
- **Complete Lack of Queue Visibility**: Patients have no idea if the doctor is on Token #5 or Token #35.
- **Cross-Infection Hazard**: Overcrowded waiting halls increase airborne viral transmission.
- **Tier-2 & Tier-3 Neglect**: Rural and semi-urban towns like Mahabubabad are completely unserved by metro-centric apps like Practo.

### 2. Customer Segments
- **B2C (Patients & Families)**: Outpatients in Tier-2/3 towns, rural families traveling from villages.
- **B2B (Hospitals & Clinics)**: Private nursing homes, polyclinics, diagnostic labs, individual specialists.
- **B2G (Public Health)**: Government Community Health Centres (CHCs) and Area Hospitals.

### 3. Unique Value Proposition (UVP)
- **For Patients**: *"Never wait in a hospital waiting room again"* — Track the live doctor in-room consultation token number on your mobile from anywhere (home, tea stall, chemist).
- **For Hospitals**: 1-click token caller that increases daily patient consultation throughput by 40% with zero capital expenditure or hardware.

### 4. Solution
- **Triple-Portal Architecture**: Dedicated Patient Discovery & Booking, Hospital Reception Queue Controller, and Super Admin Management.
- **Live Consultation Radar**: Instant WebSocket updates decrementing countdown timers in real-time.
- **Zero-Friction Access**: Clean web app with SMS alerts — no bulky 100MB apps required.

### 5. Channels
- **QR Code Standees**: Placed on clinic reception desks and partnered local pharmacies.
- **Direct Doctor Outreach**: Engaging local Indian Medical Association (IMA) district chapters.
- **Word-of-Mouth Network**: Patients recommending it to fellow villagers.

### 6. Revenue Model
- **Hospital SaaS**: Monthly subscription (₹999/mo for single doctor, ₹2,999/mo for multi-speciality).
- **Digital Convenience Fee**: ₹5 to ₹10 for priority advance digital token passes.
- **Pharmacy & Lab Integrations**: Featured diagnostic lab and pharmacy referrals.

### 7. Cost Structure
- Cloud Infrastructure (Next.js 14, Supabase PostgreSQL, Vercel Edge).
- SMS Gateway API (Nodemailer / Twilio / MSG91).
- QR Standee Printing & Onboarding Operations.

### 8. Key Metrics (Lean Startup Build-Measure-Learn)
- **Time Saved**: Average patient waiting room reduction (Target: 90 mins saved/patient).
- **Queue Throughput**: Daily active tokens called per clinic.
- **Retention**: Monthly hospital SaaS renewal rate (>90%).

### 9. Unfair Advantage
- **Zero Hardware Required**: Runs directly on existing clinic laptops or mobile phones.
- **Hyperlocal Network Moat**: Dominating Tier-2/3 district hubs before competitors enter.
- **100% Live Working System**: Production-ready deployment today with database persistence.

---

## 🎤 2. Day 2 Pitch Arena: 5-Minute Pitch Script

### Slide 1: Hook (30 sec)
*"Respected Jury and Mentors, imagine taking a bus from a village at 7:00 AM with your sick grandmother, reaching the town clinic at 8:30 AM, and being told to wait on a crowded wooden bench until 12:30 PM because nobody knows when the doctor will arrive or which token is inside.*  
*This is the daily reality for 70% of India. Today, we are presenting **Skip-Q** — a platform that eliminates waiting room chaos and puts the live doctor consultation room status directly in the patient's hands."*

### Slide 2: The Core Problem (45 sec)
*"Traditional healthcare appointment systems fail because medical consultations are unpredictable. An emergency case can delay appointments by 2 hours, turning booked time slots into useless pieces of paper. Patients are trapped in crowded waiting rooms, risking cross-infections, while receptionists are overwhelmed answering 'When is my turn?' 200 times a day."*

### Slide 3: The Solution — Skip-Q (45 sec)
*"Skip-Q is India's first Hyperlocal Live Consultation Radar designed for Tier-2 & Tier-3 towns.  
Patients can check which token is currently inside the doctor's room in real-time, book a digital token with their phone number, and arrive at the clinic right when their turn is up."*

### Slide 4: LIVE 60-Second Demo (60 sec)
*[Open your browser with two split windows: Hospital Portal on left, Patient App on right]*  
*"Let me show you how this works live. Here is our Hospital Reception Portal for City Care Hospital in Mahabubabad. When the doctor completes a consultation, the receptionist clicks 'Call Next Patient'.  
Instantly, on the patient's smartphone screen on the right, the live counter updates from Token #3 to Token #4, and an SMS notification is dispatched.  
This is built on Next.js 14 and Supabase PostgreSQL with sub-second latency."*

### Slide 5: Market & Traction (45 sec)
*"India records over 4.5 Billion outpatient consultations annually. In Telangana and Andhra Pradesh alone, there are over 25,000 private clinics in Tier-2/3 towns that operate without any digital queue system.  
We are piloting Skip-Q in Mahabubabad town with a target of 40 local nursing homes and clinics before scaling across Warangal, Khammam, and Karimnagar."*

### Slide 6: Business Model & The Ask (45 sec)
*"Our business model is a simple, high-margin B2B SaaS charging ₹999 to ₹2,999 per clinic per month, paired with a nominal ₹5 convenience fee for advance digital token bookings.  
From JNTUH TBI, we are seeking **Pre-Incubation support, clinical mentorship, and a ₹5 Lakh pre-seed grant** to fund our SMS gateway infrastructure and pilot rollout across 50 clinics.  
With Skip-Q, let's restore dignity and time to Indian healthcare. Thank you!"*

---

## 🏆 3. Quick Tips for Day 1 & Day 2 Success at JNTUH TBI

1. **In the Day 1 Mentor Clinic (05:00 - 07:00 PM)**:
   - Always open the live working sites (`https://skipq-user.vercel.app`, `https://skipq-hospital.vercel.app`, `https://skipq-admin.vercel.app`) on your laptop/phone to show mentors.
   - Most student teams will only have Figma mockups or PowerPoint slides. Having a **fully functional, live deployed full-stack platform** will immediately set you apart as a top contender for the Day 2 Pitch Arena!

2. **Jury Focus on Day 2**:
   - The jury consists of JNTUH Alumni Entrepreneurs and VCs. They care about:
     - **Execution**: Can you build it? (*Yes, it is already live and deployed!*)
     - **Defensibility**: Why Tier-2/3? (*Because Practo ignores walk-ins, and Qmatic costs ₹1.5 Lakhs in hardware*).
     - **Unit Economics**: Is the clinic willing to pay ₹999/month? (*Yes, because it saves reception payroll and increases patient throughput*).
