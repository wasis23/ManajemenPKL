# Dokumen Perencanaan Sistem (Blue Print)
## Sistem Manajemen Tugas & Absensi Geofencing Anak PKL
### Politeknik Indonusa Surakarta

Dokumen ini berisi rancangan lengkap dan panduan alur kerja untuk membangun website manajemen anak PKL menggunakan kombinasi teknologi modern: **Laravel** (Backend) dan **Inertia.js** (Frontend). Penjelasan di bawah ini dirancang menggunakan bahasa yang mudah dipahami agar mempermudah proses pembuatan sistem di kecerdasan buatan (AI) Anda.

---

## 1. Konsep Dasar & Hak Akses Pengguna

Sistem ini dibuat untuk mendigitalkan serta memantau kinerja anak PKL di lingkungan kampus dengan metode yang menyenangkan (*Gamifikasi / Sistem Reward*). Di dalam website ini, terdapat tiga jenis pengguna dengan peran dan batasan yang berbeda:

1. **Staf & Dosen (Pemilik Masalah)**
   * Memiliki akses untuk membuat laporan jika ada kendala teknis atau tugas tertentu di lingkungan kampus.
   * Menentukan berapa banyak anak PKL yang dibutuhkan untuk menyelesaikan tugas tersebut.
   * Melakukan konfirmasi apakah tugas diselesaikan secara mandiri atau dibantu oleh pembimbing.
2. **Anak PKL (Pelaksana Tugas)**
   * Bisa melihat semua daftar tugas yang sedang kosong (*pending*).
   * Memilih dan mengambil tugas yang mereka inginkan secara mandiri selama kuota pendaftar masih tersedia.
   * Melakukan absensi masuk dan pulang harian langsung dari HP/perangkat mereka (harus berada dekat kampus).
   * Mengunggah foto sebagai bukti nyata bahwa pekerjaan telah diselesaikan.
   * Melihat agenda kegiatan dan informasi penting dari kampus.
3. **Admin (Pengawas & Pemegang Kontrol)**
   * Memiliki akses penuh terhadap seluruh data di dalam sistem.
   * Mendaftarkan akun dosen, staf, dan anak PKL.
   * Menentukan koordinat GPS titik tengah kampus agar sistem tahu batas radius presensi.
   * Memantau papan peringkat (*leaderboard*) performa seluruh anak PKL.
   * Mengelola (menambah, mengubah, menghapus) agenda kegiatan anak PKL.

---

## 2. Alur Kerja Utama Sistem (Workflow)

### A. Alur Manajemen Tugas & Perubahan Status Otomatis
1. **Pendaftaran Masalah:** Dosen atau staf masuk ke akun mereka, lalu mengisi formulir kendala (contoh: "Komputer Laboratorium 3 Rusak"). Mereka memasukkan deskripsi kendala dan menentukan kuota (misal: butuh 2 anak PKL). Saat disimpan, status tugas otomatis menjadi **"Pending"**.
2. **Pengambilan Tugas:** Anak PKL melihat papan tugas. Mereka mengklik tombol untuk mengambil tugas tersebut.
3. **Kunci Kuota Otomatis:** Sistem akan menghitung jumlah anak PKL yang mengambil tugas itu secara otomatis. Begitu jumlah anak yang mendaftar pas dengan kuota yang diminta, sistem langsung merubah statusnya dari **"Pending"** menjadi **"Proses"**. Ketika statusnya sudah "Proses", anak PKL lain tidak bisa mengambil tugas itu lagi.
4. **Penyelesaian Tugas:** Anak PKL mengerjakan tugas tersebut di lapangan. Setelah selesai, mereka masuk ke website, mencentang apakah pengerjaannya dibantu pembimbing atau tidak, lalu mengunggah foto hasil kerjanya. Status tugas pun berubah menjadi **"Sukses"**.

