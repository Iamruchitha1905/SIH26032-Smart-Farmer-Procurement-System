import random
from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app.models import (
    Farmer, CropCategory, Crop, CropRate, ProcurementCentre, Slot,
    Booking, DigitalToken, QueueEntry, ProcurementRecord, Payment,
    Notification, DelayRequest, OfficerUser, AdminUser
)

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Seeding database with realistic SIH 2026 demo data...")

    # 1. Admin & Officer Users
    admin = AdminUser(username="admin", full_name="Dr. K. S. Murthy (Director, DoCA)")
    officer1 = OfficerUser(username="officer_mandya", full_name="Ramesh Kumar (Procurement Inspector)", centre_id=1)
    officer2 = OfficerUser(username="officer_maddur", full_name="Suresh Gowda (Centre Manager)", centre_id=2)
    db.add_all([admin, officer1, officer2])

    # 2. Crop Categories
    cat_food = CropCategory(name_en="Food Grains", name_kn="ಆಹಾರ ಧಾನ್ಯಗಳು", name_hi="खाद्यान्न")
    cat_pulses = CropCategory(name_en="Pulses", name_kn="ಬೇಳೆಕಾಳುಗಳು", name_hi="दलहन")
    cat_oil = CropCategory(name_en="Oilseeds", name_kn="ಎಣ್ಣೆಕಾಳುಗಳು", name_hi="तिलहन")
    cat_comm = CropCategory(name_en="Commercial Crops", name_kn="ವಾಣಿಜ್ಯ ಬೆಳೆಗಳು", name_hi="व्यावसायिक फसलें")
    db.add_all([cat_food, cat_pulses, cat_oil, cat_comm])
    db.commit()

    # 3. Crops & MSP Rates
    crops_data = [
        # Food Grains
        {"category_id": cat_food.id, "en": "Ragi", "kn": "ರಾಗಿ", "hi": "रागी", "code": "RAGI", "msp": 3846.0},
        {"category_id": cat_food.id, "en": "Paddy", "kn": "ಭತ್ತ", "hi": "धान", "code": "PADDY", "msp": 2183.0},
        {"category_id": cat_food.id, "en": "Wheat", "kn": "ಗೋಧಿ", "hi": "गेहूं", "code": "WHEAT", "msp": 2275.0},
        {"category_id": cat_food.id, "en": "Maize", "kn": "ಮೆಕ್ಕೆಜೋಳ", "hi": "मक्का", "code": "MAIZE", "msp": 2090.0},
        {"category_id": cat_food.id, "en": "Jowar", "kn": "ಜೋಳ", "hi": "ज्वार", "code": "JOWAR", "msp": 3180.0},

        # Pulses
        {"category_id": cat_pulses.id, "en": "Toor (Arhar)", "kn": "ತೊಗರಿ", "hi": "तूर (अरहर)", "code": "TOOR", "msp": 7000.0},
        {"category_id": cat_pulses.id, "en": "Gram (Chana)", "kn": "ಕಡಲೆ", "hi": "चना", "code": "GRAM", "msp": 5440.0},
        {"category_id": cat_pulses.id, "en": "Green Gram", "kn": "ಹೆಸರು ಕಾಳು", "hi": "मूंग", "code": "GREENGRAM", "msp": 8558.0},
        {"category_id": cat_pulses.id, "en": "Black Gram", "kn": "ಉದ್ದು", "hi": "उड़द", "code": "BLACKGRAM", "msp": 6950.0},

        # Oilseeds
        {"category_id": cat_oil.id, "en": "Groundnut", "kn": "ಕಡಲೆಕಾಯಿ", "hi": "मूंगफली", "code": "GROUNDNUT", "msp": 6377.0},
        {"category_id": cat_oil.id, "en": "Sunflower", "kn": "ಸೂರ್ಯಕಾಂತಿ", "hi": "सूरजमुखी", "code": "SUNFLOWER", "msp": 6760.0},
        {"category_id": cat_oil.id, "en": "Soybean", "kn": "ಸೋಯಾಬೀನ್", "hi": "सोयाबीन", "code": "SOYBEAN", "msp": 4600.0},
        {"category_id": cat_oil.id, "en": "Mustard", "kn": "ಸಾಸಿವೆ", "hi": "सरसों", "code": "MUSTARD", "msp": 5650.0},

        # Commercial
        {"category_id": cat_comm.id, "en": "Cotton", "kn": "ಹತ್ತಿ", "hi": "कपास", "code": "COTTON", "msp": 6620.0},
        {"category_id": cat_comm.id, "en": "Copra", "kn": "ಕೊಬ್ಬರಿ", "hi": "सूखा नारियल", "code": "COPRA", "msp": 11750.0},
        {"category_id": cat_comm.id, "en": "Sugarcane", "kn": "ಕಬ್ಬು", "hi": "गन्ना", "code": "SUGARCANE", "msp": 315.0},
    ]

    crop_objects = {}
    for c_info in crops_data:
        crop_obj = Crop(
            category_id=c_info["category_id"],
            name_en=c_info["en"],
            name_kn=c_info["kn"],
            name_hi=c_info["hi"],
            code=c_info["code"]
        )
        db.add(crop_obj)
        db.commit()
        db.refresh(crop_obj)

        rate_obj = CropRate(
            crop_id=crop_obj.id,
            msp_rate_per_quintal=c_info["msp"],
            currency="₹",
            is_current=True
        )
        db.add(rate_obj)
        crop_objects[c_info["code"]] = crop_obj

    db.commit()

    # 4. Procurement Centres
    centres_data = [
        {
            "name": "Mandya Main APMC Procurement Centre (Centre A)",
            "name_kn": "ಮಂಡ್ಯ ಮುಖ್ಯ ಎಪಿಎಂಸಿ ಖರೀದಿ ಕೇಂದ್ರ (ಸೆಂಟರ್ ಎ)",
            "name_hi": "मंड्या मुख्य एपीएमसी खरीद केंद्र (केंद्र ए)",
            "district": "Mandya",
            "location_address": "APMC Yard, Bangalore-Mysore Road, Mandya",
            "lat": 12.5218,
            "lng": 76.8951,
            "max_daily": 600.0,
            "counters": 3,
            "avg_min": 6.0,
            "status": "RED" # Overloaded centre for demo scenario
        },
        {
            "name": "Maddur Grain Storage Centre (Centre B)",
            "name_kn": "ಮದ್ದೂರು ಧಾನ್ಯ ಸಂಗ್ರಹಣಾ ಕೇಂದ್ರ (ಸೆಂಟರ್ ಬಿ)",
            "name_hi": "मद्दूर अनाज भंडारण केंद्र (केंद्र बी)",
            "district": "Mandya",
            "location_address": "Station Road, Near Railway Station, Maddur",
            "lat": 12.5847,
            "lng": 77.0441,
            "max_daily": 500.0,
            "counters": 4,
            "avg_min": 5.0,
            "status": "GREEN" # Recommended alternative
        },
        {
            "name": "Mysuru Central Farmers Warehouse",
            "name_kn": "ಮೈಸೂರು ಕೇಂದ್ರ ರೈತರ ಉಗ್ರಾಣ",
            "name_hi": "मैसूर सेंट्रल किसान गोदाम",
            "district": "Mysuru",
            "location_address": "Bannur Road, Near Ring Road Junction, Mysuru",
            "lat": 12.3118,
            "lng": 76.6784,
            "max_daily": 800.0,
            "counters": 5,
            "avg_min": 4.5,
            "status": "YELLOW"
        },
        {
            "name": "Hassan Food Corporation Mandi",
            "name_kn": "ಹಾಸನ ಆಹಾರ ನಿಗಮ ಮಂಡಿ",
            "name_hi": "हाफस खाद्य निगम मंडी",
            "district": "Hassan",
            "location_address": "Industrial Area, BM Road, Hassan",
            "lat": 13.0047,
            "lng": 76.1026,
            "max_daily": 450.0,
            "counters": 3,
            "avg_min": 6.5,
            "status": "GREEN"
        },
        {
            "name": "Tumakuru Co-Op Procurement Hub",
            "name_kn": "ತುಮಕೂರು ಸಹಕಾರ ಖರೀದಿ ಹಬ್",
            "name_hi": "तुमकुरु सहकारी खरीद हब",
            "district": "Tumakuru",
            "location_address": "BH Road, Opp KSRTC Bus Stand, Tumakuru",
            "lat": 13.3379,
            "lng": 77.1006,
            "max_daily": 550.0,
            "counters": 4,
            "avg_min": 5.5,
            "status": "GREEN"
        }
    ]

    centre_objects = []
    for c in centres_data:
        p_centre = ProcurementCentre(
            name=c["name"],
            name_kn=c["name_kn"],
            name_hi=c["name_hi"],
            district=c["district"],
            location_address=c["location_address"],
            latitude=c["lat"],
            longitude=c["lng"],
            max_daily_capacity_quintals=c["max_daily"],
            counters_count=c["counters"],
            avg_processing_minutes=c["avg_min"],
            crowd_status=c["status"]
        )
        db.add(p_centre)
        db.commit()
        db.refresh(p_centre)
        centre_objects.append(p_centre)

    # 5. Slots Creation
    today_str = datetime.now().strftime("%Y-%m-%d")
    tomorrow_str = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

    time_windows = [
        "09:00 AM - 10:00 AM",
        "10:00 AM - 11:00 AM",
        "11:00 AM - 12:00 PM",
        "01:00 PM - 02:00 PM",
        "02:00 PM - 03:00 PM",
        "03:00 PM - 04:00 PM"
    ]

    slot_objects = []
    for centre in centre_objects:
        for day in [today_str, tomorrow_str]:
            for idx, tw in enumerate(time_windows):
                # For Centre A (Mandya - Overloaded demo), make early slots FULL
                if centre.id == 1 and idx < 3 and day == today_str:
                    booked = 10
                elif centre.id == 1 and idx == 3 and day == today_str:
                    booked = 8
                else:
                    booked = random.randint(1, 4)

                slot = Slot(
                    centre_id=centre.id,
                    slot_date=day,
                    time_window=tw,
                    max_farmers=10,
                    booked_count=booked
                )
                db.add(slot)
                db.commit()
                db.refresh(slot)
                slot_objects.append(slot)

    # 6. Seed 20 Farmers
    farmer_names = [
        ("Ninge Gowda", "ನಿಂಗೇಗೌಡ", "ನಿಂಗೇಗೌಡ", "Kirimanjeshwara", "Mandya", "kn"),
        ("Kempe Gowda", "ಕೆಂಪೇಗೌಡ", "कैंपेगोड़ा", "Gejjalagere", "Mandya", "kn"),
        ("Ramesh Kumar", "ರಮೇಶ್ ಕುಮಾರ್", "रमेश कुमार", "Induvalu", "Mandya", "kn"),
        ("Siddaraju B.", "ಸಿದ್ಧರಾಜು ಬಿ.", "सिद्दराजू बी.", "Kottathi", "Mandya", "kn"),
        ("Basavaraju M.", "ಬಸವರಾಜು ಎಂ.", "बसंवराजू एम.", "Kesturu", "Mandya", "kn"),
        ("Rajesh Gowda", "ರಾಜೇಶ್ ಗೌಡ", "राजेश गौड़ा", "Besagarahalli", "Mandya", "kn"),
        ("Anil Kumar", "ಅನಿಲ್ ಕುಮಾರ್", "अनिल कुमार", "Maddur", "Mandya", "kn"),
        ("Shivarame Gowda", "ಶಿವರಾಮೇಗೌಡ", "शिवरामे गौड़ा", "Koppa", "Mandya", "kn"),
        ("Manjunath K.", "ಮಂಜುನಾಥ್ ಕೆ.", "मंजूनाथ के.", "Srirangapatna", "Mandya", "kn"),
        ("Channappa S.", "ಚನ್ನಪ್ಪ ಎಸ್.", "चन्नप्पा एस.", "Pandavapura", "Mandya", "kn"),
        ("Lakshmana Swamy", "ಲಕ್ಷ್ಮಣ ಸ್ವಾಮಿ", "लक्ष्मण स्वामी", "Nanjangud", "Mysuru", "kn"),
        ("Mahadevaswamy", "ಮಹದೇವಸ್ವಾಮಿ", "महादेवस्वामी", "T. Narasipura", "Mysuru", "kn"),
        ("Putte Gowda", "ಪುಟ್ಟೇಗೌಡ", "पुट्टेगोड़ा", "Bannur", "Mysuru", "kn"),
        ("Venkatesh Murthy", "ವೆಂಕಟೇಶ್ ಮೂರ್ತಿ", "वेनकटेश मूर्ति", "Holenarsipura", "Hassan", "kn"),
        ("Kumaraswamy H.", "ಕುಮಾರಸ್ವಾಮಿ ಎಚ್.", "कुमारस्वामी एच.", "Channarayapatna", "Hassan", "kn"),
        ("Ravindra Sharma", "Ravindra Sharma", "रवींद्र शर्मा", "Gubbi", "Tumakuru", "hi"),
        ("Sunil Patel", "Sunil Patel", "सुनील पटेल", "Kunigal", "Tumakuru", "hi"),
        ("Vijay Singh", "Vijay Singh", "विजय सिंह", "Tiptur", "Tumakuru", "hi"),
        ("David Fernandez", "David Fernandez", "डेविड फर्नांडीज", "Sira", "Tumakuru", "en"),
        ("Prabhu Dayal", "Prabhu Dayal", "प्रभु दयाल", "Madhugiri", "Tumakuru", "hi")
    ]

    farmer_objects = []
    for idx, (en, kn, hi, vill, dist, lang) in enumerate(farmer_names, 1):
        f = Farmer(
            farmer_ref_id=f"KA-FARM-2026-{1000+idx}",
            name=en,
            mobile=f"98450{10000+idx}",
            aadhaar_number=f"4589 1234 {2000+idx}",
            village=vill,
            district=dist,
            preferred_language=lang,
            is_verified=True
        )
        db.add(f)
        db.commit()
        db.refresh(f)
        farmer_objects.append(f)

    # 7. Seed Bookings, Digital Tokens, Queue & Payments
    ragi_crop = crop_objects["RAGI"]
    mandya_centre = centre_objects[0] # Centre A
    maddur_centre = centre_objects[1] # Centre B

    # Hero SIH Scenario Farmer: Ninge Gowda (Farmer 1)
    hero_farmer = farmer_objects[0]
    hero_slot = slot_objects[0] # Today 09:00 AM - 10:00 AM at Mandya

    hero_booking = Booking(
        booking_ref="BK-2026-9001",
        farmer_id=hero_farmer.id,
        crop_id=ragi_crop.id,
        centre_id=mandya_centre.id,
        slot_id=hero_slot.id,
        quantity_quintals=10.0,
        rate_per_quintal=3846.0,
        estimated_amount=38460.0,
        status="ARRIVED"
    )
    db.add(hero_booking)
    db.commit()
    db.refresh(hero_booking)

    token_number = "RAGI-2026-000184"
    qr_data = f"TOKEN:{token_number}|FARMER:{hero_farmer.name}|CROP:Ragi|QTY:10|CENTRE:{mandya_centre.name}"

    hero_token = DigitalToken(
        token_number=token_number,
        booking_id=hero_booking.id,
        qr_code_data=qr_data
    )
    db.add(hero_token)

    hero_queue = QueueEntry(
        centre_id=mandya_centre.id,
        booking_id=hero_booking.id,
        token_number=token_number,
        queue_position=5,
        status="WAITING",
        checked_in_at=datetime.utcnow() - timedelta(minutes=15)
    )
    db.add(hero_queue)

    hero_procurement = ProcurementRecord(
        procurement_ref="PROC-2026-00125",
        booking_id=hero_booking.id,
        actual_weight_quintals=10.0,
        moisture_percentage=11.5,
        quality_grade="GRADE_A",
        approved_amount=38460.0
    )
    db.add(hero_procurement)
    db.commit()
    db.refresh(hero_procurement)

    hero_payment = Payment(
        procurement_id=hero_procurement.id,
        booking_id=hero_booking.id,
        farmer_id=hero_farmer.id,
        total_amount=38460.0,
        status="PROCESSING",
        transaction_ref="PAY-2026-TXN-88219",
        payment_date=None
    )
    db.add(hero_payment)

    # Notifications for Hero Farmer
    notif1 = Notification(
        farmer_id=hero_farmer.id,
        title_en="Slot Booking Confirmed!",
        title_kn="ಸ್ಲಾಟ್ ಬುಕಿಂಗ್ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟಿದೆ!",
        title_hi="स्लॉट बुकिंग की पुष्टि हुई!",
        message_en="Your Ragi procurement slot is booked at Mandya Centre. Token: RAGI-2026-000184.",
        message_kn="ಮಂಡ್ಯ ಕೇಂದ್ರದಲ್ಲಿ ನಿಮ್ಮ ರಾಗಿ ಖರೀದಿ ಸ್ಲಾಟ್ ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ. ಟೋಕನ್: RAGI-2026-000184.",
        message_hi="मंड्या केंद्र पर आपकी रागी खरीद स्लॉट बुक हो गई है। टोकन: RAGI-2026-000184.",
        type="SLOT_BOOKED"
    )
    notif2 = Notification(
        farmer_id=hero_farmer.id,
        title_en="Payment Processing",
        title_kn="ಪಾವತಿ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ",
        title_hi="भुगतान प्रक्रिया जारी है",
        message_en="Procurement PROC-2026-00125 approved. Payment of ₹38,460 is under processing.",
        message_kn="ಖರೀದಿ PROC-2026-00125 ಅನುಮೋದಿಸಲಾಗಿದೆ. ₹38,460 ರ ಪಾವತಿ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ.",
        message_hi="खरीद PROC-2026-00125 स्वीकृत। ₹38,460 का भुगतान प्रक्रिया में है।",
        type="PAYMENT"
    )
    db.add_all([notif1, notif2])

    # Add 15 other queue entries for Mandya Centre to show live crowd
    for i in range(1, 15):
        other_f = farmer_objects[i]
        b = Booking(
            booking_ref=f"BK-2026-90{i+1:02d}",
            farmer_id=other_f.id,
            crop_id=ragi_crop.id,
            centre_id=mandya_centre.id,
            slot_id=hero_slot.id,
            quantity_quintals=random.choice([8.0, 10.0, 12.0, 15.0]),
            rate_per_quintal=3846.0,
            estimated_amount=3846.0 * 10,
            status="ARRIVED" if i < 8 else "BOOKED"
        )
        db.add(b)
        db.commit()
        db.refresh(b)

        t_num = f"RAGI-2026-000{200+i}"
        dt = DigitalToken(
            token_number=t_num,
            booking_id=b.id,
            qr_code_data=f"TOKEN:{t_num}|FARMER:{other_f.name}"
        )
        db.add(dt)

        qe = QueueEntry(
            centre_id=mandya_centre.id,
            booking_id=b.id,
            token_number=t_num,
            queue_position=i,
            status="WAITING"
        )
        db.add(qe)

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
