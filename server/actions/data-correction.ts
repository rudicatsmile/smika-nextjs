"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { MaritalStatus, Role } from "@/app/generated/prisma/enums"
import {
  formatCorrectionValue,
  getCorrectionFieldOption,
  MARITAL_STATUS_OPTIONS,
} from "@/lib/correction-fields"
import {
  resolveEmployeeAccessScope,
  canMutateEmployeeChildData,
} from "@/lib/employee-scope"
import { createNotification } from "@/server/actions/notification"

export async function submitDataCorrectionRequest(input: {
  fieldKey: string
  newValue: string
  reason: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: "Sesi tidak valid. Silakan login ulang." }
  }

  const fieldOption = getCorrectionFieldOption(input.fieldKey)
  if (!fieldOption) {
    return { success: false, error: "Field data yang dipilih tidak valid." }
  }

  const newValue = input.newValue.trim()
  const reason = input.reason.trim()

  if (!newValue) {
    return { success: false, error: "Nilai data baru wajib diisi." }
  }
  if (!reason) {
    return { success: false, error: "Alasan pengajuan koreksi wajib diisi." }
  }

  // Validasi khusus tipe field
  if (fieldOption.inputType === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newValue)) {
      return { success: false, error: "Format email tidak valid." }
    }
  }
  if (fieldOption.key === "dateOfBirth") {
    const parsed = new Date(newValue)
    if (Number.isNaN(parsed.getTime())) {
      return { success: false, error: "Format tanggal lahir tidak valid." }
    }
  }
  if (fieldOption.key === "maritalStatus") {
    const valid = MARITAL_STATUS_OPTIONS.some((o) => o.value === newValue)
    if (!valid) {
      return { success: false, error: "Status pernikahan tidak valid." }
    }
  }
  if (fieldOption.key === "nationalIdNumber" && !/^\d{16}$/.test(newValue)) {
    return { success: false, error: "NIK harus terdiri dari 16 digit angka." }
  }

  // Cari data pegawai milik user
  const employee = session.user.employeeId
    ? await prisma.employee.findUnique({
        where: { id: session.user.employeeId },
      })
    : session.user.nip
    ? await prisma.employee.findFirst({
        where: { employeeIdNumber: session.user.nip },
      })
    : null

  if (!employee) {
    return {
      success: false,
      error: "Akun Anda belum terhubung dengan data pegawai.",
    }
  }

  const rawOld = (employee as Record<string, unknown>)[fieldOption.key] as
    | string
    | Date
    | null
    | undefined
  const oldValueFormatted = formatCorrectionValue(fieldOption.key, rawOld)

  if (
    (fieldOption.key === "dateOfBirth" && oldValueFormatted === newValue) ||
    (fieldOption.key !== "dateOfBirth" &&
      String(rawOld ?? "").trim() === newValue)
  ) {
    return {
      success: false,
      error: "Data baru sama dengan data saat ini.",
    }
  }

  const created = await prisma.dataCorrectionRequest.create({
    data: {
      employeeId: employee.id,
      requestedById: session.user.id,
      fieldKey: fieldOption.key,
      fieldLabel: fieldOption.label,
      oldValue: oldValueFormatted === "-" ? null : oldValueFormatted,
      newValue,
      reason,
      status: "PENDING",
    },
  })

  // Notifikasi ke HR & SUPER_ADMIN yang relevan
  try {
    const reviewers = await prisma.user.findMany({
      where: {
        isActive: true,
        id: { not: session.user.id },
        OR: [
          { role: Role.SUPER_ADMIN },
          { role: Role.HR, departmentId: null },
          ...(employee.departmentId
            ? [{ role: Role.HR, departmentId: employee.departmentId }]
            : []),
        ],
      },
      select: { id: true },
    })

    await Promise.all(
      reviewers.map((u) =>
        createNotification({
          userId: u.id,
          type: "INFO",
          title: "Pengajuan Koreksi Data Baru",
          message: `${employee.fullName} mengajukan perubahan ${fieldOption.label}.`,
          link: "/pengajuan-koreksi",
        })
      )
    )
  } catch {
    // Jangan gagalkan pengajuan hanya karena notifikasi
  }

  revalidatePath("/pengajuan-koreksi")
  revalidatePath("/notifikasi")
  return { success: true, id: created.id }
}

