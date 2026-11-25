# Rekomendasi Fitur SIMKA9 — Roadmap Bertahap

> Disusun berdasarkan kebutuhan: Analitik + Pengingat Otomatis (Tahap 1) → Workflow Pengajuan & Approval (Tahap 2) → Dokumen & Identitas Digital (Tahap 3)

---

## 🟢 TAHAP 1 — Quick Win (Implementasi Segera)
*Dampak tinggi, risiko rendah — data sudah tersedia di DB*

### 1.1 Dashboard Analitik HR yang Sesungguhnya

**Siapa yang diuntungkan:** `SUPER_ADMIN`, `HR`, `PIMPINAN`

**Fitur:**
- **Ringkasan Kekuatan SDM** — Total pegawai aktif, distribusi per unit/jabatan, rasio Guru Tetap vs GTT
- **Grafik Piramida Usia** — Distribusi umur pegawai (25–35, 36–45, 46–55, >55) untuk perencanaan regenerasi
- **Grafik Tingkat Pendidikan** — Distribusi S1/S2/S3/SMA/SMK per unit
- **Statistik Kelengkapan Berkas** — % pegawai yang sudah lengkap: foto, NIP, NIK, BPJS, dokumen penting
- **Widget Status Masa Kerja** — Pegawai dengan masa kerja < 1 tahun, 5 tahun, 10 tahun, 20 tahun

**Teknologi:** Chart.js / Recharts (sudah ada pattern di project), Server Component

---

### 1.2 Pusat Notifikasi & Pengingat Otomatis

**Siapa yang diuntungkan:** Semua role

**Pengingat yang dihasilkan otomatis:**
| Pemicu | Siapa yang diingatkan | Jarak Peringatan |
|---|---|---|
| Sertifikasi akan berakhir | HR + Pegawai ybs | 30, 14, 7 hari |
| Kontrak GTT akan habis | HR + Pimpinan Unit | 60, 30 hari |
| Ulang tahun pegawai | HR | H-1 |
| Pegawai mendekati usia pensiun (>55 th) | HR + Pimpinan | 1 tahun, 6 bulan |
| Berkas belum lengkap (> 30 hari sejak bergabung) | HR + Pegawai | Tiap 7 hari |

**Implementasi:**
- Model `Notification` di Prisma (`userId`, `type`, `message`, `readAt`, `createdAt`)
- Ikon 🔔 di header dengan badge angka belum dibaca
- Halaman `/notifikasi` — daftar semua notifikasi dengan filter
- Cron job via `/api/cron/notifications` (dipanggil cPanel Scheduler harian)
- **Tahap lanjut:** Email via Nodemailer + WhatsApp Gateway (Fonnte/Wablas)

---

### 1.3 Rekap Kelengkapan Berkas Pegawai

**Siapa yang diuntungkan:** `HR`, `ADMIN_UNIT`

**Fitur:**
- Halaman `/rekap-berkas` — tabel pegawai dengan kolom checklist kelengkapan:
  - ✅ Foto Profil, ✅ NIP, ✅ NIK, ✅ BPJS Kesehatan, ✅ BPJS Ketenagakerjaan, ✅ NPWP, ✅ SK Terakhir, ✅ Ijazah
- Filter per unit, status pegawai, dan kelengkapan (Lengkap / Belum Lengkap)
- Export Excel rekap kelengkapan berkas
- **Scoring kelengkapan** — Persentase (mis. "7/8 berkas terlengkap")

---

## 🟡 TAHAP 2 — Workflow & Self-Service (1–2 bulan)

### 2.1 Pengajuan Cuti & Izin Pegawai

**Siapa yang diuntungkan:** Semua role

**Alur:**
1. **Pegawai** mengajukan cuti di `/pengajuan-cuti` (jenis: Cuti Tahunan, Sakit, Melahirkan, Keperluan Keluarga)
2. **Pimpinan Unit** mendapat notifikasi → Menyetujui/Menolak dengan catatan
3. **HR** melihat rekap cuti seluruh pegawai + sisa kuota

**Data yang diperlukan:**
- Model `LeaveRequest` (`employeeId`, `type`, `startDate`, `endDate`, `reason`, `status`, `approvedBy`, `note`)
- Kuota cuti tahunan per pegawai (mis. 12 hari/tahun)
- Kalender cuti visual per unit

---

### 2.2 Pengajuan Koreksi & Update Data Mandiri

**Siapa yang diuntungkan:** `PEGAWAI`, `HR`

**Alur:**
1. **Pegawai** mengajukan perubahan data (alamat, nomor HP, status pernikahan, dll) via form `/pengajuan-koreksi`
2. **HR** mendapat notifikasi → Review → Setujui/Tolak
3. Jika disetujui, data otomatis diperbarui di profil pegawai

