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

    var loginForm = loginModalEl.querySelector('form');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const email = formData.get('email');
        const password = formData.get('password');
        fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        })
        .then(response => {
          if (!response.ok) {
            return response.json().then(data => {
              alert(data.error || 'Login failed');
              throw new Error('Login failed');
            });
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            if (data.usuario.rol === 'admin') {
              window.location.href = '/dashboard.html';
            } else {
              window.location.href = '/formulario';
            }
          } else {
            alert(data.message || 'Login failed');
          }
        })
        .catch(error => {
          alert('An error occurred: ' + error.message);
        });
      });
    }
    var registerForm = registerModalEl.querySelector('form');
    if (registerForm) {
      registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        window.location.href = '/formulario';
      });
    }
  }

  bindModalLinks();

  var obs = new MutationObserver(function () { bindModalLinks(); });
  obs.observe(document.body, { childList: true, subtree: true });
});