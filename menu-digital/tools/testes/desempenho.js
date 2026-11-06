const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p); await cdp.send('Network.enable');
await cdp.send('Network.emulateNetworkConditions', { offline:false, latency: 150, downloadThroughput: 1.6e6/8, uploadThroughput: 750e3/8 }); // "4G lento"
let total = 0, n = 0; cdp.on('Network.loadingFinished', e => { total += e.encodedDataLength; n++; });
const t0 = Date.now(); await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForSelector('.item');
const tItens = Date.now() - t0; await p.waitForTimeout(1500);
const lcp = await p.evaluate(() => new Promise(r => new PerformanceObserver(l => { const e = l.getEntries(); r(Math.round(e[e.length-1].startTime)); }).observe({ type: 'largest-contentful-paint', buffered: true })));
const cls = await p.evaluate(() => new Promise(r => { let s=0; new PerformanceObserver(l => { l.getEntries().forEach(e => { if(!e.hadRecentInput) s+=e.value; }); r(s.toFixed(3)); }).observe({ type: 'layout-shift', buffered: true }); setTimeout(()=>r(s.toFixed(3)),300); }));
console.log(`Rede 1,6 Mbps / 150 ms. Cardápio visível em ${tItens} ms. LCP ${lcp} ms. CLS ${cls}. ${n} arquivos, ${(total/1024).toFixed(0)} KB no carregamento inicial.`);
await b.close(); })();
