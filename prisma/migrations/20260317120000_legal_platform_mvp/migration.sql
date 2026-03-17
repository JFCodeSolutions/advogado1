-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('CLIENT', 'LAWYER');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('WON', 'IN_PROGRESS', 'LOST');

-- CreateTable
CREATE TABLE "Lawyer" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "oabNumber" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "state" TEXT,
    "bio" TEXT NOT NULL,
    "practiceAreas" TEXT[],
    "adHeadline" TEXT,
    "adDescription" TEXT,
    "yearsExperience" INTEGER,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lawyer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LawyerCase" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'WON',
    "isLegacy" BOOLEAN NOT NULL DEFAULT false,
    "proofUrl" TEXT,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "occurredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lawyerId" INTEGER NOT NULL,

    CONSTRAINT "LawyerCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientShowcase" (
    "id" SERIAL NOT NULL,
    "clientName" TEXT NOT NULL,
    "photoUrl" TEXT,
    "caseSummary" TEXT NOT NULL,
    "consentGiven" BOOLEAN NOT NULL DEFAULT true,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lawyerId" INTEGER,

    CONSTRAINT "ClientShowcase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "leadType" "LeadType" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lawyer_oabNumber_key" ON "Lawyer"("oabNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Lawyer_email_key" ON "Lawyer"("email");

-- CreateIndex
CREATE INDEX "LawyerCase_lawyerId_idx" ON "LawyerCase"("lawyerId");

-- CreateIndex
CREATE INDEX "ClientShowcase_approved_createdAt_idx" ON "ClientShowcase"("approved", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_leadType_createdAt_idx" ON "Lead"("leadType", "createdAt");

-- AddForeignKey
ALTER TABLE "LawyerCase" ADD CONSTRAINT "LawyerCase_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "Lawyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientShowcase" ADD CONSTRAINT "ClientShowcase_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "Lawyer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
