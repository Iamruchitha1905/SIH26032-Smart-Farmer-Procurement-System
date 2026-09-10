# Smart Farmer Procurement Slot Booking and Tracking System (SIH26032)

> **Smart India Hackathon 2026 Project**  
> **Organization**: Ministry of Consumer Affairs, Food & Public Distribution  
> **Department**: Department of Consumer Affairs (DoCA)  
> **Category**: Software | **Theme**: Smart Automation  

---

## 🌾 Executive Summary

Rural farmers across India frequently face severe overcrowding at government procurement centres, long waiting times (often lasting 6–10 hours), lack of advance schedule information, and uncertainty regarding crop acceptance and payment disbursement. 

The **Smart Farmer Procurement Slot Booking and Tracking System** is a complete, mobile-first, multilingual platform developed for DoCA. It empowers farmers to register, select crops, view official Minimum Support Prices (MSP), detect overloaded centres, book guaranteed capacity-aware time slots, obtain digital tokens with QR codes, track live queues in real-time, receive AI waiting-time predictions, recover missed slots via app or SMS, and track payment settlement end-to-end.

---

## 🚀 Key Innovations & Unique Selling Propositions (USPs)

1. **Multilingual Rural Design**: Full native support for **Kannada (ಕನ್ನಡ)**, **English**, and **Hindi** with high-contrast, large touch elements designed for rural accessibility.
2. **AI Crowd & Waiting-Time Engine**: Real-time queue regression model predicting waiting time based on active counters, queue depth, and historical processing speed.
3. **Smart Overloaded-Centre Rerouting**: Automatic classification of centres into **GREEN** (Low crowd), **YELLOW** (Moderate crowd), and **RED** (Overloaded). Suggests nearby alternative centres to balance regional load.
4. **Digital Token & QR Verification**: Generates unique cryptographic token IDs (`RAGI-2026-000184`) with HTML5 Canvas QR codes for instant counter scan and check-in.
5. **Multilingual Voice Assistant**: Natural voice and text NLU chatbot supporting Kannada (`"ನನಗೆ ರಾಗಿ slot ಬೇಕು"`), English, and Hindi for hands-free slot booking and status queries.
6. **Missed Slot & Feature Phone SMS Recovery**: "Report Delay" button with GPS proximity buffer, plus SMS reply `"1"` simulator for farmers without smartphones.
7. **End-to-End Payment Settlement Tracker**: Transparent payment pipeline tracking (`PENDING` → `PROCESSING` → `PAID`) with official reference numbers and bank transfer logging.
8. **3 Dedicated Portals**:
   - **Farmer Portal**: Mobile-first dashboard for slot booking, token tracker, MSP calculator, and voice bot.
   - **Procurement Officer Counter Desk**: QR scanner, check-in, crop weight & moisture recorder, quality grading (Grade A/B), and payment updater.
   - **Central Admin (DoCA) Command Center**: State-wide procurement analytics, overloaded centre alerts, and dynamic MSP rate console.

---

## 📐 System Architecture

```
+-----------------------------------------------------------------------------------+
|                                  REACT FRONTEND (Vite)                            |
+------------------------------------+----------------------------------------------+
|  Farmer Portal (Mobile-First UI)   |  Officer Portal & Admin Command Dashboard     |
|  - Multilingual i18n (KN, EN, HI)  |  - Queue Counter Management                  |
|  - Crop & MSP Rate Calculator      |  - QR Code Scanner & Quality Form            |
|  - Smart Slot & Token Generation   |  - State MSP Rate Update Console             |
|  - Live Queue & Wait Visualizer    |  - Real-time Overload & Analytics Charts     |
|  - Voice Chatbot Overlay           |                                              |
|  - Feature Phone SMS Simulator     |                                              |
+------------------------------------+----------------------------------------------+
                                     | REST API
+------------------------------------+----------------------------------------------+
|                                  FASTAPI BACKEND                                  |
+-----------------------------------------------------------------------------------+
| - Auth & Role-Based Access (Farmer, Officer, Admin)                               |
| - Capacity & Overload Classifier (GREEN / YELLOW / RED)                           |
| - AI Engine: Waiting-time Predictor & Smart Centre Rerouter                       |
| - Voice Chatbot NLU & Slot Booking Automation Engine                              |
| - Missed Slot Recovery & Proximity GPS / SMS Simulator Backend                    |
| - Payment Pipeline & Audit Logging Engine                                         |
+-----------------------------------------------------------------------------------+
|                             DATABASE (SQLite / SQLAlchemy)                         |
| Farmers, Centres, Slots, Bookings, Tokens, QueueEntries, Payments, ML Logs       |
+-----------------------------------------------------------------------------------+
```

---

## 🗄️ Database Schema & Models

