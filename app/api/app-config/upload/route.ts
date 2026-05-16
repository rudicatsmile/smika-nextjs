import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const form = await req.formData()
  const file = form.get("file") as File | null
  const type = form.get("type") as string | null // "logo" or "favicon"

  if (!file || !type) {
    return NextResponse.json({ message: "File dan type wajib ada" }, { status: 400 })
  }

  if (type === "logo") {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ message: "Format file tidak didukung (JPG, PNG, WebP, SVG)" }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "Ukuran file maksimal 5MB" }, { status: 400 })
    }
  } else if (type === "favicon") {
    const allowed = ["image/x-icon", "image/png", "image/svg+xml"]
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ message: "Format file tidak didukung (ICO, PNG, SVG)" }, { status: 400 })
    }
    if (file.size > 1 * 1024 * 1024) {
      return NextResponse.json({ message: "Ukuran file maksimal 1MB" }, { status: 400 })
    }
  } else {
    return NextResponse.json({ message: "Type harus 'logo' atau 'favicon'" }, { status: 400 })
  }

  const ext = file.name.split(".").pop() ?? "png"
  const filename = `${type}-${Date.now()}.${ext}`
  const uploadDir = path.join(process.cwd(), "public", "uploads", "app")

  await mkdir(uploadDir, { recursive: true })
  const bytes = await file.arrayBuffer()
  await writeFile(path.join(uploadDir, filename), Buffer.from(bytes))

  const url = `/uploads/app/${filename}`
  return NextResponse.json({ url })
}
