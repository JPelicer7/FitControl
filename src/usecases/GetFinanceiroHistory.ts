import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  academiaId: string;
}

interface OutputDto {
  historico: {
    receitaTotal: number;
    despesaTotal: number;
    lucroLiquido: number;
    mes: number;
    ano: number;
    fechadoEm: Date;
  }[];
}

export class GetFinanceiroHistory {
  async execute(dto: InputDto): Promise<OutputDto> {
    const historico = await prisma.fechamentoMensal.findMany({
      where: {
        academiaId: dto.academiaId,
      },
      orderBy: [{ mes: "desc" }, { ano: "desc" }],
      take: 12,
    });

    if (!historico)
      throw new NotFoundError("Não foi possível encontrar o histórico.");
    //lançar erro de historico.lenght === 0

    const formattedHistorico = historico.map((h) => ({
      receitaTotal: Number(h.receitaTotal),
      despesaTotal: Number(h.despesaTotal),
      lucroLiquido: Number(h.lucroLiquido),
      mes: Number(h.mes),
      ano: Number(h.ano),
      fechadoEm: h.fechadoEm,
    }));
    return {
      historico: formattedHistorico,
    };
  }
}
