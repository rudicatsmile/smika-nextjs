-- MySQL dump 10.16  Distrib 10.1.38-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: simka9_ci
-- ------------------------------------------------------
-- Server version	10.6.27-MariaDB-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `agama`
--

DROP TABLE IF EXISTS `agama`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `agama` (
  `agama_id` int(11) NOT NULL AUTO_INCREMENT,
  `kode` varchar(255) DEFAULT NULL,
  `nama_agama` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `createdon` timestamp NULL DEFAULT NULL,
  `createdby` varchar(255) DEFAULT NULL,
  `updatedon` timestamp NULL DEFAULT NULL,
  `updatedby` varchar(255) DEFAULT NULL,
  `deletedon` timestamp NULL DEFAULT NULL,
  `deletedby` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`agama_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `anak`
--

DROP TABLE IF EXISTS `anak`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `anak` (
  `id_anak` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `nama_anak` varchar(100) NOT NULL,
  `tmp_lahir_anak` varchar(50) NOT NULL,
  `tgl_lahir_anak` date NOT NULL,
  `jns_kelamin` enum('P','L') NOT NULL,
  `hubungan` varchar(100) NOT NULL,
  `tunjangan` enum('Ya','Tidak') NOT NULL,
  `pendidikan` varchar(100) NOT NULL,
  `pekerjaan` varchar(100) NOT NULL,
  `kartu_keluarga` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_anak`),
  KEY `id_pegawai` (`id_pegawai`)
) ENGINE=InnoDB AUTO_INCREMENT=311 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nip` varchar(26) DEFAULT NULL,
  `nama_lengkap` varchar(150) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `latitude` varchar(32) DEFAULT NULL,
  `longitude` varchar(32) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `status` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cuti`
--

