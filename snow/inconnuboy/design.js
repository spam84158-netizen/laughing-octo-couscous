(()=>{'use strict';const $=id=>document.getElementById(id),LS=localStorage,R=document.documentElement.style;
const ring=document.querySelector('.intro-ring');if(ring)ring.innerHTML='<img class="fulllogo" src="./icons/logo.svg" alt="Snow Cloud">';
const fb=document.querySelector('.badge-photo .fallback');if(fb)fb.innerHTML='<span class="mk" style="width:70%"></span>';
const sb=$('sealBrand');
document.querySelectorAll('.app-screen').forEach(s=>s.classList.add('screen-pad'));
if(!LS.getItem('xyl-color'))R.setProperty('--accent','#2f6bff');
const K=[['--btn-c','Boutons'],['--bd-c','Bordures'],['--ok-c','Résultat positif'],['--ban-c','Résultat négatif'],['--note-c','Notifications'],['--acc2','Couleur secondaire']];
let col={};try{col=JSON.parse(LS.getItem('sc-colors')||'{}');}catch{}
const ap=()=>K.forEach(([v])=>col[v]?R.setProperty(v,col[v]):R.removeProperty(v));ap();
const panel=document.querySelector('[data-panel="settings"] .panel-inner'),anchor=panel&&panel.querySelector('.btn-row');
if(panel&&anchor){const b=document.createElement('div');b.className='set-block';
 b.innerHTML='<div class="set-label"><i class="fa-solid fa-droplet"></i> Couleurs détaillées</div>'+K.map(([v,l])=>`<label style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;font-size:.85rem">${l}<input type="color" data-v="${v}" value="${col[v]||'#5cc8ff'}"></label>`).join('')
 +'<div class="set-label" style="margin-top:16px"><i class="fa-solid fa-image"></i> Arrière-plan</div><label style="display:block;font-size:.85rem;margin-top:8px">Opacité de l’image<input id="bgOp" type="range" min="10" max="100" value="100" style="width:100%"></label><label style="display:block;font-size:.85rem;margin-top:8px">Position<select id="bgPos" class="set-input"><option value="center">Centre</option><option value="top">Haut</option><option value="bottom">Bas</option><option value="left">Gauche</option><option value="right">Droite</option></select></label><label class="upload-label" style="margin-top:10px"><i class="fa-solid fa-video"></i> Vidéo de fond (session)<input type="file" id="bgVideo" accept="video/*"></label><span class="clear-mini" id="bgVideoClear">Retirer la vidéo</span><button class="resetbtn" id="scColReset" style="margin-top:10px">Réinitialiser les couleurs</button>';
 anchor.parentNode.insertBefore(b,anchor);
 b.addEventListener('input',e=>{const v=e.target.dataset.v;if(!v)return;col[v]=e.target.value;ap();LS.setItem('sc-colors',JSON.stringify(col));});
 $('scColReset').onclick=()=>{col={};LS.removeItem('sc-colors');ap();b.querySelectorAll('[data-v]').forEach(i=>i.value='#5cc8ff');};
 const bg=$('bgPhoto');const bo=LS.getItem('sc-bgop'),bp=LS.getItem('sc-bgpos');if(bg){if(bo){bg.style.opacity=bo/100;$('bgOp').value=bo;}if(bp){bg.style.objectPosition=bp;$('bgPos').value=bp;}}
 $('bgOp').oninput=e=>{if(bg)bg.style.opacity=e.target.value/100;LS.setItem('sc-bgop',e.target.value);};
 $('bgPos').onchange=e=>{if(bg)bg.style.objectPosition=e.target.value;LS.setItem('sc-bgpos',e.target.value);};
 let vid=null;$('bgVideo').onchange=e=>{const f=e.target.files[0];if(!f)return;if(vid)vid.remove();vid=Object.assign(document.createElement('video'),{src:URL.createObjectURL(f),autoplay:true,loop:true,muted:true,playsInline:true});vid.style.cssText='position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:-1;opacity:.55';document.body.prepend(vid);};
 $('bgVideoClear').onclick=()=>{if(vid){vid.remove();vid=null;}};}
})();
