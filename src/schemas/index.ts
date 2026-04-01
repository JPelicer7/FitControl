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
  telefone: z.string().optional(),
});

export const CreateUserDataSchema = z.object({
  id: z.string(),
  email: z.string(),
});

export const UpdateUserBodySchema = z.object({
  name: z.string().optional(),
  plano: z.enum(Plano).optional(),
  Status: z.enum(Status).optional(),
  telefone: z.string().optional(),
});

export const UpdateUserDataSchema = z.object({
  name: z.string(),
  plano: z.enum(Plano),
  Status: z.enum(Status),
  telefone: z.string().nullable().optional(),
});

const UserSchema = z.object({
  name: z.string(),
  id: z.string(),
  Status: z.enum(Status),
  plano: z.enum(Plano),
  telefone: z.string().nullable().optional(),
  ultimaAvaliacao: z.coerce.date().nullable().optional(),
});

export const GetUsersDataSchema = z.object({
  totalUsers: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  users: z.array(UserSchema),
});

export const GetUserParamsSchema = z.object({
  userId: z.string(),
});

const medidaOptionalNumber = () => z.number().nullable();

export const MedidaSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  idade: z.number(),
  peso: z.number(),
  alturaCentimetros: z.number(),
  ombro: medidaOptionalNumber(),
  torax: medidaOptionalNumber(),
  cintura: medidaOptionalNumber(),
  abdomen: medidaOptionalNumber(),
  quadril: medidaOptionalNumber(),
  braco_relax_direi: medidaOptionalNumber(),
  braco_contrai_direi: medidaOptionalNumber(),
  braco_relax_esq: medidaOptionalNumber(),
  braco_contrai_esq: medidaOptionalNumber(),
  antebraco_dir: medidaOptionalNumber(),
  antebraco_esq: medidaOptionalNumber(),
  coxa_dir: medidaOptionalNumber(),
  coxa_esq: medidaOptionalNumber(),
  panturrilha_dir: medidaOptionalNumber(),
  panturrilha_esq: medidaOptionalNumber(),
  dobra_triceps: medidaOptionalNumber(),
  dobra_supraescapular: medidaOptionalNumber(),
  dobra_suprailica: medidaOptionalNumber(),
  dobra_adbdominal: medidaOptionalNumber(),
  dobra_coxa: medidaOptionalNumber(),
  dobra_peitoral: medidaOptionalNumber(),
  imc: medidaOptionalNumber(),
  percentual_gordura: medidaOptionalNumber(),
  massa_magra: medidaOptionalNumber(),
  massa_gorda: medidaOptionalNumber(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const ComparacaoCampoSchema = z.object({
  atual: z.number(),
  anterior: z.number(),
  diferenca: z.number(),
});

export const GetUserDataSchema = z.object({
  user: z.object({
    name: z.string(),
    plano: z.enum(Plano),
    status: z.enum(Status),
  }),
  medidas: z.object({
    todas: z.array(MedidaSchema),
    comparacao: z.record(z.string(), ComparacaoCampoSchema).nullable(),
  }),
});

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
  panturrilha_dir: z.number().optional(),
  panturrilha_esq: z.number().optional(),
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

export const updateMedidasBodySchema = z.object({
  idade: z.number().optional(),
  peso: z.number().optional(),
  alturaCentimetros: z.number().optional(),
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
  imc: z.number().optional(),
  percentual_gordura: z.number().optional(),
  massa_magra: z.number().optional(),
  massa_gorda: z.number().optional(),
});

export const updateMedidasDataSchema = z.object({
  userId: z.string(),
  medidaId: z.string(),
});
