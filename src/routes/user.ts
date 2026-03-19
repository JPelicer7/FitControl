import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

//import { NotFoundError } from "../erros/index.js";
import { auth } from "../lib/auth.js";
import {
  CreateUserBodySchema,
  CreateUserDataSchema,
  ErrorSchema,
} from "../schemas/index.js";
import { CreateUser } from "../usecases/CreateUser.js";

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

        //INSTANCIA
        const createUser = new CreateUser();
        const result = await createUser.execute({
          name: request.body.name,
          email: request.body.email,
          password: request.body.password,
          plano: request.body.plano,
          role: request.body.role,
          Status: request.body.Status,
          academiaId: session.user.academiaId,
        });
        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
