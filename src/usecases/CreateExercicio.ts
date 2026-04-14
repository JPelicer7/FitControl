import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  //academiaId: string;
  userId: string;
  nome: string;
  grupoMuscular?: string;
  videoUrl?: string;
}

interface OutputDto {
  id: string;
}

export class CreateExercicio {
  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) throw new NotFoundError("Usuário não encontrado.");

    if (user.role !== "Dono") {
      throw new ForbiddenError("Acesso negado: permissões insuficientes.");
    }

    const newExercicio = await prisma.exercicio.create({
      data: {
        nome: dto.nome,
        grupoMuscular: dto.grupoMuscular,
        videoUrl: dto.videoUrl,
      },
    });

    return { id: newExercicio.id };
  }
}