export async function cancelDataCorrectionRequest(requestId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: "Sesi tidak valid." }
  }

  const req = await prisma.dataCorrectionRequest.findUnique({
    where: { id: requestId },
    select: { id: true, requestedById: true, status: true },
  })

  if (!req) {
    return { success: false, error: "Pengajuan tidak ditemukan." }
  }
  if (req.requestedById !== session.user.id) {
    return { success: false, error: "Anda tidak memiliki izin membatalkan pengajuan ini." }
  }
  if (req.status !== "PENDING") {
    return { success: false, error: "Hanya pengajuan berstatus Menunggu yang dapat dibatalkan." }
  }

  await prisma.dataCorrectionRequest.delete({ where: { id: requestId } })
  revalidatePath("/pengajuan-koreksi")
  return { success: true }
}

export async function reviewDataCorrectionRequest(input: {
  requestId: string
  decision: "APPROVED" | "REJECTED"
  reviewNote?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: "Sesi tidak valid." }
  }

  const role = session.user.role as Role
  if (role !== Role.SUPER_ADMIN && role !== Role.HR) {
    return { success: false, error: "Anda tidak memiliki izin meninjau pengajuan ini." }
  }

  const req = await prisma.dataCorrectionRequest.findUnique({
    where: { id: input.requestId },
    include: {
      employee: {
        select: { id: true, fullName: true, departmentId: true },
      },
    },
  })

  if (!req) {
    return { success: false, error: "Pengajuan tidak ditemukan." }
  }
  if (req.status !== "PENDING") {
    return { success: false, error: "Pengajuan ini sudah ditinjau sebelumnya." }
  }

  const scope = await resolveEmployeeAccessScope(session.user)
  if (!canMutateEmployeeChildData(scope, req.employee.departmentId, req.employee.id)) {
    return {
      success: false,
      error: "Anda hanya dapat meninjau pengajuan pegawai di unit Anda.",
    }
  }

  const fieldOption = getCorrectionFieldOption(req.fieldKey)
  if (!fieldOption) {
    return { success: false, error: "Field koreksi tidak dikenali." }
  }

  const note = input.reviewNote?.trim() || null

  if (input.decision === "REJECTED" && !note) {
    return { success: false, error: "Harap isi alasan penolakan pada catatan." }
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (input.decision === "APPROVED") {
        let parsedValue: string | Date | MaritalStatus = req.newValue
        if (req.fieldKey === "dateOfBirth") {
          parsedValue = new Date(req.newValue)
        } else if (req.fieldKey === "maritalStatus") {
          parsedValue = req.newValue as MaritalStatus
        }

        await tx.employee.update({
          where: { id: req.employeeId },
          data: {
            [req.fieldKey]: parsedValue,
          },
        })
      }

      await tx.dataCorrectionRequest.update({
        where: { id: req.id },
        data: {
          status: input.decision,
          reviewedById: session.user.id,
          reviewNote: note,
          reviewedAt: new Date(),
        },
      })

      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action:
            input.decision === "APPROVED"
              ? "APPROVE_DATA_CORRECTION"
              : "REJECT_DATA_CORRECTION",
          entity: "DataCorrectionRequest",
          entityId: req.id,
          meta: JSON.stringify({
            employeeId: req.employeeId,
            fieldKey: req.fieldKey,
            newValue: req.newValue,
          }),
        },
      })
    })
  } catch (err: unknown) {
    const message =
      err instanceof Error && err.message.includes("Unique constraint")
        ? "Gagal menerapkan: nilai tersebut sudah digunakan pegawai lain (duplikat)."
        : "Terjadi kesalahan saat memproses pengajuan koreksi."
    return { success: false, error: message }
  }

  // Kirim notifikasi ke pengaju
  try {
    await createNotification({
      userId: req.requestedById,
      type: input.decision === "APPROVED" ? "SUCCESS" : "WARNING",
      title:
        input.decision === "APPROVED"
          ? "Koreksi Data Disetujui"
          : "Koreksi Data Ditolak",
      message:
        input.decision === "APPROVED"
          ? `Perubahan ${req.fieldLabel} menjadi "${formatCorrectionValue(req.fieldKey, req.newValue)}" telah disetujui dan diterapkan.`
          : `Pengajuan perubahan ${req.fieldLabel} ditolak. Catatan: ${note}`,
      link: "/pengajuan-koreksi",
    })
  } catch {
    // silent
  }

  revalidatePath("/pengajuan-koreksi")
  revalidatePath(`/pegawai/${req.employeeId}`)
  revalidatePath("/notifikasi")
  return { success: true }
}
