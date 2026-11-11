(function () {
  function typewriter(el, text, speed) {
    el.textContent = '';
    el.classList.add('typewriter-title');
    var i = 0;
    (function type() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i++);
        setTimeout(type, speed);
      } else {
        el.classList.add('typewriter-done');
      }
    })();
  }

  function init() {
    document.querySelectorAll('h1.post-title, .page-title, #page-site-info #site-title').forEach(function (el) {
      var text = el.textContent.trim();
      if (text) typewriter(el, text, 80);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
