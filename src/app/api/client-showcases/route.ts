import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

function parseApproved(rawValue: string | null): boolean | undefined {
  if (rawValue === 'all' || rawValue === null) return undefined;
  if (rawValue === 'false') return false;
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const approved = parseApproved(searchParams.get('approved'));

    const showcases = await prisma.clientShowcase.findMany({
      where: approved === undefined ? undefined : { approved },
      include: {
        lawyer: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ showcases });
  } catch (error) {
    console.error('Erro ao listar casos autorizados:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const clientName = String(body.clientName || '').trim();
    const caseSummary = String(body.caseSummary || '').trim();
    const photoUrl = body.photoUrl ? String(body.photoUrl).trim() : null;
    const consentGiven = Boolean(body.consentGiven);
    const approved = Boolean(body.approved);
    const lawyerId = body.lawyerId ? Number(body.lawyerId) : null;

    if (!clientName || !caseSummary) {
      return NextResponse.json({ error: 'Nome do cliente e resumo são obrigatórios.' }, { status: 400 });
    }

    if (!consentGiven) {
      return NextResponse.json(
        { error: 'É necessário confirmar autorização do cliente para publicar.' },
        { status: 400 }
      );
    }

    const showcase = await prisma.clientShowcase.create({
      data: {
        clientName,
        caseSummary,
        photoUrl,
        consentGiven,
        approved,
        lawyerId,
      },
    });

    return NextResponse.json({ showcase }, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar caso autorizado:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar caso autorizado' }, { status: 500 });
  }
}
