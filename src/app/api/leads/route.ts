import { LeadType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

function parseLeadType(value: unknown): LeadType {
  const normalized = String(value || '').toUpperCase();
  return normalized === 'LAWYER' ? LeadType.LAWYER : LeadType.CLIENT;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('leadType');

    const leads = await prisma.lead.findMany({
      where: typeParam
        ? {
            leadType: parseLeadType(typeParam),
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Erro ao listar leads:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const message = String(body.message || '').trim();
    const leadType = parseLeadType(body.leadType);

    if (!name || !email || !phone || !message) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: { name, email, phone, message, leadType },
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar lead:', error);
    return NextResponse.json({ error: 'Erro ao enviar solicitação' }, { status: 500 });
  }
}
