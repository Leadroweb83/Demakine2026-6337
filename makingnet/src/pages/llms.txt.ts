// Resumo do site para assistentes de IA (GEO). Gerado a partir dos mesmos dados das páginas.
import type { APIRoute } from 'astro';
import { site, yearsInBusiness } from '../data/site';
import { areas, sistemas } from '../data/servicos';
import { posts, categories } from '../lib/blog';

export const GET: APIRoute = () => {
  const linhas = [
    `# ${site.name}`,
    '',
    `> Empresa de marketing digital, infraestrutura de TI e sistemas de gestão fundada em ${site.foundingYear} (${yearsInBusiness} anos de mercado), com sede em ${site.address.city}/${site.address.state} e atendimento em todo o Brasil. Agência certificada Google Partner e parceira Tray Commerce.`,
    '',
    `- Endereço: ${site.address.street}, ${site.address.district}, ${site.address.city}/${site.address.state}, CEP ${site.address.zip}`,
    `- Telefones: ${site.phones.map((p) => p.label).join(' e ')}`,
    `- E-mail: ${site.email}`,
    `- CNPJ: ${site.cnpj}`,
    '',
    ...areas.flatMap((a) => [
      `## ${a.name}`,
      '',
      ...a.servicos.map((s) => `- [${s.name}](${site.url}/nossos-servicos/${a.slug}/${s.slug}/): ${s.resumo}`),
      '',
    ]),
    `## ${sistemas.name}`,
    '',
    `- [Velosys](${site.url}/nossos-servicos/sistemas/): ${sistemas.resumo}`,
    '',
    '## Blog',
    '',
    `- [Todos os artigos](${site.url}/blog/): ${posts.length} artigos sobre marketing digital, SEO, GEO, tráfego pago e TI`,
    ...categories.slice(0, 12).map((c) => `- [${c.name}](${site.url}/categoria/${c.slug}/): ${c.count} artigos`),
    '',
    '### Artigos mais recentes',
    '',
    ...posts.slice(0, 20).map((p) => `- [${p.title}](${site.url}/blog/${p.slug}/): ${p.description}`),
    '',
    '## Institucional',
    '',
    `- [Sobre a Making](${site.url}/sobre/)`,
    `- [Portfólio de sites e lojas virtuais](${site.url}/nossos-servicos/marketing-digital/portfolio/)`,
    `- [Fale conosco](${site.url}/fale-conosco/)`,
    `- [Pedir orçamento](${site.url}/orcamento/)`,
    '',
  ];
  return new Response(linhas.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
