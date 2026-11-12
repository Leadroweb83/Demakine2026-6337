// Dados institucionais da Making. Tudo aqui veio do site atual (makingnet.com.br).
export const site = {
  name: 'Making TI e Marketing Digital',
  shortName: 'Making',
  legalName: 'Making Comércio e Serviço de Equipamentos e Tecnologia de Informática Ltda',
  cnpj: '05.759.841/0001-09',
  url: 'https://www.makingnet.com.br',
  foundingYear: 2003,
  founders: ['Rafael Matarazo', 'Gustavo Matarazo', 'Eduardo Vital'],
  email: 'atendimento@makingnet.com.br',
  phones: [
    { label: '(19) 3455-2630', tel: '+551934552630' },
    { label: '(19) 3464-2332', tel: '+551934642332', whatsapp: true },
  ],
  whatsapp: '551934642332',
  address: {
    street: 'Rua Armando Salles de Oliveira, 38',
    district: 'Jardim América',
    city: "Santa Bárbara d'Oeste",
    state: 'SP',
    zip: '13450-244',
  },
  social: {
    instagram: 'https://www.instagram.com/making.web/',
    facebook: 'https://www.facebook.com/makingnetbr',
    linkedin: 'https://br.linkedin.com/company/makingtieweb',
  },
  partners: [
    {
      name: 'Google Partner',
      img: '/img/marca/google-partner.webp',
      url: 'https://www.google.com/partners/agency?id=6314118100',
    },
    {
      name: 'Parceiro Tray Commerce',
      img: '/img/marca/tray-parceiro.webp',
      url: 'https://parceiros.tray.com.br/listagem-parceiros/making-ti-e-web',
    },
  ],
} as const;

export const yearsInBusiness = new Date().getFullYear() - site.foundingYear;

export function whatsappLink(message = 'Olá! Vim pelo site e gostaria de falar com a Making.') {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const cultura = [
  {
    title: 'Eficazes',
    text: 'Não fazemos por fazer. Fazemos para alcançar os melhores resultados para os nossos clientes.',
  },
  {
    title: 'Analíticos e certeiros',
    text: 'As decisões tomadas sempre são baseadas em dados e análises objetivas.',
  },
  {
    title: 'Colaborativos',
    text: 'Acreditamos no poder da colaboração e no trabalho em equipe. Juntos, alcançamos resultados mais significativos.',
  },
  {
    title: 'Melhoria contínua',
    text: 'Aprendemos a cada dia. Não há nada tão bom que não possa melhorar.',
  },
  {
    title: 'Íntegros',
    text: 'Transparência, honestidade e ética em todas as relações, valorizando a confiança construída com clientes, parceiros e equipe.',
  },
  {
    title: 'Satisfação em ser Making',
    text: 'Zelar pela nossa marca incondicionalmente.',
  },
];
