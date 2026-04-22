import { NotFoundError } from "../errors/index.js";
import { AgendaCategoria } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  academiaId: string;
  data: Date;
}

interface OutputDto {
  agendamentos: {
    id: string;
    titulo: string;
    observacao: string | null;
    duracao: number | null;
    categoria: AgendaCategoria;
    data: string;
    aluno: {
      userId: string;
      nome: string;
    } | null;
  }[];
}

export class GetAgendamentos {
  async execute(dto: InputDto): Promise<OutputDto> {
    const inicioDia = new Date(dto.data);
    inicioDia.setUTCHours(0, 0, 0, 0);

    const fimDia = new Date(dto.data);
    fimDia.setUTCHours(23, 59, 59, 999);

    const agendamentos = await prisma.agenda.findMany({
      where: {
        academiaId: dto.academiaId,
        data: {
          gte: inicioDia,
          lte: fimDia,
        },
      },
      orderBy: { data: "asc" },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    if (agendamentos.length === 0)
      throw new NotFoundError("Não há agendamentos registrados.");
    if (!agendamentos)
      throw new NotFoundError("Não foi possível trazer os agendamentos.");

    const formattedAgendamentos = agendamentos.map((ag) => ({
      id: ag.id,
      titulo: ag.titulo,
      observacao: ag.observacao,
      duracao: ag.duracao,
      categoria: ag.categoria,
      data: ag.data.toISOString(),
      aluno: ag.user ? { userId: ag.user.id, nome: ag.user.name } : null,
    }));

    return { agendamentos: formattedAgendamentos };
  }
}
