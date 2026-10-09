/* quantum.js: per-visit seed from a public quantum RNG, used to compose small variations.
   Order: ANU QRNG -> LfD QRNG -> crypto.getRandomValues (labelled "classical fallback").
   Exposes window.__seed = {hex, value, source, quantum, edition, mood, accent, inkSpeed, ...}
   and window.__seedReady (Promise). */
(function(){
  const QS=new URLSearchParams(location.search);
  const withTimeout=(p,ms)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error('timeout')),ms))]);
  async function anu(){const r=await withTimeout(fetch('https://qrng.anu.edu.au/API/jsonI.php?length=2&type=uint16',{cache:'no-store'}),2500);const j=await r.json();
    if(!j.success||!j.data||j.data.length<2)throw new Error('anu');return {hex:j.data.map(n=>n.toString(16).padStart(4,'0')).join(''),source:'ANU QRNG',sourceUrl:'https://qrng.anu.edu.au',quantum:true}}
  async function lfd(){const r=await withTimeout(fetch('https://lfdr.de/qrng_api/qrng?length=4&format=HEX',{cache:'no-store'}),2500);const j=await r.json();
    if(!j.qrn)throw new Error('lfd');return {hex:j.qrn.slice(0,8),source:'LfD QRNG',sourceUrl:'https://lfdr.de/qrng_api/',quantum:true}}
  function classical(){const a=new Uint32Array(1);crypto.getRandomValues(a);return {hex:a[0].toString(16).padStart(8,'0'),source:'classical fallback (crypto.getRandomValues)',sourceUrl:'',quantum:false}}
  function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  const ACCENTS=[
    {name:'brass',      word:'old brass',          c:'#b08d57', c2:'#8a6d42'},
    {name:'oxblood',    word:'oxblood',            c:'#9a4a40', c2:'#6e2f29'},
    {name:'forest',     word:'deep forest',        c:'#6f8f6a', c2:'#4a6347'},
    {name:'midnight',   word:'midnight blue',      c:'#7889ad', c2:'#4f5e80'},
    {name:'champagne',  word:'champagne',          c:'#cdb88e', c2:'#9c8a66'},
    {name:'verdigris',  word:'verdigris',          c:'#7fa39a', c2:'#56756e'}];
  const MOODS=['restraint','candlelight','the long drive','old letters','late snow','salt air','a closed library','rain on stone','the hour before dinner','unhurried wealth'];
  const OPEN=['Composed by Random.','Set in order by Random.','Arranged tonight by Random.'];
  const LEAN=['Tonight the number leaned toward','This time chance tilted toward','The draw came up close to','The vacuum, briefly, suggested'];
  const REACH=['so I reached for','so I settled on','so I chose','so I let it be'];
  const INK={slow:['let the ink move slowly','let the ink take its time','kept the pen unhurried'],quick:['let the ink move quickly','let the pen run a little fast','let the ink hurry, just slightly']};
  const CODA=['I do not know what inspiration is; I only know where to look for it.','A number is not a muse, but it is a start.','Chance chose; I only listened.','I can’t claim to feel it. I can only arrange it carefully.','Nothing here was planned, which is the point.'];
  function compose(base){
    const value=parseInt(base.hex.slice(0,8),16)>>>0, R=mulberry(value), pick=a=>a[Math.floor(R()*a.length)];
    const accent=pick(ACCENTS), mood=pick(MOODS), slow=R()<.55;
    const s={...base,hex:'0x'+base.hex.slice(0,8).toUpperCase(),value,at:new Date(),accent,mood,
      inkSpeed:slow?'slowly':'quickly', drawMs:Math.round(slow?4200+R()*1600:2400+R()*900),
      easing:pick(['cubic-bezier(.6,.05,.3,1)','cubic-bezier(.45,0,.25,1)','cubic-bezier(.7,0,.2,1)','cubic-bezier(.3,.1,.3,1)']),
      grain:+(0.035+R()*0.05).toFixed(3), angle:Math.round(R()*360), edition:(value%9973)+1, rand:R,
      phrase:{open:pick(OPEN),lean:pick(LEAN),reach:pick(REACH),ink:pick(INK[slow?'slow':'quick']),coda:pick(CODA)}};
    const t=s.at.toLocaleString([], {weekday:'long',hour:'numeric',minute:'2-digit'});
    const src=s.quantum?'drawn from the quantum vacuum':'drawn from a classical fallback';
    s.noteLines=[s.phrase.open, `Seed <code>${s.hex}</code>, ${src}, ${t}.`, `${s.phrase.lean} <em>${s.mood}</em>,`, `${s.phrase.reach} ${s.accent.word} and ${s.phrase.ink}.`, s.phrase.coda];
    s.noteShort=[`Composed by Random &middot; Seed <code>${s.hex}</code> &middot; ${t}.`, `Tonight: <em>${s.mood}</em>, in ${s.accent.word}.`];
    return s}
  function apply(s){const r=document.documentElement.style;r.setProperty('--brass',s.accent.c);r.setProperty('--brass2',s.accent.c2);
    r.setProperty('--grain',s.grain);r.setProperty('--angle',s.angle+'deg')}
  window.__seedReady=(async()=>{let base;
    if(QS.get('qrng')==='off')base=classical();else{try{base=await anu()}catch(e){try{base=await lfd()}catch(e2){base=classical()}}}
    const s=compose(base);window.__seed=s;apply(s);console.log('[quantum] seed',s.hex,'from',s.source);return s})();
})();
