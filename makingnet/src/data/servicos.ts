// Áreas e serviços da Making. Os slugs repetem as URLs do site atual
// (/nossos-servicos/<area>/<servico>/) para preservar o posicionamento no Google.
// Os textos vieram do site atual, com ajustes de clareza. Nenhum dado novo foi inventado.

export interface Bloco {
  title: string;
  text?: string;
  items?: string[];
}

export interface Faq {
  q: string;
  a: string;
}

export interface Servico {
  slug: string;
  name: string;
  /** Texto curto para cards e menus */
  resumo: string;
  /** <title> da página */
  seoTitle: string;
  /** meta description, até cerca de 155 caracteres */
  seoDescription: string;
  h1: string;
  intro: string[];
  blocos: Bloco[];
  faq: Faq[];
  cta: string;
}

export interface Area {
  slug: string;
  name: string;
  resumo: string;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  intro: string[];
  servicos: Servico[];
}

const marketing: Area = {
  slug: 'marketing-digital',
  name: 'Marketing Digital',
  resumo: 'Criação de sites, blogs e lojas virtuais, SEO, Google Ads, redes sociais e inbound marketing.',
  seoTitle: "Agência de Marketing Digital em Santa Bárbara d'Oeste | Making",
  seoDescription:
    'Agência Google Partner desde 2003. Criação de sites, SEO, Google Ads, anúncios em redes sociais e inbound marketing para gerar clientes pela internet.',
  h1: 'Marketing digital para sua empresa vender mais pela internet',
  intro: [
    'Nossa equipe de especialistas em marketing digital trabalha com uma abordagem estratégica e orientada para resultados, com serviços que aumentam sua presença na internet e o retorno sobre o investimento.',
    'Do desenvolvimento de campanhas em redes sociais ao gerenciamento de anúncios e à otimização de sites, criamos uma estratégia personalizada que destaca sua marca, envolve seu público e aumenta suas vendas.',
  ],
  servicos: [
    {
      slug: 'criacao-de-sites',
      name: 'Criação de sites',
      resumo: 'Sites, blogs, landing pages e lojas virtuais com foco em performance, SEO e gestão fácil de conteúdo.',
      seoTitle: 'Criação de Sites Profissionais, Blogs e Lojas Virtuais | Making',
      seoDescription:
        'Criação de sites, blogs, landing pages e e-commerce desde 2003. Sites rápidos, otimizados para o Google e fáceis de atualizar. Peça um orçamento.',
      h1: 'Criação de sites profissionais para o seu negócio',
      intro: [
        'Um site bem elaborado pode ser a peça-chave para o sucesso do seu negócio. Além de garantir presença online sólida, ele estabelece credibilidade e confiança junto aos seus clientes em potencial.',
        'Ao oferecer informações relevantes sobre seus produtos ou serviços, um site profissional aumenta a visibilidade da marca, facilita a comunicação com os clientes e amplia sua base de clientes para além das fronteiras geográficas tradicionais.',
      ],
      blocos: [
        {
          title: 'Desenvolvimento e criação de sites',
          text: 'Desde 2003 atuando na criação de sites, planejamos, criamos e programamos sites, blogs, landing pages e e-commerces voltados ao público que irá acessá-los, com objetivo claro definido junto ao cliente. Com foco em performance, o site é projetado para atender às necessidades do briefing, proporcionar boa experiência de navegação e melhor posicionamento nos buscadores.',
        },
        {
          title: 'Você gerencia o conteúdo',
          text: 'Sua equipe administra conteúdos, atualizando textos e imagens de forma fácil e intuitiva. Você pode gerenciar produtos, agenda, notícias, artigos, depoimentos, galeria de fotos e muito mais, pois as soluções são desenvolvidas de acordo com as suas necessidades.',
        },
        {
          title: 'Mensuração dos resultados',
          text: 'É fundamental saber o que acontece com o seu site para decidir com base em dados reais e melhorar a relevância dele de forma contínua. Mensuramos e gerenciamos os resultados e entregamos periodicamente relatórios com os principais indicadores.',
        },
        {
          title: 'Ações baseadas em resultados reais',
          text: 'Os sites desenvolvidos pela Making têm foco em resultados. Quando houver ações de marketing digital levando usuários ao site, ele já estará pronto para isso, e você acompanha as estatísticas de forma simples e clara.',
        },
      ],
      faq: [
        {
          q: 'Que tipos de site a Making desenvolve?',
          a: 'Sites institucionais, blogs, landing pages e lojas virtuais (e-commerce), sempre planejados para o público que irá acessá-los e com objetivo definido junto ao cliente.',
        },
        {
          q: 'Consigo atualizar o site sozinho depois de pronto?',
          a: 'Sim. Sua equipe administra conteúdos como textos, imagens, produtos, notícias, artigos e depoimentos de forma fácil e intuitiva.',
        },
        {
          q: 'O site já sai otimizado para o Google?',
          a: 'Sim. Os sites são desenvolvidos com foco em performance, boa experiência de navegação e melhor posicionamento nos buscadores, unindo tecnologia, design e técnicas de SEO.',
        },
      ],
      cta: 'Quero um site profissional',
    },
    {
      slug: 'gestao-de-google-ads',
      name: 'Gestão de Google Ads',
      resumo: 'Criação e gerenciamento de links patrocinados para colocar sua empresa na primeira página do Google.',
      seoTitle: 'Gestão de Google Ads e Links Patrocinados | Making Google Partner',
      seoDescription:
        'Agência Google Partner. Criamos, gerenciamos e otimizamos campanhas de Google Ads e Microsoft Advertising, com relatórios periódicos de resultados.',
      h1: 'Gestão de Google Ads e links patrocinados',
      intro: [
        'Criação e gerenciamento de links patrocinados para colocar seu site na primeira página do Google, do Bing e de outros buscadores, oferecendo aos seus clientes potenciais aquilo que o seu negócio tem de melhor.',
        'A Making cria, gerencia e otimiza campanhas de links patrocinados para o seu negócio. É uma forma eficiente de aumentar o tráfego qualificado no seu site ou loja virtual de maneira econômica e imediata.',
        'Os anúncios aparecem em formato de texto ou gráfico nos buscadores, em diretórios e em sites relacionados ao seu negócio, direcionando clientes potenciais para o seu site.',
      ],
      blocos: [
        {
          title: 'Nas primeiras posições dos sites de busca',
          text: 'As campanhas de links patrocinados posicionam o seu site nas primeiras posições da busca do Google e do Bing para as palavras-chave escolhidas no projeto.',
        },
        {
          title: 'Relatórios analíticos periódicos',
          text: 'Mensuramos, analisamos e gerenciamos os resultados obtidos, e os relatórios são entregues periodicamente aos clientes.',
        },
        {
          title: 'Profissionais certificados',
          text: 'A Making conta com profissionais certificados em Google Ads e Microsoft Advertising (Bing Ads) e é uma agência certificada Google Partner.',
        },
      ],
      faq: [
        {
          q: 'O que são links patrocinados?',
          a: 'São anúncios pagos exibidos em formato de texto ou gráfico nos buscadores, em diretórios e em sites relacionados ao seu negócio, que direcionam clientes potenciais para o seu site.',
        },
        {
          q: 'Em quanto tempo o Google Ads traz resultado?',
          a: 'Os links patrocinados aumentam o tráfego qualificado do site de maneira imediata, assim que a campanha entra no ar.',
        },
        {
          q: 'A Making é parceira oficial do Google?',
          a: 'Sim. A Making é uma agência certificada Google Partner e conta com profissionais certificados em Google Ads e Microsoft Advertising.',
        },
      ],
      cta: 'Quero anunciar no Google',
    },
    {
      slug: 'marketing-de-busca',
      name: 'Marketing de busca (SEO)',
      resumo: 'SEO e links patrocinados para sua empresa ser encontrada nas primeiras posições dos buscadores.',
      seoTitle: 'SEO e Marketing de Busca: sua empresa no topo do Google | Making',
      seoDescription:
        'Estratégias de SEO e links patrocinados para posicionar seu site nas primeiras posições do Google e atrair clientes. Abordagem personalizada e mensurável.',
      h1: 'Marketing de busca: mais visibilidade e mais clientes para o seu negócio',
      intro: [
        'Quer aumentar a visibilidade e atrair mais clientes para o seu negócio online? Nosso serviço de marketing de busca une estratégias avançadas de SEO (Search Engine Optimization) e campanhas de links patrocinados.',
        'Posicionamos o seu site nas primeiras posições dos resultados de busca, para que sua marca seja encontrada pelo público certo.',
      ],
      blocos: [
        {
          title: 'Como funciona',
          text: 'Com uma abordagem personalizada e focada em resultados mensuráveis, ajudamos você a alcançar maior retorno sobre o investimento e a expandir sua presença digital de forma significativa.',
        },
        {
          title: 'O que está incluído',
          items: [
            'SEO (otimização para mecanismos de busca)',
            'Campanhas de links patrocinados',
            'Estratégia personalizada para o seu público',
            'Acompanhamento de resultados mensuráveis',
          ],
        },
      ],
      faq: [
        {
          q: 'O que é marketing de busca?',
          a: 'É o conjunto de estratégias de SEO (otimização para mecanismos de busca) e de links patrocinados usado para colocar um site nas primeiras posições dos resultados de busca.',
        },
        {
          q: 'Qual a diferença entre SEO e links patrocinados?',
          a: 'SEO trabalha o posicionamento orgânico do site nos resultados de busca. Links patrocinados são anúncios pagos que aparecem nos buscadores. A Making trabalha as duas frentes de forma combinada.',
        },
      ],
      cta: 'Quero aparecer no Google',
    },
    {
      slug: 'redes-sociais',
      name: 'Anúncios em redes sociais',
      resumo: 'Anúncios patrocinados nas redes sociais para alcançar o público certo e aumentar vendas.',
      seoTitle: 'Anúncios em Redes Sociais (Social Ads) | Making',
      seoDescription:
        'Anúncios patrocinados nas redes sociais com mensagem, formato e horário sob medida. Monitoramento em tempo real para otimizar o retorno do investimento.',
      h1: 'Anúncios em redes sociais',
      intro: [
        'Se você quer impulsionar o seu negócio de forma inteligente, considere os anúncios patrocinados nas redes sociais. Com essa estratégia você alcança diretamente o seu público-alvo e aumenta as chances de sucesso das campanhas.',
        'Oferecemos um serviço personalizado, adaptando a mensagem, o formato e o horário de exibição para garantir o máximo de engajamento.',
      ],
      blocos: [
        {
          title: 'Monitoramento em tempo real',
          text: 'Nossa equipe monitora e analisa os resultados em tempo real, o que permite ajustes rápidos e precisos para otimizar o retorno sobre o investimento.',
        },
        {
          title: 'Crescimento acessível e escalável',
          text: 'Aumente a visibilidade e as vendas da sua marca e construa relacionamentos sólidos com seus clientes.',
        },
      ],
      faq: [
        {
          q: 'Por que anunciar nas redes sociais?',
          a: 'Porque os anúncios patrocinados alcançam diretamente o seu público-alvo, com mensagem, formato e horário de exibição adaptados para gerar o máximo de engajamento.',
        },
        {
          q: 'Como os resultados são acompanhados?',
          a: 'A equipe da Making monitora e analisa os resultados em tempo real e faz ajustes rápidos para otimizar o retorno sobre o investimento.',
        },
      ],
      cta: 'Quero anunciar nas redes sociais',
    },
    {
      slug: 'inbound-marketing',
      name: 'Inbound Marketing',
      resumo: 'Atração de visitantes, conversão em leads e nutrição com automação até o momento da compra.',
      seoTitle: 'Inbound Marketing: mais leads e mais vendas | Making',
      seoDescription:
        'Projeto de inbound marketing completo: geração de tráfego, conteúdo, landing pages, gestão de leads, e-mail marketing e automação. Fale com a Making.',
      h1: 'Inbound marketing: atraia, converta e venda mais',
      intro: [
        'Inbound marketing é uma metodologia com estratégias para atrair o interesse das pessoas, reter sua atenção e convertê-las em oportunidades e clientes.',
        'O principal pilar é o conteúdo. Diferentemente do marketing convencional, no inbound (também conhecido como marketing de atração) é o cliente que procura a sua empresa: o conteúdo é distribuído em blogs, buscadores e redes sociais para ser encontrado. A partir da atração, inicia-se um relacionamento com conteúdo segmentado e estratégico, que nutre o contato até o momento da compra.',
      ],
      blocos: [
        {
          title: 'Como funciona',
          text: 'Criamos um projeto de inbound marketing com estratégias consistentes e com a finalidade de gerar resultados para o seu negócio. O projeto inclui:',
          items: [
            'Geração de tráfego no seu site',
            'Produção de conteúdo',
            'Gestão de mídia social',
            'Criação de landing pages',
            'Gerenciamento de leads',
            'Disparos de e-mail marketing',
          ],
        },
        {
          title: 'Ferramentas e automação',
          text: 'Utilizamos ferramentas que operacionalizam todas essas ações de forma ágil e integrada, automatizando etapas da atração à retenção de clientes: atração de visitantes, geração de leads, relacionamento pré e pós-venda, e-mail marketing, automação e análise de resultados e do retorno do investimento.',
        },
        {
          title: 'Funciona para o meu negócio?',
          text: 'O inbound marketing funciona para qualquer tipo de negócio. A ideia de se relacionar com o cliente antes de vender, mostrando conteúdo de qualidade que gera credibilidade, é viável e recomendada para qualquer segmento.',
        },
      ],
      faq: [
        {
          q: 'O que é inbound marketing?',
          a: 'É uma metodologia, também chamada de marketing de atração, que usa conteúdo para atrair o interesse das pessoas, reter sua atenção e convertê-las em oportunidades e clientes.',
        },
        {
          q: 'O que está incluído em um projeto de inbound marketing da Making?',
          a: 'Geração de tráfego no site, produção de conteúdo, gestão de mídia social, criação de landing pages, gerenciamento de leads e disparos de e-mail marketing.',
        },
        {
          q: 'Inbound marketing funciona para qualquer empresa?',
          a: 'Sim. Relacionar-se com o cliente antes de vender é viável e recomendado para qualquer segmento, de grandes comerciantes a mercados específicos.',
        },
      ],
      cta: 'Quero gerar mais leads',
    },
  ],
};

