export async function onRequestPost({ request, env }) {
  const json = (data, status = 200) => new Response(JSON.stringify(data), {status, headers: {"Content-Type":"application/json; charset=utf-8", "Cache-Control":"no-store"}});
  if (!env.TURNSTILE_SECRET) return json({success:false,error:"Cloudflare Turnstile n'est pas configuré côté serveur."},503);
  let body; try { body = await request.json(); } catch { return json({success:false,error:"Requête invalide."},400); }
  const token = typeof body?.token === "string" ? body.token : "";
  if (!token || token.length > 2048) return json({success:false,error:"Jeton Cloudflare manquant ou invalide."},400);
  try {
    const form = new FormData(); form.append("secret",env.TURNSTILE_SECRET); form.append("response",token);
    const ip=request.headers.get("CF-Connecting-IP"); if(ip) form.append("remoteip",ip);
    const check=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body:form});
    const result=await check.json();
    if(!check.ok || result.success!==true || result.action!=="login") return json({success:false,error:"La vérification Cloudflare a échoué. Réessayez."},403);
    const hostname=new URL(request.url).hostname;
    if(result.hostname && result.hostname!==hostname) return json({success:false,error:"Domaine de vérification inattendu."},403);
    return json({success:true});
  } catch { return json({success:false,error:"Service Cloudflare temporairement indisponible."},502); }
}
