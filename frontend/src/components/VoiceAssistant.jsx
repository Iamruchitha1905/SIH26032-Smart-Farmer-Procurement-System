import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../utils/api";
import { Mic, MicOff, Volume2, X, Send, Sparkles } from "lucide-react";

export default function VoiceAssistant({ onAutoBookSlot }) {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [chatLog, setChatLog] = useState([
    {
      sender: "bot",
      text: language === "kn" 
        ? "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಧ್ವನಿ ಸಹಾಯಕ. ನೀವು ಮಾತನಾಡಬಹುದು ಅಥವಾ ಟೈಪ್ ಮಾಡಬಹುದು." 
        : language === "hi"
        ? "नमस्ते! मैं आपका कृषि वॉयस सहायक हूँ। आप बोल सकते हैं या टाइप कर सकते हैं।"
        : "Hello! I am your Smart Farmer Voice Assistant. You can speak or type your request."
    }
  ]);

  const handleMicClick = () => {
    // Check Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = language === "kn" ? "kn-IN" : language === "hi" ? "hi-IN" : "en-US";
      
      setIsListening(true);
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        sendQuery(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        // Fallback demo preset if mic error
        const demoPhrase = language === "kn" ? "ನನಗೆ ರಾಗಿ ಮಾರಾಟ ಮಾಡಲು slot ಬೇಕು" : "Book slot for Ragi";
        sendQuery(demoPhrase);
      };
    } else {
      // Direct demo query fallback
      const demoPhrase = language === "kn" ? "ನನಗೆ ರಾಗಿ ಮಾರಾಟ ಮಾಡಲು slot ಬೇಕು" : "Book slot for Ragi";
      sendQuery(demoPhrase);
    }
  };

  const sendQuery = async (textToSend) => {
    const text = textToSend || queryText;
    if (!text) return;

    // Add User Message
    const userMsg = { sender: "user", text };
    setChatLog((prev) => [...prev, userMsg]);
    setQueryText("");

    try {
      const res = await api.queryVoiceBot({
        farmer_id: 1,
        language: language,
        message: text
      });

      const botMsg = { sender: "bot", text: res.response_text };
      setChatLog((prev) => [...prev, botMsg]);

      // Speak back using Browser SpeechSynthesis
      speakText(res.response_text);

      // If slot recommendation intent triggered
      if (res.action_taken === "RECOMMEND_SLOT" && onAutoBookSlot) {
        setTimeout(() => {
          onAutoBookSlot(res.suggested_slot);
        }, 1500);
      }
    } catch (err) {
      setChatLog((prev) => [...prev, { sender: "bot", text: "Error connecting to AI bot server." }]);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "kn" ? "kn-IN" : language === "hi" ? "hi-IN" : "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      {/* Floating FAB */}
      <div className="voice-assistant-fab">
        <button className="mic-btn" onClick={() => setIsOpen(true)}>
          <Mic size={32} />
        </button>
      </div>

      {/* Modal Popup */}
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 450, borderRadius: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: "1.1rem" }}>
                <Sparkles size={20} color="#10b981" />
                {t("dash_voice_assistant")}
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: "none", color: "#94a3b8" }}>
                <X size={20} />
              </button>
            </div>

            {/* Chat Box Log */}
            <div style={{ height: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, padding: 8 }}>
              {chatLog.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                    backgroundColor: msg.sender === "user" ? "#10b981" : "#334155",
                    color: msg.sender === "user" ? "#064e3b" : "#f8fafc",
                    padding: "10px 14px",
                    borderRadius: 16,
                    maxWidth: "85%",
                    fontSize: "0.95rem",
                    fontWeight: 500
                  }}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Quick Demo Voice Preset Chips */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "12px 0" }}>
              <button
                className="btn-secondary"
                style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: 12 }}
                onClick={() => sendQuery(language === "kn" ? "ನನಗೆ ರಾಗಿ ಮಾರಾಟ ಮಾಡಲು slot ಬೇಕು" : "Book slot for Ragi")}
              >
                🎙️ {language === "kn" ? "ರಾಗಿ Slot ಬೇಕು" : "Book Ragi Slot"}
              </button>

              <button
                className="btn-secondary"
                style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: 12 }}
                onClick={() => sendQuery(language === "kn" ? "ನನ್ನ ಟೋಕನ್ ಸಾಲಿನ ಸಮಯ ಎಷ್ಟು?" : "Check token status")}
              >
                📊 {language === "kn" ? "ಟೋಕನ್ ಸಮಯ" : "Token Status"}
              </button>

              <button
                className="btn-secondary"
                style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: 12 }}
                onClick={() => sendQuery(language === "kn" ? "ರಾಗಿ ಬೆಲೆ ಎಷ್ಟು?" : "What is Ragi MSP?")}
              >
                🌾 {language === "kn" ? "ರಾಗಿ ಬೆಲೆ" : "MSP Rate"}
              </button>
            </div>

            {/* Input & Mic controls */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendQuery()}
                placeholder={t("voice_prompt")}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 14,
                  backgroundColor: "#0f172a",
                  color: "#fff",
                  border: "1px solid #334155"
                }}
              />
              <button
                className={`btn-large ${isListening ? "btn-danger" : "btn-primary"}`}
                onClick={handleMicClick}
                style={{ padding: 12, borderRadius: 14 }}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button
                className="btn-large btn-secondary"
                onClick={() => sendQuery()}
                style={{ padding: 12, borderRadius: 14 }}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
