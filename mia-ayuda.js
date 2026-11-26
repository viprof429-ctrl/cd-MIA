/* MIA Ayuda: asistente con voz y caja de preguntas. Autocontenido, no depende de React.
   Cómo usarlo: subir mia-logo-dorado.png junto al index.html y dejar antes de </body>:
   <script src="mia-ayuda.js" defer></script>
   Para ampliar el contenido: editar solo el bloque MANUAL (un tema por línea de objeto). */
(function () {
  'use strict';

  /* ===== 1. CONTENIDO DEL MANUAL =====
     t = título del tema, k = palabras clave extra (sinónimos), x = respuesta (se lee en voz alta). */
  var MANUAL = [
    { t: 'Primer ingreso y crear contraseña',
      k: 'entrar acceso correo invitacion enlace clave contrasena primera vez comprar compre registrarme',
      x: 'Después de tu compra recibes un correo con el botón Crear mi contraseña. El enlace es de un solo uso. Elige una contraseña de mínimo 8 caracteres y pulsa Guardar y entrar. Desde ese momento entras a MIA con tu correo y tu contraseña. Si no ves el correo, revisa Spam o Promociones.' },
    { t: 'Olvidé mi contraseña',
      k: 'recuperar olvide clave restablecer cambiar contrasena no recuerdo',
      x: 'En la pantalla de entrada toca ¿Olvidaste o aún no tienes contraseña? Recupérala aquí. Escribe tu correo y te llegará un enlace de un solo uso para crear una contraseña nueva. Revisa también Spam o Promociones.' },
    { t: 'Dispositivos permitidos',
      k: 'celulares equipos computador cuantos telefonos dispositivo limite compartir',
      x: 'Puedes usar MIA con tu correo y tu contraseña en hasta 2 dispositivos. La cuenta es personal y no se puede compartir.' },
    { t: 'Instalar MIA en el celular',
      k: 'instalar pantalla inicio icono acceso directo descargar app agregar',
      x: 'Abre MIA en el navegador de tu celular y elige la opción Agregar a pantalla de inicio. Así queda con su ícono como cualquier otra app.' },
    { t: 'Idioma y moneda',
      k: 'ingles portugues espanol euros dolares pesos cop usd eur cambiar moneda idioma',
      x: 'MIA funciona en español, inglés y portugués, y en pesos colombianos, dólares o euros. Los eliges en la pantalla de entrada y quedan guardados con tu cuenta.' },
    { t: 'Pantalla de Inicio y patrimonio total',
      k: 'inicio patrimonio total disponible saldo suma dinero cuanto tengo resumen',
      x: 'En Inicio ves tu Patrimonio Total Disponible, que es la suma de tus saldos iniciales más tus ingresos menos tus gastos. Debajo ves tus fondos y deudas activas, y el total pendiente por cobrar y por pagar.' },
    { t: 'Registrar un gasto o un ingreso',
      k: 'registrar anotar agregar movimiento gasto ingreso guardar compra pago entrada salida plata',
      x: 'En Inicio, en Registrar Movimiento General: elige Gasto o Ingreso, escoge el medio de pago, es decir la cuenta, la fecha en formato año guion mes guion día, el rubro o categoría, el concepto y el valor. Pulsa Guardar Movimiento y listo.' },
    { t: 'Categorías de gastos e ingresos',
      k: 'rubros categorias alimentacion transporte salud educacion ocio servicios salario ventas otros',
      x: 'Las categorías de gasto son: Alimentación, Transporte, Servicios y Hogar, Ocio y Salidas, Salud, Educación, Préstamos a Clientes, Pago a Terceros y Otros Gastos. Las de ingreso son: Salario o Nómina, Ventas o Negocio, Abono de Terceros, Préstamo de Terceros y Otros Ingresos.' },
    { t: 'Editar o eliminar un movimiento',
      k: 'editar corregir modificar borrar eliminar movimiento error equivoque cambiar valor',
      x: 'En Movimientos Recientes puedes editar un movimiento para corregir concepto, valor, fecha, tipo, cuenta o categoría. También puedes eliminarlo, y la app te pide confirmar antes de borrarlo.' },
    { t: 'Cuentas y saldos iniciales',
      k: 'cuentas saldo inicial efectivo bancolombia nequi banco billetera modificar saldo actual',
      x: 'En la pestaña Cuentas defines el dinero con el que arrancas en cada cuenta. MIA trae Efectivo en Mano, Bancolombia y Nequi. Cada cuenta muestra su saldo inicial y su saldo actual, y con el botón Modificar cambias el saldo inicial y su fecha. Más abajo consultas sus reportes y exportas su historial.' },
    { t: 'Crear una cuenta nueva',
      k: 'crear nueva cuenta agregar banco tarjeta ahorros billetera',
      x: 'En la pestaña Cuentas pulsa Crear Cuenta. Escribe el nombre, elige el tipo, por ejemplo Banco, y el saldo inicial. Pulsa guardar y la cuenta aparece para usarla al registrar movimientos.' },
    { t: 'Cuentas por cobrar y por pagar',
      k: 'cxc cxp cobrar pagar deudas terceros deben debo prestamo cliente nit cedula',
      x: 'En la pestaña CxC / CxP gestionas a terceros. Cuentas por Cobrar es lo que otros te deben, y Cuentas por Pagar es lo que tú debes. Para registrar una, escribe la cédula o NIT del tercero, que es la llave principal, su nombre, el concepto, el saldo, la fecha de vencimiento, la cuenta y una observación. Luego pulsa Guardar Cuenta por Cobrar o Guardar Cuenta por Pagar.' },
    { t: 'Registrar abonos o pagos de una deuda',
      k: 'abono abonar pagar deuda cobrar cobro pago tercero parcial saldo pendiente',
      x: 'Registra el abono como un movimiento en Inicio. Si alguien te paga lo que te debe, usa Ingreso con la categoría Abono de Terceros. Si tú pagas una deuda, usa Gasto con la categoría Pago a Terceros. Al elegir esas categorías, escribe la cédula o NIT del tercero para que se descuente de su saldo pendiente.' },
    { t: 'Reportes y estado de deudas',
      k: 'reportes cartera edades vencimiento pdf excel csv exportar imprimir fecha corte tercero',
      x: 'En la pestaña Reportes ves el estado de tus deudas y el Reporte Avanzado de Cartera, donde eliges Cuentas por Cobrar o Cuentas por Pagar, un rango de fechas y un tercero específico o Todos. Muestra la cartera por edades de vencimiento. Puedes exportarlo en PDF o en Excel.' },
    { t: 'Empezar de cero y borrar movimientos',
      k: 'reiniciar borrar todo limpiar resetear empezar nuevo vaciar datos',
      x: 'En la pestaña Cuentas está el botón Reiniciar datos de este celular. Te pregunta si deseas borrar todos tus movimientos y empezar en limpio. Úsalo solo si estás seguro, porque no se puede deshacer.' },
    { t: 'Salir de la app',
      k: 'salir cerrar sesion logout desconectar',
      x: 'Toca el botón Salir arriba a la derecha para cerrar tu sesión.' },
    { t: 'Dónde se guardan mis datos',
      k: 'datos guardados seguridad privacidad nube perder informacion copia respaldo',
      x: 'Tu información se guarda en tu cuenta de MIA, no solo en el celular, y la ves igual al entrar desde tus dispositivos. Cada persona solo ve sus propios datos.' },
    { t: 'Garantía y reembolso',
      k: 'garantia reembolso reembolsar devolucion devolver devuelvan devuelva devuelvas dinero cancelar compra hotmart 7 dias',
      x: 'MIA tiene garantía de 7 días. Si pides el reembolso en Hotmart dentro de ese plazo, tu acceso a la app se desactiva.' },
    { t: 'Bonos incluidos',
      k: 'bonos regalo guias manual ahorro gastos hormiga inversiones pdf',
      x: 'Tu compra incluye 4 bonos: el manual de usuario, la guía para mejorar el ahorro, la guía para eliminar gastos hormiga y la guía para mejorar inversiones con ahorros.' },
    { t: 'Soporte',
      k: 'soporte ayuda contacto problema falla error escribir correo hablar persona humano',
      x: 'Si necesitas ayuda de una persona, escríbenos a soporte arroba ingetef punto com. Cuéntanos qué pasó y desde qué dispositivo entras.',
      xt: 'Si necesitas ayuda de una persona, escríbenos a soporte@ingetef.com. Cuéntanos qué pasó y desde qué dispositivo entras.' },
    { t: 'Consejos de dinero e inversión',
      k: 'consejo invertir inversion recomendar recomiendas accion acciones bolsa cripto ahorrar cuanto debo comprar',
      x: 'Yo te explico cómo usar la app. No doy consejos financieros ni de inversión personalizados. Para eso consulta a un asesor profesional. Sí puedo ayudarte a registrar y ordenar tus cuentas para que tengas claros tus números.' }
  ];
  var SALUDO = '¡Hola! Soy MIA, tu ayuda en la app. Tócame cuando quieras preguntarme algo.';
  var NO_ENCONTRE = 'No encontré eso en el manual. Prueba con otras palabras, o escríbenos a soporte arroba ingetef punto com.';
  var NO_ENCONTRE_T = 'No encontré eso en el manual. Prueba con otras palabras, o escríbenos a soporte@ingetef.com.';
  var LOGO = 'mia-logo-dorado.png';

  /* ===== 2. BÚSQUEDA ===== */
  function norm(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s]/g, ' ');
  }
  var PARO = ' de la el los las un una unos unas y o en a al del que como para por con mi me mis es se lo le su sus esta este eso esa tengo puedo quiero hacer donde cual cuales cuanto cuantos hay ser ver tu tus yo '.split(' ');
  function raiz(w) { return w.length > 4 ? w.replace(/(es|s|ar|er|ir|ando|iendo|ado|ido|ion|ciones)$/, '') : w; }
  function tokens(s) {
    return norm(s).split(/\s+/).filter(function (w) { return w.length > 2 && PARO.indexOf(w) < 0; }).map(raiz);
  }
  var indice = MANUAL.map(function (m) {
    return { m: m, ti: tokens(m.t), ki: tokens(m.k), xi: tokens(m.x) };
  });
  function buscar(pregunta) {
    var q = tokens(pregunta);
    if (!q.length) return [];
    var res = [];
    indice.forEach(function (it) {
      var p = 0;
      q.forEach(function (w) {
        if (it.ti.indexOf(w) >= 0) p += 4;
        if (it.ki.indexOf(w) >= 0) p += 3;
        if (it.xi.indexOf(w) >= 0) p += 1;
      });
      if (p > 0) res.push({ m: it.m, p: p });
    });
    res.sort(function (a, b) { return b.p - a.p; });
    return res;
  }

  /* ===== 3. VOZ ===== */
  var silenciado = false;
  try { silenciado = localStorage.getItem('mia_ayuda_mudo') === '1'; } catch (e) {}

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
      u.onstart = function () { muneco.classList.add('hablando'); };
      u.onend = u.onerror = function () { muneco.classList.remove('hablando'); };
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  function callar() {
    try { window.speechSynthesis.cancel(); } catch (e) {}
    if (muneco) muneco.classList.remove('hablando');
  }

  /* ===== 4. ESTILOS ===== */
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
    '#mia-panel{display:none;width:min(340px,calc(100vw - 20px));max-height:72vh;overflow:auto;background:#0A1F17;border:1px solid #D4A63A;border-radius:16px;padding:14px;margin-bottom:6px;color:#fff;box-shadow:0 6px 24px rgba(0,0,0,.45)}',
    '#mia-panel.abierto{display:block}',
    '#mia-panel h2{margin:0;font-size:15px;font-weight:600;color:#D4A63A}',
    '#mia-panel .barra{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}',
    '#mia-panel .fila{display:flex;gap:6px;margin-bottom:8px}',
    '#mia-q{flex:1;min-width:0;height:40px;border-radius:12px;border:1px solid rgba(212,166,58,.6);background:#12362A;color:#fff;padding:0 12px;font-size:16px;outline:none}',
    '#mia-q::placeholder{color:#8DB5A3}',
    '#mia-q:focus{border-color:#D4A63A}',
    '#mia-panel button.btn{height:40px;padding:0 14px;border-radius:12px;border:0;background:#D4A63A;color:#0A1F17;font-weight:600;font-size:14px;cursor:pointer}',
    '#mia-panel button.mic{width:40px;padding:0;background:#12362A;color:#D4A63A;border:1px solid rgba(212,166,58,.6);font-size:16px}',
    '#mia-panel button.mic.escuchando{background:#D4A63A;color:#0A1F17}',
    '#mia-panel .sub{margin:0 0 8px;font-size:12px;color:#9FC4B2}',
    '#mia-panel button.chip{display:block;width:100%;text-align:left;margin:0 0 6px;padding:9px 12px;background:#12362A;color:#fff;border:1px solid rgba(212,166,58,.4);border-radius:12px;font-size:13px;cursor:pointer}',
    '#mia-panel button.chip:active{background:#1b4a39}',
    '#mia-panel button.mini{background:none;border:0;color:#D4A63A;font-size:13px;cursor:pointer;padding:4px 6px}',
    '#mia-respuesta{display:none;background:#fff;color:#0F2A20;border-radius:12px;padding:12px;margin:0 0 10px;font-size:14px;line-height:1.5}',
    '#mia-respuesta.visible{display:block}',
    '#mia-respuesta .t{font-size:12px;color:#2F6B52;margin:0 0 4px;font-weight:600}',
    '#mia-respuesta .c{white-space:pre-line}',
    '#mia-panel .rel{margin:0 0 6px;font-size:12px;color:#9FC4B2}',
    '#mia-aviso{margin:8px 0 0;font-size:11px;color:#9FC4B2}'
  ].join('');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  /* ===== 5. MUÑECO ===== */
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

  /* ===== 6. INTERFAZ ===== */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var cont = document.createElement('div');
  cont.id = 'mia-ayuda';
  cont.innerHTML = ''
    + '<div id="mia-panel" role="dialog" aria-label="Ayuda de MIA">'
    + '<div class="barra"><h2>Ayuda de MIA</h2><span>'
    + '<button class="mini" id="mia-mudo" type="button"></button>'
    + '<button class="mini" id="mia-cerrar" type="button" aria-label="Cerrar">Cerrar</button></span></div>'
    + '<form class="fila" id="mia-form" autocomplete="off">'
    + '<input id="mia-q" type="text" maxlength="200" placeholder="Escribe tu pregunta…" aria-label="Escribe tu pregunta">'
    + (SR ? '<button class="btn mic" id="mia-mic" type="button" aria-label="Preguntar con la voz">🎤</button>' : '')
    + '<button class="btn" type="submit">Preguntar</button></form>'
    + '<div id="mia-respuesta" aria-live="polite"></div>'
    + '<p class="sub" id="mia-sub">O toca un tema del manual:</p>'
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
  var campo = document.getElementById('mia-q');

  function mostrar(item, esTexto) {
    resp.innerHTML = '<p class="t"></p><div class="c"></div><div id="mia-rel"></div>';
    resp.firstChild.textContent = item ? item.t : 'Sin resultado';
    resp.childNodes[1].textContent = item ? (item.xt || item.x) : NO_ENCONTRE_T;
    resp.classList.add('visible');
    return resp.lastChild;
  }
  function relacionados(box, lista2) {
    if (!lista2.length) return;
    var p = document.createElement('p');
    p.className = 'rel';
    p.textContent = 'Temas relacionados:';
    box.appendChild(p);
    lista2.forEach(function (r) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.textContent = r.m.t;
      b.addEventListener('click', function () { responder(r.m); });
      box.appendChild(b);
    });
  }
  function responder(m) {
    mostrar(m);
    hablar(m.x);
    resp.scrollIntoView({ block: 'nearest' });
  }
  function preguntar(texto) {
    texto = String(texto || '').trim();
    if (!texto) { campo.focus(); return; }
    var r = buscar(texto);
    if (!r.length) {
      mostrar(null);
      hablar(NO_ENCONTRE);
      return;
    }
    var box = mostrar(r[0].m);
    hablar(r[0].m.x);
    relacionados(box, r.slice(1, 3));
    resp.scrollIntoView({ block: 'nearest' });
  }

  MANUAL.forEach(function (m) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.textContent = m.t;
    b.addEventListener('click', function () { responder(m); });
    lista.appendChild(b);
  });

  document.getElementById('mia-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    preguntar(campo.value);
    campo.blur();
  });

  var btnMic = document.getElementById('mia-mic');
  if (btnMic && SR) {
    btnMic.addEventListener('click', function () {
      try {
        callar();
        var rec = new SR();
        rec.lang = 'es-CO';
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        btnMic.classList.add('escuchando');
        rec.onresult = function (e) {
          var t = e.results[0][0].transcript;
          campo.value = t;
          preguntar(t);
        };
        rec.onend = rec.onerror = function () { btnMic.classList.remove('escuchando'); };
        rec.start();
      } catch (e) { btnMic.classList.remove('escuchando'); }
    });
  }

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
    hablar('¿En qué te ayudo? Escribe tu pregunta o toca un tema.');
  }
  function cerrar() { panel.classList.remove('abierto'); callar(); }
  muneco.addEventListener('click', function () {
    if (panel.classList.contains('abierto')) cerrar(); else abrir();
  });
  document.getElementById('mia-cerrar').addEventListener('click', cerrar);

  /* ===== 7. SALUDO AL ENTRAR (una vez por sesión, tras el primer toque) ===== */
  var saludado = false;
  function saludar() {
    if (saludado) return;
    saludado = true;
    try { if (sessionStorage.getItem('mia_ayuda_saludo') === '1') return; sessionStorage.setItem('mia_ayuda_saludo', '1'); } catch (e) {}
    hablar(SALUDO);
  }
  document.addEventListener('pointerdown', function primer(ev) {
    if (cont.contains(ev.target)) return;
    document.removeEventListener('pointerdown', primer, true);
    saludar();
  }, true);

  window.MIA_AYUDA = { saludar: saludar, abrir: abrir, cerrar: cerrar, preguntar: preguntar };
})();
