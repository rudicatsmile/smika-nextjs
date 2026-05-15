import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 })
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "Token tidak valid atau sudah kadaluarsa" },
        { status: 400 }
      )
    }

    const hash = await bcrypt.hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash: hash } }),
      prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { used: true } }),
    ])

    return NextResponse.json({ message: "Password berhasil diubah" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}
