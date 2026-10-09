const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const _vh=new URLSearchParams(location.search).get('vh');if(_vh)document.documentElement.style.setProperty('--heroH',_vh+'px');
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let DATA={},state={watches:'All',wardrobe:'All',collections:'All'},query='';
// signature draw
(function(){const p=document.getElementById('sigpath'),svg=p.closest('svg');if(RM){svg.classList.add('drawn');return}
const L=p.getTotalLength();p.style.strokeDasharray=L;p.style.strokeDashoffset=L;p.getBoundingClientRect();
p.style.transition='stroke-dashoffset 4.2s cubic-bezier(.6,.05,.3,1)';requestAnimationFrame(()=>p.style.strokeDashoffset=0);
setTimeout(()=>svg.classList.add('drawn'),3400)})();
// nav
const nav=document.getElementById('topnav');const onS=()=>nav.classList.toggle('solid',scrollY>innerHeight*.85);addEventListener('scroll',onS,{passive:true});onS();
// cards
const io=RM?null:new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
const ph=b=>`<span class="ph">${esc((b||'·').trim()[0])}</span>`;
function card(it){const img=it.image?`<img loading="lazy" src="${esc(it.image)}" alt="${esc(it.name)}" referrerpolicy="no-referrer" data-b="${esc(it.brand)}">`:ph(it.brand);
return `<article class="card"><div class="img">${img}</div><div class="brand">${esc(it.brand)}</div><h3 class="name">${esc(it.name)}</h3><div class="price">${esc(it.price)}</div><a class="btn" href="${esc(it.link)}" target="_blank" rel="noopener">${it.type==='Collection'?'Shop':'View'}</a></article>`}
const CAT=[['Watches',/watch|automatik|aachen|viper|speedmaster|tissot|tank|president|oris|g-shock|de ville|paderborn/i],['Rings & Jewelry',/ring|signet|pearl|jewel/i],
 ['Fragrance & Grooming',/parfum|perfume|toilette|cologne|fragrance|eau de|balm|wax|powder|clay|toothbrush|ombre|météore|immensit/i],['Footwear',/shoe|loafer|boot|sandal|sneaker|weejun|lowpro|runner|mule|chambelimoc|riviera/i],
 ['Apparel',/shirt|tee|pant|short|trunk|jean|sweater|sweatshirt|hoodie|jacket|suit|polo|brief|boxer|robe|trouser|jogger|wetsuit|tight|belt|swim/i],
 ['Home',/towel|duvet|sheet|blanket|pillow|curtain|bookcase|pouf|bistro|glass|bowl|candle|mailbox|shower|stool|chopstick|lantern/i],
 ['Gear & Tech',/camera|battery|guitar|dobro|telecaster|esc|airplane|tent|xbox|controller|generator|board|juicer|knife|wrench|motor|vortex|duck|ring 5|oura/i],
 ['Collectibles',/revolver|smith|henry|painting|artwork|bridge|cards|vehicle|tequila|tea|espresso|gainer|capsule|pre-workout/i]];
const catOf=it=>{for(const[c,r]of CAT)if(r.test(it.name))return c;return 'Other'};
function chipsFor(k){const items=DATA[k];if(k==='collections'){const t=['All','Apparel','Eyewear','Swim','Gear & Home','Fragrance & Care'];return t}
const s=new Set(items.map(catOf));return ['All',...CAT.map(c=>c[0]).filter(c=>s.has(c)),...(s.has('Other')?['Other']:[])]}
const COLL=n=>/optical|eyeglass|sunglass/i.test(n)?'Eyewear':/swim|trunk/i.test(n)?'Swim':/fragrance|oribe|roche|caswell|cigar/i.test(n)?'Fragrance & Care':/fpv|jetcat|vyper|nudient|truck|leica|aston|search|helmet|blanket|mozi|benchmade/i.test(n)?'Gear & Home':'Apparel';
const cat=(k,it)=>k==='collections'?COLL(it.name):catOf(it);
function render(k){const el=document.querySelector(`#${k} .grid`),f=state[k];
const items=DATA[k].filter(it=>(f==='All'||cat(k,it)===f)&&(!query||k!=='wardrobe'||(it.name+' '+it.brand).toLowerCase().includes(query)));
el.innerHTML=items.map(card).join('')||'<p style="grid-column:1/-1;text-align:center;font-style:italic;color:#8a8172">Nothing here yet.</p>';
el.querySelectorAll('img').forEach(im=>im.addEventListener('error',()=>{im.outerHTML=ph(im.dataset.b)},{once:true}));
[...el.children].forEach((c,i)=>{if(RM||!io){c.classList.add('in');return}c.style.transitionDelay=(i%4)*90+'ms';io.observe(c)})}
function chips(k){const box=document.querySelector(`.chips[data-for=${k}]`);box.innerHTML=chipsFor(k).map(c=>`<button class="chip${c===state[k]?' on':''}">${c}</button>`).join('');
box.onclick=e=>{if(!e.target.matches('.chip'))return;state[k]=e.target.textContent;chips(k);render(k)}}
fetch('data.json').then(r=>r.json()).then(d=>{DATA=d;for(const k of ['watches','wardrobe','collections']){chips(k);render(k)}
const feat=d.watches.filter(i=>i.image&&i.type!=='Collection');document.getElementById('track').innerHTML=[...feat,...feat].map(i=>`<a href="${esc(i.link)}" target="_blank" rel="noopener"><img src="${esc(i.image)}" alt="" referrerpolicy="no-referrer" loading="lazy"><span>${esc(i.brand)}</span></a>`).join('')});
document.querySelector('.q').addEventListener('input',e=>{query=e.target.value.toLowerCase();render('wardrobe')});
// cursor
if(!RM&&matchMedia('(hover:hover)').matches){const c=document.querySelector('.cursor');let x=0,y=0,cx=0,cy=0;
addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;c.style.opacity=1});
(function loop(){cx+=(x-cx)*.18;cy+=(y-cy)*.18;c.style.transform=`translate(${cx-15}px,${cy-15}px)`;requestAnimationFrame(loop)})();
document.addEventListener('mouseover',e=>c.classList.toggle('big',!!e.target.closest('a,button,.card')))}
