import { NotFoundError } from "../errors/index.js";
import { Categoria, Type } from "../generated/prisma/client.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  // userId: string
  academiaId: string;
  fechado: boolean;
}

interface OutputDto {
  receitaTotal: number;
  despesaTotal: number;
  lucroLiquido: number;
  graficoDespesas: {
    categoria: string;
    valor: number;
  }[];
  transactions: {
    type: Type;
    categoria: Categoria;
    descricao: string;
    valor: number;
    data_pagamento: Date;
  }[];
}

export class GetTransactions {
  async execute(dto: InputDto): Promise<OutputDto> {
    const transactions = await prisma.financeiro.findMany({
      where: { academiaId: dto.academiaId, fechado: dto.fechado },
    });

    if (!transactions)
      throw new NotFoundError(
        "Não foi possível buscar as transações da Academia.",
      );

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

    const despesaPorCategoria = await prisma.financeiro.groupBy({
      by: ["categoria"],
      _sum: { valor: true },
      where: {
        academiaId: dto.academiaId,
        fechado: dto.fechado,
        status: "Pago",
        type: "Despesa",
      },
    });

    const graficoDespesas = despesaPorCategoria.map((item) => ({
      categoria: item.categoria,
      valor: Number(item._sum.valor) || 0,
    }));

    const receitaTotal = Number(receitaAgregada._sum.valor) || 0;
    const despesaTotal = Number(despesaAgregada._sum.valor) || 0;

    const lucroLiquido = receitaTotal - despesaTotal;

    const formattedTransactions = transactions.map((tx) => ({
      type: tx.type,
      categoria: tx.categoria,
      descricao: tx.descricao,
      valor: Number(tx.valor),
      data_pagamento: tx.data_pagamento,
    }));

    return {
      receitaTotal: Number(receitaTotal),
      despesaTotal: Number(despesaTotal),
      lucroLiquido: lucroLiquido,
      graficoDespesas: graficoDespesas,
      transactions: formattedTransactions,
    };
  }
}
