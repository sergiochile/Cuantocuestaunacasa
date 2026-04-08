/* ============================================================
   app.js — ¿Cuánto cuesta una casa en Chile?
   Versión optimizada: JSDoc, manejo defensivo de errores,
   patrones modernos, sin código muerto.
   ============================================================ */

'use strict';

/* ── DATOS DE REGIONES ──────────────────────────────────────
   Precios por m² en UF según tipo de vivienda (CChC Q3 2025)
   ─────────────────────────────────────────────────────────── */
const REGIONES = {
  RM:  { nombre: 'Región Metropolitana',  depto: 77, casa: 63, usada: 62 },
  ANT: { nombre: 'Antofagasta',           depto: 68, casa: 52, usada: 50 },
  VAL: { nombre: 'Valparaíso',            depto: 58, casa: 48, usada: 45 },
  BIO: { nombre: 'Biobío / Concepción',   depto: 55, casa: 45, usada: 42 },
  COQ: { nombre: 'Coquimbo / La Serena',  depto: 56, casa: 46, usada: 43 },
  TAR: { nombre: 'Tarapacá',              depto: 52, casa: 42, usada: 40 },
  ARI: { nombre: 'Arica y Parinacota',    depto: 45, casa: 38, usada: 35 },
  ATA: { nombre: 'Atacama',               depto: 48, casa: 40, usada: 37 },
  OHI: { nombre: "O'Higgins",             depto: 44, casa: 38, usada: 35 },
  MAU: { nombre: 'Maule',                 depto: 40, casa: 34, usada: 30 },
  NUB: { nombre: 'Ñuble',                 depto: 38, casa: 32, usada: 28 },
  ARA: { nombre: 'La Araucanía',          depto: 36, casa: 30, usada: 27 },
  RIO: { nombre: 'Los Ríos',              depto: 37, casa: 31, usada: 28 },
  LAG: { nombre: 'Los Lagos',             depto: 38, casa: 32, usada: 29 },
  AYS: { nombre: 'Aysén',                 depto: 35, casa: 30, usada: 27 },
  MAG: { nombre: 'Magallanes',            depto: 40, casa: 34, usada: 31 },
};

/* ── DEFINICIONES DE SUBSIDIOS ──────────────────────────────
   Fuente: MINVU — https://www.minvu.gob.cl/beneficios/vivienda/
   Postulación: https://postulacionenlinea.minvu.cl
   Actualizado: 2026
   ─────────────────────────────────────────────────────────── */
const SUBSIDIOS_DEF = [

  /* ── DS49 — Fondo Solidario de Elección de Vivienda ──────── */
  {
    id: 'ds49',
    nombre: 'DS49 — Fondo Solidario de Elección de Vivienda',
    icono: '🏘️',
    maxIngresoUF: 25,  // Proxy orientativo RSH ≤ 40% (sin crédito requerido)
    maxPrecioUF: 1400, // Varía por modalidad; puede superar este monto en proyectos
    montoUF: 350,      // Monto orientativo; el subsidio cubre gran parte del precio
    aplicar(d) {
      return d.ingresoUF <= this.maxIngresoUF && d.primera;
    },
    razones(d) {
      const rs = [];
      if (d.ingresoUF > this.maxIngresoUF)
        rs.push(`Tu ingreso (${d.ingresoUF.toFixed(1)} UF/mes) supera el perfil del DS49 — orientado a familias con RSH en el 40% de mayor vulnerabilidad`);
      if (!d.primera)
        rs.push('El DS49 requiere no ser propietario de vivienda');
      return rs;
    },
  },

  /* ── DS1 Tramo 1 — Sectores Medios ───────────────────────── */
  {
    id: 'ds1t1',
    nombre: 'DS1 Tramo 1 — Sectores Medios',
    icono: '🏠',
    maxIngresoUF: 37,
    maxPrecioUF: 1100,
    montoUF: 130,
    aplicar(d) {
      return d.ingresoUF <= this.maxIngresoUF
        && d.precioUF <= this.maxPrecioUF
        && d.primera;
    },
    razones(d) {
      const rs = [];
      if (d.ingresoUF > this.maxIngresoUF)
        rs.push(`Tu ingreso (${d.ingresoUF.toFixed(1)} UF/mes) supera los 37 UF del Tramo 1 — revisa si calificas al Tramo 2`);
      if (d.precioUF > this.maxPrecioUF)
        rs.push(`La vivienda (${Math.round(d.precioUF)} UF) supera las ${this.maxPrecioUF} UF del Tramo 1 — revisa el Tramo 2 o 3`);
      if (!d.primera)
        rs.push('El DS1 exige primera vivienda');
      return rs;
    },
  },

  /* ── DS1 Tramo 2 ──────────────────────────────────────────── */
  {
    id: 'ds1t2',
    nombre: 'DS1 Tramo 2 — Sectores Medios',
    icono: '🏠',
    maxIngresoUF: 60,
    maxPrecioUF: 1600,
    montoUF: 90,
    aplicar(d) {
      return d.ingresoUF > 37
        && d.ingresoUF <= this.maxIngresoUF
        && d.precioUF <= this.maxPrecioUF
        && d.primera;
    },
    razones(d) {
      const rs = [];
      if (d.ingresoUF <= 37)
        rs.push(`Tu ingreso (${d.ingresoUF.toFixed(1)} UF/mes) está bajo los 37 UF del Tramo 2 — revisa el Tramo 1`);
      else if (d.ingresoUF > this.maxIngresoUF)
        rs.push(`Tu ingreso (${d.ingresoUF.toFixed(1)} UF/mes) supera los 60 UF del Tramo 2 — revisa el Tramo 3`);
      if (d.precioUF > this.maxPrecioUF)
        rs.push(`La vivienda (${Math.round(d.precioUF)} UF) supera las ${this.maxPrecioUF} UF del Tramo 2`);
      if (!d.primera)
        rs.push('El DS1 exige primera vivienda');
      return rs;
    },
  },

  /* ── DS1 Tramo 3 ──────────────────────────────────────────── */
  {
    id: 'ds1t3',
    nombre: 'DS1 Tramo 3 — Sectores Medios',
    icono: '🏠',
    maxIngresoUF: 78,
    maxPrecioUF: 2200,
    montoUF: 60,
    aplicar(d) {
      return d.ingresoUF > 60
        && d.ingresoUF <= this.maxIngresoUF
        && d.precioUF <= this.maxPrecioUF
        && d.primera;
    },
    razones(d) {
      const rs = [];
      if (d.ingresoUF <= 60)
        rs.push(`Tu ingreso (${d.ingresoUF.toFixed(1)} UF/mes) está bajo los 60 UF del Tramo 3 — revisa el Tramo 2`);
      else if (d.ingresoUF > this.maxIngresoUF)
        rs.push(`Tu ingreso (${d.ingresoUF.toFixed(1)} UF/mes) supera los 78 UF — no hay subsidio DS1 para este nivel de ingresos`);
      if (d.precioUF > this.maxPrecioUF)
        rs.push(`La vivienda (${Math.round(d.precioUF)} UF) supera las ${this.maxPrecioUF} UF del Tramo 3`);
      if (!d.primera)
        rs.push('El DS1 exige primera vivienda');
      return rs;
    },
  },

  /* ── FOGAES — Garantía Estatal para Pie del 10% ──────────── */
  {
    id: 'fogaes',
    nombre: 'FOGAES — Garantía Estatal (Pie 10%)',
    icono: '🔑',
    maxPrecioUF: 4500,
    esFogaes: true,
    aplicar(d) { return d.precioUF <= this.maxPrecioUF; },
    razones(d) {
      const rs = [];
      if (d.precioUF > this.maxPrecioUF)
        rs.push(`La vivienda (${Math.round(d.precioUF)} UF) supera el límite de ${this.maxPrecioUF} UF de FOGAES`);
      return rs;
    },
  },

  /* ── Ley 21.748 — Subsidio a la Tasa de Interés ─────────── */
  {
    id: 'ley21748',
    nombre: 'Ley 21.748 — Subsidio a la Tasa de Interés',
    icono: '📉',
    maxPrecioUF: 4000,
    esTasa: true,
    tasaDescuento: 0.6,
    soloNueva: true,
    aplicar(d) {
      return d.precioUF <= this.maxPrecioUF
        && (d.tipo === 'depto' || d.tipo === 'casa');
    },
    razones(d) {
      const rs = [];
      if (d.precioUF > this.maxPrecioUF)
        rs.push(`La vivienda (${Math.round(d.precioUF)} UF) supera las ${this.maxPrecioUF} UF máximas`);
      if (d.tipo === 'usada')
        rs.push('Aplica solo a vivienda nueva');
      return rs;
    },
  },

  /* ── DS52 — Subsidio de Arriendo (informativo) ───────────── */
  {
    id: 'ds52',
    nombre: 'DS52 — Subsidio de Arriendo',
    icono: '🏡',
    esInformativo: true,
    esArriendo: true,
    aplicar(d) { return d.ingresoUF > 0 && d.ingresoUF <= 60; },
    razones(d) {
      if (d.ingresoUF > 60)
        return ['Programa de arriendo — consulta tu elegibilidad según RSH en MINVU'];
      return [];
    },
  },

  /* ── DS27 — Mejoramiento de Vivienda y Barrios (informativo) */
  {
    id: 'ds27',
    nombre: 'DS27 — Mejoramiento de Vivienda y Barrios',
    icono: '🔧',
    esInformativo: true,
    esMejoramiento: true,
    aplicar(d) { return !d.primera; },
    razones(d) {
      if (d.primera)
        return ['Este programa mejora una vivienda existente — no aplica para comprar primera vivienda'];
      return [];
    },
  },

  /* ── DS10 — Habitabilidad Rural (informativo) ────────────── */
  {
    id: 'ds10',
    nombre: 'DS10 — Habitabilidad Rural',
    icono: '🌾',
    esInformativo: true,
    esRural: true,
    aplicar() { return false; },
    razones() {
      return ['Exclusivo para familias en zonas rurales — consulta en la SEREMI de tu región'];
    },
  },
];

/* ── Fechas de postulación 2026 (fuente: MINVU) ─────────────
   Verificar en https://www.minvu.gob.cl/beneficios/vivienda/
   ─────────────────────────────────────────────────────────── */
const FECHAS_POSTULACION_2026 = [
  { id: 'ds49',  programa: 'DS49 — Fondo Solidario',          llamados: 'Julio · Octubre',                                color: '#16a34a' },
  { id: 'ds1',   programa: 'DS1 — Sectores Medios (T1/T2/T3)', llamados: 'Mayo · Noviembre',                               color: '#2563eb' },
  { id: 'ds52',  programa: 'DS52 — Subsidio de Arriendo',      llamados: 'Mayo–Junio · Agosto (adulto mayor/discapacidad)', color: '#9333ea' },
  { id: 'ds10',  programa: 'DS10 — Habitabilidad Rural',        llamados: 'Marzo · Mayo · Julio · Sept. · Dic.',            color: '#ca8a04' },
  { id: 'ds27',  programa: 'DS27 — Mejoramiento de Vivienda',   llamados: 'Abril–Mayo (según línea)',                       color: '#ea580c' },
];

/* ── ESTADO GLOBAL ──────────────────────────────────────────── */
let UF_VALOR = 38500;
let _resultadoCalculado = false;

/* ── HELPERS CLP ────────────────────────────────────────────── */

/**
 * Lee un input formateado con puntos de miles y devuelve un entero.
 * @param {string} id - ID del elemento input
 * @returns {number} Valor entero, 0 si está vacío o no existe
 */
function parseCLP(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const raw = el.value.replace(/\./g, '').replace(/[^0-9]/g, '');
  return raw ? parseInt(raw, 10) : 0;
}

/**
 * Formatea un input numérico con separadores de miles (locale es-CL).
 * @param {string} id - ID del elemento input
 */
function formatCLP(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const raw = el.value.replace(/\./g, '').replace(/[^0-9]/g, '');
  if (!raw) { el.value = ''; return; }
  el.value = parseInt(raw, 10).toLocaleString('es-CL');
}

/** Formateo rápido de número entero */
const fmt = n => Math.round(n).toLocaleString('es-CL');

/* ── CÁLCULOS FINANCIEROS ───────────────────────────────────── */

/**
 * Calcula la cuota mensual de un crédito hipotecario (sistema francés).
 * @param {number} montoUF - Monto del crédito en UF
 * @param {number} tasaAnual - Tasa anual en porcentaje (ej: 4.1 para 4.1%)
 * @param {number} años - Plazo en años
 * @returns {number} Cuota mensual en CLP
 */
function cuotaMensual(montoUF, tasaAnual, años) {
  const r = (tasaAnual / 100) / 12;
  const n = años * 12;
  if (r === 0) return (montoUF * UF_VALOR) / n;
  return montoUF * UF_VALOR * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/**
 * Calcula el máximo crédito aprobable según sueldo.
 * Usa la relación cuota/ingreso máxima (por defecto 30%).
 * @param {number} sueldoTotal - Ingreso total en CLP
 * @param {number} tasaAnual - Tasa anual en %
 * @param {number} años - Plazo en años
 * @param {number} [pctMax=0.30] - Razón cuota/ingreso máxima permitida
 * @returns {number} Máximo crédito en CLP
 */
function maxCreditoPorSueldo(sueldoTotal, tasaAnual, años, pctMax = 0.30) {
  const r = (tasaAnual / 100) / 12;
  const n = años * 12;
  const cuotaMax = sueldoTotal * pctMax;
  if (r === 0) return cuotaMax * n;
  return cuotaMax * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
}

/* ── UF (fetch + caché localStorage) ───────────────────────── */
const LS_UF    = 'ccuc_uf_v';
const LS_UF_TS = 'ccuc_uf_ts';
const UF_TTL   = 3_600_000; // 1 hora en ms

async function cargarUF() {
  try {
    const ts     = parseInt(localStorage.getItem(LS_UF_TS) || '0', 10);
    const cached = parseFloat(localStorage.getItem(LS_UF) || '0');

    if (cached > 0 && Date.now() - ts < UF_TTL) {
      UF_VALOR = cached;
      _mostrarUF(UF_VALOR);
      if (_resultadoCalculado) { calcular(); renderDesigualdad(); }
      return;
    }

    const r = await fetch('https://mindicador.cl/api/uf');
    const d = await r.json();
    UF_VALOR = d.serie[0].valor;
    try {
      localStorage.setItem(LS_UF, UF_VALOR);
      localStorage.setItem(LS_UF_TS, Date.now());
    } catch (_) { /* storage lleno o bloqueado */ }

    _mostrarUF(UF_VALOR);
    if (_resultadoCalculado) { calcular(); renderDesigualdad(); }

  } catch (_) {
    const cached = parseFloat(localStorage.getItem(LS_UF) || '0');
    if (cached > 0) UF_VALOR = cached;
    document.getElementById('uf-valor').textContent =
      UF_VALOR.toLocaleString('es-CL') + ' (ref.)';
  }
}

function _mostrarUF(valor) {
  document.getElementById('uf-valor').textContent =
    valor.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ── WIZARD ─────────────────────────────────────────────────── */

function showScreen(n) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('activa'));
  const target = document.getElementById('screen-' + n);
  target.classList.add('activa');

  [1, 2, 3].forEach(i => {
    const it = document.getElementById('ws' + i);
    it.classList.remove('activo', 'done');
    it.removeAttribute('aria-current');
    if (i < n)       { it.classList.add('done'); }
    else if (i === n) { it.classList.add('activo'); it.setAttribute('aria-current', 'step'); }
  });
  [1, 2].forEach(i =>
    document.getElementById('ws-l' + i).classList.toggle('done', i < n)
  );

  window.scrollTo({ top: 0, behavior: 'smooth' });
  requestAnimationFrame(() => {
    const h = target.querySelector('h1, h2');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  });
}

function irAPaso1() { showScreen(1); }

function irAPaso2() {
  const sueldo = parseCLP('sueldo');
  if (sueldo <= 0) {
    const el = document.getElementById('sueldo');
    el.style.borderColor = 'var(--rojo)';
    el.focus();
    el.placeholder = 'Ingresa tu sueldo para continuar';
    setTimeout(() => { el.style.borderColor = ''; el.placeholder = 'Ej: 900.000'; }, 3000);
    return;
  }
  ['primera', 'casado'].forEach(id => {
    const el = document.getElementById(id);
    document.getElementById('btn-' + id).classList.toggle('activo', el.checked);
  });
  // Sincronizar región: paso 1 → paso 2
  const r1 = document.getElementById('region1');
  const r2 = document.getElementById('region');
  if (r1 && r2) r2.value = r1.value;

  showScreen(2);
}

function irAResultados() {
  showScreen(3);
  calcular();
  renderDesigualdad();
  const sl = document.getElementById('arriendo-slider');
  if (sl && !sl.dataset.tocado) {
    const reg   = document.getElementById('region').value;
    const tipo  = document.getElementById('tipo').value;
    const m2    = parseFloat(document.getElementById('m2').value) || 55;
    const ufKey = tipo === 'depto' ? 'depto' : tipo === 'casa' ? 'casa' : 'usada';
    const sug   = Math.round(REGIONES[reg][ufKey] * m2 * UF_VALOR * 0.042 / 12 / 10000) * 10000;
    sl.value    = Math.min(Math.max(sug, 100000), 2000000);
    actualizarSliderArriendo();
  }
}

/* ── TABS ────────────────────────────────────────────────────── */
function switchTab(panelId, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('activo'));
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('activo');
    b.setAttribute('aria-selected', 'false');
  });
  document.getElementById(panelId).classList.add('activo');
  btn.classList.add('activo');
  btn.setAttribute('aria-selected', 'true');
}

