document.addEventListener('DOMContentLoaded', function () {
  function bindModalLinks() {
    var loginModalEl = document.getElementById('loginModal');
    var registerModalEl = document.getElementById('registerModal');
    if (!loginModalEl || !registerModalEl) return;
    var loginModal = bootstrap.Modal.getOrCreateInstance(loginModalEl);
    var registerModal = bootstrap.Modal.getOrCreateInstance(registerModalEl);
    document.querySelectorAll('.link-register').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); loginModal.hide(); registerModal.show(); });
    });
    document.querySelectorAll('.link-login-back').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); registerModal.hide(); loginModal.show(); });
    });
  }

  bindModalLinks();

  var obs = new MutationObserver(function () { bindModalLinks(); });
  obs.observe(document.body, { childList: true, subtree: true });
});