import { idMap } from "../utils/id-map"

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateEmployeeRow(row: any): ValidationResult {
  if (!row.id_pegawai) return { valid: false, error: "Missing id_pegawai" }
  if (!row.nip || String(row.nip).trim() === "") {
    return { valid: false, error: "Missing NIP (employeeIdNumber)" }
  }
  if (!row.nama_lengkap || String(row.nama_lengkap).trim() === "") {
    return { valid: false, error: "Missing nama_lengkap (fullName)" }
  }
  return { valid: true }
}

export function validateChildRow(row: any): ValidationResult {
  if (!row.id_anak) return { valid: false, error: "Missing id_anak" }
  if (!row.nama_anak || String(row.nama_anak).trim() === "") {
    return { valid: false, error: "Missing nama_anak" }
  }
  const employeeId = idMap.get("pegawai", row.id_pegawai)
  if (!employeeId) {
    return { valid: false, error: `Parent employee not found in map: legacy id_pegawai=${row.id_pegawai}` }
  }
  return { valid: true }
}

export function validateSpouseRow(row: any): ValidationResult {
  if (!row.id_pasangan) return { valid: false, error: "Missing id_pasangan" }
  if (!row.nama_pasangan || String(row.nama_pasangan).trim() === "") {
    return { valid: false, error: "Missing nama_pasangan" }
  }
  const employeeId = idMap.get("pegawai", row.id_pegawai)
  if (!employeeId) {
    return { valid: false, error: `Parent employee not found in map: legacy id_pegawai=${row.id_pegawai}` }
  }
  return { valid: true }
}

export function validateRelationalRow(row: any, entityName: string, idField: string): ValidationResult {
  if (!row[idField]) return { valid: false, error: `Missing ${idField}` }
  const employeeId = idMap.get("pegawai", row.id_pegawai)
  if (!employeeId) {
    return { valid: false, error: `Parent employee not found in map for ${entityName}: legacy id_pegawai=${row.id_pegawai}` }
  }
  return { valid: true }
}
