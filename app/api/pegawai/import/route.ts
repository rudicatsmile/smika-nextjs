import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const { rows } = await req.json()
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ message: "Data kosong" }, { status: 400 })
  }

  let created = 0
  const errors: string[] = []

  for (const row of rows) {
    try {
      const genderMap: Record<string, string> = {
        "laki-laki": "LAKI_LAKI", "laki laki": "LAKI_LAKI", "l": "LAKI_LAKI",
        "perempuan": "PEREMPUAN", "p": "PEREMPUAN",
      }
      const gender = row.gender
        ? genderMap[row.gender.toLowerCase()] ?? null
        : null

      await prisma.employee.create({
        data: {
          employeeIdNumber: String(row.employeeIdNumber),
          fullName: String(row.fullName),
          email: row.email || null,
          phoneNumber: row.phoneNumber || null,
          gender: gender as any,
        },
      })
      created++
    } catch {
      errors.push(`${row.employeeIdNumber}: gagal disimpan`)
    }
  }

  return NextResponse.json({ created, errors })
}
