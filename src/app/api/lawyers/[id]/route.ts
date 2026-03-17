import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

function normalizePracticeAreas(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return undefined;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const lawyerId = Number(params.id);
    if (!Number.isInteger(lawyerId)) {
      return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    }

    const lawyer = await prisma.lawyer.findUnique({
      where: { id: lawyerId },
      include: {
        cases: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lawyer) {
      return NextResponse.json({ error: 'Advogado não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ lawyer });
  } catch (error) {
    console.error('Erro ao carregar advogado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const lawyerId = Number(params.id);
    if (!Number.isInteger(lawyerId)) {
      return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    }

    const body = await request.json();
    const practiceAreas = normalizePracticeAreas(body.practiceAreas);

    const lawyer = await prisma.lawyer.update({
      where: { id: lawyerId },
      data: {
        fullName: body.fullName !== undefined ? String(body.fullName).trim() : undefined,
        email: body.email !== undefined ? String(body.email).trim().toLowerCase() : undefined,
        bio: body.bio !== undefined ? String(body.bio).trim() : undefined,
        oabNumber: body.oabNumber !== undefined ? String(body.oabNumber).trim() || null : undefined,
        phone: body.phone !== undefined ? String(body.phone).trim() || null : undefined,
        city: body.city !== undefined ? String(body.city).trim() || null : undefined,
        state: body.state !== undefined ? String(body.state).trim() || null : undefined,
        adHeadline: body.adHeadline !== undefined ? String(body.adHeadline).trim() || null : undefined,
        adDescription:
          body.adDescription !== undefined ? String(body.adDescription).trim() || null : undefined,
        yearsExperience:
          body.yearsExperience !== undefined && body.yearsExperience !== null
            ? Number(body.yearsExperience)
            : body.yearsExperience === null
              ? null
              : undefined,
        practiceAreas,
      },
    });

    return NextResponse.json({ lawyer });
  } catch (error) {
    console.error('Erro ao atualizar advogado:', error);
    return NextResponse.json({ error: 'Erro ao atualizar advogado' }, { status: 500 });
  }
}
