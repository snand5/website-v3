(function () {
  function icon(paths) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  }

  const ICONS = {
    close:    icon('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
    download: icon('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>'),
    prev:     icon('<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>'),
    next:     icon('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'),
  };

  function makeBtn(label, iconHtml) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'lightbox-btn';
    el.setAttribute('aria-label', label);
    el.innerHTML = iconHtml;
    return el;
  }

  const images = Array.from(document.querySelectorAll('.article-content img')).filter(function (img) {
    return !img.closest('a');
  });
  if (!images.length) return;

  let current = 0;
  const multi = images.length > 1;
  let triggerEl = null;

  const overlay    = document.createElement('div');
  const top        = document.createElement('div');
  const closeBtn   = makeBtn('Close image viewer', ICONS.close);
  const dlBtn      = makeBtn('Download image', ICONS.download);
  const prevBtn    = makeBtn('Previous image', ICONS.prev);
  const nextBtn    = makeBtn('Next image', ICONS.next);
  const lightboxImg = document.createElement('img');

  overlay.className = 'lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Image viewer');
  overlay.hidden = true;

  top.className = 'lightbox-top';
  top.appendChild(closeBtn);
  top.appendChild(dlBtn);

  prevBtn.className += ' lightbox-prev';
  nextBtn.className += ' lightbox-next';

  lightboxImg.className = 'lightbox-img';
  lightboxImg.alt = '';

  overlay.appendChild(top);
  if (multi) { overlay.appendChild(prevBtn); overlay.appendChild(nextBtn); }
  overlay.appendChild(lightboxImg);
  document.body.appendChild(overlay);

  function show(index) {
    current = index;
    lightboxImg.src = images[index].src;
    lightboxImg.alt = images[index].alt || '';
    if (multi) {
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === images.length - 1;
    }
  }

  function open(index) {
    triggerEl = document.activeElement;
    show(index);
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    lightboxImg.src = '';
    if (triggerEl) { triggerEl.focus(); triggerEl = null; }
  }

  images.forEach(function (img, i) {
    img.style.cursor = 'zoom-in';
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.addEventListener('click', function () { open(i); });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  closeBtn.addEventListener('click', close);

  dlBtn.addEventListener('click', function () {
    const a = document.createElement('a');
    a.href = lightboxImg.src;
    a.download = lightboxImg.alt || 'image';
    a.click();
  });

  if (multi) {
    prevBtn.addEventListener('click', function () { if (current > 0) show(current - 1); });
    nextBtn.addEventListener('click', function () { if (current < images.length - 1) show(current + 1); });
  }

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  // Focus trap: keep keyboard focus within the open dialog
  overlay.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    const allBtns = multi ? [closeBtn, dlBtn, prevBtn, nextBtn] : [closeBtn, dlBtn];
    const focusable = allBtns.filter(function (b) { return !b.disabled; });
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (overlay.hidden) return;
    if (e.key === 'Escape') close();
    if (multi && e.key === 'ArrowLeft'  && current > 0) show(current - 1);
    if (multi && e.key === 'ArrowRight' && current < images.length - 1) show(current + 1);
  });
})();
