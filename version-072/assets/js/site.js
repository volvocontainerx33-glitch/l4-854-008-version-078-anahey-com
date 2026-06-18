function escapeHTML(value) {
  return String(value || '').replace(/[&<>\"']/g, function (character) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[character];
  });
}

document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  var filterBar = document.querySelector('[data-filter-bar]');
  var filterScope = document.querySelector('[data-filter-scope]');

  if (filterBar && filterScope) {
    var buttons = Array.prototype.slice.call(filterBar.querySelectorAll('[data-filter-value]'));
    var cards = Array.prototype.slice.call(filterScope.querySelectorAll('.movie-card'));

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-filter-value');
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-year') || '',
            card.textContent || ''
          ].join(' ');
          var match = value === 'all' || haystack.indexOf(value) !== -1;
          card.classList.toggle('is-filter-hidden', !match);
        });
      });
    });
  }

  var searchResults = document.querySelector('[data-search-results]');
  var searchSummary = document.querySelector('[data-search-summary]');
  var searchInput = document.querySelector('[data-search-page-input]');

  if (searchResults && searchSummary && window.SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();

    if (searchInput) {
      searchInput.value = q;
    }

    var normalized = q.toLowerCase();
    var source = window.SEARCH_INDEX.slice(0);
    var results = normalized ? source.filter(function (item) {
      return item.text.toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 120) : source.slice(0, 60);

    searchSummary.textContent = normalized ? '匹配内容' : '热门内容';
    searchResults.innerHTML = results.map(function (item) {
      var title = escapeHTML(item.title);
      var meta = escapeHTML(item.meta);
      var score = escapeHTML(item.score);
      var desc = escapeHTML(item.desc);
      var href = escapeHTML(item.href);
      var cover = escapeHTML(item.cover);
      var tags = item.tags.map(function (tag) {
        return '<span>' + escapeHTML(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card compact">',
        '<a class="poster" href="' + href + '" style="--cover: url(\'' + cover + '\');" aria-label="' + title + '">',
        '<span class="score">' + score + '</span>',
        '<span class="play-badge">播放</span>',
        '</a>',
        '<div class="card-body">',
        '<div class="card-meta">' + meta + '</div>',
        '<h3><a href="' + href + '">' + title + '</a></h3>',
        '<p>' + desc + '</p>',
        '<div class="tag-row">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }).join('');
  }
});
