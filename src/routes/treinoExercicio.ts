import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import {
  ExercAlreadyAdd,
  ForbiddenError,
  NotFoundError,
} from "../errors/index.js";
import { auth } from "../lib/auth.js";
import {
  CreateTreinoExercBodySchema,
  CreateTreinoExercDataSchema,
  ErrorSchema,
} from "../schemas/index.js";
import { CreateTreinoExercicio } from "../usecases/CreateTreinoExercicio.js";

export const treinoExercRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:treinoId",
    schema: {
      operationId: "createTreinoExercio",
      tags: ["TreinoExercicio"],
      summary: "Create Treino Exercicio",
      body: CreateTreinoExercBodySchema,
      params: z.object({
        treinoId: z.string(),
      }),
      response: {
        201: CreateTreinoExercDataSchema,
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

        const createTreinoExercicio = new CreateTreinoExercicio();
        const result = await createTreinoExercicio.execute({
          userId: session.user.id,
          academiaId: session.user.academiaId,
          treinoId: request.params.treinoId,
          exercicoId: request.body.exercicoId,
          series: request.body.series,
          carga: request.body.carga,
          repeticoes: request.body.repeticoes,
          ordem: request.body.ordem,
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

        if (error instanceof ExercAlreadyAdd) {
          {
            return reply.status(409).send({
              error: error.message,
              code: "ExercAlreadyAdd",
            });
          }
        }

        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
