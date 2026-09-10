import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Active Portal Mode: 'farmer' | 'officer' | 'admin'
  const [role, setRole] = useState("farmer");

  // Current logged in farmer (Default to Hero Demo Farmer: Ninge Gowda, ID: 1)
  const [farmer, setFarmer] = useState({
    id: 1,
    name: "Ninge Gowda (ನಿಂಗೇಗೌಡ)",
    mobile: "9845010001",
    farmer_ref_id: "KA-FARM-2026-1001",
    village: "Kirimanjeshwara",
    district: "Mandya",
    preferred_language: "kn"
  });

  return (
    <AuthContext.Provider value={{ role, setRole, farmer, setFarmer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
