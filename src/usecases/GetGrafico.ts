import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { Role } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  academiaId: string;
  userId: string;
  role: Role;
  requestId: string;
}

interface OutputDto {
  historico: {
    createdAt: Date;
    peso: number;
    percentual_gordura: number;
  }[];
}

export class GetGrafico {
  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await prisma.user.findFirst({
      where: { id: dto.userId, academiaId: dto.academiaId },
    });

    if (!user) throw new NotFoundError("Usuário não encontrado.");

    if (dto.role === "Aluno" && dto.userId !== dto.requestId) {
      throw new ForbiddenError(
        "Você não tem permissão para ver dados de outro aluno.",
      );
    }

    const historico = await prisma.medidas.findMany({
      where: {
        userId: dto.userId,
        user: { academiaId: user.academiaId },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        peso: true,
        percentual_gordura: true,
        createdAt: true,
      },
    });

    if (!historico)
      throw new NotFoundError(
        "Não foi possível retornar o histórico das seguintes medidas: Peso e Percentual de Gordura.",
      );

    if (historico.length === 0) return { historico: [] };

    const formattedHistorico = historico
      .map((h) => ({
        peso: Number(h.peso),
        percentual_gordura: Number(h.percentual_gordura),
        createdAt: h.createdAt,
      }))
      .reverse();

    return { historico: formattedHistorico };
  }
}
