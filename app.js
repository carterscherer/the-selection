const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const QS=new URLSearchParams(location.search);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let DATA={},state={watches:'All',wardrobe:'All',collections:'All'},query='';
const io=RM?null:new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
function reveal(els,stagger=90){els.forEach((el,i)=>{el.classList.add('reveal');if(RM||!io){el.classList.add('in');return}el.style.transitionDelay=(i%4)*stagger+'ms';io.observe(el)})}
const init=b=>`<span class="init">${esc((b||'·').trim()[0])}</span>`;
function card(it){const img=it.image?`<img loading="lazy" src="${esc(it.image)}" alt="${esc(it.name)}" referrerpolicy="no-referrer" data-b="${esc(it.brand)}">`:init(it.brand);
return `<article class="card"><div class="img">${img}</div><div class="body"><div class="brand">${esc(String(it.brand||'').toLowerCase())}</div><h3 class="name">${esc(it.name)}</h3><div class="foot">${it.price?`<span class="price">${esc(it.price)}</span>`:'<span class="price none"></span>'}<a class="btn" href="${esc(it.link)}" target="_blank" rel="noopener">${it.type==='Collection'?'Shop':'View'}<span class="ar" aria-hidden="true">→</span></a></div></div></article>`}
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
function garage(){const el=document.querySelector('.garage'),C=DATA.garage||[],n=C.length;if(!n){el.innerHTML='';return}
const R=k=>{const m=[[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];let o='';for(const[v,s]of m)while(k>=v){o+=s;k-=v}return o};
el.className='garage gx';el.setAttribute('role','region');el.setAttribute('aria-roledescription','carousel');el.setAttribute('aria-label','The Garage');el.tabIndex=0;
el.innerHTML=`<div class="gx-stage">${C.map((c,i)=>`<article class="gx-slide" aria-roledescription="slide" aria-label="${i+1} of ${n}" aria-hidden="true"><div class="gx-ph">${c.image?`<img src="${esc(c.image)}" alt="${esc(c.name)}" referrerpolicy="no-referrer" ${i>1?'loading="lazy"':''} draggable="false">`:''}</div><div class="gx-copy"><div class="gx-brand">${esc(c.brand)}</div><h3 class="gx-name">${esc(c.name)}</h3><p class="gx-note">${esc(c.note)}</p><a class="btn gx-view" href="${esc(c.link)}" target="_blank" rel="noopener" tabindex="-1">View</a></div></article>`).join('')}</div>
<button class="gx-nav gx-prev" aria-label="Previous car"><span></span></button><button class="gx-nav gx-next" aria-label="Next car"><span></span></button>
<div class="gx-foot"><div class="gx-idx" aria-live="polite"><b>I</b><i>/</i><span>${R(n)}</span></div><div class="gx-bar"><i></i></div><div class="gx-thumbs">${C.map((c,i)=>`<button aria-label="${esc(c.name)}"><span>${R(i+1)}</span></button>`).join('')}</div></div>`;
const S=[...el.querySelectorAll('.gx-slide')],T=[...el.querySelectorAll('.gx-thumbs button')],idx=el.querySelector('.gx-idx b'),bar=el.querySelector('.gx-bar i');let cur=-1;
function go(i,dir){i=(i+n)%n;if(i===cur)return;dir=dir||(i>cur?1:-1);el.style.setProperty('--dir',dir);
 S.forEach((s,k)=>{const on=k===i,was=k===cur;s.classList.toggle('on',on);s.classList.toggle('out',was);s.setAttribute('aria-hidden',!on);s.querySelector('a').tabIndex=on?0:-1});
 T.forEach((t,k)=>t.classList.toggle('on',k===i));cur=i;idx.textContent=R(i+1);bar.style.transform=`scaleX(${(i+1)/n})`;
 const nx=S[(i+1)%n].querySelector('img');if(nx)nx.loading='eager'}
el.querySelector('.gx-prev').onclick=()=>go(cur-1,-1);el.querySelector('.gx-next').onclick=()=>go(cur+1,1);T.forEach((t,k)=>t.onclick=()=>go(k));
el.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){go(cur+1,1);e.preventDefault()}if(e.key==='ArrowLeft'){go(cur-1,-1);e.preventDefault()}});
document.addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,textarea,.gx'))return;const r=el.getBoundingClientRect();if(r.top<innerHeight*.6&&r.bottom>innerHeight*.4){if(e.key==='ArrowRight')go(cur+1,1);if(e.key==='ArrowLeft')go(cur-1,-1)}});
let x0=null,y0=0,dx=0;const st=el.querySelector('.gx-stage');
st.addEventListener('pointerdown',e=>{if(e.target.closest('a'))return;x0=e.clientX;y0=e.clientY;dx=0;st.setPointerCapture(e.pointerId)});
st.addEventListener('pointermove',e=>{if(x0===null)return;dx=e.clientX-x0;if(Math.abs(dx)>Math.abs(e.clientY-y0))el.style.setProperty('--drag',(dx/innerWidth).toFixed(3))});
const end=()=>{if(x0===null)return;el.style.setProperty('--drag',0);if(Math.abs(dx)>50)go(cur+(dx<0?1:-1),dx<0?1:-1);x0=null};st.addEventListener('pointerup',end);st.addEventListener('pointercancel',end);
go(0,1)}
/* Places: places[] = {name, city, lat, lng, note, link, image}. Leaflet + dark tiles load only when places exist. */
function places(){const P=DATA.places||[],wrap=document.querySelector('.places-wrap');if(!P.length){wrap.hidden=true;return}
 const REG=p=>/paris/i.test(p.city)?'Paris':/normandy/i.test(p.city)?'Normandy':/california|san francisco/i.test(p.city)?'California':'Elsewhere';
 const list=document.querySelector('.pl-list'),regs=['Everywhere',...['California','Paris','Normandy','Elsewhere'].filter(r=>P.some(p=>REG(p)===r))];
 list.innerHTML=P.map((p,i)=>`<li class="pl-card" data-i="${i}" data-r="${REG(p)}"><span class="pl-n">${String(i+1).padStart(2,'0')}</span><div class="pl-b"><div class="pl-loc">${esc(p.city.toLowerCase())}</div><h3 class="pl-name"><button type="button" class="pl-go">${esc(p.name)}</button></h3><p class="pl-note">${esc(p.note)}</p><a class="pl-dir" href="${esc(p.link)}" target="_blank" rel="noopener">directions<span aria-hidden="true">→</span></a></div></li>`).join('');
 const rb=document.querySelector('.pl-regions');rb.innerHTML=regs.map((r,i)=>`<button type="button" class="pl-reg${i?'':' on'}" data-r="${r}">${r.toLowerCase()}</button>`).join('');
 reveal([...list.children],60);
 const go=()=>{if(!window.L)return;const m=document.getElementById('map');
  const map=L.map(m,{scrollWheelZoom:false,zoomControl:true,attributionControl:true,worldCopyJump:true});
  const E='https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/';
  L.tileLayer(E+'World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',{attribution:'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors',maxZoom:16}).addTo(map);
  L.tileLayer(E+'World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',{maxZoom:16,opacity:.75}).addTo(map);
  const icon=n=>L.divIcon({className:'pl-pin',html:`<span>${n}</span>`,iconSize:[26,26],iconAnchor:[13,13]});
  const M=P.map((p,i)=>L.marker([p.lat,p.lng],{icon:icon(i+1),title:p.name,keyboard:true}).addTo(map).bindPopup(`<div class="pl-pop"><div class="pl-loc">${esc(p.city.toLowerCase())}</div><b>${esc(p.name)}</b><p>${esc(p.note)}</p><a href="${esc(p.link)}" target="_blank" rel="noopener">directions →</a></div>`,{closeButton:false,maxWidth:260}));
  const fit=r=>{const ll=P.map((p,i)=>[p,i]).filter(([p])=>r==='Everywhere'||REG(p)===r).map(([p])=>[p.lat,p.lng]);if(ll.length===1)map.flyTo(ll[0],12,{duration:RM?0:1.2});else map.flyToBounds(ll,{padding:[40,40],maxZoom:14,duration:RM?0:1.2})};
  map.fitBounds(P.map(p=>[p.lat,p.lng]),{padding:[30,30]});
  rb.onclick=e=>{const b=e.target.closest('.pl-reg');if(!b)return;rb.querySelectorAll('.pl-reg').forEach(x=>x.classList.toggle('on',x===b));const r=b.dataset.r;list.querySelectorAll('.pl-card').forEach(c=>c.classList.toggle('dim',r!=='Everywhere'&&c.dataset.r!==r));fit(r)};
  list.onclick=e=>{const b=e.target.closest('.pl-go');if(!b)return;const i=+b.closest('.pl-card').dataset.i;map.flyTo([P[i].lat,P[i].lng],P[i].city.match(/paris/i)?15:12,{duration:RM?0:1.4});M[i].openPopup();m.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'})};
  list.querySelectorAll('.pl-card').forEach(c=>{const i=+c.dataset.i;c.onmouseenter=()=>M[i].getElement()?.classList.add('hot');c.onmouseleave=()=>M[i].getElement()?.classList.remove('hot')});
 };
 if(window.L)go();else{const s=document.createElement('script');s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';s.onload=go;document.head.appendChild(s)}}
function nav(){const n=document.getElementById('topnav');const onS=()=>{n.classList.toggle('solid',scrollY>80);let cur='';document.querySelectorAll('.chapter').forEach(c=>{if(c.getBoundingClientRect().top<innerHeight*.4)cur=c.id});n.querySelectorAll('.links a').forEach(a=>a.classList.toggle('cur',a.getAttribute('href')==='#'+cur))};addEventListener('scroll',onS,{passive:true});onS()}
function composeNote(){const s=window.__seed;if(!s)return;
 const el=document.getElementById('dnote');el.innerHTML=s.noteShort.map(l=>`<span class="ln">${l}</span>`).join('')+'<span class="sigline">— Random</span>';
 requestAnimationFrame(()=>el.classList.add('on'));
 const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};set('c-ed','No. '+s.edition);set('c-seed',s.hex);set('c-src',s.source);set('c-acc',s.accent.word);set('c-mood',s.mood)}
function seededOrder(arr){const s=window.__seed;if(!s||!arr.length)return arr;const R=s.rand,a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function open(){Promise.race([(window.__seedReady||Promise.resolve()).catch(()=>{}),new Promise(r=>setTimeout(r,1800))]).then(()=>{composeNote();load()})}
function load(){fetch('data.json').then(r=>r.json()).then(d=>{DATA=d;DATA.garage=seededOrder(DATA.garage||[]);garage();for(const k of ['watches','wardrobe','collections']){chips(k);render(k)}places();
 reveal([...document.querySelectorAll('.titlecard')],0);
 const only=QS.get('only');if(only){document.querySelectorAll('.chapter,.frontis').forEach(s=>{if(s.id!==only)s.style.display='none'})}
 if(location.hash)setTimeout(()=>document.querySelector(location.hash)?.scrollIntoView(),50)});
 document.querySelector('.q').addEventListener('input',e=>{query=e.target.value.toLowerCase();render('wardrobe')});nav()}
document.addEventListener('book:open',open,{once:true});
if(!RM&&matchMedia('(hover:hover)').matches){const c=document.querySelector('.cursor');let x=0,y=0,cx=0,cy=0;
addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;c.style.opacity=1});(function loop(){cx+=(x-cx)*.18;cy+=(y-cy)*.18;c.style.transform=`translate(${cx-15}px,${cy-15}px)`;requestAnimationFrame(loop)})();
document.addEventListener('mouseover',e=>c.classList.toggle('big',!!e.target.closest('a,button,.card,.car')))}
