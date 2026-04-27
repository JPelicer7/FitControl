import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { AgendaCategoria, Plano } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  donoId: string;
  academiaId: string;
  fechado: boolean;
  data: Date;
}

interface OutputDto {
  alunos: {
    ativos: number;
    total: number;
  };
  financeiro: {
    receitaTotal: number;
    despesaTotal: number;
  };
  agendamentosDia: {
    id: string;
    titulo: string;
    data: string;
    categoria: AgendaCategoria;
  }[];
  ultimosAlunos: {
    id: string;
    name: string;
    plano: Plano;
  }[];
}

export class GetDashboard {
  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await prisma.user.findFirst({
      where: { id: dto.donoId, academiaId: dto.academiaId },
    });
    if (!user) throw new NotFoundError("Usuário não encontrado.");
    if (user.role !== "Dono") {
      throw new ForbiddenError("Acesso negado: permissões insuficientes.");
    }

    const inicioDia = new Date(dto.data);
    inicioDia.setUTCHours(0, 0, 0, 0);

    const fimDia = new Date(dto.data);
    fimDia.setUTCHours(23, 59, 59, 999);

    const [
      ativos,
      total,
      receitaAgregada,
      despesaAgregada,
      agendamentos,
      ultimosAlunos,
    ] = await Promise.all([
      prisma.user.count({
        where: { academiaId: dto.academiaId, role: "Aluno", Status: "Ativo" },
      }),
      prisma.user.count({
        where: { academiaId: dto.academiaId, role: "Aluno" },
      }),
      prisma.financeiro.aggregate({
        _sum: { valor: true },
        where: {
          academiaId: dto.academiaId,
          fechado: dto.fechado,
          status: "Pago",
          type: "Receita",
        },
      }),

      prisma.financeiro.aggregate({
        _sum: { valor: true },
        where: {
          academiaId: dto.academiaId,
          fechado: dto.fechado,
          status: "Pago",
          type: "Despesa",
        },
      }),

      prisma.agenda.findMany({
        where: {
          academiaId: dto.academiaId,
          data: { gte: inicioDia, lte: fimDia },
        },
        orderBy: { data: "asc" },
      }),

      prisma.user.findMany({
        where: {
          academiaId: dto.academiaId,
          role: "Aluno",
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, plano: true },
      }),
    ]);

    return {
      alunos: {
        ativos: ativos,
        total: total,
      },
      financeiro: {
        receitaTotal: Number(receitaAgregada._sum.valor) || 0,
        despesaTotal: Number(despesaAgregada._sum.valor) || 0,
      },
      agendamentosDia: agendamentos.map((ag) => ({
        id: ag.id,
        titulo: ag.titulo,
        data: ag.data.toISOString(),
        categoria: ag.categoria,
      })),
      ultimosAlunos: ultimosAlunos.map((ul) => ({
        id: ul.id,
        name: ul.name,
        plano: ul.plano,
      })),
    };
  }
}
