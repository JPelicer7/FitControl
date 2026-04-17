import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  academiaId: string;
}

interface OutputDto {
  exercicios: {
    id: string;
    nome: string;
    grupoMuscular?: string;
    videoUrl?: string;
  }[];
}

export class GetExercicios {
  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) throw new NotFoundError("Usuário não encontrado.");

    if (user.role !== "Dono") {
      throw new ForbiddenError("Acesso negado: permissões insuficientes.");
    }

    const exercicios = await prisma.exercicio.findMany({
      where: {
        OR: [{ academiaId: null }, { academiaId: dto.academiaId }],
      },
    });

    if (!exercicios)
      throw new NotFoundError("Não foi possível carregar os exercícios.");
    if (exercicios.length === 0)
      throw new NotFoundError("Não há exercícios cadastrados.");

    const formattedExercicios = exercicios.map((ex) => ({
      id: ex.id,
      nome: ex.nome,
      grupoMuscular: ex.grupoMuscular ?? undefined,
      videoUrl: ex.videoUrl ?? undefined,
    }));

    return { exercicios: formattedExercicios };
  }
}
