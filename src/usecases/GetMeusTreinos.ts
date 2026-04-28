import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  academiaId: string;
}

interface OutputDto {
  treinos: {
    id: string;
    nome: string;
    descricao: string | null;
    exercicios: {
      id: string;
      series: number;
      repeticoes: string;
      carga: string | null;
      nome: string;
      grupoMuscular: string | null;
    }[];
  }[];
}

export class GetMeusTreinos {
  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user || user.academiaId !== dto.academiaId)
      throw new NotFoundError("Usuário não encontrado.");

    const alunoTreinos = await prisma.alunoTreino.findMany({
      where: { userId: dto.userId },
      include: {
        treino: {
          include: {
            exercicios: {
              orderBy: { ordem: "asc" },
              include: {
                exercicio: {
                  select: {
                    nome: true,
                    grupoMuscular: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (alunoTreinos.length === 0) return { treinos: [] };

    return {
      treinos: alunoTreinos.map((at) => ({
        id: at.treino.id,
        nome: at.treino.nome,
        descricao: at.treino.descricao ?? null,
        exercicios: at.treino.exercicios.map((ex) => ({
          id: ex.id,
          series: ex.series,
          repeticoes: ex.repeticoes,
          carga: ex.carga ?? null,
          nome: ex.exercicio.nome,
          grupoMuscular: ex.exercicio.grupoMuscular ?? null,
        })),
      })),
    };
  }
}