### B. Alur Sistem Reward & Leaderboard (Papan Peringkat)
Untuk meningkatkan motivasi kerja anak PKL, sistem ini menggunakan perhitungan poin otomatis yang langsung mempengaruhi posisi mereka di papan peringkat:
*   Jika tugas diselesaikan secara **Mandiri (tanpa bantuan pembimbing)** $ightarrow$ Masing-masing anak PKL yang terdaftar di tugas itu mendapat **+2 Poin**.
*   Jika tugas diselesaikan dengan **Bantuan Pembimbing** $ightarrow$ Masing-masing anak PKL yang terdaftar hanya mendapat **+1 Poin**.

**Tampilan Leaderboard:**
Halaman ini dapat dilihat oleh Admin dan Anak PKL untuk menciptakan kompetisi yang sehat. Desainnya dibagi menjadi dua sisi:
*   **Juara Papan Atas:** Menampilkan visualisasi podium untuk 3 besar anak PKL yang mengumpulkan poin paling banyak, diikuti oleh daftar di bawahnya.
*   **Zona Evaluasi:** Menampilkan daftar anak PKL dengan perolehan poin paling sedikit. Tujuannya agar Admin atau dosen pembimbing bisa mengetahui siapa saja mahasiswa yang kurang aktif di lapangan sehingga bisa diberikan dorongan motivasi tambahan.

### C. Alur Absensi Berbasis Lokasi (Geofencing 50 Meter)
Sistem absensi dirancang agar anak PKL benar-benar hadir di wilayah Politeknik Indonusa Surakarta saat bekerja.
1. Anak PKL menekan tombol "Absen Masuk" atau "Absen Pulang" di halaman utama mereka melalui HP atau laptop.
2. Browser website akan meminta izin untuk mengakses lokasi (GPS) perangkat tersebut secara langsung.
3. Sistem di latar belakang akan mengukur jarak (menggunakan rumus matematika Haversine) antara posisi koordinat HP mahasiswa dengan koordinat pusat kampus yang sudah ditentukan Admin.
4. Jika jaraknya **kurang dari atau sama dengan 50 meter**, absensi berhasil dicatat sebagai "Hadir". Jika jaraknya **lebih dari 50 meter**, sistem akan menolak absensi dan memberi tahu bahwa mahasiswa berada di luar area kampus.

### D. Alur Agenda Kegiatan
1. Admin membuat agenda baru dengan memasukkan Judul, Deskripsi, Tanggal, Jam Mulai, dan Jam Selesai.
2. Seluruh anak PKL (dan dosen/staf) dapat melihat agenda tersebut di tab "Agenda Kegiatan" pada dashboard mereka.
3. Agenda yang akan datang ditandai sebagai "Mendatang", sedangkan agenda yang sudah lewat ditandai sebagai "Selesai".

---

## 3. Struktur Cetak Biru Database

Untuk menyimpan seluruh data di atas dengan rapi, AI perlu membuat struktur penyimpanan data (tabel-tabel database) sebagai berikut:

### 1. Tabel Pengguna (`users`)
Digunakan untuk menyimpan informasi akun dan poin prestasi:
*   Nama Lengkap
*   Alamat Email
*   Kata Sandi (Password)
*   Peran Akun (*Role*): Apakah dia Admin, Dosen, Staf, atau Anak PKL.
*   Total Poin: Angka akumulasi poin yang terus bertambah setiap menyelesaikan tugas.

### 2. Tabel Tugas (`tasks`)
Digunakan untuk menyimpan setiap kendala yang dilaporkan:
*   Judul Masalah
*   Penjelasan Detail Masalah
*   Identitas Pelapor (Menghubungkan ke data Dosen/Staf yang membuat laporan)
*   Jumlah Kuota Anak PKL yang Diperlukan
*   Status Tugas: Pilihannya adalah *Pending*, *Proses*, atau *Sukses*.
*   Keterangan Bantuan: Catatan apakah tugas ini dibantu pembimbing atau mandiri.
*   Foto Bukti Selesai: Tempat menyimpan berkas gambar hasil kerja.

