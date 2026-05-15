"use client"

import { MasterTable } from "@/components/master/master-table"
import {
  createDepartment, updateDepartment, deleteDepartment,
} from "@/server/actions/master"

interface Department { id: string; name: string; code: string; description?: string | null; isActive: boolean }

export function DepartemenClient({ departments }: { departments: Department[] }) {
  const items = departments.map((d) => ({
    id: d.id, name: d.name, code: d.code,
    description: d.description ?? undefined, isActive: d.isActive,
  }))

  return (
    <MasterTable
      title="Departemen / Unit"
      items={items}
      hasCode
      hasDescription
      onAdd={(data) => createDepartment({ code: data.code!, name: data.name!, description: data.description })}
      onEdit={(id, data) => updateDepartment(id, { code: data.code!, name: data.name!, description: data.description, isActive: data.isActive })}
      onDelete={deleteDepartment}
    />
  )
}
