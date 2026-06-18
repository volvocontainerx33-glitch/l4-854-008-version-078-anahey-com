document.addEventListener('DOMContentLoaded', function () {
  var video = document.querySelector('[data-player]');
  var overlay = document.querySelector('[data-player-overlay]');
  var playButton = document.querySelector('[data-play-button]');

  if (!video || !overlay) {
    return;
  }

  var streamUrl = video.getAttribute('data-stream');
  var hlsInstance = null;
  var started = false;

  function attachStream() {
    if (started) {
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function startPlayback() {
    attachStream();
    video.controls = true;
    overlay.classList.add('is-hidden');

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', startPlayback);

  if (playButton) {
    playButton.addEventListener('click', function (event) {
      event.stopPropagation();
      startPlayback();
    });
  }

  video.addEventListener('click', function () {
    if (!started || video.paused) {
      startPlayback();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
});
