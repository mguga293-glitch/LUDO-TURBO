/* Geometria do tabuleiro 4 e 6 jogadores, cores, casas especiais e troca de modo */
let PATH=[];(function(){const a=(r,c)=>PATH.push([r,c]);for(let c=1;c<=5;c++)a(6,c);for(let r=5;r>=0;r--)a(r,6);a(0,7);a(0,8);for(let r=1;r<=5;r++)a(r,8);for(let c=9;c<=14;c++)a(6,c);a(7,14);a(8,14);for(let c=13;c>=9;c--)a(8,c);for(let r=9;r<=14;r++)a(r,8);a(14,7);a(14,6);for(let r=13;r>=9;r--)a(r,6);for(let c=5;c>=0;c--)a(8,c);a(7,0);a(6,0)})();PATH.forEach(q=>q.reverse());
let START=[0,39,26,13],COL=['#2f7bff','#ef3b3b','#2fbf4a','#f5c518','#a64dff','#ff8a1f'],NAMES=['Azul','Vermelho','Verde','Amarelo','Roxo','Laranja'],ACT={2:[0,2],3:[0,1,2],4:[0,1,2,3],5:[0,1,2,3,4],6:[0,1,2,3,4,5]};
let SAFE=new Set([0,13,26,39,8,21,34,47]),SPEC={4:'star',17:'star',30:'star',43:'star',10:'shield',36:'shield',23:'duel',49:'duel',15:'turbo',41:'turbo'},ICON={star:'<svg viewBox="0 0 24 24"><path fill="#fff" stroke="#8a5a00" stroke-width="1.2" stroke-linejoin="round" d="M12 2l3 6.500 7 .8-5.200 4.800 1.400 7L12 17.600 5.800 21.100l1.400-7L2 9.300l7-.8z"/></svg>',shield:'<svg viewBox="0 0 24 24"><path fill="#fff" d="M12 2l8 3v6c0 5-3.500 9-8 11-4.500-2-8-6-8-11V5z"/><path fill="#2563eb" d="M12 5l5 2v4c0 3.500-2 6.200-5 7.800-3-1.600-5-4.300-5-7.800V7z"/><path fill="#fff" d="M12 7.500l1.600 3.300 3.600.4-2.700 2.400.8 3.500-3.300-1.900-3.300 1.900.8-3.500-2.700-2.400 3.600-.4z"/></svg>',duel:'<svg viewBox="0 0 24 24" stroke="#fff" stroke-linecap="round" fill="none"><path stroke-width="2.800" d="M5 4l13 13M19 4L6 17"/><path stroke-width="2.400" d="M13 20l5-5M11 20l-5-5M3 21l3-3M21 21l-3-3"/></svg>',turbo:'<svg viewBox="0 0 24 24"><path fill="#fff" stroke="#0b5a24" stroke-width="1" stroke-linejoin="round" d="M13.500 1.500L4 14h6.500l-1.500 8.500L20 10h-6.500z"/></svg>'};
const EX=[34.5, 112, 191, 269.5, 348.5, 427, 504.5, 585.5, 665.5, 746, 823, 901.5, 979.5, 1057.5, 1135, 1216.5],EY=[37.5, 112.5, 184, 256, 327, 399, 470, 550.5, 624, 706, 781.5, 855, 928.5, 1002, 1075.5, 1149];
const _cv=(E,u)=>{const i=Math.max(0,Math.min(14,Math.floor(u)));return(E[i]-E[0]+(u-i)*(E[i+1]-E[i]))/(E[15]-E[0])*100};
let PX=u=>_cv(EX,u),PY=u=>_cv(EY,u);
let HM=[[[2.028,1.899],[2.028,4.096],[4.014,1.899],[4.014,4.096]],[[2.028,10.904],[2.028,13.11],[4.014,10.904],[4.014,13.11]],[[10.878,10.904],[10.878,13.11],[12.769,10.904],[12.769,13.11]],[[10.878,1.899],[10.878,4.096],[12.769,1.899],[12.769,4.096]]];
const PM=[{"ar":"2159/696","nl":30.06,"nt":29.11,"nw":38.91,"nh":30,"fm":7.03,"cx":89.35,"cy":62.36,"dfs":9.6,"d":[[32.1,63.94,3.33],[36.36,63.94,3.33],[40.62,63.94,3.33],[44.88,63.94,3.33]]},{"ar":"2152/678","nl":28.9,"nt":30.43,"nw":39.96,"nh":30,"fm":7.05,"cx":90.01,"cy":64.16,"dfs":9.6,"d":[[30.95,65.78,3.35],[35.22,65.78,3.35],[39.5,65.78,3.35],[43.77,65.78,3.35]]},{"ar":"2150/705","nl":31.16,"nt":28.83,"nw":37.67,"nh":30,"fm":7.06,"cx":87.77,"cy":61.84,"dfs":9.6,"d":[[33.21,63.4,3.35],[37.49,63.4,3.35],[41.77,63.4,3.35],[46.05,63.4,3.35]]},{"ar":"2158/677","nl":29.1,"nt":30.05,"nw":39.85,"nh":30,"fm":7.03,"cx":90.04,"cy":63.81,"dfs":9.6,"d":[[31.14,65.44,3.34],[35.4,65.44,3.34],[39.67,65.44,3.34],[43.93,65.44,3.34]]},{"ar":"2170/725","nl":30,"nt":33.5,"nw":38.9,"nh":27,"fm":7.05,"cx":90.5,"cy":61,"dfs":9.6,"d":[[32.1,65,3.33],[36.36,65,3.33],[40.62,65,3.33],[44.88,65,3.33]]},{"ar":"2170/725","nl":30,"nt":33.5,"nw":38.9,"nh":27,"fm":7.05,"cx":90.5,"cy":61,"dfs":9.6,"d":[[32.1,65,3.33],[36.36,65,3.33],[40.62,65,3.33],[44.88,65,3.33]]}];
let HOME=(p,k)=>[[1+k,7],[7,13-k],[13-k,7],[7,1+k]][p];const abs=(p,v)=>(START[p]+v)%LEN;
/* ===== Modo 6 jogadores: tabuleiro em estrela (6 braços), circuito de 78 casas ===== */
PM.push(PM[0],PM[3]);
let SIX=false,LEN=52,LAST=50,LN0=51,CEN=57,NP=4,CENTER=[7,7],PWD=5.4;
const PATH4=PATH,HM4=HM,HOME4=HOME,START4=START,SAFE4=SAFE,SPEC4=SPEC,PX4=PX,PY4=PY;
const START6=[0,13,26,39,52,65],SAFE6=new Set([...START6,...START6.map(x=>(x+8)%78)]),SPEC6={};
[0,1,2,3,4,5].forEach(k=>{SPEC6[13*k+4]='star';SPEC6[13*k+10]='duel';SPEC6[13*k+6]='turbo'});
/* tabuleiro hexagonal (imagem 1343x1171): coordenadas medidas na arte, em unidades de 1343/22 px */
const IMGW=1343,IMGH=1171,UH=IMGW/22;
const COL4=COL.slice(),NAMES4=NAMES.slice(),COL6=['#2f7bff','#2fbf4a','#f5c518','#ff8a1f','#ef3b3b','#a64dff'],NAMES6=['Azul','Verde','Amarelo','Laranja','Vermelho','Roxo'],PMI=[0,2,3,5,1,4];
const G6=(()=>{const ARM=[{"P":[461.78,694.6],"u":[-51.42,29.11],"w":[-31.4,-56.24],"k":[527.0,645.23]},{"P":[466.31,462.43],"u":[-50.64,-29.98],"w":[32.18,-54.93],"k":[532.08,487.58]},{"P":[672.25,344.18],"u":[0.04,-56.47],"w":[63.79,0.45],"k":[675.0,411.17]},{"P":[877.2,465.69],"u":[50.74,-29.15],"w":[30.95,57.34],"k":[803.56,486.06]},{"P":[873.71,698.52],"u":[50.83,28.77],"w":[-33.58,56.37],"k":[811.43,642.43]},{"P":[666.56,801.87],"u":[-0.12,58.12],"w":[-64.86,-0.55],"k":[667.73,728.8]}],HOMES=[[193.3,577],[442.9,190.5],[898.7,191.8],[1143.7,575.1],[901.4,975.1],[434.9,975.3]],P=[],HL=[],HMS=[];
const at=(j,m,c)=>{const A=ARM[j];return[A.P[0]+m*A.u[0]+c*A.w[0],A.P[1]+m*A.u[1]+c*A.w[1]]};
for(let j=0;j<6;j++){const seg=[];for(let m=0;m<6;m++)seg.push(at(j,m,-1));seg.push(at(j,5,0));for(let m=5;m>=0;m--)seg.push(at(j,m,1));
 const st=((13*j-8)%78+78)%78;seg.forEach((q,k)=>{P[(st+k)%78]=[q[1]/UH-.5,q[0]/UH-.5]})}
for(let p=0;p<6;p++){HL.push([0,1,2,3,4,5].map(k=>{const q=k<5?at(p,4-k,0):ARM[p].k;return[q[1]/UH-.5,q[0]/UH-.5]}));
 HMS.push([[-1,-1],[-1,1],[1,-1],[1,1]].map(o=>[(HOMES[p][1]+o[0]*28.5)/UH,(HOMES[p][0]+o[1]*31)/UH]))}
return{P,HL,HMS,CE:[572/UH-.5,667.5/UH-.5]}})();
let PBG=null;
function setCols(six){const a=six?COL6:COL4,b=six?NAMES6:NAMES4;a.forEach((c,i)=>{COL[i]=c;NAMES[i]=b[i]});
 const V=['--bg','--sk','--d1','--d2','--d3'];
 if(!PBG)PBG=[0,1,2,3,4,5].map(i=>{const cs=getComputedStyle(document.getElementById('pl'+i));return V.map(v=>cs.getPropertyValue(v))});
 for(let p=0;p<6;p++){const e=document.getElementById('pl'+p);V.forEach((v,k)=>six?e.style.setProperty(v,PBG[PMI[p]][k]):e.style.removeProperty(v))}}
