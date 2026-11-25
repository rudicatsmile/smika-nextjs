import { prisma } from "@/lib/prisma"

export function normalizeWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (!digits) return ""
  if (digits.startsWith("0")) {
    return "62" + digits.slice(1)
  }
  if (digits.startsWith("8")) {
    return "62" + digits
  }
  return digits
}

export async function sendWhatsAppMessage(input: {
  phoneNumber: string
  message: string
  employeeId?: string | null
}): Promise<{
  success: boolean
  skipped?: boolean
  error?: string
}> {
  const normalized = normalizeWhatsAppNumber(input.phoneNumber)
  if (!normalized || normalized.length < 10) {
    return { success: false, error: "Nomor WhatsApp tidak valid." }
  }

  const config = await prisma.appConfiguration.findFirst({
    select: {
      waEnabled: true,
      waProvider: true,
      waApiUrl: true,
      waApiToken: true,
    },
  })

  if (!config?.waEnabled) {
    return {
      success: false,
      skipped: true,
      error: "WhatsApp Gateway belum diaktifkan di Pengaturan.",
    }
  }

  const token = config.waApiToken?.trim()
  if (!token) {
    return {
      success: false,
      skipped: true,
      error: "API Token WhatsApp Gateway belum diisi.",
    }
  }

  const provider = (config.waProvider || "FONNTE").toUpperCase()
  const endpoint =
    config.waApiUrl?.trim() ||
    (provider === "FONNTE" ? "https://api.fonnte.com/send" : "")

  if (!endpoint) {
    return {
      success: false,
      error: "Endpoint API URL WhatsApp Gateway belum diisi.",
    }
  }

  try {
    let res: Response

    if (provider === "FONNTE") {
      const formData = new FormData()
      formData.append("target", normalized)
      formData.append("message", input.message)
      res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: token },
        body: formData,
      })
    } else if (provider === "WABLAS") {
      res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: normalized,
          message: input.message,
        }),
      })
    } else {
      res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: normalized,
          message: input.message,
        }),
      })
    }

    const rawText = await res.text()
    const isOk = res.ok

    await prisma.whatsAppLog.create({
      data: {
        employeeId: input.employeeId ?? null,
        phoneNumber: normalized,
        message: input.message,
        provider,
        status: isOk ? "SENT" : "FAILED",
        response: rawText.slice(0, 1000),
      },
    })

    if (!isOk) {
      return {
        success: false,
        error: `Gateway mengembalikan status ${res.status}`,
      }
    }

    return { success: true }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Network error"
    await prisma.whatsAppLog.create({
      data: {
        employeeId: input.employeeId ?? null,
        phoneNumber: normalized,
        message: input.message,
        provider,
        status: "FAILED",
        response: errMsg.slice(0, 1000),
      },
    })
    return { success: false, error: errMsg }
  }
}