**Manfaat:** Mengurangi beban entry data HR, pegawai aktif memperbarui data sendiri

---

### 2.3 Penilaian & Evaluasi (DP3 — Penyempurnaan)

**Berdasarkan model `DP3` yang sudah ada:**
- **Dashboard DP3 per periode** — Ringkasan nilai rata-rata per unit
- **Perbandingan DP3 antar tahun** — Grafik tren perkembangan per pegawai
- **Peringkat pegawai** berdasarkan nilai DP3 keseluruhan
- **Ekspor laporan DP3** dalam format Excel / PDF per unit / per periode

---

## 🔵 TAHAP 3 — Dokumen & Identitas Digital (2–3 bulan)

### 3.1 Cetak Profil / CV Pegawai PDF

**Siapa yang diuntungkan:** Semua role

**Fitur:**
- Tombol **"Unduh Profil PDF"** di halaman profil pegawai `/pegawai/[id]`
- Konten PDF: Foto, data pribadi, pendidikan, jabatan, pelatihan & sertifikasi, riwayat kepegawaian
- Template profesional dengan kop yayasan (logo + nama lembaga)
- **Pegawai** bisa mengunduh profil dirinya sendiri

**Teknologi:** `@react-pdf/renderer` atau `puppeteer` di Server Action

---

### 3.2 Kartu Pegawai Digital + QR Code

**Siapa yang diuntungkan:** Semua pegawai

**Fitur:**
- Halaman `/kartu-pegawai` — Kartu digital bergaya ID Card
  - Foto, Nama, NIP, Jabatan, Unit, Status, QR Code
- QR Code mengarah ke halaman verifikasi publik `/verify/[nip]` yang menampilkan data dasar (tidak memerlukan login)
- Tombol **"Simpan sebagai Gambar"** / **"Unduh PDF Kartu"**

**Manfaat:** Verifikasi kepegawaian cepat oleh pihak ketiga (bank, asuransi, lembaga pendidikan)

---

### 3.3 Portal Pegawai — Halaman Profil Diri Terintegrasi

**Siapa yang diuntungkan:** `PEGAWAI`

**Fitur:**
- Setelah login, pegawai langsung diarahkan ke profil dirinya (saat ini harus navigasi manual)
- **My Dashboard** — Ringkasan: sisa cuti, notifikasi belum dibaca, berkas belum lengkap, jadwal evaluasi
- **Riwayat Aktivitas** — Log perubahan data yang dilakukan sendiri atau oleh HR
- **Quick Action** — Tombol cepat: Ajukan Cuti, Update Profil, Lihat Slip Gaji (jika diintegrasikan)

---

## 📊 Prioritas Implementasi

| # | Fitur | Dampak | Kompleksitas | Prioritas |
|---|---|---|---|---|
| 1 | Dashboard Analitik HR | ⭐⭐⭐⭐⭐ | 🔧🔧 | **P0 — Segera** |
| 2 | Pengingat Otomatis (In-App) | ⭐⭐⭐⭐⭐ | 🔧🔧🔧 | **P0 — Segera** |
| 3 | Rekap Kelengkapan Berkas | ⭐⭐⭐⭐ | 🔧 | **P1 — Minggu ini** |
| 4 | Pengajuan Cuti & Izin | ⭐⭐⭐⭐⭐ | 🔧🔧🔧🔧 | **P2 — Bulan ini** |
| 5 | Koreksi Data Mandiri | ⭐⭐⭐⭐ | 🔧🔧🔧 | **P2 — Bulan ini** |
| 6 | DP3 Dashboard & Trend | ⭐⭐⭐ | 🔧🔧 | **P3 — Bulan depan** |
| 7 | Cetak CV Pegawai PDF | ⭐⭐⭐⭐ | 🔧🔧🔧 | **P3 — Bulan depan** |
| 8 | Kartu Pegawai + QR Code | ⭐⭐⭐⭐ | 🔧🔧 | **P3 — Bulan depan** |
| 9 | Portal Pegawai My Dashboard | ⭐⭐⭐⭐ | 🔧🔧🔧 | **P3 — Bulan depan** |
| 10 | WhatsApp Gateway Notifikasi | ⭐⭐⭐⭐⭐ | 🔧🔧🔧🔧 | **P4 — Tahap lanjut** |

---

> **Rekomendasi mulai dari:** Dashboard Analitik HR + Pusat Notifikasi In-App — keduanya memanfaatkan data yang sudah ada di DB, tidak perlu migrasi skema besar, dan langsung terlihat manfaatnya oleh SUPER_ADMIN, HR, dan Pimpinan sejak hari pertama.

