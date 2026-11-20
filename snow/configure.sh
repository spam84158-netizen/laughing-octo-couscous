#!/usr/bin/env bash
# Configure Snow Cloud Chek : remplit les 4 clés PUBLIQUES du front.
# Usage interactif : bash configure.sh
# Usage direct    : TS_KEY=... SB_URL=... SB_ANON=... API_URL=... bash configure.sh
set -e
cd "$(dirname "$0")/inconnuboy"

ask() { # ask VAR "question"
  local v="${!1}"
  if [ -z "$v" ]; then read -r -p "$2 : " v; fi
  printf '%s' "$v" | tr -d ' \r\n"\\'
}
esc() { printf '%s' "$1" | sed 's/[|&\\]/\\&/g'; }

TS_KEY=$(ask TS_KEY "Turnstile Site Key (Cloudflare > Turnstile)")
SB_URL=$(ask SB_URL "Supabase URL (https://xxxx.supabase.co)")
SB_ANON=$(ask SB_ANON "Supabase anon public key")
API_URL=$(ask API_URL "URL API Check-Ban Vercel (https://xxx.vercel.app/api/check, vide = ignorer)")

[ -n "$TS_KEY" ]  && sed -i "s|^window.TURNSTILE_SITE_KEY = .*|window.TURNSTILE_SITE_KEY = \"$(esc "$TS_KEY")\";|" turnstile-config.js
[ -n "$SB_URL" ]  && sed -i "s|^window.SUPABASE_URL = .*|window.SUPABASE_URL = \"$(esc "$SB_URL")\";|" supabase-config.js
[ -n "$SB_ANON" ] && sed -i "s|^window.SUPABASE_ANON_KEY = .*|window.SUPABASE_ANON_KEY = \"$(esc "$SB_ANON")\";|" supabase-config.js
[ -n "$API_URL" ] && sed -i "s|^window.CHECK_BAN_API_URL = .*|window.CHECK_BAN_API_URL = \"$(esc "$API_URL")\";|" api-config.js

echo "--- Résultat ---"
grep -h "^window\." turnstile-config.js supabase-config.js api-config.js
echo "OK. Reste à faire : secret TURNSTILE_SECRET dans Cloudflare Pages (voir .env.example)."
