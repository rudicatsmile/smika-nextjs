import { prisma } from "./prisma"

export async function logActivity({
  userId,
  action,
  entity,
  entityId,
  meta,
}: {
  userId: string
  action: string
  entity: string
  entityId?: string
  meta?: Record<string, unknown>
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        meta: meta ? JSON.stringify(meta) : null,
        ipAddress: getClientIp(),
        userAgent: getUserAgent(),
      },
    })
  } catch {
    // Non-blocking: log failure should not break the main operation
  }
}

function getClientIp(): string | null {
  // This would typically come from request headers in a real implementation
  // For now, return null as this is server-side only
  return null
}

function getUserAgent(): string | null {
  // This would typically come from request headers in a real implementation
  // For now, return null as this is server-side only
  return null
}
