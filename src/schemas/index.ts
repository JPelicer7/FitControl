import z from "zod";

import { Plano, Role, Status } from "../generated/prisma/enums.js";

export const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export const CreateUserBodySchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  academiaId: z.string(),
  plano: z.enum(Plano),
  role: z.enum(Role),
  Status: z.enum(Status),
});

export const CreateUserDataSchema = z.object({
  id: z.string(),
  email: z.string(),
});