/* ── CALCULAR ────────────────────────────────────────────────── */
function calcular() {
  const reg            = document.getElementById('region').value;
  const tipo           = document.getElementById('tipo').value;
  const sueldo         = parseCLP('sueldo');
  const ahorroHoy      = parseCLP('ahorro');
  const codeudor       = parseCLP('codeudor');
  const primera        = document.getElementById('primera').checked;
  const m2             = parseFloat(document.getElementById('m2').value) || 55;
  const tasa           = parseFloat(document.getElementById('tasa').value) || 4.1;
  const plazo          = parseFloat(document.getElementById('plazo').value) || 25;
  const piePct         = parseFloat(document.getElementById('pie').value) || 20;

  const sueldoTotal = sueldo + codeudor;
  const datos       = REGIONES[reg];
  const ufKey       = tipo === 'depto' ? 'depto' : tipo === 'casa' ? 'casa' : 'usada';
  const ufM2        = datos[ufKey];
  const precioUF    = ufM2 * m2;
  const precioClp   = precioUF * UF_VALOR;
  const ingresoUF   = sueldoTotal / UF_VALOR;
  const pieUF       = precioUF * piePct / 100;
  const pieClp      = pieUF * UF_VALOR;
  const credito     = precioUF - pieUF;
  const cuota       = cuotaMensual(credito, tasa, plazo);
  const pct         = sueldoTotal > 0 ? (cuota / sueldoTotal) * 100 : 0;
  const maxCredClp  = maxCreditoPorSueldo(sueldoTotal, tasa, plazo);
  const maxCredUF   = maxCredClp / UF_VALOR;
  const maxPrecioUF = maxCredUF / (1 - piePct / 100);
  const maxPrecioClp = maxPrecioUF * UF_VALOR;

  const ctx = {
    ingresoUF,
    precioUF,
    primera,
    tipo,
    tipoOk: s => !s.soloNueva || tipo !== 'usada',
  };
  const subsAplican = SUBSIDIOS_DEF.map(s => ({ ...s, aplica: s.aplicar(ctx) }));

  /* — Resumen top — */
  const tipoLabel = tipo === 'depto' ? 'Depto.' : tipo === 'casa' ? 'Casa' : 'Usada';
  document.getElementById('resumen-top').innerHTML = `
    <div class="resumen-top-item">
      <span class="resumen-top-label">Sueldo</span>
      <span class="resumen-top-val">$${fmt(sueldoTotal)}</span>
    </div>
    <div class="resumen-top-sep"></div>
    <div class="resumen-top-item">
      <span class="resumen-top-label">Vivienda</span>
      <span class="resumen-top-val">${tipoLabel} ${m2}m² · ${datos.nombre.split('/')[0].trim()}</span>
    </div>
    <div class="resumen-top-sep"></div>
    <div class="resumen-top-item">
      <span class="resumen-top-label">Precio</span>
      <span class="resumen-top-val">$${fmt(precioClp)}</span>
    </div>
    <button class="btn-editar" onclick="showScreen(1)">✎ Editar</button>`;

  document.getElementById('label-region-header').innerHTML =
    `${datos.nombre} · <strong>${ufM2} UF/m²</strong> · CChC Q3 2025`;

  /* — Barra — */
  document.getElementById('barra-pct').textContent = sueldoTotal > 0 ? pct.toFixed(1) + '%' : '—';
  const bar = document.getElementById('barra');
  bar.style.width      = Math.min(pct, 100) + '%';
  bar.style.background = pct <= 30 ? '#1A7A4A' : pct <= 50 ? '#B7780A' : '#C0392B';

  const badge = document.getElementById('semaforo-badge');
  const texto = document.getElementById('texto-semaforo');
  if (sueldoTotal <= 0) {
    badge.className = 'pill pill-amarillo'; badge.textContent = 'Sin sueldo'; texto.textContent = '';
  } else if (pct <= 30) {
    badge.className = 'pill pill-verde'; badge.textContent = 'Acceso posible';
    texto.textContent = `La cuota es el ${pct.toFixed(1)}% de tus ingresos, dentro del límite del 30%.`;
  } else if (pct <= 50) {
    badge.className = 'pill pill-amarillo'; badge.textContent = 'Esfuerzo alto';
    texto.textContent = `La cuota representa el ${pct.toFixed(1)}% de tus ingresos. Superas el 30% recomendado.`;
  } else {
    badge.className = 'pill pill-rojo'; badge.textContent = 'Difícil acceso';
    texto.textContent = `La cuota es el ${pct.toFixed(1)}% de tus ingresos. Considera subsidios o codeudor.`;
  }

  /* — Métricas — */
  document.getElementById('m-cuota').textContent      = '$' + fmt(cuota);
  document.getElementById('m-cuota-sub').textContent  = `${plazo} años · ${tasa}% tasa`;
  document.getElementById('m-precio').textContent     = '$' + fmt(precioClp);
  document.getElementById('m-precio-uf').textContent  = fmt(precioUF) + ' UF total';
  document.getElementById('m-pie').textContent        = '$' + fmt(pieClp);
  document.getElementById('m-pie-sub').textContent    = `${fmt(pieUF)} UF · ${piePct}% del precio`;
  document.getElementById('m-maxcredito').textContent = '$' + fmt(maxCredClp);
  document.getElementById('m-maxcredito-sub').textContent = 'max vivienda $' + fmt(maxPrecioClp);

  /* — Aviso ahorro — */
  const avisoAhorro = document.getElementById('aviso-ahorro');
  if (sueldoTotal > 0) {
    avisoAhorro.style.display = 'block';
    const falta     = pieClp - ahorroHoy;
    if (ahorroHoy >= pieClp) {
      avisoAhorro.className = 'aviso aviso-verde';
      avisoAhorro.innerHTML = `✅ <strong>Tu ahorro cubre el pie completo</strong> y te sobran $${fmt(ahorroHoy - pieClp)}. Puedes comprar si el banco aprueba el crédito.`;
    } else if (falta > 0) {
      const mesesFalta = sueldoTotal * 0.20 > 0 ? Math.ceil(falta / (sueldoTotal * 0.20)) : 0;
      avisoAhorro.className = 'aviso aviso-neutro';
      avisoAhorro.innerHTML = `📊 Te faltan <strong>$${fmt(falta)}</strong> para el pie. Ahorrando el 20% de tu sueldo, los juntas en aprox. <strong>${mesesFalta} meses</strong>.`;
    }
  } else {
    avisoAhorro.style.display = 'none';
  }

  /* — Resto de bloques — */
  const aniosPieCalc = (pieClp - ahorroHoy > 0 && sueldoTotal * 0.20 > 0)
    ? (pieClp - ahorroHoy) / (sueldoTotal * 0.20) / 12
    : 0;

  renderFraseImpacto(sueldoTotal, pct, pieClp, aniosPieCalc, precioClp, datos.nombre, plazo);
  renderEscenarios(precioUF, piePct, tasa, plazo, subsAplican, sueldoTotal, ahorroHoy);
  renderSubsidios(subsAplican, precioUF, tasa, plazo, ctx);
  renderArrVsCompra(precioClp, precioUF, piePct, tasa, plazo, cuota);
  renderTabla(sueldoTotal, piePct, tasa, plazo);
  renderProyeccionIngresos(sueldoTotal, cuota);

  const histSubEl = document.getElementById('hist-sub');
  if (histSubEl) {
    const sfx = reg !== 'RM'
      ? ` — En ${datos.nombre.split('/')[0].trim()}, un depto de 55 m² cuesta hoy <strong>${fmt(datos.depto * 55)} UF</strong> (~$${fmt(datos.depto * 55 * UF_VALOR)}).`
      : '';
    histSubEl.innerHTML = 'Referencia RM · Depto 55 m² en Santiago · Sueldos en ese período subieron ~40%' + sfx;
  }

  // Sincronizar región del agente de chat con la del simulador
  if (typeof _chatAgent !== 'undefined') _chatAgent.region = reg;

  // Mostrar portales de búsqueda
  mostrarBuscadoresPropiedades(reg, Math.round(maxPrecioUF));
  renderConversionResultados();

  _resultadoCalculado = true;
}

/* ── BLOQUE EDAD (campo eliminado — se oculta siempre) ────────── */
function renderBloqueEdad() {
  document.getElementById('bloque-edad')?.style.setProperty('display', 'none');
}

/* ── ESCENARIOS ──────────────────────────────────────────────── */
function renderEscenarios(precioUF, piePct, tasa, plazo, subs, sueldoTotal, ahorroHoy) {
  const grid = document.getElementById('escenarios-grid');

  /* Escenario 1 — sin ayuda */
  const pie1    = precioUF * piePct / 100;
  const cuota1  = cuotaMensual(precioUF - pie1, tasa, plazo);
  const pct1    = sueldoTotal > 0 ? cuota1 / sueldoTotal * 100 : 0;
  const tieneEsc1 = ahorroHoy >= pie1 * UF_VALOR;

  /* Escenario 2 — con subsidio DS */
  const subDS   = subs.find(s => s.aplica && ['ds19','ds1t1','ds1t2','ds1t3'].includes(s.id));
  const subBono = subs.find(s => s.id === 'bonopie' && s.aplica);
  let cuota2 = null, pct2 = 0, pie2 = null, pieClp2 = null, pieClp2Ef = null;
  if (subDS) {
    const prU   = Math.max(precioUF - subDS.montoUF, 0);
    pie2        = prU * piePct / 100;
    pieClp2     = pie2 * UF_VALOR;
    pieClp2Ef   = Math.max(pieClp2 - (subBono ? subBono.montoUF * UF_VALOR : 0), 0);
    cuota2      = cuotaMensual(prU - pie2, tasa, plazo);
    pct2        = sueldoTotal > 0 ? cuota2 / sueldoTotal * 100 : 0;
  }

  /* Escenario 3 — FOGAES + Ley 21.748 */
  const subFog  = subs.find(s => s.id === 'fogaes'  && s.aplica);
  const subTasa = subs.find(s => s.id === 'ley21748' && s.aplica);
  let cuota3 = null, pct3 = 0, pie3 = null, pieClp3 = null, tasa3 = tasa;
  if (subFog) {
    tasa3    = subTasa ? Math.max(tasa - subTasa.tasaDescuento, 0.5) : tasa;
    pie3     = precioUF * 0.10;
    pieClp3  = pie3 * UF_VALOR;
    cuota3   = cuotaMensual(precioUF - pie3, tasa3, plazo);
    pct3     = sueldoTotal > 0 ? cuota3 / sueldoTotal * 100 : 0;
  }

  /* Determinar "mejor opción" */
  const tieneEsc2 = cuota2 !== null && ahorroHoy >= pieClp2Ef;
  const tieneEsc3 = cuota3 !== null && ahorroHoy >= pieClp3;
  const todasOpciones = [
    { id: 1, cuota: cuota1, acc: tieneEsc1 },
    cuota2 !== null ? { id: 2, cuota: cuota2, acc: tieneEsc2 } : null,
    cuota3 !== null ? { id: 3, cuota: cuota3, acc: tieneEsc3 } : null,
  ].filter(Boolean);
  const accesibles = todasOpciones.filter(o => o.acc);
  const mejor = (accesibles.length > 0 ? accesibles : todasOpciones)
    .slice().sort((a, b) => a.cuota - b.cuota)[0];

  /* Helpers de renderizado */
  const pillPct = pct => {
    if (!pct || sueldoTotal <= 0) return '';
    const cl = pct <= 30 ? 'pill-verde' : pct <= 50 ? 'pill-amarillo' : 'pill-rojo';
    return `<span class="pill ${cl}" style="font-size:11px;padding:2px 9px">${pct.toFixed(1)}%</span>`;
  };

  const veredicto = (pct, pieClpEf, tieneAhorro, noAplica) => {
    if (noAplica) return `<div class="esc-linea" style="margin-top:8px;color:var(--suave2)">No aplica a tu caso</div>`;
    const acc     = pct <= 30 ? '✅ El banco lo aprobaría' : pct <= 50 ? '⚠️ Límite del banco' : '❌ El banco no lo aprobaría';
    const pie_txt = tieneAhorro ? '✅ Tienes el pie' : `📊 Te faltan $${fmt(Math.max(pieClpEf - ahorroHoy, 0))} para el pie`;
    return `<div class="esc-linea" style="margin-top:8px">${acc}</div><div class="esc-linea">${pie_txt}</div>`;
  };

  const buildDetalle = (precioU, pieU, tasaD, cuotaD, pieClpEfD, tieneAhorroD, noAplicaD) => {
    if (noAplicaD || !cuotaD || !pieU) return '';
    const creditoU    = precioU - pieU;
    const creditoClp  = creditoU * UF_VALOR;
    const totalPagado = cuotaD * plazo * 12;
    const totalInteres = Math.round(totalPagado - creditoClp);
    const pctI        = creditoClp > 0 ? Math.round(totalInteres / creditoClp * 100) : 0;
    const faltaPie    = Math.max(pieClpEfD - ahorroHoy, 0);
    const anosPie     = faltaPie > 0 && sueldoTotal * 0.20 > 0
      ? ((faltaPie / (sueldoTotal * 0.20)) / 12).toFixed(1) : null;
    const piePctD     = Math.round(pieU / precioU * 100);
    const row = (k, v) => `<div class="det-fila"><span class="det-k">${k}</span><span class="det-v">${v}</span></div>`;
    const sep = '<hr class="det-sep">';
    return `<div class="esc-card-detalle">
      ${row('Precio vivienda', precioU.toFixed(0) + ' UF')}
      ${row('Pie (' + piePctD + '%)', `$${fmt(Math.round(pieU * UF_VALOR))}`)}
      ${row('Crédito', `${creditoU.toFixed(0)} UF`)}
      ${row('Tasa anual', tasaD + '%')}
      ${row('Plazo', `${plazo} años (${plazo * 12} cuotas)`)}
      ${sep}
      ${row('Dividendo/mes', `<strong>$${fmt(cuotaD)}</strong>`)}
      ${row('Total dividendos', `$${fmt(Math.round(totalPagado))}`)}
      ${row('Intereses totales', `$${fmt(totalInteres)} (${pctI}% extra)`)}
      ${sep}
      ${row('Tu ahorro actual', `$${fmt(ahorroHoy)}`)}
      ${tieneAhorroD
        ? row('Estado pie', '✅ Tienes el pie')
        : row('Te faltan', `$${fmt(faltaPie)}${anosPie ? ' · ~' + anosPie + ' años' : ''}`)}
    </div>`;
  };

  const mkCard = (titulo, sub, cuota, pct, pieClpEf, tieneAhorro, esMejor, noAplica, extra, detalle) => `
    <div class="esc-card ${esMejor ? 'destacado' : ''} ${noAplica ? 'esc-no-aplica' : ''}">
      ${esMejor ? '<span class="esc-badge">✓ Mejor opción</span>' : ''}
      <div class="esc-card-tag">${titulo}</div>
      <div class="esc-cuota">${cuota ? '$' + fmt(cuota) : '—'}</div>
      <div style="margin-top:5px">${cuota ? pillPct(pct) : ''}</div>
      <div class="esc-linea" style="margin-top:6px;color:var(--texto)">${sub}</div>
      ${veredicto(pct, pieClpEf, tieneAhorro, noAplica)}
      ${extra || ''}
      ${!noAplica && cuota ? '<div class="esc-expand-hint">▾ ver detalles</div>' : ''}
      ${detalle || ''}
    </div>`;

  const extraSub = subDS
    ? (subBono
      ? `<div class="esc-linea" style="margin-top:4px;color:var(--verde)">💰 Bono Pie cubre ${subBono.montoUF} UF de la entrada</div><div class="esc-linea" style="color:var(--suave2)">Postula en minvu.gob.cl</div>`
      : `<div class="esc-linea" style="margin-top:4px;color:var(--suave2)">Postula en minvu.gob.cl</div>`)
    : '';

  grid.innerHTML =
    mkCard('Sin ayuda', `Pie ${piePct}% · ${plazo} años · ${tasa}%`,
      cuota1, pct1, pie1 * UF_VALOR, tieneEsc1, mejor.id === 1, false, '',
      buildDetalle(precioUF, pie1, tasa, cuota1, pie1 * UF_VALOR, tieneEsc1, false)) +

    mkCard('Con subsidio',
      subDS ? `${subDS.montoUF} UF rebajan el precio` : 'No calificas por ahora',
      cuota2, pct2, pieClp2Ef, tieneEsc2, mejor.id === 2 && !!cuota2, !subDS, extraSub,
      buildDetalle(subDS ? precioUF - subDS.montoUF : 0, pie2 || 0, tasa, cuota2, pieClp2Ef || 0, tieneEsc2, !subDS)) +

    mkCard(`Pie 10%${subTasa ? '+tasa rebajada' : ''}`,
      subFog ? 'Con FOGAES solo necesitas el 10% de pie' : 'Precio supera las 4.500 UF del límite',
      cuota3, pct3, pieClp3, tieneEsc3, mejor.id === 3 && !!cuota3, !subFog,
      subFog && pieClp3
        ? `<div class="esc-linea" style="margin-top:4px;color:var(--verde)">💡 Pie baja de $${fmt(pie1 * UF_VALOR)} a $${fmt(pieClp3)}</div>`
          + (subTasa ? `<div class="esc-linea" style="margin-top:3px;font-size:11px;color:var(--suave)">⏱ La tasa rebajada aplica los primeros ~5 años, luego sube a ${tasa}%</div>` : '')
        : '',
      buildDetalle(precioUF, pie3 || 0, tasa3, cuota3, pieClp3 || 0, tieneEsc3, !subFog));
}

/* ── SUBSIDIOS (tab) ─────────────────────────────────────────── */
/* ── Helpers de subsidios ─────────────────────────────────────── */

