/* Dado e peão do duelo, Sorte ou Azar, duelo local e duelo online (espectador) */
/* ===== Duelo: dado 3D (CSS) e peão brilhante (SVG) ===== */
const DQ=[[0,0],[0,-90],[-90,0],[90,0],[0,90],[0,180]];
const dieTf=(v,n)=>{const q=DQ[(v||1)-1];return `rotateX(${q[0]-720*n}deg) rotateY(${q[1]-1440*n}deg)`};
/* mesmo cubo do dado do tabuleiro (classes .fc/.pp/.f1-.f6 e PIP) */
function dieFace(v){return `<div class="dhl"></div><div class="dsh"></div><div class="dfl"><div class="dcube" style="transform:${dieTf(v,0)}">${[1,2,3,4,5,6].map(n=>'<div class="fc f'+n+'">'+[0,1,2,3,4,5,6,7,8].map(k=>'<i class="pp'+(PIP[n].includes(k)?'':' x')+'"></i>').join('')+'</div>').join('')}</div></div>`}
function dieRoll(el,v){return new Promise(res=>{const c=el.querySelector('.dcube');if(!c){res();return}
c.style.transition='transform 1.05s cubic-bezier(.15,.7,.2,1)';void c.offsetWidth;c.style.transform=dieTf(v,1);
el.classList.add('hop');setTimeout(()=>{el.classList.remove('hop');c.style.transition='none';c.style.transform=dieTf(v,0);res()},1150)})}
function pawnSVG(hex,id){const mix=(h,t,a)=>{const n=parseInt(h.slice(1),16),r=[n>>16,n>>8&255,n&255],T=t?255:0;return '#'+r.map(c=>Math.round(c+(T-c)*a).toString(16).padStart(2,'0')).join('')};
const L=mix(hex,1,.55),M=mix(hex,1,.18),D=mix(hex,0,.35),X=mix(hex,0,.6);
return `<svg class="pawn" viewBox="0 0 120 170" aria-hidden="true"><defs>
<linearGradient id="b${id}" x1="0" x2="1"><stop offset="0" stop-color="${X}"/><stop offset=".22" stop-color="${D}"/><stop offset=".45" stop-color="${L}"/><stop offset=".62" stop-color="${M}"/><stop offset="1" stop-color="${X}"/></linearGradient>
<radialGradient id="h${id}" cx=".34" cy=".28" r=".85"><stop offset="0" stop-color="#fff"/><stop offset=".18" stop-color="${L}"/><stop offset=".55" stop-color="${hex}"/><stop offset="1" stop-color="${X}"/></radialGradient>
<linearGradient id="r${id}" x1="0" x2="1"><stop offset="0" stop-color="${D}"/><stop offset=".4" stop-color="${L}"/><stop offset="1" stop-color="${X}"/></linearGradient></defs>
<ellipse cx="60" cy="152" rx="57" ry="14" fill="${X}"/><ellipse cx="60" cy="148" rx="57" ry="14" fill="url(#r${id})"/><ellipse cx="60" cy="142" rx="50" ry="11" fill="${M}" opacity=".9"/>
<path d="M14 143C18 119 38 106 47 82H73C82 106 102 119 106 143C90 155 30 155 14 143Z" fill="url(#b${id})"/>
<path d="M32 138C36 120 46 108 53 88" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none" opacity=".5"/>
<ellipse cx="60" cy="82" rx="23" ry="7" fill="${D}"/><ellipse cx="60" cy="78" rx="23" ry="7" fill="${L}"/>
<circle cx="60" cy="50" r="29" fill="url(#h${id})"/><ellipse cx="49" cy="36" rx="10" ry="6.5" fill="#fff" opacity=".85" transform="rotate(-30 50 35)"/><circle cx="73" cy="62" r="4" fill="#fff" opacity=".25"/></svg>`}
/* Sorte ou Azar: mostra o dado na tela; humano toca para lançar, bot lança sozinho */
async function sorteDado(p){const o=$('#sa'),el=$('#sad'),msg=$('#sar'),v=1+R(6);
 el.style.setProperty('--c',COL[p]);el.className='dd';el.innerHTML=dieFace(0);msg.textContent='';o.classList.add('on');
 const auto=isBot(p)||(S.online&&p!==ME);
 await new Promise(res=>{const run=async()=>{el.classList.remove('rdy');el.onclick=null;msg.textContent='';SFX.dice();await dieRoll(el,v);res()};
  if(auto){msg.textContent=NAMES[p]+' lança o dado...';w(600).then(run)}
  else{msg.textContent=NAMES[p]+': toque no dado para lançar!';el.classList.add('rdy');el.onclick=()=>run().catch(()=>{})}});
 msg.textContent=v<=3?`Azar! Tirou ${v}: recua 3 casas`:`Sorte! Tirou ${v}: avança 5 casas`;v<=3?SFX.denied():SFX.luck();
 await w(1500);o.classList.remove('on');return v}
