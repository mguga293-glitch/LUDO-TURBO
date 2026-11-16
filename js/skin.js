
function verCartas(){const c=document.getElementById('cards');if(matchMedia('(orientation:landscape) and (max-height:620px)').matches&&!document.body.classList.contains('six')){c.classList.toggle('cov');if(!c.dataset.x){c.dataset.x=1;c.addEventListener('click',e=>{if(c.classList.contains('cov')&&e.target===c)c.classList.remove('cov')})}}else c.scrollIntoView({behavior:'smooth',block:'center'})}
addEventListener('resize',()=>{const c=document.getElementById('cards');if(c&&!matchMedia('(orientation:landscape) and (max-height:620px)').matches)c.classList.remove('cov')});
