(function () {
  function markMessage(player, message) {
    var note = player.querySelector('.player-note');
    if (note) {
      note.textContent = message;
    }
  }

  function startPlayer(player) {
    var video = player.querySelector('video[data-hls-src]');
    var button = player.querySelector('[data-play-button]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-hls-src');

    if (!source) {
      markMessage(player, '当前影片暂未绑定播放源。');
      return;
    }

    if (button) {
      button.classList.add('is-hidden');
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (video._hlsInstance) {
        video._hlsInstance.destroy();
      }

      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      video._hlsInstance = hls;
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {
          markMessage(player, '播放源已加载，请再次点击视频播放。');
        });
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          markMessage(player, '播放时遇到网络或格式问题，请刷新页面后重试。');
        }
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {
          markMessage(player, '播放源已加载，请再次点击视频播放。');
        });
      }, { once: true });
      return;
    }

    markMessage(player, '当前浏览器不支持 HLS 播放，请更换支持 m3u8 的浏览器。');
  }

  document.querySelectorAll('[data-hls-player]').forEach(function (player) {
    var button = player.querySelector('[data-play-button]');
    var video = player.querySelector('video[data-hls-src]');

    if (button) {
      button.addEventListener('click', function () {
        startPlayer(player);
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        if (!video.src) {
          startPlayer(player);
        }
      }, { once: true });
    }
  });
})();
