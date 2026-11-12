// Envio dos formulários de contato, orçamento e diagnóstico.
// Com endpoint (PUBLIC_FORM_ENDPOINT) envia por POST e vai para /obrigado/.
// Sem endpoint, abre o WhatsApp da Making com a mensagem pronta.
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __mkLead?: boolean;
  }
}

if (typeof window !== 'undefined' && !window.__mkLead) {
  window.__mkLead = true;
  document.addEventListener('submit', (e) => {
    const form = (e.target as HTMLElement).closest?.('[data-lead-form]') as HTMLFormElement | null;
    if (!form) return;
    e.preventDefault();
    const d = new FormData(form);
    if (d.get('website')) return; // campo-armadilha para robôs
    const status = form.querySelector('[data-status]') as HTMLElement | null;
    const endpoint = form.getAttribute('action');
    const kind = form.dataset.kind ?? 'contato';
    const track = () => {
      try {
        window.gtag?.('event', 'generate_lead', { form: kind });
        window.dataLayer?.push({ event: 'lead', form: kind });
      } catch {}
    };
    const line = (label: string, key: string) => (d.get(key) ? `${label}: ${d.get(key)}` : '');
    if (!endpoint) {
      const intro = kind === 'diagnostico' ? 'Olá! Quero a análise gratuita do meu site.' : 'Olá! Vim pelo site da Making.';
      const text = [intro, line('Nome', 'nome'), line('Empresa', 'empresa'), line('Site', 'site'), line('E-mail', 'email'), line('Telefone', 'telefone'), line('Serviço', 'servico'), line('Mensagem', 'mensagem')]
        .filter(Boolean)
        .join('\n');
      track();
      window.open(`https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      if (status) status.textContent = 'Abrimos o WhatsApp com a sua mensagem pronta. É só enviar.';
      return;
    }
    if (status) status.textContent = 'Enviando...';
    fetch(endpoint, { method: 'POST', body: d, headers: { Accept: 'application/json' } })
      .then((r) => {
        if (!r.ok) throw new Error();
        track();
        window.location.href = '/obrigado/';
      })
      .catch(() => {
        if (status) status.textContent = 'Não foi possível enviar agora. Tente de novo ou fale com a gente pelo WhatsApp.';
      });
  });
}

export {};
