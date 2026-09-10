import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import TokenCard from "../components/TokenCard";
import DelayRecoveryModal from "../components/DelayRecoveryModal";
import SmsSimulator from "../components/SmsSimulator";
import {
  Wheat, PlusCircle, CheckCircle, Clock, Award, CreditCard,
  MapPin, Bell, AlertTriangle, ShieldCheck, Calculator, ArrowRight, UserPlus, X
} from "lucide-react";

export default function FarmerPortal({ activeDemoStep }) {
  const { t, language, setLanguage } = useLanguage();
  const { farmer, setFarmer } = useAuth();

  const [activeTab, setActiveTab] = useState("book"); // book, token, queue, msp, payment, notifs, sms
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Registration Form State
  const [regName, setRegName] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regAadhaar, setRegAadhaar] = useState("");
  const [regVillage, setRegVillage] = useState("");
  const [regDistrict, setRegDistrict] = useState("Mandya");
  const [regLang, setRegLang] = useState("kn");
  const [regLoading, setRegLoading] = useState(false);

  // Booking & Crop State
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(1);
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [quantity, setQuantity] = useState(10);
  const [centres, setCentres] = useState([]);
  const [overloadInfo, setOverloadInfo] = useState({ warning: false, alternatives: [] });
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadCategories();
    loadFarmerBooking();
  }, [farmer]);

  const loadCategories = async () => {
    try {
      const data = await api.getCropCategories();
      setCategories(data);
      if (data.length > 0) loadCrops(data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCrops = async (catId) => {
    setSelectedCat(catId);
    try {
      const data = await api.getCrops(catId);
      setCrops(data);
      if (data.length > 0) selectCropItem(data[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const selectCropItem = async (crop) => {
    setSelectedCrop(crop);
    try {
      const centreData = await api.getEligibleCentres(crop.id);
      setCentres(centreData.centres);
      setOverloadInfo({
        warning: centreData.overload_warning,
        alternatives: centreData.recommended_alternatives
      });
      if (centreData.centres.length > 0) {
        selectCentreItem(centreData.centres[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectCentreItem = async (centre) => {
    setSelectedCentre(centre);
    try {
      const slotData = await api.getCentreSlots(centre.id);
      setSlots(slotData);
      const available = slotData.find((s) => !s.is_full);
      if (available) setSelectedSlot(available);
    } catch (err) {
      console.error(err);
    }
  };

  const loadFarmerBooking = async () => {
    try {
      const bookings = await api.getFarmerBookings(farmer.id);
      if (bookings.length > 0) {
        setActiveBooking(bookings[0]);
      } else {
        setActiveBooking(null);
      }
      const notifs = await api.getNotifications(farmer.id);
      setNotifications(notifs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName || !regMobile || !regVillage) {
      alert("Please fill in Name, Mobile number, and Village.");
      return;
    }
    setRegLoading(true);
    try {
      const newFarmer = await api.registerFarmer({
        name: regName,
        mobile: regMobile,
        aadhaar_number: regAadhaar,
        village: regVillage,
        district: regDistrict,
        preferred_language: regLang
      });
      setFarmer(newFarmer);
      setLanguage(regLang);
      setShowRegisterModal(false);
      alert(`Registration Successful! Welcome ${newFarmer.name}. Your Farmer ID is ${newFarmer.farmer_ref_id}`);
    } catch (err) {
      alert("Registration failed: " + err.message);
    } finally {
      setRegLoading(false);
    }
  };

  const handleBookSlotSubmit = async () => {
    if (!selectedCrop || !selectedCentre || !selectedSlot) return;
    try {
      const res = await api.bookSlot({
        farmer_id: farmer.id,
        crop_id: selectedCrop.id,
        centre_id: selectedCentre.id,
        slot_id: selectedSlot.id,
        quantity_quintals: quantity
      });
      setActiveBooking(res);
      setActiveTab("token");
    } catch (err) {
      alert(err.message);
    }
  };

  // Demo auto stepper sync
  useEffect(() => {
    if (!activeDemoStep) return;
    if (activeDemoStep === 1) {
      setShowRegisterModal(true);
    } else if (activeDemoStep === 2) {
      setShowRegisterModal(false);
      loadCrops(1);
    } else if (activeDemoStep === 4 || activeDemoStep === 5) {
      setActiveTab("book");
    } else if (activeDemoStep === 7 || activeDemoStep === 9) {
      setActiveTab("token");
    } else if (activeDemoStep === 11) {
      setActiveTab("payment");
    } else if (activeDemoStep === 12) {
      setActiveTab("sms");
    }
  }, [activeDemoStep]);

  return (
    <div className="app-container">
      {/* Farmer Profile Badge Header */}
      <div className="card" style={{ marginBottom: 20, background: "linear-gradient(135deg, #1e293b, #0f172a)", borderLeft: "4px solid #10b981" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span className="badge badge-green">FARMER VERIFIED (ರೈತ ದೃಢೀಕರಿಸಲಾಗಿದೆ)</span>
            <h2 style={{ fontSize: "1.4rem", margin: "8px 0 4px 0" }}>{farmer.name}</h2>
            <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
              Farmer ID: {farmer.farmer_ref_id} | Village: {farmer.village}, {farmer.district}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="btn-large btn-primary"
              style={{ fontSize: "0.9rem", padding: "10px 16px" }}
              onClick={() => setShowRegisterModal(true)}
            >
              <UserPlus size={18} /> {t("register_title")}
            </button>
          </div>
        </div>
      </div>

      {/* Farmer Navigation Tabs */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 20 }}>
        <button className={`btn-secondary ${activeTab === "book" ? "btn-primary" : ""}`} onClick={() => setActiveTab("book")}>
          <PlusCircle size={16} /> {t("dash_book_slot")}
        </button>
        <button className={`btn-secondary ${activeTab === "token" ? "btn-primary" : ""}`} onClick={() => setActiveTab("token")}>
          <Award size={16} /> {t("dash_my_token")}
        </button>
        <button className={`btn-secondary ${activeTab === "msp" ? "btn-primary" : ""}`} onClick={() => setActiveTab("msp")}>
          <Calculator size={16} /> {t("dash_msp_rates")}
        </button>
        <button className={`btn-secondary ${activeTab === "payment" ? "btn-primary" : ""}`} onClick={() => setActiveTab("payment")}>
          <CreditCard size={16} /> {t("dash_payment_status")}
        </button>
        <button className={`btn-secondary ${activeTab === "notifs" ? "btn-primary" : ""}`} onClick={() => setActiveTab("notifs")}>
          <Bell size={16} /> {t("dash_notifications")} ({notifications.length})
        </button>
        <button className={`btn-secondary ${activeTab === "sms" ? "btn-primary" : ""}`} onClick={() => setActiveTab("sms")}>
          <ShieldCheck size={16} /> {t("sms_recovery_demo")}
        </button>
      </div>

      {/* TAB 1: BOOK SLOT WIZARD */}
      {activeTab === "book" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Step 1: Crop Selection & MSP */}
          <div className="card">
            <div className="card-title">
              <Wheat color="#10b981" size={22} />
              1. {t("crop_category")} & {t("select_crop")}
            </div>

            {/* Categories */}
            <div style={{ display: "flex", gap: 8, margin: "12px 0", flexWrap: "wrap" }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`btn-secondary ${selectedCat === cat.id ? "btn-primary" : ""}`}
                  style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  onClick={() => loadCrops(cat.id)}
                >
                  {language === "kn" ? cat.name_kn : language === "hi" ? cat.name_hi : cat.name_en}
                </button>
              ))}
            </div>

            {/* Crop Selector Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "16px 0" }}>
              {crops.map((c) => (
                <div
                  key={c.id}
                  onClick={() => selectCropItem(c)}
                  style={{
                    backgroundColor: selectedCrop?.id === c.id ? "rgba(16,185,129,0.15)" : "#0f172a",
                    border: selectedCrop?.id === c.id ? "2px solid #10b981" : "1px solid #334155",
                    borderRadius: 12,
                    padding: 12,
                    cursor: "pointer"
                  }}
                >
                  <div style={{ fontWeight: 700, color: selectedCrop?.id === c.id ? "#10b981" : "#fff" }}>
                    {language === "kn" ? c.name_kn : language === "hi" ? c.name_hi : c.name_en}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    MSP: ₹{c.current_msp} / quintal
                  </div>
                </div>
              ))}
            </div>

            {/* Quantity Slider */}
            {selectedCrop && (
              <div style={{ backgroundColor: "#0f172a", padding: 16, borderRadius: 14, marginTop: 16 }}>
                <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>
                  {t("estimated_quantity")}: <strong style={{ color: "#10b981", fontSize: "1.2rem" }}>{quantity} Quintals</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#10b981" }}
                />

                <div style={{ marginTop: 12, borderTop: "1px dashed #334155", paddingTop: 12 }}>
                  <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{t("calculate_value")}:</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#f59e0b" }}>
                    ₹{(selectedCrop.current_msp * quantity).toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                    Official Government MSP Rate: ₹{selectedCrop.current_msp}/quintal
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Centre Selection & Overload Rerouting */}
          <div className="card">
            <div className="card-title">
              <MapPin color="#f59e0b" size={22} />
              2. {t("eligible_centres")} & Overload Detection
            </div>

            {/* Overload Alert Warning */}
            {overloadInfo.warning && (
              <div className="card" style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", marginBottom: 16 }}>
                <div style={{ color: "#ef4444", fontWeight: 700, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertTriangle size={18} /> {t("overload_warning_title")}
                </div>
                <p style={{ fontSize: "0.85rem", color: "#f8fafc", margin: "6px 0 12px 0" }}>
                  {t("overload_warning_msg")}
                </p>
                {overloadInfo.alternatives.map((alt) => (
                  <button
                    key={alt.centre_id}
                    className="btn-large btn-primary"
                    style={{ fontSize: "0.85rem", width: "100%", padding: "8px 12px" }}
                    onClick={() => {
                      const match = centres.find((c) => c.id === alt.centre_id);
                      if (match) selectCentreItem(match);
                    }}
                  >
                    <CheckCircle size={16} /> Switch to {alt.name} (Save {alt.time_saved_minutes} mins)
                  </button>
                ))}
              </div>
            )}

            {/* Centre List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "12px 0" }}>
              {centres.map((c) => (
                <div
                  key={c.id}
                  onClick={() => selectCentreItem(c)}
                  style={{
                    backgroundColor: selectedCentre?.id === c.id ? "rgba(16,185,129,0.15)" : "#0f172a",
                    border: selectedCentre?.id === c.id ? "2px solid #10b981" : "1px solid #334155",
                    borderRadius: 14,
                    padding: 14,
                    cursor: "pointer"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                      {language === "kn" ? c.name_kn : language === "hi" ? c.name_hi : c.name}
                    </div>
                    <span className={`badge ${c.crowd_status === "RED" ? "badge-red" : c.crowd_status === "YELLOW" ? "badge-yellow" : "badge-green"}`}>
                      {c.crowd_status === "RED" ? t("status_red") : c.crowd_status === "YELLOW" ? t("status_yellow") : t("status_green")}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: "0.8rem", color: "#94a3b8" }}>
                    <div>📍 Distance: {c.distance_km} km</div>
                    <div>👥 Queue: {c.current_queue_count} farmers</div>
                    <div>⏱️ Wait: {c.estimated_wait_minutes} mins</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slot Selection */}
            {selectedCentre && (
              <div style={{ marginTop: 16 }}>
                <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>
                  3. {t("select_date_slot")} ({selectedCentre.name}):
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {slots.map((s) => (
                    <button
                      key={s.id}
                      disabled={s.is_full}
                      onClick={() => setSelectedSlot(s)}
                      style={{
                        padding: "10px",
                        borderRadius: "10px",
                        backgroundColor: s.is_full ? "#334155" : selectedSlot?.id === s.id ? "#10b981" : "#0f172a",
                        color: s.is_full ? "#94a3b8" : selectedSlot?.id === s.id ? "#064e3b" : "#fff",
                        border: "1px solid #334155",
                        fontWeight: "600",
                        fontSize: "0.85rem"
                      }}
                    >
                      {s.time_window} {s.is_full ? `(${t("slot_full")})` : `(${s.max_farmers - s.booked_count} left)`}
                    </button>
                  ))}
                </div>

                <button
                  className="btn-large btn-primary"
                  style={{ width: "100%", marginTop: 20 }}
                  onClick={handleBookSlotSubmit}
                >
                  <Award size={20} /> {t("book_now")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY DIGITAL TOKEN */}
      {activeTab === "token" && (
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <TokenCard booking={activeBooking} onReportDelay={() => setShowDelayModal(true)} />
        </div>
      )}

      {/* TAB 3: OFFICIAL CROP MSP RATES */}
      {activeTab === "msp" && (
        <div className="card">
          <div className="card-title">
            <Wheat color="#10b981" size={24} /> Official Government Minimum Support Price (MSP) Rates - 2026
          </div>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: 16 }}>
            Current applicable rates for government grain procurement mandated by Ministry of Consumer Affairs & CACP.
          </p>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #334155", color: "#94a3b8" }}>
                  <th style={{ padding: 12 }}>Crop Name</th>
                  <th style={{ padding: 12 }}>Category</th>
                  <th style={{ padding: 12 }}>Current MSP Rate (₹/Quintal)</th>
                  <th style={{ padding: 12 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {crops.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #334155" }}>
                    <td style={{ padding: 12, fontWeight: 700 }}>{c.name_en} ({c.name_kn})</td>
                    <td style={{ padding: 12, color: "#94a3b8" }}>Food Grains / Pulses</td>
                    <td style={{ padding: 12, color: "#10b981", fontWeight: 800, fontSize: "1.1rem" }}>₹{c.current_msp}</td>
                    <td style={{ padding: 12 }}>
                      <span className="badge badge-green">OFFICIAL RATE</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENT STATUS TRACKER */}
      {activeTab === "payment" && (
        <div className="card" style={{ maxWidth: 650, margin: "0 auto" }}>
          <div className="card-title">
            <CreditCard color="#10b981" size={24} /> Procurement & Payment Status Tracking
          </div>

          {activeBooking ? (
            <div style={{ backgroundColor: "#0f172a", padding: 20, borderRadius: 16, marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Procurement ID</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#60a5fa" }}>PROC-2026-00125</div>
                </div>
                <span className={`badge ${activeBooking.status === "COMPLETED" ? "badge-green" : "badge-yellow"}`}>
                  STATUS: {activeBooking.status}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16, fontSize: "0.95rem" }}>
                <div><strong>Crop:</strong> {activeBooking.crop_name_en}</div>
                <div><strong>Quantity:</strong> {activeBooking.quantity_quintals} Quintals</div>
                <div><strong>MSP Rate:</strong> ₹{activeBooking.rate_per_quintal}/quintal</div>
                <div><strong>Total Amount:</strong> <strong style={{ color: "#f59e0b" }}>₹{activeBooking.estimated_amount.toLocaleString("en-IN")}</strong></div>
              </div>

              {/* Progress Flow */}
              <div style={{ backgroundColor: "#1e293b", padding: 16, borderRadius: 12, marginTop: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 12, fontSize: "0.9rem" }}>Payment Status Pipeline:</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="badge badge-yellow">1. PENDING</span>
                  <ArrowRight size={16} color="#94a3b8" />
                  <span className="badge badge-yellow">2. PROCESSING</span>
                  <ArrowRight size={16} color="#94a3b8" />
                  <span className="badge badge-green">3. PAID</span>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: "#94a3b8", padding: 20 }}>No completed procurement records available for payment tracking.</p>
          )}
        </div>
      )}

      {/* TAB 5: NOTIFICATIONS */}
      {activeTab === "notifs" && (
        <div className="card" style={{ maxWidth: 650, margin: "0 auto" }}>
          <div className="card-title">
            <Bell color="#10b981" size={24} /> {t("dash_notifications")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
            {notifications.map((n) => (
              <div key={n.id} style={{ backgroundColor: "#0f172a", border: "1px solid #334155", padding: 14, borderRadius: 12 }}>
                <div style={{ fontWeight: 700, color: "#10b981", fontSize: "0.95rem" }}>
                  {language === "kn" ? n.title_kn : language === "hi" ? n.title_hi : n.title_en}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#f8fafc", margin: "4px 0" }}>
                  {language === "kn" ? n.message_kn : language === "hi" ? n.message_hi : n.message_en}
                </div>
                <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Type: {n.type}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SMS RECOVERY SIMULATOR */}
      {activeTab === "sms" && (
        <div style={{ marginTop: 20 }}>
          <SmsSimulator />
        </div>
      )}

      {/* Delay Modal */}
      {showDelayModal && (
        <DelayRecoveryModal
          booking={activeBooking}
          onClose={() => setShowDelayModal(false)}
          onSuccess={() => loadFarmerBooking()}
        />
      )}

      {/* FARMER REGISTRATION MODAL */}
      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: "1.2rem", color: "#10b981" }}>
                <UserPlus size={22} />
                {t("register_title")} (ರೈತರ ನೋಂದಣಿ)
              </div>
              <button onClick={() => setShowRegisterModal(false)} style={{ background: "none", color: "#94a3b8" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4 }}>
                  {t("farmer_name")} *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Ninge Gowda / ನಿಂಗೇಗೌಡ"
                  style={{ width: "100%", padding: 12, borderRadius: 10, backgroundColor: "#0f172a", color: "#fff", border: "1px solid #334155" }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4 }}>
                  {t("mobile_number")} *
                </label>
                <input
                  type="tel"
                  required
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  placeholder="e.g. 9845012345"
                  style={{ width: "100%", padding: 12, borderRadius: 10, backgroundColor: "#0f172a", color: "#fff", border: "1px solid #334155" }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4 }}>
                  {t("farmer_id_aadhaar")}
                </label>
                <input
                  type="text"
                  value={regAadhaar}
                  onChange={(e) => setRegAadhaar(e.target.value)}
                  placeholder="e.g. KA-FARM-2026-8819 or 4589 1234 5678"
                  style={{ width: "100%", padding: 12, borderRadius: 10, backgroundColor: "#0f172a", color: "#fff", border: "1px solid #334155" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4 }}>
                    {t("village_location")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={regVillage}
                    onChange={(e) => setRegVillage(e.target.value)}
                    placeholder="e.g. Kirimanjeshwara"
                    style={{ width: "100%", padding: 12, borderRadius: 10, backgroundColor: "#0f172a", color: "#fff", border: "1px solid #334155" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4 }}>
                    District
                  </label>
                  <input
                    type="text"
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    style={{ width: "100%", padding: 12, borderRadius: 10, backgroundColor: "#0f172a", color: "#fff", border: "1px solid #334155" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4 }}>
                  {t("preferred_language")}
                </label>
                <select
                  value={regLang}
                  onChange={(e) => setRegLang(e.target.value)}
                  style={{ width: "100%", padding: 12, borderRadius: 10, backgroundColor: "#0f172a", color: "#fff", border: "1px solid #334155" }}
                >
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-large btn-primary"
                style={{ width: "100%" }}
                disabled={regLoading}
              >
                <CheckCircle size={20} /> {regLoading ? "Registering..." : t("register_button")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
