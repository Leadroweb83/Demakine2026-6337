# Rodada 5 (ajustes por anexo) — concluída

- [x] anexo 1 — CineStat boxed: números maiores + centralizados (cine.tsx + .cine-stat-box--center)
- [x] anexo 2a — removido botão "Conhecer clientes" (pages/index.tsx)
- [x] anexo 2b — segmentos com ícone + cor padrão por segmento (lib/segments.ts usada em
      segments-carousel.tsx, projetos-especiais.tsx e no mega menu). Chips agora navegam o carrossel.
- [x] anexo 3 — removida a seção do comparador lisa/taliscada da home (componente mantido em /ferramentas)
- [x] anexo 4 — animação de logística Limeira -> Brasil (brazil-map.tsx: rotas em arco + pontos em
      movimento via animateMotion, pulso no hub; CSS .route-line / .dm-hub-pulse)
- [x] anexo 5 — contato da home: cards com ícone (WhatsApp/telefone/e-mail), bloco da fábrica com
      horário, mapa embed do Google e botão verde "Me leve até lá!" (site.mapsDirections/mapsEmbed)
- [x] botões de decisão em verde (--color-dm-green #17864f): submit do LeadForm, cards de ferramentas
      (seta verde), CTA do rodapé, "Me leve até lá!"
- [x] mega menu de Produtos no header: 4 linhas, lista de equipamentos, chips de segmento e foto da
      máquina correspondente ao passar o mouse (components/layout/mega-menu.tsx). Mobile ganhou
      atalhos de categoria.
- [x] rodapé: faixa de decisão no topo, selos (fábrica própria / entrega nacional / assistência),
      botão "Me leve até lá!", e silhueta das máquinas em linhas finas vermelhas 100% da largura
      (components/layout/machine-silhouette.tsx)
- [x] build OK, sem erros de console, POST /api/leads 201, /admin 200, QA 1440 e 390

## Pendências antigas (sem resposta do cliente)
- manter aviso "telefone temporariamente indisponível"? (default: sem banner)
- confirmar 7.000 máquinas vs 8.000 clientes? (default: números como estão)
