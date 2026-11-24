import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { GantiPasswordClient } from "./ganti-password-client"

export const metadata = {
  title: "Ganti Password - SIMKA",
  description: "Perbarui kata sandi akun SIMKA Anda secara berkala dan aman",
}

export default async function GantiPasswordPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="py-2 sm:py-6">
      <GantiPasswordClient user={session.user} />
    </div>
  )
}
