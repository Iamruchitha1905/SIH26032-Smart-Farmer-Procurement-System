from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    farmer_ref_id = Column(String(50), unique=True, index=True) # e.g. KA-FARM-2026-0891
    name = Column(String(100), nullable=False)
    mobile = Column(String(15), unique=True, index=True, nullable=False)
    aadhaar_number = Column(String(20), nullable=True) # Encrypted / masked where appropriate
    village = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    preferred_language = Column(String(10), default="kn") # kn, en, hi
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    bookings = relationship("Booking", back_populates="farmer")
    notifications = relationship("Notification", back_populates="farmer")

class CropCategory(Base):
    __tablename__ = "crop_categories"

    id = Column(Integer, primary_key=True, index=True)
    name_en = Column(String(50), nullable=False)
    name_kn = Column(String(50), nullable=False)
    name_hi = Column(String(50), nullable=False)

    crops = relationship("Crop", back_populates="category")

class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("crop_categories.id"))
    name_en = Column(String(50), nullable=False)
    name_kn = Column(String(50), nullable=False)
    name_hi = Column(String(50), nullable=False)
    code = Column(String(20), unique=True) # e.g. RAGI, PADDY, WHEAT

    category = relationship("CropCategory", back_populates="crops")
    rates = relationship("CropRate", back_populates="crop")

class CropRate(Base):
    __tablename__ = "crop_rates"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"))
    msp_rate_per_quintal = Column(Float, nullable=False) # In INR
    currency = Column(String(10), default="₹")
    effective_from = Column(DateTime, default=datetime.utcnow)
    is_current = Column(Boolean, default=True)

    crop = relationship("Crop", back_populates="rates")

class ProcurementCentre(Base):
    __tablename__ = "procurement_centres"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    name_kn = Column(String(100), nullable=False)
    name_hi = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    location_address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    max_daily_capacity_quintals = Column(Float, default=500.0)
    counters_count = Column(Integer, default=3)
    avg_processing_minutes = Column(Float, default=6.0) # avg min per farmer
    crowd_status = Column(String(20), default="GREEN") # GREEN, YELLOW, RED
    operating_hours = Column(String(50), default="08:00 AM - 05:00 PM")

    slots = relationship("Slot", back_populates="centre")
    officers = relationship("OfficerUser", back_populates="centre")

class Slot(Base):
    __tablename__ = "slots"

    id = Column(Integer, primary_key=True, index=True)
    centre_id = Column(Integer, ForeignKey("procurement_centres.id"))
    slot_date = Column(String(20), nullable=False) # YYYY-MM-DD
    time_window = Column(String(50), nullable=False) # e.g., "09:00 AM - 10:00 AM"
    max_farmers = Column(Integer, default=10)
    booked_count = Column(Integer, default=0)

    centre = relationship("ProcurementCentre", back_populates="slots")
    bookings = relationship("Booking", back_populates="slot")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_ref = Column(String(50), unique=True, index=True) # e.g. BK-2026-9021
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    crop_id = Column(Integer, ForeignKey("crops.id"))
    centre_id = Column(Integer, ForeignKey("procurement_centres.id"))
    slot_id = Column(Integer, ForeignKey("slots.id"))
    quantity_quintals = Column(Float, nullable=False)
    rate_per_quintal = Column(Float, nullable=False)
    estimated_amount = Column(Float, nullable=False)
    status = Column(String(30), default="BOOKED") # BOOKED, ARRIVED, WEIGHING, QUALITY_CHECKED, APPROVED, COMPLETED, DELAYED, MISSED, CANCELLED
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("Farmer", back_populates="bookings")
    crop = relationship("Crop")
    centre = relationship("ProcurementCentre")
    slot = relationship("Slot", back_populates="bookings")
    token = relationship("DigitalToken", back_populates="booking", uselist=False)
    queue_entry = relationship("QueueEntry", back_populates="booking", uselist=False)
    procurement_record = relationship("ProcurementRecord", back_populates="booking", uselist=False)
    payment = relationship("Payment", back_populates="booking", uselist=False)

class DigitalToken(Base):
    __tablename__ = "digital_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token_number = Column(String(50), unique=True, index=True) # e.g. RAGI-2026-000184
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True)
    qr_code_data = Column(Text, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="token")

class QueueEntry(Base):
    __tablename__ = "queue_entries"

    id = Column(Integer, primary_key=True, index=True)
    centre_id = Column(Integer, ForeignKey("procurement_centres.id"))
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True)
    token_number = Column(String(50), nullable=False)
    queue_position = Column(Integer, default=1)
    status = Column(String(30), default="WAITING") # WAITING, IN_SERVICE, COMPLETED, SKIPPED, DELAYED
    checked_in_at = Column(DateTime, nullable=True)
    called_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    booking = relationship("Booking", back_populates="queue_entry")

class ProcurementRecord(Base):
    __tablename__ = "procurement_records"

    id = Column(Integer, primary_key=True, index=True)
    procurement_ref = Column(String(50), unique=True, index=True) # e.g. PROC-2026-00125
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True)
    actual_weight_quintals = Column(Float, nullable=False)
    moisture_percentage = Column(Float, default=12.0)
    quality_grade = Column(String(20), default="GRADE_A") # GRADE_A, GRADE_B, REJECTED
    officer_remarks = Column(Text, nullable=True)
    verified_by_officer = Column(String(100), default="Officer Ramesh Kumar")
    approved_amount = Column(Float, nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="procurement_record")
    payment = relationship("Payment", back_populates="procurement_record", uselist=False)

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    procurement_id = Column(Integer, ForeignKey("procurement_records.id"), unique=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    total_amount = Column(Float, nullable=False)
    status = Column(String(20), default="PENDING") # PENDING, PROCESSING, PAID, FAILED
    transaction_ref = Column(String(100), nullable=True)
    payment_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="payment")
    procurement_record = relationship("ProcurementRecord", back_populates="payment")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    title_en = Column(String(150), nullable=False)
    title_kn = Column(String(150), nullable=False)
    title_hi = Column(String(150), nullable=False)
    message_en = Column(Text, nullable=False)
    message_kn = Column(Text, nullable=False)
    message_hi = Column(Text, nullable=False)
    type = Column(String(50), default="SYSTEM") # SLOT_BOOKED, QUEUE_UPDATE, DELAY, PAYMENT
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("Farmer", back_populates="notifications")

class DelayRequest(Base):
    __tablename__ = "delay_requests"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    original_slot_time = Column(String(50), nullable=False)
    expected_arrival_time = Column(String(50), nullable=False)
    recovered_slot_id = Column(Integer, ForeignKey("slots.id"), nullable=True)
    recovered_slot_time = Column(String(50), nullable=True)
    channel = Column(String(20), default="APP") # APP, SMS, GPS
    requested_at = Column(DateTime, default=datetime.utcnow)

class OfficerUser(Base):
    __tablename__ = "officer_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    full_name = Column(String(100), nullable=False)
    centre_id = Column(Integer, ForeignKey("procurement_centres.id"))
    role = Column(String(30), default="PROCUREMENT_OFFICER")

    centre = relationship("ProcurementCentre", back_populates="officers")

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    full_name = Column(String(100), nullable=False)
    department = Column(String(100), default="Department of Consumer Affairs (DoCA)")
    role = Column(String(30), default="ADMIN")

class ChatbotInteraction(Base):
    __tablename__ = "chatbot_interactions"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=True)
    language = Column(String(10), default="kn")
    user_query = Column(Text, nullable=False)
    bot_response = Column(Text, nullable=False)
    action_taken = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
