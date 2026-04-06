import {
  FechamentoAlreadyExists,
  NotExistTransactions,
  NotFoundError,
} from "../errors/index.js";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  academiaId: string;
  userId: string;
  fechado: boolean;
}

interface OutputDto {
  message: string;
}

export class FechaMes {
  async execute(dto: InputDto): Promise<OutputDto> {
    const agora = new Date();
    const mesAtual = agora.getMonth() + 1;
    const anoAtual = agora.getFullYear();

    const fechamentoExistente = await prisma.fechamentoMensal.findUnique({
      where: {
        mes_ano_academiaId: {
          academiaId: dto.academiaId,
          mes: mesAtual,
          ano: anoAtual,
        },
      },
    });

    if (fechamentoExistente)
      throw new FechamentoAlreadyExists(
        "O fechamento deste mês já foi realizado.",
      );

    const transactions = await prisma.financeiro.findMany({
      where: {
        academiaId: dto.academiaId,
        fechado: dto.fechado,
        status: "Pago",
      },
      select: { id: true },
    });

    if (!transactions)
      throw new NotFoundError(
        "Não foi possível buscar as transações da Academia.",
      );

    if (transactions.length === 0) {
      throw new NotExistTransactions(
        "Não há transações pagas para fechar nesse período.",
      );
    }

    const receitaAgregada = await prisma.financeiro.aggregate({
      _sum: { valor: true },
      where: {
        academiaId: dto.academiaId,
        type: "Receita",
        status: "Pago",
        fechado: dto.fechado,
      },
    });

    if (!receitaAgregada)
      throw new NotFoundError(
        "Não foi possível calcular a receita da Academia.",
      );

    const despesaAgregada = await prisma.financeiro.aggregate({
      _sum: { valor: true },
      where: {
        academiaId: dto.academiaId,
        type: "Despesa",
        status: "Pago",
        fechado: dto.fechado,
      },
    });

    if (!despesaAgregada)
      throw new NotFoundError(
        "Não foi possível calcular a receita da Academia.",
      );

    const receitaTotal = Number(receitaAgregada._sum.valor) || 0;
    const despesaTotal = Number(despesaAgregada._sum.valor) || 0;

    const lucroLiquido = receitaTotal - despesaTotal;

    const resultado = await prisma.$transaction(async (tx) => {
      const fechamento = await tx.fechamentoMensal.create({
        data: {
          academiaId: dto.academiaId,
          mes: mesAtual,
          ano: anoAtual,
          receitaTotal: new Prisma.Decimal(receitaTotal),
          despesaTotal: new Prisma.Decimal(despesaTotal),
          lucroLiquido: new Prisma.Decimal(lucroLiquido),
          fechadoPor: dto.userId,
        },
      });

      //transações false = true
      await tx.financeiro.updateMany({
        where: {
          id: { in: transactions.map((t) => t.id) },
        },
        data: {
          fechado: true,
        },
      });
      return fechamento;
    });

    return {
      message: "Mês Encerrado com sucesso",
    };
  }
}
