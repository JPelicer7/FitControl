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
      where: { id: dto.donoId, academiaId: dto.academiaId },
    });
    if (!dono) throw new NotFoundError("Não foi possível encontrar o usuário!");
    if (dono.role !== "Dono")
      throw new ForbiddenError("Acesso negado: permissões insuficientes.");

    const treino = await prisma.treino.findUnique({
      where: { id: dto.treinoId, academiaId: dto.academiaId },
    });
    if (!treino)
      throw new NotFoundError("Não foi possível encontrar o treino.");

    await prisma.treino.delete({
      where: { id: dto.treinoId, academiaId: dto.academiaId },
    });

    return {
      message: "Treino Excluído com sucesso.",
    };
  }
}
