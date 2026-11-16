/* Efeitos sonoros (Web Audio), mapa de mensagens para sons e clique */
/* ===== EFEITOS SONOROS (Web Audio API, tudo sintetizado: sem arquivos externos) ===== */
const SFX=(()=>{
let ctx=null,out=null,nb=null,db=null,cb=null,rb=null,f1b=null,f2b=null,f3b=null,on=true,capT=-9;
/* tempos da eliminação (medidos no waveform): impacto real = 1,43s→1,77s no mp3; retorno começa no frame 0.
   CAP_OFF pula o silêncio inicial; CAP_RET = quando o som de retorno começa (impacto dura ~0,36s → intervalo audível ≈ 0,18s) */
const CAP_OFF=1.41,CAP_RET=.52;
try{on=localStorage.getItem('ludo_snd')!=='0'}catch(e){}
const rnd=(a,b)=>a+Math.random()*(b-a),mf=m=>440*Math.pow(2,(m-69)/12);
function init(){
 if(ctx)return ctx;
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
 try{ctx=new AC()}catch(e){return null}
 const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=5;
 out=ctx.createGain();out.gain.value=.75;out.connect(comp);comp.connect(ctx.destination);
 nb=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);
 const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
 loadDice();loadCap();loadRet();loadFight();return ctx}
/* carrega um som de assets/audio/ e decodifica (precisa abrir o jogo por servidor; sem isso o som sintetizado de reserva é usado) */
function loadSnd(file,set){try{fetch('assets/audio/'+file).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(buf=>ctx&&ctx.decodeAudioData(buf,set,()=>{})).catch(()=>{})}catch(e){}}
/* dado, captura (peão eliminado), retorno à base e os três sons do duelo */
function loadDice(){loadSnd('dado.mp3',x=>{db=x})}
function loadCap(){loadSnd('captura.mp3',x=>{cb=x})}
function loadRet(){loadSnd('retorno.mp3',x=>{rb=x})}
function loadFight(){loadSnd('duelo-1.mp3',x=>{f1b=x});loadSnd('duelo-2.mp3',x=>{f2b=x});loadSnd('duelo-3.mp3',x=>{f3b=x})}
function unlock(){const c=init();if(c&&c.state==='suspended')c.resume().catch(()=>{})}
['pointerdown','touchend','keydown','click'].forEach(e=>document.addEventListener(e,unlock,{passive:true}));
document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden)ctx.suspend().catch(()=>{});else if(on)ctx.resume().catch(()=>{})});
const ok=()=>on&&ctx&&ctx.state==='running';
/* tom: f=freq, d=duração; o={type,v(volume),to(freq final),at(atraso),lp(low-pass),a(ataque)} */
function T(f,d,o){o=o||{};if(!ok())return;
 const t=ctx.currentTime+(o.at||0),g=ctx.createGain(),os=ctx.createOscillator();
 os.type=o.type||'sine';os.frequency.setValueAtTime(f,t);
 if(o.to)os.frequency.exponentialRampToValueAtTime(o.to,t+d);
 const v=o.v==null?.3:o.v,a=o.a||.004;
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 let n=os;if(o.lp){const b=ctx.createBiquadFilter();b.type='lowpass';b.frequency.value=o.lp;n.connect(b);n=b}
 n.connect(g);g.connect(out);os.start(t);os.stop(t+d+.03)}
/* ruído filtrado: t=tipo do filtro, f=freq, to=freq final, q=ressonância */
function Nz(d,o){o=o||{};if(!ok())return;
 const t=ctx.currentTime+(o.at||0),s=ctx.createBufferSource(),b=ctx.createBiquadFilter(),g=ctx.createGain();
 s.buffer=nb;s.loop=true;b.type=o.t||'bandpass';b.frequency.setValueAtTime(o.f||1000,t);
 if(o.to)b.frequency.exponentialRampToValueAtTime(o.to,t+d);b.Q.value=o.q||1;
 const v=o.v==null?.3:o.v;
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+(o.a||.004));g.gain.exponentialRampToValueAtTime(.0001,t+d);
 s.connect(b);b.connect(g);g.connect(out);s.start(t,Math.random()*.5);s.stop(t+d+.03)}
