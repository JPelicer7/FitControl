import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  donoId: string;
  academiaId: string;
  treinoId: string;
  treinoExercicioId: string;
  series?: number;
  carga?: string;
  repeticoes?: string;
}

interface OutputDto {
  series: number;
  carga: string | null;
  repeticoes: string;
}

export class UpdateTreinoExercicio {
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
      throw new NotFoundError("Não foi possível encontrar o Treino!");

    const treinoExercicio = await prisma.treinoExercicio.findUnique({
      where: { id: dto.treinoExercicioId },
    });
    if (!treinoExercicio)
      throw new NotFoundError("Não foi possível encontrar o Exercício!");

    const updatedTreinoExerc = await prisma.treinoExercicio.update({
      where: { id: dto.treinoExercicioId },
      data: {
        ...(dto.series !== undefined && { series: dto.series }),
        ...(dto.carga !== undefined && { carga: dto.carga }),
        ...(dto.repeticoes !== undefined && { repeticoes: dto.repeticoes }),
      },
    });

    return updatedTreinoExerc;
  }
}
