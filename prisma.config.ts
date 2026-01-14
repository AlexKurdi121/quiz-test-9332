// prisma.config.ts
// This file is optional — Prisma CLI works fine with just schema.prisma
import "dotenv/config";

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
