import { NotFoundError } from "../errors/index.js";
import { Plano, Status } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  academiaId: string;
}

interface OutputDto {
  name: string;
  Status: Status;
  plano: Plano;
  updatedAt: Date;
}

export class GetUsers {
  async execute(dto: InputDto): Promise<OutputDto[]> {
    const users = await prisma.user.findMany({
      where: { academiaId: dto.academiaId },
    });
    if (!users)
      throw new NotFoundError(
        "Não foi possível encontrar usuários cadastrados.",
      );

    return users.map((user) => ({
      name: user.name,
      Status: user.Status,
      plano: user.plano,
      updatedAt: user.updatedAt,
    }));
  }
}