const prazoAssistencia =
  'Em até 24 horas após a coleta do equipamento, o cliente recebe o orçamento. Depois de aprovado, em no máximo 24 horas o equipamento estará pronto, podendo haver exceções.';

const infra: Area = {
  slug: 'hardware-e-infraestrutura',
  name: 'Hardware e Infraestrutura',
  resumo: 'Suporte e assistência técnica, redes, servidores, virtualização e venda de equipamentos e softwares.',
  seoTitle: "Suporte de TI, Redes e Servidores em Santa Bárbara d'Oeste | Making",
  seoDescription:
    'Projetos, implantação e manutenção de redes e servidores, assistência técnica para qualquer marca, virtualização e venda de equipamentos com suporte.',
  h1: 'Hardware e infraestrutura de TI para sua empresa não parar',
  intro: [
    'Profissionais especializados em projetos, implantação e manutenção de redes de computadores, altamente capacitados na prestação de assistência técnica para qualquer marca ou modelo de equipamentos e periféricos.',
  ],
  servicos: [
    {
      slug: 'suporte-manutencao-assistencia',
      name: 'Suporte, manutenção e assistência técnica',
      resumo: 'Assistência técnica em laboratório ou na sua empresa, com contratos de manutenção e equipamento reserva.',
      seoTitle: 'Suporte de TI, Manutenção e Assistência Técnica para Empresas | Making',
      seoDescription:
        'Assistência técnica para qualquer marca, em laboratório ou na sua empresa. Orçamento em até 24h, equipamento reserva e chamados urgentes em até 4 horas.',
      h1: 'Suporte, manutenção e assistência técnica em informática',
      intro: [
        'Computadores, impressoras, instalação e configuração de periféricos internos e externos, atualização de máquinas e manutenção preventiva e corretiva de equipamentos de missão crítica.',
        'Prestamos assistência técnica em nossos laboratórios ou no seu estabelecimento, para qualquer marca ou modelo de equipamentos e periféricos.',
        prazoAssistencia,
      ],
      blocos: [
        {
          title: 'Agendamento e visitas',
          text: 'Após agendada a visita técnica, um profissional é encaminhado ao local com data e hora marcadas para resolver o problema. Por este serviço é cobrada a hora técnica, cujo valor varia em função da distância.',
        },
        {
          title: 'Backup de equipamentos',
          text: 'Enquanto resolvemos o problema do seu equipamento (desktops, impressoras, monitores etc.), disponibilizamos outro como reserva.',
        },
        {
          title: 'Consultoria',
          text: 'Verificação e dimensionamento para a compra de equipamentos.',
        },
        {
          title: 'Redução de custos',
          text: 'Despesas são evitadas com equipamentos em perfeito estado de manutenção. Os valores da hora técnica em contrato são mais baixos que os do atendimento avulso.',
        },
        {
          title: 'Equipamentos sempre em dia',
          text: 'Produtividade, agilidade e qualidade garantidas, com equipamentos sob manutenção e conservação permanentes, atualizados ou reparados conforme a necessidade da sua empresa.',
        },
        {
          title: 'Atendimento 24 horas',
          items: [
            'Chamados de urgência atendidos em até 4 horas',
            'Primeiro contato de suporte pelo telefone',
            'Suporte remoto',
            'Técnicos certificados em Windows Server',
            'Chamados ou horas técnicas ilimitadas',
            'Inventário atualizado a cada seis meses',
            'Limpeza física nas estações a cada seis meses',
            'Organização do ambiente do servidor',
            'Reposição de peças a um custo mais baixo',
          ],
        },
      ],
      faq: [
        {
          q: 'A Making atende na minha empresa ou só no laboratório?',
          a: 'Nos dois formatos. A assistência técnica é prestada nos laboratórios da Making ou no seu estabelecimento, com visita agendada com data e hora marcadas.',
        },
        {
          q: 'Em quanto tempo recebo o orçamento do conserto?',
          a: prazoAssistencia,
        },
        {
          q: 'Fico sem computador enquanto o meu está em manutenção?',
          a: 'Não. Enquanto o seu equipamento é reparado, a Making disponibiliza outro como reserva.',
        },
        {
          q: 'Quais marcas a Making atende?',
          a: 'Os serviços de assistência técnica são realizados para qualquer marca ou modelo de equipamentos e periféricos.',
        },
      ],
      cta: 'Preciso de suporte técnico',
    },
    {
      slug: 'redes',
      name: 'Redes',
      resumo: 'Projetos, implantação e manutenção de redes, cabeamento estruturado, firewall e balanceamento de links.',
      seoTitle: 'Projeto e Manutenção de Redes de Computadores e Firewall | Making',
      seoDescription:
        'Cabeamento estruturado, racks, patch panels, firewall, balanceamento e failover de links de internet. Sua empresa conectada com alta disponibilidade.',
      h1: 'Projetos, implantação e manutenção de redes de computadores',
      intro: [
        'Infraestrutura completa de redes para empresas, do projeto à manutenção.',
      ],
      blocos: [
        {
          title: 'Infraestrutura de rede',
          items: [
            'Infraestrutura',
            'Cabeamento estruturado com utilização de racks',
            'Patch panels para dados e voz',
            'Dimensionamento de servidores',
          ],
        },
        {
          title: 'Balanceamento e failover de links de internet e firewall',
          text: 'Soluções de alta disponibilidade, balanceamento de links, failover WAN, firewalls e servidores, além de prevenção de intrusão e otimização de banda. O equipamento é configurado para que a empresa não fique sem internet e tenha a melhor performance de velocidade. Quando um dos links apresenta problema, o tráfego é direcionado automaticamente para o outro. Com os dois links funcionando, o equipamento faz o balanceamento de carga para aproveitar melhor toda a banda.',
        },
      ],
      faq: [
        {
          q: 'O que é failover de links de internet?',
          a: 'É a configuração em que, quando um dos links de acesso à internet apresenta problema, o tráfego é direcionado automaticamente para o outro link, para que a empresa não fique sem conexão.',
        },
        {
          q: 'O que é balanceamento de links?',
          a: 'Quando os dois links de internet estão funcionando, o equipamento distribui a carga entre eles para aproveitar melhor toda a banda de comunicação.',
        },
      ],
      cta: 'Quero um projeto de rede',
    },
    {
      slug: 'servidores',
      name: 'Servidores',
      resumo: 'Implantação, manutenção e gerenciamento de servidores Microsoft e open source, com service desk.',
      seoTitle: 'Implantação, Manutenção e Gerenciamento de Servidores | Making',
      seoDescription:
        'Implantação e gerenciamento de servidores Windows Server e Linux, com equipe de suporte e service desk para a sua empresa. Segurança e custo-benefício.',
      h1: 'Implantação, manutenção e gerenciamento de servidores',
      intro: [
        'Possuímos uma equipe de suporte que atende à operação de infraestrutura (servidores e rede) e aos usuários finais, com a implementação e operação de um serviço de service desk para a sua empresa.',
        'Prestamos assistência técnica em nossos laboratórios ou no seu estabelecimento, para qualquer marca ou modelo de equipamentos e periféricos.',
        prazoAssistencia,
      ],
      blocos: [
        {
          title: 'Por que contar com a Making',
          items: ['Relação custo-benefício', 'Segurança operacional', 'Assistência técnica'],
        },
        {
          title: 'Servidores Microsoft',
          items: ['Windows Server', 'Active Directory', 'Group Policy Manager', 'WSUS'],
        },
        {
          title: 'Servidores open source',
          items: ['Debian GNU/Linux', 'Outras distribuições'],
        },
      ],
      faq: [
        {
          q: 'A Making trabalha com servidores Windows e Linux?',
          a: 'Sim. A Making implanta e gerencia servidores Microsoft (Windows Server, Active Directory, Group Policy Manager e WSUS) e servidores open source, como Debian GNU/Linux e outras distribuições.',
        },
        {
          q: 'O que é o service desk oferecido pela Making?',
          a: 'É uma equipe de suporte que atende à operação de infraestrutura (servidores e rede) e aos usuários finais da sua empresa.',
        },
      ],
      cta: 'Quero falar sobre servidores',
    },
    {
      slug: 'virtualizacao',
      name: 'Virtualização',
      resumo: 'Virtualização de servidores e desktops com gerenciamento centralizado, backup simples e mais segurança.',
      seoTitle: 'Virtualização de Servidores e Desktops para Empresas | Making',
      seoDescription:
        'Virtualização de desktops e servidores: gerenciamento centralizado, backups facilitados, dados seguros no data center e novos desktops em minutos.',
      h1: 'Virtualização de servidores e desktops',
      intro: [
        'O conceito de virtualização de desktops é o mesmo empregado na virtualização de servidores: executar diversos sistemas operacionais em um único equipamento físico.',
        'Uma forma já bastante difundida é a virtualização de desktops por servidores de terminais, em que cada usuário conectado tem a sua sessão dentro de um mesmo sistema operacional.',
        'Hoje, as máquinas virtuais usadas para virtualizar servidores também são usadas para desktops. Nesse modelo, cada usuário tem um sistema operacional próprio, como se usasse um desktop comum. Isso elimina qualquer trauma de migração e traz uma série de benefícios.',
      ],
      blocos: [
        {
          title: 'Quais as vantagens',
          items: [
            'Gerenciamento centralizado',
            'Instalações simplificadas',
            'Facilidade para a execução de backups',
            'Suporte e manutenção simplificados',
            'Acesso controlado a dados sensíveis e à propriedade intelectual, mantidos seguros no data center da empresa',
            'Independência de hardware',
            'Disponibilização de novos desktops reduzida para alguns minutos',
            'Migração de desktops para novo hardware de forma transparente',
            'Maior disponibilidade e recuperação mais fácil de desktops',
            'Compatibilidade total com as aplicações',
          ],
        },
      ],
      faq: [
        {
          q: 'O que é virtualização?',
          a: 'É a execução de diversos sistemas operacionais em um único equipamento físico. O conceito vale tanto para servidores quanto para desktops.',
        },
        {
          q: 'Qual a diferença entre virtualização de desktops e serviço de terminais?',
          a: 'No serviço de terminais, cada usuário tem uma sessão dentro de um mesmo sistema operacional. Na virtualização de desktops com máquinas virtuais, cada usuário tem um sistema operacional próprio, como em um desktop comum.',
        },
      ],
      cta: 'Quero virtualizar minha empresa',
    },
    {
      slug: 'venda',
      name: 'Venda de equipamentos e softwares',
      resumo: 'Servidores, notebooks, desktops, impressoras, periféricos e softwares com instalação e suporte técnico.',
      seoTitle: 'Venda de Computadores, Servidores e Softwares com Instalação | Making',
      seoDescription:
        'Servidores, notebooks, desktops, impressoras, no-breaks, switches e softwares de backup e antivírus, com instalação, configuração e suporte técnico.',
      h1: 'Venda de equipamentos com instalação, configuração e suporte técnico',
      intro: [
        'A Making comercializa servidores, notebooks, desktops, impressoras, monitores e periféricos, como HDs, placas de vídeo, memórias, fontes, placas de rede, hubs, switches, no-breaks e acessórios.',
      ],
      blocos: [
        {
          title: 'Softwares utilitários',
          items: ['Backup', 'Antivírus', 'Gerenciamento de redes', 'Auditoria de hardware e software', 'Outros'],
        },
      ],
      faq: [
        {
          q: 'A Making instala e configura os equipamentos que vende?',
          a: 'Sim. A venda inclui instalação, configuração e suporte técnico.',
        },
        {
          q: 'Quais equipamentos a Making vende?',
          a: 'Servidores, notebooks, desktops, impressoras, monitores e periféricos, como HDs, placas de vídeo, memórias, fontes, placas de rede, hubs, switches, no-breaks e acessórios, além de softwares de backup, antivírus, gerenciamento de redes e auditoria.',
        },
      ],
      cta: 'Quero um orçamento de equipamentos',
    },
  ],
};

