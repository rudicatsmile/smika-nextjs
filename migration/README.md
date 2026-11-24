# SIMKA Data Migration Suite (CodeIgniter 3 ──► Next.js)

Script ETL (Extract, Transform, Load) otomatis untuk migrasi data kepegawaian SIMKA dari database legacy **CodeIgniter 3 (`simka9_ci`)** ke database modern **Next.js 15+ / Prisma (`simka9`)**.

---

## 📁 Struktur Modul

```
/migration
├── config.ts            # Konfigurasi database, path file, dan default credentials
├── copy-assets.ts       # Sinkronisasi file fisik (foto, sertifikat, berkas)
├── extract/             # Koneksi & ekstraksi data mentah dari MySQL legacy
│   └── index.ts
├── transform/           # Pembersihan, normalisasi enum, CUID mapping, dan pivot data
│   └── index.ts
├── load/                # Operasi upsert & insert ke Prisma ORM target
│   └── index.ts
├── validators/          # Validasi per-record & deteksi anomali/relasi yatim
│   └── index.ts
├── utils/
│   ├── db.ts            # Pool koneksi MariaDB & Prisma client
│   ├── id-map.ts        # Tracking tabel _migration_map (legacy_id -> new_id)
│   ├── date-parser.ts   # Parser tanggal Indonesia & string sanitizer
│   └── logger.ts        # Dual logging (Terminal warna + File log)
├── reports/             # Direktori log otomatis per-eksekusi
├── README.md            # Dokumentasi panduan operasional & rollback
└── run.ts               # CLI Entrypoint utama
```

---

## 🚀 Cara Menjalankan

Masuk ke folder aplikasi baru:
```bash
cd d:\project\web\simka-nextjs
```

### 1. Mode Simulasi / Dry-Run (Aman, Tanpa Menulis ke DB)
```bash
npx tsx migration/run.ts --dry-run
```

### 2. Mode Live Execution (Menulis ke Database Baru)
Eksekusi penuh dengan pembersihan data dummy seed dan penyalinan file lampiran:
```bash
npx tsx migration/run.ts --execute --clean-seed --copy-files
```

---

## ⚙️ Fitur Utama & Keamanan

1. **Idempotent:** Menggunakan tabel `_migration_map` di database target sehingga script aman dijalankan berulang tanpa menciptakan record duplikat.
2. **Error Isolation:** Error ditangani per-baris sehingga satu data anomali tidak menghentikan keseluruhan proses migrasi.
3. **Penyelamatan Duplikat NIP:** NIP yang ganda di sistem lama otomatis diberi suffix `-DUP<id>` agar data kedua tetap tersimpan dan dapat disesuaikan kemudian via UI.
4. **Proteksi Foreign Key:** Data peninggalan pegawai yang telah dihapus di sistem lama (*orphan records*) otomatis disaring agar integritas relasi Prisma tidak rusak.
5. **Normalisasi Berkas:** Dokumen horizontal (`dokumen1` s/d `dokumen10`) otomatis di-unpivot menjadi baris ternormalisasi di tabel `importantdocument`.

---

## 🔄 Rencana Rollback (Rollback Plan)

Jika ingin membatalkan hasil migrasi dan mengembalikan database target ke kondisi semula:

### Opsi A: Reset Database Target via Prisma
```bash
# Menghapus seluruh data di simka9 dan menjalankan seed awal kembali
npx prisma db push --force-reset
npm run seed
```

### Opsi B: Bersihkan Data via Script
```bash
# Membersihkan seluruh tabel transaksi tanpa merusak skema tabel
npx tsx -e "import { cleanSeedData } from './migration/load'; cleanSeedData().then(() => process.exit(0))"
```

---

## 🔑 Default Kredensial Akun yang Dimigrasi

* **Akun Pegawai:**
  * **Username:** Nomor NIP masing-masing pegawai (contoh: `09.2017.0497`)
  * **Password Awal:** `simka@password2026`
* **Akun Administrator / HR:**
  * **Username:** `admin*U^TYu5` atau `admin-kepegawaian`
  * **Password Awal:** `AdminSimka2026!`
