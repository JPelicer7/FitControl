import { NotFoundError } from "../errors/index.js";
import { Plano, Status } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  academiaId: string;
}

interface OutputDto {
  totalUsers: number;
  users: {
    name: string;
    Status: Status;
    plano: Plano;
    telefone: string | null;
    ultimaAvaliacao: Date | null;
  }[];
}

export class GetUsers {
  async execute(dto: InputDto): Promise<OutputDto> {
    const users = await prisma.user.findMany({
      where: { academiaId: dto.academiaId },
      include: {
        medidas: {
          orderBy: { updatedAt: "desc" },
          take: 1,
          select: {
            updatedAt: true,
          },
        },
      },
    });

    const totalUsers = await prisma.user.count({
      where: { academiaId: dto.academiaId },
    });

    if (!users)
      throw new NotFoundError(
        "Não foi possível encontrar usuários cadastrados.",
      );

    const formattedUsers = users.map((user) => ({
      name: user.name,
      plano: user.plano,
      Status: user.Status,
      telefone: user.telefone,
      ultimaAvaliacao: user.medidas[0]?.updatedAt || null,
    }));

    return {
      users: formattedUsers,
      totalUsers,
    };
  }
}
