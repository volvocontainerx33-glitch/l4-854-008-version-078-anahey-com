(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var toggle = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (toggle && panel) {
            toggle.addEventListener('click', function () {
                panel.classList.toggle('is-open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var current = 0;
        var timer = null;

        function setHero(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function startHero() {
            if (slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                setHero(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                setHero(index);
                startHero();
            });
        });
        startHero();

        var filterBox = document.querySelector('.filter-box');
        var movieCards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        if (filterBox && movieCards.length) {
            var input = filterBox.querySelector('[data-filter-text]');
            var genre = filterBox.querySelector('[data-filter-genre]');
            var year = filterBox.querySelector('[data-filter-year]');
            var empty = document.querySelector('.no-result');
            var query = new URLSearchParams(window.location.search).get('q') || '';
            if (input && query) {
                input.value = query;
            }

            function valueOf(card, name) {
                return (card.getAttribute(name) || '').toLowerCase();
            }

            function applyFilter() {
                var text = input ? input.value.trim().toLowerCase() : '';
                var genreValue = genre ? genre.value.toLowerCase() : '';
                var yearValue = year ? year.value.toLowerCase() : '';
                var visible = 0;

                movieCards.forEach(function (card) {
                    var haystack = [
                        valueOf(card, 'data-title'),
                        valueOf(card, 'data-genre'),
                        valueOf(card, 'data-region'),
                        valueOf(card, 'data-year')
                    ].join(' ');
                    var ok = true;
                    if (text && haystack.indexOf(text) === -1) {
                        ok = false;
                    }
                    if (genreValue && valueOf(card, 'data-genre').indexOf(genreValue) === -1) {
                        ok = false;
                    }
                    if (yearValue && valueOf(card, 'data-year') !== yearValue) {
                        ok = false;
                    }
                    card.style.display = ok ? '' : 'none';
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            [input, genre, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', applyFilter);
                    control.addEventListener('change', applyFilter);
                }
            });
            applyFilter();
        }
    });
})();

function initMoviePlayer(streamUrl) {
    document.addEventListener('DOMContentLoaded', function () {
        var video = document.getElementById('movieVideo');
        var cover = document.querySelector('.player-cover');
        var started = false;
        var hls = null;

        if (!video || !cover || !streamUrl) {
            return;
        }

        function begin() {
            cover.classList.add('is-hidden');
            var playNow = function () {
                var action = video.play();
                if (action && action.catch) {
                    action.catch(function () {});
                }
            };

            if (!started) {
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                    playNow();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        playNow();
                    });
                    return;
                }
                video.src = streamUrl;
            }
            playNow();
        }

        cover.addEventListener('click', begin);
        video.addEventListener('click', function () {
            if (video.paused) {
                begin();
            }
        });
        video.addEventListener('play', function () {
            cover.classList.add('is-hidden');
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
}
