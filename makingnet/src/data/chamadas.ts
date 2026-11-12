// Chamadas rotativas da home. Sem promessas numéricas: só o que a Making de fato entrega.
import type { CtaItem } from '@/components/ui/rotating-cta';

export const chamadasHero: CtaItem[] = [
  {
    title: 'Sua empresa pronta para decolar',
    text: 'Marketing digital, TI e sistema de gestão em um só parceiro, desde 2003.',
    label: 'Pedir orçamento',
    href: '/orcamento/',
  },
  {
    title: 'Seja encontrado por quem já quer comprar',
    text: 'SEO e links patrocinados para colocar sua marca na frente do cliente certo.',
    label: 'Quero aparecer no Google',
    href: '/nossos-servicos/marketing-digital/marketing-de-busca/',
  },
  {
    title: 'Um site que trabalha como vendedor',
    text: 'Sites, blogs e lojas virtuais rápidos, otimizados para busca e fáceis de atualizar.',
    label: 'Quero um site profissional',
    href: '/nossos-servicos/marketing-digital/criacao-de-sites/',
  },
  {
    title: 'TI que não deixa sua operação parar',
    text: 'Suporte, redes, servidores e virtualização com assistência no laboratório ou na sua empresa.',
    label: 'Preciso de suporte de TI',
    href: '/nossos-servicos/hardware-e-infraestrutura/',
  },
  {
    title: 'A gestão inteira em um só sistema',
    text: 'Velosys: vendas, estoque, produção, financeiro e fiscal, no computador e no celular.',
    label: 'Conhecer o Velosys',
    href: '/nossos-servicos/sistemas/',
  },
];

const ads = '/nossos-servicos/marketing-digital/gestao-de-google-ads/';

export const chamadasGooglePartner: CtaItem[] = [
  {
    title: 'Apareça para quem já está procurando',
    text: 'Anúncios na busca do Google para as palavras que o seu cliente digita na hora de comprar.',
    label: 'Quero anunciar no Google',
    href: ads,
  },
  {
    title: 'Campanhas com profissionais certificados',
    text: 'A Making é agência Google Partner, com equipe certificada em Google Ads.',
    label: 'Falar com um especialista',
    href: '/orcamento/',
  },
  {
    title: 'Cada real investido, medido',
    text: 'Relatórios periódicos com os principais indicadores, para você decidir com base em dados.',
    label: 'Ver como funciona',
    href: ads,
  },
  {
    title: 'Busca, YouTube e sites parceiros',
    text: 'Sua marca nos formatos de texto, imagem e vídeo, onde o seu público está.',
    label: 'Planejar minha campanha',
    href: '/orcamento/',
  },
  {
    title: 'Mais leads, menos clique perdido',
    text: 'Criamos, gerenciamos e otimizamos as campanhas para atrair tráfego qualificado.',
    label: 'Quero mais leads',
    href: ads,
  },
  {
    title: 'Tráfego hoje, crescimento sempre',
    text: 'Links patrocinados trazem tráfego assim que entram no ar. O SEO sustenta o crescimento.',
    label: 'Montar minha estratégia',
    href: '/nossos-servicos/marketing-digital/marketing-de-busca/',
  },
];
