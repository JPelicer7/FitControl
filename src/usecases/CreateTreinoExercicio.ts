import {
  ExercAlreadyAdd,
  ForbiddenError,
  NotFoundError,
} from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  academiaId: string;
  treinoId: string;
  exercicoId: string;
  series: number;
  repeticoes: string;
  carga?: string;
  ordem?: number;
}

interface OutputDto {
  id: string;
}

export class CreateTreinoExercicio {
  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await prisma.user.findUnique({
      where: { id: dto.userId, academiaId: dto.academiaId },
    });
    if (!user) throw new NotFoundError("Usuário não encontrado.");

    if (user.role !== "Dono") {
      throw new ForbiddenError("Acesso negado: permissões insuficientes.");
    }

    const treinoExists = await prisma.treino.findUnique({
      where: { id: dto.treinoId, academiaId: dto.academiaId },
    });

    if (!treinoExists) throw new NotFoundError("Treino inexistente.");

    const exercicioExists = await prisma.exercicio.findFirst({
      where: {
        id: dto.exercicoId,
        OR: [{ academiaId: null }, { academiaId: dto.academiaId }],
      },
    });

    if (!exercicioExists) throw new NotFoundError("Exercicio inexistente.");

    const exercAlreadyAdd = await prisma.treinoExercicio.findFirst({
      where: { treinoId: dto.treinoId, exercicoId: dto.exercicoId },
    });

    if (exercAlreadyAdd)
      throw new ExercAlreadyAdd("Esse exercício já foi adicionado ao Treino.");

    const newTreinoExercicio = await prisma.treinoExercicio.create({
      data: {
        treinoId: dto.treinoId,
        exercicoId: dto.exercicoId,
        series: dto.series,
        repeticoes: dto.repeticoes,
        carga: dto.carga ?? undefined,
        ordem: dto.ordem ?? undefined,
      },
    });

    return { id: newTreinoExercicio.id };
  }
}
