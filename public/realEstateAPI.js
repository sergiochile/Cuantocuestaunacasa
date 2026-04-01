/* ============================================================
   realEstateAPI.js — Propiedades reales en venta en Chile
   Fuentes:
     · MercadoLibre Chile  (API oficial pública, sin autenticación)
       https://developers.mercadolibre.cl/es_ar/items-y-busquedas
     · TocToc               (endpoints JSON públicos — best-effort)
       https://www.toctoc.com
   ============================================================ */

'use strict';

/* ── Configuración MercadoLibre ────────────────────────────── */
const ML_CONFIG = {
  BASE_URL     : 'https://api.mercadolibre.com',
  SITE_ID      : 'MLC',
  CATEGORY     : 'MLC1459',   // Inmuebles en venta
  LIMIT        : 50,
  CACHE_TTL_MS : 20 * 60 * 1000, // 20 min
  TIMEOUT_MS   : 9000,
};

/* ── Configuración TocToc ──────────────────────────────────── */
const TOCTOC_CONFIG = {
  BASE     : 'https://www.toctoc.com/api/v1',
  TIMEOUT_MS: 9000,
};

/* ── Mapeo clave REGIONES → state_id de ML ───────────────── */
const ML_STATE_IDS = {
  RM  : 'TUxDUFJNTWFpbjEy',   // Región Metropolitana de Santiago
  VAL : 'TUxDUFZBTG1haW4x',   // Valparaíso
  BIO : 'TUxDUEJJT21haW4x',   // Biobío
  ARA : 'TUxDUEFSQW1haW4x',   // La Araucanía
  MAU : 'TUxDUE1BVW1haW4x',   // Maule
  OHI : 'TUxDUE9ISW1haW4x',   // O'Higgins
  LAG : 'TUxDUExBR21haW4x',   // Los Lagos
  COQ : 'TUxDUENPUW1haW4x',   // Coquimbo
  ANT : 'TUxDUEFOVG1haW4x',   // Antofagasta
  TAR : 'TUxDUFRBUm1haW4x',   // Tarapacá
  ATA : 'TUxDUEFUQW1haW4x',   // Atacama
  LRI : 'TUxDUExSSW1haW4x',   // Los Ríos
  NUB : 'TUxDUE5VQm1haW4x',   // Ñuble
  AYP : 'TUxDUEFZUG1haW4x',   // Arica y Parinacota
  AYS : 'TUxDUEFZU21haW4x',   // Aysén
  MAG : 'TUxDUE1BV21haW4x',   // Magallanes
};

/* ── Mapeo clave REGIONES → código región TocToc ──────────── */
const TOCTOC_REGION_CODES = {
  RM  : 'RM',
  VAL : 'Valparaíso',
  BIO : 'Biobío',
  ARA : 'La Araucanía',
  MAU : 'Maule',
  OHI : "O'Higgins",
  LAG : 'Los Lagos',
  COQ : 'Coquimbo',
  ANT : 'Antofagasta',
  TAR : 'Tarapacá',
  ATA : 'Atacama',
  LRI : 'Los Ríos',
  NUB : 'Ñuble',
  AYP : 'Arica y Parinacota',
  AYS : 'Aysén',
  MAG : 'Magallanes',
};

/* ── Mapeo nombre legible → clave REGIONES ───────────────── */
const REGION_NAME_TO_KEY = {
  'metropolitana'       : 'RM',
  'santiago'            : 'RM',
  'rm'                  : 'RM',
  'valparaiso'          : 'VAL',
  'valparaíso'          : 'VAL',
  'biobio'              : 'BIO',
  'biobío'              : 'BIO',
  'concepcion'          : 'BIO',
  'concepción'          : 'BIO',
  'araucania'           : 'ARA',
  'araucanía'           : 'ARA',
  'temuco'              : 'ARA',
  'maule'               : 'MAU',
  'talca'               : 'MAU',
  "o'higgins"           : 'OHI',
  'ohiggins'            : 'OHI',
  'rancagua'            : 'OHI',
  'los lagos'           : 'LAG',
  'puerto montt'        : 'LAG',
  'coquimbo'            : 'COQ',
  'la serena'           : 'COQ',
  'antofagasta'         : 'ANT',
  'tarapaca'            : 'TAR',
  'tarapacá'            : 'TAR',
  'iquique'             : 'TAR',
  'atacama'             : 'ATA',
  'copiapo'             : 'ATA',
  'copiapó'             : 'ATA',
  'los rios'            : 'LRI',
  'los ríos'            : 'LRI',
  'valdivia'            : 'LRI',
  'nuble'               : 'NUB',
  'ñuble'               : 'NUB',
  'chillan'             : 'NUB',
  'chillán'             : 'NUB',
  'arica'               : 'AYP',
  'aysen'               : 'AYS',
  'aysén'               : 'AYS',
  'magallanes'          : 'MAG',
  'punta arenas'        : 'MAG',
};

