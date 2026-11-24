const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '..', 'app', 'generated', 'prisma', 'client'));
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL || "mysql://root:@localhost:3306/simka9";
const adapter = new PrismaMariaDb(dbUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      nip: true,
      role: true,
      passwordHash: true,
      isActive: true,
    }
  });

  console.log(`Total users in DB: ${users.length}`);
  for (const u of users) {
    if (u.role === 'SUPER_ADMIN' || u.nip?.includes('admin') || u.name?.toLowerCase().includes('admin')) {
      const match = await bcrypt.compare('AdminSimka2026!', u.passwordHash);
      console.log(`ID: ${u.id} | Name: ${u.name} | Role: ${u.role} | NIP: "${u.nip}" | Email: "${u.email}" | Active: ${u.isActive} | Pass match: ${match}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
