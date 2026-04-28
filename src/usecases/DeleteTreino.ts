import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  donoId: string;
  treinoId: string;
  academiaId: string;
}

interface OutputDto {
  message: string;
}

export class DeleteTreino {
  async execute(dto: InputDto): Promise<OutputDto> {
    const dono = await prisma.user.findUnique({
      where: { id: dto.donoId },
    });
    if (!dono || dono.academiaId !== dto.academiaId)
      throw new NotFoundError("Não foi possível encontrar o usuário.");
    if (dono.role !== "Dono")
      throw new ForbiddenError("Acesso negado: permissões insuficientes.");

    const treino = await prisma.treino.findUnique({
      where: { id: dto.treinoId },
    });
    if (!treino || treino.academiaId !== dto.academiaId)
      throw new NotFoundError("Não foi possível encontrar o treino.");

    await prisma.treino.delete({
      where: { id: dto.treinoId },
    });

    return {
      message: "Treino Excluído com sucesso.",
    };
  }
}
