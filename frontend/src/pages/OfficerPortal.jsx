import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../utils/api";
import {
  Building2, QrCode, CheckCircle, Scale, Award, CreditCard,
  Users, Play, SkipForward, AlertTriangle, RefreshCw
} from "lucide-react";

export default function OfficerPortal() {
  const { t } = useLanguage();
  const [tokenInput, setTokenInput] = useState("RAGI-2026-000184");
  const [scannedBooking, setScannedBooking] = useState(null);
  const [weight, setWeight] = useState(10.0);
  const [moisture, setMoisture] = useState(11.5);
  const [qualityGrade, setQualityGrade] = useState("GRADE_A");
  const [remarks, setRemarks] = useState("Grain quality verified, dry & clean.");
  const [loading, setLoading] = useState(false);
  const [procResult, setProcResult] = useState(null);

  const handleScanToken = async () => {
    if (!tokenInput) return;
    setLoading(true);
    try {
      const res = await api.checkInToken(tokenInput);
      setScannedBooking(res);
      setProcResult(null);
    } catch (err) {
      alert("Token verification failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProcurement = async () => {
    if (!scannedBooking) return;
    setLoading(true);
    try {
      const res = await api.updateProcurement({
        booking_id: scannedBooking.id,
        actual_weight_quintals: weight,
        moisture_percentage: moisture,
        quality_grade: qualityGrade,
        officer_remarks: remarks
      });
      setProcResult(res);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (status) => {
    if (!scannedBooking) return;
    try {
      const res = await api.updatePayment({
        booking_id: scannedBooking.id,
        status: status,
        transaction_ref: status === "PAID" ? "PAY-2026-TXN-88219" : null
      });
      setProcResult((prev) => ({ ...prev, payment_status: status, transaction_ref: res.transaction_ref }));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="app-container">
      <div className="card" style={{ marginBottom: 20, background: "linear-gradient(135deg, #1e293b, #0f172a)", borderLeft: "4px solid #3b82f6" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span className="badge badge-yellow">PROCUREMENT OFFICER COUNTER DESK</span>
            <h2 style={{ fontSize: "1.4rem", margin: "8px 0 4px 0" }}>Mandya Main APMC Procurement Centre (Counter #1)</h2>
            <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
              Officer Ramesh Kumar (Procurement Inspector) | Active Centre Status: <strong style={{ color: "#ef4444" }}>RED (HIGH CROWD)</strong>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Left Column: QR Scan & Check-in Desk */}
        <div className="card">
          <div className="card-title">
            <QrCode color="#3b82f6" size={22} /> Digital Token & QR Code Scanner
          </div>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: 16 }}>
            Scan farmer's digital token QR code or enter token number manually to check-in farmer.
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="e.g. RAGI-2026-000184"
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 12,
                backgroundColor: "#0f172a",
                color: "#fff",
                border: "1px solid #334155",
                fontFamily: "monospace",
                fontWeight: 700
              }}
            />
            <button className="btn-large btn-primary" onClick={handleScanToken} disabled={loading}>
              <CheckCircle size={18} /> {loading ? "Verifying..." : "Scan Token"}
            </button>
          </div>

          {/* Queue Counter Controls */}
          <div style={{ backgroundColor: "#0f172a", padding: 16, borderRadius: 14, marginTop: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <Users size={18} color="#10b981" /> Live Queue Counter Controls
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-primary" style={{ flex: 1, padding: "10px", fontSize: "0.85rem" }}>
                <Play size={14} /> Call Next Farmer
              </button>
              <button className="btn-warning" style={{ flex: 1, padding: "10px", fontSize: "0.85rem" }}>
                <SkipForward size={14} /> Skip Farmer
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Weighing, Quality Verification & Payment Approval */}
        <div className="card">
          <div className="card-title">
            <Scale color="#10b981" size={22} /> Crop Weighing & Quality Verification Desk
          </div>

          {scannedBooking ? (
            <div>
              <div style={{ backgroundColor: "#0f172a", padding: 14, borderRadius: 12, marginBottom: 16 }}>
                <div><strong>Farmer:</strong> {scannedBooking.farmer_name}</div>
                <div><strong>Token:</strong> <span style={{ color: "#10b981", fontWeight: 700 }}>{scannedBooking.token_number}</span></div>
                <div><strong>Crop:</strong> {scannedBooking.crop_name_en}</div>
              </div>

              {/* Form Inputs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4 }}>Actual Weight (Quintals)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    style={{ width: "100%", padding: 10, borderRadius: 10, backgroundColor: "#0f172a", color: "#fff", border: "1px solid #334155" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4 }}>Moisture Content (%)</label>
                  <input
                    type="number"
                    value={moisture}
                    onChange={(e) => setMoisture(Number(e.target.value))}
                    style={{ width: "100%", padding: 10, borderRadius: 10, backgroundColor: "#0f172a", color: "#fff", border: "1px solid #334155" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4 }}>Quality Grade</label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 10, backgroundColor: "#0f172a", color: "#fff", border: "1px solid #334155" }}
                >
                  <option value="GRADE_A">Grade A (Optimal Quality - 100% MSP)</option>
                  <option value="GRADE_B">Grade B (Fair Average Quality - 95% MSP)</option>
                  <option value="REJECTED">Rejected (Excess moisture/damaged)</option>
                </select>
              </div>

              <button className="btn-large btn-primary" style={{ width: "100%", marginBottom: 16 }} onClick={handleApproveProcurement}>
                <Award size={18} /> Approve Quality & Calculate Value (₹38,460)
              </button>

              {/* Payment Workflow Trigger */}
              {procResult && (
                <div style={{ backgroundColor: "#0f172a", padding: 16, borderRadius: 14, border: "1px solid #10b981" }}>
                  <div style={{ fontWeight: 700, color: "#10b981", marginBottom: 8 }}>✓ Procurement Approved! Ref: {procResult.procurement_ref}</div>
                  <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: 12 }}>
                    Update Payment Status for Farmer Account:
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-warning" style={{ fontSize: "0.8rem", padding: "8px 12px" }} onClick={() => handleUpdatePaymentStatus("PROCESSING")}>
                      Set PROCESSING
                    </button>
                    <button className="btn-primary" style={{ fontSize: "0.8rem", padding: "8px 12px" }} onClick={() => handleUpdatePaymentStatus("PAID")}>
                      Set PAID (Confirm)
                    </button>
                  </div>

                  {procResult.payment_status && (
                    <div style={{ marginTop: 12, fontSize: "0.85rem", color: "#f59e0b" }}>
                      Current Payment Status: <strong>{procResult.payment_status}</strong> {procResult.transaction_ref && `(Txn Ref: ${procResult.transaction_ref})`}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: "#94a3b8", padding: "30px 0", textAlign: "center" }}>
              Scan a token on the left to verify farmer details & record weight.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