/**
 * Evalúa si un subsidio aplica para el contexto dado.
 * @param {Object} subsidio - Elemento de SUBSIDIOS_DEF
 * @param {Object} ctx - Contexto del usuario
 * @returns {boolean}
 */
function subsidioElegible(subsidio, ctx) {
  try { return !!subsidio.aplicar(ctx); } catch { return false; }
}

/**
 * Retorna razones legibles por las que un subsidio no aplica.
 * @param {Object} subsidio - Elemento de SUBSIDIOS_DEF
 * @param {Object} ctx - Contexto del usuario
 * @returns {string[]}
 */
function subsidioRazon(subsidio, ctx) {
  try { return subsidio.razones ? subsidio.razones(ctx) : []; } catch { return []; }
}

/**
 * Construye el contexto de evaluación de subsidios desde los inputs del usuario.
 * @returns {Object} ctx para pasar a subsidio.aplicar() / subsidio.razones()
 */
function _buildCtxSubsidios() {
  // Intenta leer desde el simulador principal primero, luego desde sub-*
  const sueldoMain = parseCLP('sueldo') || 0;
  const sueldoSub  = parseCLP('sub-sueldo') || 0;
  const sueldoTotal = sueldoMain || sueldoSub;
  const ingresoUF   = sueldoTotal / (UF_VALOR || 38500);

  const regionEl = document.getElementById('sub-region') || document.getElementById('region');
  const tipoEl   = document.getElementById('sub-tipo')   || document.getElementById('tipo');
  const precioEl = document.getElementById('sub-precio');

  const primera = document.getElementById('sub-primera')?.checked
                ?? document.getElementById('primera')?.checked
                ?? true;
  const nueva   = document.getElementById('sub-nueva')?.checked ?? true;

  const region  = regionEl?.value || 'RM';
  const tipo    = tipoEl?.value   || (nueva ? 'depto' : 'usada');

  // Precio UF: desde input dedicado, o desde calculadora, o estimado por región+tipo
  let precioUF = 0;
  if (precioEl) {
    precioUF = parseCLP('sub-precio') / (UF_VALOR || 38500);
  }
  if (!precioUF) {
    const regData = REGIONES[region];
    if (regData) {
      const ufKey = tipo === 'casa' ? 'casa' : tipo === 'usada' ? 'usada' : 'depto';
      precioUF = (regData[ufKey] || regData.depto) * 55;
    } else {
      precioUF = tipo === 'usada' ? 1200 : 2000;
    }
  }

  return {
    sueldoTotal,
    ingresoUF,
    region,
    tipo,
    precioUF,
    primera,
    nueva,
    // Helper requerido por SUBSIDIOS_DEF
    tipoOk(sub) {
      if (sub.soloNueva && this.tipo === 'usada') return false;
      return true;
    },
  };
}

/* ── Guía de subsidios (datos informativos, NO modificar SUBSIDIOS_DEF) ── */
const _GUIA_SUB = {
  ds19: {
    quienEs:   `Familias con ingresos hasta 25 UF/mes, sin vivienda previa, vivienda nueva hasta 950 UF.`,
    queDa:     s => `<strong>${s.montoUF} UF (~$${fmt(s.montoUF * UF_VALOR)})</strong> descontados directamente del precio`,
    necesitas: ['Ser mayor de 18 años', 'No haber tenido vivienda propia', 'Cuenta de ahorro con mínimo 10 UF', 'Inscrito en el Registro Social de Hogares (RSH)'],
    compat:    'Compatible con Bono Pie DS19, FOGAES y Ley 21.748.',
    postula:   'Postula en <strong>minvu.gob.cl</strong> → Subsidios → DS19. También en la SEREMI de Vivienda de tu región.',
    noAplica:  ['Vivienda usada', 'Ingresos sobre 25 UF/mes', 'Ya tener propiedad registrada'],
    url:       'https://www.minvu.gob.cl/subsidios/subsidio-habitacional-ds19/',
  },
  ds1t1: {
    quienEs:   `Ingresos hasta 37 UF/mes, primera vivienda, hasta 1.100 UF.`,
    queDa:     s => `<strong>${s.montoUF} UF (~$${fmt(s.montoUF * UF_VALOR)})</strong> que se restan del crédito`,
    necesitas: ['Primera vivienda', 'Cuenta de ahorro con al menos 50 UF', 'Vivienda hasta 1.100 UF', 'Inscripción RSH tramo medio-bajo'],
    compat:    'Compatible con FOGAES y Ley 21.748.',
    postula:   'Postula en <strong>minvu.gob.cl</strong> o en una EGIS certificada. Postulaciones por llamado — revisa el calendario Minvu.',
    noAplica:  ['Vivienda sobre 1.100 UF', 'Ingresos sobre 37 UF/mes', 'Ya tener propiedad'],
    url:       'https://www.minvu.gob.cl/subsidios/ds1/',
  },
  ds1t2: {
    quienEs:   `Ingresos entre 37–60 UF/mes, primera vivienda, hasta 1.600 UF.`,
    queDa:     s => `<strong>${s.montoUF} UF (~$${fmt(s.montoUF * UF_VALOR)})</strong> que reducen el crédito`,
    necesitas: ['Primera vivienda', 'Cuenta de ahorro con al menos 80 UF', 'Vivienda hasta 1.600 UF', 'Ingreso acreditable (liquidaciones o declaración de renta)'],
    compat:    'Compatible con FOGAES y Ley 21.748.',
    postula:   'Postula en <strong>minvu.gob.cl</strong>. El banco también puede iniciar el trámite.',
    noAplica:  ['Ingresos bajo 37 o sobre 60 UF/mes', 'Vivienda sobre 1.600 UF', 'Ya tener propiedad'],
    url:       'https://www.minvu.gob.cl/subsidios/ds1/',
  },
  ds1t3: {
    quienEs:   `Ingresos entre 60–78 UF/mes, primera vivienda, hasta 2.200 UF.`,
    queDa:     s => `<strong>${s.montoUF} UF (~$${fmt(s.montoUF * UF_VALOR)})</strong> descontados del precio`,
    necesitas: ['Primera vivienda', 'Cuenta de ahorro con al menos 100 UF', 'Vivienda hasta 2.200 UF', 'Ingreso acreditable'],
    compat:    'Compatible con FOGAES y Ley 21.748.',
    postula:   'Postula en <strong>minvu.gob.cl</strong> o directamente con el banco que te dará el crédito.',
    noAplica:  ['Ingresos bajo 60 o sobre 78 UF/mes', 'Vivienda sobre 2.200 UF', 'Ya tener propiedad'],
    url:       'https://www.minvu.gob.cl/subsidios/ds1/',
  },
  fogaes: {
    quienEs:   'Cualquier persona que compra vivienda hasta 4.500 UF — el Estado garantiza el 10% que te falta ante el banco.',
    queDa:     () => '<strong>Pie mínimo 10%</strong> en vez del 20% estándar. El banco lo tramita automáticamente.',
    necesitas: ['Tener ahorrado al menos el 10% del precio', 'Banco apruebe el crédito', 'Vivienda hasta 4.500 UF', 'No requiere ser primera vivienda'],
    compat:    'Compatible con DS19, DS1 todos los tramos y Ley 21.748.',
    postula:   '<strong>Sin postulación en Minvu.</strong> Pídele al ejecutivo del banco que aplique FOGAES al momento de solicitar el crédito.',
    noAplica:  ['Vivienda sobre 4.500 UF'],
    url:       'https://www.minvu.gob.cl/beneficios/vivienda/',
  },
  ley21748: {
    quienEs:   'Vivienda nueva hasta 4.000 UF — el Estado subsidia la tasa de interés durante los primeros años.',
    queDa:     s => `Tu tasa baja <strong>${s.tasaDescuento}%</strong> los primeros ~5 años → dividendo más bajo en ~$30.000–$60.000/mes ese período`,
    necesitas: ['Vivienda nueva (depto o casa)', 'Precio hasta 4.000 UF', 'Crédito hipotecario a tasa fija', 'Cupos disponibles (verificar en el banco)'],
    compat:    'Compatible con DS1, FOGAES y Bono Pie DS19.',
    postula:   '<strong>El banco lo aplica directamente.</strong> Solo indica al ejecutivo: "quiero aplicar el subsidio a la tasa Ley 21.748". No requiere trámite en Minvu.',
    noAplica:  ['Vivienda usada', 'Precio sobre 4.000 UF', 'Sin cupos disponibles'],
    url:       'https://www.minvu.gob.cl/ley21748/',
  },
  bonopie: {
    quienEs:   'Complemento del DS19 para familias que necesitan completar el pie de vivienda nueva hasta 950 UF.',
    queDa:     s => `Hasta <strong>${s.montoUF} UF (~$${fmt(s.montoUF * UF_VALOR)})</strong> extra para el pie`,
    necesitas: [`Tener aprobado el subsidio DS19`, `Ingresos hasta 25 UF/mes (~$${fmt(25 * UF_VALOR)})`, `Vivienda nueva hasta 950 UF`, `Cuenta de ahorro activa`],
    compat:    'Solo se usa junto al DS19. Compatible con FOGAES.',
    postula:   'Se solicita junto con el DS19 en <strong>minvu.gob.cl</strong> o en la SEREMI. Si ya tienes DS19, consulta si puedes añadir el bono.',
    noAplica:  ['Sin DS19 aprobado', 'Vivienda usada', 'Ingresos sobre 25 UF/mes'],
    url:       'https://www.minvu.gob.cl/subsidios/subsidio-habitacional-ds19/',
  },
};

/**
 * Renderiza las tarjetas interactivas de subsidios en el panel izquierdo (calculadora completa).
 * @param {Array} subs - Array de subsidios con propiedad .aplica
 * @param {number} precioUF - Precio objetivo en UF
 * @param {number} tasa - Tasa anual en %
 * @param {number} plazo - Plazo en años
 * @param {Object} ctx - Contexto del usuario
 */
function renderSubsidios(subs, precioUF, tasa, plazo, ctx) {
  const lista = document.getElementById('subs-lista');
  if (!lista) return;

  const aplican   = subs.filter(s => s.aplica);
  const noAplican = subs.filter(s => !s.aplica);
  const ordered   = [...aplican, ...noAplican];
  const uf        = UF_VALOR || 38500;

  const partes = ordered.map(s => {
    const g = _GUIA_SUB[s.id];
    if (!g) return '';
    const aplica = !!s.aplica;
    const rs     = aplica ? [] : subsidioRazon(s, ctx);

    // ── Monto badge ──
    let montoVal = '';
    if (s.esFogaes) {
      montoVal = '10% de pie';
    } else if (s.esTasa) {
      montoVal = `−${s.tasaDescuento}% tasa`;
    } else if (s.montoUF) {
      montoVal = `${s.montoUF} UF · $${fmt(s.montoUF * uf)}`;
    }

    // ── Simulación rápida (solo si aplica y hay datos de precio/sueldo) ──
    let simHtml = '';
    if (aplica && precioUF > 0 && !s.esFogaes && !s.esTasa) {
      const precioEf = Math.max(precioUF - (s.montoUF || 0), 0);
      const pie20    = precioEf * 0.20 * uf;
      const pie10    = precioEf * 0.10 * uf;
      const div20    = cuotaMensual(precioEf * 0.80, tasa || 4.1, plazo || 25);
      const div10    = cuotaMensual(precioEf * 0.90, tasa || 4.1, plazo || 25);
      simHtml = `
        <div class="sub-simulacion">
          <div class="sub-sim-title">📊 Simulación con tu caso</div>
          <div class="sub-sim-grid">
            <div class="sub-sim-item">
              <span class="sub-sim-label">Tu precio objetivo</span>
              <span class="sub-sim-val">${Math.round(precioUF)} UF</span>
            </div>
            <div class="sub-sim-item">
              <span class="sub-sim-label">Precio tras subsidio</span>
              <span class="sub-sim-val verde">${Math.round(precioEf)} UF · $${fmt(precioEf * uf)}</span>
            </div>
            <div class="sub-sim-item">
              <span class="sub-sim-label">Dividendo (pie 20%)</span>
              <span class="sub-sim-val">$${fmt(div20)}/mes</span>
            </div>
            <div class="sub-sim-item">
              <span class="sub-sim-label">Dividendo (pie 10% FOGAES)</span>
              <span class="sub-sim-val">$${fmt(div10)}/mes</span>
            </div>
            <div class="sub-sim-item">
              <span class="sub-sim-label">Pie necesario (20%)</span>
              <span class="sub-sim-val">$${fmt(pie20)}</span>
            </div>
            <div class="sub-sim-item">
              <span class="sub-sim-label">Pie con FOGAES (10%)</span>
              <span class="sub-sim-val">$${fmt(pie10)}</span>
            </div>
          </div>
        </div>`;
    }

    // ── Razones por las que no aplica ──
    const razonesHtml = rs.length
      ? `<div class="sub-no-razones">
           <div class="sub-no-razones-title">❌ Por qué no calificas hoy</div>
           <ul class="sub-razones-list">
             ${rs.map(r => `<li>${r}</li>`).join('')}
           </ul>
         </div>`
      : '';

    // ── Requisitos ──
    const reqHtml = `
      <div class="sub-req">
        <div class="sub-req-title">${aplica ? '✅ Qué necesitas' : '📋 Requisitos para calificar'}</div>
        <ul class="sub-req-list">
          ${g.necesitas.map(p => `<li class="${aplica ? 'ok' : ''}">${p}</li>`).join('')}
        </ul>
      </div>`;

    // ── Qué entrega ──
    const beneficioHtml = `
      <div class="sub-beneficio">
        <span class="sub-beneficio-label">💰 ¿Qué entrega?</span>
        <span class="sub-beneficio-val">${g.queDa(s)}</span>
      </div>`;

    // ── Detalles expandibles ──
    const detallesHtml = `
      <div class="sub-detalles" hidden>
        <div class="sub-det-section">
          <strong>🤝 Compatibilidades:</strong> ${g.compat}
        </div>
        <div class="sub-det-section">
          <strong>🚫 Casos en que NO aplica:</strong>
          <ul class="sub-noaplica-list">
            ${g.noAplica.map(x => `<li>${x}</li>`).join('')}
          </ul>
        </div>
        <div class="sub-det-section">
          <strong>📍 Cómo postular:</strong> ${g.postula}
          <br><a href="${g.url}" target="_blank" rel="noopener" class="sub-det-link">Ver en minvu.gob.cl →</a>
        </div>
      </div>`;

    return `
      <div class="subsidio-card ${aplica ? 'aplica' : 'no-aplica'}" data-sub-id="${s.id}">
        <div class="sub-head">
          <div class="sub-head-left">
            <span class="sub-icon" aria-hidden="true">${s.icono}</span>
            <div class="sub-head-info">
              <span class="sub-title">${g.quienEs.split(',')[0].replace(/Familias con /i,'').replace(/Cualquier persona /i,'Todos — ')}</span>
              <span class="sub-nombre-full">${s.nombre}</span>
            </div>
          </div>
          <div class="sub-head-right">
            <span class="sub-badge ${aplica ? 'sub-badge--aplica' : 'sub-badge--no'}">
              ${aplica ? '✓ Calificas' : '✗ No aplica'}
            </span>
            ${montoVal ? `<span class="sub-monto-badge">${montoVal}</span>` : ''}
          </div>
        </div>
        <div class="sub-body">
          ${beneficioHtml}
          ${razonesHtml}
          ${reqHtml}
          ${simHtml}
          <button class="sub-ver-mas" aria-expanded="false" type="button">
            Ver detalles <span class="sub-ver-mas-ico">▾</span>
          </button>
          ${detallesHtml}
        </div>
      </div>`;
  });

  lista.innerHTML = partes.join('');

  // Delegación de eventos: expandir/contraer detalles
  lista.querySelectorAll('.sub-ver-mas').forEach(btn => {
    btn.addEventListener('click', () => {
      const det = btn.nextElementSibling;
      if (!det) return;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      btn.querySelector('.sub-ver-mas-ico').textContent = expanded ? '▾' : '▴';
      btn.textContent = '';
      btn.insertAdjacentHTML('beforeend',
        `${expanded ? 'Ver detalles' : 'Ocultar detalles'} <span class="sub-ver-mas-ico">${expanded ? '▾' : '▴'}</span>`);
      if (expanded) { det.hidden = true; }
      else          { det.hidden = false; }
    });
  });
}

/**
 * Recalcula y renderiza las tarjetas de subsidios de la pantalla pública (screen-subsidios)
 * usando SUBSIDIOS_DEF directamente — sin necesitar los cálculos del simulador completo.
 */