/* ── Caché en memoria ────────────────────────────────────── */
const _mlCache = new Map(); // key → { data, timestamp }

function _getCached(key) {
  const entry = _mlCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ML_CONFIG.CACHE_TTL_MS) {
    _mlCache.delete(key);
    return null;
  }
  return entry.data;
}

function _setCache(key, data) {
  _mlCache.set(key, { data, timestamp: Date.now() });
}

/* ── Utilidades internas ─────────────────────────────────── */
function _median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function _avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/* ── Extrae m² del atributo MLCPA o de superficie_total */
function _extractM2(item) {
  const attrs = item.attributes ?? [];
  for (const a of attrs) {
    if (['TOTAL_AREA', 'COVERED_AREA', 'MLCPA'].includes(a.id)) {
      const v = a.value_struct?.number ?? parseFloat(a.value_name);
      if (v > 10 && v < 2000) return Math.round(v);
    }
  }
  return null;
}

/* Fetch con timeout */
async function _fetchJSON(url, timeoutMs = 9000) {
  const ctrl = new AbortController();
  const tid  = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally {
    clearTimeout(tid);
  }
}

/* ── Obtener la UF actual desde el contexto global de app.js ─ */
function _getUF() {
  // UF_VALOR es definida en app.js (fetchada desde mindicador.cl con fallback 38500)
  return (typeof UF_VALOR !== 'undefined' && UF_VALOR > 0) ? UF_VALOR : 38500;
}

