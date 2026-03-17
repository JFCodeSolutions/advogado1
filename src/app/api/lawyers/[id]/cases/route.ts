import { CaseStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { calculateCasePoints, calculateLevel } from '../../../../../lib/scoring';

function parseCaseStatus(rawValue: unknown): CaseStatus {
  const value = String(rawValue || '').toUpperCase();
  if (value === 'IN_PROGRESS') return CaseStatus.IN_PROGRESS;
  if (value === 'LOST') return CaseStatus.LOST;
  return CaseStatus.WON;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lawyerId = Number(params.id);
    if (!Number.isInteger(lawyerId)) {
      return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    }

    const body = await request.json();
    const title = String(body.title || '').trim();
    const summary = String(body.summary || '').trim();
    const status = parseCaseStatus(body.status);
    const isLegacy = Boolean(body.isLegacy);

    if (!title || !summary) {
      return NextResponse.json(
        { error: 'Título e resumo da causa são obrigatórios.' },
        { status: 400 }
      );
    }

    const pointsAwarded = calculateCasePoints({
      isLegacy,
      wonCase: status === CaseStatus.WON,
      customPoints: body.customPoints ? Number(body.customPoints) : 0,
    });

    const data = await prisma.$transaction(async (tx) => {
      const legalCase = await tx.lawyerCase.create({
        data: {
          lawyerId,
          title,
          summary,
          status,
          isLegacy,
          pointsAwarded,
          proofUrl: body.proofUrl ? String(body.proofUrl).trim() : null,
          occurredAt: body.occurredAt ? new Date(body.occurredAt) : null,
        },
      });

      const aggregate = await tx.lawyerCase.aggregate({
        where: { lawyerId },
        _sum: { pointsAwarded: true },
      });

      const totalPoints = aggregate._sum.pointsAwarded || 0;
      const level = calculateLevel(totalPoints);

      const lawyer = await tx.lawyer.update({
        where: { id: lawyerId },
        data: { totalPoints, level },
      });

      return { legalCase, lawyer };
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Erro ao registrar causa:', error);
    return NextResponse.json({ error: 'Erro ao registrar causa' }, { status: 500 });
  }
}
