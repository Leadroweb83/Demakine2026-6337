const { chromium, devices } = require('playwright');
const OUT = process.argv[2]; const URL = 'http://localhost:8765/';
const log = (...a) => console.log(...a);
let fails = 0; const ok = (c, m) => { log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  const p = await ctx.newPage(); const errs = [];
  p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await p.waitForSelector('.item');
  ok(errs.length === 0, 'sem erros no console ' + errs.join('|'));
  const nItems = await p.$$eval('.item', x => x.length); ok(nItems === 128 || nItems > 120, 'itens renderizados: ' + nItems);
  ok(await p.$$eval('.cat', x => x.length) === 21, '21 categorias');
  ok(await p.$$eval('.exec__prato', x => x.length) === 16, '16 pratos no executivo');
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(ov <= 0, 'sem rolagem horizontal (mobile) ' + ov);
  await p.screenshot({ path: OUT + '/m1-topo.png' });
  // chip / grupo
  await p.click('.group[data-grupo="cozinha"]'); await p.waitForTimeout(1200);
  ok(await p.$eval('.chip[aria-current="true"]', e => e.dataset.cat) === 'porcoes', 'grupo Cozinha leva a Porções');
  await p.click('.chip[data-cat="parmegiana"]'); await p.waitForTimeout(1200);
  const top = await p.$eval('#parmegiana', e => e.getBoundingClientRect().top); const sh = await p.$eval('#sticky', e => e.getBoundingClientRect().height);
  ok(Math.abs(top - sh) < 6, `chip Parmegiana posiciona a seção abaixo da barra (top ${top.toFixed(0)} / barra ${sh.toFixed(0)})`);
  await p.screenshot({ path: OUT + '/m2-parmegiana.png' });
  // scrollspy
  await p.evaluate(() => { const s = document.getElementById('caipirinhas'); scrollTo({top: s.getBoundingClientRect().top + scrollY - 100, behavior: 'instant'}); }); await p.waitForTimeout(600);
  ok(await p.$eval('.group[aria-current="true"]', e => e.dataset.grupo) === 'bar', 'scrollspy: grupo Bar ativo ao rolar');
  ok(await p.$eval('.chip[aria-current="true"]', e => e.dataset.cat) === 'caipirinhas', 'scrollspy: chip Caipirinhas ativo');
  await p.screenshot({ path: OUT + '/m3-bar.png' });
  ok(await p.isVisible('#topo'), 'botão voltar ao topo aparece');
  await p.click('#topo'); await p.waitForTimeout(2000); ok(await p.evaluate(() => scrollY) < 5, 'voltar ao topo funciona');
  // busca
  const busca = async (q) => { await p.fill('#busca', q); await p.waitForTimeout(350); return p.$$eval('.item:not([hidden]), .exec__prato:not([hidden]), .exec__lista li:not([hidden]), .adicionais li:not([hidden])', x => x.map(e => (e.querySelector('.item__nome,b')||e).textContent.trim())); };
  let r = await busca('joelho de porco'); ok(r.length === 2 && r.every(x=>/Eisbein/.test(x)), 'busca "joelho de porco" → ' + r.join(', '));
  r = await busca('pure'); ok(r.some(x=>/Purê de batata/.test(x)), 'busca sem acento "pure" acha Purê (' + r.length + ')');
  r = await busca('parmigiana'); ok(r.length >= 6, 'sinônimo "parmigiana" → ' + r.length + ' resultados');
  r = await busca('porco'); ok(r.some(x=>/Kassler/.test(x)) && r.some(x=>/Torresmo/.test(x)), 'busca "porco" acha Kassler e Torresmo (' + r.length + ')');
  r = await busca('chope'); ok(r.some(x=>/Chopp/.test(x)), 'sinônimo "chope" acha Chopp');
  r = await busca('whisky'); ok(r.length >= 5, 'busca "whisky" → ' + r.length);
  r = await busca('ovo'); log('  "ovo" →', r.join(' | '));
  r = await busca('camarao'); ok(r.length === 2, 'busca "camarao" → ' + r.join(', '));
  await busca('Eisbein'); await p.screenshot({ path: OUT + '/m4-busca.png' });
  ok(await p.isHidden('#destaques'), 'destaques somem durante a busca');
  ok((await p.textContent('#status')).includes('resultado'), 'contador de resultados: ' + await p.textContent('#status'));
  await busca('xyzabc'); ok(await p.isVisible('#vazio'), 'estado vazio aparece');
  await p.screenshot({ path: OUT + '/m5-vazio.png' });
  await p.click('[data-sugestao="chopp"]'); await p.waitForTimeout(300); ok(await p.isHidden('#vazio'), 'sugestão do estado vazio funciona');
  await p.click('.search__clear'); await p.waitForTimeout(300);
  ok(await p.$$eval('.item:not([hidden])', x => x.length) === nItems, 'limpar busca restaura tudo');
  // destaque
  await p.click('.dcard >> nth=1'); await p.waitForTimeout(1200);
  const t2 = await p.$eval('#item-eisbein', e => e.getBoundingClientRect().top); ok(t2 > sh - 2 && t2 < sh + 40, 'destaque Eisbein rola até o prato');
  // links
  ok((await p.getAttribute('#fab-whats', 'href')).startsWith('https://wa.me/5511939460955'), 'link WhatsApp correto');
  // imagens quebradas
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo({top:y,behavior:'instant'}); await new Promise(r => setTimeout(r, 40)); } });
  await p.waitForTimeout(800);
  const broken = await p.$$eval('img', xs => xs.filter(i => i.complete && i.naturalWidth === 0).map(i => i.src)); ok(broken.length === 0, 'nenhuma imagem quebrada ' + broken.join(','));
  await p.screenshot({ path: OUT + '/m6-rodape.png' });
  // hash
  await p.goto(URL + '#kids'); await p.waitForTimeout(2000);
  ok(await p.$eval('.chip[aria-current="true"]', e => e.dataset.cat) === 'kids', 'link direto #kids abre a seção');
  // teclado
  await p.goto(URL); await p.waitForSelector('.item'); await p.keyboard.press('/'); ok(await p.evaluate(() => document.activeElement.id) === 'busca', 'atalho "/" foca a busca');

  // tablet e desktop
  for (const [nome, vp] of [['tablet', { width: 820, height: 1180 }], ['desktop', { width: 1440, height: 900 }]]) {
    const c2 = await b.newContext({ viewport: vp, deviceScaleFactor: 1 }); const q = await c2.newPage();
    await q.goto(URL); await q.waitForSelector('.item');
    const o = await q.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(o <= 0, `sem rolagem horizontal (${nome})`);
    await q.screenshot({ path: `${OUT}/${nome}-1.png` });
    await q.click('.chip[data-cat="tradicao-alema"]').catch(async()=>{ await q.click('.group[data-grupo="cozinha"]'); await q.waitForTimeout(900); await q.click('.chip[data-cat="tradicao-alema"]'); });
    await q.waitForTimeout(1200); await q.screenshot({ path: `${OUT}/${nome}-2.png` });
    await q.click('.group[data-grupo="bar"]'); await q.waitForTimeout(1200); await q.screenshot({ path: `${OUT}/${nome}-3.png` });
    await c2.close();
  }
  // pequeno (iPhone SE)
  const c3 = await b.newContext({ ...devices['iPhone SE'] }); const s = await c3.newPage(); await s.goto(URL); await s.waitForSelector('.item');
  ok(await s.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, 'sem rolagem horizontal (iPhone SE 320px)'); await s.screenshot({ path: OUT + '/se.png' });
  log(fails ? `\n${fails} FALHA(S)` : '\nTODOS OS TESTES PASSARAM');
  await b.close();
})();
