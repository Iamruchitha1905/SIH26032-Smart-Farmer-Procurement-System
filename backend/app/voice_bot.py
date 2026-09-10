import re

class VoiceBotEngine:
    """
    Multilingual NLU engine for rural farmer voice assistant.
    Supports Kannada (kn), English (en), and Hindi (hi).
    """

    @staticmethod
    def process_voice_query(query: str, lang: str = "kn", farmer_data: dict = None) -> dict:
        q = query.lower().strip()

        # Keywords in Kannada, English, Hindi
        ragi_keywords = ["ರಾಗಿ", "ragi", "रागी"]
        paddy_keywords = ["ಭತ್ತ", "paddy", "rice", "धान"]
        wheat_keywords = ["ಗೋಧಿ", "wheat", "गेहूं"]

        slot_booking_keywords = ["slot", "ಬುಕ್", "ಮಾರಾಟ", "book", "ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್", "ಬೆಳೆಗೆ", "बुक", "बेचना"]
        queue_keywords = ["queue", "ಸಾಲು", "ವೇಟಿಂಗ್", "ಸ್ಥಾನ", "token", "ಟೋಕನ್", "wait", "लाइन", "वेटिंग"]
        rate_keywords = ["rate", "ಬೆಲೆ", "msp", "ದರ", "ರೇಟ್", "कीमत", "दर"]
        payment_keywords = ["payment", "ಹಣ", "ಪಾವತಿ", "ದುಡ್ಡು", "status", "पैसा", "भुगतान"]
        centre_keywords = ["centre", "ಸೆಂಟರ್", "ಕೇಂದ್ರ", "ಹತ್ತಿರದ", "near", "पास"]

        # 1. Slot Booking Intent
        if any(k in q for k in slot_booking_keywords):
            crop = "Ragi"
            if any(k in q for k in paddy_keywords):
                crop = "Paddy"
            elif any(k in q for k in wheat_keywords):
                crop = "Wheat"

            if lang == "kn":
                resp_text = f"{crop} ಬೆಳೆಗೆ ಹತ್ತಿರದ ಮಂಡ್ಯ ಮುಖ್ಯ ಖರೀದಿ ಕೇಂದ್ರದಲ್ಲಿ ನಾಳೆ ಬೆಳಗ್ಗೆ 09:00 - 10:00 AM Slot ಲಭ್ಯವಿದೆ. ನೀವು ಬುಕ್ ಮಾಡಲು ಬಯಸುತ್ತೀರಾ?"
            elif lang == "hi":
                resp_text = f"{crop} फसल के लिए नजदीकी मंड्या मुख्य खरीद केंद्र पर कल सुबह 09:00 - 10:00 AM स्लोॉ उपलब्ध है। क्या आप बुक करना चाहते हैं?"
            else:
                resp_text = f"For {crop}, a slot is available tomorrow from 09:00 AM - 10:00 AM at Mandya Main Procurement Centre. Would you like to confirm booking?"

            return {
                "response_text": resp_text,
                "action_taken": "RECOMMEND_SLOT",
                "suggested_crop": crop,
                "suggested_slot": {
                    "centre_name": "Mandya Main Procurement Centre",
                    "date": "Tomorrow",
                    "time": "09:00 AM - 10:00 AM",
                    "centre_id": 1,
                    "slot_id": 1
                }
            }

        # 2. Queue Status Intent
        if any(k in q for k in queue_keywords):
            if lang == "kn":
                resp_text = "ನಿಮ್ಮ ಟೋಕನ್ RAGI-2026-000184 ಆಗಿದೆ. ನಿಮ್ಮ ಸಾಲಿನ ಕ್ರಮಾಂಕ 5 ಮತ್ತು ಅಂದಾಜು ಕಾಯುವ ಸಮಯ 25 ನಿಮಿಷಗಳು."
            elif lang == "hi":
                resp_text = "आपका टोकन RAGI-2026-000184 है। आपकी कतार स्थिति 5 है और अनुमानित प्रतीक्षा समय 25 मिनट है।"
            else:
                resp_text = "Your token is RAGI-2026-000184. Your queue position is 5 and estimated waiting time is 25 minutes."

            return {
                "response_text": resp_text,
                "action_taken": "SHOW_QUEUE_STATUS"
            }

        # 3. MSP Rate Intent
        if any(k in q for k in rate_keywords):
            if lang == "kn":
                resp_text = "ಪ್ರಸ್ತುತ ರಾಗಿ ಬೆಳೆಯ ಸರ್ಕಾರಿ ಕನಿಷ್ಠ ಬೆಂಬಲ ಬೆಲೆ (MSP) ₹3,846 ಪ್ರತಿ ಕ್ವಿಂಟಾಲ್‌ಗೆ ಆಗಿದೆ."
            elif lang == "hi":
                resp_text = "वर्तमान में रागी फसल का सरकारी न्यूनतम समर्थन मूल्य (MSP) ₹3,846 प्रति क्विंटल है।"
            else:
                resp_text = "The current official Minimum Support Price (MSP) for Ragi is ₹3,846 per quintal."

            return {
                "response_text": resp_text,
                "action_taken": "SHOW_MSP_RATES"
            }

        # 4. Payment Status Intent
        if any(k in q for k in payment_keywords):
            if lang == "kn":
                resp_text = "ನಿಮ್ಮ ಖರೀದಿ ಐಡಿ PROC-2026-00125 ನ ರೂ. 38,460 ಪಾವತಿ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ (PROCESSING). ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮ ಖಾತೆಗೆ ಜಮೆಯಾಗಲಿದೆ."
            elif lang == "hi":
                resp_text = "आपकी खरीद आईडी PROC-2026-00125 का ₹38,460 भुगतान प्रक्रिया में है (PROCESSING)। जल्द ही आपके खाते में आ जाएगा।"
            else:
                resp_text = "Your procurement PROC-2026-00125 payment of ₹38,460 is currently PROCESSING. It will be credited to your account shortly."

            return {
                "response_text": resp_text,
                "action_taken": "SHOW_PAYMENT_STATUS"
            }

        # Default fallback
        if lang == "kn":
            resp_text = "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕೃಷಿ ಖರೀದಿ ಸಹಾಯಕ. ನೀವು 'ರಾಗಿ slot ಬುಕ್ ಮಾಡಿ', 'ನನ್ನ ಟೋಕನ್ ಸ್ಥಿತಿ', ಅಥವಾ 'ರಾಗಿ ಬೆಲೆ ಎಷ್ಟು' ಎಂದು ಕೇಳಬಹುದು."
        elif lang == "hi":
            resp_text = "नमस्ते! मैं आपका कृषि खरीद सहायक हूँ। आप 'रागी स्लॉट बुक करें', 'मेरा टोकन स्टेटस', या 'रागी का भाव' पूछ सकते हैं।"
        else:
            resp_text = "Hello! I am your Farmer Procurement Assistant. You can ask me to 'Book Ragi slot', 'Check token status', or 'Show MSP rates'."

        return {
            "response_text": resp_text,
            "action_taken": "GREETING"
        }