DROP TABLE IF EXISTS `cuti`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cuti` (
  `id_cuti` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `tahun` year(4) NOT NULL,
  `tgl_pengajuan` date NOT NULL,
  `jenis_cuti` varchar(50) NOT NULL,
  `no_cuti` varchar(100) NOT NULL,
  `tgl_mulai` date NOT NULL,
  `tgl_selesai` date NOT NULL,
  `hari` int(11) DEFAULT NULL,
  `status` enum('Menunggu Konfirmasi','Setuju','Tolak') NOT NULL DEFAULT 'Menunggu Konfirmasi',
  `ket` text NOT NULL,
  `createdon` timestamp NULL DEFAULT NULL,
  `createdby` varchar(255) DEFAULT NULL,
  `updatedon` timestamp NULL DEFAULT NULL,
  `updatedby` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_cuti`) USING BTREE,
  KEY `id_pegawai` (`id_pegawai`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dokumen`
--

DROP TABLE IF EXISTS `dokumen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dokumen` (
  `id_dokumen` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `is_dokumen` enum('Ya','Tidak') DEFAULT NULL,
  `kesanggupan` text DEFAULT NULL,
  `dokumen1` varchar(100) DEFAULT NULL,
  `dokumen2` varchar(100) DEFAULT NULL,
  `dokumen3` varchar(100) DEFAULT NULL,
  `dokumen4` varchar(100) DEFAULT NULL,
  `dokumen5` varchar(100) DEFAULT NULL,
  `dokumen6` varchar(100) DEFAULT NULL,
  `dokumen7` varchar(100) DEFAULT NULL,
  `dokumen8` varchar(100) DEFAULT NULL,
  `dokumen9` varchar(100) DEFAULT NULL,
  `dokumen10` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_dokumen`)
) ENGINE=InnoDB AUTO_INCREMENT=322 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp3`
--

DROP TABLE IF EXISTS `dp3`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp3` (
  `id_dp3` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `tahun` year(4) NOT NULL,
  `n1` int(11) DEFAULT 0,
  `n2` int(11) DEFAULT 0,
  `n3` int(11) DEFAULT 0,
  `n4` int(11) DEFAULT 0,
  `n5` int(11) DEFAULT 0,
  `n6` int(11) DEFAULT 0,
  `n7` int(11) DEFAULT 0,
  `n8` int(11) DEFAULT 0,
  `n9` int(11) DEFAULT 0,
  `jml` int(11) DEFAULT 0,
  `rata2` double DEFAULT 0,
  `bobot` double DEFAULT 0,
  `memo_kesetiaan` text DEFAULT NULL,
  `memo_prestasi` text DEFAULT NULL,
  `memo_tanggung_jawab` text DEFAULT NULL,
  `memo_ketaatan` text DEFAULT NULL,
  `memo_kejujuran` text DEFAULT NULL,
  `memo_kerjasama` text DEFAULT NULL,
  `memo_prakarsa` text DEFAULT NULL,
  `memo_kepemimpinan` text DEFAULT NULL,
  `memo_inisiatif` text DEFAULT NULL,
  `catatan` text DEFAULT NULL,
  `status` smallint(6) DEFAULT 1,
  `username_approval` varchar(50) DEFAULT NULL,
  `tanggal_approval` datetime DEFAULT NULL,
  `createdon` datetime DEFAULT NULL,
  `createdby` varchar(50) DEFAULT NULL,
  `updatedon` datetime DEFAULT NULL,
  `updatedby` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_dp3`),
  KEY `id_pegawai` (`id_pegawai`)
) ENGINE=InnoDB AUTO_INCREMENT=834 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dp3_status`
--

DROP TABLE IF EXISTS `dp3_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dp3_status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kode` varchar(10) NOT NULL,
  `deskripsi` varchar(100) NOT NULL,
  `keterangan` text NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hari_libur`
--

DROP TABLE IF EXISTS `hari_libur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hari_libur` (
  `hari_libur_id` int(11) NOT NULL AUTO_INCREMENT,
  `tanggal` date DEFAULT NULL,
  `ket` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `createdon` timestamp NULL DEFAULT NULL,
  `createdby` varchar(255) DEFAULT NULL,
  `updatedon` timestamp NULL DEFAULT NULL,
  `updatedby` varchar(255) DEFAULT NULL,
  `deletedon` timestamp NULL DEFAULT NULL,
  `deletedby` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`hari_libur_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `identitas`
--

DROP TABLE IF EXISTS `identitas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `identitas` (
  `id_identitas` int(5) NOT NULL AUTO_INCREMENT,
  `nama_website` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `url` varchar(100) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `instansi` text CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `alamat` varchar(100) NOT NULL,
  `no_telp` varchar(20) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `no_telp_kepegawaian` varchar(20) DEFAULT NULL,
  `no_telp_pimpinan` varchar(20) DEFAULT NULL,
  `meta_deskripsi` varchar(250) NOT NULL,
  `meta_keyword` varchar(250) NOT NULL,
  `favicon` varchar(50) NOT NULL,
  `maps` text NOT NULL,
  PRIMARY KEY (`id_identitas`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jabatan`
--

DROP TABLE IF EXISTS `jabatan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jabatan` (
  `id_jabatan` int(11) NOT NULL AUTO_INCREMENT,
  `urut` smallint(6) DEFAULT NULL,
  `nama_jabatan` varchar(100) NOT NULL,
  `nama_jabatan_slug` varchar(100) DEFAULT NULL,
  `status` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_jabatan`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jenjang_pendidikan`
--

DROP TABLE IF EXISTS `jenjang_pendidikan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jenjang_pendidikan` (
  `jenjang_pendidikan_id` int(11) NOT NULL AUTO_INCREMENT,
  `kode` varchar(255) DEFAULT NULL,
  `urut` smallint(6) DEFAULT NULL,
  `nama_jenjang_pendidikan` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `createdon` timestamp NULL DEFAULT NULL,
  `createdby` varchar(255) DEFAULT NULL,
  `updatedon` timestamp NULL DEFAULT NULL,
  `updatedby` varchar(255) DEFAULT NULL,
  `deletedon` timestamp NULL DEFAULT NULL,
  `deletedby` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`jenjang_pendidikan_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jenjang_pendidikan2`
--

DROP TABLE IF EXISTS `jenjang_pendidikan2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jenjang_pendidikan2` (
  `jenjang_pendidikan_id` int(11) NOT NULL AUTO_INCREMENT,
  `kode` varchar(255) DEFAULT NULL,
  `nama_jenjang_pendidikan` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `createdon` timestamp NULL DEFAULT NULL,
  `createdby` varchar(255) DEFAULT NULL,
  `updatedon` timestamp NULL DEFAULT NULL,
  `updatedby` varchar(255) DEFAULT NULL,
  `deletedon` timestamp NULL DEFAULT NULL,
  `deletedby` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`jenjang_pendidikan_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `kerjalain`
--

DROP TABLE IF EXISTS `kerjalain`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kerjalain` (
  `id_kerjalain` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `is_kerjalain` enum('Ya','Tidak') DEFAULT NULL,
  `tempat_kerja` varchar(100) DEFAULT NULL,
  `status` enum('tetap','tidak tetap','asn') DEFAULT NULL,
  `jabatan` varchar(50) DEFAULT NULL,
  `fungsi_jabatan` varchar(100) DEFAULT NULL,
  `alamat_kerja` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_kerjalain`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `kesediaan`
--

DROP TABLE IF EXISTS `kesediaan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kesediaan` (
  `id_kesediaan` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `tanggal` date DEFAULT NULL,
  `tahun` year(4) DEFAULT NULL,
  `is_kesediaan` enum('Ya','Tidak') DEFAULT NULL,
  `kesanggupan` text DEFAULT NULL,
  `kesediaan_hari_mengajar` varchar(200) DEFAULT NULL,
  `photo` varchar(100) DEFAULT NULL,
  `ktp` varchar(100) DEFAULT NULL,
  `ijazah` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_kesediaan`)
) ENGINE=InnoDB AUTO_INCREMENT=637 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `kesehatan`
--

DROP TABLE IF EXISTS `kesehatan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kesehatan` (
  `id_kesehatan` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `nama_lembaga` varchar(100) DEFAULT NULL,
  `tempat_lembaga` varchar(100) DEFAULT NULL,
  `tgl_lembaga` date DEFAULT NULL,
  `no_surat_kesehatan` varchar(50) DEFAULT NULL,
  `tgl_surat_kesehatan` date DEFAULT NULL,
  `sertifikat_kesehatan` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_kesehatan`)
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `login_attempts_ip`
--

DROP TABLE IF EXISTS `login_attempts_ip`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `login_attempts_ip` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(45) NOT NULL COMMENT 'Alamat IP yang melakukan percobaan login',
  `attempts` int(11) DEFAULT 0 COMMENT 'Jumlah percobaan login dari IP ini',
  `last_attempt` datetime DEFAULT NULL COMMENT 'Waktu percobaan login terakhir',
  `blocked_until` datetime DEFAULT NULL COMMENT 'Waktu hingga IP diblokir (NULL jika tidak diblokir)',
  `created_at` datetime DEFAULT current_timestamp() COMMENT 'Waktu record pertama kali dibuat',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Waktu record terakhir diupdate',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_ip_address` (`ip_address`),
  KEY `idx_blocked_until` (`blocked_until`),
  KEY `idx_last_attempt` (`last_attempt`)
) ENGINE=InnoDB AUTO_INCREMENT=646 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci COMMENT='Tabel untuk tracking percobaan login berdasarkan IP address';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `logo`
--

DROP TABLE IF EXISTS `logo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `logo` (
  `id_logo` int(5) NOT NULL AUTO_INCREMENT,
  `gambar` varchar(100) NOT NULL,
  PRIMARY KEY (`id_logo`)
) ENGINE=MyISAM AUTO_INCREMENT=18 DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `modul`
--

DROP TABLE IF EXISTS `modul`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `modul` (
  `id_modul` int(5) NOT NULL AUTO_INCREMENT,
  `nama_modul` varchar(50) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `username` varchar(50) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `link` varchar(100) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `static_content` text CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `gambar` varchar(100) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `publish` enum('Y','N') CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL DEFAULT 'Y',
  `status` enum('user','admin') CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `aktif` enum('Y','N') CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL DEFAULT 'Y',
  `urutan` int(5) NOT NULL,
  `link_seo` varchar(50) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  PRIMARY KEY (`id_modul`)
) ENGINE=MyISAM AUTO_INCREMENT=31 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mutasi`
--

DROP TABLE IF EXISTS `mutasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mutasi` (
  `id_mutasi` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `jns_mutasi` varchar(50) NOT NULL,
  `tgl_mutasi` date NOT NULL,
  `no_sk` varchar(100) NOT NULL,
  PRIMARY KEY (`id_mutasi`),
  KEY `id_pegawai` (`id_pegawai`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `organisasi`
--

DROP TABLE IF EXISTS `organisasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `organisasi` (
  `id_organisasi` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `nama_organisasi` varchar(100) DEFAULT NULL,
  `tempat_organisasi` varchar(100) DEFAULT NULL,
  `jabatan_organisasi` varchar(50) DEFAULT NULL,
  `tgl_bergabung` date DEFAULT NULL,
  `photo` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_organisasi`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ortu`
--

DROP TABLE IF EXISTS `ortu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ortu` (
  `id_ortu` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `nama_ortu` varchar(100) NOT NULL,
  `status` enum('Ayah','Ibu') NOT NULL,
  `tmp_lahir_ortu` varchar(50) NOT NULL,
  `tgl_lahir_ortu` date NOT NULL,
  `pekerjaan` varchar(100) NOT NULL,
  `alamat` varchar(100) NOT NULL,
  `privinsi` varchar(50) NOT NULL,
  `kode_pos` int(11) NOT NULL,
  PRIMARY KEY (`id_ortu`),
  KEY `id_pegawai` (`id_pegawai`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pangkat`
--

DROP TABLE IF EXISTS `pangkat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pangkat` (
  `id_pangkat` int(11) NOT NULL AUTO_INCREMENT,
  `nama_pangkat` varchar(100) NOT NULL,
  `golongan` varchar(3) NOT NULL,
  `ruang` varchar(2) NOT NULL,
  PRIMARY KEY (`id_pangkat`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pasangan`
--

DROP TABLE IF EXISTS `pasangan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pasangan` (
  `id_pasangan` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `nama_pasangan` varchar(100) NOT NULL,
  `tmp_lahir_pasangan` varchar(50) NOT NULL,
  `tgl_lahir_pasangan` date NOT NULL,
  `pendidikan` varchar(50) NOT NULL,
  `hubungan` enum('Suami','Istri') NOT NULL,
  `tgl_kawin` date NOT NULL,
  `status_tunjangan` enum('Ya','Tidak') NOT NULL,
  `pekerjaan` varchar(50) NOT NULL,
  PRIMARY KEY (`id_pasangan`),
  KEY `id_pegawai` (`id_pegawai`)
) ENGINE=InnoDB AUTO_INCREMENT=194 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pegawai`
--

DROP TABLE IF EXISTS `pegawai`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pegawai` (
  `id_pegawai` int(11) NOT NULL AUTO_INCREMENT,
  `nip` varchar(20) NOT NULL,
  `nik` varchar(255) DEFAULT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `bpjs` varchar(255) DEFAULT NULL,
  `npwp` varchar(255) DEFAULT NULL,
  `nuptk` varchar(255) DEFAULT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `foto` varchar(100) DEFAULT NULL,
  `tmp_lahir` varchar(50) DEFAULT NULL,
  `tgl_lahir` date DEFAULT NULL,
  `jns_kelamin` enum('laki-laki','perempuan') NOT NULL,
  `agama` varchar(10) NOT NULL,
  `gol_darah` varchar(2) DEFAULT NULL,
  `status_nikah` varchar(50) DEFAULT NULL,
  `pstatus` varchar(50) NOT NULL DEFAULT 'Aktif',
  `status_kepegawaian` varchar(10) DEFAULT 'PTY',
  `blokir` enum('Tidak','Ya') NOT NULL DEFAULT 'Tidak',
  `alamat` varchar(100) DEFAULT NULL,
  `provinsi` varchar(50) DEFAULT NULL,
  `kodepos` int(11) DEFAULT NULL,
  `alamat2` varchar(100) DEFAULT NULL,
  `provinsi2` varchar(50) DEFAULT NULL,
  `kodepos2` int(11) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `no_tlp` varchar(15) DEFAULT NULL,
  `hobi` varchar(255) DEFAULT NULL,
  `tinggi_badan` int(11) DEFAULT NULL,
  `berat_badan` int(11) DEFAULT NULL,
  `unit_jabatan` varchar(100) DEFAULT NULL,
  `unit_jabatan_data` char(3) DEFAULT NULL,
  `unit_fungsi` varchar(255) DEFAULT NULL,
  `unit_tugas` varchar(255) DEFAULT NULL,
  `unit_pelajaran` varchar(100) DEFAULT NULL,
  `mulai_bekerja` varchar(50) DEFAULT NULL,
  `pendidikan_terakhir` varchar(10) DEFAULT NULL,
  `program_studi` varchar(50) DEFAULT NULL,
  `nama_kampus` varchar(50) DEFAULT NULL,
  `tahun_lulus` varchar(15) DEFAULT NULL,
  `createdon` timestamp NULL DEFAULT NULL,
  `createdby` varchar(255) DEFAULT NULL,
  `updatedon` timestamp NULL DEFAULT NULL,
  `updatedby` varchar(255) DEFAULT NULL,
  `login_attempts` int(11) DEFAULT 0 COMMENT 'Jumlah percobaan login yang gagal',
  `last_attempt` timestamp NULL DEFAULT NULL COMMENT 'Timestamp terakhir percobaan login',
  `blocked_until` timestamp NULL DEFAULT NULL COMMENT 'Waktu hingga user dapat mencoba login kembali',
  `failed_ip` varchar(45) DEFAULT NULL COMMENT 'Alamat IP saat gagal login',
  PRIMARY KEY (`id_pegawai`),
  KEY `idx_pegawai_blocked_until` (`blocked_until`),
  KEY `idx_pegawai_username_blocked` (`id_pegawai`,`blocked_until`)
) ENGINE=InnoDB AUTO_INCREMENT=328 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pelatihan`
--

DROP TABLE IF EXISTS `pelatihan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pelatihan` (
  `id_pelatihan` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `nama_diklat` varchar(100) NOT NULL,
  `jns_pelatihan` varchar(50) NOT NULL,
  `tempat_penyelenggara` varchar(100) NOT NULL,
  `angkatan` varchar(5) NOT NULL,
  `tgl_diklat` date NOT NULL,
  `no_sttpp` varchar(100) NOT NULL,
  `tgl_sttpp` date NOT NULL,
  `sertifikat` varchar(100) NOT NULL,
  PRIMARY KEY (`id_pelatihan`)
) ENGINE=InnoDB AUTO_INCREMENT=244 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `penataran`
--

DROP TABLE IF EXISTS `penataran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `penataran` (
  `id_penataran` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `nama_penataran` varchar(100) NOT NULL,
  `tempat_penataran` varchar(100) NOT NULL,
  `tgl_penataran` date NOT NULL,
  `no_piagam_penataran` varchar(50) NOT NULL,
  `tgl_piagam_penataran` date NOT NULL,
  `sertifikat_penataran` varchar(30) NOT NULL,
  PRIMARY KEY (`id_penataran`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pengaturan_cuti`
--

DROP TABLE IF EXISTS `pengaturan_cuti`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pengaturan_cuti` (
  `id_set_cuti` int(11) NOT NULL,
  `tahun` year(4) NOT NULL,
  `beri` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `penguasaanbahasa`
--

DROP TABLE IF EXISTS `penguasaanbahasa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `penguasaanbahasa` (
  `id_penguasaanbahasa` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `jns_bahasa` varchar(30) NOT NULL,
  `nama_bahasa` varchar(50) NOT NULL,
  `kemampuan` varchar(60) NOT NULL,
  PRIMARY KEY (`id_penguasaanbahasa`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pensiun`
--

DROP TABLE IF EXISTS `pensiun`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pensiun` (
  `id_pensiun` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `no_pensiun` varchar(100) NOT NULL,
  `tgl_pensiun` date NOT NULL,
  `ket` text NOT NULL,
  PRIMARY KEY (`id_pensiun`),
  KEY `id_pegawai` (`id_pegawai`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `portofolio`
--

DROP TABLE IF EXISTS `portofolio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `portofolio` (
  `id_portofolio` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `nama_portofolio` varchar(100) NOT NULL,
  `tgl_portofolio` date NOT NULL,
  `no_portofolio` varchar(30) NOT NULL,
  `keterangan_portofolio` text NOT NULL,
  `berkas` varchar(100) NOT NULL,
  PRIMARY KEY (`id_portofolio`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `propinsi`
--

DROP TABLE IF EXISTS `propinsi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `propinsi` (
  `IDT` int(11) NOT NULL AUTO_INCREMENT,
  `kode` varchar(3) DEFAULT '',
  `deskripsi` varchar(150) DEFAULT '',
  PRIMARY KEY (`IDT`),
  KEY `deskripsi` (`deskripsi`),
  KEY `kode` (`kode`)
) ENGINE=MyISAM AUTO_INCREMENT=35 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rekening`
--

DROP TABLE IF EXISTS `rekening`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rekening` (
  `id_rekening` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `nama_bank` varchar(100) DEFAULT NULL,
  `tempat_bank` varchar(100) DEFAULT NULL,
  `no_rekening` varchar(50) DEFAULT NULL,
  `tgl_rekening` date DEFAULT NULL,
  `photo` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_rekening`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `riwayat_jabatan`
--

DROP TABLE IF EXISTS `riwayat_jabatan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `riwayat_jabatan` (
  `id_riwayatjabatan` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `id_jabatan` int(11) NOT NULL,
  `tmt_jabatan` date NOT NULL,
  `no_sk` varchar(100) NOT NULL,
  `tgl_sk` date NOT NULL,
  PRIMARY KEY (`id_riwayatjabatan`),
  KEY `id_pegawai` (`id_pegawai`,`id_jabatan`),
  KEY `id_jabatan` (`id_jabatan`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `riwayat_kepangkatan`
--

DROP TABLE IF EXISTS `riwayat_kepangkatan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `riwayat_kepangkatan` (
  `id_kepangkatan` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `id_pangkat` int(11) NOT NULL,
  `tmt_pangkat` date NOT NULL,
  `no_sk` varchar(100) NOT NULL,
  `tgl_sk` date NOT NULL,
  PRIMARY KEY (`id_kepangkatan`),
  KEY `id_pegawai` (`id_pegawai`,`id_pangkat`),
  KEY `id_pangkat` (`id_pangkat`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `riwayat_pendidikan`
--

DROP TABLE IF EXISTS `riwayat_pendidikan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `riwayat_pendidikan` (
  `id_pendidikan` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `jenjang_jurusan` varchar(50) NOT NULL,
  `nama_sekolah` varchar(100) NOT NULL,
  `no_ijazah` varchar(100) NOT NULL,
  `tgl_ijazah` date NOT NULL,
  PRIMARY KEY (`id_pendidikan`),
  KEY `id_pegawai` (`id_pegawai`)
) ENGINE=InnoDB AUTO_INCREMENT=713 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `seminar`
--

DROP TABLE IF EXISTS `seminar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seminar` (
  `id_seminar` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `nama_seminar` varchar(100) NOT NULL,
  `tempat_seminar` varchar(100) NOT NULL,
  `tgl_seminar` date NOT NULL,
  `no_piagam_seminar` varchar(50) NOT NULL,
  `tgl_piagam_siminar` date NOT NULL,
  `sertifikat_seminar` varchar(100) NOT NULL,
  PRIMARY KEY (`id_seminar`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sertifikasi`
--

DROP TABLE IF EXISTS `sertifikasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sertifikasi` (
  `id_sertifikasi` int(11) NOT NULL AUTO_INCREMENT,
  `id_pegawai` int(11) NOT NULL,
  `is_sertifikasi` enum('Ya','Tidak') DEFAULT NULL,
  `sekolah_sertifikasi` varchar(100) DEFAULT NULL,
  `nomor_sertifikasi` varchar(50) DEFAULT NULL,
  `tahun_sertifikasi` varchar(5) DEFAULT NULL,
  `sekolah_inpassing` varchar(100) DEFAULT NULL,
  `nomor_inpassing` varchar(50) DEFAULT NULL,
  `tahun_inpassing` varchar(5) DEFAULT NULL,
  `sertifikat` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_sertifikasi`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `unit`
--

DROP TABLE IF EXISTS `unit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unit` (
  `unit_id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) DEFAULT NULL,
  `urut` smallint(5) unsigned DEFAULT NULL,
  `kode` varchar(255) DEFAULT NULL,
  `nama_unit` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `createdon` timestamp NULL DEFAULT NULL,
  `createdby` varchar(255) DEFAULT NULL,
  `updatedon` timestamp NULL DEFAULT NULL,
  `updatedby` varchar(255) DEFAULT NULL,
  `deletedon` timestamp NULL DEFAULT NULL,
  `deletedby` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`unit_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `username` varchar(50) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `nama_lengkap` varchar(100) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `email` varchar(100) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `no_telp` varchar(20) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `foto` varchar(100) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `level` varchar(20) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL DEFAULT 'user',
  `user_type` enum('lembaga','kepegawaian','pimpinan') NOT NULL DEFAULT 'lembaga',
  `blokir` enum('Y','N') CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL DEFAULT 'N',
  `id_session` varchar(255) NOT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `login_attempts` int(11) DEFAULT 0 COMMENT 'Jumlah percobaan login yang gagal',
  `last_attempt` timestamp NULL DEFAULT NULL COMMENT 'Timestamp terakhir percobaan login',
  `blocked_until` timestamp NULL DEFAULT NULL COMMENT 'Waktu hingga user dapat mencoba login kembali',
  `failed_ip` varchar(45) DEFAULT NULL COMMENT 'Alamat IP saat gagal login',
  PRIMARY KEY (`username`),
  KEY `idx_users_blocked_until` (`blocked_until`),
  KEY `idx_users_username_blocked` (`username`,`blocked_until`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users_modul`
--

DROP TABLE IF EXISTS `users_modul`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users_modul` (
  `id_umod` int(11) NOT NULL AUTO_INCREMENT,
  `id_session` varchar(255) NOT NULL,
  `id_modul` int(11) NOT NULL,
  PRIMARY KEY (`id_umod`)
) ENGINE=MyISAM AUTO_INCREMENT=154 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-23  8:07:53
