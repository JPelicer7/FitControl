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

export class ExercAlreadyAdd extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Exercício já adicionado a esse Treino.";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class FechamentoAlreadyExists extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FechamentoAlreadyExists";
  }
}

export class NotExistTransactions extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotExistTransactions";
  }
}
