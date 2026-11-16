/* Cartas: dados das cartas, escolha, casa Estrela, efeitos, mão e descarte, bots */
/* limite de cartas na mão (a casa Estrela não funciona com a mão cheia) */
const MAXH=3;
const CARDS=[['Escudo de Proteção','🛡','Defesa','Protege seu peão mais avançado de uma captura.','#3d8bff'],['Caçador Implacável','🎯','Ataque','Elimina o rival mais próximo à frente.','#ef3b3b'],['Duelo Mortal','⚔','Batalha','Dado contra o rival mais próximo: o menor perde.','#ff8a2b'],['Velocidade Máxima','⚡','Movimento','Avança um peão até 6 casas. Se for seu último peão e ele estiver na reta final, vai direto à vitória, sem precisar do número exato.','#2fcf5a'],['Teletransporte','🌀','Movimento','Você escolhe um peão e ele vai para a próxima casa segura. Não vale para a reta final nem para as 7 últimas casas antes do fim.','#a56bff'],['Peão Extra','♟','Recuperação','Tira um peão da base sem precisar de 6.','#ff5fa2'],['Ordem Real','👑','Estratégia','O rival líder deve mover o peão mais atrás.','#ffc928'],['Espelho Mágico','🪞','Contra-ataque','Devolve um Caçador contra quem atacou.','#4fe3ff'],['Troca de Posição','🔁','Estratégia','Troca seu peão com um rival à frente.','#8a7bff'],['Jogada Extra','🎲','Movimento','Ganha uma jogada extra.','#ffa940'],['Sorte ou Azar','❓','Aleatória','1-3 recua 3 casas; 4-6 avança 5.','#ffd23c'],['Congelamento','❄','Controle','Escolha um peão do próximo jogador: ele fica imóvel por 2 rodadas.','#66e6ff']];
const IMG_CARDS=["assets/cartas/01-escudo.webp", "assets/cartas/02-cacador.webp", "assets/cartas/03-duelo.webp", "assets/cartas/04-velocidade.webp", "assets/cartas/05-teletransporte.webp", "assets/cartas/06-peao-extra.webp", "assets/cartas/07-ordem-real.webp", "assets/cartas/08-espelho.webp", "assets/cartas/09-troca.webp", "assets/cartas/10-jogada-extra.webp", "assets/cartas/11-sorte-ou-azar.webp", "assets/cartas/12-congelamento.webp"];
const tile=(id,fn)=>{const c=CARDS[id];return `<div class="ct ctimg" style="--cc:${c[4]}" onclick="${fn}" title="${c[0]}"><img src="${IMG_CARDS[id]}" alt="${c[0]}" draggable="false"></div>`;return `<div class="ct" style="--cc:${c[4]}" onclick="${fn}"><div class="cm"><span class="ci">${c[1]}</span></div><b>${c[0]}</b><span class="cat">${c[2]}</span><small>${c[3]}</small></div>`};
/* Escolha de carta da casa Estrela: as cartas aparecem viradas para cima, depois são viradas e embaralhadas,
   e o jogador escolhe uma e confirma. ids = cartas oferecidas; devolve o índice (em ids) da carta escolhida.
   o = tempos em ms (os testes usam tempos curtos): reveal, flip, step, swaps, pick (segundos), hold */
