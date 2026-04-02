import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { Categoria, StatusPagamento, Type } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  academiaId: string;
  userId: string;
  type: Type;
  categoria: Categoria;
  status: StatusPagamento;
  descricao: string;
  valor: number;
  data_pagamento: Date;
  data_vencimento?: Date;
  createdBy?: string;
}

interface OutputDto {
  id: string;
  userId: string;
}

export class CreateTransaction {
  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await prisma.user.findUnique({
      where: { id: dto.userId, academiaId: dto.academiaId },
    });
    if (!user) throw new NotFoundError("Usuário não encontrado.");

    if (user.role !== "Dono") {
      throw new ForbiddenError("Acesso negado: permissões insuficientes.");
    }

    const newTransaction = await prisma.financeiro.create({
      data: dto,
    });

    return { id: newTransaction.id, userId: dto.userId };
  }
}
