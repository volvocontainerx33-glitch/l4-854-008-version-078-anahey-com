(function () {
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  if (!input || !results || typeof MOVIE_INDEX === 'undefined') {
    return;
  }
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';
  input.value = initial;
  var data = typeof MOVIE_INDEX !== 'undefined' ? MOVIE_INDEX : [];
  var escapeText = function (value) {
    return String(value || '').replace(/[&<>"]/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch];
    });
  };
  var render = function (query) {
    var q = query.trim().toLowerCase();
    var list = data.filter(function (item) {
      var text = [item.title, item.region, item.genre, item.type, (item.tags || []).join(' '), item.year].join(' ').toLowerCase();
      return !q || text.indexOf(q) !== -1;
    }).slice(0, 120);
    results.innerHTML = list.map(function (item) {
      var tagText = (item.tags && item.tags.length ? item.tags.slice(0, 3).join(' / ') : item.genre);
      return '<article class="movie-card">' +
        '<a class="poster-wrap" href="' + escapeText(item.file) + '" aria-label="' + escapeText(item.title) + ' 在线观看">' +
        '<img src="' + escapeText(item.image) + '" alt="' + escapeText(item.title) + '" loading="lazy">' +
        '<span class="score-badge">' + escapeText(item.rating) + '</span><span class="play-badge">▶</span></a>' +
        '<div class="movie-card-body"><h3><a href="' + escapeText(item.file) + '">' + escapeText(item.title) + '</a></h3>' +
        '<p class="meta-line">' + escapeText(item.year) + ' · ' + escapeText(item.region) + ' · ' + escapeText(item.type) + '</p>' +
        '<p class="card-desc">' + escapeText(item.one) + '</p><p class="tag-line">' + escapeText(tagText) + '</p></div></article>';
    }).join('');
  };
  render(initial);
  input.addEventListener('input', function () {
    render(input.value);
  });
})();
