import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  academiaId: string;
  userId: string;
  requestId: string;
}

interface MedidaHistorico {
  id: string;
  createdAt: string;
  peso: number;
  torax: number | null;
  cintura: number | null;
  quadril: number | null;
  braco_contrai_direi: number | null;
  braco_contrai_esq: number | null;
  coxa_dir: number | null;
  coxa_esq: number | null;
  panturrilha_dir: number | null;
  panturrilha_esq: number | null;
  percentual_gordura: number | null;
  massaGorda: number | null;
  massaMagra: number | null;
}

interface OutputDto {
  historico: MedidaHistorico[];
}

export class GetHistoricoMedidas {
  async execute(dto: InputDto): Promise<OutputDto> {
    const solicitante = await prisma.user.findUnique({
      where: { id: dto.requestId },
    });

    if (!solicitante || solicitante.academiaId !== dto.academiaId)
      throw new NotFoundError("Solicitante não encontrado.");

    // Aluno só pode ver os próprios dados
    if (solicitante.role === "Aluno" && dto.requestId !== dto.userId)
      throw new ForbiddenError(
        "Você não tem permissão para ver dados de outro aluno.",
      );

    //
    const aluno = await prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!aluno || aluno.academiaId !== dto.academiaId)
      throw new NotFoundError("Aluno não encontrado.");

    const medidas = await prisma.medidas.findMany({
      where: { userId: dto.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        peso: true,
        torax: true,
        cintura: true,
        quadril: true,
        braco_contrai_direi: true,
        braco_contrai_esq: true,
        coxa_dir: true,
        coxa_esq: true,
        panturrilha_dir: true,
        panturrilha_esq: true,
        percentual_gordura: true,
      },
    });

    if (medidas.length === 0) return { historico: [] };

    const historico = medidas.map((m) => {
      const peso = Number(m.peso);
      const percentual = m.percentual_gordura
        ? Number(m.percentual_gordura)
        : null;

      let massaGorda: number | null = null;
      let massaMagra: number | null = null;

      if (percentual !== null) {
        const calculoGorda = peso * (percentual / 100);
        const calculoMagra = peso - calculoGorda;
        massaGorda = parseFloat(calculoGorda.toFixed(2));
        massaMagra = parseFloat(calculoMagra.toFixed(2));
      }

      return {
        id: m.id,
        createdAt: m.createdAt.toISOString(),
        peso,
        torax: m.torax ? Number(m.torax) : null,
        cintura: m.cintura ? Number(m.cintura) : null,
        quadril: m.quadril ? Number(m.quadril) : null,
        braco_contrai_direi: m.braco_contrai_direi
          ? Number(m.braco_contrai_direi)
          : null,
        braco_contrai_esq: m.braco_contrai_esq
          ? Number(m.braco_contrai_esq)
          : null,
        coxa_dir: m.coxa_dir ? Number(m.coxa_dir) : null,
        coxa_esq: m.coxa_esq ? Number(m.coxa_esq) : null,
        panturrilha_dir: m.panturrilha_dir ? Number(m.panturrilha_dir) : null,
        panturrilha_esq: m.panturrilha_esq ? Number(m.panturrilha_esq) : null,
        percentual_gordura: percentual,
        massaGorda,
        massaMagra,
      };
    });

    return { historico };
  }
}
