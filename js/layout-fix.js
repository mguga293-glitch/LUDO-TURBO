
(function(){const Q=s=>document.querySelector(s),mq=matchMedia('screen');
window.cardPg=n=>Q('#cards').classList.toggle('p2',n===2);
window.emoT=id=>{['emp','cht'].forEach(x=>Q('#'+x).classList.toggle('on',x===id&&!Q('#'+x).classList.contains('on')))};
window.emoS=t=>{t=String(t||'').trim();if(!t)return;['emp','cht'].forEach(x=>Q('#'+x).classList.remove('on'));Q('#chi').value='';
let n='Você';try{n=S.online?(NM[ME]||NAMES[ME]):S.bots?'Você':'Jogador '+(S.cur+1)}catch(e){}
const b=Q('#bub');b.textContent=n+': '+t;b.classList.add('on');clearTimeout(b._t);b._t=setTimeout(()=>b.classList.remove('on'),2800)};
function fix(){const tt=Q('#tt'),die=Q('#die'),bt=Q('#btns'),db=Q('#dbox'),bd=Q('#bd');if(!tt||!bt||!db)return;
if(mq.matches){if(tt.parentNode!==bt)bt.appendChild(tt);if(die&&die.parentNode!==db)db.appendChild(die)}
else{if(tt.parentNode!==db)db.insertBefore(tt,Q('#rb'));if(die&&bd&&die.parentNode!==bd)bd.appendChild(die)}
try{S.pc.forEach((a,q)=>a.forEach((v,i)=>{const e=document.getElementById('p'+q+i);if(e)e.classList.toggle('inb',v<0)}))}catch(e){}
const sb=Q('#sndb'),hd=Q('#hdisc');if(sb)sb.classList.toggle('mu',sb.textContent.includes('🔇'));if(hd)hd.classList.toggle('cx',hd.textContent.includes('Cancelar'))}
try{const r=render;render=function(){const x=r.apply(this,arguments);fix();return x}}catch(e){}
mq.addEventListener&&mq.addEventListener('change',fix);
/* Sem setInterval: o layout é corrigido quando algo realmente muda. */
addEventListener('resize',fix);addEventListener('orientationchange',fix);addEventListener('load',fix);
document.addEventListener('click',()=>setTimeout(fix,0),true);
const mo=new MutationObserver(fix);
['#game','#sndb','#hdisc','#sndm'].forEach(s=>{const e=Q(s);if(e)mo.observe(e,s==='#game'?{attributes:true,attributeFilter:['class']}:{childList:true,characterData:true,subtree:true})});
fix()})();
