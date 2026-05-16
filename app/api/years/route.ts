import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const years = await prisma.year.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ success: true, data: years })
  } catch (error) {
    console.error("Error fetching years:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch years" }, { status: 500 })
  }
}
