import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";

import { prisma } from "./db.js";
import { env } from "./env.js";

export const auth = betterAuth({
  baseURL: env.API_BASE_URL,
  trustedOrigins: [
    env.WEB_APP_BASE_URL,
    "https://www.fitcontrolapp.com.br",
    "http://fitcontrolapp.com.br",
  ],
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      role: { type: "string" },
      Status: { type: "string" },
      plano: { type: "string" },
      academiaId: { type: "string" },
      telefone: { type: "string", required: false },
    },
  },
  plugins: [openAPI()],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain:
        env.NODE_ENV === "production" ? ".fitcontrolapp.com.br" : undefined,
    },
  },
});
