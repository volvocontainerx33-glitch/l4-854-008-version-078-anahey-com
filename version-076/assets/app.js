(function () {
  var toggle = document.querySelector('.mobile-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var opened = panel.hasAttribute('hidden');
      if (opened) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var show = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(active + 1);
      }, 5200);
    }
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var textInput = scope.querySelector('[data-filter-text]');
    var yearSelect = scope.querySelector('[data-filter-year]');
    var regionSelect = scope.querySelector('[data-filter-region]');
    var grid = scope.nextElementSibling ? scope.nextElementSibling.querySelector('.movie-grid') : null;
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var apply = function () {
      var query = (textInput && textInput.value || '').trim().toLowerCase();
      var year = yearSelect && yearSelect.value || '';
      var region = regionSelect && regionSelect.value || '';
      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.tags,
          card.dataset.year
        ].join(' ').toLowerCase();
        var matched = (!query || haystack.indexOf(query) !== -1) && (!year || card.dataset.year === year) && (!region || card.dataset.region === region);
        card.classList.toggle('hidden-card', !matched);
      });
    };
    [textInput, yearSelect, regionSelect].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
  });
})();
