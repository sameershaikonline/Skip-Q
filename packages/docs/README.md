# Project SON Antigravity Architecture & API Documentation (Mahabubabad Region)

## Applications Overview
1. **Patient Web (`apps/patient-web`)**: Port 3000 - Zomato-style hospital discovery & token queue booking portal. Defaults to **Mahabubabad**. Shows notice for unserved locations.
2. **Hospital Portal (`apps/hospital-portal`)**: Port 3001 - Independent management portal for hospital administrators (Signup/Login, status PENDING until approved).
3. **Admin Panel (`apps/admin-panel`)**: Port 3003 - Super Admin control hub to manually add hospitals, approve signup requests, and resolve patient-hospital disputes.
4. **Backend (`apps/backend`)**: Port 4000 - NestJS API server providing REST APIs and Socket.IO WebSockets for real-time token queues.
