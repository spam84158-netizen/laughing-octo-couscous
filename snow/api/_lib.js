const BASE = () => String(process.env.BANCHECK_API_URL || "https://inconnu-check-ban-api.onrender.com").replace(/\/+$/, "");
export const TIMEOUT = () => Math.max(1000, Math.min(Number(process.env.BANCHECK_TIMEOUT_MS) || 25000, 40000));
export function normalizeNumber(v) {
  let d = String(v ?? "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length < 8 || d.length > 15) throw new Error("Numéro invalide : format international requis.");
  return "+" + d;
}
// 4 statuts : not_banned | banned | undetermined (jamais de "banni" déduit d'une réponse floue)
export function interpretBanStatus(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Réponse invalide du service.");
  if (raw.error) throw new Error(String(raw.error));
  const reason = typeof raw.reason === "string" ? raw.reason : "";
  if (raw.banned === true) return { banned: true, status: "banned", reason };
  if (raw.banned === false) return { banned: false, status: "not_banned", reason };
  return { banned: null, status: "undetermined", reason };
}
export function cors(req, res) {
  const o = req.headers?.origin, ok = String(process.env.BANCHECK_CORS_ORIGIN || "capacitor://localhost,http://localhost,https://localhost").split(",").map(s => s.trim());
  if (o && (ok.includes("*") || ok.includes(o))) { res.setHeader("Access-Control-Allow-Origin", o); res.setHeader("Vary", "Origin"); }
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}
export async function upstream(path, method, body) {
  const c = new AbortController(), t = setTimeout(() => c.abort(), TIMEOUT());
  try {
    const r = await fetch(BASE() + path, { method, headers: { "Content-Type": "application/json", Accept: "application/json" }, body: body ? JSON.stringify(body) : undefined, signal: c.signal });
    const text = await r.text(); let json = null; try { json = JSON.parse(text); } catch {}
    return { ok: r.ok, status: r.status, json };
  } finally { clearTimeout(t); }
}
export async function handle(req, res, { method, path, map }) {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== method) { res.setHeader("Allow", method); return res.status(405).json({ success: false, error: "Méthode non autorisée." }); }
  let number = null;
  if (method === "POST") {
    let b = req.body; if (typeof b === "string") { try { b = JSON.parse(b); } catch { return res.status(400).json({ success: false, error: "Corps JSON invalide." }); } }
    try { number = normalizeNumber(b?.number); } catch (e) { return res.status(400).json({ success: false, error: e.message }); }
  }
  try {
    const u = await upstream(path, method, number ? { number } : null);
    if (!u.ok || !u.json) return res.status(502).json({ success: false, error: `Service indisponible (HTTP ${u.status}).` });
    return res.status(200).json({ success: true, number, ...map(u.json), checkedAt: new Date().toISOString() });
  } catch (e) {
    return res.status(502).json({ success: false, error: e?.name === "AbortError" ? "Le service a dépassé le délai d'attente." : e.message || "Service injoignable." });
  }
}
