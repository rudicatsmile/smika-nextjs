import path from "path"

export const config = {
  oldDb: {
    host: process.env.OLD_DB_HOST || "127.0.0.1",
    port: Number(process.env.OLD_DB_PORT) || 3306,
    user: process.env.OLD_DB_USER || "root",
    password: process.env.OLD_DB_PASSWORD || "",
    database: process.env.OLD_DB_NAME || "simka9_ci",
    connectTimeout: 10000,
    connectionLimit: 10,
  },
  newDb: {
    url: process.env.DATABASE_URL || "mysql://root:@127.0.0.1:3306/simka9",
  },
  paths: {
    oldAssets: path.resolve("D:/project/http/yalwash9/simka9-ci/asset"),
    newUploads: path.resolve("D:/project/web/simka-nextjs/public/uploads"),
    reports: path.resolve("D:/project/web/simka-nextjs/migration/reports"),
  },
  defaults: {
    employeePassword: "simka@password2026", // Default password for employee logins
    adminPassword: "AdminSimka2026!",      // Default password for admin logins
  },
}
