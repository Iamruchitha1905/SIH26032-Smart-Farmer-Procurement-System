import React, { useState } from "react";
import { Play, SkipForward, RotateCcw, Award, CheckCircle } from "lucide-react";

export default function SihDemoBar({ onExecuteStep }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { title: "1. Register in Kannada", desc: "Farmer Ninge Gowda registers with language preference set to Kannada." },
    { title: "2. Crop Category & Ragi Selection", desc: "Selects Food Grains → Ragi crop." },
    { title: "3. Current Rate / MSP", desc: "System displays official MSP ₹3,846/quintal for Ragi." },
    { title: "4. Overloaded Centre Detection", desc: "Centre A detected as RED (High Crowd / 18 farmers waiting)." },
    { title: "5. Smart Reroute to Centre B", desc: "AI recommends Centre B (Low Crowd / 5 farmers / 20 mins wait)." },
    { title: "6. Voice Chatbot Slot Booking", desc: "Farmer books slot using Kannada voice prompt: 'ನನಗೆ ರಾಗಿ slot ಬೇಕು'." },
    { title: "7. Digital Token & QR Generated", desc: "Token generated: RAGI-2026-000184 with verified QR Code." },
    { title: "8. Officer QR Scan & Check-in", desc: "Procurement officer scans QR code at counter." },
    { title: "9. Live Queue Update", desc: "Farmer sees real-time Position #5, 25 mins wait." },
    { title: "10. Weighing & Quality Verification", desc: "Officer enters 10 Quintals, Grade A quality." },
    { title: "11. Payment Status: Paid", desc: "Payment status advances: PENDING → PROCESSING → PAID (Ref: PAY-2026-TXN-88219)." },
    { title: "12. Missed Slot & SMS Recovery", desc: "Farmer reports delay or replies '1' via SMS to recover slot." }
  ];

  const handleStep = (idx) => {
    setActiveStep(idx);
    if (onExecuteStep) onExecuteStep(idx + 1);
  };

  const handleNext = () => {
    const nextIdx = (activeStep + 1) % steps.length;
    handleStep(nextIdx);
  };

  return (
    <div className="sih-demo-bar">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="sih-badge">SIH 2026 DEMO RUNNER</span>
        <div style={{ fontSize: "0.9rem", color: "#f8fafc" }}>
          <strong>{steps[activeStep].title}</strong> - <span style={{ color: "#94a3b8" }}>{steps[activeStep].desc}</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          className="btn-large btn-primary"
          style={{ padding: "8px 16px", fontSize: "0.85rem", borderRadius: 8 }}
          onClick={handleNext}
        >
          <Play size={14} /> Next Step ({activeStep + 1}/{steps.length})
        </button>
        <button
          className="btn-secondary"
          style={{ padding: "8px 12px", fontSize: "0.85rem", borderRadius: 8 }}
          onClick={() => handleStep(0)}
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>
    </div>
  );
}
