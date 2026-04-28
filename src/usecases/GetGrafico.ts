import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  academiaId: string;
  userId: string;
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
    const solicitante = await prisma.user.findUnique({
      where: { id: dto.requestId },
    });

    if (!solicitante || solicitante.academiaId !== dto.academiaId)
      throw new NotFoundError("Solicitante não encontrado.");

    // Aluno só pode ver os próprios dados
    if (solicitante.role === "Aluno" && dto.requestId !== dto.userId)
      throw new ForbiddenError(
        "Você não tem permissão para ver dados de outro aluno.",
      );

    const aluno = await prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!aluno || aluno.academiaId !== dto.academiaId)
      throw new NotFoundError("Aluno não encontrado.");

    const historico = await prisma.medidas.findMany({
      where: { userId: dto.userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        peso: true,
        percentual_gordura: true,
        createdAt: true,
      },
    });

    if (historico.length === 0) return { historico: [] };

    return {
      historico: historico
        .map((h) => ({
          peso: Number(h.peso),
          percentual_gordura: Number(h.percentual_gordura),
          createdAt: h.createdAt,
        }))
        .reverse(),
    };
  }
}
