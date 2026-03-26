import { NotFoundError, UserAlreadyExists } from "../errors/index.js";
import { Plano } from "../generated/prisma/enums.js";
import { Role } from "../generated/prisma/enums.js";
import { Status } from "../generated/prisma/enums.js";
import { auth } from "../lib/auth.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  name: string;
  email: string;
  password: string;
  academiaId: string;
  plano: Plano;
  role: Role;
  Status: Status;
  telefone?: string;
}

interface OutputDto {
  id: string;
  email: string;
}

export class CreateUser {
  async execute(dto: InputDto): Promise<OutputDto> {
    const userExists = await prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new UserAlreadyExists(
        "Este e-mail já está cadastrado em nossa plataforma.",
      );
    }

    const newUser = await auth.api.signUpEmail({
      body: {
        name: dto.name,
        email: dto.email,
        password: dto.password,
        academiaId: dto.academiaId,
        plano: dto.plano,
        role: "Aluno",
        telefone: dto.telefone,
        Status: dto.Status,
      },
    });

    if (!newUser) throw new NotFoundError("Não foi possível criar o usuário.");

    return { id: newUser.user.id, email: newUser.user.email };
  }
}
