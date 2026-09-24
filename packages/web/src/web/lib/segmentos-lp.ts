/**
 * Landing pages por segmento (rota /segmentos/:slug).
 *
 * REGRAS
 * - Todo productSlug aqui existe de fato em data/content.json. Não inventar.
 * - Nenhum número de resultado de cliente. Capacidade e ganho só aparecem
 *   como faixa técnica genérica ou como simulação rotulada, nunca como case.
 * - Foto: só imagem real do acervo em /img/produtos.
 */

export type SegmentLp = {
  slug: string;
  /** nome curto, usado em menu e breadcrumb */
  name: string;
  /** título da página */
  title: string;
  eyebrow: string;
  intro: string;
  /** foto de capa, do acervo real */
  hero: string;
  /** cor de acento do segmento */
  color: string;
  /** as dores concretas que o comprador desse setor tem */
  pains: { title: string; text: string }[];
  /** etapas do fluxo do material no setor */
  chain: { step: string; text: string }[];
  /** produtos indicados, todos reais */
  products: string[];
  /** perguntas típicas do setor */
  faq: { q: string; a: string }[];
  /** termo que a pessoa desse setor digita no Google */
  searchTerms: string[];
};

export const segmentLps: SegmentLp[] = [
  {
    slug: "fertilizantes-e-insumos",
    name: "Fertilizantes e insumos",
    title: "Movimentação para fertilizantes, insumos e corretivos",
    eyebrow: "Segmento",
    intro:
      "Fertilizante é abrasivo, higroscópico e pesado. O equipamento que atende esse material precisa de correia e revestimento escolhidos para não empastar, estrutura que aguenta carga concentrada e acesso fácil para limpeza entre produtos diferentes.",
    hero: "/img/produtos/esteira-transportadora-para-granel/1.webp",
    color: "#b45309",
    pains: [
      {
        title: "Material que empasta e corrói",
        text: "Ureia e mistura NPK atacam estrutura comum e grudam na correia errada. A escolha de correia e de tratamento da estrutura muda a vida útil do equipamento.",
      },
      {
        title: "Carga e descarga de caminhão no braço",
        text: "Descarregar saco de 50kg na rampa consome equipe inteira e gera afastamento. Equipamento móvel de pátio troca a fila de gente por um operador.",
      },
      {
        title: "Troca de produto exige limpeza",
        text: "Quem movimenta mais de uma formulação precisa limpar rápido para não contaminar o lote seguinte. Isso é decisão de projeto, não de operação.",
      },
      {
        title: "Ensaque com sacaria fechada errada",
        text: "Costura mal feita rompe no transporte e vira devolução. Máquina de costura e linha corretas resolvem no fim da linha.",
      },
    ],
    chain: [
      { step: "Recebimento", text: "Descarga de caminhão e moega com esteira móvel ou de granel." },
      { step: "Elevação", text: "Ganho de altura para silo ou balança com elevador de canecas." },
      { step: "Transferência", text: "Deslocamento entre setores com rosca fechada, sem poeira." },
      { step: "Ensaque", text: "Enchimento e costura da sacaria no fim da linha." },
      { step: "Expedição", text: "Sacaria costurada seguindo para o caminhão em esteira própria." },
    ],
    products: [
      "esteira-transportadora-para-granel",
      "rosca-transportadora",
      "elevador-de-canecas",
      "esteira-transportadora-para-sacaria",
      "maquina-de-costurar-sacos-gk-26",
      "calha-transportadora",
    ],
    faq: [
      {
        q: "Qual correia usar para fertilizante?",
        a: "Depende da formulação e da inclinação. Material que tende a escorregar pede correia taliscada ou perfil em V; material mais seco e de granulometria maior aceita correia lisa com sanfona lateral. A engenharia define a partir do produto que você movimenta.",
      },
      {
        q: "O equipamento aguenta produto corrosivo?",
        a: "A estrutura e o tratamento são especificados conforme o produto. Informe a formulação no pedido de cotação para que o projeto já considere isso.",
      },
      {
        q: "Dá para movimentar mais de uma formulação no mesmo equipamento?",
        a: "Dá, e nesse caso o projeto prevê acesso de limpeza e, quando necessário, sistema fechado para reduzir residual entre lotes.",
      },
    ],
    searchTerms: [
      "esteira transportadora para fertilizante",
      "rosca transportadora para ureia",
      "elevador de canecas para fertilizante",
      "equipamento para ensaque de fertilizante",
    ],
  },
  {
    slug: "reciclagem-e-residuos",
    name: "Reciclagem e resíduos",
    title: "Esteiras de triagem para reciclagem e resíduos",
    eyebrow: "Segmento",
    intro:
      "Em triagem, o equipamento não é só transporte: é o posto de trabalho. Altura, largura e velocidade da correia definem quanto a equipe consegue separar por hora e se ela termina o turno inteira.",
    hero: "/img/produtos/esteira-transportadora-para-reciclagem-triagem/1.webp",
    color: "#0f766e",
    pains: [
      {
        title: "Velocidade errada derruba a triagem",
        text: "Correia rápida demais faz material passar sem separação; lenta demais forma fila. O ajuste de velocidade precisa acompanhar o ritmo real da equipe.",
      },
      {
        title: "Altura que machuca a equipe",
        text: "Esteira na altura errada gera dor lombar e afastamento em operação que é intensiva em mão de obra. A altura de trabalho é definida no projeto.",
      },
      {
        title: "Material heterogêneo e cortante",
        text: "Vidro, metal e plástico misturados exigem correia e proteção adequadas para não rasgar a lona a cada semana.",
      },
      {
        title: "Cooperativa com espaço apertado",
        text: "Galpão de cooperativa raramente é retangular e livre. Layout com curva ou mudança de nível resolve sem obra.",
      },
    ],
    chain: [
      { step: "Alimentação", text: "Entrada do material bruto na linha, em ritmo controlado." },
      { step: "Triagem", text: "Correia na altura de trabalho, com equipe nas duas laterais." },
      { step: "Rejeito", text: "Saída do que não é aproveitável para a caçamba." },
      { step: "Prensagem", text: "Material separado seguindo para a prensa em esteira dedicada." },
      { step: "Expedição", text: "Fardo pronto sendo carregado no caminhão." },
    ],
    products: [
      "esteira-transportadora-para-reciclagem-triagem",
      "esteira-transportadora-horizontal",
      "esteira-transportadora-articulada",
      "esteira-transportadora-para-granel",
      "esteira-transportadora-dalla",
    ],
    faq: [
      {
        q: "A velocidade da esteira de triagem é ajustável?",
        a: "Sim. A motorização pode ser especificada com variação de velocidade para acompanhar o ritmo da equipe e o tipo de material do dia.",
      },
      {
        q: "Qual a altura ideal para a esteira de triagem?",
        a: "A altura é definida pela estatura média da equipe e pela postura de trabalho, em pé ou sentada. Isso entra no dimensionamento antes da fabricação.",
      },
      {
        q: "Vocês fabricam para cooperativa com galpão pequeno?",
        a: "Sim. Layout com curva, mudança de nível ou comprimento sob medida é feito conforme a planta do galpão. Mande a medida e a foto do espaço na cotação.",
      },
    ],
    searchTerms: [
      "esteira de triagem para reciclagem",
      "esteira para cooperativa de reciclagem",
      "mesa de triagem de resíduos",
      "esteira transportadora para lixo reciclável",
    ],
  },
  {
    slug: "construcao-e-mineracao",
    name: "Construção e mineração",
    title: "Transporte de areia, brita e agregados",
    eyebrow: "Segmento",
    intro:
      "Agregado é o material mais severo que existe para um transportador: abrasivo, com carga de impacto na alimentação e volume alto por hora. O que segura isso é estrutura reforçada e perfil de correia que aumenta o volume transportado por metro.",
    hero: "/img/produtos/esteira-transportadora-para-granel/10.webp",
    color: "#a16207",
    pains: [
      {
        title: "Abrasão que come a correia",
        text: "Brita e areia desgastam correia e rolete rápido quando a especificação é genérica. A escolha certa de lona e revestimento muda o intervalo de troca.",
      },
      {
        title: "Volume por metro insuficiente",
        text: "Correia plana desperdiça capacidade em material granular. O perfil em V aumenta a seção de carga sem alargar o equipamento.",
      },
      {
        title: "Impacto na zona de alimentação",
        text: "Queda de material concentrada em um ponto arrebenta a correia e desalinha a estrutura. Isso é resolvido no projeto da moega.",
      },
      {
        title: "Finos e classificação",
        text: "Separar finos antes da etapa seguinte evita retrabalho e melhora o produto final.",
      },
    ],
    chain: [
      { step: "Alimentação", text: "Moega recebendo o material com zona de impacto protegida." },
      { step: "Transporte", text: "Correia em V ganhando volume por metro." },
      { step: "Classificação", text: "Separação de finos antes do próximo estágio." },
      { step: "Elevação", text: "Ganho de altura para silo ou baia de estocagem." },
      { step: "Carregamento", text: "Descarga no caminhão com equipamento móvel de pátio." },
    ],
    products: [
      "esteira-transportadora-para-granel",
      "peneira-para-carvao",
      "calha-transportadora",
      "esteira-transportadora-dalla",
      "esteira-transportadora-horizontal",
    ],
    faq: [
      {
        q: "Por que usar esteira em V para agregado?",
        a: "O perfil em V forma uma seção de carga maior que a correia plana na mesma largura, o que aumenta o volume transportado por metro e reduz derrame nas laterais.",
      },
      {
        q: "Qual a inclinação máxima para areia e brita?",
        a: "Depende da granulometria e da umidade do material. Acima de determinada inclinação o material escorrega e é preciso correia taliscada. A calculadora de esteira do site dá a estimativa e a engenharia confirma.",
      },
      {
        q: "A estrutura aguenta operação a céu aberto?",
        a: "A especificação de estrutura e proteção é definida conforme a exposição. Informe se a operação é externa no pedido de cotação.",
      },
    ],
    searchTerms: [
      "esteira transportadora para brita",
      "esteira transportadora para areia",
      "transportador de correia para agregados",
      "esteira em V para mineração",
    ],
  },
  {
    slug: "alimentos-e-racao",
    name: "Alimentos e ração",
    title: "Linhas para alimentos, ração e produtos embalados",
    eyebrow: "Segmento",
    intro:
      "Aqui a exigência muda de natureza: o que pesa é material de contato adequado, facilidade de higienização e transporte suave o suficiente para não danificar o produto. Vale para linha de montagem de cesta básica, hortifrúti, ração e farelo.",
    hero: "/img/produtos/esteira-transportadora-para-cesta-basica/1.webp",
    color: "#4d7c0f",
    pains: [
      {
        title: "Correia que não pode ser qualquer uma",
        text: "Contato com alimento pede correia adequada e fácil de limpar. Correia comum vira problema sanitário e de fiscalização.",
      },
      {
        title: "Produto que amassa e machuca",
        text: "Fruta, legume e embalagem leve exigem transporte suave, sem degrau brusco e sem queda livre desnecessária.",
      },
      {
        title: "Higienização no fim do turno",
        text: "Se limpar é difícil, a limpeza não acontece. Acesso e drenagem entram no projeto, não depois.",
      },
      {
        title: "Montagem de kit no braço",
        text: "Montar cesta básica ou kit promocional na mesa gera erro de composição e ritmo irregular. A linha organiza o fluxo.",
      },
    ],
    chain: [
      { step: "Recebimento", text: "Entrada de insumo ou matéria-prima na linha." },
      { step: "Transporte suave", text: "Deslocamento sem impacto para produto sensível." },
      { step: "Montagem", text: "Composição de kit ou cesta com equipe nas laterais." },
      { step: "Elevação", text: "Ganho de altura para silo de ração ou farelo." },
      { step: "Expedição", text: "Caixa e pacote seguindo para o carregamento." },
    ],
    products: [
      "esteira-transportadora-para-cesta-basica",
      "esteira-para-transporte-de-frutas-e-legumes",
      "esteira-transportadora-de-caixas",
      "rosca-transportadora",
      "elevador-de-canecas",
      "esteira-transportadora-em-v-para-cama-de-frango-aviario",
    ],
    faq: [
      {
        q: "A correia é adequada para contato com alimento?",
        a: "Existe especificação de correia própria para contato com alimento, incluindo opção atóxica e de limpeza fácil. O tipo é definido conforme o produto e a exigência sanitária da sua operação.",
      },
      {
        q: "Dá para lavar o equipamento?",
        a: "O projeto pode prever acesso para higienização e estrutura adequada a ambiente úmido. Informe a rotina de limpeza na cotação para que isso entre no dimensionamento.",
      },
      {
        q: "Serve para montagem de cesta básica?",
        a: "Sim, é uma das aplicações da linha. A esteira organiza o fluxo com a equipe posicionada nas laterais e o kit sendo composto ao longo do percurso.",
      },
    ],
    searchTerms: [
      "esteira transportadora para alimentos",
      "esteira para montagem de cesta básica",
      "esteira para frutas e legumes",
      "rosca transportadora para ração",
    ],
  },
  {
    slug: "logistica-e-distribuicao",
    name: "Logística e distribuição",
    title: "Carga, descarga e movimentação em centro de distribuição",
    eyebrow: "Segmento",
    intro:
      "Em logística o gargalo tem endereço: a doca. Carga e descarga manual de caminhão é o ponto que trava o giro, gasta equipe e gera afastamento. Equipamento móvel de pátio e linha interna resolvem esse trecho.",
    hero: "/img/produtos/esteira-transportadora-dalla/1.webp",
    color: "#103d94",
    pains: [
      {
        title: "Caminhão parado na doca",
        text: "Descarga no braço prende veículo, motorista e equipe. Cada hora de doca ocupada é giro que não acontece.",
      },
      {
        title: "Equipe carregando peso",
        text: "Movimentação manual repetitiva de caixa e sacaria gera afastamento e rotatividade, que custam mais que o equipamento.",
      },
      {
        title: "Layout com curva e desnível",
        text: "Galpão real tem coluna, curva e mudança de nível. Equipamento articulado acompanha o traçado disponível.",
      },
      {
        title: "Movimentação interna sem organização",
        text: "Carrinho improvisado e transporte solto entre setores geram avaria e perda de rastreio.",
      },
    ],
    chain: [
      { step: "Doca", text: "Carga e descarga de caminhão com equipamento móvel de pátio." },
      { step: "Recebimento", text: "Caixa e pacote entrando na linha interna." },
      { step: "Percurso interno", text: "Traçado com curva e mudança de nível conforme o galpão." },
      { step: "Elevação", text: "Sacaria e volume ganhando altura entre pavimentos." },
      { step: "Separação", text: "Apoio à movimentação interna entre estações." },
    ],
    products: [
      "esteira-transportadora-dalla",
      "esteira-transportadora-de-caixas",
      "esteira-transportadora-articulada",
      "elevador-de-sacaria",
      "cartrans-carrinho-transportador",
      "esteira-transportadora-horizontal",
    ],
    faq: [
      {
        q: "Existe equipamento móvel para descarga de caminhão?",
        a: "Sim. A linha inclui equipamento de pátio pensado para carga e descarga, deslocável entre docas em vez de fixo em um único ponto.",
      },
      {
        q: "A esteira acompanha curva dentro do galpão?",
        a: "A linha articulada foi feita para traçado com curva e mudança de nível, o que evita obra para adequar o galpão ao equipamento.",
      },
      {
        q: "Qual o ganho real de trocar descarga manual por esteira?",
        a: "O ganho depende do volume por doca, do número de operadores e do custo hora da sua operação. O site tem uma calculadora de retorno onde você entra com os seus números e vê a estimativa, com as premissas à vista.",
      },
    ],
    searchTerms: [
      "esteira para descarga de caminhão",
      "esteira transportadora para centro de distribuição",
      "transportador de caixas para galpão",
      "esteira articulada para logística",
    ],
  },
  {
    slug: "metalurgico",
    name: "Metalúrgico",
    title: "Esteiras para peças e linhas da indústria metalúrgica",
    eyebrow: "Segmento",
    intro:
      "Peça metálica é pesada, pode vir com óleo e aresta viva e precisa passar de uma operação para a outra sem parar a linha. O transportador certo é dimensionado pelo peso por metro, pelo tipo de peça e pelo espaço entre as máquinas.",
    hero: "/img/produtos/esteira-transportadora-horizontal/2.webp",
    color: "#c2410c",
    pains: [
      {
        title: "Peça pesada carregada no braço",
        text: "Levar peça usinada ou estampada de uma máquina para a outra no braço cansa a equipe, gera afastamento e ainda marca a peça. Transportador entre operações tira esse vaivém.",
      },
      {
        title: "Óleo e aresta que acabam com a correia",
        text: "Correia comum não aguenta fluido de corte nem canto vivo. Dependendo da peça, o certo é correia específica ou transportador de roletes, e isso se define no projeto.",
      },
      {
        title: "Pouco espaço entre as máquinas",
        text: "Linha montada ao longo dos anos raramente tem corredor reto. Esteira com curva, articulação ou mudança de nível encaixa onde a reta não cabe.",
      },
      {
        title: "Expedição que vira gargalo",
        text: "Caixa de peça pronta empilhada no chão esperando o carregamento atrasa o caminhão. Esteira até a doca mantém o fluxo do fim de linha.",
      },
    ],
    chain: [
      { step: "Recebimento", text: "Chegada de matéria-prima e componentes para o estoque." },
      { step: "Entre operações", text: "Peça seguindo da usinagem, estampagem ou solda para a próxima etapa." },
      { step: "Inspeção", text: "Posto de conferência e acabamento na altura certa para a equipe." },
      { step: "Embalagem", text: "Peça pronta indo para a caixa ou o palete." },
      { step: "Expedição", text: "Caixas seguindo até a doca e o caminhão." },
    ],
    products: [
      "esteira-transportadora-horizontal",
      "esteira-transportadora-articulada",
      "esteira-transportadora-de-caixas",
      "esteira-transportadora-dalla",
      "rosca-transportadora",
    ],
    faq: [
      {
        q: "A esteira aguenta peça pesada?",
        a: "Aguenta, desde que seja dimensionada para isso. A estrutura, os roletes ou a correia e o motor são definidos pelo peso por metro e pelo ritmo da linha. Informe o peso da peça e quantas passam por hora.",
      },
      {
        q: "O que é melhor: correia ou roletes?",
        a: "Peça de base plana e caixa costumam ir bem em roletes. Peça pequena, irregular ou com óleo pede correia específica. A engenharia indica a partir de uma foto ou do desenho da peça.",
      },
      {
        q: "Dá para transportar cavaco ou limalha?",
        a: "Depende do tipo e da quantidade. É um caso de projeto, então mande a descrição do material para a engenharia avaliar a rosca ou o transportador certo.",
      },
    ],
    searchTerms: [
      "esteira transportadora para peças metálicas",
      "transportador de roletes para indústria",
      "esteira para linha de usinagem",
      "esteira para estamparia",
    ],
  },
  {
    slug: "farmaceutico",
    name: "Farmacêutico",
    title: "Esteiras para embalagem e expedição farmacêutica",
    eyebrow: "Segmento",
    intro:
      "Na indústria e na distribuição farmacêutica, o que mais se movimenta é caixa: saindo da embalagem, passando pela conferência e seguindo para a expedição. O transportador precisa ser fácil de limpar, ter a altura certa para a equipe e caber na área disponível.",
    hero: "/img/produtos/esteira-transportadora-de-caixas/2.webp",
    color: "#0e7490",
    pains: [
      {
        title: "Caixa carregada no braço no fim da linha",
        text: "Depois da embalagem, alguém leva caixa por caixa até o palete. É o trabalho repetitivo que mais cansa e mais afasta. Esteira no fim de linha resolve.",
      },
      {
        title: "Conferência em posto improvisado",
        text: "Conferir pedido em mesa baixa ou no chão gera erro e dor nas costas. Esteira com altura pensada para a equipe vira um posto de conferência de verdade.",
      },
      {
        title: "Área que exige limpeza fácil",
        text: "Superfície com canto que acumula pó não serve para área controlada. Estrutura e acabamento, inclusive em inox, são definidos no projeto conforme a área.",
      },
      {
        title: "Separação de pedidos lenta no CD",
        text: "Distribuidora que separa muitos pedidos pequenos perde tempo andando com caixa. Transporte contínuo entre separação, conferência e expedição encurta o caminho.",
      },
    ],
    chain: [
      { step: "Embalagem", text: "Produto embalado saindo da linha em caixa." },
      { step: "Conferência", text: "Posto com altura certa para conferir o pedido." },
      { step: "Paletização", text: "Caixas chegando ao palete sem carregar." },
      { step: "Expedição", text: "Carga seguindo até a doca e o caminhão." },
      { step: "Distribuição", text: "No CD, transporte entre separação e expedição." },
    ],
    products: [
      "esteira-transportadora-de-caixas",
      "esteira-transportadora-horizontal",
      "esteira-transportadora-articulada",
      "esteira-transportadora-para-cesta-basica",
      "esteira-transportadora-dalla",
    ],
    faq: [
      {
        q: "Vocês fazem esteira em inox?",
        a: "Fazem. A Demakine já entregou equipamentos em inox sanitário em projetos especiais. Material e acabamento são definidos conforme a área onde a esteira vai trabalhar.",
      },
      {
        q: "A esteira se encaixa na linha de embalagem que já existe?",
        a: "É feita sob medida para isso: altura, largura e comprimento seguem a sua linha. Mande as medidas ou uma foto do local.",
      },
      {
        q: "Serve para centro de distribuição de medicamentos?",
        a: "Serve. Esteira de caixas e esteira articulada levam o volume entre separação, conferência e expedição e reduzem o vaivém da equipe.",
      },
    ],
    searchTerms: [
      "esteira transportadora para indústria farmacêutica",
      "esteira para expedição de caixas",
      "esteira transportadora em inox",
      "transportador para distribuidora de medicamentos",
    ],
  },
  {
    slug: "plastico-e-embalagens",
    name: "Plástico e embalagens",
    title: "Resina, peças e embalagens na indústria do plástico",
    eyebrow: "Segmento",
    intro:
      "Na indústria do plástico, o material chega em saco de resina, entra na máquina, sai como peça e segue embalado. Cada passagem feita no braço custa tempo e gente. Rosca e esteira certas ligam essas etapas.",
    hero: "/img/produtos/rosca-transportadora/1.webp",
    color: "#7c3aed",
    pains: [
      {
        title: "Saco de resina erguido até o funil",
        text: "Abastecer injetora ou extrusora erguendo saco de 25 kg até o funil é esforço repetido o turno inteiro. Rosca transportadora leva o granulado até a máquina.",
      },
      {
        title: "Peça acumulando na saída da máquina",
        text: "Peça caindo direto na caixa ao pé da injetora vira gargalo e amassa. Esteira na saída leva a peça para resfriar, conferir ou embalar.",
      },
      {
        title: "Moído voltando ao processo",
        text: "O material moído que volta para a mistura também precisa de transporte. Rosca ou calha fechada evitam derramar e sujar o chão.",
      },
      {
        title: "Fardo e caixa parados na expedição",
        text: "Embalagem pronta empilhada no chão esperando o caminhão ocupa espaço e atrasa a carga. Esteira até a doca mantém o fluxo.",
      },
    ],
    chain: [
      { step: "Recebimento", text: "Resina em saco ou big bag chegando ao estoque." },
      { step: "Abastecimento", text: "Rosca levando o granulado até a máquina." },
      { step: "Saída da peça", text: "Esteira recebendo a peça da injetora ou da extrusora." },
      { step: "Embalagem", text: "Peça seguindo para caixa, saco ou fardo." },
      { step: "Expedição", text: "Carga pronta indo até o caminhão." },
    ],
    products: [
      "rosca-transportadora",
      "calha-transportadora",
      "esteira-transportadora-horizontal",
      "esteira-transportadora-articulada",
      "esteira-transportadora-de-caixas",
      "elevador-de-canecas",
    ],
    faq: [
      {
        q: "A rosca serve para resina granulada?",
        a: "Serve. A rosca transportadora é usada no transporte contínuo de resina plástica granulada, e o diâmetro e o comprimento são definidos pela quantidade que a máquina consome.",
      },
      {
        q: "Dá para colocar esteira na saída da injetora?",
        a: "Dá. Altura, largura e velocidade são ajustadas à máquina e à peça. Mande o modelo da injetora ou uma foto do local.",
      },
      {
        q: "E material em pó ou moído?",
        a: "Depende da granulometria e de quanto o material solta pó. Nesses casos a engenharia avalia rosca fechada ou calha para evitar sujeira.",
      },
    ],
    searchTerms: [
      "rosca transportadora para resina plástica",
      "esteira para saída de injetora",
      "transportador para indústria do plástico",
      "alimentador de resina para extrusora",
    ],
  },
];

export function getSegmentLp(slug: string) {
  return segmentLps.find((s) => s.slug === slug);
}
