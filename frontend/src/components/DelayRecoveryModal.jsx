import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../utils/api";
import { Clock, AlertTriangle, CheckCircle, Navigation, X } from "lucide-react";

export default function DelayRecoveryModal({ booking, onClose, onSuccess }) {
  const { t } = useLanguage();
  const [arrivalTime, setArrivalTime] = useState("11:30 AM");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [gpsSimulated, setGpsSimulated] = useState(false);

  const handleSubmit = async () => {
    if (!booking) return;
    setLoading(true);
    try {
      const res = await api.reportDelay({
        booking_id: booking.id,
        expected_arrival_time: arrivalTime,
        channel: gpsSimulated ? "GPS" : "APP"
      });
      setResult(res);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      alert("Error reporting delay: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerGpsProximity = () => {
    setGpsSimulated(true);
    setArrivalTime("11:15 AM (GPS Auto-Detected Proximity)");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: "1.15rem", color: "#f59e0b" }}>
            <AlertTriangle size={22} />
            {t("delay_modal_title")}
          </div>
          <button onClick={onClose} style={{ background: "none", color: "#94a3b8" }}>
            <X size={20} />
          </button>
        </div>

        {!result ? (
          <div>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", marginBottom: 16 }}>
              {t("dash_my_token")} Token: <strong>{booking?.token_number || "RAGI-2026-000184"}</strong>
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>{t("expected_arrival")}</label>
              <select
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  backgroundColor: "#0f172a",
                  color: "#fff",
                  border: "1px solid #334155"
                }}
              >
                <option value="11:00 AM">11:00 AM (30 mins late)</option>
                <option value="11:30 AM">11:30 AM (1 hour late)</option>
                <option value="12:00 PM">12:00 PM (1.5 hours late)</option>
                <option value="02:00 PM">02:00 PM (Afternoon Shift)</option>
              </select>
            </div>

            {/* Smart Proximity GPS simulator */}
            <div style={{ backgroundColor: "#0f172a", padding: 12, borderRadius: 12, marginBottom: 16, border: "1px dashed #3b82f6" }}>
              <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", color: "#60a5fa" }}>
                  <Navigation size={16} /> GPS Approach Detection
                </div>
                <button
                  className="btn-secondary"
                  style={{ fontSize: "0.75rem", padding: "4px 8px", borderRadius: 8, marginLeft: "auto" }}
                  onClick={triggerGpsProximity}
                >
                  Simulate Proximity
                </button>
              </div>
              {gpsSimulated && (
                <div style={{ fontSize: "0.8rem", color: "#10b981", marginTop: 6 }}>
                  ✓ Farmer approaching centre (2.1 km away). Auto-assigned priority buffer.
                </div>
              )}
            </div>

            <button
              className="btn-large btn-warning"
              style={{ width: "100%" }}
              onClick={handleSubmit}
              disabled={loading}
            >
              <Clock size={18} /> {loading ? "Processing..." : t("confirm_delay")}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <CheckCircle size={48} color="#10b981" style={{ marginBottom: 12 }} />
            <h3 style={{ color: "#10b981", marginBottom: 8 }}>Slot Successfully Recovered!</h3>
            <p style={{ color: "#f8fafc", fontSize: "1rem", margin: "12px 0" }}>
              {result.message_en}
            </p>
            <div style={{ backgroundColor: "#0f172a", padding: 12, borderRadius: 12, margin: "12px 0", fontSize: "0.9rem" }}>
              <div><strong>Original Slot:</strong> 10:00 AM</div>
              <div><strong>Recovered Slot:</strong> <span style={{ color: "#10b981", fontWeight: 700 }}>{result.recovered_slot_time}</span></div>
            </div>
            <button className="btn-large btn-primary" style={{ width: "100%" }} onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
