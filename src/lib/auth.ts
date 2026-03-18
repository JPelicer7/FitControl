import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";

import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// ... seus imports

export const auth = betterAuth({
  trustedOrigins: ["http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // ADICIONE ISSO AQUI ABAIXO:
  user: {
    additionalFields: {
      role: { type: "string" },
      Status: { type: "string" },
      plano: { type: "string" },
      academiaId: { type: "string" },
    },
  },
  plugins: [openAPI()],
});
