/**
 * Коренные народы Америки и открытие Нового Света
 * Контроллер интерактивной веб-презентации
 */

(function () {
  'use strict';

  // DOM элементы
  var slides = Array.from(document.querySelectorAll('.slide'));
  var totalSlides = slides.length;
  var currentSlideIndex = 0;

  var currentSlideNumEl = document.getElementById('current-slide-num');
  var actIndicatorEl = document.getElementById('act-indicator');
  var btnPrev = document.getElementById('btn-prev');
  var btnNext = document.getElementById('btn-next');
  var progressContainer = document.getElementById('progress-dots');

  var btnFullscreen = document.getElementById('btn-fullscreen');
  var fsIcon = document.getElementById('fs-icon');
  var fsText = document.getElementById('fs-text');

  var btnThumbnails = document.getElementById('btn-thumbnails');
  var drawerBackdrop = document.getElementById('drawer-backdrop');
  var drawerClose = document.getElementById('btn-drawer-close');
  var drawerList = document.getElementById('drawer-list');

  var btnColumbusToggle = document.getElementById('btn-columbus-toggle');
  var columbusAvatar = document.getElementById('columbus-avatar');

  // Инициализация
  function init() {
    buildProgressDots();
    buildDrawerList();
    bindEvents();

    // Проверяем hash в URL (#slide-3 -> слайд 3)
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

  // Создание сегментов прогресса
  function buildProgressDots() {
    if (!progressContainer) return;
    progressContainer.innerHTML = '';
    for (var i = 0; i < totalSlides; i++) {
      var dot = document.createElement('div');
      dot.className = 'progress-dot';
      dot.setAttribute('data-index', i);
      dot.title = 'Слайд ' + (i + 1) + ': ' + getSlideTitle(i);
      dot.addEventListener('click', function (e) {
        var idx = parseInt(this.getAttribute('data-index'), 10);
        goToSlide(idx);
      });
      progressContainer.appendChild(dot);
    }
  }

  // Создание списка миниатюр в шторке навигатора
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

  // Переход на слайд
  function goToSlide(targetIndex, updateHash) {
    if (updateHash === undefined) updateHash = true;
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= totalSlides) targetIndex = totalSlides - 1;

    currentSlideIndex = targetIndex;

    // Переключение классов слайдов
    slides.forEach(function (slide, idx) {
      if (idx === currentSlideIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Обновление HUD
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

    // Состояние кнопок Назад / Вперед
    if (btnPrev) btnPrev.disabled = (currentSlideIndex === 0);
    if (btnNext) btnNext.disabled = (currentSlideIndex === totalSlides - 1);

    // Обновление прогресс-бара
    var dots = progressContainer ? progressContainer.querySelectorAll('.progress-dot') : [];
    dots.forEach(function (dot, idx) {
      dot.classList.remove('active', 'passed');
      if (idx < currentSlideIndex) {
        dot.classList.add('passed');
      } else if (idx === currentSlideIndex) {
        dot.classList.add('active');
      }
    });

    // Обновление активного элемента в шторке
    var drawerItems = drawerList ? drawerList.querySelectorAll('.drawer-item') : [];
    drawerItems.forEach(function (item, idx) {
      if (idx === currentSlideIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Специфика слайда 5 (Колумб)
    if (currentSlideIndex === 4) { // Слайд 5 (0-indexed 4)
      if (columbusAvatar && !columbusAvatar.classList.contains('is-talking')) {
        columbusAvatar.classList.add('is-talking');
        if (btnColumbusToggle) btnColumbusToggle.textContent = 'Анимация речи: Вкл';
      }
    }

    // Хеш в URL для удобства ссылок и возврата
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

  // Управление шторкой навигации
  function openDrawer() {
    if (drawerBackdrop) {
      drawerBackdrop.classList.add('open');
    }
  }

  function closeDrawer() {
    if (drawerBackdrop) {
      drawerBackdrop.classList.remove('open');
    }
  }

  function toggleDrawer() {
    if (drawerBackdrop && drawerBackdrop.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  // Управление полноэкранным режимом
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function (err) {
        console.warn('Не удалось войти в полноэкранный режим:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  function updateFullscreenUI() {
    var isFs = !!document.fullscreenElement;
    if (fsIcon) fsIcon.textContent = isFs ? '🗗' : '⛶';
    if (fsText) fsText.textContent = isFs ? 'Окно' : 'Экран';
  }

  // Управление анимацией говорящего Колумба
  function toggleColumbusSpeech() {
    if (!columbusAvatar) return;
    var isTalking = columbusAvatar.classList.toggle('is-talking');
    if (btnColumbusToggle) {
      btnColumbusToggle.textContent = isTalking ? 'Анимация речи: Вкл' : 'Анимация речи: Пауза';
    }
  }

  // Привязка событий
  function bindEvents() {
    if (btnPrev) btnPrev.addEventListener('click', prevSlide);
    if (btnNext) btnNext.addEventListener('click', nextSlide);

    if (btnFullscreen) btnFullscreen.addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', updateFullscreenUI);

    if (btnThumbnails) btnThumbnails.addEventListener('click', toggleDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);

    if (drawerBackdrop) {
      drawerBackdrop.addEventListener('click', function (e) {
        if (e.target === drawerBackdrop) {
          closeDrawer();
        }
      });
    }

    if (btnColumbusToggle) {
      btnColumbusToggle.addEventListener('click', toggleColumbusSpeech);
    }

    // Клавиатурные шорткаты
    document.addEventListener('keydown', function (e) {
      // Игнорируем ввод, если фокус в инпуте или текстарее
      var tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ': // Space
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
        case 'А': // Русская раскладка для клавиши F
          toggleFullscreen();
          break;

        case 'm':
        case 'M':
        case 'ь':
        case 'Ь':
          toggleDrawer();
          break;

        case 'Escape':
          closeDrawer();
          break;
      }
    });

    // Тач / Свайп на мобильных устройствах
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

      // Горизонтальный свайп с порогом 50px
      if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }, { passive: true });

    // Реакция на изменение hash в URL
    window.addEventListener('hashchange', function () {
      var slideNum = parseHash();
      if (slideNum !== currentSlideIndex) {
        goToSlide(slideNum, false);
      }
    });
  }

  // Запуск при загрузке документа
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
