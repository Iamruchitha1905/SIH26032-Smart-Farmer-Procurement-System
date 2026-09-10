import React, { useState } from "react";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import VoiceAssistant from "./components/VoiceAssistant";
import SihDemoBar from "./components/SihDemoBar";
import FarmerPortal from "./pages/FarmerPortal";
import OfficerPortal from "./pages/OfficerPortal";
import AdminPortal from "./pages/AdminPortal";

function MainContent() {
  const { role } = useAuth();
  const [activeDemoStep, setActiveDemoStep] = useState(0);

  const handleDemoStep = (stepNo) => {
    setActiveDemoStep(stepNo);
  };

  return (
    <div>
      <Navbar />
      
      {/* Role view rendering */}
      {role === "farmer" && <FarmerPortal activeDemoStep={activeDemoStep} />}
      {role === "officer" && <OfficerPortal />}
      {role === "admin" && <AdminPortal />}

      {/* Multilingual Voice Assistant Floating Widget */}
      <VoiceAssistant />

      {/* SIH Presentation Guided Step Runner */}
      <SihDemoBar onExecuteStep={handleDemoStep} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
