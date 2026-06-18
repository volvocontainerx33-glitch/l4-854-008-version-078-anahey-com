(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        initMenu();
        initHero();
        initSearchFilter();
        initPlayers();
    });

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');

        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);

        show(0);
        start();
    }

    function initSearchFilter() {
        var panels = document.querySelectorAll('[data-filter-panel]');

        panels.forEach(function (panel) {
            var root = panel.closest('[data-filter-root]') || document;
            var input = panel.querySelector('[data-filter-input]');
            var category = panel.querySelector('[data-filter-category]');
            var year = panel.querySelector('[data-filter-year]');
            var cards = Array.prototype.slice.call(root.querySelectorAll('[data-search]'));
            var empty = root.querySelector('[data-empty-state]');
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q') || '';

            if (input && q) {
                input.value = q;
            }

            function normalize(text) {
                return String(text || '').trim().toLowerCase();
            }

            function apply() {
                var keyword = normalize(input ? input.value : '');
                var selectedCategory = category ? category.value : '';
                var selectedYear = year ? year.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-search'));
                    var cardCategory = card.getAttribute('data-category') || '';
                    var cardYear = card.getAttribute('data-year') || '';
                    var matched = true;

                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }

                    if (selectedCategory && cardCategory !== selectedCategory) {
                        matched = false;
                    }

                    if (selectedYear && cardYear !== selectedYear) {
                        matched = false;
                    }

                    card.style.display = matched ? '' : 'none';

                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('show', visible === 0);
                }
            }

            [input, category, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            apply();
        });
    }

    function initPlayers() {
        var shells = document.querySelectorAll('[data-video-src]');

        shells.forEach(function (shell) {
            var video = shell.querySelector('video');
            var overlay = shell.querySelector('.player-overlay');
            var source = shell.getAttribute('data-video-src');
            var initialized = false;
            var hlsInstance = null;

            if (!video || !source) {
                return;
            }

            function bindSource() {
                if (initialized) {
                    return;
                }

                initialized = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function playVideo() {
                bindSource();
                shell.classList.add('is-playing');
                var promise = video.play();

                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        shell.classList.remove('is-playing');
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener('click', playVideo);
            }

            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    shell.classList.remove('is-playing');
                }
            });

            video.addEventListener('ended', function () {
                shell.classList.remove('is-playing');
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }
})();