function setMode(six){SIX=!!six;setCols(SIX);
 if(SIX){LEN=78;LAST=76;LN0=77;CEN=83;NP=6;CENTER=G6.CE;PWD=3.9;PATH=G6.P;START=START6;SAFE=SAFE6;SPEC=SPEC6;HOME=(p,k)=>G6.HL[p][k];HM=G6.HMS;PX=u=>u/22*100;PY=u=>u/(22*IMGH/IMGW)*100}
 else{LEN=52;LAST=50;LN0=51;CEN=57;NP=4;CENTER=[7,7];PWD=5.4;PATH=PATH4;START=START4;SAFE=SAFE4;SPEC=SPEC4;HOME=HOME4;HM=HM4;PX=PX4;PY=PY4}
 document.body.classList.toggle('six',SIX);document.body.classList.toggle('five',SIX&&N===5);const bd=document.getElementById('bd');if(bd)bd.classList.toggle('six',SIX)}
function buildBoard6(){const bd0=$('#bd');bd0.innerHTML='';bd0.classList.remove('cl4');bd0.classList.toggle('cl',!S.turbo);const bd=document.createElement('div');bd.className='fld';bd0.appendChild(bd);document.querySelectorAll('#dbox .die').forEach(e=>e.remove());
const KY=100/(22*IMGH/IMGW),mk=(cls,x,y,w,h)=>{const d=document.createElement('div');d.className=cls;d.style.cssText=`position:absolute;left:${x*100/22}%;top:${y*KY}%;width:${w*100/22}%;height:${h*KY}%`;return d};
PATH.forEach(([r,c],i)=>{const e=mk('c w',c+.04,r+.04,.92,.92);e.onclick=()=>info(i);bd.appendChild(e)});
for(let p=0;p<6;p++)for(let i=0;i<4;i++){const e=document.createElement('div');e.className='pc';e.id=`p${p}${i}`;e.innerHTML='<i class="fx"></i><i class="fm"></i><i class="tgt"></i><i class="fz"><b></b></i>';e.style.setProperty('--c',COL[p]);e.onclick=()=>pick(p,i);bd.appendChild(e)}
const dv=document.createElement('button');dv.id='die';dv.className='die';dv.onclick=hroll;dv.innerHTML='<div class="cube" id="cube">'+[1,2,3,4,5,6].map(n=>'<div class="fc f'+n+'">'+[0,1,2,3,4,5,6,7,8].map(k=>'<i class="pp'+(PIP[n].includes(k)?'':' x')+'"></i>').join('')+'</div>').join('')+'</div>';$('#dbox').prepend(dv);side();legend()}
