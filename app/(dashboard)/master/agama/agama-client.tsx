"use client"

import { MasterTable } from "@/components/master/master-table"
import { createReligion, updateReligion, deleteReligion } from "@/server/actions/master"

interface Religion { id: string; name: string; isActive: boolean }

export function AgamaClient({ religions }: { religions: Religion[] }) {
  const items = religions.map((r) => ({ id: r.id, name: r.name, isActive: r.isActive }))
  return (
    <MasterTable
      title="Agama"
      items={items}
      onAdd={(data) => createReligion({ name: data.name! })}
      onEdit={(id, data) => updateReligion(id, { name: data.name!, isActive: data.isActive })}
      onDelete={deleteReligion}
    />
  )
}
