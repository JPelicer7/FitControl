import {
  DataReservada,
  ForbiddenError,
  NotFoundError,
} from "../errors/index.js";
import { AgendaCategoria } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  donoId: string;
  academiaId: string;
  userId?: string;
  titulo: string;
  data: Date;
  duracao?: number;
  observacao?: string;
  categoria: AgendaCategoria;
}

interface OutputDto {
  id: string;
  titulo: string;
}

export class CreateAgendamento {
  async execute(dto: InputDto): Promise<OutputDto> {
    const dono = await prisma.user.findFirst({
      where: { id: dto.donoId, academiaId: dto.academiaId },
    });

    if (!dono) throw new NotFoundError("Usuário não encontrado.");
    if (dono.role !== "Dono")
      throw new ForbiddenError("Acesso negado: permissões insuficientes.");

    if (dto.userId) {
      const aluno = await prisma.user.findUnique({
        where: { id: dto.userId, academiaId: dto.academiaId },
      });
      if (!aluno) throw new NotFoundError("Aluno não encontrado.");
    }

    const agendamentoExists = await prisma.agenda.findFirst({
      where: { data: dto.data, academiaId: dto.academiaId },
    });
    if (agendamentoExists)
      throw new DataReservada(
        "Você já tem um compromisso marcado nesse mesmo dia e horário.",
      );

    const agendamento = await prisma.agenda.create({
      data: {
        academiaId: dto.academiaId,
        userId: dto.userId ?? undefined,
        titulo: dto.titulo,
        data: dto.data,
        duracao: dto.duracao ?? undefined,
        observacao: dto.observacao ?? undefined,
        categoria: dto.categoria,
      },
    });

    return {
      id: agendamento.id,
      titulo: agendamento.titulo,
    };
  }
}