function renderSubsidiosPublico() {
  const lista = document.getElementById('subs-lista-pub');
  if (!lista) return;

  const ctx  = _buildCtxSubsidios();
  const tasa = 4.1, plazo = 25;
  const uf   = UF_VALOR || 38500;
  const subs = SUBSIDIOS_DEF.map(s => ({ ...s, aplica: subsidioElegible(s, ctx) }));

  const aplican   = subs.filter(s => s.aplica);
  const noAplican = subs.filter(s => !s.aplica);
  const ordered   = [...aplican, ...noAplican];

  const partes = ordered.map(s => {
    const g = _GUIA_SUB[s.id];
    if (!g) return '';
    const aplica = !!s.aplica;
    const rs     = aplica ? [] : subsidioRazon(s, ctx);

    let montoVal = '';
    if (s.esFogaes)       montoVal = '10% de pie';
    else if (s.esTasa)    montoVal = `−${s.tasaDescuento}% tasa`;
    else if (s.montoUF)   montoVal = `${s.montoUF} UF · $${fmt(s.montoUF * uf)}`;

    // Simulación para subsidios monetarios cuando hay precio
    let simHtml = '';
    if (aplica && ctx.precioUF > 0 && !s.esFogaes && !s.esTasa && s.montoUF) {
      const precioEf = Math.max(ctx.precioUF - s.montoUF, 0);
      const div20    = cuotaMensual(precioEf * 0.80, tasa, plazo);
      const pie20    = precioEf * 0.20 * uf;
      simHtml = `
        <div class="sub-simulacion">
          <div class="sub-sim-title">📊 Tu simulación</div>
          <div class="sub-sim-grid">
            <div class="sub-sim-item">
              <span class="sub-sim-label">Precio tras subsidio</span>
              <span class="sub-sim-val verde">${Math.round(precioEf)} UF</span>
            </div>
            <div class="sub-sim-item">
              <span class="sub-sim-label">Dividendo est. (pie 20%)</span>
              <span class="sub-sim-val">$${fmt(div20)}/mes</span>
            </div>
            <div class="sub-sim-item">
              <span class="sub-sim-label">Pie mínimo (20%)</span>
              <span class="sub-sim-val">$${fmt(pie20)}</span>
            </div>
          </div>
        </div>`;
    }

    const razonesHtml = rs.length
      ? `<div class="sub-no-razones">
           <div class="sub-no-razones-title">❌ Por qué no calificas hoy</div>
           <ul class="sub-razones-list">${rs.map(r => `<li>${r}</li>`).join('')}</ul>
         </div>`
      : '';

    const detallesHtml = `
      <div class="sub-detalles" hidden>
        <div class="sub-det-section"><strong>🤝 Compatibilidades:</strong> ${g.compat}</div>
        <div class="sub-det-section">
          <strong>🚫 No aplica si:</strong>
          <ul class="sub-noaplica-list">${g.noAplica.map(x => `<li>${x}</li>`).join('')}</ul>
        </div>
        <div class="sub-det-section">
          <strong>📍 Cómo postular:</strong> ${g.postula}
          <br><a href="${g.url}" target="_blank" rel="noopener" class="sub-det-link">Ver en minvu.gob.cl →</a>
        </div>
      </div>`;

    return `
      <div class="subsidio-card ${aplica ? 'aplica' : 'no-aplica'}" data-sub-id="${s.id}">
        <div class="sub-head">
          <div class="sub-head-left">
            <span class="sub-icon" aria-hidden="true">${s.icono}</span>
            <div class="sub-head-info">
              <span class="sub-nombre-full">${s.nombre}</span>
              <span class="sub-quien-es">${g.quienEs}</span>
            </div>
          </div>
          <div class="sub-head-right">
            <span class="sub-badge ${aplica ? 'sub-badge--aplica' : 'sub-badge--no'}">
              ${aplica ? '✓ Calificas' : '✗ No aplica'}
            </span>
            ${montoVal ? `<span class="sub-monto-badge">${montoVal}</span>` : ''}
          </div>
        </div>
        <div class="sub-body">
          <div class="sub-beneficio">
            <span class="sub-beneficio-label">💰 ¿Qué entrega?</span>
            <span class="sub-beneficio-val">${g.queDa(s)}</span>
          </div>
          ${razonesHtml}
          ${simHtml}
          <button class="sub-ver-mas" aria-expanded="false" type="button">
            Ver detalles <span class="sub-ver-mas-ico">▾</span>
          </button>
          ${detallesHtml}
        </div>
      </div>`;
  });

  lista.innerHTML = partes.join('');

  lista.querySelectorAll('.sub-ver-mas').forEach(btn => {
    btn.addEventListener('click', () => {
      const det      = btn.nextElementSibling;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      det.hidden = expanded;
      btn.innerHTML = `${expanded ? 'Ver detalles' : 'Ocultar detalles'} <span class="sub-ver-mas-ico">${expanded ? '▾' : '▴'}</span>`;
    });
  });
}

/**
 * Renderiza la tabla comparativa de todas las regiones del país.
 * @param {number} sueldoTotal - Ingreso total en CLP
 * @param {number} piePct - Porcentaje de pie
 * @param {number} tasa - Tasa anual en %
 * @param {number} plazo - Plazo en años
 */
function renderTabla(sueldoTotal, piePct, tasa, plazo) {
  const regionActual = document.getElementById('region').value;
  const tipo         = document.getElementById('tipo').value;
  const m2           = parseFloat(document.getElementById('m2').value) || 55;
  const ufKey        = tipo === 'depto' ? 'depto' : tipo === 'casa' ? 'casa' : 'usada';
  const tipoLabel    = tipo === 'depto' ? 'Departamento' : tipo === 'casa' ? 'Casa' : 'Vivienda usada';

  document.getElementById('tabla-sub').textContent =
    `${tipoLabel} ${m2}m² · dividendo con pie ${piePct}%, ${plazo} años, ${tasa}%`;

  const filas = Object.entries(REGIONES)
    .map(([k, v]) => ({ k, v, uf: v[ufKey] * m2 }))
    .sort((a, b) => a.uf - b.uf);

  const tbody = document.getElementById('tbody-regiones');
  const rows = filas.map(({ k, v, uf }) => {
    const clp    = uf * UF_VALOR;
    const pieUF  = uf * piePct / 100;
    const pieClp = pieUF * UF_VALOR;
    const div    = cuotaMensual(uf * (1 - piePct / 100), tasa, plazo);
    const pct    = sueldoTotal > 0 ? (div / sueldoTotal) * 100 : 0;
    const pc     = pct <= 30 ? 'pill-t pill-verde' : pct <= 50 ? 'pill-t pill-amarillo' : 'pill-t pill-rojo';
    const lbl    = pct <= 30 ? '✅ Posible' : pct <= 50 ? '⚠️ Caro' : '❌ Muy caro';
    return `<tr class="${k === regionActual ? 'fila-activa' : ''}">
      <td>${v.nombre}</td>
      <td style="font-size:12px">$${fmt(v[ufKey] * UF_VALOR)}<br><span style="color:var(--suave2)">${v[ufKey]} UF</span></td>
      <td>$${fmt(clp)}<br><span style="font-size:11px;color:var(--suave)">${fmt(uf)} UF</span></td>
      <td><strong>$${fmt(div)}</strong>/mes</td>
      <td>$${fmt(pieClp)}<br><span style="font-size:11px;color:var(--suave)">${piePct}%</span></td>
      <td><span class="${pc}">${lbl}</span></td>
    </tr>`;
  });
  tbody.innerHTML = rows.join('');
}

/* ── ARRENDAR VS COMPRAR ─────────────────────────────────────── */
function actualizarSliderArriendo() {
  const val = parseInt(document.getElementById('arriendo-slider').value) || 450000;
  document.getElementById('arriendo-display').textContent = fmt(val);
}

function renderArrVsCompra(precioClp, precioUF, piePct, tasa, plazo, cuota) {
  const bloque = document.getElementById('avc-bloque');
  if (!bloque) return;

  const arriendoMensual = parseInt(document.getElementById('arriendo-slider').value) || 450000;
  document.getElementById('arriendo-display').textContent = fmt(arriendoMensual);

  const pieClp = precioClp * piePct / 100;
  const difMes = cuota - arriendoMensual;
  let aniosRecupero = null;

  if (difMes < 0) {
    aniosRecupero = Math.ceil(pieClp / (-difMes) / 12);
  } else if (difMes > 0) {
    const tm = tasa / 100 / 12;
    const cr = precioClp - pieClp;
    let saldo = cr, capitalAcum = 0, extraAcum = 0;
    for (let mes = 1; mes <= plazo * 12; mes++) {
      const interes = saldo * tm;
      const amort   = cuota - interes;
      capitalAcum += amort;
      extraAcum   += difMes;
      saldo       -= amort;
      if (capitalAcum >= extraAcum) { aniosRecupero = Math.ceil(mes / 12); break; }
    }
  }

  const comprarMasBajo = difMes <= 0;
  const absDif = fmt(Math.abs(difMes));
  let veredictoColor, veredictoTitulo, veredictoTexto, pros;

  if (comprarMasBajo) {
    veredictoColor  = 'var(--verde-l)';
    veredictoTitulo = `✅ Comprar te sale $${absDif}/mes más barato que arrendar`;
    veredictoTexto  = 'Con este arriendo, el dividendo es menor. Con cada pago estás construyendo patrimonio — esa plata es tuya, no del arrendador.';
    pros = [
      { ico: '🏠', txt: 'Cada dividendo que pagas es plata que va a tu propiedad' },
      { ico: '📈', txt: 'Con el tiempo, la casa puede valer más' },
      { ico: '🔒', txt: 'Nadie te puede pedir que te vayas ni subir el arriendo' },
    ];
  } else if (aniosRecupero && aniosRecupero <= plazo) {
    const enAños    = aniosRecupero === 1 ? 'al primer año' : `a los ${aniosRecupero} años`;
    const enAñosCap = aniosRecupero === 1 ? 'Al primer año' : `A los ${aniosRecupero} años`;
    veredictoColor  = 'var(--amarillo-l)';
    veredictoTitulo = `⚖️ Comprar es $${absDif}/mes más caro hoy, pero ${enAños} te empieza a convenir`;
    veredictoTexto  = `Hoy pagas más que si arriendaras, pero parte de ese dividendo queda como tuyo (es patrimonio). ${enAñosCap}, lo que acumulaste en tu casa supera lo que pagaste de más.`;
    pros = [
      { ico: '💰', txt: `Pagas $${absDif}/mes más que arrendando, pero esa plata queda para ti` },
      { ico: '🏠', txt: `${enAñosCap}, el patrimonio acumulado cubre la diferencia` },
      { ico: '🔒', txt: 'Estabilidad: nadie te sube el arriendo ni te puede echar' },
    ];
  } else {
    veredictoColor  = 'var(--rojo-l)';
    veredictoTitulo = `📊 Arrendar es $${absDif}/mes más barato hoy`;
    veredictoTexto  = 'Con este dividendo y arriendo, arrendar te deja más plata libre al mes. Comprar igual puede tener sentido si el arriendo sube o buscas estabilidad.';
    pros = [
      { ico: '💸', txt: `Te ahorras $${absDif}/mes versus comprar` },
      { ico: '🔄', txt: 'Más flexibilidad para cambiarte si cambia tu situación' },
      { ico: '⚠️', txt: 'Ojo: el arriendo puede subir con el tiempo, el dividendo no' },
    ];
  }

  bloque.innerHTML = `
    <div class="avc-grid">
      <div class="avc-card ${comprarMasBajo ? '' : 'avc-mejor'}">
        ${!comprarMasBajo ? '<span class="esc-badge" style="background:var(--azul)">↓ Más barato hoy</span>' : ''}
        <div class="avc-card-tag">Si arriendas</div>
        <div class="avc-monto">$${fmt(arriendoMensual)}<span style="font-size:.85rem;font-weight:300">/mes</span></div>
        <div class="avc-linea" style="margin-top:8px">Lo que pagas y no vuelve</div>
      </div>
      <div class="avc-card ${comprarMasBajo ? 'avc-mejor' : ''}">
        ${comprarMasBajo ? '<span class="esc-badge">✓ Mejor opción</span>' : ''}
        <div class="avc-card-tag">Si compras</div>
        <div class="avc-monto">$${fmt(cuota)}<span style="font-size:.85rem;font-weight:300">/mes</span></div>
        <div class="avc-linea" style="margin-top:8px">Parte de eso queda como tuyo 🏠</div>
      </div>
    </div>
    <div class="avc-fallo" style="background:${veredictoColor}">
      <div class="avc-fallo-titulo">${veredictoTitulo}</div>
      <div class="avc-fallo-txt">${veredictoTexto}</div>
      <div class="avc-pros">${pros.map(p => `<div class="avc-pro"><span class="avc-pro-ico">${p.ico}</span><span>${p.txt}</span></div>`).join('')}</div>
    </div>
    <div class="aviso aviso-neutro" style="font-size:12px">💡 <strong>¿Qué pasa con el pie?</strong> Para comprar necesitas juntar $${fmt(pieClp)} de entrada (${piePct}%). Revisa los subsidios — pueden cubrir parte del pie.</div>`;
}

/* ── FRASE IMPACTO ───────────────────────────────────────────── */
function renderFraseImpacto(sueldo, pct, pieClp, aniosPie, precioClp, regionNombre, plazo) {
  const fraseEl = document.getElementById('frase-impacto');
  const textoEl = document.getElementById('frase-texto');
  if (!sueldo || sueldo <= 0) { fraseEl.style.display = 'none'; return; }
  fraseEl.style.display = 'block';

  const sueldoFmt = '$' + fmt(sueldo);
  let frase = '';

  if (pct <= 30) {
    frase = `Con <em>${sueldoFmt}/mes</em>, el dividendo representa solo el <strong>${pct.toFixed(1)}% de tu sueldo</strong>. Eres de los pocos chilenos con acceso real a vivienda propia en ${regionNombre}.`;
  } else if (pct <= 50) {
    frase = `Con <em>${sueldoFmt}/mes</em>, destinarías el <strong>${pct.toFixed(1)}% de tu sueldo</strong> al dividendo. Quedarás con poco margen. Y para el pie aún necesitas <strong>${Math.ceil(aniosPie * 12)} meses de ahorro disciplinado</strong>.`;
  } else if (pct <= 80) {
    frase = `Con <em>${sueldoFmt}/mes</em>, el dividendo se llevaría el <strong>${pct.toFixed(1)}% de tu sueldo</strong>. El banco probablemente no lo aprobará. Necesitarías ganar <strong>el doble</strong> para calificar solo, o conseguir un codeudor.`;
  } else {
    frase = `<strong>Esta vivienda no es accesible para tu sueldo actual.</strong> El dividendo sería el <em>${pct.toFixed(1)}% de tus ingresos</em>. No es un problema tuyo: es la realidad de millones de chilenos hoy.`;
  }
  if (aniosPie > 10 && pct > 30)
    frase += ` Juntarías el pie en <em>${Math.ceil(aniosPie)} años</em> ahorrando el 20% de tu sueldo.`;

  textoEl.innerHTML = frase;

  const aniosPieTxt = Math.max(1, Math.ceil(aniosPie || 0));
  const shareMsg = pct <= 30
    ? `Mi resultado: si puedo comprar vivienda en ${regionNombre}. El dividendo seria ${pct.toFixed(0)}% de mi sueldo.`
    : pct <= 50
      ? `Mi resultado: necesito ${aniosPieTxt} anos para juntar el pie en ${regionNombre}.`
      : `Mi resultado: hoy no me alcanza para comprar en ${regionNombre}. El dividendo seria ${pct.toFixed(0)}% de mi sueldo.`;
  actualizarLinksShare(shareMsg);
}

