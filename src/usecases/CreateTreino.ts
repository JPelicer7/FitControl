import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  nome: string;
  descricao?: string;
  academiaId: string;
  criadoPorId: string;
}

interface OutputDto {
  id: string;
}

export class CreateTreino {
  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await prisma.user.findUnique({
      where: { id: dto.criadoPorId, academiaId: dto.academiaId },
    });
    if (!user) throw new NotFoundError("Usuário não cadastrado.");

    if (user.role !== "Dono") {
      throw new ForbiddenError("Acesso negado: permissões insuficientes.");
    }

    const newTreino = await prisma.treino.create({
      data: {
        nome: dto.nome,
        descricao: dto.descricao ?? undefined,
        academiaId: dto.academiaId,
        criadoPorId: dto.criadoPorId,
      },
    });
    return { id: newTreino.id };
  }
}
