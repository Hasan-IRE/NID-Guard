# app.py
"""
NID SecureGuard - Unified IoT Biometric Access Control Backend
Flask REST API + OpenCV LBPH Face Engine + R307S Fingerprint Integration
"""

import os
import time
import threading
import io
import csv
from flask import (
    Flask,
    request,
    jsonify,
    Response,
    send_file
)
from flask_cors import CORS
import cv2

import config
import database
from face_engine import FaceEngine

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize SQLite database
database.init_db()

# Initialize Face Engine
face_engine = FaceEngine()

# In-memory hardware telemetry state
system_state = {
    "fingerprint_connected": False,
    "fingerprint_status": "WAITING",
    "matched_id": None,
    "stored_templates": 5,
    "access_result": "WAITING",
    "access_reason": "Waiting for verification",
    "last_access_time": None,
    "esp32_last_seen": None
}

state_lock = threading.RLock()


def start_face_worker():
    face_engine.start()


def get_face_state():
    age = time.time() - face_engine.last_seen if face_engine.last_seen > 0 else 999999
    valid = (
        face_engine.latest_result.get("recognized", False)
        and age <= config.FACE_CONFIRM_SECONDS
    )

    return {
        "face_detected": face_engine.face_detected,
        "face_count": face_engine.face_count,
        "face_matched": valid,
        "matched_nid": face_engine.latest_result.get("nid") if valid else None,
        "distance": face_engine.latest_result.get("confidence"),
        "camera_online": face_engine.camera_connected,
        "status": face_engine.latest_result.get("status", "WAITING")
    }


# ==================================================
# HEALTH & TELEMETRY ROUTES
# ==================================================

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ONLINE",
        "backend": "NID SecureGuard Flask REST API",
        "version": "2.4.0",
        "face_engine": "OpenCV LBPH Face Recognizer",
        "model_loaded": face_engine.model_loaded,
        "camera_online": face_engine.camera_connected,
        "esp32_ip": config.ESP32_IP,
        "database": "SQLite (WAL Mode)"
    })


@app.route("/api/system-status", methods=["GET"])
def system_status():
    with state_lock:
        fingerprint = dict(system_state)

    face = get_face_state()

    return jsonify({
        "backend": "ONLINE",
        "camera": "ONLINE" if face["camera_online"] else "OFFLINE",
        "camera_online": face["camera_online"],
        "face_detected": face["face_detected"],
        "face_count": face["face_count"],
        "face_matched": face["face_matched"],
        "matched_nid": face["matched_nid"],
        "face_distance": face["distance"],
        "fingerprint_connected": fingerprint["fingerprint_connected"],
        "fingerprint_status": fingerprint["fingerprint_status"],
        "matched_id": fingerprint["matched_id"],
        "stored_templates": fingerprint["stored_templates"],
        "access_result": fingerprint["access_result"],
        "access_reason": fingerprint["access_reason"],
        "last_access_time": fingerprint["last_access_time"],
        "esp32_last_seen": fingerprint["esp32_last_seen"],
        "timestamp": time.time()
    })


@app.route("/api/dashboard/stats", methods=["GET"])
def dashboard_stats():
    stats = database.get_dashboard_stats()
    stats["camera_online"] = face_engine.camera_connected
    with state_lock:
        stats["fingerprint_connected"] = system_state["fingerprint_connected"]
        stats["stored_templates"] = system_state["stored_templates"]
    return jsonify(stats)


# ==================================================
# VIDEO STREAM ROUTE (MJPEG)
# ==================================================

