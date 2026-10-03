/**
 * Коренные народы Америки и Новый Свет — управление презентацией
 * Навигация, оглавление, полный экран, просмотр иллюстраций с увеличением
 */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var total = slides.length;
  var current = 0;

  var els = {
    num: $('current-slide-num'),
    act: $('act-indicator'),
    prev: $('btn-prev'),
    next: $('btn-next'),
    arrowPrev: $('stage-arrow-prev'),
    arrowNext: $('stage-arrow-next'),
    pills: $('slide-pills-bar'),
    fsBtn: $('btn-fullscreen'),
    fsText: $('fs-text'),
    tocBtn: $('btn-thumbnails'),
    drawer: $('drawer-backdrop'),
    drawerClose: $('btn-drawer-close'),
    drawerList: $('drawer-list'),
    talkBtn: $('btn-columbus-toggle'),
    avatar: $('columbus-avatar'),
    modal: $('image-modal'),
    canvas: $('modal-canvas'),
    modalImg: $('modal-img'),
    modalCaption: $('modal-caption')
  };

  function titleOf(i) {
    var t = slides[i].querySelector('.slide-title');
    return t ? t.textContent.trim() : 'Слайд ' + (i + 1);
  }
  function actOf(i) { return slides[i].getAttribute('data-act') || ''; }

  /* ---------- Номера слайдов и оглавление ---------- */
  function buildPills() {
    for (var i = 0; i < total; i++) {
      var b = document.createElement('button');
      b.className = 'slide-pill';
      b.textContent = i + 1;
      b.title = (i + 1) + '. ' + titleOf(i);
      if (i > 0 && actOf(i) !== actOf(i - 1)) b.classList.add('act-start');
      b.addEventListener('click', go.bind(null, i));
      els.pills.appendChild(b);
    }
  }

  function buildDrawer() {
    var lastAct = null;
    slides.forEach(function (_, i) {
      if (actOf(i) !== lastAct) {
        lastAct = actOf(i);
        var h = document.createElement('div');
        h.className = 'drawer-act';
        h.textContent = lastAct;
        els.drawerList.appendChild(h);
      }
      var item = document.createElement('div');
      item.className = 'drawer-item';
      item.innerHTML = '<span class="drawer-item-num">' + (i + 1) + '</span><span class="drawer-item-text"></span>';
      item.querySelector('.drawer-item-text').textContent = titleOf(i);
      item.addEventListener('click', function () { go(i); closeDrawer(); });
      els.drawerList.appendChild(item);
    });
  }

  /* ---------- Переход ---------- */
  function go(i, keepHash) {
    i = Math.max(0, Math.min(total - 1, i));
    current = i;

    slides.forEach(function (s, k) {
      var on = k === i;
      s.classList.toggle('active', on);
      if (on) s.scrollTop = 0;
    });

    els.num.textContent = i + 1;
    els.act.textContent = actOf(i);

    var first = i === 0, last = i === total - 1;
    els.prev.disabled = els.arrowPrev.disabled = first;
    els.next.disabled = els.arrowNext.disabled = last;

    Array.prototype.forEach.call(els.pills.children, function (p, k) {
      p.classList.toggle('active', k === i);
      p.classList.toggle('passed', k < i);
    });
    Array.prototype.forEach.call(els.drawerList.querySelectorAll('.drawer-item'), function (d, k) {
      d.classList.toggle('active', k === i);
    });

    // Колумб «говорит» каждый раз, когда открывается его слайд
    if (els.avatar && slides[i].contains(els.avatar)) setTalking(true);

    if (!keepHash) history.replaceState(null, '', '#slide-' + (i + 1));
  }

  function next() { if (current < total - 1) go(current + 1); }
  function prev() { if (current > 0) go(current - 1); }

  function hashIndex() {
    var m = location.hash.match(/slide-(\d+)/);
    var n = m ? parseInt(m[1], 10) : 1;
    return (n >= 1 && n <= total) ? n - 1 : 0;
  }

  /* ---------- Оглавление ---------- */
  function openDrawer() { els.drawer.classList.add('open'); }
  function closeDrawer() { els.drawer.classList.remove('open'); }
  function toggleDrawer() { els.drawer.classList.toggle('open'); }

  /* ---------- Полный экран ---------- */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen && document.exitFullscreen();
    }
  }
  function onFullscreen() {
    els.fsText.textContent = document.fullscreenElement ? 'Выйти' : 'На весь экран';
  }

  /* ---------- Колумб ---------- */
  function setTalking(on) {
    if (!els.avatar) return;
    els.avatar.classList.toggle('is-talking', on);
    if (els.talkBtn) els.talkBtn.textContent = on ? 'Остановить' : 'Говорить';
  }

  /* ---------- Просмотр иллюстраций: увеличение и перетаскивание ---------- */
  var view = { scale: 1, x: 0, y: 0 };
  var drag = null;

  function applyView() {
    els.modalImg.style.transform =
      'translate(calc(-50% + ' + view.x + 'px), calc(-50% + ' + view.y + 'px)) scale(' + view.scale + ')';
  }

  function resetView() { view.scale = 1; view.x = 0; view.y = 0; applyView(); }

  function zoomAt(factor, cx, cy) {
    var r = els.canvas.getBoundingClientRect();
    // точка под курсором относительно центра холста
    var px = (cx === undefined ? r.width / 2 : cx - r.left) - r.width / 2;
    var py = (cy === undefined ? r.height / 2 : cy - r.top) - r.height / 2;
    var ns = Math.max(1, Math.min(8, view.scale * factor));
    var k = ns / view.scale;
    view.x = px - (px - view.x) * k;
    view.y = py - (py - view.y) * k;
    view.scale = ns;
    if (ns === 1) { view.x = 0; view.y = 0; }
    applyView();
  }

  function openModal(src, caption) {
    els.modalImg.src = src;
    els.modalImg.alt = caption || '';
    els.modalCaption.textContent = caption || '';
    resetView();
    els.modal.classList.add('open');
  }
  function closeModal() {
    els.modal.classList.remove('open');
    els.modalImg.src = '';
  }
  function modalOpen() { return els.modal.classList.contains('open'); }

  function togglePicture() {
    if (modalOpen()) {
      closeModal();
      return;
    }
    var s = slides[current];
    if (!s) return;
    if (s.contains(els.avatar)) {
      setTalking(!els.avatar.classList.contains('is-talking'));
      return;
    }
    var z = s.querySelector('[data-zoom-src]');
    if (z) {
      openModal(z.getAttribute('data-zoom-src'), z.getAttribute('data-zoom-caption'));
    }
  }

  function bindModal() {
    document.querySelectorAll('[data-zoom-src]').forEach(function (el) {
      el.addEventListener('click', function () {
        openModal(el.getAttribute('data-zoom-src'), el.getAttribute('data-zoom-caption'));
      });
    });

    $('modal-close-btn').addEventListener('click', closeModal);
    $('zoom-in').addEventListener('click', function () { zoomAt(1.4); });
    $('zoom-out').addEventListener('click', function () { zoomAt(1 / 1.4); });
    $('zoom-reset').addEventListener('click', resetView);

    els.canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY);
    }, { passive: false });

    els.canvas.addEventListener('dblclick', function (e) {
      if (view.scale > 1.01) resetView(); else zoomAt(2.5, e.clientX, e.clientY);
    });

    els.canvas.addEventListener('pointerdown', function (e) {
      drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false };
      els.canvas.setPointerCapture(e.pointerId);
      els.canvas.classList.add('dragging');
    });
    els.canvas.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      view.x = drag.vx + dx;
      view.y = drag.vy + dy;
      applyView();
    });
    function endDrag(e) {
      if (!drag) return;
      // клик по пустому полю (без перетаскивания и без увеличения) — закрыть
      if (!drag.moved && e.target === els.canvas && view.scale === 1) closeModal();
      drag = null;
      els.canvas.classList.remove('dragging');
    }
    els.canvas.addEventListener('pointerup', endDrag);
    els.canvas.addEventListener('pointercancel', endDrag);
  }

  /* ---------- События ---------- */
  function bind() {
    els.prev.addEventListener('click', prev);
    els.next.addEventListener('click', next);
    els.arrowPrev.addEventListener('click', prev);
    els.arrowNext.addEventListener('click', next);

    els.fsBtn.addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', onFullscreen);

    els.tocBtn.addEventListener('click', toggleDrawer);
    els.drawerClose.addEventListener('click', closeDrawer);
    els.drawer.addEventListener('click', function (e) { if (e.target === els.drawer) closeDrawer(); });

    if (els.talkBtn) els.talkBtn.addEventListener('click', function () {
      setTalking(!els.avatar.classList.contains('is-talking'));
    });

    document.addEventListener('keydown', function (e) {
      if (/input|textarea/i.test(e.target.tagName)) return;
      var k = e.key;
      var isShiftNine = e.shiftKey && (e.code === 'Digit9' || e.code === 'Numpad9' || k === '9' || k === '(');

      if (modalOpen()) {
        if (k === 'Escape' || isShiftNine) {
          e.preventDefault();
          closeModal();
        }
        else if (k === '+' || k === '=') zoomAt(1.4);
        else if (k === '-' || k === '_') zoomAt(1 / 1.4);
        else if (k === '0') resetView();
        return; // в режиме просмотра слайды не листаются
      }

      if (isShiftNine) {
        e.preventDefault();
        togglePicture();
        return;
      }

      if (k === 'Escape') { closeDrawer(); return; }

      // ↑ ↓ оставлены для прокрутки слайда, если он не помещается
      if (k === 'ArrowRight' || k === 'PageDown' || k === ' ') { e.preventDefault(); next(); }
      else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); prev(); }
      else if (k === 'Home') { e.preventDefault(); go(0); }
      else if (k === 'End') { e.preventDefault(); go(total - 1); }
      else if (/^[fFаА]$/.test(k)) toggleFullscreen();
      else if (/^[mMьЬ]$/.test(k)) toggleDrawer();
    });

    // Свайпы на телефоне/планшете
    var sx = 0, sy = 0;
    document.addEventListener('touchstart', function (e) {
      sx = e.changedTouches[0].screenX; sy = e.changedTouches[0].screenY;
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (modalOpen()) return;
      var dx = e.changedTouches[0].screenX - sx, dy = e.changedTouches[0].screenY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { dx < 0 ? next() : prev(); }
    }, { passive: true });

    window.addEventListener('hashchange', function () {
      var i = hashIndex();
      if (i !== current) go(i, true);
    });
  }

  function init() {
    buildPills();
    buildDrawer();
    bindModal();
    bind();
    go(hashIndex(), true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
