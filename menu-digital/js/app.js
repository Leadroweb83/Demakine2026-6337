/* =========================================================
   Bar do Alemão São Paulo · Vila · Cardápio digital
   Todo o conteúdo vem de data/menu.json (fonte única).
   ========================================================= */
(function () {
  "use strict";

  var DATA_URL = "data/menu.json";
  var IMG_DIR = "assets/images/";

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
    whats: $("#fab-whats")
  };

  var state = {
    data: null,
    catById: {},
    grupoAtivo: null,
    catAtiva: null,
    indice: [],          // entradas pesquisáveis
    lockSpy: false,
    buscando: false
  };

  /* ---------- Utilidades ---------- */
  var fmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function money(v) { return fmt.format(v); }

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
        else if (k === "html") node.innerHTML = v;
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

  /* Rótulo do preço, com quantas pessoas serve quando o PDF informa */
  function rotuloPreco(p, cat) {
    var rotulo = p[0];
    var pessoas = p[2] || (rotulo === "Família" && cat.familia ? cat.familia : null);
    return { rotulo: rotulo, pessoas: pessoas };
  }

  function listaPrecos(precos, cat) {
    return el("ul", { class: "precos" }, precos.map(function (p) {
      var r = rotuloPreco(p, cat || {});
      return el("li", null, [
        el("span", { class: "rotulo" }, [r.rotulo, r.pessoas ? el("em", { text: " · " + r.pessoas }) : null]),
        el("span", { class: "leader", "aria-hidden": "true" }),
        el("span", { class: "preco" }, [el("small", { text: "R$" }), money(p[1])])
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
    var tags = [];
    if (cat.selo) tags.push(el("span", { class: "tag tag--selo", text: cat.selo }));
    if (item.tempo) tags.push(el("span", { class: "tag tag--info" }, [svgIcon(ICON_RELOGIO), "Preparo " + item.tempo]));
    (item.info || []).forEach(function (t) { tags.push(el("span", { class: "tag tag--info", text: t })); });

    var topo = el("div", { class: "item__topo" }, [
      el("h3", { class: "item__nome", text: item.nome }),
      typeof item.preco === "number"
        ? el("span", { class: "preco" }, [el("small", { text: "R$" }), money(item.preco)])
        : null
    ]);

    var corpo = el("div", { class: "item__corpo" }, [
      topo,
      tags.length ? el("div", { class: "tags" }, tags) : null,
      item.descricao ? el("p", { class: "item__desc", text: item.descricao }) : null,
      item.precos ? listaPrecos(item.precos, cat) : null
    ]);

    var li = el("li", { class: "item", id: "item-" + item.id }, [
      corpo,
      item.foto ? el("div", { class: "item__foto" }, [imagem(item.foto, item.nome, 240, 240)]) : null
    ]);

    var precosTxt = (item.precos || []).map(function (p) { return p[0]; }).join(" ");
    indexar(li, [item.nome, item.descricao, (item.info || []).join(" "), cat.nome, cat.selo, precosTxt].join(" "), cat.id, $(".item__nome", li));
    return li;
  }

  function renderExecutivo(cat) {
    var wrap = el("div", { class: "exec" });

    function blocoSimples(titulo, classe, itens) {
      var ul = el("ul", { class: "exec__lista" });
      itens.forEach(function (t) {
        var li = el("li", { text: t });
        ul.appendChild(li);
        indexar(li, t + " " + titulo + " almoco executivo", cat.id);
      });
      return el("div", { class: "exec__bloco " + classe }, [
        el("h3", null, [titulo, el("span", { text: "Escolha 1 opção" })]),
        ul
      ]);
    }

    wrap.appendChild(blocoSimples("Entrada", "exec__bloco--entradas", cat.entradas));
    wrap.appendChild(blocoSimples("Sobremesa", "exec__bloco--sobremesas", cat.sobremesas));

    cat.planos.forEach(function (plano) {
      var bloco = el("div", { class: "exec__bloco" }, [
        el("div", { class: "exec__preco" }, [el("strong", { text: money(plano.preco) }), el("span", { text: "por pessoa" })]),
        el("p", { class: "exec__sub", text: "Prato principal · escolha 1 opção" })
      ]);
      plano.secoes.forEach(function (sec) {
        var s = el("div", { class: "exec__secao" }, [el("h4", { text: sec.nome })]);
        sec.itens.forEach(function (p) {
          var div = el("div", { class: "exec__prato" }, [
            el("b", { text: p.nome }),
            p.descricao ? ": " + p.descricao : null
          ]);
          s.appendChild(div);
          indexar(div, [p.nome, p.descricao, sec.nome, "almoco executivo"].join(" "), cat.id, $("b", div));
        });
        bloco.appendChild(s);
      });
      wrap.appendChild(bloco);
    });

    if (cat.adicional) {
      wrap.appendChild(el("p", { class: "exec__adicional" },
        ["Adicional: " + cat.adicional[0] + " · R$ " + money(cat.adicional[1])]));
    }
    return wrap;
  }

  function renderCategoria(cat) {
    var head = el("div", { class: "section-head" }, [
      cat.eyebrow ? el("p", { class: "eyebrow", text: cat.eyebrow }) : null,
      el("h2", { id: "t-" + cat.id, text: cat.nome }),
      cat.nota ? el("p", { class: "nota", text: cat.nota }) : null
    ]);

    var sec = el("section", { class: "cat reveal", id: cat.id, "aria-labelledby": "t-" + cat.id, "data-grupo": cat.grupo }, [head]);

    if (cat.foto) {
      sec.appendChild(el("div", { class: "cat__banner" }, [imagem(cat.foto, cat.nome, 720, 405)]));
    }

    if (cat.tipo === "executivo") {
      sec.appendChild(renderExecutivo(cat));
    } else {
      var ul = el("ul", { class: "lista" });
      cat.itens.forEach(function (item) { ul.appendChild(renderItem(item, cat)); });
      sec.appendChild(ul);
    }

    if (cat.adicionais) {
      var box = el("div", { class: "adicionais" }, [el("h3", { text: cat.adicionais.titulo }), listaPrecos(cat.adicionais.itens, cat)]);
      $$("li", box).forEach(function (li) { indexar(li, li.textContent + " " + cat.nome, cat.id); });
      sec.appendChild(box);
    }
    return sec;
  }

  function renderConteudo() {
    var frag = document.createDocumentFragment();
    state.data.grupos.forEach(function (g) {
      var wrap = el("div", { class: "grupo grupo--" + g.id, "data-grupo": g.id });
      if (g.id === "bar") {
        wrap.appendChild(el("div", { class: "grupo-titulo" }, [el("p", { text: "Do nosso bar" })]));
      }
      state.data.categorias
        .filter(function (c) { return c.grupo === g.id; })
        .forEach(function (c) { wrap.appendChild(renderCategoria(c)); });
      frag.appendChild(wrap);
    });
    els.conteudo.innerHTML = "";
    els.conteudo.appendChild(frag);
  }

  function renderDestaques() {
    var frag = document.createDocumentFragment();
    state.data.destaques.forEach(function (d, i) {
      var preco = null;
      if (state.catById[d.alvo]) {
        var valores = state.catById[d.alvo].itens.map(menorPreco).filter(function (v) { return v !== null; });
        preco = "a partir de R$ " + money(Math.min.apply(null, valores));
      } else {
        var item = acharItem(d.alvo);
        if (item) {
          var v = menorPreco(item);
          preco = (item.precos && item.precos.length > 1 ? "a partir de " : "") + "R$ " + money(v);
        }
      }
      frag.appendChild(el("button", {
        class: "dcard", type: "button",
        "aria-label": d.titulo + ", " + d.sub + (preco ? ", " + preco : ""),
        onclick: function () { irPara(d.alvo); }
      }, [
        imagem(d.foto, "", 480, 600, i < 2),
        el("span", { class: "dcard__txt" }, [
          el("span", { class: "dcard__sub", text: d.sub }),
          el("span", { class: "dcard__nome", text: d.titulo, style: "display:block" }),
          preco ? el("span", { class: "dcard__preco", text: preco, style: "display:block" }) : null
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
    state.data.grupos.forEach(function (g) {
      els.grupos.appendChild(el("button", {
        class: "group", type: "button", "data-grupo": g.id, text: g.nome,
        onclick: function () {
          var primeira = state.data.categorias.filter(function (c) { return c.grupo === g.id; })[0];
          limparBusca(true);
          irPara(primeira.id);
        }
      }));
    });
  }

  function renderChips(grupoId) {
    els.chips.innerHTML = "";
    state.data.categorias
      .filter(function (c) { return c.grupo === grupoId; })
      .forEach(function (c) {
        els.chips.appendChild(el("button", {
          class: "chip", type: "button", "data-cat": c.id, text: c.nome,
          onclick: function () { limparBusca(true); irPara(c.id); }
        }));
      });
  }

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
        els.chips.scrollTo({ left: Math.max(0, alvo), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      }
    });
  }

  function alturaSticky() { return els.sticky.getBoundingClientRect().height; }

  function irPara(id) {
    var alvo = document.getElementById(id) || document.getElementById("item-" + id);
    if (!alvo) return;
    var catId = state.catById[id] ? id : (alvo.closest(".cat") || {}).id;
    state.lockSpy = true;
    marcarAtivo(catId);
    var y = alvo.getBoundingClientRect().top + window.pageYOffset - alturaSticky() - (alvo.classList.contains("item") ? 12 : 0);
    window.scrollTo({ top: y, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    if (alvo.classList.contains("item")) {
      alvo.classList.remove("is-flash"); void alvo.offsetWidth; alvo.classList.add("is-flash");
    }
    // libera o destaque automático só quando a rolagem termina
    clearTimeout(irPara._t);
    var liberar = function () {
      clearTimeout(irPara._t);
      window.removeEventListener("scrollend", liberar);
      state.lockSpy = false; spy();
    };
    if ("onscrollend" in window) window.addEventListener("scrollend", liberar);
    irPara._t = setTimeout(liberar, 2000);
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
    state.buscando = ativo;
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
      // blocos do executivo sem pratos visíveis
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
      els.status.textContent = total
        ? total + (total === 1 ? " resultado" : " resultados") + " para “" + q.trim() + "”"
        : "";
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
      window.scrollTo({ top: 0, behavior: "smooth" });
      els.busca.focus({ preventScroll: true });
    });

    var secoes = $$(".reveal");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
      secoes.forEach(function (s) { io.observe(s); });
    } else {
      secoes.forEach(function (s) { s.classList.add("is-in"); });
    }
  }

  function ligarContato() {
    var r = state.data.restaurante;
    var wa = "https://wa.me/" + r.whatsapp + "?text=" + encodeURIComponent(r.whatsappMensagem);
    $("#fab-whats").href = wa;
    $("#link-whats").href = wa;
    $("#link-mapa").href = r.mapa;
  }

  /* ---------- Início ---------- */
  function iniciar(data) {
    state.data = data;
    data.categorias.forEach(function (c) { state.catById[c.id] = c; });

    renderGrupos();
    renderConteudo();
    renderDestaques();
    ligarContato();
    ligarBusca();
    ligarRolagem();

    document.documentElement.style.setProperty("--sticky-h", alturaSticky() + "px");
    marcarAtivo(data.categorias[0].id);

    // abre direto numa categoria ou prato: index.html#parmegiana
    if (location.hash.length > 1) {
      var id = decodeURIComponent(location.hash.slice(1));
      setTimeout(function () { irPara(id); }, 60);
    }
  }

  fetch(DATA_URL, { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(iniciar)
    .catch(function () {
      els.conteudo.innerHTML = "";
      els.conteudo.appendChild(el("p", { class: "aviso" }, [
        "Não foi possível carregar o cardápio agora. Atualize a página ou fale com a gente pelo ",
        el("a", { href: "https://wa.me/5511939460955", text: "WhatsApp (11) 93946-0955" }), "."
      ]));
    });
})();
