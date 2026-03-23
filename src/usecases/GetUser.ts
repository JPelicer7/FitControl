import { NotFoundError } from "../errors/index.js";
import type { Medidas } from "../generated/prisma/client.js";
import { Plano, Status } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  academiaId: string;
}

// Campos numéricos comparáveis entre avaliações
type CampoMedida =
  | "idade"
  | "peso"
  | "alturaCentimetros"
  | "ombro"
  | "torax"
  | "cintura"
  | "abdomen"
  | "quadril"
  | "braco_relax_direi"
  | "braco_contrai_direi"
  | "braco_relax_esq"
  | "braco_contrai_esq"
  | "antebraco_dir"
  | "antebraco_esq"
  | "coxa_dir"
  | "coxa_esq"
  | "dobra_triceps"
  | "dobra_supraescapular"
  | "dobra_suprailica"
  | "dobra_adbdominal"
  | "dobra_coxa"
  | "dobra_peitoral"
  | "imc"
  | "percentual_gordura"
  | "massa_magra"
  | "massa_gorda";

interface ComparacaoCampo {
  atual: number;
  anterior: number;
  diferenca: number;
}

type ComparacaoMedidas = Partial<Record<CampoMedida, ComparacaoCampo>>;

interface OutputDto {
  user: {
    name: string;
    plano: Plano;
    status: Status;
  };
  medidas: {
    todas: Medidas[];
    comparacao: ComparacaoMedidas | null;
  };
}

const CAMPOS_COMPARAVEIS: CampoMedida[] = [
  "idade",
  "peso",
  "alturaCentimetros",
  "ombro",
  "torax",
  "cintura",
  "abdomen",
  "quadril",
  "braco_relax_direi",
  "braco_contrai_direi",
  "braco_relax_esq",
  "braco_contrai_esq",
  "antebraco_dir",
  "antebraco_esq",
  "coxa_dir",
  "coxa_esq",
  "dobra_triceps",
  "dobra_supraescapular",
  "dobra_suprailica",
  "dobra_adbdominal",
  "dobra_coxa",
  "dobra_peitoral",
  "imc",
  "percentual_gordura",
  "massa_magra",
  "massa_gorda",
];

function calcularComparacao(
  atual: Medidas,
  anterior: Medidas,
): ComparacaoMedidas {
  const comparacao: ComparacaoMedidas = {};

  const calcDiff = (v1: number, v2: number) => parseFloat((v1 - v2).toFixed(2));

  for (const campo of CAMPOS_COMPARAVEIS) {
    const valorAtual = atual[campo];
    const valorAnterior = anterior[campo];

    if (
      valorAtual !== undefined &&
      valorAtual !== null &&
      valorAnterior !== undefined &&
      valorAnterior !== null &&
      typeof valorAtual === "number" &&
      typeof valorAnterior === "number"
    ) {
      comparacao[campo] = {
        atual: valorAtual,
        anterior: valorAnterior,
        diferenca: calcDiff(valorAtual, valorAnterior),
      };
    }
  }

  return comparacao;
}

export class GetUser {
  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await prisma.user.findUnique({
      where: { id: dto.userId, academiaId: dto.academiaId },
      include: {
        medidas: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });
    if (!user) throw new NotFoundError("Usuário não encontrado!");

    const medidas = user.medidas;
    const ultima = medidas[0] ?? null;
    const penultima = medidas[1] ?? null;
    const comparacao =
      ultima && penultima ? calcularComparacao(ultima, penultima) : null;

    return {
      user: {
        name: user.name,
        plano: user.plano,
        status: user.Status,
      },
      medidas: {
        todas: medidas,
        comparacao,
      },
    };
  }
}
