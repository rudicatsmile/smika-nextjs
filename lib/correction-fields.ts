export interface CorrectionFieldOption {
  key:
    | "phoneNumber"
    | "email"
    | "address"
    | "province"
    | "postalCode"
    | "secondaryAddress"
    | "maritalStatus"
    | "placeOfBirth"
    | "dateOfBirth"
    | "nationalIdNumber"
    | "bpjsNumber"
    | "taxIdNumber"
    | "educatorIdNumber"
  label: string
  inputType: "text" | "textarea" | "email" | "date" | "select"
  placeholder?: string
  options?: { value: string; label: string }[]
}

export const MARITAL_STATUS_OPTIONS = [
  { value: "BELUM_MENIKAH", label: "Belum Menikah" },
  { value: "MENIKAH", label: "Menikah" },
  { value: "CERAI_HIDUP", label: "Cerai Hidup" },
  { value: "CERAI_MATI", label: "Cerai Mati" },
]

export const CORRECTION_FIELD_OPTIONS: CorrectionFieldOption[] = [
  {
    key: "phoneNumber",
    label: "No. Telepon / HP",
    inputType: "text",
    placeholder: "Contoh: 081234567890",
  },
  {
    key: "email",
    label: "Email Pribadi",
    inputType: "email",
    placeholder: "Contoh: nama@email.com",
  },
  {
    key: "address",
    label: "Alamat Utama (KTP)",
    inputType: "textarea",
    placeholder: "Masukkan alamat lengkap sesuai KTP",
  },
  {
    key: "province",
    label: "Provinsi",
    inputType: "text",
    placeholder: "Contoh: Jawa Barat",
  },
  {
    key: "postalCode",
    label: "Kode Pos",
    inputType: "text",
    placeholder: "Contoh: 17510",
  },
  {
    key: "secondaryAddress",
    label: "Alamat Domisili / Sekunder",
    inputType: "textarea",
    placeholder: "Masukkan alamat domisili saat ini",
  },
  {
    key: "maritalStatus",
    label: "Status Pernikahan",
    inputType: "select",
    options: MARITAL_STATUS_OPTIONS,
  },
  {
    key: "placeOfBirth",
    label: "Tempat Lahir",
    inputType: "text",
    placeholder: "Contoh: Bekasi",
  },
  {
    key: "dateOfBirth",
    label: "Tanggal Lahir",
    inputType: "date",
  },
  {
    key: "nationalIdNumber",
    label: "NIK (16 Digit)",
    inputType: "text",
    placeholder: "Masukkan 16 digit NIK",
  },
  {
    key: "bpjsNumber",
    label: "Nomor BPJS",
    inputType: "text",
    placeholder: "Masukkan nomor kartu BPJS",
  },
  {
    key: "taxIdNumber",
    label: "NPWP",
    inputType: "text",
    placeholder: "Masukkan nomor NPWP",
  },
  {
    key: "educatorIdNumber",
    label: "NUPTK",
    inputType: "text",
    placeholder: "Masukkan nomor NUPTK",
  },
]

export function getCorrectionFieldOption(key: string): CorrectionFieldOption | undefined {
  return CORRECTION_FIELD_OPTIONS.find((f) => f.key === key)
}

export function formatCorrectionValue(
  key: string,
  rawValue: string | Date | null | undefined
): string {
  if (rawValue === null || rawValue === undefined || rawValue === "") return "-"
  if (key === "dateOfBirth") {
    const d = rawValue instanceof Date ? rawValue : new Date(rawValue)
    if (Number.isNaN(d.getTime())) return String(rawValue)
    return d.toISOString().slice(0, 10)
  }
  if (key === "maritalStatus") {
    const found = MARITAL_STATUS_OPTIONS.find((o) => o.value === String(rawValue))
    return found ? found.label : String(rawValue)
  }
  return String(rawValue)
}