### 3. Tabel Hubungan Tugas dan Anak PKL (`task_user`)
Karena satu tugas bisa dikerjakan oleh beberapa anak PKL sekaligus, tabel jembatan ini mencatat:
*   ID Tugas yang dikerjakan.
*   ID Anak PKL yang mengambil tugas tersebut.

### 4. Tabel Absensi (`attendances`)
Digunakan untuk merekam kehadiran harian:
*   ID Anak PKL yang melakukan absensi.
*   Tanggal Absensi.
*   Jam Masuk dan Jam Pulang.
*   Koordinat (Latitude & Longitude) saat mahasiswa klik tombol masuk.
*   Koordinat (Latitude & Longitude) saat mahasiswa klik tombol pulang.
*   Status Kehadiran: Keterangan apakah sukses masuk di dalam radius atau ditolak karena di luar area.

### 5. Tabel Pengaturan Kampus (`settings`)
Digunakan oleh Admin untuk mengubah konfigurasi tanpa membongkar kode program:
*   Koordinat Garis Lintang (Latitude) pusat kampus.
*   Koordinat Garis Bujur (Longitude) pusat kampus.
*   Batas Radius Maksimal (diisi angka 50 untuk batasan 50 meter).

### 6. Tabel Agenda (`agendas`)
Digunakan untuk mencatat agenda kegiatan:
*   Judul Agenda (`title`).
*   Deskripsi/Informasi Agenda (`description`).
*   Tanggal Kegiatan (`date`).
*   Jam Mulai (`start_time`).
*   Jam Selesai (`end_time`).
*   ID Pembuat Agenda (`created_by`, relasi ke tabel `users`).

---

## 4. Panduan Desain Antarmuka (UI/UX) yang Profesional

Website ini harus dirancang menggunakan **Tailwind CSS** agar terlihat bersih, modern, dan nyaman di mata:
*   **Skema Warna:** Gunakan warna dasar yang profesional, misalnya warna putih, abu-abu terang untuk latar belakang, dan biru tua/navy sebagai aksen utama kampus. Jangan menggunakan warna yang terlalu mencolok (neon).
*   **Dashboard Utama Anak PKL:** Harus menyajikan info ringkas dalam bentuk kotak-kotak kartu digital (*Cards Layout*) seperti: Jam digital penunjuk waktu saat ini, tombol besar untuk absen dengan warna hijau yang kontras, informasi peringkat poin saat ini, serta daftar tugas mandiri yang sedang mereka emban.
*   **Papan Tugas (Job Board):** Tampilkan daftar masalah dalam bentuk kartu-kartu yang rapi. Setiap kartu menunjukkan judul masalah, siapa staf pelapornya, deskripsi singkat, dan sisa slot kuota yang digambarkan dengan visual yang jelas (Contoh: "Slot Terisi: 1 dari 2 Anak PKL").

---

## 5. Catatan Tambahan Penting untuk AI Pembuat Program

Saat meminta AI membuat website ini menggunakan Laravel Inertia, instruksikan hal-besarnya sebagai berikut:
1.  **Gunakan Keamanan Ganda pada GPS:** Validasi jarak radius 50 meter tidak boleh hanya dicek di tampilan depan (Javascript), melainkan wajib dihitung ulang di sistem belakang (Controller Laravel) sesaat sebelum data disimpan ke database. Hal ini penting untuk mencegah kecurangan manipulasi lokasi (*Fake GPS*).
2.  **Gunakan Fitur Manajemen Form Inertia (`useForm`):** Ketika anak PKL mengunggah foto bukti pengerjaan tugas yang biasanya berukuran besar, pastikan website menampilkan bar persentase pengunggahan (*progress bar*) agar pengguna tahu prosesnya sedang berjalan.
3.  **Gunakan Pembatasan Akses Halaman (Middleware):** Pastikan halaman untuk menginput masalah atau mengubah koordinat kampus dikunci rapat, hanya bisa dibuka oleh pengguna yang memiliki hak akses yang sesuai.
