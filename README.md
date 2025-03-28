# 🏍️ Motorcycle Tracker App - Android + IoT + Firebase

## 📌 Ringkasan Proyek
Aplikasi Android untuk melacak posisi sepeda motor secara real-time menggunakan **perangkat IoT**, **Firebase Realtime Database**, dan **Google Maps**. Selain itu, aplikasi ini dapat menghidupkan atau mematikan device secara langsung serta mendeteksi getaran yang dikirim dari device IoT ke aplikasi.

## 🛠 Teknologi yang Digunakan
- Android (Kotlin / Java)
- Firebase Realtime Database
- Google Maps SDK
- ESP32 / NodeMCU (Perangkat IoT)
- Sensor Getaran (Vibration Sensor)
- Wi-Fi Module (IoT to Firebase)

## 📂 Informasi Struktur Database
```json
{
  "device": {
    "status": "ON / OFF",
    "vibration": true / false,
    "location": {
      "latitude": 0.00000,
      "longitude": 0.00000
    }
  }
}

