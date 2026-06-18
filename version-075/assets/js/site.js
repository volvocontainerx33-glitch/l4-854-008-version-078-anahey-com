(function() {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function text(value) {
        return (value || '').toString().toLowerCase();
    }

    function setActiveSlide(index) {
        var slides = qsa('.hero-slide');
        var dots = qsa('.hero-dot');
        if (!slides.length) {
            return;
        }
        slides.forEach(function(slide, i) {
            slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function(dot, i) {
            dot.classList.toggle('is-active', i === index);
        });
    }

    function initHero() {
        var slides = qsa('.hero-slide');
        var dots = qsa('.hero-dot');
        if (!slides.length) {
            return;
        }
        var active = 0;
        dots.forEach(function(dot, i) {
            dot.addEventListener('click', function() {
                active = i;
                setActiveSlide(active);
            });
        });
        window.setInterval(function() {
            active = (active + 1) % slides.length;
            setActiveSlide(active);
        }, 5000);
    }

    function initMobileNav() {
        var toggle = qs('[data-mobile-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function() {
            panel.classList.toggle('is-open');
        });
    }

    function matchesCard(card, query, region, year) {
        var haystack = text(card.getAttribute('data-search'));
        var cardRegion = card.getAttribute('data-region') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var queryOk = !query || haystack.indexOf(query) !== -1;
        var regionOk = !region || cardRegion === region;
        var yearOk = !year || cardYear === year;
        return queryOk && regionOk && yearOk;
    }

    function applyFilters(root) {
        var input = qs('[data-filter-input]', root);
        var regionSelect = qs('[data-filter-region]', root);
        var yearSelect = qs('[data-filter-year]', root);
        var cards = qsa('[data-movie-card]', root);
        var empty = qs('[data-empty-state]', root);
        var query = text(input && input.value).trim();
        var region = regionSelect ? regionSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        var visible = 0;
        cards.forEach(function(card) {
            var ok = matchesCard(card, query, region, year);
            card.hidden = !ok;
            if (ok) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    function initFilters() {
        var panels = qsa('[data-filter-panel]');
        panels.forEach(function(panel) {
            qsa('input, select', panel).forEach(function(field) {
                field.addEventListener('input', function() {
                    applyFilters(document);
                });
                field.addEventListener('change', function() {
                    applyFilters(document);
                });
            });
        });
    }

    function initSearchPage() {
        var page = qs('[data-search-page]');
        if (!page) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        var input = qs('[data-filter-input]');
        if (input && q) {
            input.value = q;
        }
        applyFilters(document);
    }

    window.initMoviePlayer = function(source) {
        var video = qs('[data-player-video]');
        var cover = qs('[data-player-cover]');
        var start = qs('[data-player-start]');
        var prepared = false;
        var hls = null;

        function attach() {
            if (prepared || !video) {
                return;
            }
            prepared = true;
            video.controls = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function begin() {
            attach();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            if (video) {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function() {});
                }
            }
        }

        if (start) {
            start.addEventListener('click', begin);
        }
        if (cover) {
            cover.addEventListener('click', begin);
        }
        if (video) {
            video.addEventListener('click', function() {
                if (!prepared) {
                    begin();
                }
            });
        }
        window.addEventListener('pagehide', function() {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function() {
        initHero();
        initMobileNav();
        initFilters();
        initSearchPage();
    });
})();
