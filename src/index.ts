import "dotenv/config";

import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import fastifySwagger from "@fastify/swagger";
//import fastifySwaggerUI from "@fastify/swagger-ui";
import fastifyApiReference from "@scalar/fastify-api-reference";
// Import the framework and instantiate it
import Fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import z from "zod";

import { auth } from "./lib/auth.js";
import { agendaRoutes } from "./routes/agenda.js";
import { alunoTreinoRoutes } from "./routes/alunoTreino.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { exercicioRoutes } from "./routes/exercicio.js";
import { financeiroRoutes } from "./routes/financeiro.js";
import { medidasRouter } from "./routes/medidas.js";
import { treinoRoutes } from "./routes/treino.js";
import { treinoExercRoutes } from "./routes/treinoExercicio.js";
import { userRoutes } from "./routes/user.js";

// const app = Fastify({
//   logger: true,
// });

const isProd = process.env.NODE_ENV === "production";
const app = Fastify({
  logger: isProd
    ? {
        level: "warn",
        serializers: {
          req(request) {
            return {
              method: request.method,
              url: request.url,
              remoteAddress: request.ip,
            };
          },
          res(reply) {
            return {
              statusCode: reply.statusCode,
            };
          },
        },
      }
    : {
        level: "info", // em desenvolvimento loga tudo
        transport: {
          target: "pino-pretty", // output legível no terminal
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      },
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/",
  schema: {
    querystring: z.object({
      name: z.string().min(4),
    }),
    response: {
      200: z.string(),
    },
  },
  handler: (req, res) => {
    res.send(req.query.name);
  },
});

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "FitControl",
      description: "API para Gerenciamento de Academia",
      version: "1.0.0",
    },
    servers: [
      {
        description: "LocalHost",
        url: "http://localhost:8080",
      },
    ],
  },
  transform: jsonSchemaTransform,
});

//para pegar dados do frontEnd
await app.register(fastifyCors, {
  origin: ["http://localhost:3000"],
  credentials: true,
});

await app.register(fastifyCookie);

// Rate limiting global

await app.register(rateLimit, {
  global: true,
  max: 100,
  timeWindow: "1 minute",
  keyGenerator: (request) => {
    const sessionToken = request.cookies?.["better-auth.session_token"];
    return sessionToken ?? request.ip;
  },
  errorResponseBuilder: () => ({
    error: "Muitas requisições. Tente novamente em instantes.",
    code: "RATE_LIMIT_EXCEEDED",
  }),
});

await app.register(fastifyApiReference, {
  routePrefix: "/docs",
  configuration: {
    sources: [
      {
        title: "FitControl",
        slug: "FitControl-api",
        url: "/swagger.json",
      },
      {
        title: "Auth API",
        slug: "auth-api",
        url: "/api/auth/open-api/generate-schema",
      },
    ],
  },
});

app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/swagger.json",
  schema: {
    hide: true,
  },
  handler: async () => {
    return app.swagger();
  },
});

// app.register(fastifySwaggerUI, {
//   routePrefix: "/docs",
// });

//Rotas
await app.register(userRoutes, { prefix: "/user" });
await app.register(medidasRouter, { prefix: "/medidas" });
await app.register(financeiroRoutes, { prefix: "/financeiro" });
await app.register(exercicioRoutes, { prefix: "/exercicio" });
await app.register(treinoRoutes, { prefix: "/treino" });
await app.register(treinoExercRoutes, { prefix: "/treinoExerc" });
await app.register(alunoTreinoRoutes, { prefix: "/alunoTreino" });
await app.register(agendaRoutes, { prefix: "/agenda" });
await app.register(dashboardRoutes, { prefix: "/dashboard" });

app.route({
  method: "POST",
  url: "/api/auth/sign-in/email",
  schema: { hide: true },
  config: {
    rateLimit: {
      max: 10,
      timeWindow: "5 minutes",
    },
  },
  async handler(request, reply) {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString());
      });
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });
      const response = await auth.handler(req);
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      reply.send(response.body ? await response.text() : null);
    } catch (error) {
      app.log.error(error);
      reply
        .status(500)
        .send({ error: "Internal authentication error", code: "AUTH_FAILURE" });
    }
  },
});

// Register authentication endpoint
app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  schema: {
    hide: true,
  },
  async handler(request, reply) {
    try {
      // Construct request URL
      const url = new URL(request.url, `http://${request.headers.host}`);

      // Convert Fastify headers to standard Headers object
      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString());
      });
      // Create Fetch API-compatible request
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });
      // Process authentication request
      const response = await auth.handler(req);
      // Forward response to client
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      reply.send(response.body ? await response.text() : null);
    } catch (error) {
      //app.log.error("Authentication Error:", error);
      app.log.error(error);
      reply.status(500).send({
        error: "Internal authentication error",
        code: "AUTH_FAILURE",
      });
    }
  },
});

// Run the server!
try {
  await app.listen({ port: Number(process.env.PORT || 8080) });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
