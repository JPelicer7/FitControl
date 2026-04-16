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
  CreateExercicioDataSchema,
  CreateExerciciosBodySchema,
  ErrorSchema,
  GetExerciciosDataSchema,
  GetTreinoDetalhadoDataSchema,
} from "../schemas/index.js";
import { CreateExercicio } from "../usecases/CreateExercicio.js";
import { GetExercicios } from "../usecases/GetExercicios.js";
import { GetTreinoDetalhado } from "../usecases/GetTreinoDetalhado.js";

export const exercicioRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/exercicio",
    schema: {
      operationId: "createExercicio",
      tags: ["Exercicio"],
      summary: "Create Exercicio",
      body: CreateExerciciosBodySchema,
      response: {
        201: CreateExercicioDataSchema,
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

        const createExercicio = new CreateExercicio();
        const result = await createExercicio.execute({
          userId: session.user.id,
          academiaId: session.user.academiaId,
          nome: request.body.nome,
          grupoMuscular: request.body.grupoMuscular,
          videoUrl: request.body.videoUrl,
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
          return reply.status(409).send({
            error: error.message,
            code: "ExercAlreadyAdd",
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
    url: "/exercicios",
    schema: {
      operationId: "getExercicios",
      tags: ["Exercicio"],
      summary: "Get Exercicios",
      response: {
        201: GetExerciciosDataSchema,
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

        const getExercicios = new GetExercicios();
        const result = await getExercicios.execute({
          userId: session.user.id,
          academiaId: session.user.academiaId,
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
    url: "/:treinoId",
    schema: {
      operationId: "getTreinoDetalhado",
      tags: ["Exercicio"],
      summary: "Get Treino Detalhado",
      params: z.object({
        treinoId: z.string(),
      }),
      response: {
        201: GetTreinoDetalhadoDataSchema,
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

        const getTreinoDetalhado = new GetTreinoDetalhado();
        const result = await getTreinoDetalhado.execute({
          userId: session.user.id,
          academiaId: session.user.academiaId,
          treinoId: request.params.treinoId,
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
