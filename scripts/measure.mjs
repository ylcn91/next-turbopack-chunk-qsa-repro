// Loads the built app (`npm run build && npm start`) at several DOM sizes and measures the time the
// Turbopack runtime spends in its chunk-presence probe:
//   document.querySelectorAll(`script[src="u"],script[src^="u?"],script[src="d"],script[src^="d?"]`)
// A wrapper around Document.prototype.querySelectorAll times only calls with that selector shape.
// Usage: node scripts/measure.mjs [baseUrl] [runs]
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:3123';
const runs = Number(process.argv[3] || 3);
const PROBE = /^(script\[src|link\[rel=stylesheet\]\[href)\^?="/;

const browser = await chromium.launch();
const rows = [];
for (const rate of [1, 4]) {
  for (const n of [500, 2000, 4000, 8000]) {
    for (let r = 0; r < runs; r++) {
      const context = await browser.newContext();
      await context.addInitScript((src) => {
        const re = new RegExp(src);
        const native = Document.prototype.querySelectorAll;
        window.__probe = { calls: 0, ms: 0 };
        Document.prototype.querySelectorAll = function (selector) {
          if (this !== document || typeof selector !== 'string' || !re.test(selector)) return native.call(this, selector);
          const t = performance.now();
          const result = native.call(this, selector);
          window.__probe.calls++;
          window.__probe.ms += performance.now() - t;
          return result;
        };
      }, PROBE.source);
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate });
      await page.goto(`${base}/?n=${n}`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.querySelectorAll('[data-widget]').length === 80);
      await page.waitForTimeout(1000);
      const m = await page.evaluate(() => ({
        elements: document.getElementsByTagName('*').length,
        scripts: document.scripts.length,
        calls: window.__probe.calls,
        ms: window.__probe.ms
      }));
      rows.push({ cpu: `${rate}x`, n, run: r + 1, ...m });
      await context.close();
    }
  }
}
await browser.close();

const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
const summary = [];
for (const cpu of ['1x', '4x']) for (const n of [500, 2000, 4000, 8000]) {
  const g = rows.filter((x) => x.cpu === cpu && x.n === n);
  summary.push({
    cpu, requestedElements: n, domElements: g[0].elements, scripts: g[0].scripts, probeCalls: g[0].calls,
    probeMsMedian: +median(g.map((x) => x.ms)).toFixed(1),
    probeMsMin: +Math.min(...g.map((x) => x.ms)).toFixed(1), probeMsMax: +Math.max(...g.map((x) => x.ms)).toFixed(1),
    perCallMs: +(median(g.map((x) => x.ms)) / g[0].calls).toFixed(3)
  });
}
console.table(summary);
