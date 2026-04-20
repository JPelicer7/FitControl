import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import {
  ExercAlreadyAdd,
  ForbiddenError,
  NotFoundError,
} from "../errors/index.js";
import { Prisma } from "../generated/prisma/client.js";
import { auth } from "../lib/auth.js";
import {
  CreateTreinoExercBodySchema,
  CreateTreinoExercDataSchema,
  DeleteTreinoExercicioDataSchema,
  ErrorSchema,
  UpdateTreinoExercicioBodySchema,
  UpdateTreinoExercicioDataSchema,
} from "../schemas/index.js";
import { CreateTreinoExercicio } from "../usecases/CreateTreinoExercicio.js";
import { DeleteTreinoExercicio } from "../usecases/DeleteTreinoExercicio.js";
import { UpdateTreinoExercicio } from "../usecases/UpdateTreinoExercicio.js";

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
          exercicioId: request.body.exercicioId,
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

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/:treinoId/update/:treinoExercicioId",
    schema: {
      operationId: "updateTreinoExercicio",
      tags: ["TreinoExercicio"],
      summary: "Update Treino Exercicio",
      body: UpdateTreinoExercicioBodySchema,
      params: z.object({
        treinoId: z.string(),
        treinoExercicioId: z.string(),
      }),
      response: {
        201: UpdateTreinoExercicioDataSchema,
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

        const updateTreinoExercicio = new UpdateTreinoExercicio();
        const result = await updateTreinoExercicio.execute({
          donoId: session.user.id,
          academiaId: session.user.academiaId,
          treinoId: request.params.treinoId,
          treinoExercicioId: request.params.treinoExercicioId,
          series: request.body.series,
          carga: request.body.carga,
          repeticoes: request.body.repeticoes,
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
    method: "DELETE",
    url: "/:treinoId/delete/:treinoExercicioId",
    schema: {
      operationId: "deleteTreinoExercicio",
      tags: ["TreinoExercicio"],
      summary: "Delete Treino Exercicio",
      params: z.object({
        treinoId: z.string(),
        treinoExercicioId: z.string(),
      }),
      response: {
        200: DeleteTreinoExercicioDataSchema,
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

        const deleteTreinoExercicio = new DeleteTreinoExercicio();
        const result = await deleteTreinoExercicio.execute({
          donoId: session.user.id,
          academiaId: session.user.academiaId,
          treinoId: request.params.treinoId,
          treinoExercicioId: request.params.treinoExercicioId,
        });

        return reply.status(200).send(result);
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

        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2025"
        ) {
          return reply.status(404).send({
            error: "Exercício não encontrado.",
            code: "NOT_FOUND",
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