const VERSO='assets/cartas/verso.webp';
function choose(t,ids,o){
  o=Object.assign({reveal:2800,flip:550,swaps:6,step:480,pick:20,hold:1300},o||{});
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){o.swaps=1;o.step=30;o.flip=0}
  return new Promise(res=>{
    const S0=S,cp=$('#cp'),L=$('#cpl'),msg=$('#cpt'),btn=$('#cpb'),N=ids.length,timers=[];
    let sel=-1,phase='reveal',until=Date.now()+o.reveal,tm=null;
    const pos=ids.map((_,k)=>k);                      /* pos[k] = lugar (0..N-1) onde a carta k está */
    const later=(f,ms)=>timers.push(setTimeout(f,ms));
    const cards=()=>L.querySelectorAll('.cc');
    const place=()=>cards().forEach((e,k)=>{e.style.setProperty('--cx',pos[k]%2);e.style.setProperty('--cy',pos[k]>>1)});
    const say=s=>{msg.textContent=s};
    const stop=()=>{timers.forEach(clearTimeout);clearInterval(tm)};
    const fin=()=>{stop();SFX.confirm();cp.classList.remove('on');res(sel)};
    const swapOnce=()=>{const a=R(N);let b=R(N-1);if(b>=a)b++;
      const ka=pos.indexOf(a),kb=pos.indexOf(b);[pos[ka],pos[kb]]=[pos[kb],pos[ka]];
      [ka,kb].forEach(k=>{const e=cards()[k];e.classList.add('mv');later(()=>e.classList.remove('mv'),o.step)});place()};
    const startPick=()=>{phase='pick';until=Date.now()+o.pick*1000;L.classList.remove('lock');say('Escolha uma carta · '+o.pick+'s')};
    const startShuffle=()=>{phase='shuffle';say('Embaralhando...');cards().forEach(e=>e.classList.remove('up'));
      later(()=>{let n=0;const next=()=>{if(n<o.swaps||pos.every((p,k)=>p===k)){n++;swapOnce();later(next,o.step)}else later(startPick,o.step*.4)};next()},o.flip+100)};
    const reveal=()=>{if(phase==='done')return;phase='done';L.classList.add('lock');btn.disabled=true;
      cards()[sel].classList.add('sel','up');say(CARDS[ids[sel]][0]);later(fin,o.hold)};
    window.cpOk=()=>{if(phase==='pick'&&sel>=0)reveal()};
    L.onclick=e=>{const c=e.target.closest('.cc');if(!c||phase!=='pick')return;sel=+c.dataset.k;
      cards().forEach((x,k)=>x.classList.toggle('sel',k===sel));btn.disabled=false};
    L.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('cc')){e.preventDefault();e.target.click()}};
    L.innerHTML=ids.map((id,k)=>`<div class="cc up" data-k="${k}" role="button" tabindex="0" aria-label="Carta ${k+1} de ${N}"><div class="ccin"><div class="cf front"><img src="${IMG_CARDS[id]}" alt="" draggable="false"></div><div class="cf back"><img src="${VERSO}" alt="" draggable="false"></div></div></div>`).join('');
    place();L.classList.add('lock');btn.disabled=true;cp.classList.add('on');
    tm=setInterval(()=>{
      if(S!==S0){stop();return}                       /* a partida foi reiniciada: abandona a escolha */
      const s=Math.max(0,Math.ceil((until-Date.now())/1000));
      if(phase==='reveal')say('Memorize as cartas! '+Math.max(1,s));
      else if(phase==='pick'){say((sel<0?'Escolha uma carta':'Confirme')+' · '+s+'s');
        if(s<=0){if(sel<0)sel=R(N);log('⏱ Tempo esgotado: carta escolhida automaticamente');cards()[sel].classList.add('sel');reveal()}}
    },200);
    say('Memorize as cartas! '+Math.ceil(o.reveal/1000));
    later(startShuffle,o.reveal);
  })}
