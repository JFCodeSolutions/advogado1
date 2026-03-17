'use client';

import { CSSProperties, FormEvent, useEffect, useMemo, useState } from 'react';

type Lawyer = {
  id: number;
  fullName: string;
  email: string;
  oabNumber: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  bio: string;
  practiceAreas: string[];
  totalPoints: number;
  level: number;
  adHeadline: string | null;
  adDescription: string | null;
  yearsExperience: number | null;
  _count?: { cases: number };
};

type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string;
  leadType: 'CLIENT' | 'LAWYER';
  message: string;
  createdAt: string;
};

type Showcase = {
  id: number;
  clientName: string;
  caseSummary: string;
  approved: boolean;
  createdAt: string;
};

export default function AdminPage() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [selectedLawyerId, setSelectedLawyerId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const selectedLawyer = useMemo(
    () => lawyers.find((lawyer) => lawyer.id === selectedLawyerId) || null,
    [lawyers, selectedLawyerId]
  );

  useEffect(() => {
    void refreshDashboard();
  }, []);

  async function refreshDashboard() {
    setErrorMessage('');
    try {
      const [lawyersResponse, leadsResponse, showcasesResponse] = await Promise.all([
        fetch('/api/lawyers', { cache: 'no-store' }),
        fetch('/api/leads', { cache: 'no-store' }),
        fetch('/api/client-showcases?approved=all', { cache: 'no-store' }),
      ]);

      if (lawyersResponse.ok) {
        const data = await lawyersResponse.json();
        setLawyers(data.lawyers || []);
      }

      if (leadsResponse.ok) {
        const data = await leadsResponse.json();
        setLeads(data.leads || []);
      }

      if (showcasesResponse.ok) {
        const data = await showcasesResponse.json();
        setShowcases(data.showcases || []);
      }
    } catch (error) {
      console.error('Erro ao carregar admin:', error);
      setErrorMessage('Não foi possível carregar os dados do painel.');
    }
  }

  async function handleLawyerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage('');
    setErrorMessage('');
    const formData = new FormData(event.currentTarget);
    const payload = {
      fullName: String(formData.get('fullName') || ''),
      email: String(formData.get('email') || ''),
      oabNumber: String(formData.get('oabNumber') || ''),
      phone: String(formData.get('phone') || ''),
      city: String(formData.get('city') || ''),
      state: String(formData.get('state') || ''),
      bio: String(formData.get('bio') || ''),
      adHeadline: String(formData.get('adHeadline') || ''),
      adDescription: String(formData.get('adDescription') || ''),
      yearsExperience: String(formData.get('yearsExperience') || '').trim() || null,
      practiceAreas: String(formData.get('practiceAreas') || ''),
    };

    const endpoint = selectedLawyer ? `/api/lawyers/${selectedLawyer.id}` : '/api/lawyers';
    const method = selectedLawyer ? 'PATCH' : 'POST';

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      setErrorMessage(data.error || 'Falha ao salvar advogado.');
      return;
    }

    setStatusMessage(selectedLawyer ? 'Perfil atualizado com sucesso.' : 'Advogado cadastrado com sucesso.');
    event.currentTarget.reset();
    setSelectedLawyerId(null);
    await refreshDashboard();
  }

  async function handleCaseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage('');
    setErrorMessage('');
    const formData = new FormData(event.currentTarget);
    const lawyerId = Number(formData.get('lawyerId'));

    if (!lawyerId) {
      setErrorMessage('Selecione um advogado para vincular a causa.');
      return;
    }

    const payload = {
      title: String(formData.get('title') || ''),
      summary: String(formData.get('summary') || ''),
      status: String(formData.get('status') || 'WON'),
      isLegacy: formData.get('isLegacy') === 'on',
      proofUrl: String(formData.get('proofUrl') || ''),
      customPoints: Number(formData.get('customPoints') || 0),
    };

    const response = await fetch(`/api/lawyers/${lawyerId}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      setErrorMessage(data.error || 'Falha ao cadastrar causa.');
      return;
    }

    setStatusMessage('Causa registrada e pontuação atualizada.');
    event.currentTarget.reset();
    await refreshDashboard();
  }

  async function handleShowcaseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage('');
    setErrorMessage('');
    const formData = new FormData(event.currentTarget);

    const payload = {
      clientName: String(formData.get('clientName') || ''),
      photoUrl: String(formData.get('photoUrl') || ''),
      caseSummary: String(formData.get('caseSummary') || ''),
      lawyerId: formData.get('lawyerId') ? Number(formData.get('lawyerId')) : null,
      consentGiven: formData.get('consentGiven') === 'on',
      approved: formData.get('approved') === 'on',
    };

    const response = await fetch('/api/client-showcases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      setErrorMessage(data.error || 'Falha ao cadastrar caso autorizado.');
      return;
    }

    setStatusMessage('Caso autorizado cadastrado com sucesso.');
    event.currentTarget.reset();
    await refreshDashboard();
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f3f4f6', padding: '1rem' }}>
      <section style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gap: '1rem' }}>
        <header style={panelStyle}>
          <h1>Painel Administrativo - Advogado1</h1>
          <p style={{ color: '#4b5563' }}>
            Gerencie perfis, anúncios, causas ganhas e méritos para posicionamento na landing page.
          </p>
          {statusMessage && <p style={{ color: '#065f46', marginTop: 8 }}>{statusMessage}</p>}
          {errorMessage && <p style={{ color: '#b91c1c', marginTop: 8 }}>{errorMessage}</p>}
        </header>

        <section style={panelStyle}>
          <h2>Ranking atual dos advogados</h2>
          {lawyers.length === 0 ? (
            <p>Nenhum advogado cadastrado.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
                <thead>
                  <tr style={{ background: '#e5e7eb' }}>
                    <th style={cellHeadStyle}>Advogado</th>
                    <th style={cellHeadStyle}>Pontos</th>
                    <th style={cellHeadStyle}>Nível</th>
                    <th style={cellHeadStyle}>Áreas</th>
                    <th style={cellHeadStyle}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lawyers.map((lawyer) => (
                    <tr key={lawyer.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={cellStyle}>{lawyer.fullName}</td>
                      <td style={cellStyle}>{lawyer.totalPoints}</td>
                      <td style={cellStyle}>{lawyer.level}</td>
                      <td style={cellStyle}>{lawyer.practiceAreas.join(', ')}</td>
                      <td style={cellStyle}>
                        <button type="button" onClick={() => setSelectedLawyerId(lawyer.id)}>
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section style={panelStyle}>
          <h2>{selectedLawyer ? `Editar perfil: ${selectedLawyer.fullName}` : 'Cadastrar novo advogado'}</h2>
          <form onSubmit={handleLawyerSubmit} style={formGrid}>
            <input name="fullName" defaultValue={selectedLawyer?.fullName || ''} placeholder="Nome completo" required style={inputStyle} />
            <input name="email" type="email" defaultValue={selectedLawyer?.email || ''} placeholder="E-mail" required style={inputStyle} />
            <input name="oabNumber" defaultValue={selectedLawyer?.oabNumber || ''} placeholder="Número OAB" style={inputStyle} />
            <input name="phone" defaultValue={selectedLawyer?.phone || ''} placeholder="Telefone" style={inputStyle} />
            <input name="city" defaultValue={selectedLawyer?.city || ''} placeholder="Cidade" style={inputStyle} />
            <input name="state" defaultValue={selectedLawyer?.state || ''} placeholder="UF" style={inputStyle} />
            <input
              name="yearsExperience"
              type="number"
              min={0}
              defaultValue={selectedLawyer?.yearsExperience ?? ''}
              placeholder="Anos de experiência"
              style={inputStyle}
            />
            <input
              name="practiceAreas"
              defaultValue={selectedLawyer?.practiceAreas.join(', ') || ''}
              placeholder="Ramos (ex.: Trabalhista, Civil, Família)"
              required
              style={{ ...inputStyle, gridColumn: '1 / -1' }}
            />
            <input name="adHeadline" defaultValue={selectedLawyer?.adHeadline || ''} placeholder="Título do anúncio" style={{ ...inputStyle, gridColumn: '1 / -1' }} />
            <textarea
              name="adDescription"
              defaultValue={selectedLawyer?.adDescription || selectedLawyer?.bio || ''}
              placeholder="Descrição do anúncio/perfil"
              rows={3}
              style={{ ...inputStyle, gridColumn: '1 / -1', resize: 'vertical' }}
            />
            <textarea
              name="bio"
              defaultValue={selectedLawyer?.bio || ''}
              placeholder="Bio profissional"
              required
              rows={4}
              style={{ ...inputStyle, gridColumn: '1 / -1', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit">{selectedLawyer ? 'Salvar alterações' : 'Cadastrar advogado'}</button>
              {selectedLawyer && (
                <button type="button" onClick={() => setSelectedLawyerId(null)}>
                  Cancelar edição
                </button>
              )}
            </div>
          </form>
        </section>

        <section style={panelStyle}>
          <h2>Registrar causa (ganha, em andamento ou perdida)</h2>
          <form onSubmit={handleCaseSubmit} style={formGrid}>
            <select name="lawyerId" required style={inputStyle}>
              <option value="">Selecione o advogado</option>
              {lawyers.map((lawyer) => (
                <option key={lawyer.id} value={lawyer.id}>
                  {lawyer.fullName}
                </option>
              ))}
            </select>
            <select name="status" defaultValue="WON" style={inputStyle}>
              <option value="WON">Ganha</option>
              <option value="IN_PROGRESS">Em andamento</option>
              <option value="LOST">Perdida</option>
            </select>
            <input name="customPoints" type="number" min={0} placeholder="Pontos extras por mérito" style={inputStyle} />
            <input name="proofUrl" placeholder="URL de comprovação (opcional)" style={inputStyle} />
            <input name="title" placeholder="Título da causa" required style={{ ...inputStyle, gridColumn: '1 / -1' }} />
            <textarea
              name="summary"
              rows={3}
              placeholder="Resumo da causa"
              required
              style={{ ...inputStyle, gridColumn: '1 / -1', resize: 'vertical' }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input name="isLegacy" type="checkbox" />
              Causa anterior ao sistema (com mérito comprovável)
            </label>
            <button type="submit">Registrar causa</button>
          </form>
        </section>

        <section style={panelStyle}>
          <h2>Cadastrar cliente autorizado para landing page</h2>
          <form onSubmit={handleShowcaseSubmit} style={formGrid}>
            <input name="clientName" placeholder="Nome do cliente" required style={inputStyle} />
            <input name="photoUrl" placeholder="URL da foto do cliente (opcional)" style={inputStyle} />
            <select name="lawyerId" style={inputStyle}>
              <option value="">Sem vínculo de advogado</option>
              {lawyers.map((lawyer) => (
                <option key={lawyer.id} value={lawyer.id}>
                  {lawyer.fullName}
                </option>
              ))}
            </select>
            <textarea
              name="caseSummary"
              rows={3}
              required
              placeholder="Resumo da causa autorizada para publicação"
              style={{ ...inputStyle, gridColumn: '1 / -1', resize: 'vertical' }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input name="consentGiven" type="checkbox" required />
              Cliente autorizou publicação do nome/foto/resumo
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input name="approved" type="checkbox" defaultChecked />
              Publicar na landing imediatamente
            </label>
            <button type="submit">Cadastrar caso autorizado</button>
          </form>
        </section>

        <section style={panelStyle}>
          <h2>Leads recebidos (clientes e advogados)</h2>
          {leads.length === 0 ? (
            <p>Nenhuma solicitação recebida até agora.</p>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {leads.map((lead) => (
                <article key={lead.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.8rem' }}>
                  <p>
                    <strong>{lead.name}</strong> ({lead.leadType === 'CLIENT' ? 'Cliente' : 'Advogado'})
                  </p>
                  <p style={{ fontSize: 14, color: '#374151' }}>
                    {lead.email} | {lead.phone}
                  </p>
                  <p style={{ marginTop: 6 }}>{lead.message}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section style={panelStyle}>
          <h2>Histórico de casos autorizados</h2>
          {showcases.length === 0 ? (
            <p>Nenhum caso autorizado cadastrado.</p>
          ) : (
            <ul style={{ display: 'grid', gap: 8, paddingLeft: 16 }}>
              {showcases.map((showcase) => (
                <li key={showcase.id}>
                  {showcase.clientName} - {showcase.approved ? 'Publicado' : 'Pendente'} - {showcase.caseSummary}
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}

const panelStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: '1rem',
};

const formGrid: CSSProperties = {
  display: 'grid',
  gap: '0.8rem',
  gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))',
  marginTop: 10,
};

const inputStyle: CSSProperties = {
  width: '100%',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '0.7rem',
  fontSize: 14,
};

const cellHeadStyle: CSSProperties = {
  textAlign: 'left',
  padding: '0.6rem',
  fontSize: 14,
};

const cellStyle: CSSProperties = {
  textAlign: 'left',
  padding: '0.6rem',
  fontSize: 14,
  verticalAlign: 'top',
};
