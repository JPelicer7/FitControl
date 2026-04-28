import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { ForbiddenError, NotFoundError } from "../errors/index.js";
//import { NotFoundError } from "../erros/index.js";
import { auth } from "../lib/auth.js";
import {
  CreateMedidasBodySchema,
  CreateMedidasDataSchema,
  ErrorSchema,
  updateMedidasBodySchema,
  updateMedidasDataSchema,
} from "../schemas/index.js";
import { CreateMedidas } from "../usecases/CreateMedidas.js";
import { UpdateMedidas } from "../usecases/UpdateMedidas.js";

export const medidasRouter = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:userId",
    schema: {
      operationId: "CreateMedidas",
      tags: ["Medidas"],
      summary: "Create medidas User",
      params: z.object({
        userId: z.string(),
      }),
      body: CreateMedidasBodySchema,
      response: {
        201: CreateMedidasDataSchema,
        403: ErrorSchema,
        401: ErrorSchema,
        404: ErrorSchema,
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

        const createMedidas = new CreateMedidas();
        const result = await createMedidas.execute({
          ...request.body,
          userId: request.params.userId,
          academiaId: session.user.academiaId,
          donoId: session.user.id,
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
    method: "PUT",
    url: "/user/:userId/:medidaId",
    schema: {
      operationId: "UpdateMedidas",
      tags: ["Medidas"],
      summary: "Update medidas User",
      params: z.object({
        userId: z.string(),
        medidaId: z.string(),
      }),
      body: updateMedidasBodySchema,
      response: {
        201: updateMedidasDataSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
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

        const updateMedida = new UpdateMedidas();
        const result = await updateMedida.execute({
          ...request.body,
          academiaId: session.user.academiaId,
          userId: request.params.userId,
          medidaId: request.params.medidaId,
          donoId: session.user.id,
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
