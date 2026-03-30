import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  academiaId: string;
  userId: string;
  idade: number;
  peso: number;
  alturaCentimetros: number;
  ombro?: number;
  torax?: number;
  cintura?: number;
  abdomen?: number;
  quadril?: number;
  braco_relax_direi?: number;
  braco_contrai_direi?: number;
  braco_relax_esq?: number;
  braco_contrai_esq?: number;
  antebraco_dir?: number;
  antebraco_esq?: number;
  coxa_dir?: number;
  coxa_esq?: number;
  panturrilha_dir?: number;
  panturrilha_esq?: number;
  dobra_triceps?: number;
  dobra_supraescapular?: number;
  dobra_suprailica?: number;
  dobra_adbdominal?: number;
  dobra_coxa?: number;
  dobra_peitoral?: number;
  //imc: number;
  percentual_gordura?: number;
  //massa_magra?: number;
  //massa_gorda?: number;
}

interface OutputDto {
  userId: string;
  idade: number;
  peso: number;
  alturaCentimetros: number;
}

//add calculo de gordura automatico
export class CreateMedidas {
  async execute(dto: InputDto): Promise<OutputDto> {
    const aluno = await prisma.user.findUnique({
      where: { id: dto.userId, academiaId: dto.academiaId },
    });
    if (!aluno) throw new NotFoundError("Usuário não encontrado!");

    const alturaInMetros = dto.alturaCentimetros / 100;
    const imc = dto.peso / (alturaInMetros * alturaInMetros);

    let massaGorda: number | undefined;
    let massaMagra: number | undefined;
    if (
      dto.percentual_gordura !== undefined &&
      dto.percentual_gordura !== null
    ) {
      massaGorda = dto.peso * (dto.percentual_gordura / 100);
      massaMagra = dto.peso - massaGorda;
    }

    const newMedidas = await prisma.medidas.create({
      data: {
        userId: dto.userId,
        idade: dto.idade,
        peso: dto.peso,
        alturaCentimetros: dto.alturaCentimetros,
        ombro: dto.ombro,
        torax: dto.torax,
        cintura: dto.cintura,
        abdomen: dto.abdomen,
        quadril: dto.quadril,
        braco_relax_direi: dto.braco_relax_direi,
        braco_contrai_direi: dto.braco_contrai_direi,
        braco_relax_esq: dto.braco_relax_esq,
        braco_contrai_esq: dto.braco_contrai_esq,
        antebraco_dir: dto.antebraco_dir,
        antebraco_esq: dto.antebraco_esq,
        coxa_dir: dto.coxa_dir,
        coxa_esq: dto.coxa_esq,
        panturrilha_dir: dto.panturrilha_dir,
        panturrilha_esq: dto.panturrilha_esq,
        dobra_triceps: dto.dobra_triceps,
        dobra_supraescapular: dto.dobra_supraescapular,
        dobra_suprailica: dto.dobra_suprailica,
        dobra_adbdominal: dto.dobra_adbdominal,
        dobra_coxa: dto.dobra_coxa,
        dobra_peitoral: dto.dobra_peitoral,
        imc: imc,
        percentual_gordura: dto.percentual_gordura,
        massa_magra: massaMagra ? parseFloat(massaMagra.toFixed(2)) : null,
        massa_gorda: massaGorda ? parseFloat(massaGorda.toFixed(2)) : null,
      },
    });

    return {
      userId: aluno.id,
      idade: newMedidas.idade,
      peso: newMedidas.peso,
      alturaCentimetros: newMedidas.alturaCentimetros,
    };
  }
}
