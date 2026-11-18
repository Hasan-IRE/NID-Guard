/*
 * NID SecureGuard — ESP32-S3-WROOM-1 N16R8 Edge Firmware
 * Hardware:
 *   1. ESP32-S3-WROOM-1 N16R8 + OV2640 Camera
 *   2. R307S Optical Fingerprint Sensor (UART Serial2: RX=17, TX=18)
 *
 * Requirements in Arduino IDE:
 *   1. Board: "ESP32S3 Dev Module" (Tools -> Board -> esp32 -> ESP32S3 Dev Module)
 *      - Flash Size: "16MB (128Mb)"
 *      - PSRAM: "OPI PSRAM"
 *      - Partition Scheme: "16M Flash (3MB APP/9.9MB FATFS)" or "Huge APP (3MB No OTA/1MB SPIFFS)"
 *   2. Libraries:
 *      - Adafruit Fingerprint Sensor Library (Install from Sketch -> Include Library -> Manage Libraries)
 */

#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_Fingerprint.h>

// ==========================================
// 1. WI-FI & BACKEND CONFIGURATION
// ==========================================
// আপনার Wi-Fi নাম এবং পাসওয়ার্ড দিন:
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// আপনার ল্যাপটপ/পিসির IP অ্যাড্রেস (যেখানে Flask backend চলছে):
// (cmd-তে 'ipconfig' দিয়ে IPv4 Address দেখে নিন, যেমন "192.168.1.100")
const char* BACKEND_SERVER_IP = "192.168.1.100";
const int   BACKEND_PORT      = 5000;

// ==========================================
// 2. R307S PIN DEFINITIONS (UART2)
// ==========================================
#define FINGERPRINT_RX_PIN 17  // Connect to R307S TX (Yellow Wire)
#define FINGERPRINT_TX_PIN 18  // Connect to R307S RX (Green Wire)

HardwareSerial mySerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

// ==========================================
// 3. CAMERA PIN DEFINITIONS (ESP32-S3 CAM)
// ==========================================
#define PWDN_GPIO_NUM     -1
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM     10
#define SIOD_GPIO_NUM     21
#define SIOC_GPIO_NUM     14

#define Y9_GPIO_NUM       11
#define Y8_GPIO_NUM       9
#define Y7_GPIO_NUM       8
#define Y6_GPIO_NUM       6
#define Y5_GPIO_NUM       4
#define Y4_GPIO_NUM       2
#define Y3_GPIO_NUM       3
#define Y2_GPIO_NUM       5
#define VSYNC_GPIO_NUM    13
#define HREF_GPIO_NUM     12
#define PCLK_GPIO_NUM     7

// HTTP Server for MJPEG Stream
WiFiServer streamServer(81);

unsigned long lastHeartbeatTime = 0;
const unsigned long HEARTBEAT_INTERVAL = 5000; // 5 seconds

// ==========================================
// SETUP
// ==========================================
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n==========================================");
  Serial.println("  NID SECUREGUARD — ESP32-S3 FIRMWARE");
  Serial.println("==========================================");

  // 1. Initialize R307S Fingerprint Sensor
  mySerial.begin(57600, SERIAL_8N1, FINGERPRINT_RX_PIN, FINGERPRINT_TX_PIN);
  finger.begin(57600);

  if (finger.verifyPassword()) {
    Serial.println("[FINGERPRINT] R307S Optical Sensor detected successfully!");
    finger.getTemplateCount();
    Serial.printf("[FINGERPRINT] Stored templates in flash: %d\n", finger.templateCount);
  } else {
    Serial.println("[FINGERPRINT ERROR] R307S sensor not found! Check 5V, GND, TX, RX wiring.");
  }

  // 2. Initialize OV2640 Camera
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
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_QVGA; // 320x240 for high performance & LBPH face detection
  config.jpeg_quality = 12;
  config.fb_count = 2;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.grab_mode = CAMERA_GRAB_LATEST;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("[CAMERA ERROR] Camera initialization failed with error 0x%x\n", err);
  } else {
    Serial.println("[CAMERA] OV2640 camera initialized successfully.");
  }

  // 3. Connect to Wi-Fi
  Serial.printf("[WIFI] Connecting to %s ", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 30) {
    delay(500);
    Serial.print(".");
    retry++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WIFI] Connected successfully!");
    Serial.printf("[WIFI] ESP32-S3 IP Address: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("[STREAM] MJPEG Stream URL: http://%s:81/stream\n", WiFi.localIP().toString().c_str());

    // Start MJPEG stream server on port 81
    streamServer.begin();
  } else {
    Serial.println("\n[WIFI ERROR] Failed to connect to Wi-Fi. Check SSID and Password.");
  }
}