/* ── Normalizar texto para lookup ────────────────────────── */
function _norm(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

/* ── Resolver región: acepta clave REGIONES, nombre legible o string libre ── */
function resolveRegionKey(regionInput) {
  if (!regionInput) return 'RM';
  const clean = _norm(String(regionInput));
  // Buscar match exacto o parcial en el mapeo
  for (const [name, key] of Object.entries(REGION_NAME_TO_KEY)) {
    if (clean === _norm(name) || clean.includes(_norm(name)) || _norm(name).includes(clean)) {
      return key;
    }
  }
  // Si ya parece una clave (RM, VAL, etc.) devolverla directamente
  const upper = regionInput.toUpperCase();
  if (ML_STATE_IDS[upper]) return upper;
  return 'RM'; // fallback Metropolitana
}

/* ── API principal ───────────────────────────────────────── */
const realEstateAPI = {

  /**
   * Busca propiedades en venta en MercadoLibre por región.
   * @param {string} regionInput  - Clave REGIONES (RM, VAL…) o nombre libre ("Santiago", "Biobío")
   * @param {'depto'|'casa'|'all'} [tipo='all'] - Filtrar por tipo de propiedad
   * @param {string}  [comuna='']   - Nombre de comuna para búsqueda textual
   * @returns {Promise<{promedioUF, promedioCLP, medianaUF, minUF, maxUF, m2Promedio, cantidadResultados, fuente, regionKey}>}
   */
  async getPrices(regionInput, tipo = 'all', comuna = '') {
    const regionKey = resolveRegionKey(regionInput);
    const stateId   = ML_STATE_IDS[regionKey];
    const cacheKey  = `${regionKey}_${tipo}_${_norm(comuna)}`;

    // Retornar caché si existe y es reciente
    const cached = _getCached(cacheKey);
    if (cached) return cached;

    // Construir URL de búsqueda
    const params = new URLSearchParams({
      category : ML_CONFIG.CATEGORY,
      state    : stateId,
      limit    : ML_CONFIG.LIMIT,
      offset   : 0,
    });

    // Filtro por tipo de propiedad
    if (tipo === 'depto') {
      params.set('MLCPA_SUBTYPE', 'Departamento');
    } else if (tipo === 'casa') {
      params.set('MLCPA_SUBTYPE', 'Casa');
    }

    // Búsqueda textual por comuna
    if (comuna) params.set('q', _norm(comuna));

    const url = `${ML_CONFIG.BASE_URL}/sites/${ML_CONFIG.SITE_ID}/search?${params}`;

    let items = [];
    try {
      const resp = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      if (!resp.ok) throw new Error(`ML API ${resp.status}`);
      const json = await resp.json();
      items = json.results ?? [];
    } catch (err) {
      console.warn('[realEstateAPI] fetch error:', err.message);
      // Retornar datos de fallback desde REGIONES estáticas
      return realEstateAPI._fallbackFromREGIONES(regionKey, tipo);
    }

    const result = realEstateAPI._processItems(items, regionKey);
    _setCache(cacheKey, result);
    return result;
  },

  /**
   * Procesa los items crudos de ML y calcula estadísticas.
   * @private
   */
  _processItems(items, regionKey) {
    const uf = _getUF();
    const precios = [];
    const m2s = [];

    for (const item of items) {
      // Solo items con precio en CLP (moneda MLC = CLP en Chile)
      if (item.currency_id !== 'CLP') continue;
      const precio = item.price;
      if (!precio || precio < 1_000_000) continue; // filtrar valores irreales

      precios.push(precio);
      const m2 = _extractM2(item);
      if (m2 && m2 > 15 && m2 < 500) m2s.push(m2);
    }

    if (precios.length === 0) {
      return realEstateAPI._fallbackFromREGIONES(regionKey, 'all');
    }

    const promedioCLP = Math.round(_avg(precios));
    const medianaCLP  = Math.round(_median(precios));
    const minCLP      = Math.min(...precios);
    const maxCLP      = Math.max(...precios);

    return {
      promedioUF         : Math.round(promedioCLP / uf),
      promedioCLP,
      medianaUF          : Math.round(medianaCLP / uf),
      medianaCLP,
      minUF              : Math.round(minCLP / uf),
      maxUF              : Math.round(maxCLP / uf),
      m2Promedio         : m2s.length > 0 ? Math.round(_avg(m2s)) : null,
      cantidadResultados : precios.length,
      fuente             : 'MercadoLibre',
      regionKey,
    };
  },

  /**
   * Fallback: usa datos estáticos de REGIONES cuando la API falla.
   * @private
   */
  _fallbackFromREGIONES(regionKey, tipo) {
    // REGIONES está definida en app.js (scope global de 'use strict' no aplica entre archivos)
    if (typeof REGIONES === 'undefined') {
      return { promedioUF: 0, promedioCLP: 0, medianaUF: 0, minUF: 0, maxUF: 0,
               m2Promedio: 55, cantidadResultados: 0, fuente: 'sin_datos', regionKey };
    }
    const uf   = _getUF();
    const d    = REGIONES[regionKey] ?? REGIONES['RM'];
    const key  = tipo === 'casa' ? 'casa' : tipo === 'depto' ? 'depto' : 'depto';
    const m2   = 55;
    const ufTotal = d[key] * m2;

    return {
      promedioUF         : Math.round(ufTotal),
      promedioCLP        : Math.round(ufTotal * uf),
      medianaUF          : Math.round(ufTotal * 0.95),
      medianaCLP         : Math.round(ufTotal * 0.95 * uf),
      minUF              : Math.round(ufTotal * 0.70),
      maxUF              : Math.round(ufTotal * 1.50),
      m2Promedio         : m2,
      cantidadResultados : 0,
      fuente             : 'estimado_cchc',
      regionKey,
    };
  },

  /**
   * Versión síncrona que retorna datos de caché o fallback inmediatamente.
   * Útil para componentes que no pueden ser async.
   */
  getCachedOrFallback(regionInput, tipo = 'all') {
    const regionKey = resolveRegionKey(regionInput);
    const cacheKey  = `${regionKey}_${tipo}_`;
    const cached    = _getCached(cacheKey);
    if (cached) return cached;
    // Lanzar fetch en background para poblar caché
    realEstateAPI.getPrices(regionInput, tipo).catch(() => {});
    return realEstateAPI._fallbackFromREGIONES(regionKey, tipo);
  },
};

/* ── Función auxiliar global: formatRealMarketComparison ────
   Genera comparación legible entre precio real de mercado
   y capacidad hipotecaria del usuario.
   ──────────────────────────────────────────────────────────
   @param {number} precioRealUF   - Precio promedio del mercado (UF)
   @param {number} capacidadUF   - Precio máximo que puede pagar el usuario (UF)
   @param {number} [sueldoCLP=0] - Sueldo líquido del usuario en CLP (para sugerencia subsidio)
   @returns {{ gapUF, gapCLP, porcentaje, mensaje, sugerenciaSubsidio }}
*/
function formatRealMarketComparison(precioRealUF, capacidadUF, sueldoCLP = 0) {
  const uf       = _getUF();
  const gapUF    = Math.round(precioRealUF - capacidadUF);
  const gapCLP   = Math.round(gapUF * uf);
  const pct      = capacidadUF > 0 ? Math.round((capacidadUF / precioRealUF) * 100) : 0;

  let mensaje = '';
  let sugerenciaSubsidio = '';

  if (gapUF <= 0) {
    // El usuario puede pagar más que el promedio
    const sobreUF  = Math.abs(gapUF);
    const sobrePct = Math.round((sobreUF / precioRealUF) * 100);
    mensaje = sobreUF >= 50
      ? `✅ Tienes capacidad para comprar por <strong>encima del promedio del mercado</strong> (un ${sobrePct}% más que la mediana)`
      : `✅ Tu capacidad hipotecaria <strong>cubre el precio promedio del mercado</strong>`;
  } else if (pct >= 85) {
    mensaje = `Estás a solo <strong>${gapUF} UF (~$${_fmtML(gapCLP)})</strong> del promedio de mercado — muy cerca`;
  } else if (pct >= 70) {
    mensaje = `Puedes comprar un <strong>${pct}% del valor medio del mercado</strong> — te faltan ${gapUF} UF (~$${_fmtML(gapCLP)})`;
  } else if (pct >= 50) {
    mensaje = `Tu capacidad cubre el <strong>${pct}% del valor promedio</strong>. Gap de ${gapUF} UF (~$${_fmtML(gapCLP)}) para llegar al promedio`;
  } else {
    mensaje = `Tu capacidad actual (<strong>${capacidadUF} UF</strong>) está alejada del promedio del mercado en tu región (~${precioRealUF} UF)`;
  }

  // Sugerencia de subsidio si el sueldo aplica
  if (sueldoCLP > 0) {
    const ingresoUF = sueldoCLP / uf;
    if (precioRealUF <= 1100 && ingresoUF <= 37) {
      sugerenciaSubsidio = `🏛 Con <strong>DS1 Tramo 1</strong> recibirías hasta 130 UF de subsidio — quedarías a ${Math.max(0, gapUF - 130)} UF del promedio`;
    } else if (precioRealUF <= 1600 && ingresoUF > 37 && ingresoUF <= 60) {
      sugerenciaSubsidio = `🏛 Con <strong>DS1 Tramo 2</strong> recibirías hasta 90 UF de subsidio — acortarías la brecha a ${Math.max(0, gapUF - 90)} UF`;
    } else if (precioRealUF <= 2200 && ingresoUF > 60 && ingresoUF <= 78) {
      sugerenciaSubsidio = `🏛 Con <strong>DS1 Tramo 3</strong> recibirías hasta 60 UF de subsidio`;
    } else if (precioRealUF <= 950 && ingresoUF <= 25) {
      sugerenciaSubsidio = `🏛 Con <strong>DS19</strong> recibirías hasta 180 UF — podrías cubrir la propiedad con muy poco crédito`;
    }
  }

  return { gapUF, gapCLP, porcentaje: pct, mensaje, sugerenciaSubsidio };
}

/* Helper interno de formateo (no depende de fmt() de app.js) */
function _fmtML(n) {
  if (typeof fmt !== 'undefined') return fmt(n);
  return new Intl.NumberFormat('es-CL').format(Math.round(n));
}

/* ══════════════════════════════════════════════════════════════
   MÓDULO: getPropertiesFromML
   Busca propiedades individuales en ML y las devuelve listas
   para renderizar tarjetas con foto real, precio y enlace exacto.
   ============================================================ */
async function getPropertiesFromML(regionCode = 'RM', limit = 6) {
  const cacheKey = `ml_props_${regionCode}_${limit}`;
  const cached   = _getCached(cacheKey);
  if (cached) return cached;

  const stateId   = ML_STATE_IDS[regionCode] ?? ML_STATE_IDS['RM'];
  const uf        = _getUF();
  const fetchLim  = Math.min(limit * 3, 48); // pedir más para filtrar los sin precio

  const url = `${ML_CONFIG.BASE_URL}/sites/${ML_CONFIG.SITE_ID}/search`
    + `?category=${ML_CONFIG.CATEGORY}`
    + `&state=${stateId}`
    + `&limit=${fetchLim}`
    + `&sort=relevance`;

  let raw = [];
  try {
    const json = await _fetchJSON(url, ML_CONFIG.TIMEOUT_MS);
    raw = json.results ?? [];
  } catch (err) {
    console.warn('[ML getPropertiesFromML] búsqueda falló:', err.message);
    return [];
  }

  const props = [];
  for (const it of raw) {
    if (props.length >= limit) break;
    if (!it.price || it.price <= 0) continue;

    const currencyId = it.currency_id ?? 'CLP';
    let priceCLP, priceUF;
    if (currencyId === 'UF') {
      priceUF  = Math.round(it.price);
      priceCLP = Math.round(it.price * uf);
    } else {
      priceCLP = Math.round(it.price);
      priceUF  = priceCLP >= 5_000_000 ? Math.round(priceCLP / uf) : 0;
    }
    if (!priceUF || priceUF < 10) continue;

    // Foto: versión -O (mayor res) si está disponible
    const thumb = it.thumbnail
      ? it.thumbnail.replace('-I.jpg', '-O.jpg').replace('http://', 'https://')
      : null;

    // m² desde atributos del search
    const m2 = _extractM2(it);

    // Ubicación
    const comuna = it.location?.city?.name
      ?? it.location?.state?.name
      ?? it.address?.city_name
      ?? null;

    props.push({
      id        : it.id,
      title     : it.title ?? 'Propiedad en venta',
      titulo    : it.title ?? 'Propiedad en venta', // alias para compatibilidad
      priceCLP,
      priceUF,
      precioCLP : priceCLP, // alias
      precioUF  : priceUF,  // alias
      m2,
      comuna,
      thumbnail : thumb,
      link      : it.permalink ?? `https://articulo.mercadolibre.cl/${it.id}`,
      permalink : it.permalink ?? `https://articulo.mercadolibre.cl/${it.id}`,
      source    : 'ML',
    });
  }

  _setCache(cacheKey, props);
  return props;
}

/* ══════════════════════════════════════════════════════════════
   MÓDULO: getPropertyDetails
   Obtiene fotos y atributos completos de un ítem ML via /items/:id
   ============================================================ */
async function getPropertyDetails(itemId) {
  if (!itemId) return null;
  const cacheKey = `ml_detail_${itemId}`;
  const cached   = _getCached(cacheKey);
  if (cached) return cached;

  try {
    const json = await _fetchJSON(
      `${ML_CONFIG.BASE_URL}/items/${itemId}`,
      ML_CONFIG.TIMEOUT_MS,
    );

    const uf    = _getUF();
    const m2    = _extractM2(json);
    const beds  = (json.attributes ?? []).find(a => a.id === 'BEDROOMS')?.value_name ?? null;
    const baths = (json.attributes ?? []).find(a => a.id === 'FULL_BATHROOMS')?.value_name ?? null;

    // Fotos reales (máximo 5)
    const pictures = (json.pictures ?? [])
      .slice(0, 5)
      .map(p => p.secure_url ?? p.url)
      .filter(Boolean);

    const currencyId = json.currency_id ?? 'CLP';
    let priceCLP, priceUF;
    if (currencyId === 'UF') {
      priceUF  = Math.round(json.price);
      priceCLP = Math.round(json.price * uf);
    } else {
      priceCLP = Math.round(json.price ?? 0);
      priceUF  = priceCLP ? Math.round(priceCLP / uf) : 0;
    }

    const detail = {
      id        : json.id,
      title     : json.title,
      titulo    : json.title,
      priceCLP,
      priceUF,
      precioCLP : priceCLP,
      precioUF  : priceUF,
      m2,
      beds,
      baths,
      pictures,
      thumbnail : pictures[0] ?? null,
      link      : json.permalink,
      permalink : json.permalink,
      commune   : json.location?.city?.name ?? json.location?.state?.name ?? null,
      comuna    : json.location?.city?.name ?? json.location?.state?.name ?? null,
      source    : 'ML',
    };

    _setCache(cacheKey, detail);
    return detail;
  } catch (err) {
    console.warn(`[ML getPropertyDetails] ${itemId} falló:`, err.message);
    return null;
  }
}

/* ══════════════════════════════════════════════════════════════
   MÓDULO: getPropertiesFromTocToc
   Busca propiedades en TocToc (best-effort: falla silenciosamente
   si el servidor bloquea CORS desde el browser).
   ============================================================ */
async function getPropertiesFromTocToc(regionCode = 'RM', limit = 6) {
  const cacheKey   = `tt_props_${regionCode}_${limit}`;
  const cached     = _getCached(cacheKey);
  if (cached) return cached;

  const uf         = _getUF();
  const regionName = TOCTOC_REGION_CODES[regionCode] ?? 'RM';

  const searchUrl = `${TOCTOC_CONFIG.BASE}/listings/search`
    + `?Operation=Venta`
    + `&PropertyType=Departamento`
    + `&Region=${encodeURIComponent(regionName)}`
    + `&PageSize=${limit * 2}`
    + `&Page=1`;

  let listings = [];
  try {
    const json = await _fetchJSON(searchUrl, TOCTOC_CONFIG.TIMEOUT_MS);
    listings = json.Listings ?? json.listings ?? (Array.isArray(json) ? json : []);
  } catch (err) {
    // CORS o timeout — retornar vacío sin error visible al usuario
    console.info('[TocToc] endpoint no disponible desde browser (CORS/timeout):', err.message);
    _setCache(cacheKey, []); // cachear vacío para no reintentar
    return [];
  }

  const props = [];
  for (const item of listings) {
    if (props.length >= limit) break;
    const listingId = item.ListingId ?? item.listingId ?? item.id ?? null;
    if (!listingId) continue;

    // Intentar detalle individual para foto real
    let d = item;
    try {
      const detail = await _fetchJSON(
        `${TOCTOC_CONFIG.BASE}/listings/${listingId}`,
        TOCTOC_CONFIG.TIMEOUT_MS,
      );
      if (detail) d = detail;
    } catch { /* usar item del search */ }

    const priceCLP = d.Price    ?? d.price    ?? 0;
    const priceUF  = d.UFPrice  ?? d.ufPrice
      ?? (priceCLP > 0 ? Math.round(priceCLP / uf) : 0);
    if (!priceUF || priceUF < 10) continue;

    const images   = d.Images ?? d.images ?? d.Photos ?? [];
    const thumb    = images[0]?.Url ?? images[0]?.url ?? images[0] ?? null;
    const comuna   = d.Location?.Commune ?? d.Location?.commune ?? d.Commune ?? d.commune ?? regionName;
    const m2Raw    = d.TotalArea ?? d.totalArea ?? d.Area ?? d.area ?? null;
    const m2       = m2Raw ? Math.round(parseFloat(m2Raw)) : null;
    const permalink= `https://www.toctoc.com/details/${listingId}`;

    props.push({
      id        : String(listingId),
      title     : d.Title ?? d.title ?? `Departamento en ${comuna}`,
      titulo    : d.Title ?? d.title ?? `Departamento en ${comuna}`,
      priceCLP  : priceCLP || Math.round(priceUF * uf),
      priceUF,
      precioCLP : priceCLP || Math.round(priceUF * uf),
      precioUF  : priceUF,
      m2,
      comuna,
      thumbnail : thumb,
      link      : permalink,
      permalink,
      source    : 'TocToc',
    });
  }

  _setCache(cacheKey, props);
  return props;
}

/* ══════════════════════════════════════════════════════════════
   MÓDULO: getRealProperties  (fusión ML + TocToc)
   Combina ambas fuentes, elimina duplicados y ordena por
   proximidad al presupuesto del usuario (capacidadUF).
   ============================================================ */
async function getRealProperties(regionCode = 'RM', limit = 6, capacidadUF = 0) {
  const budgetKey = capacidadUF > 0 ? Math.round(capacidadUF / 100) : 0;
  const cacheKey  = `fusion_${regionCode}_${limit}_${budgetKey}`;
  const cached    = _getCached(cacheKey);
  if (cached) return cached;

  // Lanzar ML y TocToc en paralelo
  const [fromML, fromTT] = await Promise.allSettled([
    getPropertiesFromML(regionCode, limit + 4),
    getPropertiesFromTocToc(regionCode, Math.ceil(limit / 2)),
  ]);

  const mlProps = fromML.status === 'fulfilled' ? fromML.value : [];
  const ttProps = fromTT.status === 'fulfilled' ? fromTT.value : [];

  // Unir y deduplicar por id
  const seen = new Set();
  const all  = [];
  for (const p of [...mlProps, ...ttProps]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    all.push(p);
  }

  // Si ambas fuentes fallaron → usar fallback estático
  if (all.length === 0) {
    const fb = _getRealPropertiesFallback(regionCode, limit, _getUF());
    _setCache(cacheKey, fb);
    return fb;
  }

  // Ordenar por proximidad al presupuesto del usuario
  if (capacidadUF > 0) {
    all.sort((a, b) =>
      Math.abs((a.priceUF ?? a.precioUF ?? 9999) - capacidadUF) -
      Math.abs((b.priceUF ?? b.precioUF ?? 9999) - capacidadUF),
    );
  }

  const result = all.slice(0, limit);
  _setCache(cacheKey, result);
  return result;
}

/** Fallback estático cuando todas las APIs fallan */
/* URLs reales de búsqueda en MercadoLibre Chile por región */
const ML_REGION_URLS = {
  RM  : 'https://inmuebles.mercadolibre.cl/venta/rm-region-metropolitana/',
  VAL : 'https://inmuebles.mercadolibre.cl/venta/valparaiso/',
  BIO : 'https://inmuebles.mercadolibre.cl/venta/bio-bio/',
  ARA : 'https://inmuebles.mercadolibre.cl/venta/araucania/',
  MAU : 'https://inmuebles.mercadolibre.cl/venta/maule/',
  OHI : 'https://inmuebles.mercadolibre.cl/venta/ohiggins/',
  LAG : 'https://inmuebles.mercadolibre.cl/venta/los-lagos/',
  COQ : 'https://inmuebles.mercadolibre.cl/venta/coquimbo/',
  ANT : 'https://inmuebles.mercadolibre.cl/venta/antofagasta/',
  TAR : 'https://inmuebles.mercadolibre.cl/venta/tarapaca/',
  ATA : 'https://inmuebles.mercadolibre.cl/venta/atacama/',
  LRI : 'https://inmuebles.mercadolibre.cl/venta/los-rios/',
  NUB : 'https://inmuebles.mercadolibre.cl/venta/nuble/',
  AYP : 'https://inmuebles.mercadolibre.cl/venta/arica-y-parinacota/',
  AYS : 'https://inmuebles.mercadolibre.cl/venta/aysen/',
  MAG : 'https://inmuebles.mercadolibre.cl/venta/magallanes/',
};

function _getRealPropertiesFallback(regionCode, limit, uf) {
  const d = (typeof REGIONES !== 'undefined' && REGIONES[regionCode]) ? REGIONES[regionCode] : null;
  if (!d) return [];

  const deptoUF = d.depto ?? 2500;
  const casaUF  = d.casa  ?? 4000;
  const nombre  = d.nombre ?? regionCode;
  const mlUrl   = ML_REGION_URLS[regionCode] ?? ML_REGION_URLS['RM'];

  const tipos = [
    { tipo: 'Departamento 1D+1B',  uf: Math.round(deptoUF * 0.75), m2: 38 },
    { tipo: 'Departamento 2D+1B',  uf: Math.round(deptoUF * 0.95), m2: 55 },
    { tipo: 'Departamento 3D+2B',  uf: Math.round(deptoUF * 1.15), m2: 72 },
    { tipo: 'Casa 2D+1B',          uf: Math.round(casaUF  * 0.80), m2: 65 },
    { tipo: 'Casa 3D+2B',          uf: Math.round(casaUF  * 1.00), m2: 90 },
    { tipo: 'Casa 4D+2B (jardín)', uf: Math.round(casaUF  * 1.30), m2: 120 },
  ];

  return tipos.slice(0, limit).map(t => ({
    id        : `fb_${t.tipo}`,
    title     : `${t.tipo} — ${nombre}`,
    titulo    : `${t.tipo} — ${nombre}`,
    priceCLP  : Math.round(t.uf * uf),
    priceUF   : t.uf,
    precioCLP : Math.round(t.uf * uf),
    precioUF  : t.uf,
    m2        : t.m2,
    comuna    : nombre,
    thumbnail : null,
    link      : mlUrl,
    permalink : mlUrl,
    source    : 'estimado',
  }));
}

/* ══════════════════════════════════════════════════════════════
   MÓDULO: construirURL_ML / construirURL_TocToc
   Genera URLs EXACTAS y FILTRADAS para búsquedas en sitios externos.
   NUNCA genera URLs genéricas del tipo /inmuebles/oficinas/venta/...
   ============================================================ */

/* ── Mapeo región → slug para URLs de listado MercadoLibre Chile ── */
const ML_URL_REGION_SLUGS = {
  RM  : 'rm',
  VAL : 'valparaiso',
  BIO : 'biobio',
  ARA : 'la-araucania',
  MAU : 'maule',
  OHI : 'ohiggins',
  LAG : 'los-lagos',
  COQ : 'coquimbo',
  ANT : 'antofagasta',
  TAR : 'tarapaca',
  ATA : 'atacama',
  LRI : 'los-rios',
  NUB : 'nuble',
  AYP : 'arica-y-parinacota',
  AYS : 'aysen',
  MAG : 'magallanes',
};

/* ── Mapeo región → slug para URLs de búsqueda TocToc ── */
const TOCTOC_URL_REGION_SLUGS = {
  RM  : 'metropolitana',
  VAL : 'valparaiso',
  BIO : 'biobio',
  ARA : 'araucania',
  MAU : 'maule',
  OHI : 'ohiggins',
  LAG : 'los-lagos',
  COQ : 'coquimbo',
  ANT : 'antofagasta',
  TAR : 'tarapaca',
  ATA : 'atacama',
  LRI : 'los-rios',
  NUB : 'nuble',
  AYP : 'arica',
  AYS : 'aysen',
  MAG : 'magallanes',
};

/**
 * Deduce número de dormitorios según m².
 * < 40 → 1D · 40–60 → 2D · 60–80 → 3D · 80+ → 4D
 */
function deducirDormitorios(m2) {
  if (m2 < 40) return 1;
  if (m2 < 60) return 2;
  if (m2 < 80) return 3;
  return 4;
}

/**
 * Construye URL de búsqueda FILTRADA para MercadoLibre Chile.
 * Formato: https://listado.mercadolibre.cl/<tipo>?state=<region>&price=<min>-<max>&m2=<min>-<max>&bedrooms=<n>&bathrooms=<n>
 *
 * @param {object} params
 * @param {string}  params.regionKey   - Clave REGIONES (RM, VAL…)
 * @param {'depto'|'casa'|'usada'} params.tipo - Tipo de vivienda
 * @param {number}  params.minCLP      - Precio mínimo en CLP
 * @param {number}  params.maxCLP      - Precio máximo en CLP
 * @param {number}  params.minM2       - Superficie mínima en m²
 * @param {number}  params.maxM2       - Superficie máxima en m²
 * @param {number}  [params.dormitorios] - Nº dormitorios (calculado automáticamente si omitido)
 * @param {string}  [params.comuna]    - Nombre de comuna (opcional)
 * @returns {string} URL filtrada de MercadoLibre
 */
function construirURL_ML({ regionKey = 'RM', tipo = 'depto', minCLP = 0, maxCLP = 0, minM2 = 0, maxM2 = 0, dormitorios, comuna } = {}) {
  const tipoPath   = tipo === 'casa' ? 'casa' : 'departamento';
  const regionSlug = ML_URL_REGION_SLUGS[regionKey] ?? 'rm';
  const m2Mid      = (minM2 > 0 && maxM2 > 0) ? (minM2 + maxM2) / 2 : (minM2 || maxM2 || 55);
  const dorms      = dormitorios ?? deducirDormitorios(m2Mid);
  const banos      = dorms >= 3 ? 2 : 1;

  const q = new URLSearchParams();
  q.set('state', regionSlug);
  if (minCLP > 0 && maxCLP > 0) q.set('price', `${Math.round(minCLP)}-${Math.round(maxCLP)}`);
  if (minM2 > 0 && maxM2 > 0)   q.set('m2',    `${Math.round(minM2)}-${Math.round(maxM2)}`);
  if (dorms)                     q.set('bedrooms',  String(dorms));
  if (dorms)                     q.set('bathrooms', String(banos));
  if (comuna)                    q.set('q', _norm(comuna));
  q.set('sort', 'price_asc');

  return `https://listado.mercadolibre.cl/${tipoPath}?${q.toString()}`;
}

/**
 * Construye URL de búsqueda FILTRADA para TocToc.
 * Formato: https://www.toctoc.com/buscar?operacion=venta&tipo=<tipo>&region=<region>&...
 *
 * @param {object} params
 * @param {string}  params.regionKey   - Clave REGIONES (RM, VAL…)
 * @param {'depto'|'casa'|'usada'} params.tipo - Tipo de vivienda
 * @param {number}  params.minUF       - Precio mínimo en UF
 * @param {number}  params.maxUF       - Precio máximo en UF
 * @param {number}  params.minM2       - Superficie mínima en m²
 * @param {number}  params.maxM2       - Superficie máxima en m²
 * @param {number}  [params.dormitorios] - Nº dormitorios (calculado automáticamente si omitido)
 * @param {string}  [params.comuna]    - Nombre de comuna (opcional)
 * @returns {string} URL filtrada de TocToc
 */
function construirURL_TocToc({ regionKey = 'RM', tipo = 'depto', minUF = 0, maxUF = 0, minM2 = 0, maxM2 = 0, dormitorios, comuna } = {}) {
  const tipoParam   = tipo === 'casa' ? 'casa' : 'departamento';
  const regionParam = TOCTOC_URL_REGION_SLUGS[regionKey] ?? 'metropolitana';
  const m2Mid       = (minM2 > 0 && maxM2 > 0) ? (minM2 + maxM2) / 2 : (minM2 || maxM2 || 55);
  const dorms       = dormitorios ?? deducirDormitorios(m2Mid);

  const q = new URLSearchParams();
  q.set('operacion', 'venta');
  q.set('tipo',      tipoParam);
  q.set('region',    regionParam);
  if (comuna)        q.set('comuna',        _norm(comuna));
  if (minUF > 0)     q.set('precio_desde',  String(Math.round(minUF)));
  if (maxUF > 0)     q.set('precio_hasta',  String(Math.round(maxUF)));
  if (minM2 > 0)     q.set('m2_desde',      String(Math.round(minM2)));
  if (maxM2 > 0)     q.set('m2_hasta',      String(Math.round(maxM2)));
  if (dorms)         q.set('dormitorios',   String(dorms));
  q.set('orden', 'precio_asc');

  return `https://www.toctoc.com/buscar?${q.toString()}`;
}

/* ── Exponer en scope global ────────────────────────────────── */
window.realEstateAPI              = realEstateAPI;
window.formatRealMarketComparison = formatRealMarketComparison;
window.resolveRegionKey           = resolveRegionKey;
window.getRealProperties          = getRealProperties;
window.getPropertiesFromML        = getPropertiesFromML;
window.getPropertiesFromTocToc    = getPropertiesFromTocToc;
window.getPropertyDetails         = getPropertyDetails;
window.construirURL_ML            = construirURL_ML;
window.construirURL_TocToc        = construirURL_TocToc;
window.deducirDormitorios         = deducirDormitorios;
