# Manajemen PKL

Sistem Geofencing dan Manajemen Praktek Kerja Lapangan (PKL).

## Web Push Notifications (VAPID Keys)

Aplikasi ini menggunakan Web Push Notifications untuk memberikan notifikasi tugas baru secara *real-time* kepada anak PKL, bahkan ketika website sedang ditutup (berjalan di background). Agar fitur ini berfungsi penuh, Anda wajib mengonfigurasi kunci VAPID (Voluntary Application Server Identification).

### Cara Generate VAPID Keys:

Jika Anda melakukan *clone* proyek ini ke server baru atau belum memiliki kunci VAPID di file `.env`, Anda bisa membuatnya dengan mudah menggunakan `npx`. 

Buka terminal di dalam direktori proyek ini dan jalankan perintah:

```bash
npx web-push generate-vapid-keys
```

*(Catatan: Jika terminal meminta konfirmasi untuk menginstall paket sementara `web-push`, ketik `y` lalu tekan Enter).*

Perintah di atas akan menghasilkan output berupa **Public Key** dan **Private Key**.

### Cara Konfigurasi Kunci VAPID:

1. Buka file `.env` di direktori utama, lalu tambahkan 2 baris berikut (paste kunci yang baru saja Anda generate):
   ```env
   VAPID_PUBLIC_KEY=isi_dengan_Public_Key_Anda
   VAPID_PRIVATE_KEY=isi_dengan_Private_Key_Anda
   ```
2. Salin **Public Key** tersebut sekali lagi, lalu buka file `resources/js/Pages/Profile/Partials/DevicePermissions.jsx`. Cari parameter `applicationServerKey` di dalam blok fungsi `requestNotification` dan ganti kuncinya dengan Public Key milik Anda.
3. Setelah semuanya selesai, jika Anda menjalankannya untuk production, pastikan me-rebuild asset dengan perintah:
   ```bash
   npm run build
   ```
