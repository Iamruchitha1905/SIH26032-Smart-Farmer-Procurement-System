import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { Wheat, Languages, UserCheck, Shield, Building2 } from "lucide-react";

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { role, setRole, farmer } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-content">
        {/* Brand */}
        <div className="brand">
          <div className="brand-icon">
            <Wheat size={26} />
          </div>
          <div>
            <div className="brand-title">{t("title")}</div>
            <div className="brand-subtitle">{t("subtitle")}</div>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="role-switcher">
          <button
            className={`role-btn ${role === "farmer" ? "active" : ""}`}
            onClick={() => setRole("farmer")}
          >
            <UserCheck size={14} style={{ marginRight: 4 }} />
            {t("register_title")}
          </button>
          <button
            className={`role-btn ${role === "officer" ? "active" : ""}`}
            onClick={() => setRole("officer")}
          >
            <Building2 size={14} style={{ marginRight: 4 }} />
            {t("officer_portal")}
          </button>
          <button
            className={`role-btn ${role === "admin" ? "active" : ""}`}
            onClick={() => setRole("admin")}
          >
            <Shield size={14} style={{ marginRight: 4 }} />
            {t("admin_portal")}
          </button>
        </div>

        {/* Language Selection */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Languages size={18} color="#10b981" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              backgroundColor: "#1e293b",
              color: "#f8fafc",
              border: "1px solid #334155",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
          </select>
        </div>
      </div>
    </nav>
  );
}
