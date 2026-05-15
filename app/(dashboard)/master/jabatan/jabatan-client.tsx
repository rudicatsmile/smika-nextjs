"use client"

import { MasterTable } from "@/components/master/master-table"
import { createPosition, updatePosition, deletePosition } from "@/server/actions/master"

interface Position { id: string; name: string; description?: string | null; isActive: boolean }

export function JabatanClient({ positions }: { positions: Position[] }) {
  const items = positions.map((p) => ({
    id: p.id, name: p.name, description: p.description ?? undefined, isActive: p.isActive,
  }))

  return (
    <MasterTable
      title="Jabatan"
      items={items}
      hasDescription
      onAdd={(data) => createPosition({ name: data.name!, description: data.description })}
      onEdit={(id, data) => updatePosition(id, { name: data.name!, description: data.description, isActive: data.isActive })}
      onDelete={deletePosition}
    />
  )
}
