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
  //academiaId: z.string(),
  plano: z.enum(Plano),
  role: z.enum(Role),
  Status: z.enum(Status),
});

export const CreateUserDataSchema = z.object({
  id: z.string(),
  email: z.string(),
});

export const UpdateUserBodySchema = z.object({
  name: z.string().optional(),
  plano: z.enum(Plano).optional(),
  role: z.enum(Role).optional(),
  Status: z.enum(Status).optional(),
});

export const UpdateUserDataSchema = z.object({
  name: z.string(),
  plano: z.enum(Plano),
  role: z.enum(Role),
  Status: z.enum(Status),
});

export const GetUsersDataSchema = z.array(
  z.object({
    name: z.string(),
    Status: z.enum(Status),
    plano: z.enum(Plano),
    updatedAt: z.date(),
  }),
);

export const CreateMedidasBodySchema = z.object({
  idade: z.number(),
  peso: z.number(),
  alturaCentimetros: z.number(),
  ombro: z.number().optional(),
  torax: z.number().optional(),
  cintura: z.number().optional(),
  abdomen: z.number().optional(),
  quadril: z.number().optional(),
  braco_relax_direi: z.number().optional(),
  braco_contrai_direi: z.number().optional(),
  braco_relax_esq: z.number().optional(),
  braco_contrai_esq: z.number().optional(),
  antebraco_dir: z.number().optional(),
  antebraco_esq: z.number().optional(),
  coxa_dir: z.number().optional(),
  coxa_esq: z.number().optional(),
  dobra_triceps: z.number().optional(),
  dobra_supraescapular: z.number().optional(),
  dobra_suprailica: z.number().optional(),
  dobra_adbdominal: z.number().optional(),
  dobra_coxa: z.number().optional(),
  dobra_peitoral: z.number().optional(),
  //imc: z.number().optional(),
  percentual_gordura: z.number().optional(),
  //massa_magra: z.number().optional()
  //massa_gorda: z.number().optional()
});

export const CreateMedidasDataSchema = z.object({
  userId: z.string(),
  idade: z.number(),
  peso: z.number(),
  alturaCentimetros: z.number(),
});
