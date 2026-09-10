import React, { useState } from "react";
import { MessageSquare, Send, CheckCircle, Smartphone } from "lucide-react";

export default function SmsSimulator() {
  const [messages, setMessages] = useState([
    {
      sender: "system",
      time: "10:15 AM",
      text: "Your Ragi procurement slot at Mandya Centre has been missed. If you want to recover your slot, reply 1."
    }
  ]);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (!inputText) return;
    const userMsg = { sender: "user", time: "10:16 AM", text: inputText };
    setMessages((prev) => [...prev, userMsg]);
    const textVal = inputText.trim();
    setInputText("");

    if (textVal === "1") {
      setTimeout(() => {
        const replyMsg = {
          sender: "system",
          time: "10:16 AM",
          text: "Your recovered slot is 11:30 AM at Mandya APMC Procurement Centre. Token: RAGI-2026-000184. Please show this SMS at counter."
        };
        setMessages((prev) => [...prev, replyMsg]);
      }, 1000);
    } else {
      setTimeout(() => {
        const replyMsg = {
          sender: "system",
          time: "10:16 AM",
          text: "Invalid reply. Reply '1' to recover your missed procurement slot."
        };
        setMessages((prev) => [...prev, replyMsg]);
      }, 1000);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 450, margin: "0 auto" }}>
      <div className="card-title">
        <Smartphone size={20} color="#60a5fa" />
        Feature Demo: Feature Phone SMS Recovery
      </div>
      <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: 12 }}>
        Simulates SMS slot recovery for rural farmers without smartphones.
      </p>

      {/* Phone Screen Mock */}
      <div style={{ backgroundColor: "#090d16", border: "2px solid #334155", borderRadius: 18, padding: 12, height: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
              backgroundColor: m.sender === "user" ? "#2563eb" : "#1e293b",
              color: "#fff",
              padding: "10px 12px",
              borderRadius: 14,
              fontSize: "0.85rem",
              maxWidth: "88%"
            }}
          >
            <div>{m.text}</div>
            <div style={{ fontSize: "0.65rem", color: "#94a3b8", textAlign: "right", marginTop: 4 }}>{m.time}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type '1' to recover..."
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 10,
            backgroundColor: "#0f172a",
            color: "#fff",
            border: "1px solid #334155"
          }}
        />
        <button className="btn-primary" style={{ padding: "10px 16px", borderRadius: 10 }} onClick={handleSend}>
          <Send size={16} /> Send SMS
        </button>
      </div>
    </div>
  );
}
