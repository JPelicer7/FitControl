import { NotFoundError } from "../errors/index.js";
import { AgendaCategoria } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  academiaId: string;
  agendamentoId: string;
  titulo?: string;
  observacao?: string;
  duracao?: number;
  data?: string;
  categoria?: AgendaCategoria;
  userId?: string;
}

interface OutputDto {
  message: string;
}

export class UpdateAgendamentos {
  async execute(dto: InputDto): Promise<OutputDto> {
    const agendamento = await prisma.agenda.findFirst({
      where: { id: dto.agendamentoId, academiaId: dto.academiaId },
    });
    if (!agendamento) throw new NotFoundError("Compromisso não encontrado.");

    const updateAgendamento = await prisma.agenda.update({
      where: { id: dto.agendamentoId },
      data: {
        ...(dto.titulo !== undefined && { titulo: dto.titulo }),
        ...(dto.observacao !== undefined && { observacao: dto.observacao }),
        ...(dto.duracao !== undefined && { duracao: dto.duracao }),
        ...(dto.categoria !== undefined && { categoria: dto.categoria }),
        ...(dto.data !== undefined && { data: dto.data }),
        ...(dto.userId !== undefined && { userId: dto.userId }),
      },
    });
    if (!updateAgendamento)
      throw new NotFoundError("Não foi possível atualizar esse compromisso.");

    return { message: "Compromisso atualizado com sucesso." };
  }
}
