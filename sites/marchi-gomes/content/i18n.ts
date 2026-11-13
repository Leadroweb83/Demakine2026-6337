/**
 * Versoes resumidas em ingles e espanhol (publico do Paraguai e demais paises
 * de lingua espanhola). Traducoes do texto institucional, A REVISAR por um
 * falante nativo e pelos socios antes da publicacao.
 */
export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export const localeMeta: Record<Locale | "pt", { label: string; href: string; hreflang: string }> = {
  pt: { label: "PT", href: "/", hreflang: "pt-BR" },
  en: { label: "EN", href: "/en", hreflang: "en" },
  es: { label: "ES", href: "/es", hreflang: "es" },
};

type Dict = {
  metaTitle: string; metaDescription: string;
  nav: { areas: string; services: string; firm: string; contact: string };
  hero: { eyebrow: string; title: string; highlight: string; text: string; cta: string; secondary: string };
  areas: { eyebrow: string; title: string; text: string; list: string[] };
  services: { eyebrow: string; title: string; items: { title: string; text: string }[] };
  approach: { eyebrow: string; title: string; items: { title: string; text: string }[] };
  firm: { eyebrow: string; title: string; paragraphs: string[]; legacyTitle: string; legacy: string };
  statement: string;
  contact: { eyebrow: string; title: string; text: string; whatsapp: string; directions: string; waMessage: string; note: string };
  form: { name: string; phone: string; email: string; subject: string; select: string; message: string; consent: string; submit: string; sending: string; sent: string; sentText: string; error: string; other: string; unsure: string };
  footer: { tagline: string; rights: string; ptOnly: string };
};

