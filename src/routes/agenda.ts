import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import {
  DataReservada,
  ForbiddenError,
  NotFoundError,
} from "../errors/index.js";
import { auth } from "../lib/auth.js";
import {
  CreateAgendamentoBodySchema,
  CreateAgendamentoDataSchema,
  deleteAgendamentoDataSchema,
  ErrorSchema,
  GetAgendamentosDiaDataSchema,
  UpdateAgendamentoBodySchema,
  UpdateAgendamentoDataSchema,
} from "../schemas/index.js";
import { CreateAgendamento } from "../usecases/CreateAgendamento.js";
import { DeleteAgendamento } from "../usecases/DeleteAgendamentos.js";
import { GetAgendamentos } from "../usecases/GetAgendamentos.js";
import { UpdateAgendamentos } from "../usecases/UpdateAgendamentos.js";

export const agendaRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      operationId: "createAgendamento",
      tags: ["Agenda"],
      summary: "Create Agendamento",
      body: CreateAgendamentoBodySchema,
      response: {
        201: CreateAgendamentoDataSchema,
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

        const createAgendamento = new CreateAgendamento();
        const result = await createAgendamento.execute({
          donoId: session.user.id,
          academiaId: session.user.academiaId,
          userId: request.body.userId,
          titulo: request.body.titulo,
          data: request.body.data,
          duracao: request.body.duracao,
          observacao: request.body.observacao,
          categoria: request.body.categoria,
        });

        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);

        if (error instanceof DataReservada) {
          return reply
            .status(404)
            .send({ error: error.message, code: "DataReservada" });
        }

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

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/dia",
    schema: {
      operationId: "GetAgendamentosDia",
      tags: ["Agenda"],
      summary: "Get agendamentos por dia",
      querystring: z.object({
        data: z.string(),
      }),
      response: {
        201: GetAgendamentosDiaDataSchema,
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

        const data = new Date(request.query.data);
        if (isNaN(data.getTime())) {
          return reply
            .status(400)
            .send({ error: "Data inválida.", code: "INVALID_DATE" });
        }

        const getAgendamentos = new GetAgendamentos();
        const result = await getAgendamentos.execute({
          academiaId: session.user.academiaId,
          data,
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

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/:agendamentoId",
    schema: {
      operationId: "deleteAgendamento",
      tags: ["Agenda"],
      summary: "Delete Agendamento",
      params: z.object({
        agendamentoId: z.string(),
      }),
      response: {
        200: deleteAgendamentoDataSchema,
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

        const deleteAgendamento = new DeleteAgendamento();
        const result = await deleteAgendamento.execute({
          academiaId: session.user.academiaId,
          agendamentoId: request.params.agendamentoId,
        });

        return reply.status(200).send(result);
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

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/:agendamentoId",
    schema: {
      operationId: "updateAgendamentos",
      tags: ["Agenda"],
      summary: "Update Agendamento",
      body: UpdateAgendamentoBodySchema,
      params: z.object({
        agendamentoId: z.string(),
      }),
      response: {
        201: UpdateAgendamentoDataSchema,
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

        const updateAgendamentos = new UpdateAgendamentos();
        const result = await updateAgendamentos.execute({
          academiaId: session.user.academiaId,
          agendamentoId: request.params.agendamentoId,
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
