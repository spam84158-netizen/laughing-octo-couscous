(()=>{'use strict';
const ADMIN='yureijianyu@gmail.com',U=window.SUPABASE_URL,K=window.SUPABASE_ANON_KEY;
const sb=(U&&K&&window.supabase)?window.supabase.createClient(U,K):null;
const L={fr:{chk:'Check-Ban',com:'Communauté',rew:'Gains',dev:'Développeur',acc:'Compte',adm:'Admin',send:'Envoyer',in:'Connexion',up:'Inscription',out:'Déconnexion',bal:'Solde',earn:'Gains totaux',wd:'Demander un retrait (min 25 USD)',amt:'Montant',meth:'Moyen / détails',notif:'Notifications',all:'Tout marquer comme lu',msg:'Message…',dm:'Pseudo pour un message privé',open:'Ouvrir',save:'Enregistrer',name:'Nom affiché',bio:'Présentation',nocfg:'Supabase n’est pas configuré (supabase-config.js).',mail:'E-mail',pw:'Mot de passe',forgot:'Mot de passe oublié',members:'membres',gen:'Groupe général'},
en:{chk:'Check-Ban',com:'Community',rew:'Rewards',dev:'Developer',acc:'Account',adm:'Admin',send:'Send',in:'Sign in',up:'Sign up',out:'Sign out',bal:'Balance',earn:'Total earned',wd:'Request withdrawal (min 25 USD)',amt:'Amount',meth:'Method / details',notif:'Notifications',all:'Mark all as read',msg:'Message…',dm:'Username for a private message',open:'Open',save:'Save',name:'Display name',bio:'About',nocfg:'Supabase is not configured (supabase-config.js).',mail:'Email',pw:'Password',forgot:'Forgot password',members:'members',gen:'General group'},
es:{chk:'Check-Ban',com:'Comunidad',rew:'Ganancias',dev:'Desarrollador',acc:'Cuenta',adm:'Admin',send:'Enviar',in:'Entrar',up:'Registrarse',out:'Salir',bal:'Saldo',earn:'Total ganado',wd:'Solicitar retiro (mín 25 USD)',amt:'Importe',meth:'Método / datos',notif:'Notificaciones',all:'Marcar todo como leído',msg:'Mensaje…',dm:'Usuario para mensaje privado',open:'Abrir',save:'Guardar',name:'Nombre',bio:'Presentación',nocfg:'Supabase no está configurado (supabase-config.js).',mail:'Correo',pw:'Contraseña',forgot:'Olvidé mi contraseña',members:'miembros',gen:'Grupo general'}};
let lang=localStorage.getItem('sc-lang')||((navigator.language||'fr').slice(0,2));if(!L[lang])lang='en';
const t=k=>L[lang][k]||k;
const el=(n,a={},...c)=>{const e=document.createElement(n);for(const k in a){if(k==='on')for(const v in a.on)e.addEventListener(v,a.on[v]);else e.setAttribute(k,a[k]);}c.flat().forEach(x=>e.append(x&&x.nodeType?x:document.createTextNode(x??'')));return e;};
const css=document.createElement('style');css.textContent=`#scv{position:fixed;inset:0 0 64px;z-index:40;background:rgba(8,10,18,.97);color:#e8ecf6;overflow:auto;padding:calc(env(safe-area-inset-top,0px)+16px) 16px 24px;display:none;font-family:Inter,system-ui,sans-serif}#scv.on{display:block}
#scn{position:fixed;left:0;right:0;bottom:0;z-index:50;height:64px;padding-bottom:env(safe-area-inset-bottom,0px);display:flex;background:rgba(10,12,22,.92);backdrop-filter:blur(14px);border-top:1px solid #ffffff18}
#scn button{flex:1;background:none;border:0;color:#8e98b3;font:600 11px Inter,sans-serif;transition:.2s}#scn button.on{color:#7cc4ff;transform:translateY(-2px)}#scn i{display:block;font-size:18px;margin-bottom:3px}
#scv h2{font:700 20px 'Space Grotesk',sans-serif;margin:0 0 12px}#scv input,#scv textarea,#scv select{width:100%;box-sizing:border-box;margin:4px 0;padding:11px;border-radius:12px;border:1px solid #ffffff22;background:#ffffff0d;color:#fff;font:14px Inter}
#scv button.b{padding:11px 16px;margin:4px 4px 4px 0;border:0;border-radius:12px;background:#38beff;color:#041018;font:700 14px Inter;cursor:pointer}#scv button.g{background:#ffffff14;color:#fff}
.card{background:#ffffff0c;border:1px solid #ffffff14;border-radius:16px;padding:14px;margin:10px 0;animation:up .3s}.msg{padding:8px 0;border-bottom:1px solid #ffffff0e;font-size:14px}.msg small{color:#8e98b3}.bd{background:#38beff;color:#041018;border-radius:6px;padding:1px 6px;font-size:10px;margin-left:6px;font-weight:700}
@keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}.grid a{cursor:pointer}`;
document.head.append(css);
const box=el('div',{id:'scv'}),nav=el('div',{id:'scn'});document.body.append(box,nav);
let me=null,ch=null,cur='chk';
const tabs=[['chk','fa-shield-halved'],['com','fa-comments'],['rew','fa-wallet'],['dev','fa-code'],['acc','fa-user']];
function drawNav(){setTimeout(()=>window.dispatchEvent(new Event('sc-auth')),0);nav.replaceChildren(...[...tabs,...(me&&me.email&&me.email.toLowerCase()===ADMIN?[['adm','fa-user-shield']]:[])].map(([k,i])=>el('button',{class:k===cur?'on':'',on:{click:()=>go(k)}},el('i',{class:'fa-solid '+i}),t(k))));}
const toast=m=>{const d=el('div',{style:'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:99;background:#16264d;color:#fff;padding:10px 16px;border-radius:12px;font:600 13px Inter'},m);document.body.append(d);setTimeout(()=>d.remove(),2800);};
const err=e=>e&&toast(e.message||String(e));
async function go(k){cur=k;drawNav();if(ch){sb&&sb.removeChannel(ch);ch=null;}box.replaceChildren();if(k==='chk'){box.classList.remove('on');return;}box.classList.add('on');
  if(k==='dev')return vDev();if(!sb)return box.append(el('p',{},t('nocfg')));if(!me)return vAuth();
  ({com:vCom,rew:vRew,acc:vAcc,adm:vAdm}[k]||vAcc)();}
function vAuth(){const A={fr:['Commençons à construire','Connectez-vous ou inscrivez-vous ci-dessous','Mot de passe oublié ?','Continuer','Créer un compte','Conditions d’utilisation','Confidentialité','ou'],en:['Let’s start building','Sign in or sign up below','Forgot password?','Continue','Create account','Terms of use','Privacy','or'],es:['Empecemos a construir','Inicia sesión o regístrate abajo','¿Olvidaste la contraseña?','Continuar','Crear cuenta','Condiciones de uso','Privacidad','o']}[lang];
 const e=el('input',{type:'email',placeholder:'you@example.com',autocomplete:'email'}),p=el('input',{type:'password',placeholder:t('pw'),autocomplete:'current-password'});
 let turnstileToken='',turnstileWidget=null;
 const verifyBox=el('div',{id:'sc-turnstile-box',style:'display:flex;justify-content:center;min-height:66px;margin:14px 0 8px'});
 const loginBtn=el('button',{class:'b',style:'width:100%;margin-top:10px',disabled:'disabled'},A[3]);
 const resetCaptcha=()=>{turnstileToken='';loginBtn.disabled=true;if(window.turnstile&&turnstileWidget!==null)window.turnstile.reset(turnstileWidget);};
 const verifyCaptcha=async()=>{
   if(!turnstileToken){toast(lang==='fr'?'Veuillez d’abord valider le CAPTCHA Cloudflare.':'Please complete the Cloudflare check first.');return false;}
   try{const r=await fetch('/api/turnstile/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:turnstileToken})});const j=await r.json();if(!r.ok||!j.success){resetCaptcha();toast(j.error||'Cloudflare verification failed.');return false;}turnstileToken='';return true;}
   catch(_){resetCaptcha();toast(lang==='fr'?'Vérification Cloudflare indisponible.':'Cloudflare verification unavailable.');return false;}
 };
 const renderCaptcha=()=>{
   const key=window.TURNSTILE_SITE_KEY||'';
   if(!key||key.includes('REMPLACER')){verifyBox.textContent=lang==='fr'?'CAPTCHA Cloudflare : clé publique à configurer.':'Cloudflare CAPTCHA: public site key not configured.';return;}
   if(!window.turnstile)return;
   if(turnstileWidget!==null){try{window.turnstile.remove(turnstileWidget);}catch(_){}turnstileWidget=null;}
   verifyBox.replaceChildren();
   turnstileWidget=window.turnstile.render(verifyBox,{sitekey:key,theme:'auto',size:'normal',appearance:'always',action:'login',callback:(token)=>{turnstileToken=token;loginBtn.disabled=false;},'expired-callback':()=>{turnstileToken='';loginBtn.disabled=true;},'error-callback':()=>{turnstileToken='';loginBtn.disabled=true;toast('Cloudflare CAPTCHA error.');}});
 };
 const oa=(prov,ic,lab)=>el('button',{'aria-label':lab,on:{click:async()=>{if(!await verifyCaptcha())return;const r=await sb.auth.signInWithOAuth({provider:prov,options:{redirectTo:location.origin+location.pathname}});if(r.error)err(r.error);}}},el('i',{class:ic}));
 const lg={firstChild:el('span',{class:'mk'})};
 box.append(el('div',{class:'au'},lg.firstChild,el('h1',{},A[0]),el('p',{class:'sub'},A[1]),
  el('div',{class:'row'},t('mail'),el('a',{on:{click:async()=>{const r=await sb.auth.resetPasswordForEmail(e.value,{redirectTo:location.origin+location.pathname});r.error?err(r.error):toast('✉️');}}},A[2])),e,p,
  verifyBox,loginBtn,
  el('button',{class:'b g',style:'width:100%',on:{click:async()=>{const r=await sb.auth.signUp({email:e.value,password:p.value,options:{emailRedirectTo:location.origin+location.pathname}});r.error?err(r.error):toast('✉️ '+t('mail'));}}},A[4]),
  el('div',{class:'or'},A[7]),el('div',{class:'tiles'},oa('google','fa-brands fa-google','Google'),oa('github','fa-brands fa-github','GitHub'),oa('azure','fa-brands fa-microsoft','Microsoft')),
  el('div',{class:'lg'},el('a',{on:{click:()=>window.SCdocs&&window.SCdocs()}},A[5]),el('a',{on:{click:()=>window.SCdocs&&window.SCdocs()}},A[6]))));
 loginBtn.addEventListener('click',async()=>{if(loginBtn.disabled||!await verifyCaptcha())return;loginBtn.disabled=true;const r=await sb.auth.signInWithPassword({email:e.value,password:p.value});if(r.error){err(r.error);if(window.turnstile&&turnstileWidget!==null)window.turnstile.reset(turnstileWidget);}});
 const ready=()=>{if(window.turnstile)renderCaptcha();};
 if(window.turnstile)ready();else window.addEventListener('sc-turnstile-ready',ready,{once:true});
}
async function thread(host,q,extra){const list=el('div'),inp=el('input',{placeholder:t('msg')}),bar=el('small',{}),stp=el('div',{class:'card',style:'display:none'});let rep=null,edit=null;
 const ab=(x,f)=>el('a',{style:'cursor:pointer;margin-right:8px;font-size:13px',on:{click:f}},x);
 const up=async f=>{if(!f||!/^image\//.test(f.type)||f.size>5e6){toast('Image ≤ 5 Mo');return null;}const path=me.id+'/'+Date.now()+'_'+f.name.replace(/[^\w.]/g,'_');const{error}=await sb.storage.from('media').upload(path,f,{contentType:f.type});if(error){err(error);return null;}return sb.storage.from('media').getPublicUrl(path).data.publicUrl;};
 const send=async f=>{const{error}=await sb.from('messages').insert({...extra,sender:me.id,reply_to:rep,...f});err(error);rep=null;bar.textContent='';load();};
 const row=(m,by,rx)=>{const rc={};rx.filter(r=>r.message_id===m.id).forEach(r=>rc[r.emoji]=(rc[r.emoji]||0)+1);const o=m.sender===me.id;
  return el('div',{class:'msg'},el('b',{},m.profiles?.display_name||m.profiles?.username||'?'),m.profiles?.badge?el('span',{class:'bd'},m.profiles.badge):'',' ',el('small',{},new Date(m.created_at).toLocaleString()+(m.edited_at?' ✎':'')),el('br'),
   m.reply_to&&by[m.reply_to]?el('small',{style:'display:block;border-left:2px solid #38beff;padding-left:6px'},'↩ '+(by[m.reply_to].body||'📷').slice(0,60)):'',
   m.kind==='image'||(m.kind==='sticker'&&m.media_url)?el('img',{src:m.media_url,style:'max-width:'+(m.kind==='sticker'?'120':'240')+'px;border-radius:12px;display:block',loading:'lazy'}):el('span',{style:m.kind==='sticker'?'font-size:44px':''},m.body||''),
   Object.keys(rc).length?el('div',{},...Object.entries(rc).map(([e,n])=>el('small',{style:'margin-right:6px'},e+' '+n))):'',
   el('div',{style:'margin-top:4px'},ab('↩',()=>{rep=m.id;bar.textContent='↩ '+(m.body||'').slice(0,40);inp.focus();}),...['👍','❤️','😂','🔥'].map(e=>ab(e,async()=>{await sb.from('reactions').insert({message_id:m.id,user_id:me.id,emoji:e});load();})),
    ab('📋',()=>navigator.clipboard&&navigator.clipboard.writeText(m.body||'')),
    ...(o?[ab('✏️',()=>{edit=m.id;inp.value=m.body||'';inp.focus();}),ab('🗑',async()=>{await sb.from('messages').update({deleted:true}).eq('id',m.id);load();})]:[ab('🚩',async()=>{const r=prompt('Motif ?');if(r){await sb.from('reports').insert({reporter:me.id,message_id:m.id,reason:r});toast('✔');}}),ab('🚫',async()=>{await sb.from('blocks').insert({blocker:me.id,blocked:m.sender});load();})])));};
 const load=async()=>{const{data,error}=await q();err(error);const ms=(data||[]).reverse(),ids=ms.map(m=>m.id);
  const[{data:rx},{data:bl}]=await Promise.all([ids.length?sb.from('reactions').select('message_id,emoji').in('message_id',ids):{data:[]},sb.from('blocks').select('blocked').eq('blocker',me.id)]);
  const blk=new Set((bl||[]).map(x=>x.blocked)),by={};ms.forEach(m=>by[m.id]=m);list.replaceChildren(...ms.filter(m=>!blk.has(m.sender)).map(m=>row(m,by,rx||[])));list.scrollTop=list.scrollHeight;};
 const stk=async()=>{const{data}=await sb.from('stickers').select('url').eq('owner',me.id).order('created_at',{ascending:false}).limit(30);const fi=el('input',{type:'file',accept:'image/*',style:'display:none',on:{change:async e=>{const u=await up(e.target.files[0]);if(u){await sb.from('stickers').insert({owner:me.id,url:u});stk();}}}});
  stp.replaceChildren(...['😀','😂','😍','😎','🥳','🔥','👍','❤️','🙏','😭'].map(e=>el('a',{style:'font-size:30px;cursor:pointer;margin:4px',on:{click:()=>send({kind:'sticker',body:e})}},e)),
   ...(data||[]).map(x=>el('img',{src:x.url,style:'width:56px;margin:4px;cursor:pointer;border-radius:10px',on:{click:()=>send({kind:'sticker',media_url:x.url})}})),el('br'),el('button',{class:'b g',on:{click:()=>fi.click()}},'+ Créer un sticker (image)'),fi);};
 const pic=el('input',{type:'file',accept:'image/*',style:'display:none',on:{change:async e=>{const u=await up(e.target.files[0]);if(u)send({kind:'image',media_url:u});}}});
 host.append(list,bar,inp,el('button',{class:'b',on:{click:async()=>{const b=inp.value.trim();if(!b)return;if(edit){const x=await sb.from('messages').update({body:b,edited_at:new Date().toISOString()}).eq('id',edit);err(x.error);edit=null;inp.value='';load();return;}inp.value='';send({body:b});}}},t('send')),
  el('button',{class:'b g',on:{click:()=>pic.click()}},'📷'),el('button',{class:'b g',on:{click:()=>{const on=stp.style.display==='none';stp.style.display=on?'block':'none';if(on)stk();}}},'😀'),pic,stp);
 await load();ch=sb.channel('m'+Date.now()).on('postgres_changes',{event:'*',schema:'public',table:'messages'},load).subscribe();}
const SEL='id,body,sender,created_at,reply_to,kind,media_url,edited_at,profiles!messages_sender_fkey(username,display_name,badge)';
async function vCom(){const{data:g}=await sb.from('groups').select('id,name,description').eq('is_general',true).maybeSingle();
 const{count}=await sb.from('group_members').select('*',{count:'exact',head:true}).eq('group_id',g?.id);
 const dm=el('input',{placeholder:t('dm')}),th=el('div');
 box.append(el('h2',{},g?.name||t('gen')),el('small',{},(count||0)+' '+t('members')+' — '+(g?.description||'')),
  el('div',{class:'card'},dm,el('button',{class:'b g',on:{click:async()=>{const{data:o}=await sb.from('profiles').select('id,username').eq('username',dm.value.trim().toLowerCase()).maybeSingle();if(!o)return toast('?');
   th.replaceChildren(el('h2',{},'@'+o.username));if(ch){sb.removeChannel(ch);ch=null;}
   thread(th,()=>sb.from('messages').select(SEL).eq('deleted',false).or(`and(sender.eq.${me.id},dm_to.eq.${o.id}),and(sender.eq.${o.id},dm_to.eq.${me.id})`).order('created_at',{ascending:false}).limit(50),{dm_to:o.id});}}},t('open'))),th);
 {const gn=el('input',{placeholder:'Nom du groupe'}),gd=el('input',{placeholder:'Description'}),gk=el('select',{},...[['public','Public'],['private','Privé'],['invite','Sur invitation']].map(([v,l])=>el('option',{value:v},l))),gl=el('div'),gt=el('div');
  const open=(id,nm)=>{if(ch){sb.removeChannel(ch);ch=null;}gt.replaceChildren(el('h2',{},nm));thread(gt,()=>sb.from('messages').select(SEL).eq('group_id',id).eq('deleted',false).order('created_at',{ascending:false}).limit(50),{group_id:id});};
  const lg=async()=>{const{data}=await sb.from('group_members').select('groups(id,name,is_general)').eq('user_id',me.id);gl.replaceChildren(...(data||[]).map(x=>x.groups).filter(x=>x&&!x.is_general).map(x=>el('button',{class:'b g',on:{click:()=>open(x.id,x.name)}},x.name)));};
  box.append(el('div',{class:'card'},el('b',{},'Groupes'),gn,gd,gk,el('button',{class:'b',on:{click:async()=>{if(!gn.value.trim())return;const{data:ng,error}=await sb.from('groups').insert({name:gn.value.trim(),description:gd.value,kind:gk.value,created_by:me.id}).select('id').single();if(error)return err(error);await sb.from('group_members').insert({group_id:ng.id,user_id:me.id,role:'owner'});gn.value='';lg();}}},'Créer'),gl),gt);lg();}

 if(g){const gh=el('div',{class:'card'});box.append(gh);thread(gh,()=>sb.from('messages').select(SEL).eq('group_id',g.id).eq('deleted',false).order('created_at',{ascending:false}).limit(50),{group_id:g.id});}}
async function vRew(){const[{data:w},{data:r},{data:wd}]=await Promise.all([sb.from('wallets').select('*').eq('user_id',me.id).maybeSingle(),sb.from('rewards').select('*').order('created_at',{ascending:false}).limit(20),sb.from('withdrawals').select('*').order('created_at',{ascending:false}).limit(20)]);
 const a=el('input',{type:'number',min:25,step:'0.01',placeholder:t('amt')}),m=el('input',{placeholder:t('meth')});
 box.append(el('h2',{},t('rew')),el('div',{class:'card'},t('bal')+': $'+Number(w?.balance||0).toFixed(2),el('br'),t('earn')+': $'+Number(w?.total_earned||0).toFixed(2)),
  el('div',{class:'card'},el('b',{},t('wd')),a,m,el('button',{class:'b',on:{click:async()=>{const x=await sb.rpc('request_withdrawal',{p_amount:+a.value,p_method:m.value.split('\n')[0].slice(0,40),p_details:m.value});x.error?err(x.error):(toast('✔'),go('rew'));}}},t('save'))),
  ...(r||[]).map(x=>el('div',{class:'card'},'+$'+x.amount+' · '+x.status+' · '+new Date(x.created_at).toLocaleDateString())),...(wd||[]).map(x=>el('div',{class:'card'},'⇢ $'+x.amount+' · '+x.method+' · '+x.status)));}
async function vAcc(){const{data:p}=await sb.from('profiles').select('*').eq('id',me.id).single();const{data:n}=await sb.from('notifications').select('*').order('created_at',{ascending:false}).limit(30);
 const dn=el('input',{value:p?.display_name||'',placeholder:t('name')}),bio=el('textarea',{placeholder:t('bio')},p?.bio||''),ls=el('select',{},...['fr','en','es'].map(l=>el('option',{value:l,...(l===lang?{selected:''}:{})},l.toUpperCase())));
 ls.addEventListener('change',()=>{lang=ls.value;localStorage.setItem('sc-lang',lang);go('acc');});
 box.append(el('h2',{},'@'+(p?.username||'')),p?.badge?el('span',{class:'bd'},p.badge):'',el('div',{class:'card'},dn,bio,ls,el('button',{class:'b',on:{click:async()=>{const x=await sb.from('profiles').update({display_name:dn.value,bio:bio.value,lang}).eq('id',me.id);x.error?err(x.error):toast('✔');}}},t('save')),el('button',{class:'b g',on:{click:()=>sb.auth.signOut()}},t('out'))),
 el('h2',{},t('notif')),el('button',{class:'b g',on:{click:async()=>{await sb.from('notifications').update({read:true}).eq('user_id',me.id);go('acc');}}},t('all')),
 ...(n||[]).map(x=>el('div',{class:'card',style:x.read?'opacity:.55':''},el('b',{},x.title),el('br'),x.body||'')));}
async function vAdm(){if(!me||me.email?.toLowerCase()!==ADMIN)return;
 const log=(a,x)=>sb.from('audit_log').insert({actor:me.id,action:a,target:String(x)});
 const T={usr:'Utilisateurs',wd:'Retraits',rw:'Récompenses',rp:'Signalements',ch:'Canaux',faq:'FAQ',an:'Annonces',lg:'Journal'};
 let tab=localStorage.getItem('sc-admtab');if(!T[tab])tab='usr';const body=el('div');
 const bt=(x,f,g)=>el('button',{class:'b'+(g?' g':''),on:{click:f}},x);
 const R={
  usr:async()=>{const{data}=await sb.from('profiles').select('id,username,role,badge,suspended').order('created_at',{ascending:false}).limit(100);
   body.append(...(data||[]).map(x=>{const r=el('select',{},...['member','moderator','admin'].map(v=>el('option',{value:v,...(x.role===v?{selected:''}:{})},v)));
    const b=el('select',{},...['','admin','moderator','developer','official','verified','contributor'].map(v=>el('option',{value:v,...((x.badge||'')===v?{selected:''}:{})},v||'— badge')));
    r.onchange=async()=>{const q=await sb.from('profiles').update({role:r.value}).eq('id',x.id);q.error?err(q.error):(log('role:'+r.value,x.username),toast('✔'));};
    b.onchange=async()=>{const q=await sb.from('profiles').update({badge:b.value||null}).eq('id',x.id);q.error?err(q.error):(log('badge:'+b.value,x.username),toast('✔'));};
    return el('div',{class:'card'},'@'+x.username+(x.suspended?' · suspendu':''),r,b,bt(x.suspended?'Réactiver':'Suspendre',async()=>{await sb.from('profiles').update({suspended:!x.suspended}).eq('id',x.id);log(x.suspended?'unsuspend':'suspend',x.username);show();},1));}));},
  wd:async()=>{const{data}=await sb.from('withdrawals').select('*').in('status',['pending','processing','approved']).order('created_at');
   body.append(...(data||[]).map(x=>el('div',{class:'card'},'$'+x.amount+' · '+x.method+' · '+x.status,el('br'),el('small',{},x.details||''),el('br'),...['processing','approved','rejected','paid'].map(s=>bt(s,async()=>{const q=await sb.rpc('admin_set_withdrawal',{p_id:x.id,p_status:s});q.error?err(q.error):show();},1)))),...(data&&data.length?[]:[el('p',{},'Aucune demande en cours.')]));},
  rw:async()=>{const{data}=await sb.from('rewards').select('*').eq('status','pending');
   body.append(...(data||[]).map(x=>el('div',{class:'card'},'$'+x.amount+' · '+new Date(x.created_at).toLocaleString(),el('br'),bt('Approuver',async()=>{const q=await sb.rpc('approve_reward',{p_id:x.id});q.error?err(q.error):show();}),bt('Refuser',async()=>{await sb.from('rewards').update({status:'rejected'}).eq('id',x.id);log('reject_reward',x.id);show();},1))),...(data&&data.length?[]:[el('p',{},'Aucune récompense en attente.')]));},
  rp:async()=>{const{data}=await sb.from('reports').select('id,reason,message_id,messages(body)').eq('status','open');
   body.append(...(data||[]).map(x=>el('div',{class:'card'},x.reason||'',el('br'),el('small',{},x.messages?.body||''),el('br'),bt('Supprimer le message',async()=>{await sb.from('messages').update({deleted:true}).eq('id',x.message_id);await sb.from('reports').update({status:'actioned'}).eq('id',x.id);log('delete_message',x.message_id);show();}),bt('Clore',async()=>{await sb.from('reports').update({status:'closed'}).eq('id',x.id);show();},1))),...(data&&data.length?[]:[el('p',{},'Aucun signalement.')]));},
  ch:async()=>{const{data}=await sb.from('channels').select('*').order('sort');const f=['Catégorie','Nom','URL https://','Logo (classe FontAwesome, ex : fa-brands fa-telegram)'].map(k=>el('input',{placeholder:k}));
   body.append(el('div',{class:'card'},...f,bt('Ajouter',async()=>{const[c,n,u,l]=f.map(i=>i.value.trim());if(!n||!/^https?:\/\//.test(u))return toast('URL https requise');await sb.from('channels').insert({category:c||'Communautés',name:n,url:u,logo:l||null});log('channel_add',n);show();})),
    ...(data||[]).map(x=>el('div',{class:'card'},x.category+' · '+x.name,el('br'),el('small',{},x.url),el('br'),bt(x.active?'Masquer':'Afficher',async()=>{await sb.from('channels').update({active:!x.active}).eq('id',x.id);show();},1),bt('Supprimer',async()=>{await sb.from('channels').delete().eq('id',x.id);log('channel_del',x.name);show();},1))));},
  faq:async()=>{const{data}=await sb.from('faq').select('*').order('lang').order('sort');const lg=el('select',{},...['fr','en','es'].map(v=>el('option',{value:v},v))),q=el('input',{placeholder:'Question'}),a=el('textarea',{placeholder:'Réponse'});
   body.append(el('div',{class:'card'},lg,q,a,bt('Ajouter',async()=>{if(!q.value.trim()||!a.value.trim())return;await sb.from('faq').insert({lang:lg.value,q:q.value.trim(),a:a.value.trim()});log('faq_add',q.value);show();})),
    ...(data||[]).map(x=>el('div',{class:'card'},'['+x.lang+'] '+x.q,el('br'),el('small',{},x.a),el('br'),bt('Supprimer',async()=>{await sb.from('faq').delete().eq('id',x.id);log('faq_del',x.id);show();},1))));},
  an:async()=>{const{data}=await sb.from('announcements').select('*').order('created_at',{ascending:false}).limit(30);const ti=el('input',{placeholder:'Titre'}),bo=el('textarea',{placeholder:'Texte'});
   body.append(el('div',{class:'card'},ti,bo,bt('Publier',async()=>{if(!ti.value.trim())return;await sb.from('announcements').insert({title:ti.value.trim(),body:bo.value});log('announce',ti.value);show();})),
    ...(data||[]).map(x=>el('div',{class:'card'},el('b',{},x.title),el('br'),x.body||'',el('br'),bt('Supprimer',async()=>{await sb.from('announcements').delete().eq('id',x.id);show();},1))));},
  lg:async()=>{const{data}=await sb.from('audit_log').select('*').order('created_at',{ascending:false}).limit(80);
   body.append(...(data||[]).map(x=>el('div',{class:'card'},el('b',{},x.action),' · ',x.target||'',el('br'),el('small',{},new Date(x.created_at).toLocaleString()))));}};
 const show=async()=>{body.replaceChildren();try{await R[tab]();}catch(e){err(e);}};
 box.append(el('h2',{},'Administration'),el('div',{style:'display:flex;gap:6px;overflow-x:auto;margin-bottom:12px'},...Object.entries(T).map(([k,l])=>bt(l,()=>{tab=k;localStorage.setItem('sc-admtab',k);show();},k!==tab))),body);show();}
const vAdmReload=()=>go('adm');
const DEV=[['Communautés','Chaîne WhatsApp','https://whatsapp.com/channel/0029VbDkVUS5Ui2gyY7hmE0Y','fa-brands fa-whatsapp'],['Communautés','Canal Telegram','https://t.me/Aldetic_Ltd','fa-brands fa-telegram'],['Communautés','Groupe Aldetic Chat','https://t.me/AldeticChat','fa-brands fa-telegram'],['Communautés','Groupe Aldetic Bio','https://t.me/AldeticBio','fa-brands fa-telegram'],['Développement','Seen Angel','https://t.me/Seen_Angel','fa-brands fa-telegram']];
async function vDev(){let rows=DEV;if(sb){const{data}=await sb.from('channels').select('category,name,url,logo').eq('active',true).order('sort');if(data&&data.length)rows=data.map(d=>[d.category,d.name,d.url,d.logo||'fa-solid fa-link']);}
 const cats=[...new Set(rows.map(r=>r[0]))];box.append(el('h2',{},t('dev')),...cats.flatMap(c=>[el('small',{},c),el('div',{class:'grid'},...rows.filter(r=>r[0]===c).map(r=>el('a',{class:'card',on:{click:()=>window.open(r[2],'_blank','noopener')}},el('i',{class:r[3],style:'font-size:26px'}),el('br'),el('b',{},r[1]))))]));}
window.addEventListener('chek-result',async e=>{if(!sb||!me)return;const{num,banned}=e.detail;const{data,error}=await sb.from('checks').insert({user_id:me.id,number:num,status:banned?'banned':'not_banned'}).select('id').single();if(error)return;
 if(banned){const{data:r}=await sb.rpc('claim_reward',{p_check:data.id});if(r==='pending_review')toast('🎉 +0,50 USD (validation admin)');}});
if(sb){sb.auth.getSession().then(({data})=>{me=data.session?.user||null;drawNav();});sb.auth.onAuthStateChange((_e,s)=>{me=s?.user||null;drawNav();if(cur!=='chk'&&cur!=='dev')go(cur);});}
window.SC={go,me:()=>me,sb,open:(k,f)=>{cur=k;if(ch&&sb){sb.removeChannel(ch);ch=null;}box.replaceChildren();box.classList.add('on');f(box);}};
drawNav();})();
