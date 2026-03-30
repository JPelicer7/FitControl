import { NotFoundError } from "../errors/index.js";
import { Prisma } from "../generated/prisma/client.js";
import { Plano, Status } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  academiaId: string;
  name?: string;
  Status?: Status;
  plano?: Plano;
  page?: number;
  limit?: number;
}

interface OutputDto {
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  users: {
    id: string;
    name: string;
    Status: Status;
    plano: Plano;
    telefone: string | null;
    ultimaAvaliacao: Date | null;
  }[];
}

export class GetUsers {
  async execute(dto: InputDto): Promise<OutputDto> {
    // 👇 Criamos o filtro dinâmico
    const whereClause: Prisma.UserWhereInput = {
      academiaId: dto.academiaId,
    };
    // Adiciona os filtros apenas se eles vierem no DTO
    if (dto.name) {
      whereClause.name = { contains: dto.name, mode: "insensitive" }; // insensitive para ignorar maiúsculas/minúsculas
    }
    if (dto.Status) {
      whereClause.Status = dto.Status;
    }
    if (dto.plano) {
      whereClause.plano = dto.plano;
    }

    // 👇 Configuração da Paginação
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const limit = dto.limit && dto.limit > 0 ? dto.limit : 2;
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      where: whereClause,
      take: limit,
      skip: skip,
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

    const totalUsers = await prisma.user.count({ where: whereClause });
    const totalPages = Math.ceil(totalUsers / limit);

    if (!users || users.length === 0) {
      return { users: [], totalUsers: 0, totalPages: 0, currentPage: page };
    }

    // const totalUsers = await prisma.user.count({
    //   where: { academiaId: dto.academiaId },
    // });

    if (!users)
      throw new NotFoundError(
        "Não foi possível encontrar usuários cadastrados.",
      );

    const formattedUsers = users.map((user) => ({
      name: user.name,
      plano: user.plano,
      Status: user.Status,
      telefone: user.telefone,
      id: user.id,
      ultimaAvaliacao: user.medidas[0]?.updatedAt || null,
    }));

    return {
      users: formattedUsers,
      totalUsers,
      totalPages,
      currentPage: page,
    };
  }
}
