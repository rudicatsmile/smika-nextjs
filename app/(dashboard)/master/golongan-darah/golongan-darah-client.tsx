"use client"

import { MasterTable } from "@/components/master/master-table"
import { createBloodType, updateBloodType, deleteBloodType } from "@/server/actions/master"

interface BloodType { id: string; name: string; isActive: boolean }

export function GolonganDarahClient({ bloodTypes }: { bloodTypes: BloodType[] }) {
  const items = bloodTypes.map((b) => ({ id: b.id, name: b.name, isActive: b.isActive }))
  return (
    <MasterTable
      title="Golongan Darah"
      items={items}
      onAdd={(data) => createBloodType({ name: data.name! })}
      onEdit={(id, data) => updateBloodType(id, { name: data.name!, isActive: data.isActive })}
      onDelete={deleteBloodType}
    />
  )
}
