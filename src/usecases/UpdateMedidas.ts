import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  academiaId: string;
  userId: string;
  donoId: string;
  medidaId: string;
  idade?: number;
  peso?: number;
  alturaCentimetros?: number;
  ombro?: number;
  torax?: number;
  cintura?: number;
  abdomen?: number;
  quadril?: number;
  braco_relax_direi?: number;
  braco_contrai_direi?: number;
  braco_relax_esq?: number;
  braco_contrai_esq?: number;
  antebraco_dir?: number;
  antebraco_esq?: number;
  coxa_dir?: number;
  coxa_esq?: number;
  dobra_triceps?: number;
  dobra_supraescapular?: number;
  dobra_suprailica?: number;
  dobra_adbdominal?: number;
  dobra_coxa?: number;
  dobra_peitoral?: number;
  //imc: number;
  percentual_gordura?: number;
  massa_magra?: number;
  massa_gorda?: number;
}

interface OutputDto {
  userId: string;
  medidaId: string;
  academiaId: string;
}

export class UpdateMedidas {
  async execute(dto: InputDto): Promise<OutputDto> {
    const dono = await prisma.user.findUnique({
      where: { id: dto.donoId },
    });

    if (!dono || dono.academiaId !== dto.academiaId)
      throw new NotFoundError("Usuário não encontrado.");

    if (dono.role !== "Dono")
      throw new ForbiddenError("Acesso negado: Permissões Insuficientes.");

    const user = await prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user || user.academiaId !== dto.academiaId)
      throw new NotFoundError("Não foi possível encontrar o usuário!");

    //const { ...dataToUpdate } = dto;
    const { academiaId, userId, medidaId, donoId, ...dataToUpdate } = dto;

    await prisma.medidas.update({
      where: {
        id: medidaId,
        userId: userId,
      },
      data: dataToUpdate,
    });

    return {
      userId: userId,
      medidaId: medidaId,
      academiaId: academiaId,
    };
  }
}
