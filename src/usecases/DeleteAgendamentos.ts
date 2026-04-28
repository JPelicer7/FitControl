import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  donoId: string;
  agendamentoId: string;
  academiaId: string;
}

interface OutputDto {
  message: string;
}

export class DeleteAgendamento {
  async execute(dto: InputDto): Promise<OutputDto> {
    const dono = await prisma.user.findUnique({
      where: { id: dto.donoId },
    });

    if (!dono || dono.academiaId !== dto.academiaId)
      throw new NotFoundError("Usuário não encontrado.");

    if (dono.role !== "Dono")
      throw new ForbiddenError("Acesso negado: Permissões insuficientes.");

    const agendamento = await prisma.agenda.findUnique({
      where: { id: dto.agendamentoId },
    });

    if (!agendamento || agendamento.academiaId !== dto.academiaId) {
      throw new NotFoundError("Compromisso não encontrado.");
    }

    await prisma.agenda.delete({
      where: { id: dto.agendamentoId },
    });

    return { message: "Compromisso deletado com sucesso." };
  }
}
