import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { auth } from "../lib/auth.js";
import { ErrorSchema, GetDashboardDataSchema } from "../schemas/index.js";
import { GetDashboard } from "../usecases/GetDashboard.js";

export const dashboardRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/dashboard",
    schema: {
      operationId: "getDashboard",
      tags: ["Dashboard"],
      summary: "Get Dashboard data",
      querystring: z.object({
        data: z.string(),
      }),
      response: {
        201: GetDashboardDataSchema,
        400: ErrorSchema,
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

        const dataStr = request.query.data;

        if (!dataStr || !/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
          return reply
            .status(400)
            .send({ error: "Data inválida.", code: "INVALID_DATE" });
        }

        const getDashboard = new GetDashboard();
        const result = await getDashboard.execute({
          academiaId: session.user.academiaId,
          donoId: session.user.id,
          fechado: false,
          data: dataStr,
        });

        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply
            .status(404)
            .send({ error: error.message, code: "NOT_FOUND" });
        }
        if (error instanceof ForbiddenError) {
          return reply
            .status(403)
            .send({ error: error.message, code: "FORBIDDEN" });
        }

        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
