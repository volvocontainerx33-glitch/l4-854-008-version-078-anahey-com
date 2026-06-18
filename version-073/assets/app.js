(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.getElementById("navMenu");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        setInterval(function () {
            show(current + 1);
        }, 5200);
        show(0);
    }

    function text(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupFilters() {
        var panel = document.querySelector(".movie-filter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        if (!panel || !cards.length) {
            return;
        }
        var input = panel.querySelector("[data-filter-input]");
        var region = panel.querySelector("[data-filter-region]");
        var type = panel.querySelector("[data-filter-type]");
        var year = panel.querySelector("[data-filter-year]");
        var category = panel.querySelector("[data-filter-category]");
        var empty = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query && input) {
            input.value = query;
        }
        function matchCard(card) {
            var blob = text(card.getAttribute("data-search"));
            var title = text(card.getAttribute("data-title"));
            var cardRegion = text(card.getAttribute("data-region"));
            var cardType = text(card.getAttribute("data-type"));
            var cardYear = text(card.getAttribute("data-year"));
            var cardCategory = text(card.getAttribute("data-category"));
            var q = input ? text(input.value) : "";
            var r = region ? text(region.value) : "";
            var t = type ? text(type.value) : "";
            var y = year ? text(year.value) : "";
            var c = category ? text(category.value) : "";
            return (!q || blob.indexOf(q) !== -1 || title.indexOf(q) !== -1) &&
                (!r || cardRegion.indexOf(r) !== -1 || blob.indexOf(r) !== -1) &&
                (!t || cardType.indexOf(t) !== -1) &&
                (!y || cardYear === y) &&
                (!c || cardCategory === c);
        }
        function apply() {
            var shown = 0;
            cards.forEach(function (card) {
                var ok = matchCard(card);
                card.hidden = !ok;
                if (ok) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.hidden = shown !== 0;
            }
        }
        [input, region, type, year, category].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".player-overlay");
            if (!video) {
                return;
            }
            var source = video.getAttribute("data-m3u8");
            var attached = false;
            var hls = null;
            function attach() {
                if (attached || !source) {
                    return;
                }
                attached = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else {
                    video.src = source;
                }
            }
            function start() {
                attach();
                if (overlay) {
                    overlay.hidden = true;
                }
                video.setAttribute("controls", "controls");
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        video.setAttribute("controls", "controls");
                    });
                }
            }
            if (overlay) {
                overlay.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (!attached || video.paused) {
                    start();
                } else {
                    video.pause();
                }
            });
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.hidden = true;
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
