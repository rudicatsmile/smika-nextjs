/**
 * Utility to parse various Indonesian date string representations into a valid Date object.
 */
const INDO_MONTHS: Record<string, string> = {
  januari: "01",
  februari: "02",
  maret: "03",
  april: "04",
  mei: "05",
  juni: "06",
  juli: "07",
  agustus: "08",
  september: "09",
  oktober: "10",
  november: "11",
  desember: "12",
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  jun: "06",
  jul: "07",
  agu: "08",
  agt: "08",
  sep: "09",
  okt: "10",
  nov: "11",
  des: "12",
}

export function parseIndoDate(input: unknown): Date | null {
  if (!input) return null
  if (input instanceof Date && !isNaN(input.getTime())) return input

  const str = String(input).trim().toLowerCase()
  if (!str || str === "0000-00-00" || str === "-") return null

  // 1. Try standard ISO format YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    const d = new Date(Number(year), Number(month) - 1, Number(day))
    if (!isNaN(d.getTime())) return d
  }

  // 2. Try DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch
    const d = new Date(Number(year), Number(month) - 1, Number(day))
    if (!isNaN(d.getTime())) return d
  }

  // 3. Try Indonesian string format, e.g. "17 Juli 2017" or "17-Juli-2017"
  const indoMatch = str.match(/^(\d{1,2})\s*[- ]\s*([a-z]+)\s*[- ]\s*(\d{4})/)
  if (indoMatch) {
    const [, day, monthStr, year] = indoMatch
    const monthNum = INDO_MONTHS[monthStr]
    if (monthNum) {
      const d = new Date(Number(year), Number(monthNum) - 1, Number(day))
      if (!isNaN(d.getTime())) return d
    }
  }

  // 4. Try 4 digit year only (e.g. "2018") -> set to Jan 1st
  const yearOnlyMatch = str.match(/^(\d{4})$/)
  if (yearOnlyMatch) {
    const d = new Date(Number(yearOnlyMatch[1]), 0, 1)
    if (!isNaN(d.getTime())) return d
  }

  return null
}

export function cleanString(val: unknown): string | null {
  if (val === null || val === undefined) return null
  const s = String(val).trim()
  // Check if empty, or purely dashes/underscores like "----------------"
  if (s === "" || s === "-" || /^[-_]+$/.test(s)) return null
  return s
}

export function cleanNumber(val: unknown): number | null {
  if (val === null || val === undefined) return null
  const num = Number(val)
  return isNaN(num) ? null : num
}
