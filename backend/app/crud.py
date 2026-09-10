from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
from app.models import (
    Farmer, CropCategory, Crop, CropRate, ProcurementCentre, Slot,
    Booking, DigitalToken, QueueEntry, ProcurementRecord, Payment,
    Notification, DelayRequest, ChatbotInteraction
)
from app.ai_engine import AIEngine
from app.schemas import FarmerCreate

def get_farmer_by_mobile(db: Session, mobile: str):
    return db.query(Farmer).filter(Farmer.mobile == mobile).first()

def get_farmer_by_id(db: Session, farmer_id: int):
    return db.query(Farmer).filter(Farmer.id == farmer_id).first()

def create_farmer(db: Session, farmer_in: FarmerCreate):
    count = db.query(Farmer).count()
    farmer_ref = f"KA-FARM-2026-{1000 + count + 1}"
    farmer = Farmer(
        farmer_ref_id=farmer_ref,
        name=farmer_in.name,
        mobile=farmer_in.mobile,
        aadhaar_number=farmer_in.aadhaar_number,
        village=farmer_in.village,
        district=farmer_in.district,
        preferred_language=farmer_in.preferred_language
    )
    db.add(farmer)
    db.commit()
    db.refresh(farmer)

    # Welcome Notification
    notif = Notification(
        farmer_id=farmer.id,
        title_en="Registration Successful!",
        title_kn="ನಂದಾವಣೆ ಯಶಸ್ವಿಯಾಗಿದೆ!",
        title_hi="पंजीकरण सफल रहा!",
        message_en=f"Welcome {farmer.name}! Your Farmer ID is {farmer_ref}.",
        message_kn=f"ಸ್ವಾಗತ {farmer.name}! ನಿಮ್ಮ ರೈತ ಐಡಿ {farmer_ref}.",
        message_hi=f"स्वागत है {farmer.name}! आपकी किसान आईडी {farmer_ref} है।",
        type="REGISTRATION"
    )
    db.add(notif)
    db.commit()
    return farmer

def get_crop_categories(db: Session):
    return db.query(CropCategory).all()

def get_crops(db: Session, category_id: int = None):
    query = db.query(Crop)
    if category_id:
        query = query.filter(Crop.category_id == category_id)
    crops = query.all()

    # Attach current MSP
    result = []
    for c in crops:
        rate = db.query(CropRate).filter(CropRate.crop_id == c.id, CropRate.is_current == True).first()
        msp = rate.msp_rate_per_quintal if rate else 0.0
        result.append({
            "id": c.id,
            "category_id": c.category_id,
            "name_en": c.name_en,
            "name_kn": c.name_kn,
            "name_hi": c.name_hi,
            "code": c.code,
            "current_msp": msp
        })
    return result

def get_eligible_centres(db: Session, crop_id: int, farmer_lat: float = 12.52, farmer_lng: float = 76.89):
    centres = db.query(ProcurementCentre).all()
    result = []

    for c in centres:
        # Calculate distance mock based on lat/lng difference
        dist_km = round(math_dist(farmer_lat, farmer_lng, c.latitude, c.longitude), 1)
        
        # Calculate current queue count
        queue_count = db.query(QueueEntry).filter(
            QueueEntry.centre_id == c.id,
            QueueEntry.status.in_(["WAITING", "IN_SERVICE"])
        ).count()

        wait_mins = AIEngine.predict_waiting_time(
            queue_length=queue_count,
            counters_count=c.counters_count,
            avg_processing_minutes=c.avg_processing_minutes
        )

        crowd_status = AIEngine.evaluate_centre_crowd_status(
            queue_length=queue_count,
            available_slots=10,
            capacity_ratio=queue_count / max(1, c.max_daily_capacity_quintals / 10)
        )

        result.append({
            "id": c.id,
            "name": c.name,
            "name_kn": c.name_kn,
            "name_hi": c.name_hi,
            "district": c.district,
            "location_address": c.location_address,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "distance_km": dist_km,
            "crowd_status": crowd_status,
            "current_queue_count": queue_count,
            "estimated_wait_minutes": wait_mins,
            "counters_count": c.counters_count,
            "supported_crops": ["Ragi", "Paddy", "Wheat", "Maize", "Toor"]
        })

    # Check if selected or first centre is RED overloaded
    recommendations = []
    if result:
        overloaded = [c for c in result if c["crowd_status"] == "RED"]
        if overloaded:
            recommendations = AIEngine.recommend_alternative_centres(result, overloaded[0]["id"])

    return {
        "centres": result,
        "overload_warning": len(recommendations) > 0,
        "recommended_alternatives": recommendations
    }

