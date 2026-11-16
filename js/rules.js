/* Regras: início, turnos, movimento, capturas, casas especiais, dado, fim de jogo */
async function w(ms){const g=S;await sleep(ms);if(S!==g)throw 0}
function go(bots){SFX.start();PK=null;TG=null;tgBar();setMode(N>=5);S={turbo:TURBO,fail:[0,0,0,0,0,0],act:ACT[N],pc:[0,1,2,3,4,5].map(()=>[-1,-1,-1,-1]),sh:[0,1,2,3,4,5].map(()=>[0,0,0,0]),shE:[0,1,2,3,4,5].map(()=>[0,0,0,0]),mr:[0,1,2,3,4,5].map(()=>[0,0,0,0]),hand:[[],[],[],[],[],[]],frozen:[0,0,0,0,0,0],fp:[0,1,2,3,4,5].map(()=>[0,0,0,0]),force:[0,0,0,0,0,0],cu:0,cur:0,state:'busy',roll:null,opts:[],extra:false,over:false,fin:[],bots,logs:[]};$('#cp').classList.remove('on');$('#du').classList.remove('on');show('game');buildBoard();log('Boa partida! Clique em Lançar Dado.');turn().catch(()=>{})}
const FRZ=(q,j)=>!!(S.fp&&S.fp[q]&&S.fp[q][j]>0),frz=(q,j)=>{(S.fp||(S.fp=[0,1,2,3,4,5].map(()=>[0,0,0,0])))[q][j]=2};
const legal=(p,d)=>[0,1,2,3].filter(i=>{if(FRZ(p,i))return false;const v=S.pc[p][i];return v<0?d===6:v+d<=CEN});
async function turn(){S.state='roll';S.roll=null;render();if(isBot(S.cur)){await w(700);await botCards(S.cur);await roll()}}
/* recuo casa a casa, com a mesma animação do avanço */
async function stepsBack(p,i,n){const e=$('#p'+p+i);for(let k=0;k<n;k++){S.pc[p][i]--;SFX.step(k);render();e.classList.remove('hp');void e.offsetWidth;e.classList.add('hp');await w(230)}}
async function steps(p,i,n){const e=$('#p'+p+i);for(let k=0;k<n;k++){S.pc[p][i]++;SFX.step(k);render();e.classList.remove('hp');void e.offsetWidth;e.classList.add('hp');await w(230)}}
function hit(q,j){if(S.sh[q][j]){if(!(S.shE[q][j]>0))S.sh[q][j]=0;log(`🛡 O escudo do ${NAMES[q]} bloqueou!`);return false}S.pc[q][j]=-1;S.sh[q][j]=0;S.shE[q][j]=0;S.mr[q][j]=0;if(S.fp)S.fp[q][j]=0;return true}
function nearest(p,a){let b=null,bd=99;S.act.forEach(q=>{if(q!==p)S.pc[q].forEach((v,j)=>{if(v>=0&&v<=LAST){const e=abs(q,v);if(SAFE.has(e))return;const d=(e-a+LEN)%LEN;if(d>0&&d<bd){bd=d;b={q,j,d}}}})});return b}
async function doMove(p,i,d){S.state='busy';S.opts=[];render();let v=S.pc[p][i],cap=false;
if(v<0){S.pc[p][i]=0;log(`${NAMES[p]} saiu da base`);await w(300)}else await steps(p,i,d);
v=S.pc[p][i];
if(v===CEN){log(`🏁 ${NAMES[p]} chegou ao centro!${S.turbo?' Jogada extra':''}`);if(S.turbo)S.extra=true}
else if(v<=LAST){const a=abs(p,v);
if(!SAFE.has(a)&&!(S.turbo&&SPEC[a]==='duel'))S.act.forEach(q=>{if(q===p)return;const Lq=[0,1,2,3].filter(j=>{const u=S.pc[q][j];return u>=0&&u<=LAST&&abs(q,u)===a});if(!Lq.length)return;const j=Lq.find(j=>!S.sh[q][j])??Lq[0];if(hit(q,j)){cap=true;log(`💥 ${NAMES[p]} capturou ${NAMES[q]}!`)}});
if(cap&&S.turbo)S.extra=true;render();const t=S.turbo&&SPEC[a];if(t){await w(300);await special(p,i,t,a)}}
render();if(S.pc[p].every(x=>x===CEN))finish(p)}
async function special(p,i,t,a){
if(t==='shield'){S.sh[p][i]=1;S.shE[p][i]=3;log('🛡 Casa Escudo: peão protegido por 2 rodadas!')}
else if(t==='turbo'){if(S.pc[p][i]+3<=CEN){log('⚡ Turbo! +3 casas');await steps(p,i,3);if(S.pc[p][i]===CEN)S.extra=true;else await duelCheck(p,i)}}
else if(t==='star')await star(p);
else if(t==='duel')await duelAt(p,i,a)}
/* Duelo: acontece sempre que o peão chega numa casa Duelo com adversário; o turno só segue depois que todos os duelos terminam */
async function duelAt(p,i,a){if(!S.turbo||S.pc[p][i]<0||S.pc[p][i]>LAST||abs(p,S.pc[p][i])!==a)return;const E=[];S.act.forEach(q=>{if(q===p)return;S.pc[q].forEach((u,j)=>{if(u>=0&&u<=LAST&&abs(q,u)===a)E.push({q,j})})});
if(!E.length){log('⚔ Casa Duelo: aguardando um adversário cair aqui');return}
log(`⚔ Casa Duelo: dois peões adversários na mesma casa! Duelo de ${NAMES[p]} contra ${NAMES[E[0].q]}`);
/* pequena pausa: os peões brilham na casa antes da tela do duelo abrir (não começa de supetão) */
const pe=[$(`#p${p}${i}`),...E.map(e=>$(`#p${e.q}${e.j}`))].filter(Boolean);pe.forEach(x=>x.classList.add("duel"));await w(1300);pe.forEach(x=>x.classList.remove('duel'));
for(const e of E){if(S.pc[p][i]<0||S.pc[p][i]>LAST||abs(p,S.pc[p][i])!==a)break;if(S.pc[e.q][e.j]<0||S.pc[e.q][e.j]>LAST||abs(e.q,S.pc[e.q][e.j])!==a)continue;
const wn=await duelUI(p,i,e.q,e.j);
if(wn){if(hit(e.q,e.j))log(`💥 ${NAMES[p]} venceu o duelo e eliminou um peão ${NAMES[e.q]}`)}else{if(hit(p,i))log(`💥 ${NAMES[p]} perdeu o duelo e teve um peão eliminado`);break}}}
async function duelCheck(p,i){const v=S.pc[p][i];if(!S.turbo||v<0||v>LAST)return;const a=abs(p,v);if(SPEC[a]==='duel')await duelAt(p,i,a)}
async function card(p,i){const C=['Escudo','Caçador Implacável','Velocidade Máxima','Peão Extra','Jogada Extra','Teletransporte'][R(6)],v=S.pc[p][i];log(`🃏 ${NAMES[p]} comprou: ${C}`);
if(C==='Escudo')S.sh[p][i]=1;
else if(C[0]==='C'){const e=nearest(p,abs(p,v));if(e&&hit(e.q,e.j))log(`💥 🎯 Caçador: eliminou um peão ${NAMES[e.q]}`);else if(!e)log('Sem alvo válido')}
else if(C[0]==='V'){await steps(p,i,vmN(p,i,v));if(S.pc[p][i]===CEN)S.extra=true;else await duelCheck(p,i)}
else if(C==='Peão Extra'){const j=S.pc[p].indexOf(-1);if(j>=0)S.pc[p][j]=0}
else if(C[0]==='T'&&C[1]==='e'){await effect(p,4)}
else if(C==='Jogada Extra')S.extra=true;
render();await w(400)}
/* Velocidade Máxima: só o ÚLTIMO peão em jogo vai direto à vitória nas últimas 6 casas; os demais não passam do número exato (param antes da vitória) */
const lastPawn=(p,i)=>S.pc[p].every((u,j)=>j===i||u===CEN);
const vmN=(p,i,v)=>lastPawn(p,i)?Math.min(6,CEN-v):(v+6<=CEN?6:CEN-1-v);
function score(p,i,d){const v=S.pc[p][i];if(v<0)return 60+R(5);const n=v+d;let s=n;if(n===CEN)s+=100;else if(n>LAST)s+=40;else{const a=abs(p,n);if(SAFE.has(a))s+=25;if(S.turbo&&SPEC[a])s+=15;if(!SAFE.has(a))S.act.forEach(q=>{if(q!==p)S.pc[q].forEach((u,j)=>{if(u>=0&&u<=LAST&&abs(q,u)===a&&!S.sh[q][j])s+=(S.turbo&&SPEC[a]==='duel'?20:80)})})}return s+R(5)}
async function roll(){if(!S||S.state!=='roll'||S.over)return;const p=S.cur;if(S.online)S.drv=ME;S.state='busy';render();
const d0=1+R(6);spinDie(d0);await w(1150);
const d=S.roll=d0;log(`${NAMES[p]} tirou ${d}`);let L=legal(p,d);if(S.force[p]&&L.length){const m=Math.min(...L.map(i=>S.pc[p][i]));L=L.filter(i=>S.pc[p][i]===m);S.force[p]=0;log('👑 Ordem Real: o peão mais atrás deve andar')}
if(d===6||S.pc[p].some(v=>v>=0))S.fail[p]=0;if(!L.length){if(S.fp&&S.fp[p].some(z=>z>0))log('❄ Peão congelado: sem jogada possível');if(S.pc[p].every(v=>v===-1)&&++S.fail[p]>=3){S.fail[p]=0;S.pc[p][0]=0;log(`🚪 ${NAMES[p]} ficou 3 rodadas sem tirar 6: um peão sai da base agora!`);render();await w(600)}await w(700);return endTurn(p,d)}
if(isBot(p)||L.length===1){await w(500);const i=isBot(p)?L.map(i=>[score(p,i,d),i]).sort((a,b)=>b[0]-a[0])[0][1]:L[0];await doMove(p,i,d);if(!S.over)await endTurn(p,d)}
else{S.state='pick';S.opts=L;render()}}
async function endTurn(p,d){const ex=(S.extra||d===6)&&!(S.fin||[]).includes(p);S.extra=false;S.frozen[p]=Math.max(0,S.frozen[p]-1);S.pc[p].forEach((v,i)=>{if(!ex&&S.shE[p][i]>0&&--S.shE[p][i]===0)S.sh[p][i]=0;if(S.mr[p][i]>0)S.mr[p][i]--;if(S.fp&&S.fp[p][i]>0)S.fp[p][i]--});if(!ex){S.cu=0;{const F=S.fin||[],n=S.act.length;let k=S.act.indexOf(S.cur);do{k=(k+1)%n}while(F.includes(S.act[k])&&F.length<n);S.cur=S.act[k]}if(!isBot(S.cur)&&myTurn())SFX.turn()}else log('🎲 Jogada extra!');await w(300);return turn()}
function pick(p,i){if(TG){const t=TG.list.find(t=>t.q===p&&t.j===i);if(t){const r=TG.r;TG=null;tgBar();render();r(t)}return}if(PK&&PK.p===p&&PK.l.includes(i)){const r=PK.r;PK=null;tgBar();render();return r(i)}if(!S||S.state!=='pick'||p!==S.cur||!S.opts.includes(i)||!myTurn())return;const d=S.roll;loc(doMove(p,i,d).then(()=>!S.over&&endTurn(p,d))).catch(()=>{})}
/* Partida só termina quando resta apenas 1 jogador no tabuleiro; quem completa os 4 peões sai da disputa (ranking por ordem de chegada) */
function finish(p){const F=S.fin||(S.fin=[]);if(F.includes(p))return !!S.over;F.push(p);const rest=S.act.filter(q=>!F.includes(q));log(`🏁 ${NAMES[p]} terminou em ${F.length}º lugar!`);if(rest.length<=1){if(rest.length)F.push(rest[0]);S.over=true;render();showWin(F[0]);return true}render();return false}
function chk(p){if(S.pc[p].every(x=>x===CEN)){if(finish(p))return true;S.extra=false;endTurn(p,0).catch(()=>{});return true}}
function hroll(){if(S&&!isBot(S.cur)&&S.state==='roll'&&myTurn())loc(roll()).catch(()=>{})}
