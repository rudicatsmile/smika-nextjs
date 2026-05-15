import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const statusDP3 = await prisma.statusDP3.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    })
    return NextResponse.json({ success: true, data: statusDP3 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch StatusDP3" }, { status: 500 })
  }
}