- `Farmer`: ID, FarmerRefID, Name, Mobile, Aadhaar, Village, District, PreferredLanguage (`kn`, `en`, `hi`).
- `CropCategory`: ID, Name_EN, Name_KN, Name_HI.
- `Crop`: ID, CategoryID, Name_EN, Name_KN, Name_HI, Code (`RAGI`, `PADDY`, `WHEAT`, etc.).
- `CropRate`: ID, CropID, MSPRatePerQuintal, Currency, IsCurrent.
- `ProcurementCentre`: ID, Name, District, LocationAddress, Lat, Lng, MaxDailyCapacity, CountersCount, CrowdStatus (`GREEN`, `YELLOW`, `RED`).
- `Slot`: ID, CentreID, SlotDate, TimeWindow, MaxFarmers, BookedCount.
- `Booking`: ID, BookingRef, FarmerID, CropID, CentreID, SlotID, QuantityQuintals, RatePerQuintal, EstimatedAmount, Status (`BOOKED`, `ARRIVED`, `APPROVED`, `COMPLETED`, `DELAYED`).
- `DigitalToken`: ID, TokenNumber, BookingID, QRCodeData.
- `QueueEntry`: ID, CentreID, BookingID, TokenNumber, QueuePosition, Status (`WAITING`, `IN_SERVICE`, `COMPLETED`).
- `ProcurementRecord`: ID, ProcurementRef, BookingID, ActualWeightQuintals, MoisturePercentage, QualityGrade (`GRADE_A`), ApprovedAmount.
- `Payment`: ID, ProcurementID, BookingID, FarmerID, TotalAmount, Status (`PENDING`, `PROCESSING`, `PAID`), TransactionRef.
- `Notification`: ID, FarmerID, Title_EN, Title_KN, Title_HI, Message_EN, Message_KN, Message_HI, Type.

---

## 🔌 Core API Endpoints

### Farmer & Auth
- `POST /api/auth/register` - Farmer registration with language preference.
- `GET /api/farmers/{id}/bookings` - List farmer's active digital tokens & bookings.

### Crops & MSP Rates
- `GET /api/crops/categories` - List crop categories.
- `GET /api/crops` - List crops with current official MSP rate per quintal.

### Centres & Overload Detection
- `GET /api/centres/eligible?crop_id={id}` - List eligible centres with crowd status (GREEN, YELLOW, RED), distance, queue length, estimated wait time, and smart reroute recommendations.
- `GET /api/centres/{id}/slots` - Get available time slots & capacity status.

### Booking & Recovery
- `POST /api/bookings/create` - Book time slot & generate digital token QR.
- `POST /api/bookings/delay` - Report slot delay & obtain recovered slot time.

### Officer & Queue Operations
- `POST /api/queue/checkin?token_number={num}` - QR code token scanner & arrival check-in.
- `POST /api/procurement/update` - Record crop weight, moisture %, quality grade, and calculate approved payout.
- `POST /api/payments/status` - Transition payment status (`PENDING` → `PROCESSING` → `PAID`).

### Multilingual Voice Bot & Admin
- `POST /api/voice/query` - Multilingual NLU intent processor for Kannada, English, Hindi voice queries.
- `GET /api/admin/dashboard_stats` - DoCA central analytics stats & centre overload metrics.
- `POST /api/admin/update_msp` - Update official MSP rate per quintal.

---

## 🛠️ Setup & Local Execution Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ & NPM

### Step 1: Start FastAPI Backend
```bash
cd backend
python run.py
```
> Backend runs on `http://127.0.0.1:8000`. Interactive API documentation (Swagger) is available at `http://127.0.0.1:8000/docs`.

### Step 2: Start Vite React Frontend
```bash
cd frontend
npm install
npx vite --port 5173
```
> App opens on `http://localhost:5173`.

---

## 🏆 SIH Presentation Guided Walkthrough

Use the floating **SIH DEMO RUNNER** bar at the bottom of the screen to execute the complete presentation flow:

1. **Farmer Registration in Kannada**: Ninge Gowda registers with Kannada language selection.
2. **Crop Selection**: Selects **Food Grains → Ragi** (10 Quintals).
3. **MSP Lookup**: System shows official rate **₹3,846/quintal** (Value: **₹38,460**).
4. **Overloaded Centre Detection**: Mandya Centre (Centre A) is flagged as **RED (High Crowd)**.
5. **Smart Reroute**: System recommends Maddur Centre (Centre B) with short queue (**Saves 1 Hour**).
6. **Voice Slot Booking**: Farmer uses voice query `"ನನಗೆ ರಾಗಿ slot ಬೇಕು"` to book slot.
7. **Digital Token**: Generates token **`RAGI-2026-000184`** with scannable QR Code.
8. **Officer Check-In**: Officer scans token QR code at counter.
9. **Live Queue Tracking**: Farmer monitors Queue Position **#5** and 25 mins wait countdown.
10. **Weighing & Quality Verification**: Officer inputs 10 Quintals weight, Grade A quality.
11. **Payment Confirmation**: Payment status transitions from **PENDING → PROCESSING → PAID** (`PAY-2026-TXN-88219`).
12. **SMS Slot Recovery**: Demonstrates missed slot recovery via **"Report Delay"** button and feature phone **SMS reply "1"**.

---

## 🔮 Future Scope & Scalability

- **PM-KISAN / AgriStack API Integration**: Direct Aadhaar/Land Record validation with state land registries.
- **IoT Smart Weighing Scale Integration**: Direct Bluetooth/Serial data ingestion from weighing machines at procurement counters.
- **WhatsApp Bot**: WhatsApp Business API integration for slot booking and digital token delivery over messaging.
- **UPI Instant Payout**: Direct NPCI DBT payment integration for instant bank account credit upon quality verification.