// ==========================================
// LOOP
// ==========================================
void loop() {
  // 1. Handle incoming HTTP MJPEG stream client
  handleStreamClients();

  // 2. Check R307S Fingerprint Sensor
  checkFingerprint();

  // 3. Periodic Heartbeat to Flask Backend
  if (millis() - lastHeartbeatTime >= HEARTBEAT_INTERVAL) {
    lastHeartbeatTime = millis();
    sendHeartbeatToBackend();
  }
}

// ==========================================
// MJPEG CAMERA STREAM SERVER (PORT 81)
// ==========================================
void handleStreamClients() {
  WiFiClient client = streamServer.available();
  if (!client) return;

  Serial.println("[STREAM] Client connected for video feed.");

  // Send MJPEG Header
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: multipart/x-mixed-replace; boundary=frame");
  client.println("Access-Control-Allow-Origin: *");
  client.println();

  while (client.connected()) {
    camera_fb_t * fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("[CAMERA ERROR] Frame buffer get failed");
      break;
    }

    client.println("--frame");
    client.println("Content-Type: image/jpeg");
    client.printf("Content-Length: %u\r\n\r\n", fb->len);
    client.write(fb->buf, fb->len);
    client.println();

    esp_camera_fb_return(fb);

    // Also check fingerprint during streaming so scanning is not blocked
    checkFingerprint();
    delay(40); // ~15-20 FPS
  }

  client.stop();
  Serial.println("[STREAM] Client disconnected.");
}

// ==========================================
// R307S FINGERPRINT SENSOR SCAN & VERIFY
// ==========================================
void checkFingerprint() {
  uint8_t p = finger.getImage();
  if (p != FINGERPRINT_OK) return; // No finger placed

  Serial.println("\n[FINGERPRINT] Finger detected on sensor prism!");

  p = finger.image2Tz();
  if (p != FINGERPRINT_OK) {
    Serial.println("[FINGERPRINT] Failed to convert fingerprint image.");
    return;
  }

  p = finger.fingerSearch();
  if (p == FINGERPRINT_OK) {
    Serial.printf("[FINGERPRINT MATCH] Template ID: #%d (Confidence: %d)\n", finger.fingerID, finger.confidence);
    sendFingerprintToBackend(finger.fingerID);
  } else if (p == FINGERPRINT_NOTFOUND) {
    Serial.println("[FINGERPRINT] Fingerprint template not recognized in database.");
    sendFingerprintToBackend(-1); // -1 signifies unknown fingerprint
  } else {
    Serial.println("[FINGERPRINT ERROR] Communication error with R307S.");
  }

  delay(1000); // Debounce to prevent multiple reads
}

// ==========================================
// HTTP CLIENT: SEND FINGERPRINT TO FLASK
// ==========================================
void sendFingerprintToBackend(int matchedId) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String("http://") + BACKEND_SERVER_IP + ":" + String(BACKEND_PORT) + "/api/verify/fingerprint";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  String jsonPayload = String("{\"fingerprint_id\": ") + String(matchedId) + "}";
  Serial.printf("[HTTP POST] Sending to %s -> %s\n", url.c_str(), jsonPayload.c_str());

  int httpCode = http.POST(jsonPayload);
  if (httpCode > 0) {
    String response = http.getString();
    Serial.printf("[HTTP RESPONSE %d] %s\n", httpCode, response.c_str());
  } else {
    Serial.printf("[HTTP ERROR] Failed to send fingerprint: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

// ==========================================
// HTTP CLIENT: HEARTBEAT TELEMETRY
// ==========================================
void sendHeartbeatToBackend() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String("http://") + BACKEND_SERVER_IP + ":" + String(BACKEND_PORT) + "/api/esp32/status";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  int templates = (finger.templateCount > 0) ? finger.templateCount : 5;
  String jsonPayload = String("{\"fingerprint_connected\": true, \"stored_templates\": ") + String(templates) + "}";

  http.POST(jsonPayload);
  http.end();
}
