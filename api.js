/**
 * MarketMIND — API client
 * In production the frontend and API are served by the same Flask app,
 * so we use a relative "/api". When you open the page through a separate
 * dev server (e.g. VS Code Live Server on :5500) we fall back to :5000.
 */
const API_BASE = (() => {
  const h = location.hostname;
  const isLocal = h === 'localhost' || h === '127.0.0.1' || location.protocol === 'file:';
  if (isLocal && location.port !== '5000') return 'http://localhost:5000/api';
  return '/api';
})();

const _cache = {};
const TTL    = 58000; // 58 seconds

function cacheGet(key, ttl = TTL) {
  const e = _cache[key];
  return (e && Date.now() - e.ts < ttl) ? e.v : null;
}
function cacheSet(key, val) {
  _cache[key] = { ts: Date.now(), v: val };
}
function cacheClear() {
  Object.keys(_cache).forEach(k => delete _cache[k]);
}

async function apiFetch(path, ttl = TTL) {
  const cached = cacheGet(path, ttl);
  if (cached) return cached;

  const res = await fetch(API_BASE + path, { signal: AbortSignal.timeout(25000) });
  let data;
  try { data = await res.json(); }
  catch { throw new Error(`HTTP ${res.status}`); }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  cacheSet(path, data);
  return data;
}

async function apiHealth() {
  try {
    const d = await apiFetch('/health', 5000);
    return { ok: true, msg: d.server_time_ist };
  } catch (e) {
    return { ok: false, msg: 'Backend offline' };
  }
}

async function apiQuote(symbol) {
  return apiFetch(`/quote/${encodeURIComponent(symbol)}`);
}

async function apiHistory(symbol, range = '1mo', interval = '1d') {
  return apiFetch(`/history/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`, TTL);
}

async function apiBatch(symbols) {
  return apiFetch('/batch?symbols=' + encodeURIComponent(symbols.join(',')));
}

async function apiIndices() {
  return apiFetch('/indices');
}

async function apiSearch(q) {
  if (!q || q.length < 1) return [];
  return apiFetch(`/search?q=${encodeURIComponent(q)}`, 300000); // 5 min cache
}

async function apiMarketStatus() {
  return apiFetch('/market_status', 30000);
}

function inr(n, compact = false) {
  if (n == null || isNaN(n)) return '—';
  if (compact) {
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
    return `₹${n.toFixed(0)}`;
  }
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const isUp  = v => v >= 0;
const fPct  = v => (v >= 0 ? '+' : '') + Number(v).toFixed(2) + '%';
const udc   = v => isUp(v) ? 'up' : 'dn';
const fNum  = n => n ? Number(n).toLocaleString('en-IN') : '—';
