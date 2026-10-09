/* ============================================================
   gate.js — entrance + (future) paywall.
   Everything about access lives here so payments can drop in later.

   TODO(payments): Set PAYWALL_ENABLED = true and implement startCheckout().
     Option A — Stripe Payment Link (simplest, no backend):
       - Create a $0.99 one-time Payment Link in Stripe with Apple Pay enabled.
       - Set its success URL to https://<site>/?paid={CHECKOUT_SESSION_ID}
       - startCheckout() => location.href = STRIPE_PAYMENT_LINK
       - On return, verifyAccess() should confirm the session server-side
         (tiny serverless function) before calling grantAccess().
     Option B — Apple Pay on the Web (Payment Request API / Apple Pay JS):
       - Requires domain verification (/.well-known/apple-developer-merchantid-domain-association)
         and a merchant validation endpoint, so it needs a small backend.
       - Mount the Apple Pay button into #pay-slot.
   NOTE: localStorage is a convenience flag only, not real security. Real gating needs
   the content (data.json) served only after server-side verification.
   ============================================================ */
(function(){
  const PAYWALL_ENABLED = false;          // flip when payments are wired
  const PRICE_LABEL = '$0.99 · one-time';
  const STRIPE_PAYMENT_LINK = '';         // TODO(payments): e.g. https://buy.stripe.com/...
  const KEY = 'unlocked';
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const qs = new URLSearchParams(location.search);
  const $ = s => document.querySelector(s);

  function isUnlocked(){ return localStorage.getItem(KEY) === '1' || qs.get('demo') === 'unlocked'; }
  function grantAccess(){ localStorage.setItem(KEY, '1'); }

  async function startCheckout(){
    // TODO(payments): replace this stub.
    if (STRIPE_PAYMENT_LINK) { location.href = STRIPE_PAYMENT_LINK; return false; }
    return true; // stub: grant immediately
  }
  async function verifyAccess(){
    // TODO(payments): if qs.has('paid'), call your verify endpoint, then grantAccess().
    return false;
  }

  function showBook(){
    document.body.classList.remove('locked');
    $('#gate').style.display = 'none';
    $('#book').hidden = false;
    document.dispatchEvent(new Event('book:open'));
  }

  function cinematicUnlock(){
    grantAccess();
    if (RM) { showBook(); return; }
    const b = document.body;
    b.classList.add('unlocking');
    if (qs.get('demo') === 'unlocking') { b.classList.add('still'); return; }
    setTimeout(()=>{ $('#gate').style.opacity = 0; }, 2000);
    setTimeout(()=>{ showBook(); }, 2700);
    setTimeout(()=>{ b.classList.remove('unlocking'); }, 4500);
  }

  function openAccessCard(){
    const card = $('#access'); card.hidden = false; $('#access .price').textContent = PRICE_LABEL;
    $('#access-go').onclick = async () => { if (await startCheckout()) { card.hidden = true; cinematicUnlock(); } };
    $('#access-close').onclick = () => { card.hidden = true; };
  }

  // signature draw on the gate
  function drawSignature(){
    const p = document.getElementById('sigpath'), svg = p.closest('svg');
    if (RM) { svg.classList.add('drawn'); return; }
    const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.getBoundingClientRect();
    const s = window.__seed || {drawMs:3800, easing:'cubic-bezier(.6,.05,.3,1)'};
    p.style.transition = `stroke-dashoffset ${s.drawMs}ms ${s.easing}`;
    requestAnimationFrame(()=> p.style.strokeDashoffset = 0);
    setTimeout(()=> svg.classList.add('drawn'), s.drawMs*0.8);
  }

  window.Gate = { isUnlocked, grantAccess, startCheckout, verifyAccess, openAccessCard, cinematicUnlock };

  document.addEventListener('DOMContentLoaded', async () => {
    if (qs.get('demo') === 'reset') localStorage.removeItem(KEY);
    if (await verifyAccess()) grantAccess();
    if (isUnlocked() && qs.get('demo') !== 'unlocking' && qs.get('demo') !== 'gate') { showBook(); return; }
    try { await Promise.race([window.__seedReady, new Promise(r=>setTimeout(r,1800))]); } catch(e){}
    drawSignature();
    $('#enter').addEventListener('click', () => PAYWALL_ENABLED ? openAccessCard() : cinematicUnlock());
    if (qs.get('demo') === 'unlocking') setTimeout(cinematicUnlock, 300);
    if (qs.get('demo') === 'card') openAccessCard();
  });
})();
