/**
 * /export — landing única de exportação, em espanhol e inglês.
 *
 * REGRAS
 * - Nada de credencial de exportação inventada: nenhum número de países
 *   atendidos, nenhum volume exportado, nenhum Incoterm prometido, nenhum
 *   prazo de embarque. O que a página afirma é o que já é fato no site em
 *   português: fábrica própria em Limeira/SP, mais de 15 anos de mercado,
 *   linhas de produto reais e engenharia que projeta sob medida.
 * - Frete, imposto e condição de embarque ficam como "quoted per project",
 *   porque dependem de destino e não existe tabela publicada.
 */

export type ExportLang = "es" | "en";

export type ExportCopy = {
  langLabel: string;
  htmlLang: string;
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  ctaPrimary: string;
  ctaSecondary: string;
  factsTitle: string;
  facts: { label: string; value: string }[];
  linesTitle: string;
  linesText: string;
  lines: { name: string; text: string; slug: string }[];
  howTitle: string;
  howText: string;
  how: { step: string; text: string }[];
  whyTitle: string;
  why: string[];
  noteTitle: string;
  note: string;
  formTitle: string;
  formSubtitle: string;
  formButton: string;
  contactTitle: string;
  contactText: string;
  switchTo: string;
};

export const exportCopy: Record<ExportLang, ExportCopy> = {
  es: {
    langLabel: "Español",
    htmlLang: "es",
    seoTitle: "Demakine | Transportadores y equipos agroindustriales fabricados en Brasil",
    seoDescription:
      "Fábrica brasileña de cintas transportadoras, tornillos, elevadores de cangilones y máquinas de coser sacos. Ingeniería propia en Limeira, São Paulo, y equipos a medida para exportación.",
    eyebrow: "Exportación",
    title: "Equipos de transporte agroindustrial fabricados en Brasil",
    intro:
      "Demakine fabrica cintas transportadoras, tornillos transportadores, elevadores de cangilones y máquinas de coser sacos en su propia planta en Limeira, São Paulo. Más de 15 años proyectando equipos a medida para la industria y el agronegocio.",
    ctaPrimary: "Solicitar cotización",
    ctaSecondary: "Hablar por WhatsApp",
    factsTitle: "La fábrica",
    facts: [
      { label: "Planta propia", value: "Limeira, São Paulo, Brasil" },
      { label: "Tiempo de mercado", value: "Más de 15 años" },
      { label: "Ingeniería", value: "Proyecto propio, equipo a medida" },
      { label: "Líneas", value: "Transporte, ensacado y costura, proyectos especiales" },
    ],
    linesTitle: "Líneas de producto",
    linesText:
      "Todos los equipos se dimensionan según el material, la capacidad, el largo y la altura de su operación.",
    lines: [
      {
        name: "Cintas transportadoras",
        text: "Para granel, sacos, cajas y material reciclable. Fijas, móviles, rectas o inclinadas.",
        slug: "esteira-transportadora-para-granel",
      },
      {
        name: "Tornillos transportadores",
        text: "Transporte cerrado de granos, harinas, fertilizantes y polvos, con baja pérdida de producto.",
        slug: "rosca-transportadora",
      },
      {
        name: "Elevadores de cangilones",
        text: "Ganancia de altura hacia silos, balanzas y tolvas, con cangilones definidos por el material.",
        slug: "elevador-de-canecas",
      },
      {
        name: "Máquinas de coser sacos",
        text: "Cierre de sacos al final de la línea, con hilo y punto adecuados al tipo de saco.",
        slug: "maquina-de-costurar-sacos-gk-26",
      },
      {
        name: "Elevadores de sacos",
        text: "Elevación de sacos entre niveles en ensacado, expedición y paletizado.",
        slug: "elevador-de-sacaria",
      },
      {
        name: "Proyectos especiales",
        text: "Equipos diseñados desde cero cuando el catálogo no resuelve la operación.",
        slug: "cartrans-carrinho-transportador",
      },
    ],
    howTitle: "Cómo trabajamos con el exterior",
    howText:
      "Cada proyecto se cotiza por separado. No hay lista de precios cerrada porque el equipo se diseña para su material y su planta.",
    how: [
      {
        step: "1. Usted describe la operación",
        text: "Material transportado, capacidad por hora, largo, altura y condiciones del local.",
      },
      {
        step: "2. Ingeniería dimensiona",
        text: "Definimos tipo de equipo, ancho de banda, motorización y estructura.",
      },
      {
        step: "3. Cotización con alcance claro",
        text: "Enviamos el alcance técnico y el valor del equipo. Flete, impuestos y condición de embarque se cotizan según el destino.",
      },
      {
        step: "4. Fabricación y seguimiento",
        text: "Producción en la planta de Limeira, con acompañamiento directo durante el proceso.",
      },
    ],
    whyTitle: "Por qué comprar de fábrica",
    why: [
      "Fabricante, no revendedor: quien atiende conoce el equipo por dentro.",
      "Proyecto a medida, incluso en medidas fuera del estándar.",
      "Repuestos y soporte técnico de la propia línea de fabricación.",
      "Interlocución directa con la ingeniería, sin intermediarios.",
    ],
    noteTitle: "Transparencia",
    note: "No publicamos plazos de embarque, valores de flete ni condiciones Incoterm en el sitio: dependen del destino y del proyecto. Todo eso se define por escrito en la cotización.",
    formTitle: "Solicitar cotización",
    formSubtitle:
      "Cuéntenos el material, la capacidad y el país de destino. Un especialista responde en hasta 1 día hábil.",
    formButton: "Enviar solicitud",
    contactTitle: "Contacto directo",
    contactText: "Atención en portugués y español.",
    switchTo: "Read in English",
  },
  en: {
    langLabel: "English",
    htmlLang: "en",
    seoTitle: "Demakine | Conveyors and agro-industrial equipment made in Brazil",
    seoDescription:
      "Brazilian manufacturer of belt conveyors, screw conveyors, bucket elevators and bag closing machines. In-house engineering in Limeira, São Paulo, with custom equipment for export.",
    eyebrow: "Export",
    title: "Agro-industrial handling equipment made in Brazil",
    intro:
      "Demakine manufactures belt conveyors, screw conveyors, bucket elevators and bag closing machines at its own plant in Limeira, São Paulo. Over 15 years designing custom equipment for industry and agribusiness.",
    ctaPrimary: "Request a quote",
    ctaSecondary: "Talk on WhatsApp",
    factsTitle: "The plant",
    facts: [
      { label: "Own factory", value: "Limeira, São Paulo, Brazil" },
      { label: "Years in business", value: "More than 15 years" },
      { label: "Engineering", value: "In-house design, custom-built equipment" },
      { label: "Product lines", value: "Handling, bagging and sewing, special projects" },
    ],
    linesTitle: "Product lines",
    linesText:
      "Every machine is sized for the material, capacity, length and height of your operation.",
    lines: [
      {
        name: "Belt conveyors",
        text: "For bulk, bags, boxes and recyclable material. Fixed, mobile, horizontal or inclined.",
        slug: "esteira-transportadora-para-granel",
      },
      {
        name: "Screw conveyors",
        text: "Enclosed handling of grain, flour, fertilizer and powders, with low product loss.",
        slug: "rosca-transportadora",
      },
      {
        name: "Bucket elevators",
        text: "Vertical lift to silos, scales and hoppers, with buckets chosen for the material.",
        slug: "elevador-de-canecas",
      },
      {
        name: "Bag closing machines",
        text: "Bag sewing at the end of the line, with thread and stitch suited to the bag.",
        slug: "maquina-de-costurar-sacos-gk-26",
      },
      {
        name: "Bag elevators",
        text: "Lifting bags between levels in bagging, dispatch and palletizing areas.",
        slug: "elevador-de-sacaria",
      },
      {
        name: "Special projects",
        text: "Equipment designed from scratch when the catalogue does not solve the operation.",
        slug: "cartrans-carrinho-transportador",
      },
    ],
    howTitle: "How we work with international buyers",
    howText:
      "Each project is quoted individually. There is no fixed price list because the equipment is designed for your material and your plant.",
    how: [
      {
        step: "1. You describe the operation",
        text: "Material handled, capacity per hour, length, height and site conditions.",
      },
      {
        step: "2. Engineering sizes the equipment",
        text: "We define machine type, belt width, drive and structure.",
      },
      {
        step: "3. Quote with a clear scope",
        text: "You receive the technical scope and the equipment price. Freight, taxes and shipping terms are quoted per destination.",
      },
      {
        step: "4. Manufacturing and follow-up",
        text: "Production at the Limeira plant, with direct follow-up during the process.",
      },
    ],
    whyTitle: "Why buy from the factory",
    why: [
      "Manufacturer, not a reseller: the person who answers knows the machine inside out.",
      "Custom design, including non-standard dimensions.",
      "Spare parts and technical support from our own production line.",
      "Direct contact with engineering, no middlemen.",
    ],
    noteTitle: "Transparency",
    note: "We do not publish shipping lead times, freight costs or Incoterm conditions on the website: they depend on destination and project. All of it is defined in writing in the quote.",
    formTitle: "Request a quote",
    formSubtitle:
      "Tell us the material, the capacity and the destination country. A specialist replies within 1 business day.",
    formButton: "Send request",
    contactTitle: "Direct contact",
    contactText: "We answer in Portuguese, Spanish and English by e-mail.",
    switchTo: "Leer en español",
  },
};
