import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  academiaId: string;
  treinoId: string;
}

interface OutputDto {
  nome: string;
  totalSeries: number;
  exercicios: {
    id: string;
    series: number;
    repeticoes: string;
    carga?: string;
    nomeTreino: {
      nome: string;
    };
  }[];
}

export class GetTreinoDetalhado {
  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await prisma.user.findFirst({
      where: { id: dto.userId, academiaId: dto.academiaId },
    });

    if (!user) throw new NotFoundError("Usuário não encontrado.");

    const treino = await prisma.treino.findUnique({
      where: { id: dto.treinoId, academiaId: dto.academiaId },
      include: {
        exercicios: {
          orderBy: { ordem: "asc" },
          include: {
            exercicio: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
    });

    if (!treino) throw new NotFoundError("Treino inexistente.");

    const totalSeries = treino.exercicios.reduce(
      (acc, ex) => acc + ex.series,
      0,
    );

    return {
      nome: treino.nome,
      totalSeries,
      exercicios: treino.exercicios.map((ex) => ({
        id: ex.id,
        series: ex.series,
        repeticoes: ex.repeticoes,
        carga: ex.carga ?? undefined,
        nomeTreino: {
          nome: ex.exercicio.nome,
        },
      })),
    };
  }
}