async function star(p){
if(S.hand[p].length>=MAXH){log(`★ ${NAMES[p]} já tem ${MAXH} cartas: a casa Estrela não funciona e não dá opção de descartar`);return}
SFX.star();const held=S.hand.flat(),ids=[...Array(12).keys()].filter(i=>!held.includes(i)).sort(()=>Math.random()-.5).slice(0,4);
const id=ids[isBot(p)?R(ids.length):await choose('★ Escolha 1 de 4 cartas',ids)];log(id===7?`🃏 ${NAMES[p]} pegou uma carta`:`🃏 ${NAMES[p]} pegou ${CARDS[id][0]}`);
if(id===0||id===7)await useNow(p,id);else S.hand[p].push(id);render()}
/* Escudo (0) e Espelho (7): usados na hora, em um peão seu na pista; não ocupam a mão */
async function useNow(p,id){const P=S.pc[p],T=[0,1,2,3].filter(i=>P[i]>=0&&P[i]<=LAST).sort((a,b)=>P[b]-P[a]);
if(!T.length){log(`${CARDS[id][0]}: nenhum peão seu na pista para receber o efeito`);return 0}
const i=await pickPawn(p,T,id===0?'🛡 Toque no peão que quer proteger':'🪞 Toque no peão que receberá o Espelho');
if(id===0){S.sh[p][i]=1;S.shE[p][i]=3;log(`🛡 ${NAMES[p]} ativou o Escudo de Proteção em um peão`)}
else{S.mr[p][i]=3;log(`🃏 ${NAMES[p]} usou uma carta`)}
render();await w(400);return 1}
const cdist=(a,b)=>{const d=((a-b)%LEN+LEN)%LEN;return Math.min(d,LEN-d)};
/* alvos válidos (peões adversários na pista, fora de casa segura e SEM escudo) */
function tgtScan(p,fn){const out=[];S.pc[p].forEach((v,i)=>{if(v<0||v>LAST)return;const a=abs(p,v);S.act.forEach(q=>{if(q===p)return;S.pc[q].forEach((u,j)=>{if(u<0||u>LAST||S.sh[q][j])return;const e=abs(q,u);if(SAFE.has(e))return;const r=fn(v,i,a,u,j,e,q);if(!r)return;const o=out.find(t=>t.q===q&&t.j===j);if(!o)out.push({q,j,i,...r});else if(r.k<o.k)Object.assign(o,{i,...r})})})});return out.sort((x,y)=>x.k-y.k)}
const tgtHunter=p=>tgtScan(p,(v,i,a,u,j,e)=>{const d=(e-a+LEN)%LEN;return d>=1&&d<=6?{d,k:d}:null});
const tgtDuel=p=>tgtScan(p,(v,i,a,u,j,e)=>{if(SAFE.has(a))return null;const d=cdist(e,a);return d>=1&&d<=6?{d,k:d}:null});
/* todos os pares válidos (peão seu × peão rival) para a Troca de Posição: o jogador escolhe o seu peão primeiro */
const swapPairs=p=>{const out=[];S.pc[p].forEach((v,i)=>{if(v<0||v>LAST)return;const a=abs(p,v);if(FRZ(p,i))return;
 S.act.forEach(q=>{if(q===p)return;S.pc[q].forEach((u,j)=>{if(u<0||u>LAST||S.sh[q][j]||FRZ(q,j))return;const e=abs(q,u);if(SAFE.has(e))return;
  const g=(e-a+LEN)%LEN;if(g<1||g>20)return;const np=v+g,nq=u-g;if(np>LAST||nq<0)return;out.push({q,j,i,g,np,nq,k:-g})})})});return out};
