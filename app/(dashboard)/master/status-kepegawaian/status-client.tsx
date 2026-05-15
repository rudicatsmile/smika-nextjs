"use client"

import { MasterTable } from "@/components/master/master-table"
import { createEmploymentStatus, updateEmploymentStatus, deleteEmploymentStatus } from "@/server/actions/master"

interface Status { id: string; name: string; isActive: boolean }

export function StatusClient({ statuses }: { statuses: Status[] }) {
  const items = statuses.map((s) => ({ id: s.id, name: s.name, isActive: s.isActive }))

  return (
    <MasterTable
      title="Status Kepegawaian"
      items={items}
      onAdd={(data) => createEmploymentStatus({ name: data.name! })}
      onEdit={(id, data) => updateEmploymentStatus(id, { name: data.name!, isActive: data.isActive })}
      onDelete={deleteEmploymentStatus}
    />
  )
}
