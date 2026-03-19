import { Plano } from "../generated/prisma/enums.js";
import { Role } from "../generated/prisma/enums.js";
import { Status } from "../generated/prisma/enums.js";
import { auth } from "../lib/auth.js";

interface InputDto {
  name: string;
  email: string;
  password: string;
  academiaId: string;
  plano: Plano;
  role: Role;
  Status: Status;
}

interface OutputDto {
  id: string;
  email: string;
}

export class CreateUser {
  async execute(dto: InputDto): Promise<OutputDto> {
    const newUser = await auth.api.signUpEmail({
      body: {
        name: dto.name,
        email: dto.email,
        password: dto.password,
        academiaId: dto.academiaId,
        plano: dto.plano,
        role: "Aluno",
        Status: dto.Status,
      },
    });
    return { id: newUser.user.id, email: newUser.user.email };
  }
}
