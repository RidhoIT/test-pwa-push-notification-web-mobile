PRD — PWA Push Notification Testing App

📌 Identitas Project
FieldKeteranganNama ProjectPWA Push Notification TesterDeskripsiAplikasi PWA satu halaman untuk testing push notification dengan fitur subscribe & installVersi Dokumen1.1.0Tanggal Pembuatan10 Maret 2026

📋 Product Overview
Aplikasi berbasis PWA (Progressive Web App) dengan tampilan satu halaman sederhana. Terdapat dua aksi utama — tombol Subscribe untuk mendaftarkan push notification, dan tombol Install untuk menginstall PWA ke home screen perangkat mobile. Cocok digunakan sebagai tools testing push notification oleh developer dan QA.

❗ Problem Statement

Tidak adanya tools sederhana untuk testing push notification berbasis PWA
Developer kesulitan memvalidasi apakah push notification berjalan dengan benar di berbagai perangkat
Proses subscribe notifikasi dan install PWA tidak ada dalam satu tampilan yang mudah digunakan


🎯 Goals / Objectives

Membuat PWA yang dapat diinstall di Android & iOS melalui tombol Install
Memvalidasi push notification berjalan setelah user klik Subscribe
Notifikasi diterima saat foreground maupun background
UI sesederhana mungkin, fokus pada dua aksi utama


👤 Target User / User Persona
PersonaKebutuhanMasalahTujuanDeveloperTools testing notifikasiTidak ada tools sederhanaMemastikan push notif berjalanQA TesterVerifikasi notifikasi di berbagai deviceTesting manual memakan waktuMempercepat proses QA

📖 User Stories

Sebagai developer, saya ingin menekan tombol Subscribe agar browser meminta izin notifikasi dan mendaftarkan device saya ke FCM.
Sebagai developer, saya ingin menerima push notification setelah Subscribe agar dapat memvalidasi notifikasi berjalan.
Sebagai developer, saya ingin menekan tombol Install agar PWA terinstall di home screen HP saya.
Sebagai QA tester, saya ingin testing notifikasi saat app di background agar memastikan service worker berjalan dengan benar.


✅ Functional Requirements
Tombol Subscribe:

Ketika diklik, browser meminta izin push notification
Jika user Allow → device terdaftar ke FCM → push notification dikirim otomatis sebagai konfirmasi
Jika user Deny → tampilkan pesan bahwa izin ditolak
Status subscribe tampil di UI (Subscribed / Not Subscribed)

Tombol Install:

Ketika diklik, memunculkan prompt install PWA (Add to Home Screen)
Tombol hanya tampil jika browser mendukung installasi PWA
Setelah terinstall, tombol berubah menjadi "Installed ✅"

Push Notification:

Notifikasi muncul saat app di foreground
Notifikasi muncul saat app di background / tertutup
Notifikasi menampilkan title, body, dan icon


🔒 Non-Functional Requirements

Aplikasi harus berjalan di HTTPS (wajib untuk PWA & push notification)
Responsif di mobile (Android & iOS)
Service Worker harus terdaftar dan aktif
Waktu loading < 3 detik
Kompatibel dengan Chrome Android & Safari iOS


🔄 User Flow
Flow Subscribe
User buka PWA
        ↓
User klik tombol "Subscribe"
        ↓
Browser tampilkan izin notifikasi
        ↓
User klik "Allow"
        ↓
Device terdaftar ke FCM
        ↓
Push notification dikirim otomatis
        ↓
Notifikasi muncul di device
        ↓
Status UI berubah → "Subscribed ✅"
Flow Install
User buka PWA di browser
        ↓
Tombol "Install" tampil (jika browser support)
        ↓
User klik tombol "Install"
        ↓
Browser tampilkan prompt "Add to Home Screen"
        ↓
User konfirmasi install
        ↓
PWA terinstall di home screen
        ↓
Tombol berubah → "Installed ✅"

📊 Success Metrics

Tombol Subscribe berhasil meminta izin dan mendaftarkan device ke FCM
Push notification muncul setelah Subscribe (foreground & background)
Tombol Install memunculkan prompt Add to Home Screen
PWA berhasil diinstall di Android & iOS
Service Worker terdaftar tanpa error
Waktu loading < 3 detik


🛠️ Tech Spec
LayerTeknologiFrontendReact / Next.js, Tailwind CSSPWAService Worker, Web App ManifestPush NotificationFirebase Cloud Messaging (FCM)BackendNode.js / Express (trigger notifikasi otomatis setelah subscribe)DatabaseFirebase Firestore (simpan FCM token)DeploymentVercel (wajib HTTPS)

⚙️ Tech Requirements
API Key yang diperlukan:

Firebase Project (FCM)
Firebase Cloud Messaging Server Key
VAPID Key (untuk Web Push)

File PWA yang wajib ada:

manifest.json — konfigurasi installable PWA
service-worker.js — handle background notification
Icon PWA ukuran 192x192 & 512x512

Layanan tambahan:

HTTPS / SSL (wajib, gunakan Vercel)


🖥️ UI Overview
Halaman tunggal berisi:
+------------------------------------------+
|           PWA Push Notification          |
|                                          |
|   Status: Not Subscribed                 |
|                                          |
|   [ 🔔 Subscribe ]                       |
|                                          |
|   [ 📲 Install App ]                     |
|                                          |
+------------------------------------------+

Tombol Subscribe → trigger permission + FCM registration
Tombol Install → trigger Add to Home Screen prompt
Status berubah dinamis sesuai aksi user


✅ Flow Lengkap Development
Request Project
      ↓
Buat PRD ← (sekarang)
      ↓
User Approval
      ↓
Frontend Development
(Halaman utama + tombol Subscribe & Install)
      ↓
Setup PWA (Manifest + Service Worker)
      ↓
Integrasi FCM Push Notification
      ↓
Testing Foreground & Background
      ↓
Fix Error
      ↓
Build & Deploy ke Vercel (HTTPS)
      ↓
Final Delivery