const tgtSwap=p=>tgtScan(p,(v,i,a,u,j,e,q)=>{if(FRZ(p,i)||FRZ(q,j))return null;const g=(e-a+LEN)%LEN;if(g<1||g>20)return null;const np=v+g,nq=u-g;if(np>LAST||nq<0)return null;return{g,np,nq,k:-g}});
const mirrorOf=q=>[0,1,2,3].find(j=>S.mr[q][j]>0&&S.pc[q][j]>=0&&S.pc[q][j]<=LAST)??-1;
async function effect(p,id){const P=S.pc[p],T=[0,1,2,3].filter(i=>P[i]>=0&&P[i]<=LAST&&!FRZ(p,i)).sort((a,b)=>P[b]-P[a]),A=[0,1,2,3].filter(i=>P[i]>=0&&P[i]<CEN&&!FRZ(p,i)).sort((a,b)=>P[b]-P[a]),opp=S.act.filter(q=>q!==p&&!(S.fin||[]).includes(q));
const near=arr=>{let b=null;arr.forEach(i=>{const e=nearest(p,abs(p,P[i]));if(e&&(!b||e.d<b.d))b={...e,i}});return b};
switch(id){
case 0:case 7:return await useNow(p,id);
case 1:{const L=tgtHunter(p);if(!L.length)return 0;const t=await pickTarget(p,L,'🎯 Toque em um peão adversário destacado');if(!t)return -1;
if(S.mr[t.q][t.j]>0){S.mr[t.q][t.j]=0;log(`🪞 ${NAMES[t.q]} refletiu o ataque!`);await w(550);if(!SAFE.has(abs(p,P[t.i]))&&hit(p,t.i))log(`💥 O ataque voltou: um peão ${NAMES[p]} foi eliminado`);return 1}
if(hit(t.q,t.j))log(`💥 🎯 Caçador: eliminou um peão ${NAMES[t.q]}`);return 1}
case 2:{const L=tgtDuel(p);if(!L.length)return 0;const t=await pickTarget(p,L,'⚔ Toque no peão adversário que quer duelar (até 6 casas)');if(!t)return -1;
let q=t.q,j=t.j;const i=t.i;
if(S.mr[q][j]>0){S.mr[q][j]=0;log(`🪞 ${NAMES[q]} refletiu o duelo!`);await w(550);
const ord=S.act,k0=ord.indexOf(q);let r=null;for(let n=1;n<ord.length;n++){const c=ord[(k0+n)%ord.length];if(c!==p){r=c;break}}
if(r==null){log('⚔ Duelo refletido: não há outro jogador para duelar');return 1}
const a=abs(p,P[i]);let b=null;S.pc[r].forEach((u,j2)=>{if(u<0||u>LAST||S.sh[r][j2])return;const e=abs(r,u);if(SAFE.has(e))return;const d=cdist(e,a);if(!b||d<b.d)b={j:j2,d}});
if(!b){log(`⚔ Duelo refletido: ${NAMES[r]} não tem peão disponível`);return 1}
q=r;j=b.j}
const wn=await duelUI(p,i,q,j);if(wn){if(hit(q,j))log(`💥 ${NAMES[p]} venceu o duelo e eliminou um peão ${NAMES[q]}`)}else if(hit(p,i))log(`💥 ${NAMES[p]} perdeu o duelo e teve um peão eliminado`);return 1}
case 3:{const i=A[0];if(i==null)return 0;await steps(p,i,vmN(p,i,P[i]));if(P[i]===CEN)S.extra=true;else await duelCheck(p,i);return 1}
case 4:{/* Teletransporte: você escolhe o peão; destino = próxima casa segura, nunca nas 7 últimas casas antes do fim (posição <= 49) */
const tp=i=>{for(let k=P[i]+1;k<=LAST-1;k++)if(SAFE.has(abs(p,k)))return k;return -1};const c=T.filter(i=>tp(i)>=0);if(!c.length)return 0;let i=c[0];
if(!isBot(p)&&c.length>1){const m=await pickTarget(p,c.map(x=>({q:p,j:x,i:x})),'🌀 Toque no SEU peão que quer teletransportar');if(!m)return -1;i=m.i}
P[i]=tp(i);return 1}
case 5:{const j=P.indexOf(-1);if(j<0)return 0;P[j]=0;return 1}
case 6:{let q=[...opp].sort((a,b)=>S.pc[b].reduce((s,v)=>s+v,0)-S.pc[a].reduce((s,v)=>s+v,0))[0];if(q==null)return 0;
/* Humano escolhe QUAL jogador sofre a Ordem Real: toque em um peão do rival (um peão representante por jogador) */
if(!isBot(p)&&opp.length>1){const rk=v=>v>=0&&v<=LAST?v:v<0?-1:-2;const L=opp.map(x=>{const j=[0,1,2,3].sort((a,b)=>rk(S.pc[x][b])-rk(S.pc[x][a]))[0];return{q:x,j,i:j,k:0}});const t=await pickTarget(p,L,'👑 Toque em um peão do jogador que deve sofrer a Ordem Real');if(!t)return -1;q=t.q}
const m6=mirrorOf(q);if(m6>=0){S.mr[q][m6]=0;log(`🪞 ${NAMES[q]} refletiu a Ordem Real!`);S.force[p]=1}else S.force[q]=1;return 1}
case 8:{const pr=swapPairs(p);if(!pr.length)return 0;let t;
if(isBot(p)){t=pr.sort((a,b)=>a.k-b.k)[0]}
else{/* 1º: escolhe o SEU peão; 2º: escolhe o rival que fica ao alcance dele */
 const own=[...new Set(pr.map(x=>x.i))].map(i=>({q:p,j:i,i}));let me=own[0];
 if(own.length>1){me=await pickTarget(p,own,'🔁 Toque no SEU peão que quer trocar de lugar');if(!me)return -1}
 const L=pr.filter(x=>x.i===me.i).sort((a,b)=>a.k-b.k);
 t=await pickTarget(p,L,'🔁 Agora toque no peão adversário para trocar (até 20 casas à frente)');if(!t)return -1}
if(S.mr[t.q][t.j]>0){S.mr[t.q][t.j]=0;log(`🪞 ${NAMES[t.q]} refletiu a troca: nada aconteceu`);await w(450);return 1}
{const e1=$('#p'+p+t.i),e2=$('#p'+t.q+t.j),g=t.np-P[t.i];for(let k=0;k<g;k++){P[t.i]++;S.pc[t.q][t.j]--;SFX.step(k);render();[e1,e2].forEach(e=>{if(e){e.classList.remove('hp');void e.offsetWidth;e.classList.add('hp')}});await w(230)}}P[t.i]=t.np;S.pc[t.q][t.j]=t.nq;render();log(`🔁 ${NAMES[p]} trocou de lugar com um peão ${NAMES[t.q]}`);return 1}
case 9:S.extra=true;return 1;
case 10:{if(!T.length)return 0;let i=T[0];
 if(!isBot(p)&&T.length>1){/* o jogador escolhe QUAL peão seu recebe a Sorte ou Azar */
  const me=await pickTarget(p,T.map(x=>({q:p,j:x,i:x})),'❓ Toque no SEU peão que vai receber a Sorte ou Azar');if(!me)return -1;i=me.i}
 const r=await sorteDado(p);log(`❓ Sorte ou Azar: tirou ${r}`);if(r<=3)await stepsBack(p,i,Math.min(3,P[i]));else if(P[i]+5<=CEN){P[i]+=5;if(P[i]===CEN)S.extra=true}return 1}
case 11:{const q=(()=>{const F=S.fin||[],n=S.act.length;let k=S.act.indexOf(p);do{k=(k+1)%n}while(F.includes(S.act[k])&&F.length<n);return S.act[k]})();if(q==null||q===p)return 0;const L=[];S.pc[q].forEach((u,j)=>{if(u<0||u>LAST||S.sh[q][j]||FRZ(q,j)||SAFE.has(abs(q,u)))return;L.push({q,j,k:-u})});L.sort((a,b)=>a.k-b.k);if(!L.length)return 0;
const t=await pickTarget(p,L,'❄ Toque em um peão do próximo jogador para congelar por 2 rodadas');if(!t)return -1;
if(S.mr[t.q][t.j]>0){S.mr[t.q][t.j]=0;log(`🪞 ${NAMES[t.q]} refletiu o Congelamento!`);await w(450);const r=[0,1,2,3].filter(i=>{const v=S.pc[p][i];return v>=0&&v<=LAST&&!S.sh[p][i]&&!FRZ(p,i)&&!SAFE.has(abs(p,v))}).sort((a,b)=>S.pc[p][b]-S.pc[p][a])[0];if(r==null)return 1;frz(p,r);log(`❄ ${NAMES[p]} teve um peão congelado por 2 rodadas!`);return 1}
frz(t.q,t.j);log(`❄ ${NAMES[t.q]} teve um peão congelado por 2 rodadas!`);return 1}}
return 0}
async function useCard(p,k){const id=S.hand[p][k];const er=await effect(p,id);if(er===-1)return 0;if(!er){log(`Sem alvo válido para ${CARDS[id][0]}`);return 0}
S.hand[p].splice(S.hand[p].indexOf(id),1);S.cu=1;log(`🃏 ${NAMES[p]} usou ${CARDS[id][0]}`);render();await w(400);return 1}
let DISC=false;
function toggleDisc(){if(TG)return tgCancel();if(!S||S.state!=='roll'||isBot(S.cur)||S.over||!myTurn())return;const p=S.cur;if(!S.hand[p].length)return log('🗑 Você não tem cartas para descartar');DISC=!DISC;render();if(DISC)log('🗑 Toque na carta que quer descartar')}
function useHand(k){if(TG)return tgCancel();if(!S||S.state!=='roll'||isBot(S.cur)||S.over||!myTurn())return;const p=S.cur;if(S.online)S.drv=ME;
if(DISC){DISC=false;const id=S.hand[p][k];if(id==null){render();return}S.hand[p].splice(k,1);log(`🗑 ${NAMES[p]} descartou ${CARDS[id][0]}`);render();loc(Promise.resolve()).catch(()=>{});return}
if(S.frozen[p])return log('❄ Você está congelado: sem cartas neste turno');if(S.cu)return log('🃏 Só pode usar 1 carta por rodada');HK=k;S.state='busy';render();loc(useCard(p,k).then(()=>{HK=-1;if(!chk(p)){S.state='roll';render()}})).catch(()=>{})}
async function botCards(p){if(S.frozen[p]||S.cu||!S.hand[p].length)return;S.state='busy';render();for(let k=0;k<S.hand[p].length;k++){if(S.hand[p][k]===7)continue;if(await useCard(p,k))break}if(!chk(p)){S.state='roll';render()}}
