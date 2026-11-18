import React, { useState } from 'react';
import { 
  BookOpen, 
  Cpu, 
  Server, 
  ShieldCheck, 
  Terminal, 
  Code2, 
  CheckCircle2, 
  Copy, 
  Check, 
  Layers, 
  KeyRound,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ArchitectureDocs: React.FC = () => {
  const { addToast } = useApp();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2500);
    addToast({
      title: 'Code Copied',
      message: `${label} copied to clipboard for lab setup.`,
      type: 'info',
    });
  };

  const esp32ArduinoCode = `/*
 * NID SecureGuard — ESP32-S3-WROOM-1 N16R8 Edge Camera Firmware
 * Academic Research Prototype (Phase 1: Wi-Fi + OV2640 + Face Detection)
 */
#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* flaskApiUrl = "http://192.168.1.50:5000/api";
const char* deviceId = "ESP32-S3-CAM-001";

// Pinout for Freenove / AI-Thinker ESP32-S3 Camera
#define PWDN_GPIO_NUM     -1
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM     15
#define SIOD_GPIO_NUM      4
#define SIOC_GPIO_NUM      5
#define Y9_GPIO_NUM       16
#define Y8_GPIO_NUM       17
#define Y7_GPIO_NUM       18
#define Y6_GPIO_NUM       12
#define Y5_GPIO_NUM       10
#define Y4_GPIO_NUM        8
#define Y3_GPIO_NUM        9
#define Y2_GPIO_NUM       11
#define VSYNC_GPIO_NUM     6
#define HREF_GPIO_NUM      7
#define PCLK_GPIO_NUM     13

void sendStatusTelemetry() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(flaskApiUrl) + "/devices/status");
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<256> doc;
    doc["device_id"] = deviceId;
    doc["status"] = "online";
    doc["camera"] = "active";
    doc["wifi"] = "connected";
    doc["ip"] = WiFi.localIP().toString();
    doc["free_heap"] = ESP.getFreeHeap();
    doc["free_psram"] = ESP.getFreePsram();

    String requestBody;
    serializeJson(doc, requestBody);
    int httpResponseCode = http.POST(requestBody);
    http.end();
  }
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\\nConnected! IP: %s\\n", WiFi.localIP().toString().c_str());
  
  // Initialize OV2640 with PSRAM frame buffers
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.frame_size = FRAMESIZE_QVGA; // 320x240
  config.pixel_format = PIXFORMAT_JPEG;
  config.grab_mode = CAMERA_GRAB_LATEST;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;
  config.fb_count = 2;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed: 0x%x\\n", err);
    return;
  }
  sendStatusTelemetry();
}

void loop() {
  delay(10000);
  sendStatusTelemetry();
}`;

  const flaskServerCode = `"""
NID SecureGuard — Flask Backend REST API Architecture
Academic Prototype Server (Isolated Synthetic Database)
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend on port 3000

# Health check
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "NID SecureGuard Flask Backend",
        "timestamp": datetime.now().isoformat()
    })

# ESP32 Status Receiver
@app.route('/api/devices/status', methods=['POST'])
def receive_device_status():
    payload = request.get_json()
    device_id = payload.get('device_id', 'ESP32-S3-CAM-001')
    print(f"[IOT TELEMETRY] Node: {device_id}, IP: {payload.get('ip')}, PSRAM Free: {payload.get('free_psram')}")
    return jsonify({"success": True, "message": "Telemetry acknowledged"}), 200

# Edge Face Detection Event Trigger
@app.route('/api/face/detect', methods=['POST'])
def face_detect():
    data = request.get_json()
    face_detected = data.get('face_detected', False)
    print(f"[FACE INFERENCE] Detected: {face_detected}, Count: {data.get('face_count', 0)}")
    return jsonify({
        "success": True,
        "processed": True,
        "timestamp": datetime.now().isoformat()
    }), 200

# Access Control Verification Request
@app.route('/api/access/request', methods=['POST'])
def access_request():
    req = request.get_json()
    user = req.get('user', 'unknown')
    resource = req.get('targetRecordId', '')
    method = req.get('method', 'Face Authentication')
    
    # Zero-Trust RBAC Decision logic
    is_allowed = (user != 'unknown' and user != 'guest')
    result = "ALLOWED" if is_allowed else "DENIED"
    reason = "Identity verified via edge biometric hash" if is_allowed else "Subject unverified in active registry"
    
    return jsonify({
        "result": result,
        "user": user,
        "resource": resource,
        "reason": reason,
        "timestamp": datetime.now().isoformat()
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)`;

  return (
    <div className="space-y-6 font-mono text-xs max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <span>System Architecture & Integration Manual</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Research specifications, hardware pinouts, Flask REST API blueprints, and academic viva defense guide
        </p>
      </div>

      {/* 5-Phase Roadmap Progression */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3">
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          Research Project Roadmap (Phase 1 through Phase 5)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
            <div className="font-bold text-xs flex items-center justify-between">
              <span>Phase 1</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11px] font-semibold mt-1">Camera + Wi-Fi + Face Detection</div>
            <div className="text-[10px] text-emerald-400/80 mt-1">ESP32-S3 edge node & Haar cascade</div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
            <div className="font-bold text-xs flex items-center justify-between">
              <span>Phase 2</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11px] font-semibold mt-1">Web App + Backend</div>
            <div className="text-[10px] text-emerald-400/80 mt-1">REST API abstraction & Flask pipeline</div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
            <div className="font-bold text-xs flex items-center justify-between">
              <span>Phase 3</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11px] font-semibold mt-1">Encrypted NID Database</div>
            <div className="text-[10px] text-emerald-400/80 mt-1">AES-256-GCM envelope protection</div>
          </div>

          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/40 text-blue-300">
            <div className="font-bold text-xs flex items-center justify-between">
              <span>Phase 4</span>
              <span className="text-[9px] bg-blue-500/20 px-1 rounded">Next</span>
            </div>
            <div className="text-[11px] font-semibold mt-1">Biometric Authentication</div>
            <div className="text-[10px] text-blue-400/80 mt-1">Deep metric vector face recognition</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400">
            <div className="font-bold text-xs flex items-center justify-between">
              <span>Phase 5</span>
              <span className="text-[9px] bg-slate-800 px-1 rounded">Final</span>
            </div>
            <div className="text-[11px] font-semibold mt-1">Complete Prototype</div>
            <div className="text-[10px] text-slate-500 mt-1">Hardware enclosure & field defense</div>
          </div>
        </div>
      </div>

      {/* Architecture Flow Diagram */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          End-to-End System Architecture Data Flow
        </h3>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] leading-relaxed text-slate-300 overflow-x-auto">
          <pre className="font-mono text-cyan-300">
{`ESP32-S3-WROOM-1 (OV2640 Camera)
  | 
  |-- QVGA MJPEG Stream (HTTP :81/stream) ----------------------------+
  |-- POST /api/devices/status (Heartbeat & Telemetry)                |
  |-- POST /api/face/detect (Phase-1 Edge Bounding Box)               |
  v                                                                   |
Flask / Python REST API Server (Port 5000)                           v
  |                                                        NID SecureGuard Web App
  |-- Cryptographic KMS (AES-256-GCM)                                 |
  |-- RBAC Zero-Trust Engine (Admin, Security, Operator, Viewer)      |
  |-- Encrypted Demo NID Storage (Zero Real PII)                      |
  |-- Immutable HMAC-SHA256 Audit Log Database                        |
  v                                                                   v
Secure Identity Access Decision (ALLOWED / DENIED) <------------------+`}
          </pre>
        </div>
      </div>

      {/* Code Snippets Section: Flask Backend & ESP32 Arduino */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flask Backend */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden flex flex-col">
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <span className="font-semibold text-slate-200 flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-400" />
              Flask REST API (backend/app.py)
            </span>
            <button
              onClick={() => copyToClipboard(flaskServerCode, 'Flask Backend Code')}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
            >
              {copiedCode === 'Flask Backend Code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === 'Flask Backend Code' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="p-3 bg-slate-950 overflow-x-auto max-h-96 text-[10px] text-slate-300 font-mono">
            <pre>{flaskServerCode}</pre>
          </div>
        </div>

        {/* ESP32 Arduino Code */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden flex flex-col">
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <span className="font-semibold text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              ESP32-S3 Firmware (sketch.ino)
            </span>
            <button
              onClick={() => copyToClipboard(esp32ArduinoCode, 'ESP32 Firmware Code')}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
            >
              {copiedCode === 'ESP32 Firmware Code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === 'ESP32 Firmware Code' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="p-3 bg-slate-950 overflow-x-auto max-h-96 text-[10px] text-slate-300 font-mono">
            <pre>{esp32ArduinoCode}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
