from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class FarmerCreate(BaseModel):
    name: str
    mobile: str
    aadhaar_number: Optional[str] = None
    village: str
    district: str
    preferred_language: str = "kn"

class FarmerResponse(BaseModel):
    id: int
    farmer_ref_id: str
    name: str
    mobile: str
    village: str
    district: str
    preferred_language: str
    created_at: datetime

    class Config:
        from_attributes = True

class CropResponse(BaseModel):
    id: int
    category_id: int
    name_en: str
    name_kn: str
    name_hi: str
    code: str
    current_msp: Optional[float] = 0.0

    class Config:
        from_attributes = True

class CropCategoryResponse(BaseModel):
    id: int
    name_en: str
    name_kn: str
    name_hi: str
    crops: List[CropResponse] = []

    class Config:
        from_attributes = True

class CentreResponse(BaseModel):
    id: int
    name: str
    name_kn: str
    name_hi: str
    district: str
    location_address: str
    latitude: float
    longitude: float
    distance_km: Optional[float] = 0.0
    crowd_status: str
    current_queue_count: int = 0
    estimated_wait_minutes: int = 0
    available_slots_count: int = 0
    counters_count: int = 3
    supported_crops: List[str] = []

    class Config:
        from_attributes = True

class SlotResponse(BaseModel):
    id: int
    centre_id: int
    slot_date: str
    time_window: str
    max_farmers: int
    booked_count: int
    is_full: bool = False

    class Config:
        from_attributes = True

class SlotBookRequest(BaseModel):
    farmer_id: int
    crop_id: int
    centre_id: int
    slot_id: int
    quantity_quintals: float

class BookingResponse(BaseModel):
    id: int
    booking_ref: str
    farmer_id: int
    farmer_name: Optional[str] = None
    crop_name_en: Optional[str] = None
    crop_name_kn: Optional[str] = None
    crop_name_hi: Optional[str] = None
    centre_name: Optional[str] = None
    slot_date: Optional[str] = None
    time_window: Optional[str] = None
    quantity_quintals: float
    rate_per_quintal: float
    estimated_amount: float
    status: str
    token_number: Optional[str] = None
    qr_code_data: Optional[str] = None
    queue_position: Optional[int] = None
    estimated_wait_minutes: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DelayReportRequest(BaseModel):
    booking_id: int
    expected_arrival_time: str
    channel: str = "APP" # APP, SMS, GPS

class QueueProcessRequest(BaseModel):
    booking_id: int
    action: str # ARRIVE, START_WEIGHING, COMPLETE_WEIGHING, APPROVE_QUALITY, COMPLETE_PROCUREMENT, SKIP

class ProcurementUpdateRequest(BaseModel):
    booking_id: int
    actual_weight_quintals: float
    moisture_percentage: float = 12.0
    quality_grade: str = "GRADE_A"
    officer_remarks: Optional[str] = None

class PaymentStatusUpdateRequest(BaseModel):
    booking_id: int
    status: str # PROCESSING, PAID, FAILED
    transaction_ref: Optional[str] = None

class ChatbotRequest(BaseModel):
    farmer_id: Optional[int] = 1
    language: str = "kn"
    message: str

class ChatbotResponse(BaseModel):
    response_text: str
    action_taken: Optional[str] = None
    suggested_slots: List[dict] = []
    generated_token: Optional[dict] = None
