"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { EmploymentStatus, Role } from "@/app/generated/prisma/enums"
import { resolveEmployeeAccessScope } from "@/lib/employee-scope"
import { evaluateEmployeeCompleteness } from "@/lib/document-completeness"
import { sendWhatsAppMessage } from "@/lib/whatsapp"

export async function sendTestWhatsAppAction(input: {
  phoneNumber: string
  message: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: "Sesi tidak valid." }

  const role = session.user.role as Role
  if (role !== Role.SUPER_ADMIN && role !== Role.HR) {
    return { success: false, error: "Anda tidak memiliki izin." }
  }

  const phone = input.phoneNumber.trim()
  const message = input.message.trim()
  if (!phone || !message) {
    return { success: false, error: "Nomor tujuan dan pesan wajib diisi." }
  }

  const res = await sendWhatsAppMessage({
    phoneNumber: phone,
    message,
  })

  revalidatePath("/notifikasi/whatsapp")
  return res
}

export async function broadcastWhatsAppAction(input: {
  targetType: "ALL_ACTIVE" | "INCOMPLETE_DOCS" | "DEPARTMENT"
  departmentId?: string
  messageTemplate: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: "Sesi tidak valid." }

  const role = session.user.role as Role
  if (role !== Role.SUPER_ADMIN && role !== Role.HR) {
    return { success: false, error: "Anda tidak memiliki izin." }
  }

  const template = input.messageTemplate.trim()
  if (!template) {
    return { success: false, error: "Isi pesan broadcast wajib diisi." }
  }

  const scope = await resolveEmployeeAccessScope(session.user)
  const effectiveDeptId = scope.isUnitScoped
    ? scope.scopedDepartmentId ?? "__UNASSIGNED_UNIT__"
    : input.targetType === "DEPARTMENT" && input.departmentId
    ? input.departmentId
    : undefined

  const employees = await prisma.employee.findMany({
    where: {
      employmentStatus: EmploymentStatus.AKTIF,
      phoneNumber: { not: null },
      ...(effectiveDeptId ? { departmentId: effectiveDeptId } : {}),
    },
    select: {
      id: true,
      fullName: true,
      employeeIdNumber: true,
      phoneNumber: true,
      profilePhoto: true,
      nationalIdNumber: true,
      bpjsNumber: true,
      taxIdNumber: true,
      employmentStatus: true,
      departmentId: true,
      department: { select: { id: true, name: true, order: true } },
      position: { select: { id: true, name: true, order: true } },
      importantDocuments: { select: { documentType: true, fileUrl: true } },
      healthData: { select: { bpjsNumber: true } },
    },
  })

  let targets = employees.filter((e) => Boolean(e.phoneNumber?.trim()))

  if (input.targetType === "INCOMPLETE_DOCS") {
    targets = targets.filter(
      (e) => evaluateEmployeeCompleteness(e).statusCategory !== "LENGKAP"
    )
  }

  if (targets.length === 0) {
    return {
      success: false,
      error: "Tidak ada pegawai aktif dengan nomor HP sesuai target yang dipilih.",
    }
  }

  let sentCount = 0
  let failedCount = 0
  let skippedError: string | undefined

  for (const emp of targets) {
    const personalized = template
      .replace(/\{nama\}/gi, emp.fullName)
      .replace(/\{nip\}/gi, emp.employeeIdNumber)

    const res = await sendWhatsAppMessage({
      phoneNumber: emp.phoneNumber!,
      message: personalized,
      employeeId: emp.id,
    })

    if (res.skipped) {
      skippedError = res.error
      break
    }

    if (res.success) sentCount++
    else failedCount++
  }

  revalidatePath("/notifikasi/whatsapp")

  if (skippedError) {
    return { success: false, error: skippedError }
  }

  return {
    success: true,
    sentCount,
    failedCount,
    totalTargets: targets.length,
  }
}