async function duelUI(p,i,q,j){const pu=(id,z)=>`<div class="dpw" style="--c:${COL[z]}"><i class="ped"></i>${pawnSVG(COL[z],id)}</div><div class="nm">${NAMES[z]}</div><div class="dd" id="${id}" style="--c:${COL[z]}">${dieFace(0)}</div>`;
$('#du1').innerHTML=pu('dd1',p);$('#du2').innerHTML=pu('dd2',q);$('#dur').textContent='';$('#du').classList.add('on');SFX.duel();DUELING=true;S.duel={t:Date.now(),p:p,i:i,q:q,j:j,r:[]};if(S.online)push();
const e1=$(`#p${p}${i}`),e2=$(`#p${q}${j}`),a=$('#dd1'),b=$('#dd2'),F='⚀⚁⚂⚃⚄⚅';e1.classList.add('duel');e2.classList.add('duel');await w(800);let x,y;
const dr=(el,z)=>new Promise(res=>{const run=async()=>{el.classList.remove('rdy');el.onclick=null;el.classList.add('rl');const v=1+R(6);if(S.duel){S.duel.r.push(v);if(S.online)push()}SFX.dice();await dieRoll(el,v);el.classList.remove('rl');await w(500);res(v)};if(isBot(z)||(S.online&&z!==ME)){$('#dur').textContent=NAMES[z]+' lança o dado...';w(500).then(run)}else{$('#dur').textContent=NAMES[z]+': toque no dado para lançar!';el.classList.add('rdy');el.onclick=()=>run().catch(()=>{})}});
for(;;){a.innerHTML=dieFace(0);b.innerHTML=dieFace(0);x=await dr(a,p);y=await dr(b,q);await w(600);if(x!==y)break;$('#dur').textContent='Empate! Jogam de novo...';SFX.tie();await w(900)}
$('#dur').textContent=`${NAMES[x>y?p:q]} vence o duelo!`;duelSfx(x>y?p:q);SFX.slash();(x>y?a:b).classList.add('win');(x>y?b:a).classList.add('lose');await w(1400);
$('#du').classList.remove('on');e1.classList.remove('duel');e2.classList.remove('duel');S.duel=null;DUELING=false;if(S.online)push();return x>y}
/* ===== Duelo online: quem não está jogando a vez também assiste (mesmo dado e mesmo som) ===== */
function duelWatch(){if(DUELING)return;const d=S.duel;
 if(d&&d.t!==DT){if(DW&&DW.t!==d.t){DW.end=true;return}if(!DW)DW={t:d.t,r:[],k:0,end:false,run:false};DW.r=d.r.slice();if(!DW.run)duelPlay(DW)}
 else if(DW)DW.end=true}
async function duelPlay(W){W.run=true;const d=S.duel,p=d.p,i=d.i,q=d.q,j=d.j;
 const pu=(id,z)=>`<div class="dpw" style="--c:${COL[z]}"><i class="ped"></i>${pawnSVG(COL[z],id)}</div><div class="nm">${NAMES[z]}</div><div class="dd" id="${id}" style="--c:${COL[z]}">${dieFace(0)}</div>`;
 $('#du1').innerHTML=pu('dd1',p);$('#du2').innerHTML=pu('dd2',q);$('#dur').textContent='';$('#du').classList.add('on');SFX.duel();
 const e1=$(`#p${p}${i}`),e2=$(`#p${q}${j}`),a=$('#dd1'),b=$('#dd2');if(e1)e1.classList.add('duel');if(e2)e2.classList.add('duel');
 try{await w(800);let x,y;
  for(;;){a.innerHTML=dieFace(0);b.innerHTML=dieFace(0);
   for(let n=0;n<2;n++){
    while(W.k>=W.r.length){if(W.end)throw 0;await w(100)}
    const v=W.r[W.k++],el=n?b:a,z=n?q:p;
    $('#dur').textContent=NAMES[z]+' lança o dado...';el.classList.add('rl');SFX.dice();await dieRoll(el,v);el.classList.remove('rl');await w(500);
    if(n)y=v;else x=v}
   await w(600);if(x!==y)break;
   $('#dur').textContent='Empate! Jogam de novo...';SFX.tie();await w(900)}
  const wn=x>y?p:q;$('#dur').textContent=`${NAMES[wn]} vence o duelo!`;if(ME===p||ME===q)duelSfx(wn);SFX.slash();
  (x>y?a:b).classList.add('win');(x>y?b:a).classList.add('lose');await w(1400)
 }catch(e){}
 $('#du').classList.remove('on');if(e1)e1.classList.remove('duel');if(e2)e2.classList.remove('duel');
 DT=W.t;W.run=false;if(DW===W)DW=null}
