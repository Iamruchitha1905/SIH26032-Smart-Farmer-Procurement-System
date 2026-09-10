import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../utils/api";
import {
  Shield, BarChart3, Users, Building2, AlertTriangle, Scale,
  CreditCard, CheckCircle, RefreshCw, Edit3
} from "lucide-react";

export default function AdminPortal() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [editingMsp, setEditingMsp] = useState(false);
  const [newRagiMsp, setNewRagiMsp] = useState(3846.0);
  const [mspSuccess, setMspSuccess] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateMspSubmit = async () => {
    try {
      await api.updateMsp(1, newRagiMsp);
      setMspSuccess(true);
      setTimeout(() => setMspSuccess(false), 3000);
      loadStats();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!stats) {
    return <div className="app-container" style={{ textAlign: "center", padding: 40 }}>Loading Admin Intelligence Dashboard...</div>;
  }

  return (
    <div className="app-container">
      {/* Header Banner */}
      <div className="card" style={{ marginBottom: 20, background: "linear-gradient(135deg, #1e293b, #0f172a)", borderLeft: "4px solid #f59e0b" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span className="badge badge-yellow">MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION (DoCA)</span>
            <h2 style={{ fontSize: "1.4rem", margin: "8px 0 4px 0" }}>State Procurement Control Command Center</h2>
            <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
              Director: Dr. K. S. Murthy | Central Procurement & Overload Management Console
            </div>
          </div>
          <button className="btn-secondary" style={{ padding: "8px 12px", fontSize: "0.85rem" }} onClick={loadStats}>
            <RefreshCw size={14} /> Refresh Analytics
          </button>
        </div>
      </div>

      {/* Analytics KPI Stat Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ borderLeft: "4px solid #10b981" }}>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
            <Users size={16} color="#10b981" /> Total Registered Farmers
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#10b981", marginTop: 4 }}>
            {stats.total_farmers}
          </div>
        </div>

        <div className="card" style={{ borderLeft: "4px solid #3b82f6" }}>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
            <Scale size={16} color="#3b82f6" /> Total Quantity Procured
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#60a5fa", marginTop: 4 }}>
            {stats.total_quantity_procured_quintals.toLocaleString()} <span style={{ fontSize: "1rem" }}>Quintals</span>
          </div>
        </div>

        <div className="card" style={{ borderLeft: "4px solid #f59e0b" }}>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
            <CreditCard size={16} color="#f59e0b" /> Amount Paid to Farmers
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#f59e0b", marginTop: 4 }}>
            ₹{(stats.total_amount_paid_inr / 100000).toFixed(2)} <span style={{ fontSize: "1rem" }}>Lakhs</span>
          </div>
        </div>

        <div className="card" style={{ borderLeft: "4px solid #ef4444" }}>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={16} color="#ef4444" /> Overloaded Centres
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ef4444", marginTop: 4 }}>
            {stats.centres_performance.filter((c) => c.crowd_status === "RED").length} <span style={{ fontSize: "1rem" }}>Centre (Alert)</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Left: Centre Wise Crowd & Capacity Dashboard */}
        <div className="card">
          <div className="card-title">
            <Building2 color="#3b82f6" size={22} /> Procurement Centre Real-Time Status & Overload Detector
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
            {stats.centres_performance.map((c) => (
              <div key={c.id} style={{ backgroundColor: "#0f172a", border: "1px solid #334155", padding: 14, borderRadius: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 700 }}>{c.name} ({c.district})</div>
                  <span className={`badge ${c.crowd_status === "RED" ? "badge-red" : c.crowd_status === "YELLOW" ? "badge-yellow" : "badge-green"}`}>
                    {c.crowd_status} CROWD
                  </span>
                </div>

                <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: "0.8rem", color: "#94a3b8" }}>
                  <div>Active Queue: <strong>{c.active_queue} farmers</strong></div>
                  <div>Daily Capacity: <strong>{c.capacity_quintals} Qtl</strong></div>
                  <div>Total Bookings: <strong>{c.total_bookings}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: State MSP Rate Manager & Policy Settings */}
        <div className="card">
          <div className="card-title">
            <Edit3 color="#10b981" size={22} /> State MSP Rate Update Console
          </div>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: 16 }}>
            Authorized DoCA administrators can update official MSP rates dynamically for state procurement.
          </p>

          <div style={{ backgroundColor: "#0f172a", padding: 16, borderRadius: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Target Crop: Ragi (ರಾಷ್ಟ್ರೀಯ ರಾಗಿ ಯೋಜನೆ)</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
              <input
                type="number"
                value={newRagiMsp}
                onChange={(e) => setNewRagiMsp(Number(e.target.value))}
                style={{ flex: 1, padding: 10, borderRadius: 10, backgroundColor: "#1e293b", color: "#fff", border: "1px solid #334155", fontWeight: 700 }}
              />
              <button className="btn-large btn-primary" onClick={handleUpdateMspSubmit}>
                Update Official Rate
              </button>
            </div>
            {mspSuccess && (
              <div style={{ color: "#10b981", fontSize: "0.85rem", marginTop: 8, fontWeight: 700 }}>
                ✓ Official MSP Rate updated successfully to ₹{newRagiMsp}/quintal!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
