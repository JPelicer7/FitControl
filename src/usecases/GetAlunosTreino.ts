import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { Status } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  treinoId: string;
  academiaId: string;
  donoId: string;
}

interface OutputDto {
  alunos: {
    id: string;
    nome: string;
    Status: Status;
  }[];
}

export class GetAlunosTreino {
  async execute(dto: InputDto): Promise<OutputDto> {
    const dono = await prisma.user.findUnique({
      where: { id: dto.donoId, academiaId: dto.academiaId },
    });

    if (!dono) throw new NotFoundError("Usuário não encontrado.");

    if (dono.role !== "Dono")
      throw new ForbiddenError("Acesso negado: permissões insuficientes.");

    const alunosVinculados = await prisma.alunoTreino.findMany({
      where: { treinoId: dto.treinoId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            Status: true,
          },
        },
      },
    });

    if (!alunosVinculados)
      throw new NotFoundError("Não foi possível encontrar os alunos.");

    const formattedAlunos = alunosVinculados.map((al) => ({
      id: al.user.id,
      nome: al.user.name,
      Status: al.user.Status,
    }));

    return { alunos: formattedAlunos };
  }
}
