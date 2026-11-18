# NID SecureGuard — Python Flask Backend Service

This folder contains the complete, standalone Python Flask backend for **NID SecureGuard: IoT-Based Secure NID Data Protection and Biometric Access Control System**.

---

## 1. Prerequisites

- Python 3.9+
- An ESP32-S3-WROOM-1 N16R8 microcontroller running camera firmware and R307S UART interface on your local Wi-Fi network.

---

## 2. Setup Instructions

```bash
# 1. Navigate to the Backend directory
cd Backend

# 2. Create a virtual environment
python3 -m venv venv

# 3. Activate the virtual environment
# On macOS / Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# 4. Install required dependencies
pip install -r requirements.txt

# 5. Configure your ESP32-S3 IP Address
# Either edit config.py or set via environment variable:
export ESP32_IP="192.168.1.100"

# 6. Run the Flask server
python app.py
```

The server will initialize SQLite database tables (`secureguard.db`), seed synthetic demographic records, connect OpenCV to the ESP32 camera stream, and start listening on `http://127.0.0.1:5000`.

---

## 3. Endpoints Implemented

- **`GET /api/health`**: Health check probe and OpenCV status.
- **`GET /api/system-status`**: System status JSON schema (camera, fingerprint_connected, fingerprint_status, matched_id, stored_templates, access_result, face_detected, face_count, backend). Polled by the frontend dashboard every 2 seconds.
- **`GET /api/logs`**: SQLite security audit trail.
- **`GET /api/nid`**: Encrypted synthetic demo NID records.
- **`GET /video_feed`**: Live OpenCV multipart MJPEG annotated stream with facial bounding boxes.

---

## 4. Hardware Architecture Notice

- **Fingerprint Templates**: Stored strictly inside the internal flash memory of the R307S optical sensor. No raw fingerprint images are transmitted over HTTP.
- **Face Detection vs Recognition**: OpenCV performs face presence and bounding-box detection (Phase 1). It does not perform legal identity recognition.
- **Academic Research Scope**: All demographic records and IDs are synthetic test records.
