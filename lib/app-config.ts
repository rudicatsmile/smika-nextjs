import { prisma } from "@/lib/prisma"

export async function getAppConfig() {
  let config = await prisma.appConfiguration.findFirst({
    include: {
      activeYear: true,
    },
  })

  // If no configuration exists, create default one
  if (!config) {
    config = await prisma.appConfiguration.create({
      data: {
        appName: "SIMKA",
        primaryColor: "#0f172a",
        secondaryColor: "#3b82f6",
      },
      include: {
        activeYear: true,
      },
    })
  }

  return config
}
