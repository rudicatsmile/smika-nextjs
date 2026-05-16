"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canManageMasterData } from "@/lib/rbac"
import { Role } from "@/app/generated/prisma/enums"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/activity-log"

async function checkPermission() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  if (!canManageMasterData(session.user.role as Role)) return null
  return session
}

export async function getAppConfiguration() {
  try {
    let config = await prisma.appConfiguration.findFirst({
      include: {
        activeYear: true,
      },
    })

    // If no configuration exists, create default one
    if (!config) {
      config = await prisma.appConfiguration.create({
        data: {
          appName: "SIMKA",
          primaryColor: "#0f172a",
          secondaryColor: "#3b82f6",
        },
        include: {
          activeYear: true,
        },
      })
    }

    return { success: true, data: config }
  } catch (e: any) {
    console.error("Error fetching app configuration:", e)
    return { error: "Failed to fetch app configuration", details: e.message }
  }
}

export async function updateAppConfiguration(data: {
  appName?: string
  appOwner?: string
  logoUrl?: string
  faviconUrl?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  facebookUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
  primaryColor?: string
  secondaryColor?: string
  motto?: string
  vision?: string
  mission?: string
  copyright?: string
  footerText?: string
  activeYearId?: string
  activeSemester?: number
}) {
  const session = await checkPermission()
  if (!session) return { error: "Access denied" }

  try {
    let config = await prisma.appConfiguration.findFirst()

    if (!config) {
      // Create new configuration if none exists
      config = await prisma.appConfiguration.create({
        data: {
          ...data,
        },
      })
    } else {
      // Update existing configuration
      config = await prisma.appConfiguration.update({
        where: { id: config.id },
        data: {
          ...data,
        },
      })
    }

    await logActivity({ userId: session.user.id, action: "UPDATE", entity: "AppConfiguration", entityId: config.id })
    revalidatePath("/pengaturan")
    revalidatePath("/")
    return { success: true, data: config }
  } catch (e: any) {
    console.error("Error updating app configuration:", e)
    return { error: "Failed to update app configuration", details: e.message }
  }
}
