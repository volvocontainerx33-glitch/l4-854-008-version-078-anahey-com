(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === activeSlide);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === activeSlide);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = parseInt(dot.getAttribute("data-hero-dot"), 10);
        showSlide(next);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(activeSlide + 1);
      }, 5600);
    }

    var currentFilter = "";
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));

    function cards() {
      return Array.prototype.slice.call(document.querySelectorAll(".movie-card, .mini-card"));
    }

    function queryText() {
      var value = "";
      searchInputs.forEach(function (input) {
        if (input.value.trim()) {
          value = input.value.trim().toLowerCase();
        }
      });
      return value;
    }

    function applyFilters() {
      var query = queryText();
      var filter = currentFilter.toLowerCase();
      cards().forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchFilter = !filter || text.indexOf(filter) !== -1;
        card.classList.toggle("is-filtered-out", !(matchQuery && matchFilter));
      });
    }

    searchInputs.forEach(function (input) {
      input.addEventListener("input", function () {
        searchInputs.forEach(function (other) {
          if (other !== input) {
            other.value = input.value;
          }
        });
        applyFilters();
      });
    });

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentFilter = button.getAttribute("data-filter") || "";
        filterButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilters();
      });
    });
  });
}());
