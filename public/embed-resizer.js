(function () {
  function onMessage(e) {
    if (!e || !e.data) return;
    try {
      var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (data && data.type === 'catezile-embed-size' && data.height && e.source) {
        var iframes = document.querySelectorAll('iframe[src*="/embed/"]');
        for (var i = 0; i < iframes.length; i++) {
          if (iframes[i].contentWindow === e.source) {
            iframes[i].style.height = data.height + 'px';
          }
        }
      }
    } catch {}
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('message', onMessage);
  }
})();
