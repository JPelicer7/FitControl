import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  academiaId: string;
  userId: string;
}

interface OutputDto {
  treinos: {
    id: string;
    nome: string;
    descricao?: string;
    qtdExercicios: number;
    qtdAlunos: number;
  }[];
}

export class GetTreinos {
  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await prisma.user.findUnique({
      where: { id: dto.userId, academiaId: dto.academiaId },
    });
    if (!user) throw new NotFoundError("Usuário não encontrado.");

    if (user.role !== "Dono") throw new ForbiddenError("Sem autorização.");

    const treinos = await prisma.treino.findMany({
      where: { academiaId: dto.academiaId },
      include: {
        _count: {
          select: {
            exercicios: true,
            alunos: true,
          },
        },
      },
    });
    if (!treinos)
      throw new NotFoundError("Não foi possível carregar os treinos.");
    if (treinos.length === 0)
      throw new NotFoundError("Não há treinos cadastrados.");

    const formattedTreinos = treinos.map((tr) => ({
      id: tr.id,
      nome: tr.nome,
      descricao: tr.descricao ?? undefined,
      qtdExercicios: tr._count.exercicios,
      qtdAlunos: tr._count.alunos,
    }));

    return { treinos: formattedTreinos };
  }
}
