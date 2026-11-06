const { chromium, devices } = require('playwright');
const OUT = process.argv[2]; const U = 'http://localhost:8765/';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && errs.push(m.text()));
  const grupos = () => p.$$eval('.group', x => x.map(e => e.dataset.grupo + (e.classList.contains('group--live') ? '*' : '')));
  const busca = async (q) => { await p.fill('#busca', q); await p.waitForTimeout(300); return p.$$eval('.item:not([hidden]) .item__nome, .exec__prato:not([hidden]) b', x => x.map(e => e.textContent)); };

  // Executivo: segunda 12h (aberto)
  await p.goto(U + '?agora=2026-11-09T12:00:00-03:00'); await p.waitForSelector('.item');
  let g = await grupos(); ok(g[0] === 'executivo*', 'seg 12h: Executivo primeiro e com indicador ao vivo ' + g);
  ok(await p.isVisible('#executivo .badge--on'), 'seg 12h: selo "Disponível agora"');
  ok((await p.$$eval('.cat', x => x[0].id)) === 'executivo', 'seg 12h: seção executivo no topo do conteúdo');
  await p.evaluate(() => scrollTo({top: document.getElementById('executivo').getBoundingClientRect().top + scrollY - 160, behavior:'instant'})); await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + '/exec-aberto.png' });
  // sábado 12h, sexta 15h, segunda 10:59 (fechado)
  for (const [t, nome] of [['2026-11-07T12:00:00-03:00','sáb 12h'],['2026-11-06T15:00:00-03:00','sex 15h00'],['2026-11-09T10:59:00-03:00','seg 10h59'],['2026-11-09T14:59:00-03:00','seg 14h59']]) {
    await p.goto(U + '?agora=' + encodeURIComponent(t)); await p.waitForSelector('.item');
    g = await grupos(); const aberto = g[0] === 'executivo*';
    ok(nome === 'seg 14h59' ? aberto : (!aberto && g[g.length-1] === 'executivo'), `${nome}: ${aberto ? 'aberto' : 'fechado, executivo no fim'} (${g})`);
  }
  ok(await p.isVisible('#executivo .badge--on'), 'seg 14h59 ainda aberto');
  await p.goto(U + '?agora=2026-11-07T20:00:00-03:00'); await p.waitForSelector('.item');
  ok((await p.textContent('#executivo .badge')).includes('11h às 15h'), 'fechado mostra horário: ' + await p.textContent('#executivo .badge'));
  ok((await p.$eval('.chip[aria-current="true"]', e => e.dataset.cat)) === 'porcoes', 'fechado: menu abre em Porções');

  // Inglês
  await p.click('#idioma'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => document.documentElement.lang) === 'en', 'botão EN troca lang do documento');
  ok(await p.textContent('#idioma') === 'PT', 'botão passa a mostrar PT');
  ok(p.url().includes('lang=en'), 'URL recebe ?lang=en');
  ok(await p.getAttribute('#busca', 'placeholder') === 'Search dishes, drinks or ingredients', 'placeholder traduzido');
  ok((await p.$$eval('.group', x => x.map(e=>e.textContent))).join(',') === 'Kitchen,Sweets,Bar,Lunch', 'grupos traduzidos: ' + (await p.$$eval('.group', x => x.map(e=>e.textContent))));
  ok(await p.textContent('#item-eisbein .item__desc') === 'Tender pork knuckle with crispy crackling, pea purée, boiled potatoes, sauerkraut, Tyrolean onions and veal sausage.', 'descrição do Eisbein em inglês');
  ok((await p.textContent('#item-file-cavalo .precos')).includes('Family · serves 3'), 'rótulo "Family · serves 3": ' + await p.textContent('#item-file-cavalo .precos'));
  ok((await p.textContent('#item-file-cavalo .precos')).includes('99.90'), 'preço em formato inglês 99.90');
  ok((await p.textContent('#item-parm-mignon .precos')).includes('Large · serves 5'), 'parmegiana Mega → Large · serves 5');
  ok((await p.textContent('#executivo')).includes('Main course · choose 1'), 'executivo traduzido');
  ok((await p.getAttribute('#fab-whats','href')).includes(encodeURIComponent("Hello!")), 'mensagem do WhatsApp em inglês');
  let r = await busca('pork knuckle'); ok(r.length === 2, 'EN: "pork knuckle" → ' + r);
  r = await busca('joelho de porco'); ok(r.length === 2, 'EN: busca em português continua funcionando → ' + r);
  r = await busca('beer'); ok(r.length >= 1, 'EN: "beer" acha ' + r.length);
  await busca('sausage'); await p.screenshot({ path: OUT + '/en-busca.png' });
  ok((await p.textContent('#status')).includes('results for'), 'contador em inglês: ' + await p.textContent('#status'));
  await p.fill('#busca', ''); await p.waitForTimeout(300);
  await p.evaluate(() => scrollTo({top:0,behavior:'instant'})); await p.waitForTimeout(200); await p.screenshot({ path: OUT + '/en-topo.png' });
  // persistência
  await p.goto(U); await p.waitForSelector('.item'); ok(await p.evaluate(() => document.documentElement.lang) === 'en', 'idioma lembrado ao voltar');
  // volta para PT mantendo seção
  await p.click('.group[data-grupo="bar"]'); await p.waitForTimeout(1500);
  await p.evaluate(() => document.getElementById('idioma').click()); await p.waitForTimeout(500);
  ok(await p.evaluate(() => document.documentElement.lang) === 'pt-BR', 'volta para português');
  ok(await p.$eval('.group[aria-current="true"]', e => e.dataset.grupo) === 'bar', 'troca de idioma mantém a seção (Bar)');
  ok(errs.length === 0, 'sem erros no console ' + errs.join('|'));
  // traduções faltando
  await p.goto(U + '?lang=en'); await p.waitForSelector('.item');
  const falt = await p.$$eval('.item__desc', x => x.filter(e => /\b(com|servido|acompanha|molho|arroz)\b/i.test(e.textContent)).map(e => e.textContent.slice(0,40)));
  ok(falt.length === 0, 'nenhuma descrição em português no modo EN ' + falt.join(' | '));
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(ov <= 0, 'EN sem rolagem horizontal');
  console.log(fails ? `\n${fails} FALHA(S)` : '\nTODOS OS TESTES PASSARAM');
  await b.close();
})();
