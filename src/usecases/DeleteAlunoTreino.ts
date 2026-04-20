import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  donoId: string;
  treinoId: string;
  academiaId: string;
  userId: string;
}

interface OutputDto {
  message: string;
}

export class DeleteAlunoTreino {
  async execute(dto: InputDto): Promise<OutputDto> {
    const dono = await prisma.user.findUnique({
      where: { id: dto.donoId, academiaId: dto.academiaId },
    });
    if (!dono) throw new NotFoundError("Usuário não encontrado.");
    if (dono.role !== "Dono")
      throw new ForbiddenError("Acesso negado: permissões insuficientes.");

    const treino = await prisma.treino.findUnique({
      where: { id: dto.treinoId, academiaId: dto.academiaId },
    });
    if (!treino) throw new NotFoundError("Treino não encontrado.");

    await prisma.alunoTreino.delete({
      where: {
        userId_treinoId: {
          userId: dto.userId,
          treinoId: dto.treinoId,
        },
      },
    });

    return { message: "Aluno desvinculado com sucesso." };
  }
}
