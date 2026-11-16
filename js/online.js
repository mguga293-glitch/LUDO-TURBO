/* Modo online (Supabase): nome, salas, sincronização e envio de estado */

let ME=-1,NM={},G=null,CH=null,PT=null,pt=null,Q=Promise.resolve(),sb=null,UID=null,UN=null,PN={},EDIT=false;
const CFG=!!(window.supabase&&window.SUPABASE_URL&&!/SEU-PROJETO/.test(window.SUPABASE_URL));
if(CFG)try{sb=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY)}catch(e){}
const myTurn=()=>!S.online||S.cur===ME,FX=/^(🃏|🛡|🎯|🪞|❓|👑|❄|⚡|💥|⚔|🚪|🏁|★|🔁|Sem alvo)/u,cl=s=>String(s||'').replace(/[^\p{L}\p{N}_ -]/gu,'').slice(0,16).trim()||'Jogador';
const READY=(async()=>{try{if(!sb)return;const r=await sb.auth.getSession(),u=r.data.session&&r.data.session.user;if(u){UID=u.id;UN=cl(u.user_metadata&&u.user_metadata.name)}}catch(e){}})();
function openOnline(){ov('on');renderOn();READY.then(()=>renderOn())}
async function enterName(){const n=$('#un').value.trim();
if(!/^[\p{L}\p{N}_ -]{2,16}$/u.test(n))return renderOn('Nome: 2 a 16 letras ou números');
try{if(UID){await sb.auth.updateUser({data:{name:n}});await sb.from('profiles').update({name:n}).eq('id',UID);PN={};UN=n;EDIT=false;return renderOn()}
const r=await sb.auth.signInAnonymously({options:{data:{name:n}}});
if(r.error)return renderOn(/anonymous/i.test(r.error.message||'')?'Ative "Allow anonymous sign-ins" no Supabase (Authentication > Sign In / Providers).':r.error.message);
UID=r.data.user.id;UN=n;EDIT=false;renderOn()}catch(e){renderOn('Sem conexão com o servidor')}}
function renderOn(msg){const b=$('#onb'),er=msg?`<p style="color:#ff8a8a">${escH(msg)}</p>`:'';
if(!sb){b.innerHTML='<p>O jogo online ainda não foi configurado. Preencha o arquivo <b>config.js</b> com a URL e a chave do seu projeto Supabase.</p>';return}
if(!UID||EDIT){b.innerHTML=er+`<p>Digite seu nome para jogar com os amigos. Não precisa de conta nem senha.</p><input id="un" placeholder="Seu nome" maxlength="16" value="${escH(UN||'')}" autocomplete="off"><button class="btn by" onclick="enterName()">Continuar</button>`;return}
if(!G){b.innerHTML=er+`<p>Olá, <b>${escH(UN)}</b>!</p><p>Criar sala com as opções do menu (${N} jogadores, ${TURBO?'Turbo':'Clássico'}):</p><button class="btn bb" onclick="createRoom()">Criar sala</button><p>Ou entre com o código de um amigo:</p><input id="cd" maxlength="5" autocomplete="off"><button class="btn bg" onclick="joinRoom(document.getElementById('cd').value)">Entrar na sala</button><button class="btn sm bp" onclick="EDIT=true;renderOn()">Trocar nome</button>`;return}
b.innerHTML=er+`<p>Código da sala:</p><div class="code">${escH(G.code)}</div><p>Mande o código aos amigos. Jogadores (${G.seats.filter(Boolean).length}/${G.n}):</p>`+G.seats.map((s,k)=>{const p=ACT[G.n][k];return `<div class="chip" style="--c:${COL[p]};margin:4px auto;width:max-content"><span class="dot"></span>${s?escH(s.name)+(k===G.k?' (você)':''):'aguardando...'}</div>`}).join('')+'<p class="hint">A partida começa quando todos entrarem.</p><button class="btn sm bp" onclick="leave();renderOn()">Sair da sala</button>'}
async function createRoom(){if(N>=5)return renderOn('Online: use 2, 3 ou 4 jogadores. Os modos de 5 e 6 jogadores são locais ou contra bots.');try{const r=await sb.rpc('create_game',{p_n:N,p_turbo:TURBO});if(r.error)throw r.error.message;enter(r.data)}catch(e){renderOn(String(e))}}
async function joinRoom(c){c=(c||'').trim().toUpperCase();if(!c)return;try{const r=await sb.rpc('join_game',{p_code:c});if(r.error)throw r.error.message;enter(r.data)}catch(e){renderOn(String(e))}}
async function enter(code){leave();G={code,seats:[],n:2,v:-1};renderOn();
CH=sb.channel('g'+code).on('postgres_changes',{event:'*',schema:'public',table:'games',filter:'code=eq.'+code},p=>{if(p.new&&p.new.code)onRow(p.new)}).subscribe();
PT=setInterval(poll,3000);poll()}
async function poll(){if(!G)return;try{const r=await sb.from('games').select('*').eq('code',G.code).maybeSingle();if(r.data)onRow(r.data)}catch(e){}}
async function onRow(r){if(!G||r.code!==G.code||r.v<=G.v)return;G.v=r.v;
const miss=r.seats.filter(u=>u&&!PN[u]);if(miss.length){try{const q=await sb.from('profiles').select('id,name').in('id',miss);(q.data||[]).forEach(x=>PN[x.id]=cl(x.name))}catch(e){}}
if(!G||G.v!==r.v)return;const k=r.seats.indexOf(UID);
Object.assign(G,{n:r.n,turbo:r.turbo,k,seats:r.seats.map(u=>u?{name:PN[u]||'Jogador'}:null)});ME=ACT[r.n][k];NM={};G.seats.forEach((s,i)=>{if(s)NM[ACT[r.n][i]]=s.name});renderOn();if(S&&S.online)render();
if(r.status==='lobby'&&k===0&&!G.started&&r.seats.every(Boolean))startHost();if(r.status==='play'&&r.state)applySnap({s:r.state,by:r.last_by})}
function startHost(){G.started=true;N=G.n;TURBO=G.turbo;go(false);S.online=true;S.drv=ME;$('#on').classList.remove('on');render();doPush()}
function doPush(){clearTimeout(pt);if(!G||!S||!S.online)return;S.v=(S.v||0)+1;const s=JSON.stringify(S),code=G.code,by=ME;Q=Q.then(()=>sb.rpc('push_state',{p_code:code,p_by:by,p_s:s})).then(r=>{if(r&&r.error)console.warn(r.error.message)}).catch(()=>{})}
let LOC=0;
const loc=pr=>{LOC++;return Promise.resolve(pr).finally(()=>{LOC--;if(S&&S.online&&!LOC)doPush()})};
function push(){clearTimeout(pt);pt=setTimeout(doPush,250)}

function applySnap(d){if(S&&S.online&&d.by===ME)return;const n=JSON.parse(d.s);let first=false;
if(!S||!S.online){N=G.n;TURBO=G.turbo;go(false);S.online=true;first=true;$('#on').classList.remove('on')}
const old=S.roll,ol=S.logs.length,oc=S.cur;Object.assign(S,n);S.online=true;S.bots=false;if(!first&&n.cur===ME&&oc!==ME)SFX.turn();
if(first&&S.cur===ME&&S.state==='busy'){S.state='roll';S.drv=ME;doPush()}
if(n.roll&&n.roll!==old&&n.state!=='roll')spinDie(n.roll);
if(!first&&n.logs.length>ol)sfxLog(n.logs[n.logs.length-1]);if(!first&&n.logs.length>ol&&FX.test(n.logs[n.logs.length-1]))ann(n.logs[n.logs.length-1]);
duelWatch();render();if(S.over){const w=(S.fin&&S.fin.length)?S.fin[0]:S.act.find(p=>S.pc[p].every(v=>v===CEN));showWin(w)}}
function leave(){if(CH&&sb){try{sb.removeChannel(CH)}catch(e){}CH=null}clearInterval(PT);G=null;ME=-1;if(S)S.online=false}
