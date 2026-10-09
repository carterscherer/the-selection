const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const QS=new URLSearchParams(location.search);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let DATA={},state={watches:'All',wardrobe:'All',collections:'All'},query='';
const io=RM?null:new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
function reveal(els,stagger=90){els.forEach((el,i)=>{el.classList.add('reveal');if(RM||!io){el.classList.add('in');return}el.style.transitionDelay=(i%4)*stagger+'ms';io.observe(el)})}
const init=b=>`<span class="init">${esc((b||'·').trim()[0])}</span>`;
function card(it){const img=it.image?`<img loading="lazy" src="${esc(it.image)}" alt="${esc(it.name)}" referrerpolicy="no-referrer" data-b="${esc(it.brand)}">`:init(it.brand);
return `<article class="card"><div class="img">${img}</div><div class="brand">${esc(it.brand)}</div><h3 class="name">${esc(it.name)}</h3><div class="price">${esc(it.price)}</div><a class="btn" href="${esc(it.link)}" target="_blank" rel="noopener">${it.type==='Collection'?'Shop':'View'}</a></article>`}
const CAT=[['Watches',/watch|automatik|aachen|viper|speedmaster|tissot|tank|president|oris|g-shock|de ville|paderborn/i],['Rings & Jewelry',/ring|signet|pearl|jewel/i],
 ['Fragrance & Grooming',/parfum|perfume|toilette|cologne|fragrance|eau de|balm|wax|powder|clay|toothbrush|ombre|météore|immensit/i],['Footwear',/shoe|loafer|boot|sandal|sneaker|weejun|lowpro|runner|mule|chambelimoc|riviera/i],
 ['Apparel',/shirt|tee|pant|short|trunk|jean|sweater|sweatshirt|hoodie|jacket|suit|polo|brief|boxer|robe|trouser|jogger|wetsuit|tight|belt|swim/i],
 ['Home',/towel|duvet|sheet|blanket|pillow|curtain|bookcase|pouf|bistro|glass|bowl|candle|mailbox|shower|stool|chopstick|lantern/i],
 ['Gear & Tech',/camera|battery|guitar|dobro|telecaster|esc|airplane|tent|xbox|controller|generator|board|juicer|knife|wrench|motor|vortex|duck|oura/i],
 ['Collectibles',/revolver|smith|henry|painting|artwork|bridge|cards|vehicle|tequila|tea|espresso|gainer|capsule/i]];
const catOf=it=>{for(const[c,r]of CAT)if(r.test(it.name))return c;return 'Other'};
const COLL=n=>/optical|eyeglass|sunglass/i.test(n)?'Eyewear':/swim|trunk/i.test(n)?'Swim':/fragrance|oribe|roche|caswell|cigar/i.test(n)?'Fragrance & Care':/fpv|jetcat|vyper|nudient|truck|leica|aston|search|helmet|blanket|mozi|benchmade/i.test(n)?'Gear & Home':'Apparel';
const cat=(k,it)=>k==='collections'?COLL(it.name):catOf(it);
function chipsFor(k){if(k==='collections')return ['All','Apparel','Eyewear','Swim','Gear & Home','Fragrance & Care'];const s=new Set(DATA[k].map(catOf));return ['All',...CAT.map(c=>c[0]).filter(c=>s.has(c)),...(s.has('Other')?['Other']:[])]}
function render(k){const el=document.querySelector(`#${k} .grid`),f=state[k];
const items=DATA[k].filter(it=>(f==='All'||cat(k,it)===f)&&(!query||k!=='wardrobe'||(it.name+' '+it.brand).toLowerCase().includes(query)));
el.innerHTML=items.map(card).join('')||'<p style="grid-column:1/-1;text-align:center;font-style:italic;color:var(--dim)">Nothing here yet.</p>';
el.querySelectorAll('img').forEach(im=>im.addEventListener('error',()=>{im.outerHTML=init(im.dataset.b)},{once:true}));reveal([...el.children])}
function chips(k){const box=document.querySelector(`.chips[data-for=${k}]`);box.innerHTML=chipsFor(k).map(c=>`<button class="chip${c===state[k]?' on':''}">${c}</button>`).join('');
box.onclick=e=>{if(!e.target.matches('.chip'))return;state[k]=e.target.textContent;chips(k);render(k)}}
function garage(){const el=document.querySelector('.garage');el.innerHTML=(DATA.garage||[]).map(c=>`<article class="car"><div class="ph">${c.image?`<img loading="lazy" src="${esc(c.image)}" alt="${esc(c.name)}" referrerpolicy="no-referrer">`:''}</div>
<div class="meta"><div><div class="brand">${esc(c.brand)}</div><h3>${esc(c.name)}</h3></div><a class="btn" href="${esc(c.link)}" target="_blank" rel="noopener">View</a></div><p class="note">${esc(c.note)}</p></article>`).join('');reveal([...el.children],140)}
/* Places: places[] = {name, city, lat, lng, note, link, image}. Leaflet + dark tiles load only when places exist. */
function places(){const P=DATA.places||[];if(!P.length)return;
 const css=document.createElement('link');css.rel='stylesheet';css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(css);
 const s=document.createElement('script');s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';s.onload=()=>{const m=document.getElementById('map');m.hidden=false;document.querySelector('.map-teaser').hidden=true;
  const map=L.map(m,{scrollWheelZoom:false}).setView([P[0].lat,P[0].lng],13);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{attribution:'&copy; OpenStreetMap &copy; CARTO',maxZoom:19}).addTo(map);
  P.forEach(p=>L.circleMarker([p.lat,p.lng],{radius:6,color:'#b08d57',fillColor:'#b08d57',fillOpacity:.7,weight:1}).addTo(map).bindPopup(`<b>${esc(p.name)}</b><br>${esc(p.note)}${p.link?`<br><a href="${esc(p.link)}" target="_blank" rel="noopener">View</a>`:''}`))};document.head.appendChild(s)}
function nav(){const n=document.getElementById('topnav');const onS=()=>{n.classList.toggle('solid',scrollY>80);let cur='';document.querySelectorAll('.chapter').forEach(c=>{if(c.getBoundingClientRect().top<innerHeight*.4)cur=c.id});n.querySelectorAll('.links a').forEach(a=>a.classList.toggle('cur',a.getAttribute('href')==='#'+cur))};addEventListener('scroll',onS,{passive:true});onS()}
function open(){fetch('data.json').then(r=>r.json()).then(d=>{DATA=d;garage();for(const k of ['watches','wardrobe','collections']){chips(k);render(k)}places();
 reveal([...document.querySelectorAll('.titlecard')],0);
 const only=QS.get('only');if(only){document.querySelectorAll('.chapter,.frontis').forEach(s=>{if(s.id!==only)s.style.display='none'})}
 if(location.hash)setTimeout(()=>document.querySelector(location.hash)?.scrollIntoView(),50)});
 document.querySelector('.q').addEventListener('input',e=>{query=e.target.value.toLowerCase();render('wardrobe')});nav()}
document.addEventListener('book:open',open,{once:true});
if(!RM&&matchMedia('(hover:hover)').matches){const c=document.querySelector('.cursor');let x=0,y=0,cx=0,cy=0;
addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;c.style.opacity=1});(function loop(){cx+=(x-cx)*.18;cy+=(y-cy)*.18;c.style.transform=`translate(${cx-15}px,${cy-15}px)`;requestAnimationFrame(loop)})();
document.addEventListener('mouseover',e=>c.classList.toggle('big',!!e.target.closest('a,button,.card,.car')))}
