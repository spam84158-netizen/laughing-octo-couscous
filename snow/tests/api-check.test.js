import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { normalizeNumber, interpretBanStatus } from '../api/check.js';
const mk = () => ({ code: 200, body: null, headers: {}, status(c){ this.code=c; return this; }, json(b){ this.body=b; return this; }, end(){ return this; }, setHeader(k,v){ this.headers[k]=v; } });
const real = globalThis.fetch; test.after(() => { globalThis.fetch = real; });
const up = (b, s = 200) => async () => new Response(typeof b === 'string' ? b : JSON.stringify(b), { status: s });
test('normalise un numéro', () => { assert.equal(normalizeNumber('00 225 01 60 77 58 90'), '+2250160775890'); assert.throws(() => normalizeNumber('12')); });
test('banned true/false/null -> 3 statuts distincts', () => {
  assert.equal(interpretBanStatus({ banned: true }).status, 'banned');
  assert.equal(interpretBanStatus({ banned: false }).status, 'not_banned');
  assert.equal(interpretBanStatus({ banned: null }).status, 'undetermined');
  assert.equal(interpretBanStatus({ banned: 'maybe' }).banned, null);
});
test('rejette une réponse invalide', () => { assert.throws(() => interpretBanStatus(null)); assert.throws(() => interpretBanStatus({ error: 'x' })); });
test('POST /check appelle la vraie API Inconnu', async () => {
  let seen; globalThis.fetch = async (u, o) => { seen = { u, o }; return up({ banned: false, reason: null })(); };
  const r = mk(); await handler({ method: 'POST', headers: {}, body: { number: '+5511999999999' } }, r);
  assert.equal(seen.u, 'https://inconnu-check-ban-api.onrender.com/check'); assert.equal(seen.o.method, 'POST');
  assert.equal(r.body.status, 'not_banned');
});
test('erreur HTTP amont != non banni', async () => {
  globalThis.fetch = up('oops', 500); const r = mk();
  await handler({ method: 'POST', headers: {}, body: { number: '+5511999999999' } }, r);
  assert.equal(r.code, 502); assert.equal(r.body.success, false);
});
test('validation sans appel amont + méthode', async () => {
  let n = 0; globalThis.fetch = async () => { n++; return up({})(); };
  const r = mk(); await handler({ method: 'POST', headers: {}, body: { number: 'abc' } }, r); assert.equal(r.code, 400); assert.equal(n, 0);
  const g = mk(); await handler({ method: 'GET', headers: {} }, g); assert.equal(g.code, 405);
});
