/* ============================================================
   gate.js: entrance, designer's note, reality-shift portal, (future) paywall.

   TODO(payments): Set PAYWALL_ENABLED = true and implement startCheckout().
     Option A, Stripe Payment Link (simplest, no backend):
       - Create a $0.99 one-time Payment Link in Stripe with Apple Pay enabled.
       - Success URL: https://<site>/?paid={CHECKOUT_SESSION_ID}
       - startCheckout() => location.href = STRIPE_PAYMENT_LINK
       - verifyAccess() should confirm the session server-side (small serverless function).
     Option B, Apple Pay on the Web: needs domain verification + merchant validation endpoint.
       Mount the Apple Pay button into #pay-slot.
   NOTE: localStorage is a convenience flag, not security.
   ============================================================ */
(function(){
  const PAYWALL_ENABLED = false;
  const PRICE_LABEL = '$0.99 · one-time';
  const STRIPE_PAYMENT_LINK = '';           // TODO(payments)
  const KEY = 'unlocked';
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const qs = new URLSearchParams(location.search);
  const $ = s => document.querySelector(s);

  const isUnlocked = () => localStorage.getItem(KEY) === '1' || qs.get('demo') === 'unlocked';
  const grantAccess = () => localStorage.setItem(KEY, '1');
  async function startCheckout(){ if (STRIPE_PAYMENT_LINK) { location.href = STRIPE_PAYMENT_LINK; return false; } return true; }
  async function verifyAccess(){ return false; } // TODO(payments)

  function showBook(){
    document.body.classList.remove('locked');
    $('#gate').style.display = 'none';
    $('#book').hidden = false;
    document.dispatchEvent(new Event('book:open'));
  }

  /* ---------- designer's note, line by line ---------- */
  let finishNote = null;
  function playNote(){
    const s = window.__seed, box = $('#gnote');
    const lines = s ? s.noteLines : ['Composed by Random.','The seed did not arrive tonight; I began anyway.'];
    box.innerHTML = lines.map(l=>`<span class="ln">${l}</span>`).join('') + '<span class="ln sign">— Random</span>';
    const els = [...box.children]; let done = false, timers = [];
    const reveal = () => { if (done) return; done = true; timers.forEach(clearTimeout); els.forEach(e=>e.classList.add('on')); $('#skiphint').classList.add('gone');
      setTimeout(()=>{ const b=$('#enter'); b.hidden=false; requestAnimationFrame(()=>b.classList.add('on')); }, RM?0:700); };
    finishNote = reveal;
    if (RM || qs.get('demo')==='landing') { reveal(); return; }
    let t = 900;
    els.forEach((e,i)=>{ timers.push(setTimeout(()=>e.classList.add('on'), t)); t += e.classList.contains('sign') ? 0 : 1300 + e.textContent.length*28; if (i===els.length-2) t += 600; });
    timers.push(setTimeout(reveal, t + 900));
    setTimeout(()=>$('#skiphint').classList.add('show'), 2200);
    $('#gate').addEventListener('click', e => { if (!done && !e.target.closest('#enter')) reveal(); });
    addEventListener('keydown', e => { if (!done && (e.key===' '||e.key==='Enter')) { e.preventDefault(); reveal(); } });
  }

  /* ---------- reality-shift portal (JS-driven timeline so it can be frozen for previews) ---------- */
  const DUR = 3200;
  const ease = x => x<.5 ? 4*x*x*x : 1-Math.pow(-2*x+2,3)/2;
  const seg = (t,a,b) => Math.min(1, Math.max(0, (t-a)/(b-a)));
  function frame(t){
    const g = $('#gate'), inner = $('#gate-inner'), d = document.getElementById('warp-d'), tb = document.getElementById('warp-t');
    const P = $('#portal'), light = P.querySelector('.p-light'), flash = P.querySelector('.p-flash'), book = $('#book');
    const a = ease(seg(t,0,1100));          // distortion builds, time slows
    const c = ease(seg(t,700,1900));         // fold into a point
    const f1 = seg(t,1850,2050), f2 = seg(t,2050,2500);   // flash in / out
    const m = ease(seg(t,2150,DUR));         // book materializes
    d.setAttribute('scale', (a*28*(1-c*.4)).toFixed(1));
    tb.setAttribute('baseFrequency', `${(0.008+a*0.01).toFixed(4)} ${(0.012+a*0.02).toFixed(4)}`);
    const split = (a*7).toFixed(1);
    g.style.filter = `url(#warp) saturate(${1-a*.5}) brightness(${1+c*1.4})`;
    inner.style.textShadow = `${split}px 0 rgba(200,60,60,.55), -${split}px 0 rgba(70,120,220,.55)`;
    inner.style.transform = `scale(${1+a*.05})`; inner.style.opacity = 1 - c*.9;
    document.querySelector('.grain').style.opacity = (0.06 + a*0.28*(1-m)).toFixed(3);
    const r = (1-c)*150; g.style.clipPath = `circle(${Math.max(r,0.0001)}% at 50% 50%)`;
    light.style.opacity = c*(1-f2); light.style.transform = `translate(-50%,-50%) scale(${0.2+c*1.2+f1*6})`;
    flash.style.opacity = f1*(1-f2);
    if (t >= 2050 && book.hidden) { showBookUnder(); }
    if (!book.hidden) { book.style.opacity = m; book.style.filter = `blur(${(1-m)*18}px)`; }
  }
  function showBookUnder(){ $('#book').hidden = false; document.body.classList.remove('locked'); $('#book').style.opacity = 0; document.dispatchEvent(new Event('book:open')); }
  function finishPortal(){ $('#gate').style.display='none'; const b=$('#book'); b.style.filter=''; b.style.opacity=''; $('#portal').style.display='none'; document.querySelector('.grain').style.opacity=''; }

  function crossOver(){
    grantAccess();
    if (RM) { $('#gate').style.transition='opacity .6s'; $('#gate').style.opacity=0; setTimeout(showBook, 600); return; }
    $('#portal').style.display = 'block';
    const freeze = qs.get('demo')==='portal' ? +(qs.get('t')||1000) : null;
    if (freeze !== null) { frame(freeze); return; }
    const t0 = performance.now();
    (function loop(now){ const t = now - t0; frame(t); if (t < DUR) requestAnimationFrame(loop); else finishPortal(); })(t0);
  }

  function openAccessCard(){
    const card = $('#access'); card.hidden = false; $('#access .price').textContent = PRICE_LABEL;
    $('#access-go').onclick = async () => { if (await startCheckout()) { card.hidden = true; crossOver(); } };
    $('#access-close').onclick = () => { card.hidden = true; };
  }

  window.Gate = { isUnlocked, grantAccess, startCheckout, verifyAccess, openAccessCard, crossOver };

  document.addEventListener('DOMContentLoaded', async () => {
    if (qs.get('demo') === 'reset') localStorage.removeItem(KEY);
    if (await verifyAccess()) grantAccess();
    const d = qs.get('demo');
    if (isUnlocked() && !['portal','gate','landing','card'].includes(d)) { showBook(); return; }
    try { await Promise.race([window.__seedReady, new Promise(r=>setTimeout(r,1800))]); } catch(e){}
    if (d === 'portal') { playNote(); finishNote(); setTimeout(crossOver, 1800); return; }
    playNote();
    $('#enter').addEventListener('click', e => { e.stopPropagation(); PAYWALL_ENABLED ? openAccessCard() : crossOver(); });
    if (d === 'card') openAccessCard();
  });
})();
