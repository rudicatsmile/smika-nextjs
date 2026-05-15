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
      },
    })
  } catch {
    // Non-blocking: log failure should not break the main operation
  }
}
