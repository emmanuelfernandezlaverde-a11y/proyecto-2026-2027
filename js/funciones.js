/* ==========================================================================
   OnView — Script unificado
   Tema · Menú · Formularios · Foto · Login
   Seguro en cualquier página: solo actúa si encuentra los elementos.
   ========================================================================== */

(function () {
  "use strict";

  /* --------------------------------------------------------------------------
     1. TEMA (claro / oscuro)
     -------------------------------------------------------------------------- */
  function initTheme() {
    const root = document.documentElement;
    const button = document.getElementById("theme-toggle");
    const STORAGE_KEY = "onview-theme";

    function getSavedTheme() {
      try {
        return localStorage.getItem(STORAGE_KEY);
      } catch (_) {
        return null;
      }
    }

    function saveTheme(theme) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (_) {}
    }

    function getSystemTheme() {
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
      return "light";
    }

    function applyTheme(theme) {
      root.dataset.theme = theme;
      if (!button) return;

      const isDark = theme === "dark";
      button.setAttribute("aria-checked", String(isDark));
      button.setAttribute(
        "aria-label",
        isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
      );

      const icon = button.querySelector(".theme-icon");
      const label = button.querySelector(".theme-label");
      if (icon) icon.textContent = isDark ? "☀" : "☾";
      if (label) label.textContent = isDark ? "Modo claro" : "Modo oscuro";
    }

    const initial = getSavedTheme() || getSystemTheme();
    applyTheme(initial);

    if (button) {
      button.addEventListener("click", function () {
        const next = root.dataset.theme === "dark" ? "light" : "dark";
        applyTheme(next);
        saveTheme(next);
      });
    }
  }

  /* --------------------------------------------------------------------------
     2. MENÚ HAMBURGUESA
     -------------------------------------------------------------------------- */
  function initMenu() {
    const menuToggle = document.querySelector("#menu-toggle");
    const headerNav = document.querySelector("header nav");
    if (!menuToggle || !headerNav) return;

    const menuIcon = menuToggle.querySelector(".menu-icon");
    const closeIcon = menuToggle.querySelector(".close-icon");

    function setOpen(isOpen) {
      headerNav.classList.toggle("open", isOpen);
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (menuIcon && closeIcon) {
        menuIcon.style.display = isOpen ? "none" : "inline-flex";
        closeIcon.style.display = isOpen ? "inline-flex" : "none";
      }
    }

    function closeMenu() {
      setOpen(false);
    }

    menuToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!headerNav.classList.contains("open"));
    });

    headerNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", function (e) {
      if (!headerNav.contains(e.target) && !menuToggle.contains(e.target)) {
        closeMenu();
      }
    });
  }

  /* --------------------------------------------------------------------------
     3. FORMULARIO DE AVISTAMIENTO
     -------------------------------------------------------------------------- */
  function initFormAvistamiento() {
    const formulario = document.querySelector("#form-avistamiento");
    const mensajeExito = document.querySelector("#mensaje-exito");
    const inputFecha = document.querySelector("#fecha");
    const inputHora = document.querySelector("#hora");

    if (!formulario) return;

    // Fecha y hora actuales por defecto
    if (inputFecha && !inputFecha.value) {
      inputFecha.value = new Date().toISOString().split("T")[0];
    }

    if (inputHora && !inputHora.value) {
      const ahora = new Date();
      const horas = String(ahora.getHours()).padStart(2, "0");
      const minutos = String(ahora.getMinutes()).padStart(2, "0");
      inputHora.value = horas + ":" + minutos;
    }

    formulario.addEventListener("submit", function (evento) {
      evento.preventDefault();

      if (mensajeExito) {
        mensajeExito.classList.remove("hidden");
        mensajeExito.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      setTimeout(function () {
        formulario.reset();
        if (inputFecha) {
          inputFecha.value = new Date().toISOString().split("T")[0];
        }
        if (inputHora) {
          const ahora = new Date();
          const horas = String(ahora.getHours()).padStart(2, "0");
          const minutos = String(ahora.getMinutes()).padStart(2, "0");
          inputHora.value = horas + ":" + minutos;
        }
      }, 1200);
    });
  }

  /* --------------------------------------------------------------------------
     4. PREVISUALIZACIÓN DE FOTO
     -------------------------------------------------------------------------- */
  function initPhotoPreview() {
    const input = document.getElementById("foto");
    const dropzone = document.getElementById("photo-dropzone");
    const preview = document.getElementById("photo-preview");
    const tools = document.getElementById("photo-preview-tools");
    const filename = document.getElementById("photo-file-name");
    const remove = document.getElementById("remove-photo");

    if (!input || !dropzone || !preview) return;

    let currentUrl = null;

    function showFile(file) {
      if (!file) return;

      if (!file.type || !file.type.startsWith("image/")) {
        alert("Selecciona un archivo de imagen válido.");
        input.value = "";
        return;
      }

      if (currentUrl) URL.revokeObjectURL(currentUrl);
      currentUrl = URL.createObjectURL(file);
      preview.src = currentUrl;

      if (filename) filename.textContent = file.name;
      dropzone.classList.add("has-preview");
      if (tools) tools.hidden = false;
    }

    function clearFile() {
      input.value = "";
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      currentUrl = null;
      preview.removeAttribute("src");
      dropzone.classList.remove("has-preview");
      if (tools) tools.hidden = true;
      if (filename) filename.textContent = "";
    }

    input.addEventListener("change", function () {
      showFile(input.files && input.files[0]);
    });

    ["dragenter", "dragover"].forEach(function (type) {
      dropzone.addEventListener(type, function (e) {
        e.preventDefault();
        dropzone.classList.add("drag-over");
      });
    });

    ["dragleave", "drop"].forEach(function (type) {
      dropzone.addEventListener(type, function (e) {
        e.preventDefault();
        dropzone.classList.remove("drag-over");
      });
    });

    dropzone.addEventListener("drop", function (e) {
      const file =
        e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (!file) return;
      try {
        input.files = e.dataTransfer.files;
      } catch (_) {}
      showFile(file);
    });

    if (remove) {
      remove.addEventListener("click", clearFile);
    }
  }

  /* --------------------------------------------------------------------------
     5. LOGIN: mostrar/ocultar contraseña + envío demo
     -------------------------------------------------------------------------- */
  function initLogin() {
    const toggleBtn = document.querySelector("#toggle-password");
    const passInput = document.querySelector("#password");
    const formLogin = document.querySelector("#form-login");
    const mensaje = document.querySelector("#mensaje-login");
    const eyeOpen = document.querySelector("#icon-eye-open");
    const eyeClosed = document.querySelector("#icon-eye-closed");

    // Mostrar / ocultar contraseña
    if (toggleBtn && passInput) {
      toggleBtn.addEventListener("click", function (e) {
        e.preventDefault();
        const isPassword = passInput.type === "password";
        passInput.type = isPassword ? "text" : "password";

        if (eyeOpen) eyeOpen.style.display = isPassword ? "none" : "block";
        if (eyeClosed) eyeClosed.style.display = isPassword ? "block" : "none";
      });
    }

    // Envío de demostración
    if (formLogin) {
      formLogin.addEventListener("submit", function (e) {
        e.preventDefault();

        if (mensaje) {
          mensaje.classList.remove("hidden");
          mensaje.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }

        setTimeout(function () {
          formLogin.reset();
          if (passInput) passInput.type = "password";
          if (eyeOpen) eyeOpen.style.display = "block";
          if (eyeClosed) eyeClosed.style.display = "none";
        }, 1600);
      });
    }
  }

  /* --------------------------------------------------------------------------
     6. FORMULARIO DE REPORTES (si existe)
     -------------------------------------------------------------------------- */
  function initFormReporte() {
    const formulario = document.querySelector("#form-reporte");
    const mensajeOk = document.querySelector("#mensaje-exito");
    if (!formulario) return;

    formulario.addEventListener("submit", function (event) {
      event.preventDefault();

      if (mensajeOk) {
        mensajeOk.classList.remove("hidden");
        mensajeOk.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      setTimeout(function () {
        formulario.reset();
        if (mensajeOk) mensajeOk.classList.add("hidden");
      }, 4000);
    });
  }

  /* --------------------------------------------------------------------------
     ARRANQUE
     -------------------------------------------------------------------------- */
  function init() {
    initTheme();
    initMenu();
    initFormAvistamiento();
    initPhotoPreview();
    initLogin();
    initFormReporte();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();