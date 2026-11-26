/* MIA Ayuda: asistente con voz. Autocontenido, no depende de React.
   Uso: subir mia-logo-dorado.png junto al index.html y agregar antes de </body>:
   <script src="mia-ayuda.js" defer></script>
   Opcional: llamar window.MIA_AYUDA.saludar() justo después de que la persona inicie sesión. */
(function () {
  'use strict';

  /* ===== 1. PREGUNTAS Y RESPUESTAS (editar con el texto del manual) ===== */
  var FAQ = [
    { q: '¿Cómo registro un gasto o un ingreso?',
      a: 'Elige Gasto o Ingreso, escribe el concepto y el valor, y pulsa Guardar movimiento.' },
    { q: '¿En cuántos dispositivos puedo usar MIA?',
      a: 'Puedes entrar con tu correo y tu contraseña en hasta dos dispositivos.' },
    { q: '¿Cómo la instalo en la pantalla de mi celular?',
      a: 'Abre MIA en el navegador de tu celular y elige la opción Agregar a pantalla de inicio.' },
    { q: 'Olvidé mi contraseña',
      a: 'En la pantalla de entrada pide crear una contraseña nueva. Te llegará un correo con un enlace de un solo uso. Revisa también Spam o Promociones.' },
    { q: '¿Con quién hablo si tengo un problema?',
      a: 'Escríbenos a soporte arroba ingetef punto com.',
      aText: 'Escríbenos a soporte@ingetef.com' }
  ];
  var SALUDO = '¡Hola! Soy MIA, tu ayuda en la app. Tócame cuando quieras preguntarme algo.';
  var LOGO = 'mia-logo-dorado.png';

  /* ===== 2. VOZ ===== */
  var silenciado = false;
  try { silenciado = localStorage.getItem('mia_ayuda_mudo') === '1'; } catch (e) {}
  var hablando = false;

  function elegirVoz() {
    if (!('speechSynthesis' in window)) return null;
    var voces = window.speechSynthesis.getVoices() || [];
    var pref = ['es-CO', 'es-MX', 'es-US', 'es-419', 'es-ES'];
    for (var i = 0; i < pref.length; i++) {
      for (var j = 0; j < voces.length; j++) {
        if (voces[j].lang && voces[j].lang.replace('_', '-') === pref[i]) return voces[j];
      }
    }
    for (var k = 0; k < voces.length; k++) {
      if (voces[k].lang && voces[k].lang.slice(0, 2) === 'es') return voces[k];
    }
    return null;
  }

  function hablar(texto) {
    if (silenciado || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(texto);
      var v = elegirVoz();
      if (v) u.voice = v;
      u.lang = v ? v.lang : 'es-419';
      u.rate = 1;
      u.pitch = 1.05;
      u.onstart = function () { hablando = true; muneco.classList.add('hablando'); };
      u.onend = u.onerror = function () { hablando = false; muneco.classList.remove('hablando'); };
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function callar() {
    try { window.speechSynthesis.cancel(); } catch (e) {}
    hablando = false;
    if (muneco) muneco.classList.remove('hablando');
  }

  /* ===== 3. ESTILOS ===== */
  var css = [
    '#mia-ayuda{position:fixed;right:10px;bottom:76px;z-index:45;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}',
    '#mia-ayuda *{box-sizing:border-box}',
    '@media (min-width:768px){#mia-ayuda{right:calc(50vw - 224px + 10px);bottom:calc((100vh - 92vh)/2 + 76px)}}',
    '#mia-muneco{width:70px;height:87px;border:0;background:none;padding:0;cursor:pointer;-webkit-tap-highlight-color:transparent;display:block;margin-left:auto}',
    '#mia-muneco svg{width:100%;height:100%;overflow:visible;display:block}',
    '#mia-muneco .ojo{transform-box:fill-box;transform-origin:center;animation:mia-parpadeo 5s infinite}',
    '#mia-muneco .brazo-saludo{transform-box:view-box;transform-origin:-70px 8px}',
    '#mia-muneco.hablando .brazo-saludo{animation:mia-saludo .7s ease-in-out infinite}',
    '#mia-muneco.hablando svg{animation:mia-salto 1s ease-in-out infinite}',
    '@keyframes mia-parpadeo{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}',
    '@keyframes mia-saludo{0%,100%{transform:rotate(0)}50%{transform:rotate(-18deg)}}',
    '@keyframes mia-salto{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}',
    '@media (prefers-reduced-motion:reduce){#mia-muneco *{animation:none!important}}',
    '#mia-panel{display:none;width:min(320px,calc(100vw - 24px));max-height:70vh;overflow:auto;background:#0A1F17;border:1px solid #D4A63A;border-radius:16px;padding:14px;margin-bottom:8px;color:#fff;box-shadow:0 6px 24px rgba(0,0,0,.45)}',
    '#mia-panel.abierto{display:block}',
    '#mia-panel h2{margin:0 0 4px;font-size:15px;font-weight:600;color:#D4A63A}',
    '#mia-panel .sub{margin:0 0 10px;font-size:12px;color:#9FC4B2}',
    '#mia-panel .barra{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}',
    '#mia-panel button.chip{display:block;width:100%;text-align:left;margin:0 0 8px;padding:10px 12px;background:#12362A;color:#fff;border:1px solid rgba(212,166,58,.5);border-radius:12px;font-size:14px;cursor:pointer}',
    '#mia-panel button.chip:active{background:#1b4a39}',
    '#mia-panel button.mini{background:none;border:0;color:#D4A63A;font-size:13px;cursor:pointer;padding:4px 6px}',
    '#mia-respuesta{display:none;background:#fff;color:#0F2A20;border-radius:12px;padding:12px;margin:4px 0 8px;font-size:14px;line-height:1.45}',
    '#mia-respuesta.visible{display:block}',
    '#mia-respuesta .t{font-size:12px;color:#2F6B52;margin:0 0 4px}',
    '#mia-aviso{margin:6px 0 0;font-size:11px;color:#9FC4B2}'
  ].join('');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  /* ===== 4. MUÑECO (SVG: logo real + ojos, brazos y pies) ===== */
  var dorado = 'stroke="#5E430C" stroke-width="14" stroke-linecap="round" fill="none"';
  var doradoIn = 'stroke="url(#mia-gd)" stroke-width="10" stroke-linecap="round" fill="none"';
  var svg = ''
    + '<svg viewBox="-125 -105 250 235" aria-hidden="true">'
    + '<defs><linearGradient id="mia-gd" gradientUnits="userSpaceOnUse" x1="-110" y1="-60" x2="110" y2="110">'
    + '<stop offset="0" stop-color="#F7DE8B"/><stop offset=".35" stop-color="#D9A93A"/>'
    + '<stop offset=".65" stop-color="#F2D26E"/><stop offset="1" stop-color="#A9781A"/></linearGradient></defs>'
    + '<ellipse cx="0" cy="112" rx="62" ry="8" fill="#000" opacity=".28"/>'
    + '<g class="brazo-saludo">'
    + '<path d="M-70 8 Q-98 -4 -106 -38" ' + dorado + '/><path d="M-70 8 Q-98 -4 -106 -38" ' + doradoIn + '/>'
    + '<circle cx="-106" cy="-44" r="13" fill="url(#mia-gd)" stroke="#5E430C" stroke-width="2.5"/></g>'
    + '<path d="M70 14 Q96 30 104 52" ' + dorado + '/><path d="M70 14 Q96 30 104 52" ' + doradoIn + '/>'
    + '<circle cx="105" cy="58" r="13" fill="url(#mia-gd)" stroke="#5E430C" stroke-width="2.5"/>'
    + '<path d="M-22 66 L-26 98" ' + dorado + '/><path d="M-22 66 L-26 98" ' + doradoIn + '/>'
    + '<path d="M22 66 L26 98" ' + dorado + '/><path d="M22 66 L26 98" ' + doradoIn + '/>'
    + '<ellipse cx="-33" cy="104" rx="19" ry="9" fill="url(#mia-gd)" stroke="#5E430C" stroke-width="2.5"/>'
    + '<ellipse cx="33" cy="104" rx="19" ry="9" fill="url(#mia-gd)" stroke="#5E430C" stroke-width="2.5"/>'
    + '<circle cx="0" cy="0" r="72" fill="#FFF4D8"/>'
    + '<image href="' + LOGO + '" x="-80" y="-80" width="160" height="160"/>'
    + '<g class="ojo"><circle cx="-24" cy="-72" r="17" fill="#fff" stroke="#5E430C" stroke-width="3"/>'
    + '<circle cx="-21" cy="-70" r="8" fill="#3A2A08"/><circle cx="-18" cy="-74" r="3" fill="#fff"/></g>'
    + '<g class="ojo"><circle cx="24" cy="-72" r="17" fill="#fff" stroke="#5E430C" stroke-width="3"/>'
    + '<circle cx="27" cy="-70" r="8" fill="#3A2A08"/><circle cx="30" cy="-74" r="3" fill="#fff"/></g>'
    + '</svg>';

  /* ===== 5. ARMADO DE LA INTERFAZ ===== */
  var cont = document.createElement('div');
  cont.id = 'mia-ayuda';
  cont.innerHTML = ''
    + '<div id="mia-panel" role="dialog" aria-label="Ayuda de MIA">'
    + '<div class="barra"><h2>Ayuda de MIA</h2><span>'
    + '<button class="mini" id="mia-mudo" type="button"></button>'
    + '<button class="mini" id="mia-cerrar" type="button" aria-label="Cerrar">Cerrar</button></span></div>'
    + '<p class="sub">Toca una pregunta y te respondo con voz.</p>'
    + '<div id="mia-respuesta" aria-live="polite"></div>'
    + '<div id="mia-lista"></div>'
    + '<p id="mia-aviso">Esta ayuda explica cómo usar la app. No da consejos financieros.</p>'
    + '</div>'
    + '<button id="mia-muneco" type="button" aria-label="Abrir la ayuda de MIA">' + svg + '</button>';
  document.body.appendChild(cont);

  var muneco = document.getElementById('mia-muneco');
  var panel = document.getElementById('mia-panel');
  var lista = document.getElementById('mia-lista');
  var resp = document.getElementById('mia-respuesta');
  var btnMudo = document.getElementById('mia-mudo');

  FAQ.forEach(function (item) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = item.q;
    b.addEventListener('click', function () {
      resp.innerHTML = '<p class="t">Respuesta del manual</p><div></div>';
      resp.lastChild.textContent = item.aText || item.a;
      resp.classList.add('visible');
      hablar(item.a);
    });
    lista.appendChild(b);
  });

  function pintarMudo() { btnMudo.textContent = silenciado ? 'Activar voz' : 'Silenciar'; }
  pintarMudo();
  btnMudo.addEventListener('click', function () {
    silenciado = !silenciado;
    try { localStorage.setItem('mia_ayuda_mudo', silenciado ? '1' : '0'); } catch (e) {}
    if (silenciado) callar();
    pintarMudo();
  });

  function abrir() {
    panel.classList.add('abierto');
    resp.classList.remove('visible');
    hablar('¿En qué te ayudo? Toca una pregunta.');
  }
  function cerrar() { panel.classList.remove('abierto'); callar(); }

  muneco.addEventListener('click', function () {
    if (panel.classList.contains('abierto')) cerrar(); else abrir();
  });
  document.getElementById('mia-cerrar').addEventListener('click', cerrar);

  /* ===== 6. SALUDO AL ENTRAR (una vez por sesión) ===== */
  var saludado = false;
  function saludar() {
    if (saludado) return;
    saludado = true;
    try { if (sessionStorage.getItem('mia_ayuda_saludo') === '1') return; sessionStorage.setItem('mia_ayuda_saludo', '1'); } catch (e) {}
    hablar(SALUDO);
  }
  /* Los navegadores solo dejan hablar después de un toque: el primer toque en la app dispara el saludo. */
  document.addEventListener('pointerdown', function primer(ev) {
    if (cont.contains(ev.target)) return;
    document.removeEventListener('pointerdown', primer, true);
    saludar();
  }, true);

  if ('speechSynthesis' in window) { window.speechSynthesis.onvoiceschanged = function () {}; }
  window.MIA_AYUDA = { saludar: saludar, abrir: abrir, cerrar: cerrar };
})();
