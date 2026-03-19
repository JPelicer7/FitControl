export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class UserAlreadyExists extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Usuário já existente";
  }
}
