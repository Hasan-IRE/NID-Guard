"""
NID SecureGuard - Face Recognition Engine
ESP32-S3-CAM + OV2640 / Local Webcam Fallback
OpenCV Haar Cascade + LBPH Face Recognition
"""

import os
import time
import threading
import cv2
import numpy as np

from config import (
    ESP32_STREAM_ENDPOINT,
    LOCAL_WEBCAM_INDEX,
    FACE_CONFIDENCE_THRESHOLD,
    FACE_CAPTURE_COUNT,
    FACE_WIDTH,
    FACE_HEIGHT,
    FACE_DATA_DIR,
    MODEL_PATH,
)

from database import get_registered_users


class FaceEngine:

    def __init__(self):
        # Thread synchronization
        self.lock = threading.RLock()
        self.model_lock = threading.RLock()

        # Camera
        self.cap = None
        self.camera_thread = None
        self.running = False
        self.camera_connected = False
        self.last_seen = 0.0

        # Detection states
        self.face_detected = False
        self.face_count = 0

        # Latest camera frames
        self.latest_raw_frame = None
        self.latest_processed_frame = None
        self.frame_id = 0

        # Face recognition status
        self.latest_result = {
            "recognized": False,
            "nid": None,
            "fingerprint_id": None,
            "confidence": None,
            "status": "WAITING"
        }

        # LBPH recognizer
        if not hasattr(cv2, "face"):
            raise RuntimeError(
                "cv2.face module not found. Install opencv-contrib-python-headless."
            )

        self.recognizer = cv2.face.LBPHFaceRecognizer_create()
        self.model_loaded = False

        # Haar Cascade face detector
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.detector = cv2.CascadeClassifier(cascade_path)

        if self.detector.empty():
            raise RuntimeError("Failed to load Haar Cascade classifier.")

        # Directories
        os.makedirs(FACE_DATA_DIR, exist_ok=True)
        model_directory = os.path.dirname(MODEL_PATH)
        if model_directory:
            os.makedirs(model_directory, exist_ok=True)

        # Load existing trained model
        self.load_model()
        print("[FACE ENGINE] Initialized successfully")

    # ==================================================
    # DATABASE HELPERS
    # ==================================================

    @staticmethod
    def _get_field(user, field):
        try:
            return user[field]
        except (KeyError, IndexError, TypeError):
            pass
        if isinstance(user, dict):
            return user.get(field)
        return None

    def get_registered_identity(self, fingerprint_id):
        users = get_registered_users()
        for user in users:
            db_fingerprint_id = self._get_field(user, "fingerprint_id")
            face_registered = self._get_field(user, "face_registered")
            nid = self._get_field(user, "nid")

            if db_fingerprint_id is None or nid is None:
                continue

            if int(db_fingerprint_id) != int(fingerprint_id):
                continue

            if face_registered is not None and int(face_registered) != 1:
                continue

            return str(nid)
        return None

    # ==================================================
    # CAMERA WORKER
    # ==================================================

    def start(self):
        if self.running:
            print("[CAMERA] Already running")
            return

        self.running = True
        self.camera_thread = threading.Thread(
            target=self._camera_worker,
            daemon=True,
            name="NID-Camera-Worker"
        )
        self.camera_thread.start()
        print("[CAMERA] Background worker started")

    def stop(self):
        self.running = False
        if self.camera_thread:
            self.camera_thread.join(timeout=3)

        with self.lock:
            if self.cap is not None:
                self.cap.release()
                self.cap = None
            self.camera_connected = False
        print("[CAMERA] Stopped")

    def _camera_worker(self):
        while self.running:
            try:
                # Try ESP32 stream endpoint
                print(f"[CAMERA] Connecting to ESP32: {ESP32_STREAM_ENDPOINT}")
                self.cap = cv2.VideoCapture(ESP32_STREAM_ENDPOINT, cv2.CAP_FFMPEG)
                self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

                if not self.cap.isOpened():
                    # If ESP32 is offline and local webcam index is configured, try it
                    if LOCAL_WEBCAM_INDEX >= 0:
                        print(f"[CAMERA] ESP32 unavailable, trying local webcam index {LOCAL_WEBCAM_INDEX}")
                        self.cap.release()
                        self.cap = cv2.VideoCapture(LOCAL_WEBCAM_INDEX, cv2.CAP_DSHOW)

                if not self.cap.isOpened():
                    with self.lock:
                        self.camera_connected = False
                    if self.cap is not None:
                        self.cap.release()
                        self.cap = None
                    time.sleep(3)
                    continue

                print("[CAMERA] Connected successfully")
                with self.lock:
                    self.camera_connected = True

                while self.running:
                    if self.cap is None:
                        break

                    success, frame = self.cap.read()
                    if not success or frame is None:
                        print("[CAMERA] Frame read failed")
                        with self.lock:
                            self.camera_connected = False
                        break

                    self.process_frame(frame)

                if self.cap is not None:
                    self.cap.release()
                    self.cap = None

                with self.lock:
                    self.camera_connected = False

                if self.running:
                    time.sleep(3)

            except Exception as error:
                print("[CAMERA ERROR]", error)
                with self.lock:
                    self.camera_connected = False
                if self.cap is not None:
                    self.cap.release()
                    self.cap = None
                time.sleep(3)

    # ==================================================
    # FRAME PROCESSING
    # ==================================================

    def detect_faces(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)
        faces = self.detector.detectMultiScale(
            gray,
            scaleFactor=1.2,
            minNeighbors=5,
            minSize=(70, 70)
        )
        return gray, faces

    def process_frame(self, frame):
        if frame is None:
            return None

        with self.lock:
            self.latest_raw_frame = frame.copy()
            self.frame_id += 1

        display_frame = frame.copy()
        gray, faces = self.detect_faces(frame)

        with self.lock:
            self.face_count = len(faces)
            self.face_detected = len(faces) > 0
            if self.face_detected:
                self.last_seen = time.time()

        if len(faces) == 0:
            with self.lock:
                self.latest_result = {
                    "recognized": False,
                    "nid": None,
                    "fingerprint_id": None,
                    "confidence": None,
                    "status": "NO_FACE"
                }
        elif len(faces) > 1:
            with self.lock:
                self.latest_result = {
                    "recognized": False,
                    "nid": None,
                    "fingerprint_id": None,
                    "confidence": None,
                    "status": "MULTIPLE_FACES"
                }
            # Draw warning on all faces
            for (x, y, w, h) in faces:
                cv2.rectangle(display_frame, (x, y), (x + w, y + h), (0, 165, 255), 2)
            cv2.putText(
                display_frame,
                "MULTIPLE FACES DETECTED",
                (20, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 165, 255),
                2
            )
        else:
            x, y, w, h = faces[0]
            face = gray[y:y + h, x:x + w]
            face = cv2.resize(face, (FACE_WIDTH, FACE_HEIGHT))

            result = self.recognize_face(face)

            if result["recognized"]:
                color = (0, 255, 0)
                label = f"NID: {result['nid']} (Dist: {result['confidence']:.1f})"
            elif result["status"] == "MODEL_NOT_TRAINED":
                color = (255, 200, 0)
                label = "FACE DETECTED (Model Unregistered)"
            else:
                color = (0, 0, 255)
                label = "UNKNOWN SUBJECT - ACCESS DENIED"

            # Draw futuristic corner brackets
            line_len = int(w * 0.2)
            t = 2
            # Top-left
            cv2.line(display_frame, (x, y), (x + line_len, y), color, t)
            cv2.line(display_frame, (x, y), (x, y + line_len), color, t)
            # Top-right
            cv2.line(display_frame, (x + w, y), (x + w - line_len, y), color, t)
            cv2.line(display_frame, (x + w, y), (x + w, y + line_len), color, t)
            # Bottom-left
            cv2.line(display_frame, (x, y + h), (x + line_len, y + h), color, t)
            cv2.line(display_frame, (x, y + h), (x, y + h - line_len), color, t)
            # Bottom-right
            cv2.line(display_frame, (x + w, y + h), (x + w - line_len, y + h), color, t)
            cv2.line(display_frame, (x + w, y + h), (x + w, y + h - line_len), color, t)

            # Bounding box
            cv2.rectangle(display_frame, (x, y), (x + w, y + h), color, 1)

            # Label banner
            cv2.rectangle(
                display_frame,
                (x, max(0, y - 26)),
                (x + w, max(26, y)),
                (15, 23, 42),
                -1
            )
            cv2.putText(
                display_frame,
                label,
                (x + 4, max(18, y - 8)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.45,
                color,
                1
            )

        with self.lock:
            self.latest_processed_frame = display_frame

        return display_frame

    # ==================================================
    # FACE RECOGNITION
    # ==================================================

    def recognize_face(self, face):
        if not self.model_loaded:
            return {
                "recognized": False,
                "nid": None,
                "fingerprint_id": None,
                "confidence": None,
                "status": "MODEL_NOT_TRAINED"
            }

        try:
            with self.model_lock:
                label, confidence = self.recognizer.predict(face)

            fingerprint_id = int(label)

            # In LBPH, lower confidence distance means higher similarity
            if confidence > FACE_CONFIDENCE_THRESHOLD:
                result = {
                    "recognized": False,
                    "nid": None,
                    "fingerprint_id": fingerprint_id,
                    "confidence": float(confidence),
                    "status": "UNKNOWN_FACE"
                }
            else:
                nid = self.get_registered_identity(fingerprint_id)
                if nid is None:
                    result = {
                        "recognized": False,
                        "nid": None,
                        "fingerprint_id": fingerprint_id,
                        "confidence": float(confidence),
                        "status": "UNREGISTERED_ID"
                    }
                else:
                    result = {
                        "recognized": True,
                        "nid": nid,
                        "fingerprint_id": fingerprint_id,
                        "confidence": float(confidence),
                        "status": "RECOGNIZED"
                    }

            with self.lock:
                self.latest_result = result.copy()

            return result

        except Exception as error:
            print("[RECOGNITION ERROR]", error)
            return {
                "recognized": False,
                "nid": None,
                "fingerprint_id": None,
                "confidence": None,
                "status": "ERROR"
            }

    # ==================================================
    # ENROLLMENT SAMPLES & MODEL TRAINING
    # ==================================================

    def capture_faces(self, count=FACE_CAPTURE_COUNT):
        if not self.camera_connected:
            raise RuntimeError("Camera is offline. Please verify ESP32-S3 Wi-Fi connection and camera stream.")

        samples = []
        deadline = time.time() + 45
        last_captured_frame_id = -1

        print(f"[ENROLLMENT] Capturing {count} samples...")

        while len(samples) < count and time.time() < deadline:
            with self.lock:
                if self.latest_raw_frame is None:
                    frame = None
                    current_frame_id = -1
                else:
                    frame = self.latest_raw_frame.copy()
                    current_frame_id = self.frame_id

            if frame is None or current_frame_id == last_captured_frame_id:
                time.sleep(0.05)
                continue

            last_captured_frame_id = current_frame_id
            gray, faces = self.detect_faces(frame)

            if len(faces) == 1:
                x, y, w, h = faces[0]
                if w >= 70 and h >= 70:
                    face = gray[y:y + h, x:x + w]
                    face = cv2.resize(face, (FACE_WIDTH, FACE_HEIGHT))
                    samples.append(face)
                    time.sleep(0.15)
            else:
                time.sleep(0.05)

        if len(samples) < 5:
            raise RuntimeError(f"Insufficient face samples captured ({len(samples)}/{count}). Ensure subject is facing the camera clearly.")

        return samples

    def save_face_samples(self, fingerprint_id, samples):
        person_directory = os.path.join(FACE_DATA_DIR, str(fingerprint_id))
        os.makedirs(person_directory, exist_ok=True)

        saved = 0
        for idx, sample in enumerate(samples):
            filepath = os.path.join(person_directory, f"{idx + 1:03d}.jpg")
            if cv2.imwrite(filepath, sample):
                saved += 1
        return saved

    def train_model(self):
        faces = []
        labels = []

        if not os.path.exists(FACE_DATA_DIR):
            return 0

        for folder_name in os.listdir(FACE_DATA_DIR):
            folder_path = os.path.join(FACE_DATA_DIR, folder_name)
            if not os.path.isdir(folder_path):
                continue

            try:
                fp_id = int(folder_name)
            except ValueError:
                continue

            for img_name in os.listdir(folder_path):
                if not img_name.lower().endswith((".jpg", ".jpeg", ".png")):
                    continue
                img_path = os.path.join(folder_path, img_name)
                img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
                if img is None:
                    continue
                img = cv2.resize(img, (FACE_WIDTH, FACE_HEIGHT))
                faces.append(img)
                labels.append(fp_id)

        if len(faces) < 5:
            print(f"[MODEL] Insufficient samples to train ({len(faces)} images found)")
            return len(faces)

        labels_arr = np.array(labels, dtype=np.int32)
        with self.model_lock:
            self.recognizer.train(faces, labels_arr)
            self.recognizer.write(MODEL_PATH)
            self.model_loaded = True

        print(f"[MODEL] Successfully trained on {len(faces)} images for {len(set(labels))} profiles")
        return len(faces)

    def load_model(self):
        if not os.path.exists(MODEL_PATH):
            self.model_loaded = False
            return False

        try:
            with self.model_lock:
                self.recognizer.read(MODEL_PATH)
                self.model_loaded = True
            print("[MODEL] Model loaded from disk")
            return True
        except Exception as err:
            print("[MODEL ERROR]", err)
            self.model_loaded = False
            return False

    # ==================================================
    # ACCESSORS & HUD STANDBY STREAM
    # ==================================================

    def get_latest_frame(self):
        with self.lock:
            if self.camera_connected and self.latest_processed_frame is not None:
                return self.latest_processed_frame.copy()

        # Standby HUD frame when camera is offline
        return self._generate_standby_frame()

    def _generate_standby_frame(self):
        # 640x360 security standby monitor frame
        h, w = 360, 640
        frame = np.zeros((h, w, 3), dtype=np.uint8)
        frame[:] = (11, 15, 23) # Dark navy background

        # Subtle cyber grid
        for gx in range(0, w, 40):
            cv2.line(frame, (gx, 0), (gx, h), (18, 26, 40), 1)
        for gy in range(0, h, 40):
            cv2.line(frame, (0, gy), (w, gy), (18, 26, 40), 1)

        # Center target reticle
        cx, cy = w // 2, h // 2
        cv2.circle(frame, (cx, cy), 65, (30, 41, 59), 1)
        cv2.circle(frame, (cx, cy), 68, (37, 99, 235), 1)
        cv2.line(frame, (cx - 80, cy), (cx - 50, cy), (6, 182, 212), 1)
        cv2.line(frame, (cx + 50, cy), (cx + 80, cy), (6, 182, 212), 1)
        cv2.line(frame, (cx, cy - 80), (cx, cy - 50), (6, 182, 212), 1)
        cv2.line(frame, (cx, cy + 50), (cx, cy + 80), (6, 182, 212), 1)

        # Status text
        now_str = time.strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(frame, "NID SECUREGUARD - BIOMETRIC EDGE RETICLE", (25, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (6, 182, 212), 1)
        cv2.putText(frame, f"TIMESTAMP: {now_str} UTC", (25, 58), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (148, 163, 184), 1)

        # Offline warning badge
        cv2.rectangle(frame, (cx - 190, cy + 95), (cx + 190, cy + 130), (15, 23, 42), -1)
        cv2.rectangle(frame, (cx - 190, cy + 95), (cx + 190, cy + 130), (239, 68, 68), 1)
        cv2.circle(frame, (cx - 170, cy + 112), 5, (239, 68, 68), -1)
        cv2.putText(frame, "CAMERA OFFLINE: ESP32-S3 NOT CONNECTED", (cx - 150, cy + 117), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (241, 245, 249), 1)

        cv2.putText(frame, f"Stream Target: {ESP32_STREAM_ENDPOINT}", (25, h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (100, 116, 139), 1)
        return frame

    def get_status(self):
        with self.lock:
            return {
                "camera_connected": self.camera_connected,
                "model_loaded": self.model_loaded,
                "face_detected": self.face_detected,
                "face_count": self.face_count,
                "status": self.latest_result.get("status"),
                "recognized": self.latest_result.get("recognized"),
                "nid": self.latest_result.get("nid"),
                "fingerprint_id": self.latest_result.get("fingerprint_id"),
                "confidence": self.latest_result.get("confidence")
            }