function actualizarLinksShare(mensajeBase) {
  const shareArea = document.querySelector('.share-area');
  if (!shareArea) return;

  const ensureBtn = (id, label) => {
    let el = document.getElementById(id);
    if (el) return el;
    el = document.createElement('a');
    el.id = id;
    el.className = 'btn-share';
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
    el.textContent = label;
    const copyBtn = shareArea.querySelector('.btn-share-copy');
    if (copyBtn) shareArea.insertBefore(el, copyBtn);
    else shareArea.appendChild(el);
    return el;
  };

  const baseUrl = window.location.href;
  const txt = `${mensajeBase} Calculalo en cuantocuestaunacasa.cl`;

  const btnTw = ensureBtn('btn-tw', 'X / Twitter');
  const btnWa = ensureBtn('btn-wa', 'WhatsApp');
  const btnRd = ensureBtn('btn-rd', 'Reddit');
  const btnLi = ensureBtn('btn-li', 'LinkedIn');

  btnTw.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(txt)}&url=${encodeURIComponent(baseUrl)}`;
  btnWa.href = `https://wa.me/?text=${encodeURIComponent(`${txt} ${baseUrl}`)}`;
  btnRd.href = `https://www.reddit.com/submit?url=${encodeURIComponent(baseUrl)}&title=${encodeURIComponent(txt)}`;
  btnLi.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseUrl)}`;
  btnLi.setAttribute('aria-label', 'Compartir resultado en LinkedIn');
}

/* ── PROYECCIÓN DE INGRESOS ──────────────────────────────────── */

/**
 * Renderiza la proyección de ingresos para el tab "Si crezco".
 * Muestra cómo evoluciona la relación cuota/sueldo si el ingreso crece.
 * @param {number} sueldoTotal - Ingreso mensual actual en CLP
 * @param {number} cuota       - Dividendo mensual en CLP
 */
function renderProyeccionIngresos(sueldoTotal, cuota) {
  const cont = document.getElementById('proyeccion-cont');
  if (!cont || sueldoTotal <= 0) return;

  // Persistir valores para cuando el usuario cambie la tasa
  cont.dataset.sueldo = sueldoTotal;
  cont.dataset.cuota  = cuota;

  const tasas        = [3, 5, 8, 10, 15];
  const selectedRate = parseInt(cont.dataset.tasa || '5');
  const pctActual    = cuota / sueldoTotal * 100;

  // Proyección a 10 años
  const filas   = [];
  let añoAcceso = null;
  for (let año = 1; año <= 10; año++) {
    const sueldoProy = sueldoTotal * Math.pow(1 + selectedRate / 100, año);
    const pct        = cuota / sueldoProy * 100;
    if (añoAcceso === null && pct <= 30) añoAcceso = año;
    filas.push({ año, sueldo: sueldoProy, pct });
  }

  // Mensaje clave
  let insight;
  if (pctActual <= 30) {
    const pct10 = filas[filas.length - 1].pct;
    insight = `Hoy el dividendo ya está en el <strong>${pctActual.toFixed(1)}%</strong> de tu sueldo — accesible. Con <em>${selectedRate}% anual</em> de crecimiento, en 10 años bajaría al <strong>${pct10.toFixed(1)}%</strong>. Más holgura cada año.`;
  } else if (añoAcceso !== null) {
    const sueldoAcc = filas[añoAcceso - 1].sueldo;
    insight = `Con <em>${selectedRate}% anual</em> de crecimiento, en <strong>${añoAcceso} año${añoAcceso > 1 ? 's' : ''}</strong> el dividendo quedaría bajo el 30% de tu sueldo. Estarías ganando <strong>$${fmt(sueldoAcc)}/mes</strong>.`;
  } else {
    insight = `Con <em>${selectedRate}% anual</em>, el dividendo aún supera el 30% después de 10 años. Considera codeudor, subsidio o viviendas de menor precio.`;
  }

  const pillFor = pct => {
    if (pct <= 30) return '<span class="pill pill-verde" style="font-size:10px;padding:2px 8px">✓ Accesible</span>';
    if (pct <= 50) return '<span class="pill pill-amarillo" style="font-size:10px;padding:2px 8px">Esfuerzo alto</span>';
    return '<span class="pill pill-rojo" style="font-size:10px;padding:2px 8px">Difícil acceso</span>';
  };

  const selector = tasas
    .map(t => `<button class="proy-btn${t === selectedRate ? ' activo' : ''}" onclick="cambiarTasaProyeccion(${t})">${t}% año</button>`)
    .join('');

  const hoyRow = `<tr class="proy-hoy"><td><strong>Hoy</strong></td><td>$${fmt(sueldoTotal)}</td><td>${pctActual.toFixed(1)}%</td><td>${pillFor(pctActual)}</td></tr>`;
  const proyRows = filas.map(f =>
    `<tr class="${f.pct <= 30 ? 'proy-ok' : ''}"><td>Año ${f.año}</td><td>$${fmt(f.sueldo)}</td><td>${f.pct.toFixed(1)}%</td><td>${pillFor(f.pct)}</td></tr>`
  ).join('');

  cont.innerHTML = `
    <div class="proy-selector">${selector}</div>
    <div class="proy-insight">${insight}</div>
    <div class="proy-tabla">
      <table>
        <thead><tr><th>Período</th><th>Sueldo estimado</th><th>Dividendo / sueldo</th><th>Estado</th></tr></thead>
        <tbody>${hoyRow}${proyRows}</tbody>
      </table>
    </div>
    <p class="proy-nota">La proyección asume dividendo fijo y sueldo que crece a la tasa elegida de forma compuesta. No considera inflación, variación de la UF ni cambios de tasa hipotecaria.</p>`;
}

/**
 * Cambia la tasa de crecimiento anual y re-renderiza la proyección.
 * @param {number} tasa - Porcentaje anual de crecimiento elegido
 */
function cambiarTasaProyeccion(tasa) {
  const cont = document.getElementById('proyeccion-cont');
  if (!cont) return;
  cont.dataset.tasa = tasa;
  renderProyeccionIngresos(
    parseFloat(cont.dataset.sueldo || '0'),
    parseFloat(cont.dataset.cuota  || '0')
  );
}

/* ── DESIGUALDAD REGIONAL ────────────────────────────────────── */
function renderDesigualdad() {
  const cont = document.getElementById('desigualdad-visual');
  if (!cont) return;
  const items = Object.entries(REGIONES)
    .map(([, v]) => ({ nombre: v.nombre.split('/')[0].trim(), uf: v.depto * 55 }))
    .sort((a, b) => a.uf - b.uf);
  const max = items[items.length - 1].uf;

  cont.innerHTML = `<div class="desigualdad-header">Precio depto 55 m² en UF · de más barato a más caro</div>` +
    items.map(it => {
      const pct   = (it.uf / max) * 100;
      const color = it.uf === max ? 'var(--rojo)' : it.uf === items[0].uf ? 'var(--verde)' : 'var(--azul)';
      return `<div class="desig-row">
        <span class="desig-nombre">${it.nombre}</span>
        <div class="desig-barra-wrap"><div class="desig-barra" style="width:${pct}%;background:${color}"></div></div>
        <span class="desig-uf">${fmt(it.uf)} UF</span>
      </div>`;
    }).join('');
}

/* ── PORTALES DE BÚSQUEDA — sección screen-3 ────────────────── */
/**
 * Muestra botones con URLs filtradas hacia los principales portales
 * de búsqueda de propiedades en Chile, usando los parámetros del simulador.
 * @param {string} regionCode  - Clave REGIONES (RM, VAL…)
 * @param {number} capacidadUF - Precio máximo que puede pagar el usuario (UF)
 * @param {string} tipo        - Tipo de vivienda: 'depto'|'casa'|'usada'
 * @param {number} m2          - Superficie seleccionada por el usuario en m²
 */
function mostrarBuscadoresPropiedades(regionCode = 'RM', capacidadUF = 0) {
  const section = document.getElementById('buscadores-section');
  const grid    = document.getElementById('buscadores-grid');
  const sub     = document.getElementById('buscadores-sub');
  if (!section || !grid) return;

  const d    = REGIONES[regionCode] ?? REGIONES.RM;
  const urlML = 'https://www.mercadolibre.cl/c/inmuebles#menu=categories';
  const urlTT = 'https://www.toctoc.com/';

  const notaCapacidad = capacidadUF > 0
    ? `Tu capacidad: hasta <strong>${capacidadUF} UF</strong> · ${d.nombre}`
    : `Región: <strong>${d.nombre}</strong>`;

  if (sub) sub.innerHTML = notaCapacidad;

  grid.innerHTML = `
    <a href="${urlML}" target="_blank" rel="noopener noreferrer" class="buscador-card buscador-card--ml">
      <span class="buscador-logo">MercadoLibre</span>
      <span class="buscador-desc">Inmuebles en venta en Chile</span>
      <span class="buscador-arrow">→</span>
    </a>
    <a href="${urlTT}" target="_blank" rel="noopener noreferrer" class="buscador-card buscador-card--tt">
      <span class="buscador-logo">TocToc</span>
      <span class="buscador-desc">Propiedades en venta en Chile</span>
      <span class="buscador-arrow">→</span>
    </a>
  `;

  section.style.display = '';
}

/* ── COPIAR LINK ─────────────────────────────────────────────── */
function copiarLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn  = document.querySelector('.btn-share-copy');
    const orig = btn.textContent;
    btn.textContent = '✅ ¡Copiado!';
    setTimeout(() => { btn.textContent = orig; }, 2200);
  });
}

/* ── CONVERSION: SIGUIENTE PASO ──────────────────────────────── */
function renderConversionResultados() {
  const screen = document.getElementById('screen-3');
  if (!screen || document.getElementById('conv-next-steps')) return;

  const style = document.createElement('style');
  style.id = 'conv-next-style';
  style.textContent = `
    .conv-next{margin:1rem 0 1.2rem;padding:1rem;border:1.5px solid var(--borde);border-radius:14px;background:var(--fondo)}
    .conv-next-k{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--suave);margin-bottom:.35rem}
    .conv-next-t{font-family:'Fraunces',serif;font-size:1.1rem;line-height:1.2;color:var(--negro);margin-bottom:.4rem}
    .conv-next-p{font-size:13px;color:var(--texto);line-height:1.6;margin-bottom:.7rem}
    .conv-next-actions{display:flex;gap:8px;flex-wrap:wrap}
    .conv-next-btn{border:1px solid var(--borde);background:var(--blanco);color:var(--texto);border-radius:999px;padding:8px 12px;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif}
    .conv-next-btn--pri{background:var(--negro);color:#fff;border-color:var(--negro)}
  `;
  document.head.appendChild(style);

  const box = document.createElement('section');
  box.id = 'conv-next-steps';
  box.className = 'conv-next';
  box.innerHTML = `
    <div class="conv-next-k">Siguiente paso recomendado</div>
    <div class="conv-next-t">Pasa de simulacion a decision real</div>
    <p class="conv-next-p">Compara bancos, revisa subsidios y mira propiedades dentro de tu rango para avanzar hoy.</p>
    <div class="conv-next-actions">
      <button type="button" class="conv-next-btn conv-next-btn--pri" data-conv-action="bancos">Comparar bancos</button>
      <button type="button" class="conv-next-btn" data-conv-action="subsidios">Ver subsidios</button>
      <button type="button" class="conv-next-btn" data-conv-action="propiedades">Ver propiedades</button>
    </div>
  `;

  const tabs = screen.querySelector('[role="tablist"], .tabs-wrap');
  if (tabs && tabs.parentNode) tabs.insertAdjacentElement('beforebegin', box);
  else screen.insertBefore(box, screen.firstChild.nextSibling || null);

  box.addEventListener('click', e => {
    const btn = e.target.closest('[data-conv-action]');
    if (!btn) return;
    const action = btn.dataset.convAction;
    if (action === 'bancos') {
      if (typeof irABancos === 'function') irABancos();
      else document.querySelector('[data-tab="tab-bancos"]')?.click();
      return;
    }
    if (action === 'subsidios') {
      if (typeof irASubsidios === 'function') irASubsidios();
      else document.querySelector('[data-tab="tab-subsidios"]')?.click();
      return;
    }
    if (action === 'propiedades') {
      document.getElementById('buscadores-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

/* ── BLOQUE DE CONFIANZA (HOME) ──────────────────────────────── */
function inyectarBloqueConfianzaHome() {
  if (document.getElementById('trust-home-bloque')) return;
  const screen = document.getElementById('screen-1');
  if (!screen) return;

  const style = document.createElement('style');
  style.id = 'trust-home-style';
  style.textContent = `
    .trust-home{border:1.5px solid var(--borde);border-radius:14px;padding:1rem 1.1rem;background:var(--blanco);margin:1rem 0 1.2rem}
    .trust-home-tag{font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--suave);margin-bottom:.45rem}
    .trust-home-title{font-family:'Fraunces',serif;font-size:1.1rem;line-height:1.2;color:var(--negro);margin-bottom:.45rem}
    .trust-home-copy{font-size:12.5px;line-height:1.65;color:var(--texto);margin-bottom:.55rem}
    .trust-home-list{display:flex;flex-wrap:wrap;gap:8px;margin:.2rem 0 .65rem;padding:0;list-style:none}
    .trust-home-list li{font-size:11px;color:var(--suave);background:var(--fondo);border:1px solid var(--borde);border-radius:999px;padding:4px 8px}
    .trust-home-links{display:flex;flex-wrap:wrap;gap:10px}
    .trust-home-links a{font-size:11px;color:var(--azul);text-decoration:none;border-bottom:1px dashed rgba(0,0,0,.2)}
    .trust-home-links a:hover{color:var(--negro);border-bottom-color:var(--negro)}
  `;
  document.head.appendChild(style);

  const bloque = document.createElement('section');
  bloque.id = 'trust-home-bloque';
  bloque.className = 'trust-home';
  bloque.setAttribute('aria-label', 'Metodologia y fuentes');
  bloque.innerHTML = `
    <div class="trust-home-tag">Como calculamos</div>
    <h2 class="trust-home-title">Metodologia basada en fuentes oficiales de Chile</h2>
    <p class="trust-home-copy">Las estimaciones usan regla bancaria de esfuerzo (25-30%), tasa referencial en UF y datos publicos para precios, ingresos y subsidios. Es una herramienta educativa y no reemplaza una evaluacion comercial del banco.</p>
    <ul class="trust-home-list">
      <li>Actualizado: Abril 2026</li>
      <li>Tasa referencial: 4.1% UF</li>
      <li>Plazo base: 25 anos</li>
    </ul>
    <div class="trust-home-links">
      <a href="https://www.cmfchile.cl" target="_blank" rel="noopener noreferrer">CMF</a>
      <a href="https://www.bcentral.cl" target="_blank" rel="noopener noreferrer">Banco Central</a>
      <a href="https://www.ine.gob.cl" target="_blank" rel="noopener noreferrer">INE</a>
      <a href="https://www.minvu.gob.cl" target="_blank" rel="noopener noreferrer">MINVU</a>
      <a href="https://cchc.cl" target="_blank" rel="noopener noreferrer">CChC</a>
    </div>
  `;

  const intro = screen.querySelector('.sub');
  if (intro && intro.parentNode) intro.insertAdjacentElement('afterend', bloque);
  else screen.insertBefore(bloque, screen.firstChild.nextSibling || null);
}

/* ── NARRATIVA LANDING (HOME) ─────────────────────────────────── */
function inyectarNarrativaHome() {
  const screen = document.getElementById('screen-1');
  if (!screen) return;

  const titulo = screen.querySelector('.titulo-grande');
  if (titulo) titulo.innerHTML = '¿<em>Puedes comprar una casa en Chile</em>?';

  const sub = screen.querySelector('.sub');
  if (sub) sub.textContent = 'Descubre en 30 segundos si tu sueldo y ahorro alcanzan para comprar vivienda en tu region.';
  if (document.getElementById('narrativa-home-bloque')) return;

  const style = document.createElement('style');
  style.id = 'narrativa-home-style';
  style.textContent = `
    .narrativa-home{background:linear-gradient(135deg,var(--azul) 0%,#0f172a 100%);border-radius:16px;padding:1rem 1.1rem;color:#fff;margin:0 0 1rem}
    .narrativa-home-kicker{font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#93c5fd;margin-bottom:.35rem}
    .narrativa-home-copy{font-size:13px;line-height:1.6;opacity:.95}
    .narrativa-home-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:.85rem}
    .narrativa-home-stat{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:.55rem .6rem}
    .narrativa-home-stat strong{display:block;font-size:1rem;font-weight:700;color:#fff}
    .narrativa-home-stat span{font-size:10.5px;color:#cbd5e1;line-height:1.35}
    @media(max-width:620px){.narrativa-home-stats{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const narrativa = document.createElement('section');
  narrativa.id = 'narrativa-home-bloque';
  narrativa.className = 'narrativa-home';
  narrativa.setAttribute('aria-label', 'Contexto del mercado inmobiliario en Chile');
  narrativa.innerHTML = `
    <div class="narrativa-home-kicker">Realidad inmobiliaria Chile 2026</div>
    <div class="narrativa-home-copy">Ingresa tu sueldo real, ahorro y region. Te mostramos un resultado claro: si puedes comprar hoy, cuanto seria tu dividendo y cuanto tiempo te falta para el pie.</div>
    <div class="narrativa-home-stats">
      <div class="narrativa-home-stat"><strong>76%</strong><span>No logra comprar vivienda con su ingreso actual</span></div>
      <div class="narrativa-home-stat"><strong>+120%</strong><span>Subida acumulada en precios de vivienda</span></div>
      <div class="narrativa-home-stat"><strong>23 anos</strong><span>Tiempo promedio para juntar un pie sin apoyo</span></div>
    </div>
  `;

  const wizard = screen.querySelector('.wizard-contexto, .tooltip, form, .form-card');
  if (wizard && wizard.parentNode) wizard.insertAdjacentElement('beforebegin', narrativa);
  else if (sub && sub.parentNode) sub.insertAdjacentElement('afterend', narrativa);
  else screen.appendChild(narrativa);
}

/* ── MENU DE ACCESO RAPIDO ────────────────────────────────────── */
function inyectarMenuAccesoRapido() {
  if (document.getElementById('menu-acceso-rapido')) return;
  const nav = document.querySelector('nav');
  if (!nav || !nav.parentNode) return;

  const style = document.createElement('style');
  style.id = 'menu-acceso-style';
  style.textContent = `
    .menu-acceso{max-width:960px;margin:0 auto;padding:.55rem 1rem .25rem;display:flex;gap:8px;flex-wrap:wrap}
    .menu-acceso-btn{border:1px solid var(--borde);background:var(--blanco);color:var(--texto);border-radius:999px;padding:7px 12px;font-size:12px;line-height:1;font-family:'DM Sans',sans-serif;cursor:pointer}
    .menu-acceso-btn:hover{background:var(--fondo)}
  `;
  document.head.appendChild(style);

  const items = [
    { label: 'Calculadora', action: () => (typeof irAPaso1 === 'function' ? irAPaso1() : window.scrollTo({ top: 0, behavior: 'smooth' })) },
    { label: 'Regiones', action: () => (typeof irARegiones === 'function' ? irARegiones() : null) },
    { label: 'Subsidios', action: () => (typeof irASubsidios === 'function' ? irASubsidios() : null) },
    { label: 'Arrendar vs Comprar', action: () => (typeof irAArrendar === 'function' ? irAArrendar() : null) },
    { label: 'Mi resultado', action: () => (typeof irAResultados === 'function' ? irAResultados() : null) },
    { label: 'Guia vivienda', action: () => { window.location.href = '/guia-vivienda-chile'; } },
  ];

  const menu = document.createElement('div');
  menu.id = 'menu-acceso-rapido';
  menu.className = 'menu-acceso';
  items.forEach(it => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'menu-acceso-btn';
    btn.textContent = it.label;
    btn.addEventListener('click', it.action);
    menu.appendChild(btn);
  });
  nav.insertAdjacentElement('afterend', menu);
}

/* ── NAVEGACIÓN: EXPLORAR ────────────────────────────────────── */
function _ocultarWizard() {
  document.querySelector('.wizard-steps').style.display = 'none';
}
function _mostrarWizard() {
  document.querySelector('.wizard-steps').style.display = '';
}
function _irAScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('activa'));
  const target = document.getElementById(id);
  target.classList.add('activa');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const h = target.querySelector('h1, .sub-hero-title');
  if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
}

function volverDesdeScreen() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('activa'));
  const target = document.getElementById('screen-1');
  target.classList.add('activa');
  _mostrarWizard();
  [1, 2, 3].forEach(i => {
    const it = document.getElementById('ws' + i);
    it.classList.remove('activo', 'done');
    it.removeAttribute('aria-current');
    if (i === 1) { it.classList.add('activo'); it.setAttribute('aria-current', 'step'); }
  });
  [1, 2].forEach(i => document.getElementById('ws-l' + i).classList.remove('done'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const h = target.querySelector('h1');
  if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
}

function irARegiones() {
  _irAScreen('screen-regiones');
  _ocultarWizard();
  renderPublicRegiones();
}

function renderPublicRegiones() {
  const container = document.getElementById('pub-regiones-content');
  if (!container) return;
  const tipoEl   = document.getElementById('pub-tipo');
  const m2El     = document.getElementById('pub-m2');
  const tipo     = tipoEl ? tipoEl.value : 'depto';
  const m2       = m2El ? Math.max(10, parseFloat(m2El.value) || 55) : 55;
  const ufKey    = tipo === 'usada' ? 'usada' : tipo;
  const tipoLabel = tipo === 'depto' ? 'Departamento' : tipo === 'casa' ? 'Casa' : 'Vivienda usada';
  const piePct   = 20, tasa = 4.1, plazo = 25;

  document.getElementById('pub-reg-sub').textContent =
    `${tipoLabel} ${m2}m² · dividendo con pie 20%, 25 años, tasa 4.1% anual`;

  const filas = Object.entries(REGIONES)
    .map(([k, v]) => ({ k, v, uf: v[ufKey] * m2 }))
    .sort((a, b) => a.uf - b.uf);

  // ── Renderizar tabla base con columna ML (loading state) ──
  let html = `<div class="tabla-wrap"><table>
    <thead><tr>
      <th>Región</th><th>Precio m²</th><th>Estimado ${tipoLabel} ${m2}m²</th>
      <th>Precio real ML</th>
      <th>Dividendo mensual</th><th>Pie requerido (20%)</th>
    </tr></thead><tbody>`;

  filas.forEach(({ k, v, uf }) => {
    const clp    = uf * UF_VALOR;
    const div    = cuotaMensual(uf * (1 - piePct / 100), tasa, plazo);
    const pieClp = uf * (piePct / 100) * UF_VALOR;
    const priceKey = v[ufKey];
    html += `<tr data-region-key="${k}">
      <td><strong>${v.nombre}</strong></td>
      <td style="font-size:12px">$${fmt(priceKey * UF_VALOR)}/m²<br><span style="color:var(--suave2)">${priceKey} UF/m²</span></td>
      <td>$${fmt(clp)}<br><span style="font-size:11px;color:var(--suave)">${fmt(Math.round(uf))} UF</span></td>
      <td class="ml-precio-cell" id="ml-cell-${k}"><span class="ml-loading">⏳</span></td>
      <td><strong>$${fmt(div)}</strong>/mes</td>
      <td>$${fmt(pieClp)}</td>
    </tr>`;
  });
  html += '</tbody></table></div>';
  html += `<p style="font-size:11px;color:var(--suave);margin-top:.5rem;text-align:right">
    📡 Precios reales: MercadoLibre en tiempo real · Estimados: CChC Q3 2025
  </p>`;
  container.innerHTML = html;

  // ── Cargar precios ML de forma asincrónica ─────────────────
  if (typeof realEstateAPI !== 'undefined') {
    filas.forEach(({ k }) => {
      realEstateAPI.getPrices(k, tipo === 'all' ? 'all' : tipo)
        .then(data => {
          const cell = document.getElementById(`ml-cell-${k}`);
          if (!cell) return;
          const estimadoUF = (REGIONES[k]?.[ufKey] ?? 0) * m2;
          const diff       = data.promedioUF - Math.round(estimadoUF);
          const pct        = estimadoUF > 0 ? Math.round((diff / estimadoUF) * 100) : 0;
          const diffIcon   = diff > 50 ? '🔴' : diff < -50 ? '🟢' : '🟡';
          const diffLabel  = diff > 0 ? `+${diff} UF vs estimado` : `${diff} UF vs estimado`;

          const fuente = data.fuente === 'MercadoLibre' ? '' :
            '<br><span style="font-size:10px;color:var(--suave)">est. CChC</span>';

          cell.innerHTML = `<strong>${data.promedioUF} UF</strong>
            <br><span style="font-size:11px;color:var(--suave)">~$${fmt(data.promedioCLP)}</span>
            <br><span style="font-size:10.5px">${diffIcon} ${diffLabel} (${pct > 0 ? '+' : ''}${pct}%)${fuente}</span>`;

          // Resaltar fila si el precio real diverge significativamente (>15%)
          const row = cell.closest('tr');
          if (row) {
            if (pct > 15) row.classList.add('ml-row--caro');
            else if (pct < -15) row.classList.add('ml-row--barato');
          }
        })
        .catch(() => {
          const cell = document.getElementById(`ml-cell-${k}`);
          if (cell) cell.innerHTML = '<span style="color:var(--suave);font-size:11px">—</span>';
        });
    });
  }
}

function irAArrendar() {
  _irAScreen('screen-arrendar');
  _ocultarWizard();
}

function calcPublicAVC() {
  const precio  = parseCLP('pub-precio');
  const arr     = parseCLP('pub-arriendo');
  const res     = document.getElementById('pub-avc-resultado');
  const hintEl  = document.getElementById('pub-div-hint');

  if (precio <= 0) {
    res.innerHTML = '';
    if (hintEl) hintEl.textContent = 'Calcularemos el dividendo estimado';
    return;
  }
  const precioUF = precio / UF_VALOR;
  const div      = Math.round(cuotaMensual(precioUF * 0.80, 4.1, 25));
  if (hintEl) hintEl.textContent = `→ Dividendo estimado: $${fmt(div)}/mes (pie 20%, 25 años, 4.1%)`;

  if (arr <= 0) {
    const pieClp = precio * 0.20;
    res.innerHTML = `
      <div style="border:1.5px solid var(--borde);border-radius:14px;padding:1.2rem 1.4rem;margin-bottom:12px">
        <div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--suave);margin-bottom:8px">ESTIMADO DE COMPRA</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div>
            <div style="font-size:11px;color:var(--suave);margin-bottom:3px">Dividendo mensual</div>
            <div style="font-family:'Fraunces',serif;font-size:1.4rem;font-weight:600;color:var(--negro)">$${fmt(div)}<span style="font-size:.8rem;font-weight:300">/mes</span></div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--suave);margin-bottom:3px">Pie requerido (20%)</div>
            <div style="font-family:'Fraunces',serif;font-size:1.4rem;font-weight:600;color:var(--negro)">$${fmt(pieClp)}</div>
          </div>
        </div>
        <div style="font-size:12px;color:var(--suave);margin-top:10px">Ingresa el arriendo mensual para comparar cuál opción te conviene más.</div>
      </div>`;
    return;
  }

  const dif    = div - arr;
  const absDif = fmt(Math.abs(dif));
  let veredictoHtml = '';

  if (dif < 0) {
    veredictoHtml = `
      <div style="background:var(--verde-l);border:1.5px solid var(--verde);border-radius:14px;padding:1.2rem 1.4rem;margin-bottom:12px">
        <div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--verde);margin-bottom:5px">✅ Comprar es más barato hoy</div>
        <div style="font-family:'Fraunces',serif;font-size:1.5rem;font-weight:600;color:var(--negro);margin-bottom:6px">$${absDif}/mes menos que arrendar</div>
        <div style="font-size:13px;color:var(--texto);line-height:1.6">Con cada dividendo estás construyendo patrimonio — esa plata queda para ti. Además tienes estabilidad: nadie te puede subir el arriendo ni pedirte que te vayas.</div>
      </div>`;
  } else {
    const TASA = 4.1, r = (TASA / 100) / 12, n = 25 * 12;
    const monto = precioUF * 0.80 * UF_VALOR;
    let saldo = monto, capitalAcum = 0, extraAcum = 0, meses = null;
    for (let m = 1; m <= n; m++) {
      const interes = saldo * r;
      const amort   = div - interes;
      if (amort <= 0) break;
      capitalAcum += amort; extraAcum += dif; saldo -= amort;
      if (capitalAcum >= extraAcum) { meses = m; break; }
    }
    const beTxt = meses
      ? `A los ${Math.ceil(meses / 12)} años te empieza a convenir comprar`
      : 'En el plazo analizado arrendar sigue siendo más barato';
    veredictoHtml = `
      <div style="background:var(--amarillo-l);border:1.5px solid var(--amarillo);border-radius:14px;padding:1.2rem 1.4rem;margin-bottom:12px">
        <div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--amarillo);margin-bottom:5px">⚖️ Arrendar es más barato hoy</div>
        <div style="font-family:'Fraunces',serif;font-size:1.5rem;font-weight:600;color:var(--negro);margin-bottom:6px">$${absDif}/mes más barato arrendar</div>
        <div style="font-size:13px;color:var(--texto);line-height:1.6">Hoy pagas menos arrendando, pero parte del dividendo queda como tuyo (patrimonio). <strong>${beTxt}</strong> — porque el capital que acumulas en la propiedad supera lo que pagaste de más.</div>
      </div>`;
  }

  const prosHtml = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div style="border:1.5px solid var(--borde);border-radius:12px;padding:1rem">
        <div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--suave);margin-bottom:8px">🏠 Si compras</div>
        <div style="font-size:12px;color:var(--texto);line-height:1.8">✓ Construyes patrimonio<br>✓ Dividendo fijo, sin alzas<br>✓ Puedes modificar la propiedad<br>✗ Menos liquidez</div>
      </div>
      <div style="border:1.5px solid var(--borde);border-radius:12px;padding:1rem">
        <div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--suave);margin-bottom:8px">📦 Si arriendas</div>
        <div style="font-size:12px;color:var(--texto);line-height:1.8">✓ Más liquidez mensual<br>✓ Flexibilidad para moverte<br>✗ El arriendo puede subir<br>✗ No acumulas patrimonio</div>
      </div>
    </div>`;
  res.innerHTML = veredictoHtml + prosHtml;
}

/* ── SUBSIDIOS RÁPIDOS (pantalla pública) ────────────────────── */
function irASubsidios() {
  const v = document.getElementById('sueldo').value;
  if (v) document.getElementById('sub-sueldo').value = v;
  _irAScreen('screen-subsidios');
  _ocultarWizard();
  checkSubsidiosRapido();
}

function volverDesdeSubsidios() { volverDesdeScreen(); }

function irACalculadoraCompleta() {
  const v = parseCLP('sub-sueldo');
  if (v > 0) document.getElementById('sueldo').value = v.toLocaleString('es-CL');
  const p = document.getElementById('sub-primera').checked;
  document.getElementById('primera').checked = p;
  document.getElementById('btn-primera').classList.toggle('activo', p);
  volverDesdeScreen();
}

function checkSubsidiosRapido() {
  const sueldo = parseCLP('sub-sueldo');
  const lista  = document.getElementById('subs-lista-pub');
  const cta    = document.getElementById('sub-cta-completo');

  if (sueldo <= 0) {
    if (lista) lista.innerHTML = `
      <div class="sub-empty-state">
        <span style="font-size:2rem">🏛</span>
        <p>Ingresa tu sueldo para ver a qué subsidios calificas</p>
      </div>`;
    if (cta) cta.style.display = 'none';
    return;
  }

  renderSubsidiosPublico();
  if (cta) cta.style.display = 'flex';
}

/* ── INICIALIZACIÓN ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  inyectarMenuAccesoRapido();
  inyectarNarrativaHome();
  inyectarBloqueConfianzaHome();
  actualizarSliderArriendo();

  // Marcar slider de arriendo como "tocado" cuando el usuario interactúa
  const sl = document.getElementById('arriendo-slider');
  if (sl) sl.addEventListener('pointerdown', () => { sl.dataset.tocado = '1'; });

  // Fetch UF en vivo
  cargarUF();

  // Expandir/colapsar tarjetas de escenario (event delegation — sobrevive re-renders)
  const escGrid = document.getElementById('escenarios-grid');
  if (escGrid) {
    escGrid.addEventListener('click', e => {
      const card = e.target.closest('.esc-card');
      if (!card || card.classList.contains('esc-no-aplica')) return;
      card.classList.toggle('expandido');
      const hint = card.querySelector('.esc-expand-hint');
      if (hint) hint.textContent = card.classList.contains('expandido') ? '▴ ocultar' : '▾ ver detalles';
    });
  }

  // Navegación de tabs con teclado (ARIA roving tabindex)
  const tablist = document.querySelector('[role="tablist"]');
  if (tablist) {
    tablist.addEventListener('keydown', e => {
      const tabs = [...tablist.querySelectorAll('[role="tab"]')];
      const idx  = tabs.indexOf(document.activeElement);
      if (idx === -1) return;
      let next = -1;
      if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End')  next = tabs.length - 1;
      if (next !== -1) {
        e.preventDefault();
        tabs[next].focus();
        tabs[next].click();
      }
    });
  }
});

/* ============================================================
   AGENTE HIPOTECARIO CONVERSACIONAL — CHILE 2026
   Motor basado en detección de intención (sin dependencias externas).
   Aprovecha cuotaMensual(), maxCreditoPorSueldo() y UF_VALOR
   ya definidos en este archivo.
   ============================================================ */

/* ── Utilidades de texto ─────────────────────────────────── */
const _n = s => s
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')   // quitar tildes
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

/** Extrae el primer número >= umbral de un texto (p. ej. sueldo). */
function _extractNumber(text, minVal = 100000) {
  const matches = text.replace(/\./g, '').match(/\d+/g) || [];
  for (const m of matches) {
    const n = parseInt(m, 10);
    if (n >= minVal) return n;
  }
  return null;
}

/**
 * Detecta sueldos/montos en lenguaje natural chileno.
 * Soporta: 600mil, 600 mil, 600k, 600 lucas, 1.2 millones, $600.000, 600000
 * @param {string} texto
 * @returns {number|null}
 */
function detectarSueldoFlexible(texto) {
  if (!texto) return null;
  const msg = texto.toLowerCase().replace(/\$/g, '').replace(/\./g, '').trim();

  // "1.2 millones" / "un millon" / "1 millon"
  const millon = msg.match(/(\d+[\.,]?\d*)\s*millon/);
  if (millon) {
    const n = parseFloat(millon[1].replace(',', '.'));
    return isNaN(n) ? null : Math.round(n * 1000000);
  }

  // "600 mil" / "600mil" / "seiscientos mil"
  if (/\bmil\b/.test(msg)) {
    const n = parseInt(msg.replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? null : n * 1000;
  }

  // "600k"
  if (/\d+\s*k\b/.test(msg)) {
    const n = parseInt(msg.replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? null : n * 1000;
  }

  // "600 lucas" / "600 luca"
  if (/luca/.test(msg)) {
    const n = parseInt(msg.replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? null : n * 1000;
  }

  // número grande directo: 600000
  const big = msg.match(/\b[0-9]{6,9}\b/);
  if (big) return parseInt(big[0], 10);

  // número de 2-3 dígitos tratado como miles: 600 → 600.000
  // solo si hay contexto de sueldo (evitar falsos positivos en UF)
  const small = msg.match(/\b([1-9][0-9]{2,3})\b/);
  if (small) return parseInt(small[1], 10) * 1000;

  return null;
}

/** Formatea número en pesos CLP abreviado: 1.200.000 → "$1.200.000" */
const _clp = n => '$' + Math.round(n).toLocaleString('es-CL');

/* ── Base de conocimiento: respuestas por intención ──────── */
const CHAT_KB = {

  /* ── A. ¿PUEDO COMPRAR? ──────────────────────────────────── */
  puedoComprar(sueldo) {
    const s   = sueldo || 0;
    const uf  = UF_VALOR || 38500;
    const div = s * 0.30;
    const cr  = maxCreditoPorSueldo(s, 4.1, 25);
    const ufI = s / uf;
    const tope = cr / (1 - 0.20) / uf;

    if (s <= 0) {
      return `Para saber si puedes comprar necesito tu sueldo líquido mensual. 💬 ¿Cuánto ganas al mes (lo que te depositan)?`;
    }

    const subsTexto = ufI <= 25
      ? `\n\n🏛 <strong>Subsidio DS19:</strong> con ${ufI.toFixed(1)} UF/mes podrías calificar (máximo 25 UF). Te darían hasta <strong>180 UF (~${_clp(180 * uf)})</strong> para descontar del precio.`
      : ufI <= 37
        ? `\n\n🏛 <strong>Subsidio DS1 Tramo 1:</strong> con ${ufI.toFixed(1)} UF/mes podrías calificar. Te darían hasta <strong>130 UF (~${_clp(130 * uf)})</strong>.`
        : ufI <= 60
          ? `\n\n🏛 <strong>Subsidio DS1 Tramo 2:</strong> con ${ufI.toFixed(1)} UF/mes podrías calificar. Te darían hasta <strong>90 UF (~${_clp(90 * uf)})</strong>.`
          : ufI <= 78
            ? `\n\n🏛 <strong>Subsidio DS1 Tramo 3:</strong> con ${ufI.toFixed(1)} UF/mes podrías calificar. Te darían hasta <strong>60 UF (~${_clp(60 * uf)})</strong>.`
            : `\n\n💡 Con ${ufI.toFixed(1)} UF/mes de ingreso, los subsidios DS1/DS19 no aplican (máximo es 78 UF), pero puedes usar <strong>FOGAES</strong> para entrar con solo 10% de pie.`;

    return `Con un sueldo de <strong>${_clp(s)}/mes</strong> esto es lo que el banco puede prestarte:

<div class="chat-calc">📊 Ingreso mensual: ${_clp(s)}
🏦 30% esfuerzo máximo: ${_clp(div)}/mes de dividendo
💳 Crédito máximo estimado: ${_clp(cr)}
🏠 Precio vivienda máximo (pie 20%): ~${_clp(cr / 0.80)}
📐 En UF: ~${Math.round(tope)} UF · 4.1% tasa · 25 años</div>${subsTexto}

🔑 <strong>FOGAES:</strong> si no tienes el 20% de pie, puedes entrar con solo el <strong>10%</strong> (el Estado garantiza la diferencia). Aplica a viviendas hasta 4.500 UF.

¿Quieres que calcule cuánto necesitas de pie o en qué región puedes comprar?`;
  },

  /* ── B. PRECIOS DE VIVIENDA (datos estáticos CChC) ─────── */
  preciosVivienda(region) {
    const uf = UF_VALOR || 38500;
    const r  = region || 'RM';
    const d  = REGIONES[r];
    if (!d) {
      // Mostrar resumen general con datos CChC + invitar a ver ML
      const items = [
        ['Región Metropolitana', REGIONES.RM],
        ['Valparaíso', REGIONES.VAL],
        ['Antofagasta', REGIONES.ANT],
        ['Biobío/Concepción', REGIONES.BIO],
        ['Maule', REGIONES.MAU],
        ['La Araucanía', REGIONES.ARA],
      ];
      const rows = items.map(([n, v]) =>
        `${n}: depto ~${v.depto * 55} UF (~${_clp(v.depto * 55 * uf)})`
      ).join('\n');
      return `Aquí van los precios referenciales de un depto de 55 m² por región (CChC Q3 2025):

<div class="chat-calc">${rows}
...y más en la calculadora 👇</div>

💡 También puedo mostrarte precios <strong>reales de mercado</strong> desde MercadoLibre. Dime una región específica (ej: "precios en Valparaíso") para ver datos actuales. ¿Quieres comparar con tu sueldo?`;
    }
    const p55 = d.depto * 55;
    const div = cuotaMensual(p55 * 0.80, 4.1, 25);
    return `En <strong>${d.nombre}</strong> los precios de referencia (CChC Q3 2025) son:

<div class="chat-calc">🏢 Departamento: ${d.depto} UF/m² → 55m² = ${p55} UF (~${_clp(p55 * uf)})
🏠 Casa nueva: ${d.casa} UF/m² → 55m² = ${d.casa * 55} UF (~${_clp(d.casa * 55 * uf)})
🏡 Usada: ${d.usada} UF/m² → 55m² = ${d.usada * 55} UF (~${_clp(d.usada * 55 * uf)})</div>

Con <strong>pie del 20%</strong> y 25 años al 4.1%, el dividendo de un depto 55m² sería de aprox. <strong>${_clp(div)}/mes</strong>.

🔎 ¿Quieres ver precios <strong>reales de MercadoLibre</strong> en ${d.nombre}? Escribe "precios reales ${d.nombre.split(' ')[0]}" y los busco ahora.`;
  },

  /* ── B2. PRECIOS REALES ML (async, retorna Promise<string>) ─ */
  async preciosViviendaML(region, sueldo = 0) {
    const uf  = UF_VALOR || 38500;
    const rk  = (typeof resolveRegionKey !== 'undefined') ? resolveRegionKey(region || 'RM') : 'RM';
    const d   = REGIONES[rk] ?? REGIONES['RM'];

    // Mensaje provisional mientras carga
    const loadingMsg = `🔍 Consultando precios reales en <strong>${d.nombre}</strong> desde MercadoLibre…`;

    try {
      const data = await realEstateAPI.getPrices(region, 'all');
      const { promedioUF, promedioCLP, medianaUF, minUF, maxUF, m2Promedio, cantidadResultados, fuente } = data;

      // Comparar con capacidad hipotecaria del usuario si hay sueldo
      let comparacion = '';
      if (sueldo > 0) {
        const capacidadCLP = maxCreditoPorSueldo(sueldo, 4.1, 25, 0.30);
        const capacidadUF  = Math.round(capacidadCLP / uf / 0.80); // precio máximo (pie 20%)
        const comp = formatRealMarketComparison(promedioUF, capacidadUF, sueldo);
        comparacion = `\n\n📊 <strong>Tu caso:</strong> ${comp.mensaje}` +
          (comp.sugerenciaSubsidio ? `\n${comp.sugerenciaSubsidio}` : '');
      }

      const fuenteLabel = fuente === 'MercadoLibre'
        ? `📡 <span style="font-size:11px;color:var(--suave)">Datos en tiempo real: MercadoLibre (${cantidadResultados} propiedades)</span>`
        : `📊 <span style="font-size:11px;color:var(--suave)">Estimado referencial CChC (API no disponible)</span>`;

      const m2Txt = m2Promedio ? ` · ${m2Promedio}m² promedio` : '';

      return `Precios reales en <strong>${d.nombre}</strong>${m2Txt}:

<div class="chat-calc">📈 Promedio de mercado: ${promedioUF} UF (~${_clp(promedioCLP)})
📍 Mediana:            ${medianaUF} UF
⬇️  Mínimo listado:    ${minUF} UF
⬆️  Máximo listado:    ${maxUF} UF</div>

${fuenteLabel}${comparacion}

¿Quieres que calcule cuánto necesitas ganar para comprar en ${d.nombre.split(' ')[0]}?`;
    } catch {
      return `Lo siento, no pude obtener datos de mercado en este momento. Te muestro los datos de referencia CChC:
${CHAT_KB.preciosVivienda(rk)}`;
    }
  },

  /* ── C. CRÉDITO HIPOTECARIO ─────────────────────────────── */
  creditoHipotecario(sueldo) {
    const s  = sueldo || 0;
    const uf = UF_VALOR || 38500;
    if (s <= 0) {
      return `El banco en Chile normalmente financia hasta el <strong>80–90%</strong> del valor de la propiedad. Lo más importante es la <strong>regla de esfuerzo</strong>:

📌 <strong>El dividendo mensual no puede superar el 25–30% de tu sueldo líquido.</strong>

Cuéntame tu sueldo y te calculo cuánto puede prestarte el banco. ¿Cuánto ganas al mes?`;
    }
    const cr30 = maxCreditoPorSueldo(s, 4.1, 25, 0.30);
    const cr25 = maxCreditoPorSueldo(s, 4.1, 25, 0.25);
    const div30 = s * 0.30;
    const div25 = s * 0.25;
    return `Con <strong>${_clp(s)}/mes</strong> de sueldo, el banco puede prestarte:

<div class="chat-calc">📐 Regla 30% (más común)
   → Dividendo máx: ${_clp(div30)}/mes
   → Crédito estimado: ${_clp(cr30)}
   → Precio vivienda máx: ~${_clp(cr30 / 0.80)}

📐 Regla 25% (más conservador)
   → Dividendo máx: ${_clp(div25)}/mes
   → Crédito estimado: ${_clp(cr25)}
   → Precio vivienda máx: ~${_clp(cr25 / 0.80)}</div>

🔢 Calculado con tasa 4.1% anual y plazo de 25 años (pie 20%).

💡 Si tienes un <strong>codeudor</strong> (pareja, familiar), los sueldos se suman — aumenta el crédito. ¿Tienes codeudor?`;
  },

  /* ── D. EL PIE ───────────────────────────────────────────── */
  pie(precioClp, sueldo) {
    const uf = UF_VALOR || 38500;
    if (!precioClp) {
      return `El <strong>pie</strong> (o "entrada") es el dinero que pagas tú antes de pedir el crédito. En Chile:

<div class="chat-calc">📋 Estándar normal:    20% del precio
🔑 Con FOGAES:         10% del precio (el Estado garantiza el resto)
🏛 Con subsidio DS19:  puede ser 0% (el bono cubre el pie)</div>

Por ejemplo, para una vivienda de $100.000.000:
• Pie 20% = $20.000.000
• Pie 10% (FOGAES) = $10.000.000

¿Quieres saber cuánto sería el pie para un precio específico? Dime el valor de la vivienda.`;
    }
    const pie20 = precioClp * 0.20;
    const pie10 = precioClp * 0.10;
    const ufPrecio = Math.round(precioClp / uf);
    const div = cuotaMensual((precioClp * 0.80) / uf, 4.1, 25);
    const divFog = cuotaMensual((precioClp * 0.90) / uf, 4.1, 25);
    const sueldoMin20 = div / 0.30;
    const sueldoMin10 = divFog / 0.30;
    return `Para una vivienda de <strong>${_clp(precioClp)}</strong> (~${ufPrecio} UF):

<div class="chat-calc">💰 Pie 20% estándar: ${_clp(pie20)}
🔑 Pie 10% con FOGAES: ${_clp(pie10)}
📊 Dividendo (pie 20%): ${_clp(div)}/mes → sueldo mín: ${_clp(sueldoMin20)}
📊 Dividendo (pie 10% FOGAES): ${_clp(divFog)}/mes → sueldo mín: ${_clp(sueldoMin10)}</div>

${sueldo > 0 ? `Con tu sueldo de ${_clp(sueldo)}/mes, el dividendo representa el ${((div / sueldo) * 100).toFixed(1)}% (${div / sueldo <= 0.30 ? '✅ dentro del 30% del banco' : '⚠️ supera el 30%, el banco puede rechazarlo'}).` : '¿Cuánto ganas al mes para ver si puedes calificar?'}`;
  },

  /* ── E. SUBSIDIOS ────────────────────────────────────────── */
  subsidios(sueldo) {
    const uf  = UF_VALOR || 38500;
    if (sueldo <= 0) {
      return `Los subsidios habitacionales en Chile en 2026 son:

<div class="chat-calc">🏘️ DS19 — Vivienda social
   Ingreso: hasta 25 UF/mes (~${_clp(25 * uf)})
   Monto:   hasta 180 UF (~${_clp(180 * uf)})
   Tope:    vivienda hasta 950 UF

🏠 DS1 Tramo 1 — Clase media baja
   Ingreso: hasta 37 UF/mes (~${_clp(37 * uf)})
   Monto:   130 UF (~${_clp(130 * uf)})
   Tope:    vivienda hasta 1.100 UF

🏠 DS1 Tramo 2 — Clase media
   Ingreso: 37–60 UF/mes
   Monto:   90 UF (~${_clp(90 * uf)})
   Tope:    vivienda hasta 1.600 UF

🏠 DS1 Tramo 3 — Clase media alta
   Ingreso: 60–78 UF/mes (~${_clp(78 * uf)})
   Monto:   60 UF (~${_clp(60 * uf)})
   Tope:    vivienda hasta 2.200 UF

🔑 FOGAES — Pie mínimo 10%
   Disponible para todos, vivienda hasta 4.500 UF
   Lo tramita el banco automáticamente.

📉 Ley 21.748 — Subsidio a la tasa
   Vivienda nueva hasta 4.000 UF · tasa baja ~0.6%</div>

Dime tu sueldo y te digo exactamente a cuál calificas.`;
    }
    const ufI = sueldo / uf;
    let sub = null;
    if      (ufI <= 25) sub = { nombre: 'DS19',         monto: 180, tope: 950,  tramo: 'social' };
    else if (ufI <= 37) sub = { nombre: 'DS1 Tramo 1',  monto: 130, tope: 1100, tramo: '1' };
    else if (ufI <= 60) sub = { nombre: 'DS1 Tramo 2',  monto: 90,  tope: 1600, tramo: '2' };
    else if (ufI <= 78) sub = { nombre: 'DS1 Tramo 3',  monto: 60,  tope: 2200, tramo: '3' };

    if (sub) {
      const precio_ef = sub.tope - sub.monto;
      const div       = cuotaMensual(precio_ef * 0.80, 4.1, 25);
      return `Con <strong>${_clp(sueldo)}/mes</strong> (${ufI.toFixed(1)} UF/mes), calificas al <strong>${sub.nombre}</strong>:

<div class="chat-calc">🎁 Subsidio del Estado: ${sub.monto} UF (~${_clp(sub.monto * uf)})
🏠 Precio máx. vivienda: ${sub.tope} UF (~${_clp(sub.tope * uf)})
📉 Precio efectivo tras subsidio: ${precio_ef} UF (~${_clp(precio_ef * uf)})
📊 Dividendo estimado (pie 20%): ${_clp(div)}/mes</div>

${ufI <= 25 ? `💰 <strong>Bono Pie DS19:</strong> +30 UF extra para la entrada (~${_clp(30 * uf)}). Pídelo junto al subsidio.` : ''}

📍 Para postular: <strong>minvu.gob.cl → Subsidios habitacionales</strong> o la SEREMI de tu región.

🔑 <strong>FOGAES</strong> también aplica: puedes entrar con solo el 10% de pie en vez del 20%.`;
    }
    return `Con <strong>${_clp(sueldo)}/mes</strong> (${ufI.toFixed(1)} UF/mes) tu ingreso supera el tope de los subsidios DS1/DS19 (máximo 78 UF/mes).

Pero tienes estas opciones:
• <strong>FOGAES:</strong> pie mínimo 10% en vez del 20% (cualquier ingreso, hasta 4.500 UF de precio).
• <strong>Ley 21.748:</strong> subsidio a la tasa de interés — tu dividendo baja ~0.6% los primeros 5 años.
• <strong>Codeudor:</strong> si tienes pareja o familiar, los sueldos se suman para calificar a mejor crédito.`;
  },

  /* ── F. ARRENDAR VS COMPRAR ──────────────────────────────── */
  arrendarVsComprar(sueldo, arriendoMensual) {
    const s   = sueldo || 0;
    const arr = arriendoMensual || 0;
    const uf  = UF_VALOR || 38500;

    if (s <= 0 && arr <= 0) {
      return `La gran pregunta 🤔 En Chile, la decisión depende de varios factores:

<div class="chat-calc">✅ COMPRAR conviene cuando:
   → El dividendo es similar o menor al arriendo del mismo bien
   → Planeas quedarte 5+ años en la misma ciudad
   → Tienes el pie (o acceso a FOGAES)
   → Quieres estabilidad y patrimonio

✅ ARRENDAR conviene cuando:
   → Necesitas flexibilidad (trabajo, ciudad)
   → El dividendo sería muy alto vs tu sueldo
   → No tienes el pie todavía
   → El mercado está sobrevaluado en tu zona</div>

En Chile, históricamente los arriendos suben con la inflación (UF), mientras que el dividendo queda fijo. A largo plazo, comprar suele ser mejor opción patrimonial.

Dime tu sueldo y el arriendo que pagarías, y calculo cuál te conviene más.`;
    }

    if (s > 0 && arr <= 0) {
      const maxPrecio = maxCreditoPorSueldo(s, 4.1, 25) / 0.80;
      const divEst    = cuotaMensual((maxPrecio * 0.80) / uf, 4.1, 25);
      return `Con <strong>${_clp(s)}/mes</strong> de sueldo, podrías comprar una vivienda de hasta ~${_clp(maxPrecio)}.
El dividendo sería de aprox. <strong>${_clp(divEst)}/mes</strong>.

¿Cuánto pagarías de arriendo por esa misma vivienda? Así comparo cuál te conviene.`;
    }

    const divMax  = s * 0.30;
    const maxPrecio = maxCreditoPorSueldo(s, 4.1, 25) / 0.80;
    const divComp = cuotaMensual((maxPrecio * 0.80) / uf, 4.1, 25);
    const dif     = divComp - arr;
    const mejor   = dif <= 0 ? 'COMPRAR' : 'ARRENDAR (hoy)';

    return `Comparativa para <strong>${_clp(s)}/mes</strong> de sueldo:

<div class="chat-calc">🏠 Dividendo estimado (vivienda máx): ${_clp(divComp)}/mes
📦 Arriendo mensual informado: ${_clp(arr)}/mes
📊 Diferencia: ${dif > 0 ? '+' : ''}${_clp(dif)}/mes ${dif > 0 ? '(comprar es más caro)' : '(comprar es más barato)'}</div>

${dif <= 0
  ? `✅ <strong>Comprar te sale más barato que arrendar hoy</strong>. Cada dividendo que pagas construye patrimonio — esa plata es tuya.`
  : `⚖️ Arrendar es ${_clp(Math.abs(dif))}/mes más barato hoy. Sin embargo, parte del dividendo queda como patrimonio tuyo y el dividendo no sube (el arriendo sí).`
}

💡 Recuerda: para comprar necesitas el pie (${_clp(maxPrecio * 0.20)} con 20%, o ${_clp(maxPrecio * 0.10)} con FOGAES).`;
  },

  /* ── G. PROCESO DE COMPRA ────────────────────────────────── */
  procesoCompra() {
    return `El proceso de comprar una casa en Chile tiene estos pasos:

<div class="chat-calc">1️⃣ AHORRO DEL PIE
   Junta al menos el 10% (FOGAES) o 20% estándar
   del precio de la propiedad.

2️⃣ PRE-APROBACIÓN BANCARIA
   Ve al banco con tus liquidaciones (3 meses).
   Te dirán cuánto pueden prestarte.

3️⃣ BÚSQUEDA Y OFERTA
   Encuentra la propiedad. Firma promesa de compraventa
   (notaría). Paga una reserva (~1–2%).

4️⃣ TASACIÓN
   El banco tasa la propiedad (costo: ~$150.000–$250.000).
   El crédito se basa en el menor valor entre precio y tasación.

5️⃣ APROBACIÓN DEL CRÉDITO
   El banco aprueba formalmente. Proceso: 2–4 semanas.

6️⃣ ESCRITURA Y NOTARÍA
   Firma de escritura pública ante notario.
   Costos notariales + gastos operacionales: ~1–2% del valor.

7️⃣ INSCRIPCIÓN EN EL CBR
   El Conservador de Bienes Raíces registra la propiedad a tu nombre.
   Plazo: 5–10 días hábiles.

8️⃣ ¡LLAVES! 🗝️</div>

Los gastos operacionales (notaría, tasación, CBR, seguro) suman aprox. el <strong>1.5–2.5%</strong> del valor de la propiedad. No los olvides en tu presupuesto.

¿Tienes dudas sobre algún paso específico?`;
  },

  /* ── UF ──────────────────────────────────────────────────── */
  uf() {
    const uf = UF_VALOR || 38500;
    return `La <strong>Unidad de Fomento (UF)</strong> es la unidad de valor que usa Chile para los créditos hipotecarios. Se ajusta diariamente según la inflación del mes anterior.

<div class="chat-calc">📅 UF hoy: $${uf.toLocaleString('es-CL', { minimumFractionDigits: 2 })}
📌 Fuente: mindicador.cl (actualización automática)</div>

Los precios de viviendas en Chile se expresan en UF para protegerse de la inflación. Así, si el dividendo es de "2 UF/mes", siempre será el mismo porcentaje del precio — aunque la inflación suba.

¿Quieres saber cuánto vale en pesos una vivienda de X UF?`;
  },

  /* ── Fallback ─────────────────────────────────────────────── */
  fallback() {
    return `No entendí bien tu pregunta 🤔 Puedo ayudarte con:

• <strong>¿Puedo comprar una casa con mi sueldo?</strong>
• <strong>¿Cuánto cuesta una casa en [región]?</strong>
• <strong>¿A qué subsidio califico?</strong>
• <strong>¿Cuánto necesito de pie?</strong>
• <strong>¿Cuánto me presta el banco?</strong>
• <strong>¿Conviene arrendar o comprar?</strong>
• <strong>¿Cómo es el proceso de compra?</strong>
• <strong>¿Qué es la UF?</strong>

Escribe tu pregunta o usa los botones de abajo 👇`;
  },
};

/* ── Mapa de regiones: palabras clave → código ───────────── */
const REGION_KEYWORDS = {
  'metropolitana|santiago|rm|capital|santiaguino': 'RM',
  'antofagasta':                                   'ANT',
  'valparaiso|vina|valpo|v region':                'VAL',
  'biobio|concepcion|bio|penco|talcahuano':        'BIO',
  'coquimbo|serena|la serena':                     'COQ',
  'tarapaca|iquique':                              'TAR',
  'arica':                                         'ARI',
  'atacama|copiapo':                               'ATA',
  'ohiggins|rancagua':                             'OHI',
  'maule|talca':                                   'MAU',
  'nuble|chillan':                                 'NUB',
  'araucania|temuco':                              'ARA',
  'rios|valdivia':                                 'RIO',
  'lagos|puerto montt':                            'LAG',
  'aysen|coihaique':                               'AYS',
  'magallanes|punta arenas':                       'MAG',
};

function _detectRegion(text) {
  const t = _n(text);
  for (const [pattern, code] of Object.entries(REGION_KEYWORDS)) {
    if (new RegExp(pattern).test(t)) return code;
  }
  return null;
}

/* ══════════════════════════════════════════════════════════════
   MOTOR DE CHAT BASADO EN BOTONES (sin input de texto)
   ══════════════════════════════════════════════════════════════

   Estado del agente: sueldo y región seleccionados por el usuario
   vía botones. Nunca se pide escribir nada.
   ============================================================ */

/* Sueldos predefinidos disponibles para selección */
const SUELDOS_PRESET = [
  { label: '$400.000', value: 400_000 },
  { label: '$600.000', value: 600_000 },
  { label: '$900.000', value: 900_000 },
  { label: '$1.2M',    value: 1_200_000 },
  { label: '$1.8M',    value: 1_800_000 },
  { label: '$2.5M+',   value: 2_500_000 },
];

/* Regiones disponibles para selección */
const REGIONES_BTN = [
  { label: '🏙 RM',          key: 'RM'  },
  { label: '🌊 Valparaíso',  key: 'VAL' },
  { label: '🏭 Biobío',      key: 'BIO' },
  { label: '⛏ Antofagasta', key: 'ANT' },
  { label: '🌿 Coquimbo',    key: 'COQ' },
  { label: '🌲 Araucanía',   key: 'ARA' },
  { label: '🌾 Maule',       key: 'MAU' },
  { label: '🏔 Otras',       key: null  },
];

/* Mapa de intenciones */
const INTENTS = {
  capacidad        : 'capacidad',
  precios_reales   : 'precios_reales',
  subsidios        : 'subsidios',
  pie              : 'pie',
  arriendo_vs_compra: 'arriendo_vs_compra',
  regiones         : 'regiones',
  proceso          : 'proceso',
  uf               : 'uf',
  propiedades_reales: 'propiedades_reales',
  sel_sueldo       : 'sel_sueldo',
  sel_region       : 'sel_region',
  menu             : 'menu',
};

/* Botones del menú principal */
const MENU_BUTTONS = [
  { label: '💰 ¿Cuánto puedo pagar?',       intent: INTENTS.capacidad },
  { label: '🏘 Precios reales ML',           intent: INTENTS.precios_reales },
  { label: '🏛 Subsidios del Estado',        intent: INTENTS.subsidios },
  { label: '🔑 ¿Cuánto necesito de pie?',    intent: INTENTS.pie },
  { label: '⚖️ Arrendar vs Comprar',         intent: INTENTS.arriendo_vs_compra },
  { label: '🗺 Comparar regiones',           intent: INTENTS.regiones },
  { label: '📋 Proceso de compra',           intent: INTENTS.proceso },
  { label: '📐 ¿Qué es la UF?',             intent: INTENTS.uf },
  { label: '🏢 Ver propiedades reales',      intent: INTENTS.propiedades_reales },
];

/* Botones que siempre aparecen tras una respuesta */
const BTN_SEGUIR = [
  { label: '🏘 Precios reales',         intent: INTENTS.precios_reales },
  { label: '🏢 Ver propiedades',        intent: INTENTS.propiedades_reales },
  { label: '🏛 Subsidios',             intent: INTENTS.subsidios },
  { label: '🗺 Comparar regiones',      intent: INTENTS.regiones },
  { label: '🔙 Menú principal',         intent: INTENTS.menu },
];

/* ── Estado del agente ─────────────────────────────────── */
class ChatAgent {
  constructor() {
    this.sueldo  = 0;    // CLP, 0 = no seleccionado (usar promedio 600k)
    this.region  = 'RM'; // clave REGIONES, default RM
  }

  /** Sueldo efectivo: usa el seleccionado o el promedio Chile */
  get _sueldo() { return this.sueldo > 0 ? this.sueldo : 600_000; }

  /**
   * Procesa una INTENCIÓN (no texto libre) y retorna { html, buttons }.
   * @param {string} intent  - Una de las claves de INTENTS
   * @param {*}      [param] - Parámetro adicional (valor de sueldo, clave región…)
   * @returns {{ html: string, buttons: Array<{label,intent,param}> } | Promise}
   */
  respondTo(intent, param = null) {

    /* ── Selección de sueldo ── */
    if (intent === INTENTS.sel_sueldo) {
      this.sueldo = param;
      const uf    = UF_VALOR || 38500;
      const ufI   = this.sueldo / uf;
      return {
        html: `✅ Sueldo registrado: <strong>${_clp(this.sueldo)}/mes</strong> (${ufI.toFixed(1)} UF). ¿Qué quieres calcular?`,
        buttons: MENU_BUTTONS,
      };
    }

    /* ── Selección de región ── */
    if (intent === INTENTS.sel_region) {
      if (param) {
        this.region = param;
        const d = REGIONES[param];
        return {
          html: `📍 Región seleccionada: <strong>${d ? d.nombre : param}</strong>. ¿Qué quieres ver?`,
          buttons: [
            { label: '🏘 Precios reales ML',    intent: INTENTS.precios_reales },
            { label: '🏢 Ver propiedades',       intent: INTENTS.propiedades_reales },
            { label: '💰 Mi capacidad aquí',     intent: INTENTS.capacidad },
            { label: '🔙 Menú',                  intent: INTENTS.menu },
          ],
        };
      }
      // Sin param → mostrar botones de regiones
      return {
        html: '¿En qué región buscas?',
        buttons: REGIONES_BTN.map(r => ({ label: r.label, intent: INTENTS.sel_region, param: r.key })),
      };
    }

    /* ── Menú principal ── */
    if (intent === INTENTS.menu) {
      return {
        html: `¡Hola! 👋 Soy tu <strong>Agente Hipotecario Chile 2026</strong>. Elige lo que quieres consultar:`,
        buttons: MENU_BUTTONS,
      };
    }

    /* ── A. Capacidad de compra ── */
    if (intent === INTENTS.capacidad) {
      const s    = this._sueldo;
      const nota = this.sueldo === 0 ? ` <span style="font-size:11px;color:var(--suave)">(usando promedio Chile $600K — elige tu sueldo abajo)</span>` : '';
      const resp = CHAT_KB.puedoComprar(s);
      return {
        html: resp + nota,
        buttons: [
          ...SUELDOS_PRESET.map(p => ({ label: p.label, intent: INTENTS.sel_sueldo, param: p.value })),
          { label: '🏘 Precios reales', intent: INTENTS.precios_reales },
          { label: '🏛 Subsidios',      intent: INTENTS.subsidios },
          { label: '🔙 Menú',           intent: INTENTS.menu },
        ],
      };
    }

    /* ── B. Precios reales ML (async) ── */
    if (intent === INTENTS.precios_reales) {
      const regKey = this.region || 'RM';
      const promise = CHAT_KB.preciosViviendaML(regKey, this._sueldo)
        .then(html => ({
          html,
          buttons: [
            { label: '📍 Cambiar región',      intent: INTENTS.sel_region },
            { label: '🏢 Ver propiedades',     intent: INTENTS.propiedades_reales },
            { label: '🏛 Subsidios',           intent: INTENTS.subsidios },
            { label: '💰 Mi capacidad',        intent: INTENTS.capacidad },
            { label: '🔙 Menú',                intent: INTENTS.menu },
          ],
        }));
      return promise;
    }

    /* ── C. Subsidios ── */
    if (intent === INTENTS.subsidios) {
      const s    = this._sueldo;
      const nota = this.sueldo === 0 ? ` <span style="font-size:11px;color:var(--suave)">(estimado con sueldo $600K)</span>` : '';
      return {
        html: CHAT_KB.subsidios(s) + nota,
        buttons: [
          ...SUELDOS_PRESET.map(p => ({ label: p.label, intent: INTENTS.sel_sueldo, param: p.value })),
          { label: '📍 Cambiar región', intent: INTENTS.sel_region },
          { label: '🔙 Menú',           intent: INTENTS.menu },
        ],
      };
    }

    /* ── D. Pie ── */
    if (intent === INTENTS.pie) {
      const d    = REGIONES[this.region] ?? REGIONES.RM;
      const uf   = UF_VALOR || 38500;
      const precio = d.depto * 55 * uf;
      return {
        html: CHAT_KB.pie(precio, this._sueldo),
        buttons: [
          { label: '💰 Cambiar sueldo',       intent: INTENTS.sel_sueldo },
          { label: '📍 Cambiar región',        intent: INTENTS.sel_region },
          { label: '🏛 Ver subsidios',         intent: INTENTS.subsidios },
          { label: '🔙 Menú',                  intent: INTENTS.menu },
        ],
      };
    }

    /* ── E. Arriendo vs Comprar ── */
    if (intent === INTENTS.arriendo_vs_compra) {
      const s = this._sueldo;
      const arriendo_estimado = Math.round(s * 0.28 / 10000) * 10000;
      return {
        html: CHAT_KB.arrendarVsComprar(s, arriendo_estimado),
        buttons: BTN_SEGUIR,
      };
    }

    /* ── F. Regiones ── */
    if (intent === INTENTS.regiones) {
      return {
        html: CHAT_KB.preciosVivienda(null),
        buttons: [
          ...REGIONES_BTN.filter(r => r.key).map(r => ({ label: r.label, intent: INTENTS.sel_region, param: r.key })),
          { label: '🔙 Menú', intent: INTENTS.menu },
        ],
      };
    }

    /* ── G. Proceso de compra ── */
    if (intent === INTENTS.proceso) {
      return {
        html: CHAT_KB.procesoCompra(),
        buttons: BTN_SEGUIR,
      };
    }

    /* ── H. UF ── */
    if (intent === INTENTS.uf) {
      return {
        html: CHAT_KB.uf(),
        buttons: BTN_SEGUIR,
      };
    }

    /* ── I. Ver propiedades en portales ── */
    if (intent === INTENTS.propiedades_reales) {
      const regionKey   = this.region || 'RM';
      const uf          = UF_VALOR || 38500;
      const capacidadUF = (this.sueldo > 0)
        ? Math.round(maxCreditoPorSueldo(this.sueldo, 4.1, 25) / uf / 0.80)
        : 0;
      const d = REGIONES[regionKey] ?? {};

      let html = `<strong>🔎 Buscar propiedades — ${d.nombre ?? regionKey}</strong>`;
      if (capacidadUF > 0) {
        html += `<br><span style="font-size:12px;color:var(--suave)">Tu capacidad: <strong>${capacidadUF} UF</strong></span>`;
      }
      html += `<br><span style="font-size:12px;color:var(--suave);line-height:1.6">Elige el portal que prefieras para buscar propiedades en venta.</span>`;

      return {
        html,
        buttons: [
          { label: '🔎 MercadoLibre',  url: 'https://www.mercadolibre.cl/c/inmuebles#menu=categories' },
          { label: '🏘 TocToc',         url: 'https://www.toctoc.com/' },
          { label: '📍 Cambiar región', intent: INTENTS.sel_region },
          { label: '🔙 Menú',           intent: INTENTS.menu },
        ],
      };
    }

    /* Fallback */
    return {
      html: `Elige una opción para comenzar 👇`,
      buttons: MENU_BUTTONS,
    };
  }
}

/* Instancia única del agente */
const _chatAgent = new ChatAgent();

/* ══════════════════════════════════════════════════════════════
   UI DEL CHAT — solo botones, sin input de texto
   ============================================================ */
let _chatOpen       = false;
let _chatInited     = false;
let _chatBadgeShown = false;

/** Abre o cierra el widget de chat */
function toggleChat() {
  _chatOpen = !_chatOpen;
  const win   = document.getElementById('chat-window');
  const btn   = document.getElementById('chat-toggle');
  const badge = document.getElementById('chat-badge');

  if (_chatOpen) {
    win.removeAttribute('hidden');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Cerrar agente hipotecario');
    if (badge) badge.style.display = 'none';
    if (!_chatInited) {
      _chatInited = true;
      _handleIntent(INTENTS.menu);
    }
  } else {
    win.setAttribute('hidden', '');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Abrir agente hipotecario');
    btn.focus();
  }
}

/**
 * Procesa una intención: muestra burbuja del bot + botones.
 * Acepta respuestas síncronas { html, buttons } o Promises.
 */
function _handleIntent(intent, param = null, labelUsuario = null) {
  // Mostrar burbuja del usuario (el label del botón pulsado)
  if (labelUsuario) _appendUserMessage(labelUsuario);
  _showTyping();

  const delay = 350 + Math.random() * 300;
  const result = _chatAgent.respondTo(intent, param);

  const render = ({ html, buttons }) => {
    _hideTyping();
    _appendBotMessage(html);
    _renderButtons(buttons ?? MENU_BUTTONS);
  };

  if (result && typeof result.then === 'function') {
    // Async (Promises desde ML API)
    result
      .then(render)
      .catch(() => {
        _hideTyping();
        _appendBotMessage('Lo siento, ocurrió un error al consultar los datos. Intenta de nuevo.');
        _renderButtons(MENU_BUTTONS);
      });
  } else {
    setTimeout(() => render(result), delay);
  }
}

/** Renderiza los botones de opción debajo del último mensaje */
function _renderButtons(buttons) {
  const area = document.getElementById('chat-buttons');
  if (!area) return;
  area.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'chat-btn-grid';

  buttons.forEach(({ label, intent, param, url }) => {
    const btn = document.createElement('button');
    btn.className   = 'chat-btn';
    btn.textContent = label;
    btn.setAttribute('aria-label', label);
    if (url) {
      // Botón que abre URL externa filtrada
      btn.addEventListener('click', () => window.open(url, '_blank', 'noopener,noreferrer'));
    } else {
      btn.addEventListener('click', () => {
        _handleIntent(intent, param ?? null, label);
      });
    }
    grid.appendChild(btn);
  });

  area.appendChild(grid);
  area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/** Agrega burbuja del usuario */
function _appendUserMessage(text) {
  const el = document.createElement('div');
  el.className = 'chat-bubble message-user';
  el.textContent = text;
  _chatAppend(el);
}

/** Agrega burbuja del bot */
function _appendBotMessage(html) {
  const el = document.createElement('div');
  el.className = 'chat-bubble message-bot';
  el.innerHTML = html;
  _chatAppend(el);
}

/** Muestra el indicador de escritura */
function _showTyping() {
  let el = document.getElementById('chat-typing-indicator');
  if (el) return;
  el = document.createElement('div');
  el.className = 'chat-typing';
  el.id        = 'chat-typing-indicator';
  el.setAttribute('aria-label', 'El agente está escribiendo...');
  el.innerHTML = '<span></span><span></span><span></span>';
  _chatAppend(el);
}

/** Oculta el indicador de escritura */
function _hideTyping() {
  const el = document.getElementById('chat-typing-indicator');
  if (el) el.remove();
}

/** Inserta elemento y hace scroll */
function _chatAppend(el) {
  const area = document.getElementById('chat-messages');
  if (!area) return;
  area.appendChild(el);
  area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
}

/* Badge de notificación después de 8 segundos */
setTimeout(() => {
  if (!_chatOpen && !_chatBadgeShown) {
    _chatBadgeShown = true;
    const badge = document.getElementById('chat-badge');
    if (badge) badge.style.display = 'flex';
  }
}, 8000);

/* Compatibilidad: sendChat / sendSuggestion ya no son necesarios,
   pero se mantienen vacíos para no romper referencias en HTML antiguo */
function sendChat() {}
function sendSuggestion() {}
