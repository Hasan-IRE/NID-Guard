# NID SecureGuard — ESP32-S3 & R307S Hardware Setup Guide

## 1. সার্কিট কানেকশন (Wiring Diagram)

### R307S Fingerprint Sensor ──► ESP32-S3
| R307S তারের রঙ | সিগন্যাল | ESP32-S3 পিন |
|---|---|---|
| **Red** | VCC | **3.3V** বা **5V / VIN** |
| **Black** | GND | **GND** |
| **Yellow** | TX | **GPIO 17** (RX2) |
| **Green** | RX | **GPIO 18** (TX2) |
| **Blue** | Touch Out | *Optional (খোলা রাখতে পারেন)* |
| **White** | 3.3V Out | *Not connected* |

### OV2640 Camera
ESP32-S3-CAM মডিউলের অন-বোর্ড FPC ক্যামেরা স্লটে OV2640 রিবন ক্যাবলটি সরাসরি যুক্ত থাকে।

---

## 2. Arduino IDE কনফিগারেশন

1. **Board Manager:**
   - **Tools -> Board -> esp32 -> "ESP32S3 Dev Module"**
   - **Flash Size:** "16MB (128Mb)"
   - **PSRAM:** "OPI PSRAM"
   - **Partition Scheme:** "Huge APP (3MB No OTA/1MB SPIFFS)" বা "16M Flash"

2. **লাইব্রেরি ইনস্টল:**
   - Arduino IDE-তে গিয়ে **Sketch -> Include Library -> Manage Libraries** ওপেন করুন।
   - সার্চ বক্সে লিখুন: **Adafruit Fingerprint Sensor Library** এবং Install বাটনে চাপুন।

---

## 3. কোড আপলোড করার আগে ২টি সেটিংস পরিবর্তন

`firmware/esp32s3_nid_secureguard/esp32s3_nid_secureguard.ino` ফাইলটি ওপেন করে এই লাইনগুলো ঠিক করুন:

1. **Wi-Fi ইনফরমেশন (লাইন ১৯-২০):**
   ```cpp
   const char* WIFI_SSID     = "YOUR_WIFI_NAME";     // আপনার রাউটার বা মোবাইলের হটস্পটের নাম
   const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"; // পাসওয়ার্ড
   ```

2. **ল্যাপটপের IP Address (লাইন ২৬):**
   - ল্যাপটপের টার্মিনালে `ipconfig` লিখে আপনার Wi-Fi IPv4 Address টি দেখে নিন (যেমন: `192.168.1.100`):
   ```cpp
   const char* BACKEND_SERVER_IP = "192.168.1.100"; // ল্যাপটপের IP
   ```

3. **Upload করুন:**
   - ESP32-S3-কে USB দিয়ে কানেক্ট করুন এবং Upload বাটনে ক্লিক করুন।
   - আপলোড হয়ে গেলে **Serial Monitor (115200 baud)** ওপেন করুন।
   - ESP32-এর আইপি দেখা যাবে (যেমন: `192.168.1.105`)।

---

## 4. Flask Backend-এর সাথে যুক্ত করা

Serial Monitor-এ ESP32-এর যে IP আসবে, সেটি `backend/config.py`-তে বসিয়ে দিন:
```python
ESP32_IP = "192.168.1.105" # Serial Monitor-এ পাওয়া ESP32-এর IP
```

এখন Flask ব্যাকএন্ড সরাসরি ESP32 ক্যামেরা থেকে লাইভ MJPEG ভিডিও স্ট্রিম নেবে এবং ফিঙ্গারপ্রিন্ট সেন্সর থেকে ম্যাচিং ডাটা রিসিভ করবে!
