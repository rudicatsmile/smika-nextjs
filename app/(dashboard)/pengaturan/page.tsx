import { getAppConfiguration } from "@/server/actions/app-configuration"
import { ConfigurationClient } from "./configuration-client"

export default async function ConfigurationPage() {
  const result = await getAppConfiguration()

  return (
    <div className="space-y-6">
      <ConfigurationClient initialData={result.success ? result.data : null} />
    </div>
  )
}
