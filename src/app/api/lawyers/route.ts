import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

function normalizePracticeAreas(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured') === 'true';
    const limit = Number(searchParams.get('limit') || (featured ? '6' : '20'));

    const lawyers = await prisma.lawyer.findMany({
      orderBy: [{ totalPoints: 'desc' }, { createdAt: 'desc' }],
      take: Number.isFinite(limit) ? limit : 20,
      include: {
        _count: {
          select: { cases: true },
        },
      },
    });

    return NextResponse.json({ lawyers });
  } catch (error) {
    console.error('Erro ao listar advogados:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const fullName = String(body.fullName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const bio = String(body.bio || '').trim();
    const practiceAreas = normalizePracticeAreas(body.practiceAreas);

    if (!fullName || !email || !bio || practiceAreas.length === 0) {
      return NextResponse.json(
        { error: 'Nome, e-mail, bio e ao menos uma área de atuação são obrigatórios.' },
        { status: 400 }
      );
    }

    const lawyer = await prisma.lawyer.create({
      data: {
        fullName,
        email,
        bio,
        oabNumber: body.oabNumber ? String(body.oabNumber).trim() : null,
        phone: body.phone ? String(body.phone).trim() : null,
        city: body.city ? String(body.city).trim() : null,
        state: body.state ? String(body.state).trim() : null,
        adHeadline: body.adHeadline ? String(body.adHeadline).trim() : null,
        adDescription: body.adDescription ? String(body.adDescription).trim() : null,
        yearsExperience: body.yearsExperience ? Number(body.yearsExperience) : null,
        practiceAreas,
      },
    });

    return NextResponse.json({ lawyer }, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar advogado:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar advogado' }, { status: 500 });
  }
}
