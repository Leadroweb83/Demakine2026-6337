/* =========================================================
   Bar do Alemão São Paulo · Vila · Cardápio digital
   Conteúdo: data/menu.json (fonte única de pratos e preços)
   Inglês:   data/en.json (só traduções; preços vêm do menu.json)
   ========================================================= */
(function () {
  "use strict";

  var DATA_URL = "data/menu.json";
  var EN_URL = "data/en.json";
  var IMG_DIR = "assets/images/";
  var FUSO = "America/Sao_Paulo";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var els = {
    sticky: $("#sticky"),
    grupos: $("#grupos"),
    chips: $("#categorias"),
    conteudo: $("#conteudo"),
    rail: $("#rail"),
    destaques: $("#destaques"),
    busca: $("#busca"),
    limpar: $(".search__clear"),
    status: $("#status"),
    vazio: $("#vazio"),
    vazioTermo: $("#vazio-termo"),
    topo: $("#topo"),
    hero: $(".hero"),
    whats: $("#fab-whats"),
    idioma: $("#idioma")
  };

  /* Textos da interface em português (o inglês fica em data/en.json → ui) */
  var UI_PT = {
    titulo: document.title,
    descricao: ($('meta[name="description"]') || {}).content,
    aPartir: "a partir de",
    preparo: "Preparo",
    resultado: "resultado para",
    resultados: "resultados para",
    doBar: "Do nosso bar",
    entrada: "Entrada",
    sobremesa: "Sobremesa",
    escolha1: "Escolha 1 opção",
    porPessoa: "por pessoa",
    pratoPrincipal: "Prato principal · escolha 1 opção",
    adicional: "Adicional",
    aoVivo: "Disponível agora",
    feriado: "Hoje é feriado · indisponível",
    horarioExec: "Seg. a sex., 11h às 15h",
    idioma: "View in English",
    erro: "Não foi possível carregar o cardápio agora. Atualize a página ou fale com a gente pelo",
    whatsMensagem: null
  };

  var state = {
    data: null,
    en: null,
    lang: "pt",
    catById: {},
    grupoAtivo: null,
    catAtiva: null,
    indice: [],
    lockSpy: false,
    execAberto: false
  };

  /* ---------- Idioma ---------- */
  function isEN() { return state.lang === "en" && !!state.en; }

  function ui(chave) {
    if (isEN() && state.en.ui[chave] != null) return state.en.ui[chave];
    return UI_PT[chave];
  }
  function trCat(cat, campo) {
    var t = isEN() && state.en.categorias[cat.id];
    return (t && t[campo] != null) ? t[campo] : cat[campo];
  }
  function trItem(item, campo) {
    var t = isEN() && state.en.itens[item.id];
    return (t && t[campo] != null) ? t[campo] : item[campo];
  }
  function trRotulo(txt) {
    return (isEN() && state.en.rotulos[txt]) || txt;
  }
  function trGrupo(g) { return (isEN() && state.en.grupos[g.id]) || g.nome; }

  /* Texto em pt + en para a busca encontrar nos dois idiomas */
  function bilingue(ptTxt, enObj, campos) {
    var partes = [ptTxt];
    if (state.en && enObj) campos.forEach(function (c) { if (enObj[c]) partes.push(enObj[c]); });
    return partes.join(" ");
  }

  function lerIdiomaInicial() {
    var p = new URLSearchParams(location.search).get("lang");
    if (p === "en" || p === "pt") return p;
    try { var s = localStorage.getItem("cardapio-idioma"); if (s === "en" || s === "pt") return s; } catch (e) { /* sem storage */ }
    return "pt";
  }

  function aplicarTextosEstaticos() {
    var en = isEN();
    document.documentElement.lang = en ? "en" : "pt-BR";
    document.title = ui("titulo");
    var md = $('meta[name="description"]'); if (md) md.content = ui("descricao");

    $$("[data-i18n]").forEach(function (n) {
      if (n.dataset.pt == null) n.dataset.pt = n.textContent;
      var k = n.getAttribute("data-i18n");
      n.textContent = en && state.en.ui[k] != null ? state.en.ui[k] : n.dataset.pt;
    });
    $$("[data-i18n-attr]").forEach(function (n) {
      n.getAttribute("data-i18n-attr").split(",").forEach(function (par) {
        var a = par.split(":"), attr = a[0], k = a[1], chavePt = "pt" + attr.replace(/[^a-z]/gi, "");
        if (n.dataset[chavePt] == null) n.dataset[chavePt] = n.getAttribute(attr) || "";
        n.setAttribute(attr, en && state.en.ui[k] != null ? state.en.ui[k] : n.dataset[chavePt]);
      });
    });
    $$("[data-sugestao-en]").forEach(function (b) {
      if (b.dataset.sugestaoPt == null) b.dataset.sugestaoPt = b.getAttribute("data-sugestao");
      var v = en ? b.getAttribute("data-sugestao-en") : b.dataset.sugestaoPt;
      b.setAttribute("data-sugestao", v); b.textContent = v;
    });

    els.idioma.textContent = en ? "PT" : "EN";
    els.idioma.setAttribute("lang", en ? "pt-BR" : "en");
    els.idioma.setAttribute("aria-label", ui("idioma"));
  }

  function trocarIdioma() {
    state.lang = isEN() ? "pt" : "en";
    try { localStorage.setItem("cardapio-idioma", state.lang); } catch (e) { /* sem storage */ }
    var url = new URL(location.href);
    if (state.lang === "en") url.searchParams.set("lang", "en"); else url.searchParams.delete("lang");
    history.replaceState(null, "", url);

    var manter = state.catAtiva;
    var noTopo = window.pageYOffset < els.hero.offsetHeight;
    renderTudo();
    if (els.busca.value) buscar(els.busca.value);
    if (manter && !noTopo) irPara(manter, true);
  }

  /* ---------- Almoço executivo: disponível agora? ---------- */
  function agoraSP() {
    var teste = new URLSearchParams(location.search).get("agora"); // ex.: ?agora=2026-11-09T12:00:00-03:00 (para testes)
    var d = teste ? new Date(teste) : new Date();
    if (isNaN(d)) d = new Date();
    var partes = new Intl.DateTimeFormat("en-US", { timeZone: FUSO, weekday: "short", year: "numeric", month: "2-digit", day: "2-digit", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(d);
    var o = {}; partes.forEach(function (p) { o[p.type] = p.value; });
    return { dia: o.weekday, data: o.year + "-" + o.month + "-" + o.day, minutos: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
  }
  /* Lista de feriados em data/menu.json → categoria executivo → "feriados" (AAAA-MM-DD) */
  function hojeEFeriado() {
    var exec = state.catById.executivo;
    return !!(exec && exec.feriados && exec.feriados.indexOf(agoraSP().data) !== -1);
  }
  function executivoAberto() {
    var a = agoraSP();
    var util = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(a.dia) !== -1;
    return util && !hojeEFeriado() && a.minutos >= 11 * 60 && a.minutos < 15 * 60;
  }
  /* Fora do horário, o executivo vai para o fim do menu */
  function gruposOrdenados() {
    var g = state.data.grupos.slice();
    if (!state.execAberto) {
      var i = g.findIndex(function (x) { return x.id === "executivo"; });
      if (i !== -1) g.push(g.splice(i, 1)[0]);
    }
    return g;
  }
  function categoriasOrdenadas() {
    var out = [];
    gruposOrdenados().forEach(function (g) {
      state.data.categorias.forEach(function (c) { if (c.grupo === g.id) out.push(c); });
    });
    return out;
  }

  /* ---------- Utilidades ---------- */
  function money(v) {
    return new Intl.NumberFormat(isEN() ? "en-US" : "pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  }

  function norm(s) {
    return String(s || "")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/[^a-z0-9&]+/g, " ")
      .trim();
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else if (k.slice(0, 2) === "on") node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? "" : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function svgIcon(path) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("aria-hidden", "true");
    s.innerHTML = path;
    return s;
  }
  var ICON_RELOGIO = '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>';

  function imagem(nome, alt, w, h, eager) {
    return el("img", {
      src: IMG_DIR + nome + ".webp",
      alt: alt || "",
      width: w || 480,
      height: h || 480,
      loading: eager ? "eager" : "lazy",
      decoding: "async"
    });
  }

  function precoEl(v) {
    return el("span", { class: "preco" }, [el("small", { text: "R$" }), money(v)]);
  }

  /* Rótulo do preço, com quantas pessoas serve quando o PDF informa */
  function listaPrecos(precos, cat) {
    return el("ul", { class: "precos" }, precos.map(function (p) {
      var pessoas = p[2] || (p[0] === "Família" && cat && cat.familia ? cat.familia : null);
      return el("li", null, [
        el("span", { class: "rotulo" }, [trRotulo(p[0]), pessoas ? el("em", { text: " · " + trRotulo(pessoas) }) : null]),
        el("span", { class: "leader", "aria-hidden": "true" }),
        precoEl(p[1])
      ]);
    }));
  }

  function menorPreco(item) {
    if (typeof item.preco === "number") return item.preco;
    if (item.precos) return Math.min.apply(null, item.precos.map(function (p) { return p[1]; }));
    return null;
  }

  /* ---------- Renderização ---------- */
  function renderItem(item, cat) {
    var nome = trItem(item, "nome");
    var tags = [];
    var selo = trCat(cat, "selo");
    if (selo) tags.push(el("span", { class: "tag tag--selo", text: selo }));
    if (item.tempo) tags.push(el("span", { class: "tag tag--info" }, [svgIcon(ICON_RELOGIO), ui("preparo") + " " + item.tempo]));
    (item.info || []).forEach(function (t) { tags.push(el("span", { class: "tag tag--info", text: trRotulo(t) })); });
    var desc = trItem(item, "descricao");

    var corpo = el("div", { class: "item__corpo" }, [
      el("div", { class: "item__topo" }, [
        el("h3", { class: "item__nome", text: nome }),
        typeof item.preco === "number" ? precoEl(item.preco) : null
      ]),
      tags.length ? el("div", { class: "tags" }, tags) : null,
      desc ? el("p", { class: "item__desc", text: desc }) : null,
      item.precos ? listaPrecos(item.precos, cat) : null
    ]);

    var li = el("li", { class: "item", id: "item-" + item.id }, [
      corpo,
      item.foto ? el("div", { class: "item__foto" }, [imagem(item.foto, nome, 240, 240)]) : null
    ]);

    var enItem = state.en && state.en.itens[item.id];
    var enCat = state.en && state.en.categorias[cat.id];
    indexar(li, [
      bilingue(item.nome, enItem, ["nome"]),
      bilingue(item.descricao || "", enItem, ["descricao"]),
      (item.info || []).join(" "),
      bilingue(cat.nome, enCat, ["nome"]),
      bilingue(cat.selo || "", enCat, ["selo"]),
      (item.precos || []).map(function (p) { return p[0] + " " + trRotulo(p[0]); }).join(" ")
    ].join(" "), cat.id, $(".item__nome", li));
    return li;
  }

  function renderExecutivo(cat) {
    var wrap = el("div", { class: "exec" });
    var ex = isEN() ? state.en.executivo : null;
    var exEn = state.en ? state.en.executivo : null;

    function blocoSimples(tituloKey, classe, itensPt, itensEn) {
      var ul = el("ul", { class: "exec__lista" });
      itensPt.forEach(function (t, i) {
        var mostra = (ex && itensEn && itensEn[i]) || t;
        var li = el("li", { text: mostra });
        ul.appendChild(li);
        indexar(li, [t, itensEn ? itensEn[i] : "", "almoco executivo executive lunch"].join(" "), cat.id);
      });
      return el("div", { class: "exec__bloco " + classe }, [
        el("h3", null, [ui(tituloKey), el("span", { text: ui("escolha1") })]),
        ul
      ]);
    }

    wrap.appendChild(blocoSimples("entrada", "exec__bloco--entradas", cat.entradas, exEn && exEn.entradas));
    wrap.appendChild(blocoSimples("sobremesa", "exec__bloco--sobremesas", cat.sobremesas, exEn && exEn.sobremesas));

    cat.planos.forEach(function (plano) {
      var bloco = el("div", { class: "exec__bloco" }, [
        el("div", { class: "exec__preco" }, [el("strong", { text: money(plano.preco) }), el("span", { text: ui("porPessoa") })]),
        el("p", { class: "exec__sub", text: ui("pratoPrincipal") })
      ]);
      plano.secoes.forEach(function (sec) {
        var nomeSec = (ex && ex.secoes[sec.nome]) || sec.nome;
        var s = el("div", { class: "exec__secao" }, [el("h4", { text: nomeSec })]);
        sec.itens.forEach(function (p) {
          var tEn = exEn && exEn.pratos[p.nome];
          var t = ex && tEn;
          var nome = (t && t.nome) || p.nome;
          var desc = (t && t.descricao) || p.descricao;
          var div = el("div", { class: "exec__prato" }, [el("b", { text: nome }), desc ? ": " + desc : null]);
          s.appendChild(div);
          indexar(div, [p.nome, p.descricao, sec.nome, tEn ? tEn.nome + " " + (tEn.descricao || "") : "", "almoco executivo executive lunch"].join(" "), cat.id, $("b", div));
        });
        bloco.appendChild(s);
      });
      wrap.appendChild(bloco);
    });

    if (cat.adicional) {
      var nomeAd = (ex && ex.adicional) || cat.adicional[0];
      wrap.appendChild(el("p", { class: "exec__adicional" }, [ui("adicional") + ": " + nomeAd + " · R$ " + money(cat.adicional[1])]));
    }
    return wrap;
  }

  function renderCategoria(cat) {
    var nome = trCat(cat, "nome");
    var badge = null;
    if (cat.tipo === "executivo") {
      badge = state.execAberto
        ? el("span", { class: "badge badge--on" }, [el("span", { class: "badge__dot", "aria-hidden": "true" }), ui("aoVivo")])
        : el("span", { class: "badge" }, [svgIcon(ICON_RELOGIO), hojeEFeriado() ? ui("feriado") : ui("horarioExec")]);
    }
    var head = el("div", { class: "section-head" }, [
      cat.eyebrow ? el("p", { class: "eyebrow", text: trCat(cat, "eyebrow") }) : null,
      el("h2", { id: "t-" + cat.id, text: nome }),
      badge,
      cat.nota ? el("p", { class: "nota", text: trCat(cat, "nota") }) : null
    ]);

    var sec = el("section", { class: "cat reveal", id: cat.id, "aria-labelledby": "t-" + cat.id, "data-grupo": cat.grupo }, [head]);

    if (cat.foto) sec.appendChild(el("div", { class: "cat__banner" }, [imagem(cat.foto, nome, 720, 405)]));

    if (cat.tipo === "executivo") {
      sec.appendChild(renderExecutivo(cat));
    } else {
      var ul = el("ul", { class: "lista" });
      cat.itens.forEach(function (item) { ul.appendChild(renderItem(item, cat)); });
      sec.appendChild(ul);
    }

    if (cat.adicionais) {
      var itens = cat.adicionais.itens.map(function (a) {
        return [(isEN() && state.en.adicionais[a[0]]) || a[0], a[1]];
      });
      var box = el("div", { class: "adicionais" }, [
        el("h3", { text: trCat(cat, "adicionais") || cat.adicionais.titulo }),
        listaPrecos(itens, cat)
      ]);
      $$("li", box).forEach(function (li, i) {
        var a = cat.adicionais.itens[i];
        indexar(li, [a[0], state.en ? state.en.adicionais[a[0]] : "", cat.nome, "kids"].join(" "), cat.id);
      });
      sec.appendChild(box);
    }
    return sec;
  }

  function renderConteudo() {
    var frag = document.createDocumentFragment();
    gruposOrdenados().forEach(function (g) {
      var wrap = el("div", { class: "grupo grupo--" + g.id, "data-grupo": g.id });
      if (g.id === "bar") wrap.appendChild(el("div", { class: "grupo-titulo" }, [el("p", { text: ui("doBar") })]));
      state.data.categorias
        .filter(function (c) { return c.grupo === g.id; })
        .forEach(function (c) { wrap.appendChild(renderCategoria(c)); });
      frag.appendChild(wrap);
    });
    els.conteudo.innerHTML = "";
    els.conteudo.appendChild(frag);
  }

  function renderDestaques() {
    els.rail.innerHTML = "";
    var frag = document.createDocumentFragment();
    state.data.destaques.forEach(function (d, i) {
      var t = (isEN() && state.en.destaques[d.alvo]) || {};
      var titulo = t.titulo || d.titulo, sub = t.sub || d.sub;
      var preco = null;
      if (state.catById[d.alvo]) {
        var valores = state.catById[d.alvo].itens.map(menorPreco).filter(function (v) { return v !== null; });
        preco = ui("aPartir") + " R$ " + money(Math.min.apply(null, valores));
      } else {
        var item = acharItem(d.alvo);
        if (item) preco = (item.precos && item.precos.length > 1 ? ui("aPartir") + " " : "") + "R$ " + money(menorPreco(item));
      }
      frag.appendChild(el("button", {
        class: "dcard", type: "button",
        "aria-label": titulo + ", " + sub + (preco ? ", " + preco : ""),
        onclick: function () { irPara(d.alvo); }
      }, [
        imagem(d.foto, "", 480, 600, i < 2),
        el("span", { class: "dcard__txt" }, [
          el("span", { class: "dcard__sub", text: sub }),
          el("span", { class: "dcard__nome", text: titulo }),
          preco ? el("span", { class: "dcard__preco", text: preco }) : null
        ])
      ]));
    });
    els.rail.appendChild(frag);
  }

  function acharItem(id) {
    for (var i = 0; i < state.data.categorias.length; i++) {
      var itens = state.data.categorias[i].itens || [];
      for (var j = 0; j < itens.length; j++) if (itens[j].id === id) return itens[j];
    }
    return null;
  }

  /* ---------- Navegação ---------- */
  function renderGrupos() {
    els.grupos.innerHTML = "";
    gruposOrdenados().forEach(function (g) {
      var live = g.id === "executivo" && state.execAberto;
      els.grupos.appendChild(el("button", {
        class: "group" + (live ? " group--live" : ""), type: "button", "data-grupo": g.id,
        onclick: function () {
          var primeira = state.data.categorias.filter(function (c) { return c.grupo === g.id; })[0];
          limparBusca(true);
          irPara(primeira.id);
        }
      }, [trGrupo(g), live ? el("span", { class: "badge__dot", "aria-hidden": "true" }) : null]));
    });
  }

  function renderChips(grupoId) {
    els.chips.innerHTML = "";
    state.data.categorias
      .filter(function (c) { return c.grupo === grupoId; })
      .forEach(function (c) {
        els.chips.appendChild(el("button", {
          class: "chip", type: "button", "data-cat": c.id, text: trCat(c, "nome"),
          onclick: function () { limparBusca(true); irPara(c.id); }
        }));
      });
  }

  function reduzMovimento() { return matchMedia("(prefers-reduced-motion: reduce)").matches; }

  function marcarAtivo(catId) {
    if (!catId || catId === state.catAtiva) return;
    var cat = state.catById[catId];
    state.catAtiva = catId;

    if (cat.grupo !== state.grupoAtivo) {
      state.grupoAtivo = cat.grupo;
      $$(".group", els.grupos).forEach(function (b) {
        b.setAttribute("aria-current", b.getAttribute("data-grupo") === cat.grupo ? "true" : "false");
      });
      renderChips(cat.grupo);
    }
    $$(".chip", els.chips).forEach(function (b) {
      var on = b.getAttribute("data-cat") === catId;
      b.setAttribute("aria-current", on ? "true" : "false");
      if (on) {
        var alvo = b.offsetLeft - parseInt(getComputedStyle(els.chips).paddingLeft || 0, 10);
        els.chips.scrollTo({ left: Math.max(0, alvo), behavior: reduzMovimento() ? "auto" : "smooth" });
      }
    });
  }

  function alturaSticky() { return els.sticky.getBoundingClientRect().height; }

  function irPara(id, instantaneo) {
    var alvo = document.getElementById(id) || document.getElementById("item-" + id);
    if (!alvo) return;
    var catId = state.catById[id] ? id : (alvo.closest(".cat") || {}).id;
    state.lockSpy = true;
    marcarAtivo(catId);
    var y = alvo.getBoundingClientRect().top + window.pageYOffset - alturaSticky() - (alvo.classList.contains("item") ? 12 : 0);
    window.scrollTo({ top: y, behavior: instantaneo || reduzMovimento() ? "instant" : "smooth" });
    if (alvo.classList.contains("item") && !instantaneo) {
      alvo.classList.remove("is-flash"); void alvo.offsetWidth; alvo.classList.add("is-flash");
    }
    // libera o destaque automático só quando a rolagem termina
    clearTimeout(irPara._t);
    var liberar = function () {
      clearTimeout(irPara._t);
      window.removeEventListener("scrollend", liberar);
      state.lockSpy = false; spy();
    };
    if ("onscrollend" in window && !instantaneo) window.addEventListener("scrollend", liberar);
    irPara._t = setTimeout(liberar, instantaneo ? 50 : 2000);
  }

  /* Destaca no menu a categoria visível no topo da tela */
  function spy() {
    if (state.lockSpy) return;
    var limite = alturaSticky() + 24;
    var atual = null;
    var secoes = $$(".cat:not([hidden])", els.conteudo);
    for (var i = 0; i < secoes.length; i++) {
      if (secoes[i].getBoundingClientRect().top <= limite) atual = secoes[i].id;
      else break;
    }
    marcarAtivo(atual || (secoes[0] && secoes[0].id));
  }

  /* ---------- Busca ---------- */
  function expandirSinonimos(textoNorm) {
    var extra = [];
    var sin = state.data.sinonimos || {};
    Object.keys(sin).forEach(function (k) {
      if ((" " + textoNorm + " ").indexOf(" " + norm(k)) !== -1) extra.push(norm(sin[k]));
    });
    return textoNorm + " " + extra.join(" ");
  }

  function indexar(node, texto, catId, alvoDestaque) {
    state.indice.push({
      el: node,
      texto: expandirSinonimos(norm(texto)),
      cat: catId,
      nomeEl: alvoDestaque || null,
      nomeOriginal: alvoDestaque ? alvoDestaque.textContent : null
    });
  }

  function destacar(entry, tokens) {
    if (!entry.nomeEl) return;
    var original = entry.nomeOriginal;
    if (!tokens.length) { entry.nomeEl.textContent = original; return; }
    // mapa: posição normalizada -> posição original (busca sem acento)
    var normChars = "", mapa = [];
    for (var i = 0; i < original.length; i++) {
      var n = original[i].normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
      for (var j = 0; j < n.length; j++) { normChars += n[j]; mapa.push(i); }
    }
    var marcas = new Array(original.length).fill(false);
    tokens.forEach(function (t) {
      var pos = normChars.indexOf(t);
      while (pos !== -1) {
        var inicioPalavra = pos === 0 || !/[a-z0-9]/.test(normChars[pos - 1]);
        if (inicioPalavra) for (var k = pos; k < pos + t.length; k++) marcas[mapa[k]] = true;
        pos = normChars.indexOf(t, pos + 1);
      }
    });
    entry.nomeEl.innerHTML = "";
    var buf = "", em = false;
    function flush() {
      if (!buf) return;
      entry.nomeEl.appendChild(em ? el("mark", { text: buf }) : document.createTextNode(buf));
      buf = "";
    }
    for (var c = 0; c < original.length; c++) {
      if (marcas[c] !== em) { flush(); em = marcas[c]; }
      buf += original[c];
    }
    flush();
  }

  function buscar(q) {
    var tokens = norm(q).split(" ").filter(Boolean);
    var ativo = tokens.length > 0;
    document.body.classList.toggle("is-searching", ativo);
    els.limpar.hidden = !q;

    var porCat = {};
    var total = 0;
    state.indice.forEach(function (e) {
      var ok = !ativo || tokens.every(function (t) { return (" " + e.texto).indexOf(" " + t) !== -1; });
      e.el.hidden = !ok;
      destacar(e, ativo && ok ? tokens : []);
      if (ok) { porCat[e.cat] = true; total++; }
    });

    $$(".cat", els.conteudo).forEach(function (sec) {
      sec.hidden = ativo && !porCat[sec.id];
      if (ativo) sec.classList.add("is-in");
      $$(".exec__bloco, .exec__secao, .adicionais", sec).forEach(function (b) {
        var visiveis = $$("li, .exec__prato", b).filter(function (x) { return !x.hidden; }).length;
        b.hidden = ativo && visiveis === 0;
      });
      var banner = $(".cat__banner", sec);
      if (banner) banner.hidden = ativo;
    });
    $$(".grupo", els.conteudo).forEach(function (g) {
      g.hidden = ativo && !$(".cat:not([hidden])", g);
    });

    if (ativo) {
      els.status.textContent = total ? total + " " + ui(total === 1 ? "resultado" : "resultados") + " “" + q.trim() + "”" : "";
      els.vazio.hidden = total > 0;
      els.vazioTermo.textContent = q.trim();
    } else {
      els.status.textContent = "";
      els.vazio.hidden = true;
    }
  }

  function limparBusca(silencioso) {
    if (!els.busca.value) return;
    els.busca.value = "";
    buscar("");
    if (!silencioso) els.busca.focus();
  }

  function ligarBusca() {
    var t;
    els.busca.addEventListener("input", function () {
      clearTimeout(t);
      t = setTimeout(function () {
        buscar(els.busca.value);
        var topoConteudo = $("main").getBoundingClientRect().top + window.pageYOffset - alturaSticky();
        if (window.pageYOffset > topoConteudo) window.scrollTo({ top: topoConteudo });
        spy();
      }, 110);
    });
    els.busca.addEventListener("keydown", function (e) {
      if (e.key === "Escape") limparBusca();
      if (e.key === "Enter") els.busca.blur();
    });
    els.limpar.addEventListener("click", function () { limparBusca(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && document.activeElement !== els.busca) { e.preventDefault(); els.busca.focus(); }
    });
    $$("[data-sugestao]").forEach(function (b) {
      b.addEventListener("click", function () { els.busca.value = b.getAttribute("data-sugestao"); buscar(els.busca.value); });
    });
  }

  /* ---------- Rolagem: topo, sombra e revelação ---------- */
  var io = null;
  function observarRevelacao() {
    var secoes = $$(".reveal:not(.is-in)");
    if (!("IntersectionObserver" in window)) { secoes.forEach(function (s) { s.classList.add("is-in"); }); return; }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
    }
    secoes.forEach(function (s) { io.observe(s); });
  }

  function ligarRolagem() {
    var tick = false;
    function onScroll() {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () {
        var y = window.pageYOffset;
        els.topo.hidden = y < 900;
        els.whats.classList.toggle("is-compact", y > 320);
        els.sticky.classList.toggle("is-stuck", y > els.hero.offsetHeight);
        spy();
        tick = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () {
      document.documentElement.style.setProperty("--sticky-h", alturaSticky() + "px");
    });
    els.topo.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduzMovimento() ? "instant" : "smooth" });
      els.busca.focus({ preventScroll: true });
    });
  }

  function ligarContato() {
    var r = state.data.restaurante;
    var msg = (isEN() && state.en.ui.whatsMensagem) || r.whatsappMensagem;
    var wa = "https://wa.me/" + r.whatsapp + "?text=" + encodeURIComponent(msg);
    els.whats.href = wa;
    $("#link-whats").href = wa;
    $("#link-mapa").href = r.mapa;
  }

  /* ---------- Início ---------- */
  function renderTudo() {
    state.indice = [];
    state.catAtiva = null;
    state.grupoAtivo = null;
    aplicarTextosEstaticos();
    renderGrupos();
    renderConteudo();
    renderDestaques();
    ligarContato();
    observarRevelacao();
    document.documentElement.style.setProperty("--sticky-h", alturaSticky() + "px");
    marcarAtivo(categoriasOrdenadas()[0].id);
  }

  function iniciar(resultados) {
    state.data = resultados[0];
    state.en = resultados[1];
    state.data.categorias.forEach(function (c) { state.catById[c.id] = c; });
    state.execAberto = executivoAberto();
    state.lang = lerIdiomaInicial();
    if (!state.en) state.lang = "pt";
    els.idioma.hidden = !state.en;

    renderTudo();
    document.body.classList.remove("is-loading");
    ligarBusca();
    ligarRolagem();
    els.idioma.addEventListener("click", trocarIdioma);

    // abre direto numa categoria ou prato: index.html#parmegiana
    if (location.hash.length > 1) {
      var id = decodeURIComponent(location.hash.slice(1));
      setTimeout(function () { irPara(id); }, 60);
    }
  }

  function json(url, opcional) {
    return fetch(url, { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch(function (e) { if (opcional) return null; throw e; });
  }

  /* Funciona sem internet depois da primeira visita (sw.js) */
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }

  Promise.all([json(DATA_URL), json(EN_URL, true)])
    .then(iniciar)
    .catch(function () {
      document.body.classList.remove("is-loading");
      els.conteudo.innerHTML = "";
      els.conteudo.appendChild(el("p", { class: "aviso" }, [
        UI_PT.erro + " ",
        el("a", { href: "https://wa.me/5511939460955", text: "WhatsApp (11) 93946-0955" }), "."
      ]));
    });
})();
