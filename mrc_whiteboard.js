/* ============================================================
   MRC Course — Whiteboard derivation step navigation
   ------------------------------------------------------------
   Shared JS for animated step-by-step derivation pages.
   Each page declares window.STEP_CAPTIONS = [ ... ] before
   loading this script. Index 0 is the "press next to begin"
   caption; indices 1..N correspond to steps 1..N.

   To use: at end of <body>, after the captions,
     <script src="../../mrc_whiteboard.js"></script>

   The page must contain:
     - .step elements with data-step="1", "2", ... "N"
     - #caption, #counter
     - #prevBtn, #nextBtn, #resetBtn
   ============================================================ */

(function() {
  const captions = window.STEP_CAPTIONS || [];
  const total = document.querySelectorAll('.step').length;
  let current = 0;

  // detect whether this whiteboard is embedded inside the deck shell.
  // when embedded, → at the last step (and ← at step 0) escalate to the
  // parent deck via postMessage so the lecturer can keep arrowing through.
  const inIframe = (window.parent && window.parent !== window);

  const counter  = document.getElementById('counter');
  const caption  = document.getElementById('caption');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const resetBtn = document.getElementById('resetBtn');

  function show(n) {
    n = Math.max(0, Math.min(total, n));
    current = n;

    document.querySelectorAll('.step').forEach(s => {
      const k = parseInt(s.dataset.step);
      s.classList.toggle('revealed', k <= n);
      s.classList.toggle('current',  k === n);
    });

    if (caption) caption.innerHTML = captions[n] || '';
    if (counter) counter.textContent = (n === 0)
      ? `READY · ${total} STEPS`
      : (n === total ? `COMPLETE · ${total} STEPS` : `STEP ${n} / ${total}`);
    // when embedded, never disable buttons at the boundary — they escalate
    if (prevBtn) prevBtn.disabled = (n === 0) && !inIframe;
    if (nextBtn) nextBtn.disabled = (n === total) && !inIframe;

    // re-typeset MathJax for the just-revealed step (it doesn't render while
    // hidden) and scroll it into view smoothly
    if (n > 0 && window.MathJax && window.MathJax.typesetPromise) {
      const el = document.querySelector(`.step[data-step="${n}"]`);
      if (el) {
        window.MathJax.typesetPromise([el]);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  function escalate(direction) {
    if (inIframe) {
      window.parent.postMessage({ type: 'mrc-deck-advance', direction }, '*');
    }
  }

  function next()  { if (current < total) show(current + 1); else escalate('next'); }
  function prev()  { if (current > 0)     show(current - 1); else escalate('prev'); }
  function reset() { show(0); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  if (nextBtn)  nextBtn.addEventListener('click', next);
  if (prevBtn)  prevBtn.addEventListener('click', prev);
  if (resetBtn) resetBtn.addEventListener('click', reset);

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') return;
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
      case 'PageDown':
        e.preventDefault(); next(); break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault(); prev(); break;
      case 'Home':
        e.preventDefault(); reset(); break;
      case 'End':
        e.preventDefault(); show(total); break;
    }
  });

  show(0);
})();