def math_dist(lat1, lon1, lat2, lon2):
    # Rough approximation for local demo distances in km
    return (((lat1 - lat2)**2 + (lon1 - lon2)**2) ** 0.5) * 111.0

def get_centre_slots(db: Session, centre_id: int, slot_date: str = None):
    if not slot_date:
        slot_date = datetime.now().strftime("%Y-%m-%d")

    slots = db.query(Slot).filter(Slot.centre_id == centre_id, Slot.slot_date == slot_date).all()
    result = []
    for s in slots:
        result.append({
            "id": s.id,
            "centre_id": s.centre_id,
            "slot_date": s.slot_date,
            "time_window": s.time_window,
            "max_farmers": s.max_farmers,
            "booked_count": s.booked_count,
            "is_full": s.booked_count >= s.max_farmers
        })
    return result

def create_booking(db: Session, farmer_id: int, crop_id: int, centre_id: int, slot_id: int, quantity: float):
    slot = db.query(Slot).filter(Slot.id == slot_id).first()
    if not slot or slot.booked_count >= slot.max_farmers:
        raise ValueError("Selected slot is FULL. Please choose another available slot.")

    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    rate = db.query(CropRate).filter(CropRate.crop_id == crop_id, CropRate.is_current == True).first()
    rate_val = rate.msp_rate_per_quintal if rate else 3846.0
    est_amount = rate_val * quantity

    # Increment slot count
    slot.booked_count += 1

    booking_count = db.query(Booking).count()
    booking_ref = f"BK-2026-{9000 + booking_count + 1}"

    booking = Booking(
        booking_ref=booking_ref,
        farmer_id=farmer_id,
        crop_id=crop_id,
        centre_id=centre_id,
        slot_id=slot_id,
        quantity_quintals=quantity,
        rate_per_quintal=rate_val,
        estimated_amount=est_amount,
        status="BOOKED"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Generate Digital Token & QR Code
    token_number = f"{crop.code if crop else 'CROP'}-2026-{184 + booking.id:06d}"
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    centre = db.query(ProcurementCentre).filter(ProcurementCentre.id == centre_id).first()

    qr_data = f"TOKEN:{token_number}|FARMER:{farmer.name if farmer else 'Farmer'}|CROP:{crop.name_en if crop else 'Crop'}|QTY:{quantity}|CENTRE:{centre.name if centre else 'Centre'}"

    token = DigitalToken(
        token_number=token_number,
        booking_id=booking.id,
        qr_code_data=qr_data
    )
    db.add(token)

    # Create Notification
    notif = Notification(
        farmer_id=farmer_id,
        title_en="Slot Booked Successfully!",
        title_kn="ಸ್ಲಾಟ್ ಯಶಸ್ವಿಯಾಗಿ ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ!",
        title_hi="स्लॉट सफलतापूर्वक बुक हो गया!",
        message_en=f"Your slot for {crop.name_en if crop else 'crop'} is booked. Token: {token_number}.",
        message_kn=f"{crop.name_kn if crop else 'ಬೆಳೆ'} ಗೆ ನಿಮ್ಮ ಸ್ಲಾಟ್ ಬುಕ್ ಆಗಿದೆ. ಟೋಕನ್: {token_number}.",
        message_hi=f"{crop.name_hi if crop else 'फसल'} के लिए आपका स्लॉट बुक हो गया है। टोकन: {token_number}।",
        type="SLOT_BOOKED"
    )
    db.add(notif)
    db.commit()

    return get_booking_details(db, booking.id)

def get_booking_details(db: Session, booking_id: int):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        return None

    farmer = db.query(Farmer).filter(Farmer.id == b.farmer_id).first()
    crop = db.query(Crop).filter(Crop.id == b.crop_id).first()
    centre = db.query(ProcurementCentre).filter(ProcurementCentre.id == b.centre_id).first()
    slot = db.query(Slot).filter(Slot.id == b.slot_id).first()
    token = db.query(DigitalToken).filter(DigitalToken.booking_id == b.id).first()
    queue = db.query(QueueEntry).filter(QueueEntry.booking_id == b.id).first()

    queue_pos = queue.queue_position if queue else None
    wait_mins = None
    if queue_pos and centre:
        wait_mins = AIEngine.predict_waiting_time(queue_pos, centre.counters_count, centre.avg_processing_minutes)

    return {
        "id": b.id,
        "booking_ref": b.booking_ref,
        "farmer_id": b.farmer_id,
        "farmer_name": farmer.name if farmer else "Farmer",
        "crop_name_en": crop.name_en if crop else "Crop",
        "crop_name_kn": crop.name_kn if crop else "ಬೆಳೆ",
        "crop_name_hi": crop.name_hi if crop else "फसल",
        "centre_name": centre.name if centre else "Procurement Centre",
        "slot_date": slot.slot_date if slot else "Today",
        "time_window": slot.time_window if slot else "09:00 AM - 10:00 AM",
        "quantity_quintals": b.quantity_quintals,
        "rate_per_quintal": b.rate_per_quintal,
        "estimated_amount": b.estimated_amount,
        "status": b.status,
        "token_number": token.token_number if token else f"RAGI-2026-{184+b.id:06d}",
        "qr_code_data": token.qr_code_data if token else "TOKEN_QR_DATA",
        "queue_position": queue_pos,
        "estimated_wait_minutes": wait_mins,
        "created_at": b.created_at
    }

def check_in_farmer(db: Session, token_number: str):
    token = db.query(DigitalToken).filter(DigitalToken.token_number == token_number).first()
    if not token:
        # Fallback search by booking id
        token = db.query(DigitalToken).first()

    booking = db.query(Booking).filter(Booking.id == token.booking_id).first()
    if not booking:
        raise ValueError("Invalid Token Number")

    booking.status = "ARRIVED"

    # Assign queue entry if not existing
    queue = db.query(QueueEntry).filter(QueueEntry.booking_id == booking.id).first()
    if not queue:
        existing_count = db.query(QueueEntry).filter(
            QueueEntry.centre_id == booking.centre_id,
            QueueEntry.status.in_(["WAITING", "IN_SERVICE"])
        ).count()
        queue = QueueEntry(
            centre_id=booking.centre_id,
            booking_id=booking.id,
            token_number=token.token_number,
            queue_position=existing_count + 1,
            status="WAITING",
            checked_in_at=datetime.utcnow()
        )
        db.add(queue)

    db.commit()
    return get_booking_details(db, booking.id)

def handle_delay_request(db: Session, booking_id: int, expected_arrival_time: str, channel: str = "APP"):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise ValueError("Booking not found")

    booking.status = "DELAYED"
    
    # Recover new slot (e.g. next time slot)
    next_slot = db.query(Slot).filter(
        Slot.centre_id == booking.centre_id,
        Slot.booked_count < Slot.max_farmers
    ).first()

    recovered_time = next_slot.time_window if next_slot else "11:30 AM - 12:30 PM"
    if next_slot:
        next_slot.booked_count += 1
        booking.slot_id = next_slot.id

    delay_req = DelayRequest(
        booking_id=booking.id,
        original_slot_time="10:00 AM",
        expected_arrival_time=expected_arrival_time,
        recovered_slot_id=next_slot.id if next_slot else None,
        recovered_slot_time=recovered_time,
        channel=channel
    )
    db.add(delay_req)

    # Notification
    notif = Notification(
        farmer_id=booking.farmer_id,
        title_en="Slot Recovered!",
        title_kn="ಸ್ಲಾಟ್ ಚೇತರಿಸಿಕೊಳ್ಳಲಾಗಿದೆ!",
        title_hi="स्लॉट रिकवर हो गया!",
        message_en=f"Delay recorded. Your recovered slot is {recovered_time}.",
        message_kn=f"ವಿಳಂಬ ದಾಖಲಾಗಿದೆ. ನಿಮ್ಮ ಹೊಸ ಕಾಯ್ದಿರಿಸಿದ ಸ್ಲಾಟ್ {recovered_time}.",
        message_hi=f"देरी दर्ज की गई। आपका नया स्लॉट {recovered_time} है।",
        type="DELAY_RECOVERY"
    )
    db.add(notif)
    db.commit()

    return {
        "booking_id": booking.id,
        "status": "DELAYED_RECOVERED",
        "original_slot_time": "10:00 AM",
        "recovered_slot_time": recovered_time,
        "message_en": f"Your original slot was 10:00 AM. Delay reported via {channel}. Your recovered slot is {recovered_time}."
    }

def update_procurement_and_payment(db: Session, booking_id: int, actual_weight: float, quality_grade: str, officer_remarks: str = ""):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise ValueError("Booking not found")

    booking.status = "APPROVED"

    # Procurement Record
    proc_count = db.query(ProcurementRecord).count()
    proc_ref = f"PROC-2026-{100 + proc_count + 1:05d}"
    amount = actual_weight * booking.rate_per_quintal

    proc = db.query(ProcurementRecord).filter(ProcurementRecord.booking_id == booking.id).first()
    if not proc:
        proc = ProcurementRecord(
            procurement_ref=proc_ref,
            booking_id=booking.id,
            actual_weight_quintals=actual_weight,
            moisture_percentage=11.5,
            quality_grade=quality_grade,
            officer_remarks=officer_remarks,
            approved_amount=amount
        )
        db.add(proc)
        db.commit()
        db.refresh(proc)

    # Payment Entry
    pay = db.query(Payment).filter(Payment.booking_id == booking.id).first()
    if not pay:
        pay = Payment(
            procurement_id=proc.id,
            booking_id=booking.id,
            farmer_id=booking.farmer_id,
            total_amount=amount,
            status="PROCESSING",
            transaction_ref=f"PAY-2026-TXN-{random.randint(10000, 99999)}"
        )
        db.add(pay)
        db.commit()

    return {
        "procurement_ref": proc.procurement_ref,
        "booking_id": booking.id,
        "actual_weight_quintals": actual_weight,
        "quality_grade": quality_grade,
        "approved_amount": amount,
        "payment_status": pay.status,
        "transaction_ref": pay.transaction_ref
    }

def set_payment_status(db: Session, booking_id: int, status: str, txn_ref: str = None):
    pay = db.query(Payment).filter(Payment.booking_id == booking_id).first()
    if not pay:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        proc = db.query(ProcurementRecord).filter(ProcurementRecord.booking_id == booking_id).first()
        pay = Payment(
            procurement_id=proc.id if proc else 1,
            booking_id=booking_id,
            farmer_id=booking.farmer_id if booking else 1,
            total_amount=booking.estimated_amount if booking else 38460.0,
            status=status,
            transaction_ref=txn_ref or f"PAY-2026-TXN-{random.randint(10000, 99999)}"
        )
        db.add(pay)

    pay.status = status
    if txn_ref:
        pay.transaction_ref = txn_ref
    if status == "PAID":
        pay.payment_date = datetime.utcnow()

    # Update Booking Status
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if b and status == "PAID":
        b.status = "COMPLETED"

    # Notification
    notif = Notification(
        farmer_id=pay.farmer_id,
        title_en=f"Payment Status: {status}!",
        title_kn=f"ಪಾವತಿ ಸ್ಥಿತಿ: {status}!",
        title_hi=f"भुगतान की स्थिति: {status}!",
        message_en=f"Your payment of ₹{pay.total_amount:,.2f} status is now {status}. Ref: {pay.transaction_ref}.",
        message_kn=f"ನಿಮ್ಮ ₹{pay.total_amount:,.2f} ಪಾವತಿಯ ಸ್ಥಿತಿ {status} ಆಗಿದೆ. ಉಲ್ಲೇಖ: {pay.transaction_ref}.",
        message_hi=f"आपकी ₹{pay.total_amount:,.2f} की भुगतान स्थिति अब {status} है। संदर्भ: {pay.transaction_ref}।",
        type="PAYMENT"
    )
    db.add(notif)
    db.commit()

    return {
        "booking_id": booking_id,
        "payment_status": pay.status,
        "total_amount": pay.total_amount,
        "transaction_ref": pay.transaction_ref,
        "payment_date": pay.payment_date
    }
