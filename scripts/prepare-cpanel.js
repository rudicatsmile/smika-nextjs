const fs = require("fs");
const path = require("path");

function copyDir(src, dest, exclude = []) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (exclude.includes(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, exclude);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const rootDir = path.join(__dirname, "..");
const standaloneDir = path.join(rootDir, ".next", "standalone");

if (!fs.existsSync(standaloneDir)) {
  console.error("Folder .next/standalone tidak ditemukan. Pastikan build berhasil!");
  process.exit(1);
}

console.log("Menyiapkan berkas untuk cPanel deployment...");

// 1. Copy public -> .next/standalone/public (KECUALIKAN folder uploads agar zip tidak membengkak ratusan MB)
const publicSrc = path.join(rootDir, "public");
const publicDest = path.join(standaloneDir, "public");
if (fs.existsSync(path.join(publicDest, "uploads"))) {
  fs.rmSync(path.join(publicDest, "uploads"), { recursive: true, force: true });
}
copyDir(publicSrc, publicDest, ["uploads"]);
// Pastikan struktur folder uploads ada tapi tanpa menyalin berkas lampiran
fs.mkdirSync(path.join(publicDest, "uploads", "avatars"), { recursive: true });
fs.mkdirSync(path.join(publicDest, "uploads", "app"), { recursive: true });
console.log("✔ Folder public (tanpa uploads lampiran 500MB) berhasil disalin");

// 2. Copy .next/static -> .next/standalone/.next/static
const staticSrc = path.join(rootDir, ".next", "static");
const staticDest = path.join(standaloneDir, ".next", "static");
copyDir(staticSrc, staticDest);
console.log("✔ Folder .next/static berhasil disalin");

// 3. Copy prisma folder
const prismaSrc = path.join(rootDir, "prisma");
const prismaDest = path.join(standaloneDir, "prisma");
copyDir(prismaSrc, prismaDest);
console.log("✔ Folder prisma berhasil disalin");

// 4. Copy app/generated/prisma if exists
const genSrc = path.join(rootDir, "app", "generated");
const genDest = path.join(standaloneDir, "app", "generated");
if (fs.existsSync(genSrc)) {
  copyDir(genSrc, genDest);
  console.log("✔ Folder app/generated berhasil disalin");
}

// 5. Hapus file .env lokal dari standalone agar TIDAK menimpa .env produksi cPanel
const envFiles = [".env", ".env.local", ".env.production", ".env.development"];
for (const envFile of envFiles) {
  const p = path.join(standaloneDir, envFile);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log(`✔ File ${envFile} lokal dihapus dari standalone agar aman (tidak menimpa cPanel)`);
  }
}

// 6. Create .env.example template for cPanel
const envContent = `# Konfigurasi Database cPanel
DATABASE_URL="mysql://cpaneluser_dbuser:PasswordDatabase@localhost:3306/cpaneluser_dbname"

# URL Domain / Subdomain Aplikasi Anda
NEXTAUTH_URL="https://simka.namadomain.com"

# Secret Key (acak)
NEXTAUTH_SECRET="simka-rahasia-produksi-kunci-acak-minimal-32-karakter"

NODE_ENV="production"
PORT=3000
`;
fs.writeFileSync(path.join(standaloneDir, ".env.example"), envContent, "utf-8");

console.log("\n=======================================================");
console.log("SIAP DEPLOY! Semua berkas di .next/standalone sudah lengkap.");
console.log("Langkah berikutnya:");
console.log("1. Buka folder '.next/standalone'.");
console.log("2. Kompres SELURUH ISI di dalam folder '.next/standalone' menjadi 'deploy.zip'.");
console.log("3. Unggah dan ekstrak 'deploy.zip' ke Application Root cPanel Anda.");
console.log("=======================================================\n");
