import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const { identifier } = await req.json()
    if (!identifier) {
      return NextResponse.json({ message: "Identifier wajib diisi" }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { nip: identifier }],
        isActive: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: "Akun tidak ditemukan" }, { status: 404 })
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    })

    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`
    console.log("\n🔐 [SIMKA] Reset Password Link for", user.name, ":")
    console.log(resetUrl, "\n")

    return NextResponse.json({ message: "Link reset dikirim" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}
