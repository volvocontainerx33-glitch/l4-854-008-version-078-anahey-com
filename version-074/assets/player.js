(function () {
  window.startMoviePlayer = function (url) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.getElementById('playOverlay');
    if (!video || !url) {
      return;
    }

    var hlsInstance = null;
    var bind = function () {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        return;
      }
      video.src = url;
    };

    var start = function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {
          video.controls = true;
        });
      }
    };

    bind();

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
