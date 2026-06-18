(function () {
  var box = document.querySelector('.video-box');
  if (!box) {
    return;
  }
  var video = box.querySelector('video');
  var cover = box.querySelector('.video-cover');
  if (!video) {
    return;
  }
  var stream = video.getAttribute('data-stream');
  var ready = false;
  var prepare = function () {
    if (ready || !stream) {
      return;
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }
  };
  var play = function () {
    prepare();
    if (cover) {
      cover.classList.add('hidden');
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  };
  if (cover) {
    cover.addEventListener('click', play);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('hidden');
    }
  });
})();
