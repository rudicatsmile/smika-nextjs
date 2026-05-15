import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const form = await req.formData()
  const file = form.get("file") as File | null
  const employeeId = form.get("employeeId") as string | null

  if (!file || !employeeId) {
    return NextResponse.json({ message: "File dan employeeId wajib ada" }, { status: 400 })
  }

  const allowed = ["image/jpeg", "image/png", "image/webp"]
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ message: "Format file tidak didukung (JPG, PNG, WebP)" }, { status: 400 })
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ message: "Ukuran file maksimal 2MB" }, { status: 400 })
  }

  const ext = file.name.split(".").pop() ?? "jpg"
  const filename = `${employeeId}-${Date.now()}.${ext}`
  const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars")

  await mkdir(uploadDir, { recursive: true })
  const bytes = await file.arrayBuffer()
  await writeFile(path.join(uploadDir, filename), Buffer.from(bytes))

  const url = `/uploads/avatars/${filename}`
  await prisma.employee.update({ where: { id: employeeId }, data: { profilePhoto: url } })

  return NextResponse.json({ url })
}
