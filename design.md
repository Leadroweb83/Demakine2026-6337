# Design — Site Demakine v2

Direção: **industrial clean premium**. Menos saturação que o site anterior (que usava azul chapado + vermelho em quase toda seção). Aqui o branco e os cinzas neutros dominam; o azul da marca aparece em blocos e acentos; o vermelho é reservado para CTA.

## Paleta

| Token | Hex | Uso |
|---|---|---|
| `--dm-blue` | `#103D94` | Cor de marca. Blocos, títulos de seção, links, ícones |
| `--dm-blue-deep` | `#0A1F3D` | Seções escuras, hero overlay, rodapé |
| `--dm-blue-soft` | `#EAF0FB` | Fundo de destaque suave, badges |
| `--dm-red` | `#E4141B` | CTA e destaque pontual. Nunca em área grande |
| `--dm-ink` | `#111318` | Texto principal |
| `--dm-gray` | `#5C6473` | Texto secundário |
| `--dm-line` | `#E3E6EC` | Bordas e divisores |
| `--dm-surface` | `#F6F7F9` | Fundo de seção alternada |

Ritmo de fundo: `branco → #F6F7F9 → branco → #0A1F3D (escuro) → branco`. Nunca duas seções escuras seguidas.

## Tipografia

- **Display:** Montserrat 700/800/900, uppercase nos títulos de seção, `letter-spacing: -0.02em` nos H1/H2.
- **Corpo:** DM Sans 400/500, `line-height: 1.7`, máx. 68ch por linha.
- **Dados técnicos:** `font-variant-numeric: tabular-nums` nas tabelas de especificação.
- Escala: H1 clamp(2.4rem, 5vw, 4.2rem) · H2 clamp(1.8rem, 3.2vw, 2.75rem) · H3 1.35rem · corpo 1.0625rem.

## Correções de UI vindas da auditoria

1. **Contraste no banner** — hero com gradiente escuro (`rgba(10,31,61,.88) → .35`) e faixa sólida atrás do bloco de texto. Nunca texto branco direto sobre foto clara.
2. **Cards de categoria** — foto real do equipamento em 4:3, altura mínima 260px. Zero ícone genérico.
3. **Logos de clientes** — 45 logos identificados com nome e segmento. Faixa na home + grade na página de clientes.
4. **Depoimentos** — card com inicial, nome, empresa, cidade e 5 estrelas.
5. **Página de produto** — hierarquia em 4 blocos visualmente separados: galeria, descrição, características (lista em 2 colunas com ícone de check), **tabela comparativa de modelos** com cabeçalho fixo e scroll horizontal no mobile.
6. **Rodapé** — 4 colunas com hierarquia: marca+tagline, navegação, produtos, contato.
7. **Mobile** — mobile-first, validado em 390px antes de entregar.

## Layout

- Container `max-w-[1240px]`, padding lateral 20px (mobile) / 40px (desktop).
- Grid de produtos: 1 col (mobile) → 2 (sm) → 3 (lg).
- Fotos grandes com `object-cover`, cantos `rounded-none` nas fotos hero e `rounded-xl` nos cards. Sem sombra pesada — borda de 1px `--dm-line` no lugar.
- Números tabulares e blocos de dado com fundo `--dm-surface`.

## Motion

Um único sistema: `.reveal` + IntersectionObserver, com stagger por `--i`. Fade + translateY(18px), 600ms, `cubic-bezier(.22,.61,.36,1)`. Contadores animados na barra de números. Respeita `prefers-reduced-motion`. Sem parallax, sem tilt — o site é institucional técnico, não landing de campanha.

## Conteúdo real (nada fictício)

- 21 produtos com descrição, características e tabela de modelos vindos do site atual.
- 152 fotos de produto reais, 24 grupos de projetos especiais (94 fotos).
- 45 clientes reais identificados por nome e segmento.
- 29 depoimentos com nome, empresa e cidade.
- 11 artigos de blog do site atual.
- Números: 15 anos, +7.000 máquinas, +8.000 clientes, 4,9★ Google.
