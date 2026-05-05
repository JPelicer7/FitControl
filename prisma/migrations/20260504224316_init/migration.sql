-- CreateEnum
CREATE TYPE "Type" AS ENUM ('Receita', 'Despesa');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('Pago', 'Pendente', 'Cancelado');

-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('Mensalidade', 'Personal', 'Aluguel', 'Equipamentos', 'Energia', 'Agua', 'Manutencao', 'Outros');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Dono', 'Aluno');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Ativo', 'Inativo');

-- CreateEnum
CREATE TYPE "Plano" AS ENUM ('Mensal', 'Trimestral', 'Semestral', 'Anual');

-- CreateEnum
CREATE TYPE "AgendaCategoria" AS ENUM ('Reuniao', 'Personal', 'Avaliacao', 'Outro');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'Aluno',
    "Status" "Status" NOT NULL DEFAULT 'Ativo',
    "plano" "Plano" NOT NULL DEFAULT 'Mensal',
    "academiaId" TEXT NOT NULL,
    "telefone" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Academia" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Academia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Financeiro" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "academiaId" TEXT NOT NULL,
    "type" "Type" NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "status" "StatusPagamento" NOT NULL DEFAULT 'Pago',
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "data_pagamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_vencimento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "fechado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Financeiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FechamentoMensal" (
    "id" TEXT NOT NULL,
    "academiaId" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "receitaTotal" DECIMAL(10,2) NOT NULL,
    "despesaTotal" DECIMAL(10,2) NOT NULL,
    "lucroLiquido" DECIMAL(10,2) NOT NULL,
    "fechadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechadoPor" TEXT NOT NULL,

    CONSTRAINT "FechamentoMensal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medidas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "idade" INTEGER NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "alturaCentimetros" DOUBLE PRECISION NOT NULL,
    "ombro" DOUBLE PRECISION,
    "torax" DOUBLE PRECISION,
    "cintura" DOUBLE PRECISION,
    "abdomen" DOUBLE PRECISION,
    "quadril" DOUBLE PRECISION,
    "braco_relax_direi" DOUBLE PRECISION,
    "braco_contrai_direi" DOUBLE PRECISION,
    "braco_relax_esq" DOUBLE PRECISION,
    "braco_contrai_esq" DOUBLE PRECISION,
    "antebraco_dir" DOUBLE PRECISION,
    "antebraco_esq" DOUBLE PRECISION,
    "coxa_dir" DOUBLE PRECISION,
    "coxa_esq" DOUBLE PRECISION,
    "panturrilha_dir" DOUBLE PRECISION,
    "panturrilha_esq" DOUBLE PRECISION,
    "dobra_triceps" DOUBLE PRECISION,
    "dobra_supraescapular" DOUBLE PRECISION,
    "dobra_suprailica" DOUBLE PRECISION,
    "dobra_adbdominal" DOUBLE PRECISION,
    "dobra_coxa" DOUBLE PRECISION,
    "dobra_peitoral" DOUBLE PRECISION,
    "imc" DOUBLE PRECISION,
    "percentual_gordura" DOUBLE PRECISION,
    "massa_magra" DOUBLE PRECISION,
    "massa_gorda" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercicio" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "grupoMuscular" TEXT,
    "videoUrl" TEXT,
    "academiaId" TEXT,

    CONSTRAINT "Exercicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Treino" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "academiaId" TEXT NOT NULL,
    "criadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Treino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreinoExercicio" (
    "id" TEXT NOT NULL,
    "treinoId" TEXT NOT NULL,
    "exercicioId" TEXT NOT NULL,
    "series" INTEGER NOT NULL,
    "repeticoes" TEXT NOT NULL,
    "carga" TEXT,
    "ordem" INTEGER,

    CONSTRAINT "TreinoExercicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlunoTreino" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "treinoId" TEXT NOT NULL,

    CONSTRAINT "AlunoTreino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agenda" (
    "id" TEXT NOT NULL,
    "academiaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "duracao" INTEGER,
    "observacao" TEXT,
    "categoria" "AgendaCategoria" NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FechamentoMensal_mes_ano_academiaId_key" ON "FechamentoMensal"("mes", "ano", "academiaId");

-- CreateIndex
CREATE UNIQUE INDEX "Exercicio_nome_academiaId_key" ON "Exercicio"("nome", "academiaId");

-- CreateIndex
CREATE UNIQUE INDEX "AlunoTreino_userId_treinoId_key" ON "AlunoTreino"("userId", "treinoId");

-- CreateIndex
CREATE INDEX "Agenda_academiaId_data_idx" ON "Agenda"("academiaId", "data");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_academiaId_fkey" FOREIGN KEY ("academiaId") REFERENCES "Academia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Financeiro" ADD CONSTRAINT "Financeiro_academiaId_fkey" FOREIGN KEY ("academiaId") REFERENCES "Academia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Financeiro" ADD CONSTRAINT "Financeiro_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FechamentoMensal" ADD CONSTRAINT "FechamentoMensal_academiaId_fkey" FOREIGN KEY ("academiaId") REFERENCES "Academia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medidas" ADD CONSTRAINT "Medidas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreinoExercicio" ADD CONSTRAINT "TreinoExercicio_treinoId_fkey" FOREIGN KEY ("treinoId") REFERENCES "Treino"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreinoExercicio" ADD CONSTRAINT "TreinoExercicio_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "Exercicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlunoTreino" ADD CONSTRAINT "AlunoTreino_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlunoTreino" ADD CONSTRAINT "AlunoTreino_treinoId_fkey" FOREIGN KEY ("treinoId") REFERENCES "Treino"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_academiaId_fkey" FOREIGN KEY ("academiaId") REFERENCES "Academia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
