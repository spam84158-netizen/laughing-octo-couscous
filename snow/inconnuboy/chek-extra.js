(()=>{'use strict';
const $=id=>document.getElementById(id),LS=localStorage;
const C=[['CI','Côte d’Ivoire',225],['FR','France',33],['BE','Belgique',32],['CH','Suisse',41],['CA','Canada',1],['US','États-Unis',1],['GB','Royaume-Uni',44],['ES','Espagne',34],['PT','Portugal',351],['IT','Italie',39],['DE','Allemagne',49],['BR','Brésil',55],['MX','Mexique',52],['AR','Argentine',54],['CO','Colombie',57],['MA','Maroc',212],['DZ','Algérie',213],['TN','Tunisie',216],['SN','Sénégal',221],['ML','Mali',223],['BF','Burkina Faso',226],['TG','Togo',228],['BJ','Bénin',229],['GN','Guinée',224],['CM','Cameroun',237],['GA','Gabon',241],['CG','Congo',242],['CD','RD Congo',243],['NG','Nigeria',234],['GH','Ghana',233],['KE','Kenya',254],['ZA','Afrique du Sud',27],['EG','Égypte',20],['MG','Madagascar',261],['HT','Haïti',509],['IN','Inde',91],['PK','Pakistan',92],['ID','Indonésie',62],['TR','Turquie',90],['SA','Arabie saoudite',966],['AE','Émirats arabes unis',971],['RU','Russie',7]];
/* Pays + indicatif */
const sel=document.createElement('select');sel.id='scCountry';sel.setAttribute('aria-label','Pays');
sel.style.cssText='width:100%;margin:0 0 8px;padding:12px;border-radius:12px;border:1px solid #ffffff22;background:#ffffff0d;color:inherit;font:600 14px Inter,sans-serif';
sel.innerHTML='<option value="">🌍 Pays / indicatif…</option>'+C.map(c=>`<option value="${c[2]}">${c[0]} · ${c[1]} (+${c[2]})</option>`).join('');
const nf=$('nfield');if(nf)nf.parentNode.insertBefore(sel,nf);sel.value=LS.getItem('sc-country')||'';
sel.addEventListener('change',()=>LS.setItem('sc-country',sel.value));
$('cbtn')?.addEventListener('click',()=>{const p=$('phone'),v=p.value.trim();if(sel.value&&v&&!/^(\+|00)/.test(v))p.value='+'+sel.value+v.replace(/\D/g,'').replace(/^0+/,'');},true);
/* Recherche + filtres dans l'historique */
const hl=$('histList');if(hl){const bar=document.createElement('div');bar.style.cssText='display:flex;gap:6px;margin:8px 0';
 const q=Object.assign(document.createElement('input'),{placeholder:'Rechercher un numéro…',type:'search'}),f=document.createElement('select');
 f.innerHTML='<option value="">Tous</option><option value="ban">Bannis</option><option value="ok">Non bannis</option>';
 for(const e of[q,f])e.style.cssText='flex:1;padding:10px;border-radius:10px;border:1px solid #ffffff22;background:#ffffff0d;color:inherit';
 bar.append(q,f);hl.parentNode.insertBefore(bar,hl);
 const run=()=>[...hl.children].forEach(n=>{const tx=n.textContent.toLowerCase(),isBan=!!n.querySelector('.ban');n.style.display=(!q.value||tx.includes(q.value.toLowerCase().replace(/\s/g,'')))&&(!f.value||(f.value==='ban')===isBan)?'':'none';});
 q.addEventListener('input',run);f.addEventListener('change',run);new MutationObserver(run).observe(hl,{childList:true});}
/* Typographie, messages, aperçu, enregistrer / annuler / réinitialiser */
const FONTS=['Inter','Manrope','Plus Jakarta Sans','DM Sans','Space Grotesk','Outfit'],D={font:'Inter',h:100,t:100,w:500,ls:0,load:'',err:'',chg:''};
const get=()=>{try{return{...D,...JSON.parse(LS.getItem('sc-typo')||'{}')};}catch{return{...D};}};
let cfg=get(),snap=get();
const st=document.createElement('style');document.head.append(st);
function apply(c){st.textContent=`body,button,input,select,textarea{font-family:'${c.font}',system-ui,sans-serif!important;letter-spacing:${c.ls}px}body{font-size:${c.t}%;font-weight:${c.w}}h1,h2,.app-title,.title-sign,.panel-title{font-size:calc(1em * ${c.h/100});font-family:'${c.font}',sans-serif!important}`;
 const sp=document.querySelector('#spin span');if(sp&&c.load)sp.textContent=c.load;}
apply(cfg);
const panel=document.querySelector('[data-panel="settings"] .panel-inner'),anchor=panel&&panel.querySelector('.btn-row');
if(panel&&anchor){const blk=document.createElement('div');blk.className='set-block';
 const sl=(k,l,min,max,step)=>`<label style="display:block;font-size:.8rem;margin-top:8px">${l} <b id="v_${k}"></b><input data-k="${k}" type="range" min="${min}" max="${max}" step="${step}" style="width:100%"></label>`;
 const tx=(k,l)=>`<input class="set-input" data-k="${k}" placeholder="${l}" maxlength="80" style="margin-top:8px">`;
 blk.innerHTML=`<div class="set-label"><i class="fa-solid fa-font"></i> Typographie</div><select data-k="font" class="set-input">${FONTS.map(f=>`<option>${f}</option>`).join('')}</select>${sl('h','Taille des titres (%)',70,160,5)}${sl('t','Taille des textes (%)',80,130,5)}${sl('w','Graisse',300,800,100)}${sl('ls','Espacement (px)',-1,4,.5)}
 <div class="set-label" style="margin-top:14px"><i class="fa-solid fa-message"></i> Messages personnalisés</div>${tx('load','Message de chargement')}${tx('err','Message d’erreur')}${tx('chg','Message de changement de statut')}
 <div id="scPrev" style="margin-top:12px;padding:14px;border-radius:14px;border:1px dashed #ffffff33"><h2 style="margin:0">Aperçu — Snow Cloud Chek</h2><p style="margin:6px 0 0">Le texte courant s’affiche ainsi, en direct.</p></div>
 <div class="btn-row" style="margin-top:12px"><button class="savebtn" id="scSave">Enregistrer</button><button class="resetbtn" id="scCancel">Annuler</button><button class="resetbtn" id="scDef">Par défaut</button><button class="resetbtn" id="scRestore">Précédents</button></div>`;
 anchor.parentNode.insertBefore(blk,anchor);
 const fill=()=>blk.querySelectorAll('[data-k]').forEach(i=>{i.value=cfg[i.dataset.k];const v=$('v_'+i.dataset.k);if(v)v.textContent=cfg[i.dataset.k];});
 blk.addEventListener('input',e=>{const k=e.target.dataset.k;if(!k)return;cfg[k]=e.target.type==='range'?+e.target.value:e.target.value;const v=$('v_'+k);if(v)v.textContent=cfg[k];apply(cfg);});
 $('scSave').onclick=()=>{LS.setItem('sc-prev',LS.getItem('sc-typo')||'{}');LS.setItem('sc-typo',JSON.stringify(cfg));snap={...cfg};};
 $('scCancel').onclick=()=>{cfg={...snap};apply(cfg);fill();};
 $('scDef').onclick=()=>{cfg={...D};apply(cfg);fill();};
 $('scRestore').onclick=()=>{try{cfg={...D,...JSON.parse(LS.getItem('sc-prev')||'{}')};}catch{cfg={...D};}apply(cfg);fill();};
 $('mSettings')?.addEventListener('click',()=>{snap=get();cfg={...snap};fill();});fill();}
/* Statut « indéterminé » / erreur personnalisés : relais du toast existant */
const T=$('toast');if(T)new MutationObserver(()=>{if(cfg.err&&/indéterminé|injoignable|illisible|invalide|délai|trop de temps/i.test(T.textContent)&&T.dataset.done!==T.textContent){T.dataset.done=cfg.err;T.textContent=cfg.err;}}).observe(T,{childList:true,characterData:true,subtree:true});
/* Changement de statut observé */
window.addEventListener('chek-result',e=>{try{const h=JSON.parse(LS.getItem('xyl-hist')||'[]').filter(x=>x.num===e.detail.num);if(h.length>1&&h[1].banned!==e.detail.banned){const m=cfg.chg||'Changement de statut détecté pour '+e.detail.num;if(T){T.textContent=m;T.classList.add('show');setTimeout(()=>T.classList.remove('show'),3500);}}}catch{}});
})();