export const dict: Record<Locale, Dict> = {
  en: {
    metaTitle: "Marchi Gomes Advogados | Law firm in Limeira, São Paulo, Brazil",
    metaDescription: "Brazilian law firm founded in 1996 in Limeira, São Paulo. Advisory, preventive and litigation work for individuals, families and companies.",
    nav: { areas: "Practice areas", services: "Services", firm: "The firm", contact: "Contact" },
    hero: { eyebrow: "Limeira, São Paulo, Brazil · Since 1996", title: "Your assets, your business and your plans", highlight: "in good hands.", text: "Rigorous legal guidance, close client service and a strategy aligned with each client\u2019s reality, for individuals, families and companies.", cta: "Talk to our team", secondary: "Practice areas" },
    areas: { eyebrow: "Practice areas", title: "Protecting interests, guiding decisions and handling disputes.", text: "Marchi Gomes serves individuals, families and companies in advisory, preventive and litigation matters.", list: ["Civil Law and Civil Liability", "Family and Succession Law", "Contract Law", "Corporate and Business Law", "Consumer Law", "Real Estate and Property Law", "Banking and Finance Law", "Labor and Social Security Law", "Tax Law", "Criminal Law", "International Law", "Strategic Litigation"] },
    services: { eyebrow: "Services", title: "What the firm does for you.", items: [
      { title: "Legal advice and counsel", text: "Guidance for personal, property and business decisions, on a one-off or ongoing basis." },
      { title: "Contracts and negotiations", text: "Drafting, review and negotiation of agreements, with attention to obligations, guarantees and the practical effect of each clause." },
      { title: "Legal planning and structuring", text: "Structuring of family, property, corporate and business relationships according to the needs of each case." },
      { title: "Dispute prevention and resolution", text: "Risk assessment, negotiation and settlement building." },
      { title: "Court and administrative representation", text: "Defense of the client\u2019s interests, with a strategy based on the facts, the evidence and the goals involved." },
    ] },
    approach: { eyebrow: "How we work", title: "From context to decision.", items: [
      { title: "Understanding the context", text: "The work starts by understanding your goals, the interests that must be preserved and the consequences each alternative may bring." },
      { title: "Defining the strategy", text: "Based on that analysis, the firm defines the path and explains each recommendation in clear language, so you have the information to decide." },
      { title: "Close follow-up", text: "The partners take part, each matter has a designated lawyer in charge, and you receive regular updates and follow-up meetings." },
    ] },
    firm: { eyebrow: "The firm", title: "Two careers, a legacy of responsibility and a shared view of the legal profession.", paragraphs: [
      "Marchi Gomes Advogados was born from the professional partnership between Gisele Marchi and Gabriel Gomes. The firm began in 1996, in Limeira, as João Jair Marchi Advogados and, in 2026, taking on that legacy, was reborn as Marchi Gomes. It brings together complementary experience with a clear purpose: rigorous legal guidance, close client service and a strategy aligned with each client\u2019s reality.",
      "The firm was created to act both in resolving disputes and in the legal organization of the choices that come before them. Family matters, asset protection, contracts and business decisions require an understanding that goes beyond the lawsuit.",
    ], legacyTitle: "The legacy of Dr. João Jair Marchi", legacy: "The firm\u2019s history draws on the legal tradition of the Marchi family. After retiring as a Police Chief, Dr. João Jair Marchi devoted his experience to the practice of law and built a distinguished career in the Limeira region, defending people\u2019s rights." },
    statement: "People, business, assets and the future guide this journey. The legacy inspires; daily work sustains trust.",
    contact: { eyebrow: "Contact", title: "By your side in every important decision.", text: "Tell us what you need. Your contact is confidential and our team replies during business hours (Brasília time).", whatsapp: "Message us on WhatsApp", directions: "Get directions", waMessage: "Hello! I found you through the website and would like to speak with the Marchi Gomes Advogados team.", note: "Service is provided primarily in Portuguese. Please ask about assistance in English." },
    form: { name: "Name", phone: "Phone / WhatsApp", email: "E-mail (optional)", subject: "Subject", select: "Select", message: "Briefly, tell us what you need", consent: "I authorize the use of this data so the firm can return my contact.", submit: "Send message", sending: "Sending", sent: "Message received.", sentText: "Our team will get back to you during business hours.", error: "We could not send it now. Please use WhatsApp.", other: "Another area", unsure: "Not sure yet" },
    footer: { tagline: "Tradition that drives new paths.", rights: "Informative content, in compliance with the Code of Ethics of the Brazilian Bar Association (OAB).", ptOnly: "Full website in Portuguese" },
  },
  es: {
    metaTitle: "Marchi Gomes Advogados | Estudio jurídico en Limeira, São Paulo, Brasil",
    metaDescription: "Estudio jurídico brasileño fundado en 1996 en Limeira, São Paulo. Asesoría consultiva, preventiva y contenciosa para personas, familias y empresas.",
    nav: { areas: "Áreas de práctica", services: "Servicios", firm: "El estudio", contact: "Contacto" },
    hero: { eyebrow: "Limeira, São Paulo, Brasil · Desde 1996", title: "Su patrimonio, sus negocios y sus planes", highlight: "en buenas manos.", text: "Orientación jurídica rigurosa, atención cercana y una estrategia alineada con la realidad de cada cliente, para personas, familias y empresas.", cta: "Hable con nuestro equipo", secondary: "Áreas de práctica" },
    areas: { eyebrow: "Áreas de práctica", title: "Proteger intereses, orientar decisiones y conducir conflictos.", text: "Marchi Gomes atiende a personas, familias y empresas en los frentes consultivo, preventivo y contencioso.", list: ["Derecho Civil y Responsabilidad Civil", "Derecho de Familia y Sucesiones", "Derecho Contractual", "Derecho Empresarial y Societario", "Derecho del Consumidor", "Derecho Inmobiliario y Patrimonial", "Derecho Bancario y Financiero", "Derecho Laboral y Previsional", "Derecho Tributario", "Derecho Penal", "Derecho Internacional", "Litigio estratégico"] },
    services: { eyebrow: "Servicios", title: "Lo que el estudio hace por usted.", items: [
      { title: "Consultoría y asesoría jurídica", text: "Orientación para decisiones personales, patrimoniales y empresariales, de forma puntual o continua." },
      { title: "Contratos y negociaciones", text: "Elaboración, revisión y negociación de instrumentos, con atención a las obligaciones asumidas, las garantías y los efectos prácticos de cada cláusula." },
      { title: "Planificación y organización jurídica", text: "Estructuración de relaciones familiares, patrimoniales, societarias y empresariales, según las necesidades de cada caso." },
      { title: "Prevención y resolución de conflictos", text: "Evaluación de riesgos, conducción de negociaciones y construcción de acuerdos." },
      { title: "Representación judicial y administrativa", text: "Defensa de los intereses del cliente, con una estrategia definida a partir de los hechos, las pruebas y los objetivos involucrados." },
    ] },
    approach: { eyebrow: "Cómo trabajamos", title: "Del contexto a la decisión.", items: [
      { title: "Comprender el contexto", text: "El trabajo comienza por entender sus objetivos, qué intereses deben preservarse y qué consecuencias puede producir cada alternativa." },
      { title: "Definir la estrategia", text: "A partir de ese análisis, el estudio define el camino y explica cada recomendación en lenguaje claro, para que usted tenga información para decidir." },
      { title: "Acompañar de cerca", text: "Los socios participan, cada asunto tiene un responsable definido y usted recibe comunicaciones periódicas y reuniones de seguimiento." },
    ] },
    firm: { eyebrow: "El estudio", title: "Dos trayectorias, un legado de responsabilidad y una visión compartida de la abogacía.", paragraphs: [
      "Marchi Gomes Advogados nace de la unión profesional entre Gisele Marchi y Gabriel Gomes. El estudio nació en 1996, en Limeira, como João Jair Marchi Advogados y, en 2026, al asumir ese legado, renace como Marchi Gomes. Reúne experiencias complementarias con un propósito definido: ofrecer orientación jurídica rigurosa, atención cercana y una estrategia alineada con la realidad de cada cliente.",
      "El estudio fue creado para actuar tanto en la solución de conflictos como en la organización jurídica de las decisiones que los anteceden. Las cuestiones familiares, la protección patrimonial, los contratos y las decisiones empresariales exigen una comprensión que va más allá del proceso.",
    ], legacyTitle: "El legado del Dr. João Jair Marchi", legacy: "La historia del estudio se inspira en la tradición jurídica de la familia Marchi. Tras jubilarse como Comisario de Policía, el Dr. João Jair Marchi dedicó su experiencia a la abogacía y construyó una trayectoria destacada en la región de Limeira, en la defensa de los derechos de las personas." },
    statement: "Personas, negocios, patrimonio y futuro orientan esta construcción. El legado inspira; el trabajo diario sostiene la confianza.",
    contact: { eyebrow: "Contacto", title: "A su lado en cada decisión importante.", text: "Cuéntenos qué necesita. El contacto es confidencial y nuestro equipo responde en horario comercial (hora de Brasilia).", whatsapp: "Escríbanos por WhatsApp", directions: "Cómo llegar", waMessage: "¡Hola! Vengo del sitio web y me gustaría hablar con el equipo de Marchi Gomes Advogados.", note: "La atención se presta principalmente en portugués. Consulte por atención en español." },
    form: { name: "Nombre", phone: "Teléfono / WhatsApp", email: "Correo electrónico (opcional)", subject: "Asunto", select: "Seleccione", message: "Cuéntenos, en pocas líneas, qué necesita", consent: "Autorizo el uso de estos datos para que el estudio responda a mi contacto.", submit: "Enviar mensaje", sending: "Enviando", sent: "Mensaje recibido.", sentText: "Nuestro equipo le responderá en horario comercial.", error: "No fue posible enviar ahora. Use WhatsApp.", other: "Otra área", unsure: "Aún no lo sé" },
    footer: { tagline: "Tradición que impulsa nuevos caminos.", rights: "Contenido informativo, conforme al Código de Ética del Colegio de Abogados de Brasil (OAB).", ptOnly: "Sitio completo en portugués" },
  },
};

export const localeOf = (pathname: string): Locale | null =>
  (locales as readonly string[]).includes(pathname.split("/")[1]) ? (pathname.split("/")[1] as Locale) : null;
