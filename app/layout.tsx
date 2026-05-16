import type { Metadata } from "next"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { getAppConfig } from "@/lib/app-config"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

export async function generateMetadata(): Promise<Metadata> {
  const config = await getAppConfig()
  const appName = config.appName || "SIMKA"
  const appOwner = config.appOwner || "Al Wathoniyah 9"
  const faviconUrl = config.faviconUrl

  return {
    title: `${appName} ${appOwner}`,
    description: `Sistem Informasi Kepegawaian ${appOwner}`,
    icons: faviconUrl ? [{ rel: "icon", url: faviconUrl }] : [],
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
