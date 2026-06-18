(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.main-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length > 1) {
      var current = 0;
      var show = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === current);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
        });
      });
      window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterList = document.querySelector('[data-filter-list]');
    var yearFilter = document.getElementById('yearFilter');
    var typeFilter = document.getElementById('typeFilter');
    var runFilter = function () {
      if (!filterList) {
        return;
      }
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var year = yearFilter ? yearFilter.value : '';
      var type = typeFilter ? typeFilter.value : '';
      var items = filterList.querySelectorAll('[data-search]');
      items.forEach(function (item) {
        var blob = (item.getAttribute('data-search') || '').toLowerCase();
        var itemYear = item.getAttribute('data-year') || '';
        var itemType = item.getAttribute('data-type') || '';
        var matchedKeyword = !keyword || blob.indexOf(keyword) !== -1;
        var matchedYear = !year || itemYear.indexOf(year) !== -1;
        var matchedType = !type || itemType.indexOf(type) !== -1;
        item.classList.toggle('is-filtered-out', !(matchedKeyword && matchedYear && matchedType));
      });
    };
    if (filterInput) {
      filterInput.addEventListener('input', runFilter);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', runFilter);
    }
    if (typeFilter) {
      typeFilter.addEventListener('change', runFilter);
    }
    runFilter();
  });
})();
