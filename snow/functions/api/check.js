// Check-Ban pour Cloudflare Pages (remplace api/check.js de Vercel).
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
});

function normalizeNumber(v) {
  let d = String(v ?? "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length < 8 || d.length > 15) throw new Error("Numéro invalide : format international requis.");
  return "+" + d;
}

function interpretBanStatus(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Réponse invalide du service.");
  if (raw.error) throw new Error(String(raw.error));
  const reason = typeof raw.reason === "string" ? raw.reason : "";
  if (raw.banned === true) return { banned: true, status: "banned", reason };
  if (raw.banned === false) return { banned: false, status: "not_banned", reason };
  return { banned: null, status: "undetermined", reason };
}

export async function onRequestPost({ request, env }) {
  const base = String(env.BANCHECK_API_URL || "https://inconnu-check-ban-api.onrender.com").replace(/\/+$/, "");
  const timeout = Math.max(1000, Math.min(Number(env.BANCHECK_TIMEOUT_MS) || 25000, 40000));
  let body; try { body = await request.json(); } catch { return json({ success: false, error: "Corps JSON invalide." }, 400); }
  let number; try { number = normalizeNumber(body?.number); } catch (e) { return json({ success: false, error: e.message }, 400); }
  try {
    const r = await fetch(base + "/check", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ number }),
      signal: AbortSignal.timeout(timeout)
    });
    const data = await r.json().catch(() => null);
    if (!r.ok || !data) return json({ success: false, error: `Service indisponible (HTTP ${r.status}).` }, 502);
    return json({ success: true, number, ...interpretBanStatus(data), checkedAt: new Date().toISOString() });
  } catch (e) {
    const timedOut = e?.name === "TimeoutError" || e?.name === "AbortError";
    return json({ success: false, error: timedOut ? "Le service a dépassé le délai d'attente." : (e.message || "Service injoignable.") }, 502);
  }
}