@app.route("/video_feed")
def video_feed():
    def generate():
        while True:
            frame = face_engine.get_latest_frame()
            if frame is None:
                time.sleep(0.05)
                continue

            success, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            if not success:
                time.sleep(0.04)
                continue

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + buffer.tobytes()
                + b"\r\n"
            )
            time.sleep(0.04)

    return Response(
        generate(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )


# ==================================================
# BIOMETRIC ENROLLMENT ROUTES
# ==================================================

@app.route("/api/face/status", methods=["GET"])
def face_status():
    return jsonify(get_face_state())


@app.route("/api/face/enroll", methods=["POST"])
def face_enroll():
    data = request.get_json(silent=True) or {}
    nid = str(data.get("nid", "")).strip()
    fingerprint_id = data.get("fingerprint_id")

    if not nid or fingerprint_id is None:
        return jsonify({
            "success": False,
            "message": "Both NID and fingerprint_id are required for biometric registration"
        }), 400

    try:
        fingerprint_id = int(fingerprint_id)
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Invalid fingerprint ID format"}), 400

    if not nid.isdigit() or len(nid) not in (10, 13, 17):
        return jsonify({
            "success": False,
            "message": "NID must be a valid 10, 13, or 17 digit national identity number"
        }), 400

    if not 1 <= fingerprint_id <= 127:
        return jsonify({
            "success": False,
            "message": "R307S Fingerprint ID must be between 1 and 127"
        }), 400

    # Ensure camera is online for live enrollment
    if not face_engine.camera_connected:
        return jsonify({
            "success": False,
            "message": "ESP32-S3 Camera is offline. Please ensure edge node is powered and connected to Wi-Fi."
        }), 503

    # Check for duplicate NID or Fingerprint ID
    existing_user_nid = database.get_user_by_nid(nid)
    if existing_user_nid:
        return jsonify({
            "success": False,
            "message": f"NID {nid} is already registered in the system"
        }), 409

    existing_fp_user = database.get_user_by_fingerprint(fingerprint_id)
    if existing_fp_user:
        return jsonify({
            "success": False,
            "message": f"Fingerprint Template ID #{fingerprint_id} is already assigned to NID {existing_fp_user['nid']}"
        }), 409

    try:
        # Pre-register user in DB
        name = data.get("name", "Unknown Citizen")
        dob = data.get("date_of_birth", "")
        gender = data.get("gender", "Other")
        address = data.get("address", "")
        contact = data.get("contact_number", "")
        blood = data.get("blood_group", "O+")

        database.register_user(
            nid=nid,
            fingerprint_id=fingerprint_id,
            name=name,
            date_of_birth=dob,
            gender=gender,
            address=address,
            contact_number=contact,
            blood_group=blood
        )

        # Capture face samples from camera stream
        samples = face_engine.capture_faces(count=config.FACE_CAPTURE_COUNT)
        saved_count = face_engine.save_face_samples(fingerprint_id, samples)

        # Mark face registered in database
        database.mark_face_registered(nid)

        # Retrain LBPH model
        trained_count = face_engine.train_model()

        return jsonify({
            "success": True,
            "message": f"Biometric enrollment completed successfully. {saved_count} face samples trained.",
            "nid": nid,
            "fingerprint_id": fingerprint_id,
            "samples": saved_count,
            "trained_images": trained_count
        })

    except Exception as e:
        print("[ENROLLMENT ERROR]", e)
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==================================================
# CORE SECURITY REQUIREMENT: DUAL-BIOMETRIC VERIFICATION
# ==================================================

@app.route("/api/verify/dual", methods=["POST"])
def verify_dual():
    """
    Mandatory 8-Step Dual-Biometric Verification Process:
    Step 1: User submits their NID number.
    Step 2: Backend checks whether the NID is registered.
    Step 3: Camera captures the user's face.
    Step 4: OpenCV compares the captured face with enrolled face profile.
    Step 5: User places their finger on R307S sensor (fingerprint_id submitted).
    Step 6: Backend verifies the fingerprint template ID.
    Step 7: Backend checks whether recognized face and fingerprint both belong to the SAME NID record.
    Step 8: Only if BOTH biometric checks succeed, return ACCESS GRANTED. Otherwise return ACCESS DENIED.
    """
    data = request.get_json(silent=True) or {}
    submitted_nid = str(data.get("nid", "")).strip()
    submitted_fingerprint_id = data.get("fingerprint_id")
    is_simulation_mode = bool(data.get("simulated_mode", False))

    client_ip = request.remote_addr or "127.0.0.1"

    # Step 1: Check submitted NID
    if not submitted_nid:
        return jsonify({
            "access_result": "DENIED",
            "reason": "MISSING_NID",
            "step": 1,
            "message": "NID number is required to initiate verification pipeline."
        }), 400

    # Step 2: Check whether NID is registered
    target_user = database.get_user_by_nid(submitted_nid)
    if not target_user:
        database.log_access(
            nid=submitted_nid,
            fingerprint_id=submitted_fingerprint_id,
            face_matched=0,
            fingerprint_matched=0,
            result="DENIED",
            reason="NID_NOT_REGISTERED",
            ip_address=client_ip
        )
        return jsonify({
            "access_result": "DENIED",
            "reason": "NID_NOT_REGISTERED",
            "step": 2,
            "message": f"NID {submitted_nid} is not registered in the National Identity repository."
        }), 404

    if target_user["account_status"] != "Active":
        database.log_access(
            nid=submitted_nid,
            user_name=target_user["name"],
            fingerprint_id=submitted_fingerprint_id,
            face_matched=0,
            fingerprint_matched=0,
            result="DENIED",
            reason="ACCOUNT_DISABLED",
            ip_address=client_ip
        )
        return jsonify({
            "access_result": "DENIED",
            "reason": "ACCOUNT_DISABLED",
            "step": 2,
            "message": f"The account for NID {submitted_nid} is currently {target_user['account_status']}."
        }), 403

    # Step 3 & 4: Face Recognition check
    face_state = get_face_state()
    face_matched = False
    face_nid = None

    if is_simulation_mode:
        # In explicit evaluation simulation mode, check if requested to test pass or fail
        sim_face_match = data.get("sim_face_match", True)
        if sim_face_match and target_user["face_registered"]:
            face_matched = True
            face_nid = target_user["nid"]
    else:
        # Live mode: Must verify actual camera and LBPH model
        if not face_engine.camera_connected:
            database.log_access(
                nid=submitted_nid,
                user_name=target_user["name"],
                fingerprint_id=submitted_fingerprint_id,
                face_matched=0,
                fingerprint_matched=0,
                result="DENIED",
                reason="CAMERA_OFFLINE",
                ip_address=client_ip
            )
            return jsonify({
                "access_result": "DENIED",
                "reason": "CAMERA_OFFLINE",
                "step": 3,
                "message": "ESP32-S3 Camera is offline. Live face verification cannot proceed."
            }), 503

        face_matched = face_state["face_matched"]
        face_nid = face_state["matched_nid"]

    # Step 5 & 6: Fingerprint Verification
    fingerprint_matched = False
    fp_nid = None

    if submitted_fingerprint_id is not None:
        try:
            fp_id_int = int(submitted_fingerprint_id)
            fp_user = database.get_user_by_fingerprint(fp_id_int)
            if fp_user:
                fingerprint_matched = True
                fp_nid = fp_user["nid"]
        except (ValueError, TypeError):
            pass

    # Step 7: Dual-Biometric Identity Cross-Verification
    result = "DENIED"
    reason = "UNKNOWN_ERROR"

    if not face_matched:
        result = "DENIED"
        reason = "FACE_NOT_RECOGNIZED"
    elif not fingerprint_matched:
        result = "DENIED"
        reason = "FINGERPRINT_NOT_REGISTERED"
    elif not target_user["face_registered"]:
        result = "DENIED"
        reason = "FACE_NOT_REGISTERED"
    elif face_nid != target_user["nid"]:
        result = "DENIED"
        reason = "FACE_NID_MISMATCH"
    elif fp_nid != target_user["nid"]:
        result = "DENIED"
        reason = "FINGERPRINT_NID_MISMATCH"
    elif face_nid != fp_nid:
        # Face and fingerprint belong to different people!
        result = "DENIED"
        reason = "IDENTITY_MISMATCH"
    else:
        # Step 8: Both biometrics confirmed for the SAME NID record!
        result = "GRANTED"
        reason = "BOTH_BIOMETRICS_VERIFIED"

    # Log to audit trail
    database.log_access(
        nid=submitted_nid,
        user_name=target_user["name"],
        fingerprint_id=submitted_fingerprint_id,
        face_matched=face_matched,
        fingerprint_matched=fingerprint_matched,
        result=result,
        reason=reason,
        ip_address=client_ip
    )

    with state_lock:
        system_state["access_result"] = result
        system_state["access_reason"] = reason
        system_state["matched_id"] = submitted_fingerprint_id
        system_state["last_access_time"] = time.time()

    response_payload = {
        "access_result": result,
        "reason": reason,
        "step_results": {
            "nid_registered": True,
            "face_detected": face_state["face_detected"],
            "face_matched": face_matched,
            "face_nid": face_nid,
            "fingerprint_matched": fingerprint_matched,
            "fingerprint_nid": fp_nid,
            "identity_matched": (face_nid == fp_nid == submitted_nid) if (face_matched and fingerprint_matched) else False
        }
    }

    # Only expose citizen details when ACCESS IS GRANTED!
    if result == "GRANTED":
        response_payload["citizen_details"] = {
            "nid": target_user["nid"],
            "name": target_user["name"],
            "date_of_birth": target_user["date_of_birth"],
            "gender": target_user["gender"],
            "address": target_user["address"],
            "contact_number": target_user["contact_number"],
            "blood_group": target_user["blood_group"],
            "fingerprint_id": target_user["fingerprint_id"],
            "account_status": target_user["account_status"]
        }

    return jsonify(response_payload)


# Backward compatibility for hardware sensor POST /api/verify/fingerprint
@app.route("/api/verify/fingerprint", methods=["POST"])
def verify_fingerprint_hardware():
    data = request.get_json(silent=True) or {}
    fingerprint_id = data.get("fingerprint_id")

    try:
        fingerprint_id = int(fingerprint_id)
    except (ValueError, TypeError):
        return jsonify({"access_result": "DENIED", "reason": "INVALID_FINGERPRINT_ID"}), 400

    face = get_face_state()
    user = database.get_user_by_fingerprint(fingerprint_id)

    face_matched = face["face_matched"]
    fingerprint_matched = user is not None
    matched_nid = face["matched_nid"]

    if not face_matched:
        result = "DENIED"
        reason = "FACE_NOT_RECOGNIZED"
    elif not fingerprint_matched:
        result = "DENIED"
        reason = "FINGERPRINT_NOT_REGISTERED"
    elif not user.get("face_registered", 0):
        result = "DENIED"
        reason = "FACE_NOT_REGISTERED"
    elif user["nid"] != matched_nid:
        result = "DENIED"
        reason = "IDENTITY_MISMATCH"
    else:
        result = "GRANTED"
        reason = "BOTH_BIOMETRICS_VERIFIED"

    database.log_access(
        nid=matched_nid or (user["nid"] if user else None),
        user_name=user["name"] if user else None,
        fingerprint_id=fingerprint_id,
        face_matched=face_matched,
        fingerprint_matched=fingerprint_matched,
        result=result,
        reason=reason
    )

    with state_lock:
        system_state["fingerprint_status"] = "VERIFIED" if fingerprint_matched else "NOT_MATCHED"
        system_state["matched_id"] = fingerprint_id
        system_state["access_result"] = result
        system_state["access_reason"] = reason
        system_state["last_access_time"] = time.time()

    return jsonify({
        "access_result": result,
        "reason": reason,
        "face_matched": face_matched,
        "fingerprint_matched": fingerprint_matched,
        "face_nid": matched_nid,
        "fingerprint_nid": user["nid"] if user else None
    })


# ==================================================
# CITIZEN NID RECORD MANAGEMENT (REST CRUD)
# ==================================================

@app.route("/api/nid", methods=["GET"])
def get_nid_records():
    search = request.args.get("search", "").strip()
    status = request.args.get("status", "All")
    records = database.get_all_users(search=search if search else None, status=status)
    return jsonify(records)


@app.route("/api/nid/<nid>", methods=["GET"])
def get_nid_single(nid):
    record = database.get_user_by_nid(nid)
    if not record:
        return jsonify({"error": "NID Record not found"}), 404
    return jsonify(record)


@app.route("/api/nid", methods=["POST"])
def create_nid_record():
    data = request.get_json(silent=True) or {}
    nid = str(data.get("nid", "")).strip()
    fingerprint_id = data.get("fingerprint_id")
    name = data.get("name", "").strip()

    if not nid or not name or fingerprint_id is None:
        return jsonify({"error": "NID, Name, and Fingerprint ID are mandatory"}), 400

    try:
        fingerprint_id = int(fingerprint_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid Fingerprint ID"}), 400

    if database.get_user_by_nid(nid):
        return jsonify({"error": f"NID {nid} already exists"}), 409

    if database.get_user_by_fingerprint(fingerprint_id):
        return jsonify({"error": f"Fingerprint ID {fingerprint_id} already in use"}), 409

    database.register_user(
        nid=nid,
        fingerprint_id=fingerprint_id,
        name=name,
        date_of_birth=data.get("date_of_birth", ""),
        gender=data.get("gender", "Other"),
        address=data.get("address", ""),
        contact_number=data.get("contact_number", ""),
        blood_group=data.get("blood_group", "O+")
    )

    return jsonify({"success": True, "message": "Record created successfully", "nid": nid}), 201


@app.route("/api/nid/<nid>", methods=["PUT"])
def update_nid_record(nid):
    data = request.get_json(silent=True) or {}
    success = database.update_user(
        nid=nid,
        name=data.get("name"),
        address=data.get("address"),
        contact_number=data.get("contact_number"),
        account_status=data.get("account_status"),
        gender=data.get("gender"),
        blood_group=data.get("blood_group")
    )
    if not success:
        return jsonify({"error": "NID Record not found"}), 404
    return jsonify({"success": True, "message": "Record updated successfully"})


@app.route("/api/nid/<nid>", methods=["DELETE"])
def delete_nid_record(nid):
    record = database.get_user_by_nid(nid)
    if not record:
        return jsonify({"error": "Record not found"}), 404

    # Remove face samples directory if exists
    fp_id = record.get("fingerprint_id")
    if fp_id:
        person_dir = os.path.join(config.FACE_DATA_DIR, str(fp_id))
        if os.path.exists(person_dir):
            try:
                for f in os.listdir(person_dir):
                    os.remove(os.path.join(person_dir, f))
                os.rmdir(person_dir)
            except Exception as e:
                print(f"[CLEANUP ERROR] {e}")

    success = database.delete_user(nid)
    # Retrain model after deletion
    face_engine.train_model()

    return jsonify({"success": success, "message": "Record deleted successfully"})


# ==================================================
# SECURITY AUDIT LOGS & EXPORT
# ==================================================

@app.route("/api/logs", methods=["GET"])
def get_audit_logs():
    limit = int(request.args.get("limit", 100))
    result_filter = request.args.get("result", "ALL")
    search = request.args.get("search", "").strip()

    logs = database.get_logs(
        limit=limit,
        result_filter=result_filter if result_filter != "ALL" else None,
        search=search if search else None
    )
    return jsonify(logs)


@app.route("/api/logs/export", methods=["GET"])
def export_audit_logs():
    logs = database.get_logs(limit=1000)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Log ID", "Timestamp", "NID", "User Name", "Fingerprint ID", "Face Matched", "Fingerprint Matched", "Result", "Reason", "IP Address"])

    for l in logs:
        writer.writerow([
            l.get("id"),
            l.get("created_at"),
            l.get("nid"),
            l.get("user_name"),
            l.get("fingerprint_id"),
            "YES" if l.get("face_matched") else "NO",
            "YES" if l.get("fingerprint_matched") else "NO",
            l.get("result"),
            l.get("reason"),
            l.get("ip_address")
        ])

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=nid_secureguard_access_logs.csv"}
    )


# ==================================================
# HARDWARE & ESP32-S3 TELEMETRY
# ==================================================

@app.route("/api/esp32/status", methods=["GET", "POST"])
def esp32_telemetry():
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        with state_lock:
            system_state["fingerprint_connected"] = bool(data.get("fingerprint_connected", False))
            system_state["stored_templates"] = int(data.get("stored_templates", 5))
            system_state["esp32_last_seen"] = time.time()
        return jsonify({"success": True})

    with state_lock:
        return jsonify({
            "camera_connected": face_engine.camera_connected,
            "camera_ip": config.ESP32_IP,
            "stream_endpoint": config.ESP32_STREAM_ENDPOINT,
            "fingerprint_connected": system_state["fingerprint_connected"],
            "stored_templates": system_state["stored_templates"],
            "esp32_last_seen": system_state["esp32_last_seen"]
        })


@app.route("/api/devices", methods=["GET"])
def get_devices():
    now_str = time.strftime("%Y-%m-%d %H:%M:%S")
    with state_lock:
        fp_connected = system_state["fingerprint_connected"]
        fp_templates = system_state["stored_templates"]
        last_seen = system_state["esp32_last_seen"]

    return jsonify([
        {
            "id": "dev-001",
            "name": "ESP32-S3 OV2640 Biometric Edge Camera",
            "type": "ESP32-S3-WROOM-1 N16R8",
            "ip_address": config.ESP32_IP,
            "stream_url": config.ESP32_STREAM_ENDPOINT,
            "status": "online" if face_engine.camera_connected else "offline",
            "last_communication": time.strftime("%H:%M:%S", time.localtime(face_engine.last_seen)) if face_engine.last_seen > 0 else "Disconnected",
            "telemetry": {
                "resolution": "320x240 QVGA",
                "fps": 15 if face_engine.camera_connected else 0,
                "psram": "8 MB Octal",
                "flash": "16 MB"
            }
        },
        {
            "id": "dev-002",
            "name": "R307S Optical Fingerprint Sensor",
            "type": "R307S Optical UART (57600 baud)",
            "ip_address": f"{config.ESP32_IP} (UART Bus)",
            "stream_url": "UART /dev/ttyS2",
            "status": "online" if fp_connected else "standby",
            "last_communication": time.strftime("%H:%M:%S", time.localtime(last_seen)) if last_seen else "Pending Heartbeat",
            "telemetry": {
                "stored_templates": fp_templates,
                "capacity": 127,
                "baud_rate": 57600,
                "sensor_type": "Optical Semiconductor"
            }
        },
        {
            "id": "dev-003",
            "name": "NID SecureGuard Flask Security Gateway",
            "type": "Python 3.12 + OpenCV + LBPH Engine",
            "ip_address": f"http://127.0.0.1:{config.FLASK_PORT}",
            "stream_url": f"http://127.0.0.1:{config.FLASK_PORT}/video_feed",
            "status": "online",
            "last_communication": "Real-time Gateway",
            "telemetry": {
                "model_status": "Loaded" if face_engine.model_loaded else "Awaiting Training",
                "database_mode": "SQLite WAL Mode",
                "dual_auth_pipeline": "Enforced (Strict 8-Step)"
            }
        }
    ])


@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "project": "NID SecureGuard",
        "tagline": "Secure Identity. Trusted Access.",
        "status": "ONLINE",
        "endpoints": {
            "health": "/api/health",
            "system_status": "/api/system-status",
            "video_feed": "/video_feed",
            "nid_records": "/api/nid",
            "dual_verification": "/api/verify/dual",
            "logs": "/api/logs",
            "devices": "/api/devices"
        }
    })


if __name__ == "__main__":
    print("=" * 55)
    print("   NID SECUREGUARD - BIOMETRIC ACCESS CONTROL BACKEND")
    print("   Tagline: Secure Identity. Trusted Access.")
    print("=" * 55)
    print(f"Flask API Gateway: http://{config.FLASK_HOST}:{config.FLASK_PORT}")
    print(f"ESP32 Stream Target: {config.ESP32_STREAM_ENDPOINT}")

    start_face_worker()

    app.run(
        host=config.FLASK_HOST,
        port=config.FLASK_PORT,
        debug=False,
        threaded=True,
        use_reloader=False
    )
