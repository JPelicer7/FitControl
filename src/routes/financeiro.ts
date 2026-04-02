import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { auth } from "../lib/auth.js";
import {
  CreateTransactionBodySchema,
  CreateTransactionDataSchema,
  ErrorSchema,
} from "../schemas/index.js";
import { CreateTransaction } from "../usecases/CreateTransactions.js";

export const financeiroRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      operationId: "CreateTransaction",
      tags: ["Financeiro"],
      summary: "Create Transaction",
      body: CreateTransactionBodySchema,
      response: {
        201: CreateTransactionDataSchema,
        401: ErrorSchema,
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
        const createTransaction = new CreateTransaction();
        const result = await createTransaction.execute({
          academiaId: session.user.academiaId,
          userId: session.user.id,
          type: request.body.type,
          categoria: request.body.categoria,
          status: request.body.status,
          descricao: request.body.descricao,
          valor: request.body.valor,
          data_pagamento: request.body.data_pagamento,
          data_vencimento: request.body.data_vencimento,
          createdBy: session.user.id,
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
          return reply.status(409).send({
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