/* batida de dado na mesa: estalo do plástico + "toc" do corpo + baque abafado */
function hit(at,v,p){p=p||rnd(420,560);
 Nz(.03,{at:at,f:rnd(2800,5200),q:1.6,v:.34*v});
 T(p,.07,{at:at,type:'triangle',v:.3*v,to:p*.55});
 T(p*2.3,.025,{at:at,type:'square',v:.05*v,lp:3500});
 Nz(.06,{at:at,t:'lowpass',f:1400,v:.2*v})}
const SND={
 click(){T(900,.05,{type:'square',v:.06,to:600})},
 confirm(){T(660,.09,{type:'triangle',v:.2});T(990,.14,{type:'triangle',v:.2,at:.07})},
 start(){[60,64,67,72].forEach((m,i)=>T(mf(m),.2,{type:'triangle',v:.22,at:i*.07}));T(mf(84),.4,{v:.16,at:.3})},
 turn(){T(mf(76),.14,{v:.12});T(mf(83),.22,{v:.1,at:.09})},
 /* dado: chacoalha por ~1s e "bate" na mesa ao parar */
 dice(){
  if(db&&ok()){const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=db;g.gain.value=1.1;s.connect(g);g.connect(out);s.start();return} /* som real; abaixo, versão sintetizada de reserva */
  Nz(.14,{f:500,to:2500,q:.7,v:.07});                       /* ar ao jogar */
  const B=[[.06,1],[.25,.82],[.40,.62],[.52,.46],[.62,.34],[.70,.25],[.77,.18],[.83,.12],[.88,.08]];
  B.forEach(b=>hit(b[0],b[1]));                              /* quicadas, cada vez mais fracas */
  for(let k=0;k<9;k++)hit(rnd(.3,.97),rnd(.05,.12),rnd(600,900)); /* rolando e raspando nas quinas */
  hit(.95,.2,rnd(380,460));hit(1,.12,rnd(500,600))},        /* assenta */
 tick(){hit(0,.45,rnd(500,700))},
 land(){hit(0,1);hit(.11,.55);hit(.19,.25)},
 step(k){T(380+((k||0)%6)*38,.09,{to:250,v:.22});Nz(.03,{f:2200,q:1.5,v:.06})},
 exit(){Nz(.22,{f:600,to:3200,q:1.2,v:.14});T(300,.18,{type:'triangle',v:.22,to:900});T(mf(88),.16,{v:.12,at:.12})},
 capture(){ /* som real (mp3): o arquivo tem ~1,4s de silêncio no começo, então pula direto para o impacto p/ sincronizar com a eliminação */
  if(cb&&ok()){const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=cb;g.gain.value=1.1;s.connect(g);g.connect(out);s.start(0,CAP_OFF);capT=ctx.currentTime;
   /* depois do impacto + uma pequena pausa (~0,18s), toca o som do peão voltando ao início */
   if(rb){const r=ctx.createBufferSource(),q=ctx.createGain();r.buffer=rb;q.gain.value=1.1;r.connect(q);q.connect(out);r.start(ctx.currentTime+CAP_RET)}}},
 /* eliminação por Caçador/Duelo: toca APENAS o som de retorno ao início (sem o impacto) */
 ret(){if(rb&&ok()){const r=ctx.createBufferSource(),q=ctx.createGain();r.buffer=rb;q.gain.value=1.1;r.connect(q);q.connect(out);r.start();capT=ctx.currentTime}},
 block(){[820,1240,1870,2410].forEach((f,i)=>T(f,.38-i*.06,{v:.13}));Nz(.04,{t:'highpass',f:4000,v:.14})},
 shield(){T(mf(79),.3,{v:.2});T(mf(86),.4,{v:.18,at:.08});T(mf(91),.5,{type:'triangle',v:.1,at:.16})},
 turbo(){T(180,.4,{type:'sawtooth',v:.15,to:1400,lp:2500});
  [72,76,79,84].forEach((m,i)=>T(mf(m),.09,{type:'square',v:.09,at:.18+i*.06,lp:3000}))},
 star(){[84,88,91,96,100].forEach((m,i)=>T(mf(m),.2,{type:'triangle',v:.15,at:i*.06}));T(mf(103),.5,{v:.12,at:.32})},
 card(){Nz(.12,{t:'highpass',f:2500,to:6000,v:.13});T(mf(79),.1,{type:'triangle',v:.15,at:.05});T(mf(83),.15,{type:'triangle',v:.15,at:.12})},
 cardUse(){if(ctx&&ctx.currentTime-capT<1.4)return; /* se a carta acabou de eliminar um peão, deixa só o som de eliminação (sem sobrepor) */
  T(300,.3,{to:1200,v:.17});Nz(.3,{f:800,to:5000,q:2,v:.12});T(mf(88),.3,{v:.14,at:.22});T(mf(95),.4,{v:.12,at:.3})},
 hunter(){Nz(.12,{t:'highpass',f:7000,to:1500,v:.2});T(120,.2,{to:50,v:.34,at:.1});Nz(.08,{t:'lowpass',f:1200,v:.28,at:.1})},
 mirror(){[96,91,88,84,88,91,96].forEach((m,i)=>T(mf(m),.14,{v:.1,at:i*.05}))},
 royal(){[[60,0],[67,.18],[72,.36]].forEach(a=>T(mf(a[0]),.5,{type:'sawtooth',v:.12,lp:1400,at:a[1]}))},
 freeze(){[100,96,93,98,91].forEach((m,i)=>T(mf(m),.12,{v:.09,at:i*.045,to:mf(m)*.97}));Nz(.3,{t:'highpass',f:6000,v:.06})},
 luck(){[72,79,76,84].forEach((m,i)=>T(mf(m),.1,{type:'square',v:.09,lp:2500,at:i*.08}))},
 denied(){T(170,.12,{type:'square',v:.1,lp:900});T(130,.18,{type:'square',v:.1,lp:900,at:.13})},
 extra(){T(mf(76),.1,{type:'triangle',v:.2});T(mf(83),.1,{type:'triangle',v:.2,at:.08});T(mf(88),.25,{type:'triangle',v:.2,at:.16})},
 six(){T(mf(72),.08,{type:'square',v:.09,lp:3000});T(mf(79),.08,{type:'square',v:.09,lp:3000,at:.07});T(mf(84),.18,{type:'square',v:.09,lp:3000,at:.14})},
 center(){[67,72,76,79,84].forEach((m,i)=>T(mf(m),.18,{type:'triangle',v:.2,at:i*.08}));T(mf(91),.6,{v:.14,at:.4})},
 /* espadada no peão que perdeu o duelo (FIGHT_3.mp3); o som de eliminação continua tocando depois, normalmente */
 slash(){if(f3b&&ok()){const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=f3b;g.gain.value=1.2;s.connect(g);g.connect(out);s.start()}},
 duel(){
  if(f1b&&ok()){const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=f1b;g.gain.value=1.1;s.connect(g);g.connect(out);s.start();
   /* FIGHT_2 entra assim que o FIGHT termina */
   if(f2b){const r=ctx.createBufferSource(),q=ctx.createGain();r.buffer=f2b;q.gain.value=1.1;r.connect(q);q.connect(out);r.start(ctx.currentTime+f1b.duration)}
   return}
  T(70,.25,{to:40,v:.4});T(70,.25,{to:40,v:.4,at:.28});T(110,.6,{type:'sawtooth',v:.12,lp:700});
  Nz(.3,{f:2500,to:8000,q:4,v:.16,at:.08});Nz(.3,{f:2500,to:8000,q:4,v:.16,at:.4})},
 tie(){T(mf(65),.1,{type:'triangle',v:.15});T(mf(65),.1,{type:'triangle',v:.15,at:.14})},
 won(){[72,76,79,84].forEach((m,i)=>T(mf(m),.15,{type:'triangle',v:.2,at:i*.08}))},
 lose(){[67,64,60,55].forEach((m,i)=>T(mf(m),.2,{type:'sawtooth',v:.1,lp:900,at:i*.14,to:mf(m)*.97}))},
 /* fanfarra de vitória (começa um pouco depois do som de chegada ao centro) */
 win(){const d=.55;
  [[72,0],[76,.13],[79,.26],[84,.39]].forEach(a=>T(mf(a[0]),.22,{type:'triangle',v:.22,at:d+a[1]}));
  [72,76,79,84].forEach(m=>T(mf(m+12),1.2,{type:'triangle',v:.12,at:d+.62}));
  [60,64,67].forEach(m=>T(mf(m),1.3,{type:'sawtooth',v:.07,lp:1200,at:d+.62}));
  [96,100,103,108].forEach((m,i)=>T(mf(m),.25,{v:.1,at:d+.9+i*.1}))}
};
function ui(){
 const b=document.getElementById('sndb');if(b)b.textContent=on?'🔊':'🔇';
 const m=document.getElementById('sndm');
 if(m)m.innerHTML=on?'<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 4V5L7 9H3zm13.500 3a4.500 4.500 0 0 0-2.500-4v8a4.500 4.500 0 0 0 2.500-4zM14 3.200v2.100a7 7 0 0 1 0 13.400v2.100a9 9 0 0 0 0-17.600z"/></svg>':'<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 4V5L7 9H3z"/><path d="m15 9.500 5 5m0-5-5 5" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/></svg>'}
