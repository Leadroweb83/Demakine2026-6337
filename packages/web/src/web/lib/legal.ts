/**
 * Textos legais do site (LGPD).
 *
 * ATENÇÃO JURÍDICA
 * Este conteúdo foi escrito a partir do que o site realmente faz hoje:
 * formulário de lead gravado em banco, newsletter, upload de foto de peça e
 * analytics. Não é parecer jurídico. Antes de publicar, o cliente deve mandar
 * um advogado revisar e preencher os pontos marcados como PENDENTE.
 *
 * PENDENTE (precisa do cliente):
 * - CNPJ oficial (site.cnpj está vazio de propósito)
 * - nome e e-mail do encarregado de dados (DPO) exigido pelo art. 41 da LGPD
 */

export const legalUpdatedAt = "2 de setembro de 2026";

/** E-mail usado para pedidos de titular enquanto não há DPO nomeado. */
export const dpoEmail = "vendas@demakine.com.br";

export type LegalBlock =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][] };

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};

/* ------------------------------------------------------- política de privacidade */

export const privacySections: LegalSection[] = [
  {
    id: "quem-somos",
    title: "1. Quem é o controlador dos seus dados",
    blocks: [
      {
        kind: "p",
        text: "A Demakine Equipamentos Agroindustriais, com sede na Rua Silvino del Pietro, 212, Jd. Nova Limeira, Limeira/SP, é a controladora dos dados pessoais coletados neste site, nos termos da Lei 13.709/2018 (LGPD).",
      },
      {
        kind: "p",
        text: "Para qualquer assunto relacionado a dados pessoais, incluindo os pedidos previstos no artigo 18 da LGPD, o contato é vendas@demakine.com.br ou (19) 3033-9397.",
      },
    ],
  },
  {
    id: "dados-coletados",
    title: "2. Quais dados coletamos e por quê",
    blocks: [
      {
        kind: "p",
        text: "Coletamos apenas o que é necessário para responder a um pedido de orçamento, prestar assistência técnica e vender pela loja. Não vendemos, alugamos nem cedemos seus dados para terceiros com finalidade comercial.",
      },
      {
        kind: "table",
        head: ["O que coletamos", "Quando", "Para que serve", "Base legal"],
        rows: [
          [
            "Nome, telefone, e-mail, empresa e cidade",
            "Ao enviar um formulário de orçamento ou contato",
            "Retornar o contato, montar a cotação e registrar o atendimento",
            "Execução de contrato e legítimo interesse",
          ],
          [
            "Produto de interesse e mensagem",
            "No mesmo formulário",
            "Dimensionar o equipamento certo antes de responder",
            "Execução de contrato",
          ],
          [
            "E-mail da newsletter",
            "Ao assinar no rodapé",
            "Enviar conteúdo técnico, com descadastro em todo envio",
            "Consentimento",
          ],
          [
            "Foto da peça e número de série",
            "Ao usar a identificação de peça por foto",
            "Identificar o componente correto para reposição",
            "Execução de contrato",
          ],
          [
            "Dados de navegação e páginas vistas",
            "Durante a visita",
            "Medir audiência e entender quais produtos geram procura",
            "Legítimo interesse, com consentimento para cookies não essenciais",
          ],
        ],
      },
      {
        kind: "p",
        text: "Não coletamos dados sensíveis, não fazemos decisão automatizada de perfil e não direcionamos o site a menores de 18 anos.",
      },
    ],
  },
  {
    id: "cookies",
    title: "3. Cookies",
    blocks: [
      {
        kind: "p",
        text: "Usamos duas categorias de cookies. Os essenciais mantêm o site funcionando, guardam sua escolha de consentimento e sustentam a área administrativa. Eles não podem ser desativados porque sem eles o site não opera.",
      },
      {
        kind: "p",
        text: "Os cookies de medição e anúncios são do Google (Google Tag Manager, Google Analytics e Google Ads). Servem para entender quais páginas e produtos são mais procurados e para medir o resultado das nossas campanhas, inclusive quando alguém pede orçamento pelo site ou pelo WhatsApp. Eles só são ativados depois que você aceita no banner, e você pode mudar de ideia a qualquer momento pelo link \"Preferências de cookies\", no rodapé, ou apagando os cookies do navegador.",
      },
    ],
  },
  {
    id: "compartilhamento",
    title: "4. Com quem compartilhamos",
    blocks: [
      {
        kind: "p",
        text: "Compartilhamos dados apenas com operadores necessários para o site funcionar e para o pedido chegar até você:",
      },
      {
        kind: "ul",
        items: [
          "Provedor de hospedagem e banco de dados, que armazena os registros do site",
          "Serviço de armazenamento de arquivos, quando você envia foto de peça",
          "Google, para medição de audiência e de campanhas, só com o seu aceite nos cookies",
          "Transportadora, quando há entrega de equipamento ou peça",
          "Autoridades públicas, quando houver obrigação legal ou determinação judicial",
        ],
      },
      {
        kind: "p",
        text: "Se algum desses operadores estiver fora do Brasil, a transferência internacional segue as garantias do capítulo V da LGPD.",
      },
    ],
  },
  {
    id: "prazo",
    title: "5. Por quanto tempo guardamos",
    blocks: [
      {
        kind: "ul",
        items: [
          "Dados de orçamento e atendimento: enquanto durar a relação comercial e pelo prazo de guarda fiscal e prescricional aplicável depois dela",
          "E-mail da newsletter: até você pedir o descadastro",
          "Foto de peça enviada para identificação: pelo tempo necessário ao atendimento e ao histórico de reposição do equipamento",
          "Registros de navegação: pelo prazo do artigo 15 do Marco Civil da Internet",
        ],
      },
    ],
  },
  {
    id: "direitos",
    title: "6. Seus direitos como titular",
    blocks: [
      {
        kind: "p",
        text: "A LGPD garante que você pode, a qualquer momento, pedir:",
      },
      {
        kind: "ul",
        items: [
          "Confirmação de que tratamos seus dados e acesso a eles",
          "Correção de dado incompleto, inexato ou desatualizado",
          "Anonimização, bloqueio ou eliminação de dado desnecessário ou excessivo",
          "Portabilidade a outro fornecedor, conforme regulamentação da ANPD",
          "Eliminação dos dados tratados com base no seu consentimento",
          "Informação sobre com quem compartilhamos seus dados",
          "Revogação do consentimento",
        ],
      },
      {
        kind: "p",
        text: "Basta escrever para vendas@demakine.com.br com o pedido. Respondemos no prazo legal e podemos pedir uma confirmação de identidade antes, para não entregar dado de uma pessoa a outra.",
      },
    ],
  },
  {
    id: "seguranca",
    title: "7. Segurança",
    blocks: [
      {
        kind: "p",
        text: "O site trafega em HTTPS, a área administrativa é protegida por autenticação e o acesso aos registros de lead é restrito à equipe comercial. Nenhum sistema é imune a incidente, e por isso, se ocorrer um evento de segurança com risco relevante aos titulares, comunicamos os afetados e a ANPD conforme o artigo 48 da LGPD.",
      },
    ],
  },
  {
    id: "alteracoes",
    title: "8. Alterações desta política",
    blocks: [
      {
        kind: "p",
        text: "Quando esta política mudar, atualizamos a data de revisão no topo da página. Mudança relevante na forma de tratar os dados é comunicada pelos canais do site.",
      },
    ],
  },
];

