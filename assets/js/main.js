/**
 * Коренные народы Америки и открытие Нового Света
 * Контроллер презентации • Академический просмотр, увеличение карт (Lightbox), плавная навигация
 */

(function () {
  'use strict';

  var slides = Array.from(document.querySelectorAll('.slide'));
  var totalSlides = slides.length;
  var currentSlideIndex = 0;

  var currentSlideNumEl = document.getElementById('current-slide-num');
  var actIndicatorEl = document.getElementById('act-indicator');

  // Навигационные кнопки (футер)
  var btnPrev = document.getElementById('btn-prev');
  var btnNext = document.getElementById('btn-next');

  // Быстрые боковые стрелки на полотне
  var stageArrowPrev = document.getElementById('stage-arrow-prev');
  var stageArrowNext = document.getElementById('stage-arrow-next');

  // Лента кнопок-номеров 1..10
  var slidePillsBar = document.getElementById('slide-pills-bar');

  // Полноэкранный режим
  var btnFullscreen = document.getElementById('btn-fullscreen');
  var fsText = document.getElementById('fs-text');

  // Шторка оглавления
  var btnThumbnails = document.getElementById('btn-thumbnails');
  var drawerBackdrop = document.getElementById('drawer-backdrop');
  var drawerClose = document.getElementById('btn-drawer-close');
  var drawerList = document.getElementById('drawer-list');

  // Модуль Колумба
  var btnColumbusToggle = document.getElementById('btn-columbus-toggle');
  var columbusAvatar = document.getElementById('columbus-avatar');

  // Модальное окно детального просмотра карт (Lightbox)
  var imageModal = document.getElementById('image-modal');
  var modalImg = document.getElementById('modal-img');
  var modalCaption = document.getElementById('modal-caption');
  var modalCloseBtn = document.getElementById('modal-close-btn');

  function init() {
    buildSlidePills();
    buildDrawerList();
    bindEvents();
    bindZoomableImages();

    var initialSlide = parseHash();
    goToSlide(initialSlide, false);
  }

  function parseHash() {
    var match = window.location.hash.match(/slide-(\d+)/);
    if (match) {
      var num = parseInt(match[1], 10);
      if (num >= 1 && num <= totalSlides) {
        return num - 1;
      }
    }
    return 0;
  }

  // Генерация кнопок-номеров
  function buildSlidePills() {
    if (!slidePillsBar) return;
    slidePillsBar.innerHTML = '';

    for (var i = 0; i < totalSlides; i++) {
      var pill = document.createElement('button');
      pill.className = 'slide-pill';
      pill.textContent = (i + 1);
      pill.setAttribute('data-index', i);
      pill.title = 'Слайд ' + (i + 1) + ': ' + getSlideTitle(i);

      pill.addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-index'), 10);
        goToSlide(idx);
      });

      slidePillsBar.appendChild(pill);
    }
  }

  // Генерация оглавления в выдвижной шторке
  function buildDrawerList() {
    if (!drawerList) return;
    drawerList.innerHTML = '';

    slides.forEach(function (slide, idx) {
      var title = getSlideTitle(idx);
      var act = slide.getAttribute('data-act') || ('Слайд ' + (idx + 1));

      var item = document.createElement('div');
      item.className = 'drawer-item';
      item.setAttribute('data-index', idx);

      item.innerHTML =
        '<div class="drawer-item-num">' + (idx + 1) + '</div>' +
        '<div class="drawer-item-text">' +
          '<strong>' + title + '</strong>' +
          '<span>' + act + '</span>' +
        '</div>';

      item.addEventListener('click', function () {
        goToSlide(idx);
        closeDrawer();
      });

      drawerList.appendChild(item);
    });
  }

  function getSlideTitle(idx) {
    var slide = slides[idx];
    if (!slide) return '';
    var titleEl = slide.querySelector('.slide-title');
    return titleEl ? titleEl.textContent.trim() : 'Слайд ' + (idx + 1);
  }

  // Переход к слайду
  function goToSlide(targetIndex, updateHash) {
    if (updateHash === undefined) updateHash = true;
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= totalSlides) targetIndex = totalSlides - 1;

    currentSlideIndex = targetIndex;

    slides.forEach(function (slide, idx) {
      if (idx === currentSlideIndex) {
        slide.classList.add('active');
        slide.scrollTop = 0; // Сбрасываем скролл на начало слайда
      } else {
        slide.classList.remove('active');
      }
    });

    if (currentSlideNumEl) {
      currentSlideNumEl.textContent = currentSlideIndex + 1;
    }

    var activeSlide = slides[currentSlideIndex];
    if (activeSlide && actIndicatorEl) {
      var actText = activeSlide.getAttribute('data-act');
      if (actText) {
        actIndicatorEl.textContent = actText;
      }
    }

    // Состояние стрелок
    var isFirst = (currentSlideIndex === 0);
    var isLast = (currentSlideIndex === totalSlides - 1);

    if (btnPrev) btnPrev.disabled = isFirst;
    if (btnNext) btnNext.disabled = isLast;
    if (stageArrowPrev) stageArrowPrev.disabled = isFirst;
    if (stageArrowNext) stageArrowNext.disabled = isLast;

    // Обновление полосы номеров
    var pills = slidePillsBar ? slidePillsBar.querySelectorAll('.slide-pill') : [];
    pills.forEach(function (pill, idx) {
      pill.classList.remove('active', 'passed');
      if (idx < currentSlideIndex) {
        pill.classList.add('passed');
      } else if (idx === currentSlideIndex) {
        pill.classList.add('active');
      }
    });

    // Обновление активного элемента шторки
    var drawerItems = drawerList ? drawerList.querySelectorAll('.drawer-item') : [];
    drawerItems.forEach(function (item, idx) {
      if (idx === currentSlideIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Обработка речи Колумба на слайде 5
    if (currentSlideIndex === 4) {
      if (columbusAvatar && !columbusAvatar.classList.contains('is-talking')) {
        columbusAvatar.classList.add('is-talking');
        if (btnColumbusToggle) btnColumbusToggle.textContent = 'Пауза речи';
      }
    }

    if (updateHash) {
      history.replaceState(null, '', '#slide-' + (currentSlideIndex + 1));
    }
  }

  function nextSlide() {
    if (currentSlideIndex < totalSlides - 1) {
      goToSlide(currentSlideIndex + 1);
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      goToSlide(currentSlideIndex - 1);
    }
  }

  // Управление модальным окном карт (Lightbox)
  function openImageModal(src, caption) {
    if (!imageModal || !modalImg) return;
    modalImg.src = src;
    if (modalCaption) {
      modalCaption.textContent = caption || '';
    }
    imageModal.classList.add('open');
  }

  function closeImageModal() {
    if (imageModal) {
      imageModal.classList.remove('open');
      if (modalImg) modalImg.src = '';
    }
  }

  function bindZoomableImages() {
    var zoomables = document.querySelectorAll('[data-zoom-src]');
    zoomables.forEach(function (el) {
      el.addEventListener('click', function (e) {
        // Если клик был не по кнопке внутри карточки
        if (e.target.tagName.toLowerCase() === 'button') return;
        var src = el.getAttribute('data-zoom-src');
        var caption = el.getAttribute('data-zoom-caption');
        if (src) {
          openImageModal(src, caption);
        }
      });
    });

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeImageModal);
    }

    if (imageModal) {
      imageModal.addEventListener('click', function (e) {
        if (e.target === imageModal) {
          closeImageModal();
        }
      });
    }
  }

  // Шторка оглавления
  function openDrawer() {
    if (drawerBackdrop) drawerBackdrop.classList.add('open');
  }

  function closeDrawer() {
    if (drawerBackdrop) drawerBackdrop.classList.remove('open');
  }

  function toggleDrawer() {
    if (drawerBackdrop && drawerBackdrop.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  // Полноэкранный режим
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function (err) {
        console.warn('Полноэкранный режим недоступен:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  function updateFullscreenUI() {
    var isFs = !!document.fullscreenElement;
    if (fsText) fsText.textContent = isFs ? 'Окно' : 'Экран';
  }

  // Управление речью Колумба
  function toggleColumbusSpeech() {
    if (!columbusAvatar) return;
    var isTalking = columbusAvatar.classList.toggle('is-talking');
    if (btnColumbusToggle) {
      btnColumbusToggle.textContent = isTalking ? 'Пауза речи' : 'Воспроизведение речи';
    }
  }

  // Обработчики событий
  function bindEvents() {
    if (btnPrev) btnPrev.addEventListener('click', prevSlide);
    if (btnNext) btnNext.addEventListener('click', nextSlide);
    if (stageArrowPrev) stageArrowPrev.addEventListener('click', prevSlide);
    if (stageArrowNext) stageArrowNext.addEventListener('click', nextSlide);

    if (btnFullscreen) btnFullscreen.addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', updateFullscreenUI);

    if (btnThumbnails) btnThumbnails.addEventListener('click', toggleDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (drawerBackdrop) {
      drawerBackdrop.addEventListener('click', function (e) {
        if (e.target === drawerBackdrop) closeDrawer();
      });
    }

    if (btnColumbusToggle) {
      btnColumbusToggle.addEventListener('click', toggleColumbusSpeech);
    }

    // Клавиатура
    document.addEventListener('keydown', function (e) {
      var tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      // Если открыто модальное окно просмотра карты, Esc закрывает его
      if (e.key === 'Escape') {
        if (imageModal && imageModal.classList.contains('open')) {
          closeImageModal();
          return;
        }
        closeDrawer();
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ': // Пробел
          e.preventDefault();
          nextSlide();
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          prevSlide();
          break;

        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;

        case 'End':
          e.preventDefault();
          goToSlide(totalSlides - 1);
          break;

        case 'f':
        case 'F':
        case 'а':
        case 'А':
          toggleFullscreen();
          break;

        case 'm':
        case 'M':
        case 'ь':
        case 'Ь':
          toggleDrawer();
          break;
      }
    });

    // Свайп
    var touchStartX = 0;
    var touchStartY = 0;

    document.addEventListener('touchstart', function (e) {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      var touchEndX = e.changedTouches[0].screenX;
      var touchEndY = e.changedTouches[0].screenY;
      var diffX = touchEndX - touchStartX;
      var diffY = touchEndY - touchStartY;

      if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }, { passive: true });

    window.addEventListener('hashchange', function () {
      var slideNum = parseHash();
      if (slideNum !== currentSlideIndex) {
        goToSlide(slideNum, false);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
