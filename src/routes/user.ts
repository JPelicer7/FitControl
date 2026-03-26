import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { NotFoundError } from "../errors/index.js";
//import { NotFoundError } from "../erros/index.js";
import { auth } from "../lib/auth.js";
import {
  CreateUserBodySchema,
  CreateUserDataSchema,
  ErrorSchema,
  GetUserDataSchema,
  GetUserParamsSchema,
  GetUsersDataSchema,
  UpdateUserBodySchema,
  UpdateUserDataSchema,
} from "../schemas/index.js";
import { CreateUser } from "../usecases/CreateUser.js";
import { GetUser } from "../usecases/GetUser.js";
import { GetUsers } from "../usecases/GetUsers.js";
import { UpdateUser } from "../usecases/UpdateUser.js";

export const userRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      operationId: "createUser",
      tags: ["User"],
      summary: "Create User",
      body: CreateUserBodySchema,
      response: {
        201: CreateUserDataSchema,
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
        //INSTANCIA
        const createUser = new CreateUser();
        const result = await createUser.execute({
          name: request.body.name,
          email: request.body.email,
          password: request.body.password,
          plano: request.body.plano,
          role: request.body.role,
          Status: request.body.Status,
          telefone: request.body.telefone,
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

        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/:userId",
    schema: {
      operationId: "UpdateUser",
      tags: ["User"],
      summary: "Update User",
      params: z.object({
        userId: z.string(),
      }),
      body: UpdateUserBodySchema,
      response: {
        201: UpdateUserDataSchema,
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

        const updateUser = new UpdateUser();
        const result = await updateUser.execute({
          userId: request.params.userId,
          academiaId: session.user.academiaId,
          name: request.body.name,
          plano: request.body.plano,
          role: request.body.role,
          Status: request.body.Status,
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

        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      operationId: "GetUsers",
      tags: ["User"],
      summary: "Get Users",
      response: {
        201: GetUsersDataSchema,
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

        const getUsers = new GetUsers();
        const result = await getUsers.execute({
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

        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:userId",
    schema: {
      operationId: "GetUser",
      tags: ["User"],
      summary: "Get User by ID",
      params: GetUserParamsSchema,
      response: {
        200: GetUserDataSchema,
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

        const getUser = new GetUser();
        const result = await getUser.execute({
          userId: request.params.userId,
          academiaId: session.user.academiaId,
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

        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
