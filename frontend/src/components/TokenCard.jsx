import React from "react";
import QRCodeDisplay from "./QRCodeDisplay";
import { useLanguage } from "../context/LanguageContext";
import { QrCode, Clock, Users, MapPin, AlertTriangle, ArrowRight } from "lucide-react";

export default function TokenCard({ booking, onReportDelay }) {
  const { t } = useLanguage();

  if (!booking) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
        <QrCode size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
        <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>{t("dash_my_token")}</div>
        <p style={{ color: "#94a3b8", margin: "12px 0 20px 0" }}>No active booking token found. Click below to book a slot.</p>
      </div>
    );
  }

  return (
    <div className="token-display-box">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="badge badge-green">ACTIVE DIGITAL TOKEN</span>
        <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{booking.booking_ref}</span>
      </div>

      <div className="token-number-large">{booking.token_number || "RAGI-2026-000184"}</div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <QRCodeDisplay text={booking.token_number || "RAGI-2026-000184"} size={160} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "16px 0", textAlign: "left" }}>
        <div style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "12px" }}>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
            <Users size={14} color="#10b981" /> {t("your_position")}
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#10b981", marginTop: 4 }}>
            #{booking.queue_position || 5}
          </div>
        </div>

        <div style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "12px" }}>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
            <Clock size={14} color="#f59e0b" /> {t("est_wait_time")}
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f59e0b", marginTop: 4 }}>
            {booking.estimated_wait_minutes || 25} mins
          </div>
        </div>
      </div>

      <div style={{ textAlign: "left", backgroundColor: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "12px", fontSize: "0.9rem" }}>
        <div><strong>Crop:</strong> {booking.crop_name_en} ({booking.quantity_quintals} Quintals)</div>
        <div><strong>Centre:</strong> {booking.centre_name}</div>
        <div><strong>Slot:</strong> {booking.slot_date} | {booking.time_window}</div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <button
          className="btn-large btn-warning"
          style={{ flex: 1 }}
          onClick={onReportDelay}
        >
          <AlertTriangle size={18} /> {t("report_delay")}
        </button>
      </div>
    </div>
  );
}
