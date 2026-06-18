(function () {
  var index = window.MOVIE_INDEX || [];
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var summary = document.querySelector('[data-search-summary]');
  var sortSelect = document.querySelector('[data-search-sort]');
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';

  if (!input || !results || !summary) {
    return;
  }

  input.value = initialQuery;

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function scoreMovie(movie, keyword) {
    var haystack = [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.oneLine,
      (movie.tags || []).join(' ')
    ].join(' ').toLowerCase();

    if (!keyword) {
      return 0;
    }

    var score = 0;
    if (normalize(movie.title).indexOf(keyword) !== -1) {
      score += 8;
    }
    if (normalize(movie.genre).indexOf(keyword) !== -1) {
      score += 5;
    }
    if (normalize(movie.region).indexOf(keyword) !== -1) {
      score += 4;
    }
    if (haystack.indexOf(keyword) !== -1) {
      score += 2;
    }
    return score;
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 5).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card movie-card-list">' +
        '<a class="movie-cover" href="' + escapeHtml(movie.url) + '">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="cover-badge">' + escapeHtml(movie.rating) + '</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
          '<div class="movie-meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
          '<h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
          '<a class="text-link" href="' + escapeHtml(movie.url) + '">查看详情并播放</a>' +
        '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function sortMovies(items, mode) {
    if (mode === 'views') {
      return items.sort(function (a, b) { return b.views - a.views; });
    }
    if (mode === 'year') {
      return items.sort(function (a, b) { return String(b.year).localeCompare(String(a.year), 'zh-CN'); });
    }
    if (mode === 'rating') {
      return items.sort(function (a, b) { return Number(b.rating) - Number(a.rating); });
    }
    return items.sort(function (a, b) { return b._score - a._score || b.views - a.views; });
  }

  function render() {
    var keyword = normalize(input.value.trim());
    var mode = sortSelect ? sortSelect.value : 'relevance';

    if (!keyword) {
      summary.textContent = '请输入关键词开始搜索。';
      results.innerHTML = '';
      return;
    }

    var matched = index.map(function (movie) {
      var copy = Object.assign({}, movie);
      copy._score = scoreMovie(movie, keyword);
      return copy;
    }).filter(function (movie) {
      return movie._score > 0;
    });

    sortMovies(matched, mode);
    summary.textContent = '搜索“' + input.value.trim() + '”找到 ' + matched.length + ' 个结果。';
    results.innerHTML = matched.slice(0, 120).map(card).join('');

    if (matched.length > 120) {
      results.insertAdjacentHTML('beforeend', '<p class="search-summary">结果较多，已显示前 120 个，请增加关键词缩小范围。</p>');
    }

    if (matched.length === 0) {
      results.innerHTML = '<div class="search-summary">未找到相关影片，请尝试更换关键词。</div>';
    }
  }

  input.addEventListener('input', render);

  if (sortSelect) {
    sortSelect.addEventListener('change', render);
  }

  render();
})();
