import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import {
  ForbiddenError,
  NotFoundError,
  VinculoExists,
} from "../errors/index.js";
import { auth } from "../lib/auth.js";
import {
  alunoTreinoBodySchema,
  alunoTreinoDataSchema,
  ErrorSchema,
  GetAlunoTreinoDataSchema,
} from "../schemas/index.js";
import { CreateAlunoTreino } from "../usecases/CreateAlunoTreino.js";
import { GetAlunosTreino } from "../usecases/GetAlunosTreino.js";

export const alunoTreinoRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:treinoId",
    schema: {
      operationId: "createAlunoTreino",
      tags: ["alunoTreino"],
      summary: "Create vinculo Aluno ao Treino",
      body: alunoTreinoBodySchema,
      params: z.object({
        treinoId: z.string(),
      }),
      response: {
        201: alunoTreinoDataSchema,
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

        const createAlunoTreino = new CreateAlunoTreino();
        const result = await createAlunoTreino.execute({
          donoId: session.user.id,
          academiaId: session.user.academiaId,
          userId: request.body.userId,
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

        if (error instanceof VinculoExists) {
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
    url: "/:treinoId/alunos",
    schema: {
      operationId: "getAlunosTreino",
      tags: ["alunoTreino"],
      summary: "Get Alunos Vinculados",
      params: z.object({
        treinoId: z.string(),
      }),
      response: {
        201: GetAlunoTreinoDataSchema,
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

        const getAlunosTreino = new GetAlunosTreino();
        const result = await getAlunosTreino.execute({
          treinoId: request.params.treinoId,
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
};
