import {
  ForbiddenError,
  NotFoundError,
  VinculoExists,
} from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  donoId: string;
  userId: string;
  treinoId: string;
  academiaId: string;
}

interface OutputDto {
  id: string;
}

export class CreateAlunoTreino {
  async execute(dto: InputDto): Promise<OutputDto> {
    const dono = await prisma.user.findFirst({
      where: { id: dto.donoId, academiaId: dto.academiaId },
    });

    if (!dono)
      throw new ForbiddenError("Acesso negado: permissões insuficientes.");

    const aluno = await prisma.user.findFirst({
      where: { id: dto.userId, academiaId: dto.academiaId },
    });

    if (!aluno) throw new NotFoundError("Aluno não encontrado.");

    const treinoExists = await prisma.treino.findFirst({
      where: { id: dto.treinoId, academiaId: dto.academiaId },
    });

    if (!treinoExists) throw new NotFoundError("Treino Inexistente.");

    const vinculoExists = await prisma.alunoTreino.findUnique({
      where: {
        userId_treinoId: {
          userId: dto.userId,
          treinoId: dto.treinoId,
        },
      },
    });
    if (vinculoExists)
      throw new VinculoExists("Aluno já vinculado nesse Treino.");

    const novoVinculo = await prisma.alunoTreino.create({
      data: {
        userId: dto.userId,
        treinoId: dto.treinoId,
      },
    });

    return { id: novoVinculo.id };
  }
}
