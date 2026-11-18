# config.py
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

# Hardware Endpoints (ESP32-S3 Camera and R307S Fingerprint Sensor)
ESP32_IP = os.getenv("ESP32_IP", "172.16.115.131")
ESP32_STATUS_ENDPOINT = os.getenv("ESP32_STATUS_ENDPOINT", f"http://{ESP32_IP}/api/status")
ESP32_STREAM_ENDPOINT = os.getenv("ESP32_STREAM_ENDPOINT", f"http://{ESP32_IP}:81/stream")

# Local camera fallback (0 = default webcam, None = disabled)
LOCAL_WEBCAM_INDEX = int(os.getenv("LOCAL_WEBCAM_INDEX", "-1")) # -1 means try ESP32 first

# Flask Server Config
FLASK_HOST = os.getenv("FLASK_HOST", "0.0.0.0")
FLASK_PORT = int(os.getenv("FLASK_PORT", "5000"))

# Face Recognition Settings (LBPH)
FACE_CONFIDENCE_THRESHOLD = float(os.getenv("FACE_CONFIDENCE_THRESHOLD", "65.0"))
FACE_CONFIRM_SECONDS = int(os.getenv("FACE_CONFIRM_SECONDS", "5"))
FACE_CAPTURE_COUNT = int(os.getenv("FACE_CAPTURE_COUNT", "20"))

FACE_WIDTH = 200
FACE_HEIGHT = 200

# File Paths
DATABASE_PATH = str(BASE_DIR / os.getenv("DATABASE_PATH", "nid_secureguard.db"))
FACE_DATA_DIR = str(BASE_DIR / os.getenv("FACE_DATA_DIR", "face_data"))
MODEL_PATH = str(BASE_DIR / os.getenv("MODEL_PATH", "models/face_model.yml"))