/* ------------------------------------------------------------- termos de uso */

export const termsSections: LegalSection[] = [
  {
    id: "objeto",
    title: "1. O que este site é",
    blocks: [
      {
        kind: "p",
        text: "Este site apresenta o catálogo, o conteúdo técnico e a loja de peças e consumíveis da Demakine Equipamentos Agroindustriais. Ao navegar, você concorda com estes termos.",
      },
    ],
  },
  {
    id: "orcamento",
    title: "2. Orçamento, cotação e preço",
    blocks: [
      {
        kind: "p",
        text: "Equipamentos fabricados sob medida, como esteiras, roscas e elevadores, não têm preço de prateleira: o valor sai por cotação, depois do dimensionamento feito pela engenharia a partir da capacidade, altura e produto informados por você.",
      },
      {
        kind: "p",
        text: "Preço, prazo e condição de pagamento só se tornam compromisso da Demakine quando constam de uma proposta comercial formal. Informação de preço exibida na loja pode ser corrigida a qualquer momento, e erro evidente de digitação não obriga a venda.",
      },
    ],
  },
  {
    id: "ficha",
    title: "3. Informação técnica e calculadoras",
    blocks: [
      {
        kind: "p",
        text: "As fichas técnicas, as calculadoras de dimensionamento e os simuladores de retorno disponíveis no site servem de estimativa e ponto de partida para a conversa técnica. O resultado depende do produto movimentado, do layout e das condições de operação, e não substitui o dimensionamento formal feito pela engenharia da fábrica.",
      },
      {
        kind: "p",
        text: "Cenários de retorno apresentados como simulação usam premissas exibidas na própria página. Não são promessa de resultado.",
      },
    ],
  },
  {
    id: "uso",
    title: "4. Uso permitido",
    blocks: [
      {
        kind: "p",
        text: "Você pode navegar, baixar os materiais oferecidos e compartilhar os links. Não é permitido copiar o conteúdo para reproduzir catálogo concorrente, raspar o site de forma automatizada a ponto de prejudicar a operação, nem usar a marca, as fotos e os desenhos técnicos da Demakine sem autorização por escrito.",
      },
      {
        kind: "p",
        text: "As fotos de equipamento publicadas no site são do acervo da própria fábrica e estão protegidas por direito autoral.",
      },
    ],
  },
  {
    id: "conteudo-usuario",
    title: "5. Conteúdo que você envia",
    blocks: [
      {
        kind: "p",
        text: "Ao enviar foto de peça, número de série ou descrição de operação, você declara que tem o direito de compartilhar esse material e autoriza a Demakine a usá-lo internamente para identificar o componente e prestar o atendimento. Não publicamos esse material sem a sua autorização.",
      },
    ],
  },
  {
    id: "responsabilidade",
    title: "6. Limite de responsabilidade",
    blocks: [
      {
        kind: "p",
        text: "A Demakine responde pelo equipamento que fabrica e vende, nos termos da proposta, da nota fiscal e da garantia acordada. Não responde por indisponibilidade momentânea do site, por decisão tomada apenas com base em estimativa de calculadora, nem por instalação ou modificação feita por terceiro fora da orientação técnica da fábrica.",
      },
    ],
  },
  {
    id: "foro",
    title: "7. Lei aplicável",
    blocks: [
      {
        kind: "p",
        text: "Estes termos são regidos pela lei brasileira. Fica eleito o foro da comarca de Limeira/SP para as questões dele decorrentes, salvo quando a lei garantir ao consumidor o foro do seu domicílio.",
      },
    ],
  },
];
