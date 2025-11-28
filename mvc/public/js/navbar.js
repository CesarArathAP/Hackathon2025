(function() {
  var modalsInitialized = new WeakSet();

  function bindModalLinks() {
    var loginModalEl = document.getElementById('loginModal');
    var registerModalEl = document.getElementById('registerModal');
    if (!loginModalEl || !registerModalEl) return;
    
    // Evitar inicialización múltiple usando WeakSet
    if (modalsInitialized.has(loginModalEl)) return;
    modalsInitialized.add(loginModalEl);
    modalsInitialized.add(registerModalEl);

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

    // Función para cargar estados
    async function cargarEstadosNavbar() {
      try {
        var response = await fetch('/api/estados');
        var estados = await response.json();
        var selectEstado = document.getElementById('regEstadoNav');
        if (selectEstado) {
          selectEstado.innerHTML = '<option value="">Selecciona un estado</option>';
          estados.forEach(function(estado) {
            var option = document.createElement('option');
            option.value = estado.id_estado;
            option.textContent = estado.nombre_estado;
            selectEstado.appendChild(option);
          });
        }
      } catch (error) {
        console.error('Error al cargar estados:', error);
      }
    }

    // Cargar estados al abrir el modal de registro
    registerModalEl.addEventListener('show.bs.modal', async function() {
      await cargarEstadosNavbar();
    });

    // Cargar municipios cuando se seleccione un estado
    var selectEstado = document.getElementById('regEstadoNav');
    var selectMunicipio = document.getElementById('regMunicipioNav');
    if (selectEstado && selectMunicipio) {
      selectEstado.addEventListener('change', async function() {
        var estadoId = this.value;
        selectMunicipio.disabled = true;
        selectMunicipio.innerHTML = '<option value="">Cargando municipios...</option>';
        
        if (estadoId) {
          try {
            var response = await fetch('/api/municipios/estado/' + estadoId);
            var municipios = await response.json();
            selectMunicipio.innerHTML = '<option value="">Selecciona un municipio</option>';
            municipios.forEach(function(municipio) {
              var option = document.createElement('option');
              option.value = municipio.id;
              option.textContent = municipio.nombre;
              selectMunicipio.appendChild(option);
            });
            selectMunicipio.disabled = false;
          } catch (error) {
            console.error('Error al cargar municipios:', error);
            selectMunicipio.innerHTML = '<option value="">Error al cargar municipios</option>';
          }
        } else {
          selectMunicipio.innerHTML = '<option value="">Primero selecciona un estado</option>';
        }
      });
    }

    // Manejar formulario de registro
    var regForm = document.getElementById('regFormNav');
    var regError = document.getElementById('regErrorNav');
    if (regForm) {
      regForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (regError) regError.classList.add('d-none');
        
        var id_municipio = document.getElementById('regMunicipioNav').value;
        var nombre = document.getElementById('regNombreNav').value;
        var telefono = document.getElementById('regTelefonoNav').value;
        var correo = document.getElementById('regCorreoNav').value;
        var password = document.getElementById('regPasswordNav').value;

        if (!id_municipio) {
          if (regError) {
            regError.textContent = 'Por favor selecciona un estado y municipio';
            regError.classList.remove('d-none');
          }
          return;
        }

        try {
          var response = await fetch('/api/auth/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: correo, password, nombre, telefono, id_municipio })
          });

          var data = await response.json();

          if (response.ok && data.success && data.usuario) {
            // Guardar información del usuario en localStorage
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            localStorage.setItem('isLoggedIn', 'true');
            
            // Cerrar modal y redirigir según el rol (igual que en login)
            registerModal.hide();
            if (data.usuario.rol === 'admin') {
              window.location.href = '/dashboard.html';
            } else {
              window.location.href = '/formulario';
            }
          } else {
            if (regError) {
              regError.textContent = data.error || 'Error al registrar usuario';
              regError.classList.remove('d-none');
            }
          }
        } catch (error) {
          if (regError) {
            regError.textContent = 'Error de conexión. Por favor, intenta de nuevo.';
            regError.classList.remove('d-none');
          }
          console.error('Error:', error);
        }
      });
    }
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindModalLinks);
  } else {
    bindModalLinks();
  }

  // Observar cambios en el DOM para cuando el navbar se cargue dinámicamente
  var obs = new MutationObserver(function () { 
    bindModalLinks(); 
  });
  obs.observe(document.body, { childList: true, subtree: true });
})();