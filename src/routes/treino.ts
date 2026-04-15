import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { auth } from "../lib/auth.js";
import {
  CreateTreinoBodySchema,
  CreateTreinoDataSchema,
  ErrorSchema,
  GetTreinosDataSchema,
} from "../schemas/index.js";
import { CreateTreino } from "../usecases/CreateTreino.js";
import { GetTreinos } from "../usecases/GetTreinos.js";

export const treinoRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/treino",
    schema: {
      operationId: "createTreino",
      tags: ["Treino"],
      summary: "Create Treino",
      body: CreateTreinoBodySchema,
      response: {
        201: CreateTreinoDataSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        409: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        if (session.user.role !== "Dono") {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        const createTreino = new CreateTreino();
        const result = await createTreino.execute({
          nome: request.body.nome,
          descricao: request.body.descricao,
          academiaId: session.user.academiaId,
          criadoPorId: session.user.id,
        });

        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "NOT_FOUND",
          });
        }

        if (error instanceof ForbiddenError) {
          return reply.status(403).send({
            error: error.message,
            code: "ForbiddenError",
          });
        }

        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/treinos",
    schema: {
      operationId: "getTreinos",
      tags: ["Treino"],
      summary: "Get Treinos",
      response: {
        201: GetTreinosDataSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        409: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        if (session.user.role !== "Dono") {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        const getTreinos = new GetTreinos();
        const result = await getTreinos.execute({
          academiaId: session.user.academiaId,
          userId: session.user.id,
        });

        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);

        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "NOT_FOUND",
          });
        }

        if (error instanceof ForbiddenError) {
          return reply.status(403).send({
            error: error.message,
            code: "ForbiddenError",
          });
        }

        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