const api={isOn:()=>on,unlock,
 toggle(){on=!on;try{localStorage.setItem('ludo_snd',on?'1':'0')}catch(e){}
  if(on){unlock();setTimeout(()=>{try{SND.confirm()}catch(e){}},60)}
  ui();if(typeof ann==='function')ann(on?'🔊 Som ligado':'🔇 Som desligado')}};
Object.keys(SND).forEach(k=>{api[k]=function(){if(!on)return;try{SND[k].apply(null,arguments)}catch(e){}}});
ui();
return api})();
/* mapeia as mensagens do log do jogo para sons (funciona local e online) */
function sfxLog(t){t=String(t||'');
 if(/^💥.*(Caçador|duelo|ataque voltou)/u.test(t))SFX.ret();
 else if(/^💥/u.test(t))SFX.capture();
 else if(/^🛡 O escudo/u.test(t))SFX.block();
 else if(/^🛡/u.test(t))SFX.shield();
 else if(/^⚡/u.test(t))SFX.turbo();
 else if(/^🏁/u.test(t))SFX.center();
 else if(/^🎲/u.test(t))SFX.extra();
 else if(/^🚪|saiu da base/u.test(t))SFX.exit();
 else if(/^🃏.* usou /u.test(t))SFX.cardUse();
 else if(/^🃏/u.test(t))SFX.card();
 else if(/^🎯/u.test(t))SFX.hunter();
 else if(/^🪞/u.test(t))SFX.mirror();
 else if(/^👑/u.test(t))SFX.royal();
 else if(/^❄/u.test(t))SFX.freeze();
 else if(/^❓/u.test(t))SFX.luck();
 else if(/^(Sem alvo|⚔ Duelo: nenhum)/u.test(t))SFX.denied();
 else if(/ tirou 6$/u.test(t))SFX.six()}
/* clique em botões, casas e cartas */
document.addEventListener('click',e=>{const t=e.target;if(t&&t.closest&&t.closest('.btn,.lb,.pill,.ib,.lt-ic,.ct,.w'))SFX.click()},true);
/* som do resultado do duelo: positivo se o vencedor é você (ou humano no modo local) */
function duelSfx(wn){(S&&S.online?wn===ME:!isBot(wn))?SFX.won():SFX.lose()}

