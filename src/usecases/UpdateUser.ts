import { NotFoundError } from "../errors/index.js";
import { Plano } from "../generated/prisma/enums.js";
import { Role } from "../generated/prisma/enums.js";
import { Status } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  academiaId: string;
  name?: string;
  plano?: Plano;
  role?: Role;
  Status?: Status;
}

interface OutputDto {
  name: string;
  plano: Plano;
  role: Role;
  Status: Status;
}

export class UpdateUser {
  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await prisma.user.findUnique({
      where: { id: dto.userId, academiaId: dto.academiaId },
    });

    if (!user) throw new NotFoundError("Não foi possível encontrar o usuário.");

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: dto.name,
        plano: dto.plano,
        role: dto.role,
        Status: dto.Status,
      },
    });
    return updatedUser;
  }
}
