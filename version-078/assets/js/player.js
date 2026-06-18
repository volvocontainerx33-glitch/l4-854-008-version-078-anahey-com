(function () {
  var script = document.currentScript;
  var videoUrl = script ? script.getAttribute("data-url") : "";
  var wrap = document.querySelector("[data-player-wrap]");
  if (!wrap || !videoUrl) {
    return;
  }

  var video = wrap.querySelector("video");
  var overlay = wrap.querySelector("[data-play-overlay]");
  var playButton = wrap.querySelector("[data-play-button]");
  var hlsItem = null;
  var started = false;

  function runVideo() {
    if (!video) {
      return;
    }
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    if (started) {
      video.play().catch(function () {});
      return;
    }
    started = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      video.play().catch(function () {});
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsItem = new Hls({ enableWorker: true });
      hlsItem.loadSource(videoUrl);
      hlsItem.attachMedia(video);
      hlsItem.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }
    video.src = videoUrl;
    video.play().catch(function () {});
  }

  if (overlay) {
    overlay.addEventListener("click", runVideo);
  }
  if (playButton) {
    playButton.addEventListener("click", runVideo);
  }
  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        runVideo();
      }
    });
  }
  window.addEventListener("beforeunload", function () {
    if (hlsItem) {
      hlsItem.destroy();
    }
  });
}());
