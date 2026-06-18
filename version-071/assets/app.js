(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var button = $("[data-menu-toggle]");
    var panel = $("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = $all(".hero-slide");
    var dots = $all(".hero-dots button");
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(index);
        play();
      });
    });

    show(0);
    play();
  }

  function initCardFilter() {
    var input = $("[data-card-filter]");
    var cards = $all("[data-card='movie']");
    if (!input || !cards.length) {
      return;
    }
    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-text") || "").toLowerCase();
        card.hidden = value && text.indexOf(value) === -1;
      });
    });
  }

  function initPlayer() {
    var shell = $("[data-player]");
    if (!shell) {
      return;
    }
    var video = $("video", shell);
    var cover = $(".player-cover", shell);
    var button = $(".player-start", shell);
    var streamUrl = shell.getAttribute("data-video");
    var ready = false;
    var hlsInstance = null;

    function runPlay() {
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {});
      }
    }

    function loadVideo() {
      if (ready || !streamUrl) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        runPlay();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          runPlay();
        });
        runPlay();
        return;
      }
      video.src = streamUrl;
      runPlay();
    }

    function start() {
      shell.classList.add("is-playing");
      loadVideo();
      runPlay();
    }

    if (button) {
      button.addEventListener("click", start);
    }
    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  }

  function buildSearchCard(item) {
    return [
      '<article class="movie-card" data-card="movie" data-text="', escapeHtml([item.title, item.region, item.year, item.genre].join(" ")), '">',
      '<a class="poster-link" href="', escapeHtml(item.url), '" aria-label="', escapeHtml(item.title), '">',
      '<img src="', escapeHtml(item.cover), '" alt="', escapeHtml(item.title), '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="play-mark">▶</span>',
      '<span class="type-pill">', escapeHtml(item.type), '</span>',
      '<span class="duration-pill">', escapeHtml(item.year), '</span>',
      '</a>',
      '<div class="card-body">',
      '<h3><a href="', escapeHtml(item.url), '">', escapeHtml(item.title), '</a></h3>',
      '<p>', escapeHtml(item.desc), '</p>',
      '<div class="card-meta">',
      '<span>', escapeHtml(item.region), '</span>',
      '<span>', escapeHtml(item.genre), '</span>',
      '</div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function initSearchPage() {
    var form = $("[data-search-form]");
    var input = $("[data-search-input]");
    var results = $("[data-search-results]");
    var empty = $("[data-empty-note]");
    if (!form || !input || !results || !window.SEARCH_ITEMS) {
      return;
    }

    function paramsValue() {
      var params = new URLSearchParams(window.location.search);
      return params.get("q") || "";
    }

    function render(value) {
      var key = value.trim().toLowerCase();
      var items = window.SEARCH_ITEMS;
      if (key) {
        items = items.filter(function (item) {
          return [item.title, item.region, item.type, item.year, item.genre, item.tags]
            .join(" ")
            .toLowerCase()
            .indexOf(key) !== -1;
        });
      }
      items = items.slice(0, 96);
      results.innerHTML = items.map(buildSearchCard).join("");
      if (empty) {
        empty.style.display = items.length ? "none" : "block";
      }
    }

    var initial = paramsValue();
    input.value = initial;
    render(initial);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var q = input.value.trim();
      var url = q ? "./search.html?q=" + encodeURIComponent(q) : "./search.html";
      history.pushState(null, "", url);
      render(q);
    });

    input.addEventListener("input", function () {
      render(input.value);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initCardFilter();
    initPlayer();
    initSearchPage();
  });
})();
