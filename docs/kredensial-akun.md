# Kredensial Pengguna SIMKA 9
**Yayasan Al Wathoniyah Asshodriyah 9**

Dokumen ini berisi daftar akun dan kredensial pengguna hasil migrasi ke sistem **SIMKA (Next.js)**.

---

## 1. Akun Super Administrator

| Field | Nilai |
| :--- | :--- |
| **Nama** | Super admin |
| **Role** | `SUPER_ADMIN` |
| **NIP / Identifier** | `admin*U^TYu5` |
| **Email** | *(tidak diatur / kosong)* |
| **Password** | `AdminSimka2026!` |
| **Hak Akses** | Akses penuh seluruh modul master, konfigurasi aplikasi, user management, DP3, dan kepegawaian |

---

## 2. Akun HR / Bagian Kepegawaian

| Nama Akun | NIP / Username | Email | Password | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Kepegawaian** | `admin-kepegawaian` | `adminkep@gmail.com` | `AdminSimka2026!` | `HR` |
| **Kepegawaian** | `admin-pegawai` | - | `AdminSimka2026!` | `HR` |

---

## 3. Akun Pimpinan

| Nama Akun | NIP / Username | Password | Role |
| :--- | :--- | :--- | :--- |
| **Koordinator Harian** | `admin-pimpinan` | `AdminSimka2026!` | `PIMPINAN` |
| **Wakil Pimpinan** | `wakil-pimpinan` | `AdminSimka2026!` | `PIMPINAN` |

---

## 4. Akun Admin Unit Lembaga (Role HR)

Akun ini digunakan oleh staf administrasi masing-masing unit/lembaga di bawah yayasan:

| Unit Lembaga | NIP / Username | Password | Role |
| :--- | :--- | :--- | :--- |
| **Yayasan** | `user_yayasan` | `AdminSimka2026!` | `HR` |
| **Lembaga TK** | `user_tk` | `AdminSimka2026!` | `HR` |
| **Lembaga SD** | `user_sd` | `AdminSimka2026!` | `HR` |
| **Lembaga SMP** | `user_smp` | `AdminSimka2026!` | `HR` |
| **Lembaga SMK DP 1** | `user_smkdp1` | `AdminSimka2026!` | `HR` |
| **Lembaga SMK DP 2** | `user_smkdp2` | `AdminSimka2026!` | `HR` |

---

## 5. Akun Pegawai / Guru

| Field | Keterangan |
| :--- | :--- |
| **NIP / Identifier** | NIP masing-masing pegawai (contoh: `09.2017.0497`, `09.2021.0678`, `09.2005.0095`, dll.) |
| **Password Default** | `simka@password2026` |
| **Role** | `PEGAWAI` |
| **Hak Akses** | Melihat dan melengkapi profil kepegawaian pribadi, upload dokumen penting, riwayat diklat, keluarga, dan kesediaan mengajar |

---

## 6. Catatan Keamanan

1. Seluruh password dienkripsi menggunakan algoritma **bcrypt**.
2. Pada halaman login (`/login`), kolom input **NIP / Email** dapat diisi menggunakan **NIP**, **Username**, ataupun **Email** (jika akun memiliki email terdaftar).
3. Untuk lingkungan produksi, disarankan pengguna segera mengganti password default melalui menu profil / akun setelah pertama kali login.
