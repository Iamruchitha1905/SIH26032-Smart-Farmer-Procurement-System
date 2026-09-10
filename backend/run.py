import uvicorn
import os

if __name__ == "__main__":
    print("Starting SIH 2026 Smart Farmer Procurement FastAPI Server on http://localhost:8000 ...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
