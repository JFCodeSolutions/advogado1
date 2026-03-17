'use client';

import { CSSProperties, FormEvent, useEffect, useState } from 'react';

type Lawyer = {
  id: number;
  fullName: string;
  bio: string;
  practiceAreas: string[];
  adHeadline: string | null;
  adDescription: string | null;
  totalPoints: number;
  level: number;
  _count?: { cases: number };
};

type Showcase = {
  id: number;
  clientName: string;
  photoUrl: string | null;
  caseSummary: string;
  lawyer?: { fullName: string } | null;
};

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function Home() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      const [lawyersResponse, showcasesResponse] = await Promise.all([
        fetch('/api/lawyers?featured=true&limit=6', { cache: 'no-store' }),
        fetch('/api/client-showcases?approved=true', { cache: 'no-store' }),
      ]);

      if (lawyersResponse.ok) {
        const lawyersData = await lawyersResponse.json();
        setLawyers(lawyersData.lawyers || []);
      }

      if (showcasesResponse.ok) {
        const showcasesData = await showcasesResponse.json();
        setShowcases(showcasesData.showcases || []);
      }
    } catch (error) {
      console.error('Erro ao carregar landing:', error);
    }
  }

  async function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormStatus('submitting');
    setFeedbackMessage('');

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      phone: String(formData.get('phone') || ''),
      leadType: String(formData.get('leadType') || 'CLIENT'),
      message: String(formData.get('message') || ''),
    };

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Não foi possível enviar sua solicitação.');
      }

      form.reset();
      setFormStatus('success');
      setFeedbackMessage('Solicitação enviada com sucesso. Nossa equipe retornará em breve.');
    } catch (error) {
      setFormStatus('error');
      setFeedbackMessage(error instanceof Error ? error.message : 'Erro inesperado ao enviar formulário.');
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f3f4f6', color: '#111827' }}>
      <header style={{ background: '#111827', color: '#fff', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.8rem', color: '#fff' }}>
            Advogado1 | Rede de Advogados com Mérito Comprovado
          </h1>
          <p style={{ maxWidth: 760, lineHeight: 1.5, color: '#d1d5db' }}>
            Conectamos clientes a advogados com histórico validado, resultados em causas e reputação em evolução
            contínua dentro da plataforma.
          </p>
        </div>
      </header>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Advogados associados em destaque</h2>
        {lawyers.length === 0 ? (
          <p style={{ background: '#fff', padding: '1rem', borderRadius: 10 }}>
            Ainda não há advogados cadastrados. Use a área admin para iniciar o cadastro.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: '1rem' }}>
            {lawyers.map((lawyer) => (
              <article key={lawyer.id} style={{ background: '#fff', borderRadius: 12, padding: '1rem', border: '1px solid #e5e7eb' }}>
                <h3 style={{ marginBottom: 6 }}>{lawyer.fullName}</h3>
                <p style={{ color: '#4b5563', marginBottom: 10, fontSize: 14 }}>
                  {lawyer.adHeadline || lawyer.bio}
                </p>
                <p style={{ fontSize: 14, marginBottom: 8 }}>
                  <strong>Pontuação:</strong> {lawyer.totalPoints} | <strong>Nível:</strong> {lawyer.level}
                </p>
                <p style={{ fontSize: 14, marginBottom: 8 }}>
                  <strong>Causas registradas:</strong> {lawyer._count?.cases || 0}
                </p>
                <p style={{ fontSize: 14, color: '#1f2937' }}>
                  <strong>Ramos:</strong> {lawyer.practiceAreas.join(', ')}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1rem 2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Clientes que autorizaram publicação</h2>
        {showcases.length === 0 ? (
          <p style={{ background: '#fff', padding: '1rem', borderRadius: 10 }}>
            Ainda não há casos de clientes autorizados para exibição pública.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem' }}>
            {showcases.map((showcase) => (
              <article key={showcase.id} style={{ background: '#fff', borderRadius: 12, padding: '1rem', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  {showcase.photoUrl ? (
                    <img
                      src={showcase.photoUrl}
                      alt={`Foto de ${showcase.clientName}`}
                      style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        background: '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                      }}
                    >
                      {showcase.clientName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <strong>{showcase.clientName}</strong>
                    <p style={{ color: '#6b7280', fontSize: 13 }}>
                      {showcase.lawyer ? `Atendido por ${showcase.lawyer.fullName}` : 'Advogado não informado'}
                    </p>
                  </div>
                </div>
                <p style={{ color: '#374151', fontSize: 14 }}>{showcase.caseSummary}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="contato" style={{ maxWidth: 900, margin: '0 auto', padding: '0 1rem 3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Quero entrar na plataforma</h2>
        <form
          onSubmit={handleLeadSubmit}
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            padding: '1rem',
            display: 'grid',
            gap: '0.8rem',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0.8rem' }}>
            <input name="name" placeholder="Seu nome" required style={inputStyle} />
            <input name="email" type="email" placeholder="Seu e-mail" required style={inputStyle} />
            <input name="phone" placeholder="Seu telefone" required style={inputStyle} />
            <select name="leadType" defaultValue="CLIENT" style={inputStyle}>
              <option value="CLIENT">Quero ser cliente</option>
              <option value="LAWYER">Quero ser advogado associado</option>
            </select>
          </div>
          <textarea
            name="message"
            required
            rows={5}
            placeholder="Descreva sua necessidade, ramo de atuação ou objetivo."
            style={{ ...inputStyle, resize: 'vertical' }}
          />
          <button type="submit" disabled={formStatus === 'submitting'}>
            {formStatus === 'submitting' ? 'Enviando...' : 'Enviar solicitação'}
          </button>
          {feedbackMessage && (
            <p style={{ color: formStatus === 'error' ? '#b91c1c' : '#065f46', fontSize: 14 }}>{feedbackMessage}</p>
          )}
        </form>
      </section>
    </main>
  );
}

const inputStyle: CSSProperties = {
  width: '100%',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '0.7rem 0.8rem',
  fontSize: 14,
  background: '#fff',
};
