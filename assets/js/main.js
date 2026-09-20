document.addEventListener("DOMContentLoaded", function () {
  initNavDropdown();
  initAudio();
  initSurvey();
  initGlossary();
});

function initAudio() {
  var buttons = document.querySelectorAll(".audio-btn");
  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var word = btn.getAttribute("data-word") || btn.textContent.trim();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        var msg = new SpeechSynthesisUtterance(word);
        msg.lang = "de-DE";
        msg.rate = 0.85;
        window.speechSynthesis.speak(msg);
      }
    });
  });
}

function initSurvey() {
  var container = document.getElementById("survey-app");
  if (!container) return;

  var state = JSON.parse(localStorage.getItem("dialect_poll_v1")) || {
    q1: {
      title: "1. Какое слово вы выбираете для обозначения булочки?",
      answers: [
        { text: "Brötchen (Север, Центр, норма)", count: 140 },
        { text: "Semmel (Бавария, Австрия)", count: 95 },
        { text: "Schrippe (Берлин)", count: 42 },
        { text: "Weck / Weckle (Баден-Вюртемберг)", count: 35 },
        { text: "Rundstück (Гамбург)", count: 18 }
      ]
    },
    q2: {
      title: "2. Звуковая форма по Второму передвижению согласных:",
      answers: [
        { text: "machen / ich / das (Верхненемецкий сдвиг)", count: 228 },
        { text: "maken / ik / dat (Нижненемецкий архаизм)", count: 62 }
      ]
    },
    q3: {
      title: "3. Роль диалекта в современном немецком пространстве:",
      answers: [
        { text: "Основа региональной идентичности (Heimat)", count: 210 },
        { text: "Пережиток, уступающий литературному стандарту", count: 40 },
        { text: "Затруднение в межрегиональном общении", count: 15 }
      ]
    }
  };

  var userVotes = JSON.parse(localStorage.getItem("dialect_user_votes")) || {};

  function render() {
    container.innerHTML = "";
    Object.keys(state).forEach(function (key) {
      var q = state[key];
      var total = q.answers.reduce(function (sum, item) { return sum + item.count; }, 0);
      var voted = userVotes[key] !== undefined;

      var block = document.createElement("div");
      block.className = "survey-question";

      var h4 = document.createElement("h4");
      h4.textContent = q.title;
      block.appendChild(h4);

      var options = document.createElement("div");
      options.className = "survey-options";

      q.answers.forEach(function (opt, idx) {
        var pct = total > 0 ? Math.round((opt.count / total) * 100) : 0;
        var btn = document.createElement("button");
        btn.className = "survey-btn" + (voted && userVotes[key] === idx ? " voted" : "");
        btn.disabled = voted;

        var spanTitle = document.createElement("span");
        spanTitle.textContent = opt.text;
        btn.appendChild(spanTitle);

        if (voted) {
          var spanPct = document.createElement("strong");
          spanPct.textContent = pct + "% (" + opt.count + ")";
          btn.appendChild(spanPct);
        }

        btn.addEventListener("click", function () {
          opt.count += 1;
          userVotes[key] = idx;
          localStorage.setItem("dialect_poll_v1", JSON.stringify(state));
          localStorage.setItem("dialect_user_votes", JSON.stringify(userVotes));
          render();
        });

        options.appendChild(btn);

        if (voted) {
          var bar = document.createElement("div");
          bar.className = "survey-bar";
          bar.style.width = pct + "%";
          options.appendChild(bar);
        }
      });

      block.appendChild(options);
      container.appendChild(block);
    });
  }

  render();
}

function initGlossary() {
  var input = document.getElementById("glossary-search");
  var list = document.getElementById("glossary-terms");
  if (!input || !list) return;

  input.addEventListener("input", function () {
    var q = input.value.toLowerCase().trim();
    var entries = list.querySelectorAll(".term-entry");
    entries.forEach(function (el) {
      var match = el.textContent.toLowerCase().indexOf(q) !== -1;
      el.style.display = match ? "block" : "none";
    });
  });
}

function initNavDropdown() {
  var dropdowns = document.querySelectorAll(".dropdown");
  dropdowns.forEach(function (dropdown) {
    var trigger = dropdown.querySelector("a");
    var menu = dropdown.querySelector(".dropdown-menu");
    if (!trigger || !menu) return;

    var closeTimer = null;

    function openMenu() {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      dropdown.classList.add("is-open");
    }

    function scheduleClose() {
      if (closeTimer) clearTimeout(closeTimer);
      closeTimer = setTimeout(function () {
        if (!dropdown.classList.contains("is-pinned")) {
          dropdown.classList.remove("is-open");
        }
      }, 700);
    }

    dropdown.addEventListener("mouseenter", openMenu);
    dropdown.addEventListener("mouseleave", scheduleClose);
    menu.addEventListener("mouseenter", openMenu);
    menu.addEventListener("mouseleave", scheduleClose);

    // Click toggles permanent open state so the user can freely move mouse over window
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (dropdown.classList.contains("is-pinned")) {
        dropdown.classList.remove("is-pinned");
        dropdown.classList.remove("is-open");
      } else {
        dropdown.classList.add("is-pinned");
        dropdown.classList.add("is-open");
      }
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".dropdown")) {
      document.querySelectorAll(".dropdown").forEach(function (d) {
        d.classList.remove("is-open");
        d.classList.remove("is-pinned");
      });
    }
  });
}
