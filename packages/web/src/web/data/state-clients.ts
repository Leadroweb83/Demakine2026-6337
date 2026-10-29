/**
 * Clientes por estado exibidos no mapa (home): empresas da planilha "CLIENTES REGIÃO" (controle de
 * pedidos, atualizada em 28/10/2026), até 5 por estado. Pessoas físicas ficam de fora de propósito:
 * o mapa é público e só mostra empresas. Nomes sem "LTDA"/"S.A." e com a grafia corrigida.
 * Estados sem cliente na planilha (AP) ficam sem lista e mostram o texto padrão de entrega.
 * Para acrescentar um cliente, é só incluir uma linha no estado; o mapa corta em 5.
 */
export type StateClient = { name: string; city: string };

export const STATE_CLIENTS: Record<string, StateClient[]> = {
  // única exceção a "só empresas": o Acre só tem pessoa física na planilha, e a Demakine autorizou mostrar
  AC: [{ name: "Adilson de Oliveira", city: "Rio Branco" }],
  AL: [
    { name: "Campo Rico", city: "Palmeira dos Índios" },
    { name: "Comercial Lekita", city: "Pilar" },
    { name: "Watal Patacho Eco Boutique Residence", city: "Maceió" },
    { name: "Conab, Superintendência Regional de Alagoas", city: "Maceió" },
  ],
  AM: [
    { name: "SR Embalagens Plásticas Manaus", city: "Manaus" },
    { name: "Comercial Xaxim", city: "Manaus" },
    { name: "Araújo Cestas de Produtos Alimentícios", city: "Manaus" },
  ],
  BA: [
    { name: "Birla Carbon", city: "Camaçari" },
    { name: "Reframax Engenharia", city: "Camaçari" },
    { name: "Nutrilara Suplementos e Ração Animal", city: "Luís Eduardo Magalhães" },
    { name: "Avigran Indústria e Comércio de Alimentos", city: "Santo Antônio de Jesus" },
    { name: "Moinho Tabajara", city: "São Gonçalo dos Campos" },
  ],
  CE: [
    { name: "Cajubelly Castanhas de Caju", city: "Chorozinho" },
    { name: "Avícola Ovo Forte", city: "Mauriti" },
    { name: "Agroforte Comercial Agrícola", city: "Maracanaú" },
    { name: "Carvalho Locações e Serviços", city: "Russas" },
  ],
  DF: [
    { name: "Agro Master Comercial Agropecuário", city: "Brasília" },
    { name: "Amazônia Real Nuts", city: "Brasília" },
  ],
  ES: [
    { name: "Louis Dreyfus Company do Brasil", city: "Nova Venécia" },
    { name: "Placas do Brasil", city: "Pinheiros" },
    { name: "Dal Col Carnes de Qualidade", city: "Cariacica" },
    { name: "Control Vix Controle e Automação", city: "Vitória" },
    { name: "Caplast Comércio de Embalagens", city: "Serra" },
  ],
  GO: [
    { name: "Agrex", city: "Goiatuba" },
    { name: "Milhão Ingredientes", city: "Rio Verde" },
    { name: "MoodNutri", city: "Cachoeira Alta" },
    { name: "RF Ambiental", city: "Senador Canedo" },
    { name: "Bigstar Atacadista", city: "Goiânia" },
  ],
  MA: [
    { name: "Extra Forte Comércio de Alimentos", city: "São Luís" },
    { name: "Nacional Máquinas", city: "Imperatriz" },
    { name: "Aliança Nutrição Animal", city: "Santa Inês" },
    { name: "Andrade Agropecuária", city: "Lago Verde" },
    { name: "Bandeira Agropecuária", city: "Amarante do Maranhão" },
  ],
  MG: [
    { name: "Cooperbom", city: "Nazareno" },
    { name: "Frigorífico Luciana", city: "Uberlândia" },
    { name: "Celulose Nipo-Brasileira", city: "Belo Oriente" },
    { name: "Coopervass", city: "São Gonçalo do Sapucaí" },
    { name: "Rubi Minas Indústria e Comércio de Polvilhos", city: "Cachoeira de Minas" },
  ],
  MS: [
    { name: "Bracell MS", city: "Água Clara" },
    { name: "Alimentos Dallas Indústria", city: "Nova Alvorada do Sul" },
    { name: "Real & Cia", city: "Campo Grande" },
    { name: "Veterinária Boi Gordo", city: "Paranaíba" },
    { name: "Fazenda Dois Irmãos, Colpar", city: "Naviraí" },
  ],
  MT: [
    { name: "Rumo", city: "Rondonópolis" },
    { name: "Itafos Arraias Mineração e Fertilizantes", city: "Lucas do Rio Verde" },
    { name: "Nutribio Indústria e Comércio", city: "Sinop" },
    { name: "Arbaza Alimentos", city: "Canarana" },
    { name: "Agroindustrial Campo Real", city: "Primavera do Leste" },
  ],
  PA: [
    { name: "Belém Bioenergia", city: "Tailândia" },
    { name: "Gavassoni Bioenergia", city: "Bujaru" },
    { name: "Dendê do Tauá", city: "Santo Antônio do Tauá" },
    { name: "Ueoka Ferreira Nutrição Animal", city: "Parauapebas" },
    { name: "Motobras Motores", city: "Redenção" },
  ],
  PB: [{ name: "Raposo Artefatos de Pneus Inservíveis", city: "Campina Grande" }],
  PE: [
    { name: "Petrofertil", city: "Custódia" },
    { name: "Móveis Kutz Indústria e Comércio", city: "Escada" },
    { name: "Midas Logística Reversa, MF Ambiental", city: "Jaboatão dos Guararapes" },
  ],
  PI: [
    { name: "Agropecuária Malhada", city: "Lagoa Alegre" },
    { name: "Kennedy Bebidas", city: "Teresina" },
    { name: "Indústrias Dureino", city: "Teresina" },
    { name: "Tubos Ype", city: "Teresina" },
    { name: "Supermercados Elizeu Martins", city: "Parnaíba" },
  ],
  PR: [
    { name: "C.Vale", city: "Mamborê" },
    { name: "Senges Papel e Celulose", city: "Sengés" },
    { name: "Tecnoplanta", city: "Piraquara" },
    { name: "Lobazc Produtos Agrícolas", city: "Reserva" },
    { name: "Emerald Coast Import and Export", city: "Curitiba" },
  ],
  RJ: [
    { name: "RN Guedes Distribuidora", city: "Barra Mansa" },
    { name: "Dragmaq Engenharia", city: "Campos dos Goytacazes" },
    { name: "Marko Sistemas Metálicos de Construção", city: "Itaguaí" },
    { name: "Serv-Cal Peças e Serviços", city: "Rio de Janeiro" },
    { name: "RR Distribuidora de Pneus", city: "Rio de Janeiro" },
  ],
  RN: [
    { name: "Tinol Tangará Indústria de Óleos Vegetais", city: "Tangará" },
    { name: "Armazém do Produtor Elias", city: "Rodolfo Fernandes" },
    { name: "Agropecuária Casa do Campo", city: "Serra Caída" },
  ],
  RO: [
    { name: "Alisul Alimentos", city: "Ji-Paraná" },
    { name: "Sustennutri Nutrição Animal", city: "Porto Velho" },
    { name: "JP Carvoaria", city: "Porto Velho" },
    { name: "Grão Paiol Fabricação de Alimentos para Animais", city: "Porto Velho" },
    { name: "Marília Nutrição Animal", city: "Ji-Paraná" },
  ],
  RR: [
    { name: "Ambientalis Alimentos", city: "Boa Vista" },
    { name: "Potência Agrícola", city: "Boa Vista" },
  ],
  RS: [
    { name: "Miolo Wine Group", city: "Santana do Livramento" },
    { name: "ISAU Indústria de Sucos Alto Uruguai", city: "Liberato Salzano" },
    { name: "Tecnoplanta Florestal", city: "Barra do Ribeiro" },
    { name: "Nova Cadernos, Multi Manufatura de Papéis", city: "Paraí" },
    { name: "Novo Mundo Prestação de Serviços", city: "Vila Maria" },
  ],
  SC: [
    { name: "Rigesa, Westrock Celulose, Papel e Embalagens", city: "Três Barras" },
    { name: "Aliança Comércio Varejista", city: "São José" },
    { name: "Hrradinhos Confecções", city: "Gaspar" },
    { name: "Município de Atalanta", city: "Atalanta" },
  ],
  SE: [
    { name: "Maratá Sucos do Nordeste", city: "Estância" },
    { name: "Agropecuária São Luiz", city: "Carira" },
    { name: "Agrofazenda Comercial de Produtos do Campo", city: "Tobias Barreto" },
    { name: "Agromilho Rações, Murilo Cereais", city: "Tobias Barreto" },
  ],
  SP: [
    { name: "Bracell SP Celulose", city: "Lençóis Paulista" },
    { name: "Tegma Cargas Especiais", city: "Cubatão" },
    { name: "Givaudan do Brasil", city: "Botucatu" },
    { name: "Votorantim", city: "Votorantim" },
    { name: "Hwashin Automotivas Brasil", city: "Piracicaba" },
  ],
  TO: [
    { name: "Plena Alimentos", city: "Paraíso do Tocantins" },
    { name: "Grão Forte Agronegócio", city: "Guaraí" },
    { name: "São Vicente Tratores", city: "Colinas do Tocantins" },
    { name: "Traterra Comércio de Peças no Atacado", city: "Paraíso do Tocantins" },
    { name: "Lima & Gontijo Peças e Complementos", city: "Guaraí" },
  ],
};