export const areas: Area[] = [marketing, infra];

export const sistemas = {
  slug: 'sistemas',
  name: 'Sistemas e Apps',
  resumo: 'Velosys: sistema de gestão (ERP) próprio para controlar vendas, estoque, produção, financeiro e fiscal.',
  seoTitle: 'Velosys: Sistema de Gestão ERP para Indústria, Comércio e Serviços | Making',
  seoDescription:
    'Velosys é o ERP da Making: vendas, compras, estoque, PCP, financeiro, fiscal (NF-e, NFS-e, SAT, SPED), BI e app mobile. Na nuvem ou local. Conheça.',
  h1: 'Acelere o seu negócio com o Velosys',
  intro:
    'Conheça o Velosys: sistema desenvolvido pela Making para gerenciar e possibilitar o controle total dos seus negócios.',
  segmentos: ['Indústria', 'Comércio', 'Serviços', 'Distribuidora', 'Agronegócio', 'Terceiro Setor'],
  ferramentas: [
    'Multiempresas',
    'Segurança',
    'Multiplataforma',
    'CNAB / WebService / PIX',
    'QR Code',
    'Tarefas',
    'WhatsApp',
    'Nota Fiscal Eletrônica (NF-e)',
    'Nota Fiscal de Serviço Eletrônica (NFS-e)',
    'Manifesto Eletrônico (MDF-e)',
    'SPED Digital',
    'Integração Sintegra',
    'SAT Fiscal',
    'Nota Fiscal de Consumidor Eletrônica (NFC-e)',
    'Conhecimento de Transporte (CT-e)',
    'CRM',
  ],
  diferenciais: [
    'Velocidade',
    'Segurança',
    'Interface padronizada',
    'Melhoria contínua (DNA Making)',
    'Atendimento direto e diferenciado',
    'Multiplataforma com desenvolvimento nativo (Windows, macOS, Android e iOS)',
  ],
  hospedagem: [
    {
      title: 'Hospedagem na nuvem',
      items: [
        'Acesso remoto de qualquer lugar',
        'Backup automático realizado pelo serviço',
        'Menor custo com investimento e manutenção de hardware',
        'Backup manual periódico para evitar surpresas',
      ],
    },
    {
      title: 'Hospedagem local',
      items: [
        'Dispensa uso de internet',
        'Velocidade garantida (boa infraestrutura)',
        'Manutenção local e atendimento direto',
        'Acesso remoto mediante configuração',
        'Backup local, com controle automático ou manual',
        'Gravação em HD, storage ou pen drive',
        'Aviso constante de efetivação da programação de backups',
      ],
    },
  ],
  telas: [
    { img: '/img/velosys/bi-vendas.webp', alt: 'Tela de BI de vendas do Velosys' },
    { img: '/img/velosys/bi-financeiro.webp', alt: 'Tela de BI financeiro do Velosys' },
    { img: '/img/velosys/bi-vendas-regiao.webp', alt: 'Tela de BI de vendas por região do Velosys' },
    { img: '/img/velosys/dre-plano-de-contas.webp', alt: 'Tela de DRE por plano de contas do Velosys' },
    { img: '/img/velosys/cadastro-item.webp', alt: 'Tela de cadastro de item do Velosys' },
    { img: '/img/velosys/mobile-metas.webp', alt: 'Aplicativo Velosys no celular: metas de vendas' },
  ],
  faq: [
    {
      q: 'O que é o Velosys?',
      a: 'É o sistema de gestão desenvolvido pela Making para gerenciar e possibilitar o controle total do negócio, com módulos de vendas, compras, estoque, produção (PCP), qualidade, RH, financeiro, fiscal, BI e aplicativo mobile.',
    },
    {
      q: 'Para quais segmentos o Velosys é indicado?',
      a: 'Indústria, comércio, serviços, distribuidoras, agronegócio e terceiro setor.',
    },
    {
      q: 'O Velosys funciona na nuvem ou instalado na empresa?',
      a: 'Nos dois formatos. Na nuvem, com acesso remoto de qualquer lugar e backup automático. Local, sem depender de internet, com manutenção e backup locais.',
    },
    {
      q: 'O Velosys emite nota fiscal?',
      a: 'Sim. Emite NF-e, NFS-e, NFC-e, SAT Fiscal, MDF-e e CT-e, além de gerar arquivos para SPED e integrar com Sintegra e CNAB.',
    },
  ],
};

export function findServico(areaSlug: string, servicoSlug: string) {
  const area = areas.find((a) => a.slug === areaSlug);
  const servico = area?.servicos.find((s) => s.slug === servicoSlug);
  return area && servico ? { area, servico } : undefined;
}
