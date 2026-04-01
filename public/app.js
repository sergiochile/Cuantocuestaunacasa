{"@context":"https://schema.org","@type":"SoftwareApplication","name":"Calculadora hipotecaria Chile 2026","url":"https://cuantocuestaunacasa.cl/","description":"Calcula si puedes comprar una casa en Chile. Simula tu dividendo, compara 11 bancos y descubre a qué subsidios MINVU calificas. Datos CMF 2026.","applicationCategory":"FinanceApplication","operatingSystem":"Web","offers":{"@type":"Offer","price":"0","priceCurrency":"CLP"},"provider":{"@type":"Organization","name":"CuantoCuestaUnaCasa.cl","url":"https://cuantocuestaunacasa.cl/"}}


const REGIONES = {
  RM:  { nombre:"Región Metropolitana", depto:77,  casa:63,  usada:62 },
  ANT: { nombre:"Antofagasta",          depto:68,  casa:52,  usada:50 },
  VAL: { nombre:"Valparaíso",           depto:58,  casa:48,  usada:45 },
  BIO: { nombre:"Biobío / Concepción",  depto:55,  casa:45,  usada:42 },
  COQ: { nombre:"Coquimbo / La Serena", depto:56,  casa:46,  usada:43 },
  TAR: { nombre:"Tarapacá",             depto:52,  casa:42,  usada:40 },
  ARI: { nombre:"Arica y Parinacota",   depto:45,  casa:38,  usada:35 },
  ATA: { nombre:"Atacama",              depto:48,  casa:40,  usada:37 },
  OHI: { nombre:"O'Higgins",            depto:44,  casa:38,  usada:35 },
  MAU: { nombre:"Maule",                depto:40,  casa:34,  usada:30 },
  NUB: { nombre:"Ñuble",                depto:38,  casa:32,  usada:28 },
  ARA: { nombre:"La Araucanía",         depto:36,  casa:30,  usada:27 },
  RIO: { nombre:"Los Ríos",             depto:37,  casa:31,  usada:28 },
  LAG: { nombre:"Los Lagos",            depto:38,  casa:32,  usada:29 },
  AYS: { nombre:"Aysén",                depto:35,  casa:30,  usada:27 },
  MAG: { nombre:"Magallanes",           depto:40,  casa:34,  usada:31 }
};

/* ============================================================
   SUBSIDIOS HABITACIONALES — datos 100% oficiales MINVU 2025
   Fuentes: minvu.gob.cl (páginas de cada programa, leídas 2025)
   ============================================================ */
const SUBSIDIOS_DEF = [

  /* ════════════════════════════════════════════════════════════════════
     🏠  COMPRA DE VIVIENDA
  ════════════════════════════════════════════════════════════════════ */

  /* ── DS49 Compra — Fondo Solidario de Elección de Vivienda ───────── */
  {
    id:'ds49', nombre:'DS49 — Comprar vivienda hasta 950 UF', icono:'🏘️',
    categoria:'compra',
    soloNueva:false,
    descripcionOficial:'Permite a familias en situación de vulnerabilidad social comprar una vivienda construida de hasta 950 UF sin crédito hipotecario. El Estado entrega un subsidio base de 314 UF, que puede aumentar según zona geográfica y características del grupo familiar.',
    quienPuedePostular:'Familias no propietarias de vivienda, RSH hasta 40%, con grupo familiar acreditado (no unipersonal, salvo adultos mayores, viudos/as, personas con discapacidad, indígenas o Valech).',
    requisitosOficiales:[
      'Tener mínimo 18 años de edad',
      'Cédula Nacional de Identidad vigente',
      'Estar inscrito en el RSH sin superar el 40% de vulnerabilidad',
      'Acreditar grupo familiar (postulación unipersonal solo con excepciones)',
      'Cuenta de ahorro con mínimo 10 UF (depositadas antes del último día hábil del mes previo a la postulación)',
      'No ser propietario/a de vivienda',
    ],
    ahorroMinimoUF:10,
    montoUF:314,
    maxIngresoUF:999,
    maxPrecioUF:950,
    ingresoMaximoRSH:40,
    modalidad:'Compra de vivienda construida (nueva o usada) o integración a proyecto SERVIU. Sin crédito hipotecario.',
    postulacion:'Individual presencial en SERVIU o en línea con Clave Única.',
    fechasPostulacion2026:'Llamados estimados: julio y octubre 2026. Confirma en minvu.gob.cl.',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficio/vivienda/subsidio-para-comprar-una-vivienda-construida-de-hasta-950-uf-ds49/',
      postulacion:'https://postulacionenlinea.minvu.cl',
    },
    aplicar(d){ return d.primera && d.precioUF<=this.maxPrecioUF && d.ingresoUF<=25; },
    razones(d){ const rs=[];
      if(!d.primera) rs.push('Ya tienes una propiedad — el DS49 es exclusivo para primera vivienda');
      if(d.precioUF>this.maxPrecioUF) rs.push(`La vivienda (${Math.round(d.precioUF)} UF) supera las ${this.maxPrecioUF} UF máximas del DS49`);
      if(d.ingresoUF>25) rs.push(`Tu ingreso estimado (${d.ingresoUF.toFixed(1)} UF/mes) puede superar el RSH 40% requerido`);
      return rs; }
  },

  /* ── DS1 Tramo 1 — Sectores Medios, hasta 1.100 UF ──────────────── */
  {
    id:'ds1t1', nombre:'DS1 Tramo 1 — Comprar vivienda hasta 1.100 UF', icono:'🏠',
    categoria:'compra',
    soloNueva:false,
    descripcionOficial:'Ayuda económica para comprar o construir una vivienda nueva o usada de hasta 1.100 UF (1.200 UF en zonas extremas). RSH hasta 60%. No requiere preaprobación de crédito hipotecario.',
    quienPuedePostular:'Familias no propietarias de vivienda, RSH hasta 60% (Adultos Mayores hasta 90%), con cuenta de ahorro vigente de mínimo 12 meses.',
    requisitosOficiales:[
      'Tener mínimo 18 años de edad',
      'Cédula Nacional de Identidad vigente',
      'No ser propietario/a de vivienda',
      'RSH no superior al 60% (Adultos Mayores hasta 90%)',
      'Cuenta de ahorro para la vivienda con antigüedad mínima de 12 meses',
      'Ahorro depositado al último día del mes anterior a la postulación',
      'No realizar giros desde esa fecha hasta la postulación',
    ],
    ahorroMinimoUF:0,
    montoUF:130,
    maxIngresoUF:37,
    maxPrecioUF:1100,
    ingresoMaximoRSH:60,
    modalidad:'Compra o construcción de vivienda nueva o usada. Sin crédito hipotecario obligatorio.',
    postulacion:'Individual o colectiva (≥10 integrantes con Entidad Patrocinante y proyecto SERVIU aprobado).',
    fechasPostulacion2026:'Llamados: mayo y noviembre 2026 (ahorro acreditado al 30/abril y 30/octubre).',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficio/vivienda/subsidio-habitacional-comprar-una-vivienda-de-hasta-1100-uf-ds1/',
      postulacion:'https://postulacionenlinea.minvu.cl',
    },
    aplicar(d){ return d.primera && d.ingresoUF<=this.maxIngresoUF && d.precioUF<=this.maxPrecioUF; },
    razones(d){ const rs=[];
      if(!d.primera) rs.push('Ya tienes una propiedad — el DS1 es exclusivo para primera vivienda');
      if(d.ingresoUF>this.maxIngresoUF) rs.push(`Tu ingreso estimado (${d.ingresoUF.toFixed(1)} UF/mes) supera el límite del Tramo 1 — revisa el Tramo 2`);
      if(d.precioUF>this.maxPrecioUF) rs.push(`La vivienda (${Math.round(d.precioUF)} UF) supera las ${this.maxPrecioUF} UF del Tramo 1`);
      return rs; }
  },

  /* ── DS1 Tramo 2 — Sectores Medios, hasta 1.600 UF ──────────────── */
  {
    id:'ds1t2', nombre:'DS1 Tramo 2 — Comprar vivienda hasta 1.600 UF', icono:'🏠',
    categoria:'compra',
    soloNueva:false,
    descripcionOficial:'Ayuda económica para comprar o construir una vivienda de hasta 1.600 UF (1.800 UF en zonas extremas). RSH hasta 80%. Requiere preaprobación de crédito hipotecario.',
    quienPuedePostular:'Familias no propietarias de vivienda, RSH hasta 80% (Adultos Mayores hasta 90%), con cuenta de ahorro mínimo 12 meses y preaprobación de crédito hipotecario.',
    requisitosOficiales:[
      'Tener mínimo 18 años de edad',
      'Cédula Nacional de Identidad vigente',
      'No ser propietario/a de vivienda',
      'RSH no superior al 80% (Adultos Mayores hasta 90%)',
      'Cuenta de ahorro para la vivienda con antigüedad mínima de 12 meses',
      'Ahorro depositado al último día del mes anterior a la postulación',
      'No realizar giros desde esa fecha hasta la postulación',
      'Preaprobación de crédito hipotecario vigente',
    ],
    ahorroMinimoUF:0,
    montoUF:90,
    maxIngresoUF:60,
    maxPrecioUF:1600,
    ingresoMaximoRSH:80,
    modalidad:'Compra o construcción de vivienda nueva o usada. Requiere crédito hipotecario.',
    postulacion:'Individual o colectiva (≥10 integrantes con Entidad Patrocinante).',
    fechasPostulacion2026:'Llamados: mayo y noviembre 2026 (ahorro acreditado al 30/abril y 30/octubre).',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficio/vivienda/subsidio-habitacional-para-comprar-una-vivienda-de-hasta-1600-uf-ds1/',
      postulacion:'https://postulacionenlinea.minvu.cl',
    },
    aplicar(d){ return d.primera && d.ingresoUF>37 && d.ingresoUF<=this.maxIngresoUF && d.precioUF<=this.maxPrecioUF; },
    razones(d){ const rs=[];
      if(!d.primera) rs.push('Ya tienes una propiedad — el DS1 es exclusivo para primera vivienda');
      if(d.ingresoUF<=37) rs.push(`Tu ingreso estimado (${d.ingresoUF.toFixed(1)} UF/mes) está en el rango del Tramo 1`);
      else if(d.ingresoUF>this.maxIngresoUF) rs.push(`Tu ingreso estimado (${d.ingresoUF.toFixed(1)} UF/mes) supera el límite del Tramo 2 — revisa el Tramo 3`);
      if(d.precioUF>this.maxPrecioUF) rs.push(`La vivienda (${Math.round(d.precioUF)} UF) supera las ${this.maxPrecioUF} UF del Tramo 2`);
      return rs; }
  },

  /* ── DS1 Tramo 3 — Sectores Medios, hasta 2.200 UF ──────────────── */
  {
    id:'ds1t3', nombre:'DS1 Tramo 3 — Comprar vivienda hasta 2.200 UF', icono:'🏠',
    categoria:'compra',
    soloNueva:false,
    descripcionOficial:'Ayuda económica para comprar o construir una vivienda de hasta 2.200 UF (2.600 UF en zonas extremas). RSH hasta 90% sin exceder topes de ingreso del llamado. Requiere preaprobación de crédito hipotecario.',
    quienPuedePostular:'Familias no propietarias de vivienda, RSH hasta 90% sin superar topes de ingreso del llamado, con cuenta de ahorro mínimo 12 meses y preaprobación de crédito hipotecario.',
    requisitosOficiales:[
      'Tener mínimo 18 años de edad',
      'Cédula Nacional de Identidad vigente',
      'No ser propietario/a de vivienda',
      'RSH no superior al 90% y no exceder topes de ingreso del llamado',
      'Cuenta de ahorro para la vivienda con antigüedad mínima de 12 meses',
      'Ahorro depositado al último día del mes anterior a la postulación',
      'No realizar giros desde esa fecha hasta la postulación',
      'Preaprobación de crédito hipotecario vigente',
    ],
    ahorroMinimoUF:0,
    montoUF:60,
    maxIngresoUF:78,
    maxPrecioUF:2200,
    ingresoMaximoRSH:90,
    modalidad:'Compra o construcción de vivienda nueva o usada. Requiere crédito hipotecario.',
    postulacion:'Individual o colectiva (≥10 integrantes vía Entidad Patrocinante).',
    fechasPostulacion2026:'Llamados: mayo y noviembre 2026 (ahorro acreditado al 30/abril y 30/octubre).',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficio/vivienda/subsidio-habitacional-para-comprar-una-vivienda-de-hasta-2200-uf-ds1/',
      postulacion:'https://postulacionenlinea.minvu.cl',
    },
    aplicar(d){ return d.primera && d.ingresoUF>60 && d.ingresoUF<=this.maxIngresoUF && d.precioUF<=this.maxPrecioUF; },
    razones(d){ const rs=[];
      if(!d.primera) rs.push('Ya tienes una propiedad — el DS1 es exclusivo para primera vivienda');
      if(d.ingresoUF<=60) rs.push(`Tu ingreso estimado (${d.ingresoUF.toFixed(1)} UF/mes) está en el rango del Tramo 2`);
      else if(d.ingresoUF>this.maxIngresoUF) rs.push(`Tu ingreso estimado (${d.ingresoUF.toFixed(1)} UF/mes) supera el límite del Tramo 3`);
      if(d.precioUF>this.maxPrecioUF) rs.push(`La vivienda (${Math.round(d.precioUF)} UF) supera las ${this.maxPrecioUF} UF del Tramo 3`);
      return rs; }
  },

  /* ── FOGAES — Garantía para pie del 10% ─────────────────────────── */
  {
    id:'fogaes', nombre:'FOGAES — Garantía estatal para pie del 10%', icono:'🔑',
    categoria:'compra',
    soloNueva:false,
    maxPrecioUF:4500, esFogaes:true,
    descripcionOficial:'El Fondo de Garantía Especial (FOGAES) permite acceder a un crédito hipotecario con un pie mínimo del 10% en lugar del 20% habitual. El Estado garantiza la diferencia ante el banco. No es exclusivo de primera vivienda.',
    quienPuedePostular:'Cualquier persona comprando vivienda de hasta 4.500 UF con crédito hipotecario.',
    requisitosOficiales:[
      'Vivienda con precio hasta 4.500 UF',
      'Crédito hipotecario aprobado por banco participante',
      'No se tramita en MINVU — el banco lo gestiona directamente',
    ],
    ahorroMinimoUF:0,
    modalidad:'Disponible para compra de vivienda con crédito hipotecario. No exclusivo de primera vivienda.',
    postulacion:'Sin postulación — el banco lo tramita automáticamente al solicitar el crédito.',
    fechasPostulacion2026:'Disponible de forma continua en bancos participantes. Sin llamado periódico.',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficios/vivienda/',
      postulacion:'https://www.minvu.gob.cl/beneficios/vivienda/',
    },
    aplicar(d){ return d.precioUF<=this.maxPrecioUF; },
    razones(d){ const rs=[];
      if(d.precioUF>this.maxPrecioUF) rs.push(`La vivienda (${Math.round(d.precioUF)} UF) supera el límite de ${this.maxPrecioUF} UF de FOGAES`);
      return rs; }
  },

  /* ── Ley 21.748 — Subsidio a la Tasa ─────────────────────────────── */
  {
    id:'ley21748', nombre:'Subsidio a la tasa — Ley 21.748', icono:'📉',
    categoria:'compra',
    maxPrecioUF:4000, esTasa:true, tasaDescuento:0.6, soloNueva:true,
    descripcionOficial:'El Estado subsidia parte de la tasa de interés del crédito hipotecario durante los primeros años, reduciendo el dividendo mensual en ese período. Aplica exclusivamente a vivienda nueva con crédito a tasa fija.',
    quienPuedePostular:'Personas que compren vivienda nueva (casa o departamento) de hasta 4.000 UF con crédito hipotecario a tasa fija.',
    requisitosOficiales:[
      'Vivienda nueva (casa o departamento)',
      'Precio hasta 4.000 UF',
      'Crédito hipotecario a tasa fija',
      'No requiere postulación en MINVU — el banco aplica el beneficio directamente',
    ],
    ahorroMinimoUF:0,
    modalidad:'Vivienda nueva únicamente. El banco aplica el subsidio — menciona "Ley 21.748" al ejecutivo.',
    postulacion:'Sin postulación en MINVU — se gestiona directamente con el banco al firmar el crédito.',
    fechasPostulacion2026:'Disponible mientras haya cupos. Consulta directamente con tu banco.',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/',
      postulacion:'https://www.minvu.gob.cl/',
    },
    aplicar(d){ return d.precioUF<=this.maxPrecioUF&&(d.tipo==='depto'||d.tipo==='casa'); },
    razones(d){ const rs=[];
      if(d.precioUF>this.maxPrecioUF) rs.push(`La vivienda (${Math.round(d.precioUF)} UF) supera las ${this.maxPrecioUF} UF máximas del subsidio a la tasa`);
      if(d.tipo==='usada') rs.push('Este subsidio aplica solo a vivienda nueva — elegiste vivienda usada');
      return rs; }
  },

  /* ── DS52 — Subsidio de Arriendo ─────────────────────────────────── */
  {
    id:'ds52', nombre:'DS52 — Subsidio de Arriendo', icono:'🏘️',
    categoria:'arriendo',
    soloNueva:false,
    maxPrecioUF:999, esArriendo:true,
    descripcionOficial:'Aporte temporal de hasta 170 UF en total (hasta 4,2 UF/mes por máximo 8 años) para que familias puedan arrendar una vivienda mientras ahorran para su casa propia.',
    quienPuedePostular:'Personas con RSH hasta 70% e ingresos familiares entre 7 y 25 UF/mes. Postulación con cónyuge, conviviente o hijo (solos solo si tienen más de 60 años).',
    requisitosOficiales:[
      'Tener mínimo 18 años de edad',
      'RSH no superior al 70%',
      'Ingresos familiares entre 7 y 25 UF/mes (aumenta 8 UF por cada integrante extra sobre 3)',
      'Ahorro mínimo de 4 UF en cuenta de ahorro para la vivienda',
      'Postular con cónyuge, conviviente civil, conviviente o hijo (mayores de 60 años pueden postular solos)',
      'Arriendo máximo de 11 UF/mes (13 UF en regiones extremas)',
    ],
    ahorroMinimoUF:4,
    modalidad:'Subsidio temporal de arriendo. No es para compra de vivienda.',
    postulacion:'Individual o con núcleo familiar. Presencial en SERVIU o en línea.',
    fechasPostulacion2026:'Llamado regular: mayo–junio 2026. Llamado especial AM/Discapacidad: agosto 2026.',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficio/vivienda/arriendo-de-una-vivienda/',
      postulacion:'https://postulacionenlinea.minvu.cl',
    },
    aplicar(d){ return !d.primera || (d.ingresoUF>=7 && d.ingresoUF<=25); },
    razones(d){ const rs=[];
      if(d.ingresoUF<7) rs.push('Tu ingreso estimado está bajo el mínimo de 7 UF/mes requerido');
      if(d.ingresoUF>25) rs.push(`Tu ingreso estimado (${d.ingresoUF.toFixed(1)} UF/mes) puede superar el límite de 25 UF/mes del DS52`);
      return rs; }
  },

  /* ════════════════════════════════════════════════════════════════════
     ��️  CONSTRUCCIÓN DE VIVIENDA
  ════════════════════════════════════════════════════════════════════ */

  /* ── DS49 Construcción — hasta 950 UF ────────────────────────────── */
  {
    id:'ds49c', nombre:'DS49 — Construir vivienda hasta 950 UF', icono:'🏗️',
    categoria:'construccion',
    soloNueva:true,
    descripcionOficial:'Permite a familias en situación de vulnerabilidad construir una vivienda de hasta 950 UF en diversas modalidades: nuevos terrenos (10–160 viviendas), pequeño condominio (2–9 viviendas), sitio propio o densificación predial.',
    quienPuedePostular:'Familias no propietarias de vivienda, RSH hasta 40% (70% del grupo). Ahorro mínimo 10 UF (15 UF si tramo RSH superior al 40%).',
    requisitosOficiales:[
      'Tener mínimo 18 años de edad',
      'Cédula Nacional de Identidad vigente',
      'RSH hasta 40% (al menos el 70% del grupo)',
      'No ser propietario/a de vivienda',
      'Ahorro mínimo 10 UF (15 UF si tramo >40%)',
      'Contar con Entidad Patrocinante habilitada',
      'Terreno apto o adherirse a proyecto colectivo',
    ],
    ahorroMinimoUF:10,
    modalidad:'4 modalidades: Nuevos terrenos (10–160 viv., colectiva), Pequeño condominio (2–9 viv., colectiva), Sitio propio (colectiva o individual), Densificación predial (colectiva o individual).',
    postulacion:'Colectiva o individual según modalidad. Vía Entidad Patrocinante habilitada por SERVIU.',
    fechasPostulacion2026:'Llamados estimados: julio y octubre 2026. Confirma en minvu.gob.cl.',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficio/vivienda/subsidio-para-construir-una-vivienda-de-hasta-950-uf-ds49/',
      postulacion:'https://postulacionenlinea.minvu.cl',
    },
    aplicar(d){ return false; },
    razones(d){ return ['Este programa es para construir vivienda nueva, no para compra de vivienda construida']; }
  },

  /* ── DS1 Construir — hasta 1.600 UF ─────────────────────────────── */
  {
    id:'ds1c1600', nombre:'DS1 — Construir vivienda hasta 1.600 UF', icono:'🏗️',
    categoria:'construccion',
    soloNueva:true,
    descripcionOficial:'Subsidio habitacional para construir una vivienda nueva de hasta 1.600 UF. RSH hasta 80%. Requiere preaprobación de crédito hipotecario y cuenta de ahorro con antigüedad mínima de 12 meses.',
    quienPuedePostular:'Familias no propietarias de vivienda, RSH hasta 80%, con cuenta de ahorro mínimo 12 meses y preaprobación de crédito hipotecario.',
    requisitosOficiales:[
      'Tener mínimo 18 años de edad',
      'No ser propietario/a de vivienda',
      'RSH no superior al 80%',
      'Cuenta de ahorro para la vivienda con antigüedad mínima de 12 meses',
      'Ahorro depositado al último día del mes anterior a la postulación',
      'Preaprobación de crédito hipotecario vigente',
      'Terreno apto para construir o adherirse a proyecto colectivo',
    ],
    ahorroMinimoUF:0,
    modalidad:'Construcción de vivienda nueva. Requiere crédito hipotecario.',
    postulacion:'Individual o colectiva (≥10 integrantes con Entidad Patrocinante).',
    fechasPostulacion2026:'Llamados: mayo y noviembre 2026.',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficio/vivienda/subsidio-habitacional-para-construir-una-vivienda-de-hasta-1600-uf-ds1/',
      postulacion:'https://postulacionenlinea.minvu.cl',
    },
    aplicar(d){ return false; },
    razones(d){ return ['Este programa es para construir vivienda nueva, no para compra de vivienda construida']; }
  },

  /* ── DS1 Construir — hasta 2.200 UF ─────────────────────────────── */
  {
    id:'ds1c2200', nombre:'DS1 — Construir vivienda hasta 2.200 UF', icono:'🏗️',
    categoria:'construccion',
    soloNueva:true,
    descripcionOficial:'Subsidio habitacional para construir una vivienda nueva de hasta 2.200 UF. RSH hasta 90% sin exceder topes de ingreso del llamado. Requiere preaprobación de crédito hipotecario.',
    quienPuedePostular:'Familias no propietarias de vivienda, RSH hasta 90% sin superar topes de ingreso del llamado, con cuenta de ahorro mínimo 12 meses y preaprobación de crédito hipotecario.',
    requisitosOficiales:[
      'Tener mínimo 18 años de edad',
      'No ser propietario/a de vivienda',
      'RSH no superior al 90% y no exceder topes de ingreso del llamado',
      'Cuenta de ahorro para la vivienda con antigüedad mínima de 12 meses',
      'Ahorro depositado al último día del mes anterior a la postulación',
      'Preaprobación de crédito hipotecario vigente',
      'Terreno apto para construir o adherirse a proyecto colectivo',
    ],
    ahorroMinimoUF:0,
    modalidad:'Construcción de vivienda nueva. Requiere crédito hipotecario.',
    postulacion:'Individual o colectiva (≥10 integrantes vía Entidad Patrocinante).',
    fechasPostulacion2026:'Llamados: mayo y noviembre 2026.',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficio/vivienda/subsidio-habitacional-para-construir-una-vivienda-de-hasta-2200-uf-ds1/',
      postulacion:'https://postulacionenlinea.minvu.cl',
    },
    aplicar(d){ return false; },
    razones(d){ return ['Este programa es para construir vivienda nueva, no para compra de vivienda construida']; }
  },

  /* ════════════════════════════════════════════════════════════════════
     🤝  INTEGRACIÓN SOCIAL Y TERRITORIAL (DS19)
  ════════════════════════════════════════════════════════════════════ */

  /* ── DS19 — Para familias ─────────────────────────────────────────── */
  {
    id:'ds19fam', nombre:'DS19 — Integración Social y Territorial (familias)', icono:'🤝',
    categoria:'integracion',
    soloNueva:false,
    descripcionOficial:'Las familias que ya tienen subsidio DS49 o DS1 pueden aplicarlo en proyectos habitacionales integrados, ubicados en barrios bien localizados con acceso a servicios, transporte y equipamiento. Las familias sin subsidio también pueden acceder si cumplen los requisitos DS1. Desde 2022 el proceso de inscripción es a través de un nuevo sistema digital.',
    quienPuedePostular:'Familias con subsidio DS49 o DS1 vigente que deseen aplicarlo en proyectos DS19. También familias sin subsidio que cumplan los requisitos DS1 (RSH hasta 90%, sin vivienda propia).',
    requisitosOficiales:[
      'Tener subsidio habitacional DS49 o DS1 vigente, o cumplir requisitos DS1',
      'No ser propietario/a de vivienda',
      'Inscribirse en el proyecto DS19 correspondiente a través del sistema digital MINVU',
      'El proyecto debe contar con Plan de Integración Social (mínimo 5 actividades, 5 UF por asignatario)',
    ],
    ahorroMinimoUF:0,
    modalidad:'Aplicación del subsidio DS49 o DS1 en proyectos inmobiliarios integrados certificados por MINVU.',
    postulacion:'Inscripción en el proyecto inmobiliario DS19 habilitado. No se postula directamente en SERVIU.',
    fechasPostulacion2026:'Depende de la apertura de proyectos DS19 disponibles. Consulta en minvu.gob.cl.',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficio/vivienda/informacion-para-familias-con-o-sin-subsidio-interesadas-en-incorporarse-a-proyectos-ds-19/',
      postulacion:'https://www.minvu.gob.cl/beneficio/vivienda/subsidio-de-integracion-social-y-territorial-ds19/',
    },
    aplicar(d){ return false; },
    razones(d){ return ['El DS19 aplica sobre un subsidio DS49 o DS1 vigente — usa el simulador para revisar si calificas a esos programas primero']; }
  },

  /* ── DS19 — Para inmobiliarias / desarrolladoras ─────────────────── */
  {
    id:'ds19inm', nombre:'DS19 — Integración Social y Territorial (inmobiliarias)', icono:'🏢',
    categoria:'integracion',
    soloNueva:true,
    descripcionOficial:'Información para entidades desarrolladoras, inmobiliarias y constructoras interesadas en participar en concursos de proyectos DS19. Permite construir viviendas en zonas bien localizadas, incorporando familias con subsidios habitacionales.',
    quienPuedePostular:'Inmobiliarias, constructoras y entidades desarrolladoras habilitadas por MINVU.',
    requisitosOficiales:[
      'Ser entidad desarrolladora habilitada por MINVU',
      'Presentar proyecto en zonas bien localizadas (acceso a servicios, transporte, equipamiento)',
      'Cumplir estándares de diseño y calidad MINVU',
      'Proponer Plan de Integración Social (mínimo 5 actividades, 5 UF por asignatario)',
    ],
    ahorroMinimoUF:0,
    modalidad:'Concurso de proyectos convocado por MINVU/SERVIU. Proyecto debe cumplir certificación DS19.',
    postulacion:'Concurso público convocado por SERVIU regional.',
    fechasPostulacion2026:'Según convocatorias regionales de SERVIU. Consulta en minvu.gob.cl.',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficio/vivienda/informacion-para-entidades-desarrolladoras-inmobiliarias-constructoras-interesadas-en-participar-en-llamados-a-concurso-de-proyectos-ds-19/',
      postulacion:'https://www.minvu.gob.cl/beneficio/vivienda/subsidio-de-integracion-social-y-territorial-ds19/',
    },
    aplicar(d){ return false; },
    razones(d){ return ['Este programa es para entidades desarrolladoras/inmobiliarias, no para familias en el simulador de compra']; }
  },

  /* ════════════════════════════════════════════════════════════════════
     🔨  MEJORAMIENTO DE VIVIENDAS Y BARRIOS
  ════════════════════════════════════════════════════════════════════ */

  /* ── DS27 — Mejoramiento / Viviendas ─────────────────────────────── */
  {
    id:'ds27', nombre:'Mejoramiento — Proyectos para la Vivienda (Hogar Mejor)', icono:'🔨',
    categoria:'mejoramiento',
    soloNueva:false,
    maxPrecioUF:999, esMejoramiento:true,
    descripcionOficial:'Financia reparación, mejoramiento y ampliación de viviendas sociales en localidades urbanas de más de 5.000 habitantes. Incluye adecuación para personas con discapacidad y mejoras de habitabilidad.',
    quienPuedePostular:'Propietarios o asignatarios de viviendas sociales (avalúo fiscal hasta 950 UF) construidas con subsidio MINVU/SERVIU. RSH hasta 60% para postulación individual.',
    requisitosOficiales:[
      'Tener mínimo 18 años de edad',
      'Ser propietario/a o asignatario/a de la vivienda a mejorar',
      'Vivienda social con avalúo fiscal hasta 950 UF, construida con subsidio MINVU o por SERVIU',
      'Localidad urbana de más de 5.000 habitantes',
      'RSH hasta 60% (individual); 60% del grupo en ese tramo si postulación grupal',
      'Ahorro mínimo desde 3 UF (mejoramiento) hasta 7 UF (adecuación)',
      'Contar con Entidad Patrocinante habilitada',
    ],
    ahorroMinimoUF:3,
    modalidad:'No es para compra — mejora o amplía vivienda existente. Subsidio de hasta 504 UF para ampliación.',
    postulacion:'Individual o colectiva con Entidad Patrocinante habilitada.',
    fechasPostulacion2026:'Llamados estimados: abril–mayo 2026. Consulta en el SERVIU de tu región.',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficio/vivienda/programa-de-mejoramiento-de-viviendas-y-barrios-proyectos-para-la-vivienda/',
      postulacion:'https://postulacionenlinea.minvu.cl',
    },
    aplicar(d){ return false; },
    razones(d){ return ['Este programa mejora o amplía una vivienda que ya tienes — no aplica al simulador de compra']; }
  },

  /* ── Mejoramiento — Eficiencia Energética ────────────────────────── */
  {
    id:'mejoref', nombre:'Mejoramiento — Eficiencia Energética e Hídrica', icono:'⚡',
    categoria:'mejoramiento',
    soloNueva:false,
    descripcionOficial:'Financia proyectos de mejoramiento de viviendas orientados a aumentar la eficiencia energética e hídrica: aislación térmica, ventanas, sistemas de calefacción eficiente, agua caliente sanitaria y reducción de consumo hídrico.',
    quienPuedePostular:'Propietarios o asignatarios de viviendas sociales construidas con subsidio MINVU/SERVIU, en localidades urbanas de más de 5.000 habitantes, con RSH vigente.',
    requisitosOficiales:[
      'Ser propietario/a o asignatario/a de vivienda social',
      'Vivienda construida con subsidio MINVU o por SERVIU',
      'Localidad urbana de más de 5.000 habitantes',
      'RSH vigente dentro del tramo exigido por llamado',
      'Contar con Entidad Patrocinante habilitada',
    ],
    ahorroMinimoUF:0,
    modalidad:'Proyecto de eficiencia energética e hídrica en vivienda existente. No es para compra.',
    postulacion:'Colectiva con Entidad Patrocinante. Según convocatoria SERVIU regional.',
    fechasPostulacion2026:'Consulta el calendario de llamados en el SERVIU de tu región.',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficio/vivienda/programa-de-mejoramiento-de-viviendas-y-barrios-proyectos-eficiencia-energetica-e-hidrica-para-la-vivienda/',
      postulacion:'https://postulacionenlinea.minvu.cl',
    },
    aplicar(d){ return false; },
    razones(d){ return ['Este programa mejora viviendas existentes en eficiencia energética — no aplica al simulador de compra']; }
  },

  /* ── Mejoramiento — Condominios ──────────────────────────────────── */
  {
    id:'mejocond', nombre:'Mejoramiento — Proyectos para Condominios de Vivienda', icono:'🏢',
    categoria:'mejoramiento',
    soloNueva:false,
    descripcionOficial:'Financia mejoramiento de espacios comunes, instalaciones y elementos estructurales de condominios de vivienda social, mejorando la convivencia y calidad de vida de los copropietarios.',
    quienPuedePostular:'Copropietarios de condominios de vivienda social construidos con subsidio MINVU/SERVIU, organizados como comunidad o condominio legalmente constituido.',
    requisitosOficiales:[
      'Condominio de vivienda social construido con subsidio MINVU o por SERVIU',
      'Comunidad o condominio legalmente constituido',
      'Localidad urbana de más de 5.000 habitantes',
      'Contar con Entidad Patrocinante habilitada',
      'RSH vigente de al menos el porcentaje requerido por el llamado',
    ],
    ahorroMinimoUF:0,
    modalidad:'Mejoramiento de espacios comunes y elementos del condominio. Postulación colectiva.',
    postulacion:'Colectiva vía Entidad Patrocinante. Según convocatoria SERVIU.',
    fechasPostulacion2026:'Consulta el calendario de llamados en el SERVIU de tu región.',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficio/vivienda/programa-de-mejoramiento-de-viviendas-y-barrios-proyectos-para-condomimios-de-vivienda/',
      postulacion:'https://postulacionenlinea.minvu.cl',
    },
    aplicar(d){ return false; },
    razones(d){ return ['Este programa es para condominios de vivienda social existentes — no aplica al simulador de compra']; }
  },

  /* ── Mejoramiento — Equipamiento Comunitario ─────────────────────── */
  {
    id:'mejoequip', nombre:'Mejoramiento — Equipamiento Comunitario', icono:'🌳',
    categoria:'mejoramiento',
    soloNueva:false,
    descripcionOficial:'Financia proyectos para el mejoramiento del entorno barrial y equipamiento comunitario en sectores de vivienda social: áreas verdes, multicancha, sedes comunitarias, iluminación y veredas.',
    quienPuedePostular:'Organizaciones comunitarias de sectores con vivienda social construida con subsidio MINVU/SERVIU, en localidades urbanas de más de 5.000 habitantes.',
    requisitosOficiales:[
      'Sector con vivienda social construida con subsidio MINVU o por SERVIU',
      'Organización comunitaria vigente (junta de vecinos, comunidad, etc.)',
      'Localidad urbana de más de 5.000 habitantes',
      'Contar con Entidad Patrocinante habilitada',
    ],
    ahorroMinimoUF:0,
    modalidad:'Mejoramiento de entorno y equipamiento barrial. Postulación colectiva vía organización comunitaria.',
    postulacion:'Colectiva vía Entidad Patrocinante o Municipio.',
    fechasPostulacion2026:'Consulta el calendario de llamados en el SERVIU de tu región.',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficio/vivienda/programa-de-mejoramiento-de-viviendas-y-barrios-proyectos-para-equipamiento-comunitario/',
      postulacion:'https://postulacionenlinea.minvu.cl',
    },
    aplicar(d){ return false; },
    razones(d){ return ['Este programa es para mejoramiento de barrios y equipamiento comunitario — no aplica al simulador de compra']; }
  },

  /* ════════════════════════════════════════════════════════════════════
     🌾  HABITABILIDAD RURAL (DS10)
  ════════════════════════════════════════════════════════════════════ */

  /* ── DS10 — Sitio del Residente ──────────────────────────────────── */
  {
    id:'ds10', nombre:'DS10 Rural — Construcción en Sitio del Residente', icono:'🌾',
    categoria:'rural',
    soloNueva:true, esRural:true,
    descripcionOficial:'Permite construir una vivienda nueva en el terreno donde vive la familia, en localidades de hasta 5.000 habitantes. Reconoce particularidades culturales, geográficas y productivas del territorio rural.',
    quienPuedePostular:'Familias que viven en localidades de hasta 5.000 habitantes, con disponibilidad de terreno y RSH vigente.',
    requisitosOficiales:[
      'Tener mínimo 18 años de edad',
      'Residir en localidad de hasta 5.000 habitantes',
      'Acreditar disponibilidad de terreno apto para construcción',
      'RSH vigente',
      'Ahorro mínimo: 10 UF (RSH 40%), 30 UF (RSH 50–60%), 50 UF (RSH 70% o más)',
      'Contar con Entidad de Gestión Rural habilitada por MINVU',
    ],
    ahorroMinimoUF:10,
    modalidad:'Construcción en sitio del residente. Individual o colectiva.',
    postulacion:'Individual o colectiva vía Entidad de Gestión Rural habilitada.',
    fechasPostulacion2026:'Llamados estimados: marzo, mayo, julio, septiembre y diciembre 2026.',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficio/vivienda/programa-de-habitabilidad-rural-construccion-en-sitio-del-residente-localidades-de-hasta-5-000-habitantes/',
      postulacion:'https://postulacionenlinea.minvu.cl',
    },
    aplicar(d){ return false; },
    razones(d){ return ['Este programa es para zonas rurales de hasta 5.000 habitantes — no aplica a la vivienda urbana del simulador']; }
  },

  /* ── DS10 — Conjunto Habitacional ───────────────────────────────── */
  {
    id:'ds10cj', nombre:'DS10 Rural — Construcción de Conjunto Habitacional', icono:'🌾',
    categoria:'rural',
    soloNueva:true, esRural:true,
    descripcionOficial:'Permite construir conjuntos habitacionales en localidades rurales de hasta 5.000 habitantes para familias que no cuentan con terreno propio. El proyecto incluye adquisición o habilitación del terreno.',
    quienPuedePostular:'Familias en localidades de hasta 5.000 habitantes, sin terreno propio, que se organicen colectivamente con Entidad de Gestión Rural.',
    requisitosOficiales:[
      'Tener mínimo 18 años de edad',
      'Residir en localidad de hasta 5.000 habitantes',
      'RSH vigente',
      'Postulación colectiva (grupo organizado)',
      'Contar con Entidad de Gestión Rural habilitada por MINVU',
    ],
    ahorroMinimoUF:10,
    modalidad:'Construcción de conjunto habitacional en localidad rural. Postulación colectiva.',
    postulacion:'Colectiva vía Entidad de Gestión Rural habilitada.',
    fechasPostulacion2026:'Llamados estimados: marzo, mayo, julio, septiembre y diciembre 2026.',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficio/vivienda/programa-de-habitabilidad-rural-construccion-de-conjunto-habitacional-localidades-de-hasta-5-000-habitantes/',
      postulacion:'https://postulacionenlinea.minvu.cl',
    },
    aplicar(d){ return false; },
    razones(d){ return ['Este programa es para zonas rurales de hasta 5.000 habitantes — no aplica a la vivienda urbana del simulador']; }
  },

  /* ── DS10 — Mejoramiento de Vivienda Existente ───────────────────── */
  {
    id:'ds10mj', nombre:'DS10 Rural — Mejoramiento y Ampliación de Vivienda Existente', icono:'🌾',
    categoria:'rural',
    soloNueva:false, esRural:true,
    descripcionOficial:'Financia la reparación, mejoramiento y ampliación de viviendas existentes en localidades rurales de hasta 5.000 habitantes, mejorando las condiciones de habitabilidad de familias que ya cuentan con vivienda.',
    quienPuedePostular:'Propietarios de viviendas en localidades de hasta 5.000 habitantes, con RSH vigente y vivienda que requiera mejoramiento.',
    requisitosOficiales:[
      'Tener mínimo 18 años de edad',
      'Ser propietario/a de la vivienda a mejorar',
      'Residir en localidad de hasta 5.000 habitantes',
      'RSH vigente',
      'Contar con Entidad de Gestión Rural habilitada por MINVU',
    ],
    ahorroMinimoUF:0,
    modalidad:'Mejoramiento o ampliación de vivienda existente en zona rural.',
    postulacion:'Individual o colectiva vía Entidad de Gestión Rural.',
    fechasPostulacion2026:'Llamados estimados: marzo, mayo, julio, septiembre y diciembre 2026.',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficio/vivienda/programa-de-habitabilidad-rural-mejoramiento-y-ampliacion-de-vivienda-existente-localidades-de-hasta-5-000-habitantes/',
      postulacion:'https://postulacionenlinea.minvu.cl',
    },
    aplicar(d){ return false; },
    razones(d){ return ['Este programa mejora viviendas existentes en zonas rurales — no aplica al simulador de compra urbana']; }
  },

  /* ── DS10 — Entorno y Equipamiento Comunitario ───────────────────── */
  {
    id:'ds10ent', nombre:'DS10 Rural — Entorno y Equipamiento Comunitario', icono:'🌾',
    categoria:'rural',
    soloNueva:false, esRural:true,
    descripcionOficial:'Financia el mejoramiento del entorno y equipamiento comunitario en localidades rurales de hasta 5.000 habitantes: saneamiento, veredas, iluminación, áreas verdes y sedes comunitarias.',
    quienPuedePostular:'Organizaciones comunitarias de localidades rurales de hasta 5.000 habitantes, organizadas con Entidad de Gestión Rural.',
    requisitosOficiales:[
      'Localidad de hasta 5.000 habitantes',
      'Organización comunitaria vigente',
      'Contar con Entidad de Gestión Rural habilitada por MINVU',
    ],
    ahorroMinimoUF:0,
    modalidad:'Mejoramiento de entorno y equipamiento en zona rural. Postulación colectiva.',
    postulacion:'Colectiva vía Entidad de Gestión Rural o Municipio.',
    fechasPostulacion2026:'Llamados estimados: marzo, mayo, julio, septiembre y diciembre 2026.',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficio/vivienda/programa-de-habitabilidad-rural-mejoramiento-del-entorno-y-equipamiento-comunitario-localidades-de-hasta-5-000-habitantes/',
      postulacion:'https://postulacionenlinea.minvu.cl',
    },
    aplicar(d){ return false; },
    razones(d){ return ['Este programa es para equipamiento comunitario en zonas rurales — no aplica al simulador de compra']; }
  },

  /* ════════════════════════════════════════════════════════════════════
     🔄  PORTABILIDAD FINANCIERA
  ════════════════════════════════════════════════════════════════════ */

  /* ── Portabilidad Financiera ─────────────────────────────────────── */
  {
    id:'portabilidad', nombre:'Portabilidad Financiera Hipotecaria', icono:'🔄',
    categoria:'portabilidad',
    soloNueva:false,
    descripcionOficial:'La Ley de Portabilidad Financiera (vigente desde el 8 de septiembre de 2020) permite cambiar tu crédito hipotecario de una institución financiera a otra con mejores condiciones, manteniendo el subsidio habitacional DS1 o DS19 que ya tienes. No pierdes el beneficio de rebaja de dividendos si no incorporas otras deudas.',
    quienPuedePostular:'Personas con crédito hipotecario vigente con subsidio DS1 o DS19 que deseen refinanciar o trasladar su crédito a otra institución financiera.',
    requisitosOficiales:[
      'Tener crédito hipotecario vigente con subsidio DS1 o DS19',
      'Solicitar oferta de portabilidad a otra institución financiera',
      'Revisar la oferta estandarizada recibida (el banco tiene plazos para entregarla)',
      'No incorporar otras deudas al refinanciamiento si se quiere conservar la rebaja de dividendos',
    ],
    ahorroMinimoUF:0,
    modalidad:'Refinanciamiento hipotecario entre instituciones financieras. Mantiene subsidio DS1/DS19.',
    postulacion:'Directamente con la institución financiera destino. No requiere trámite en MINVU.',
    fechasPostulacion2026:'Disponible de forma continua. Sin llamado periódico.',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficio/vivienda/portabilidad-financiera/',
      postulacion:'https://calculadorarefinanciamientocredito.minvu.cl',
    },
    aplicar(d){ return false; },
    razones(d){ return ['La portabilidad aplica a créditos hipotecarios ya contratados con subsidio DS1 o DS19 — no aplica al simulador de primera compra']; }
  },

  /* ════════════════════════════════════════════════════════════════════
     ⚡  PROGRAMAS ESPECIALES
  ════════════════════════════════════════════════════════════════════ */

  /* ── Informe Valech ──────────────────────────────────────────────── */
  {
    id:'valech', nombre:'Beneficio Habitacional — Informe Valech', icono:'📜',
    categoria:'especiales',
    soloNueva:false,
    descripcionOficial:'Las personas reconocidas en el Informe Valech como víctimas de violaciones a los derechos humanos durante la dictadura militar tienen acceso prioritario a subsidios habitacionales MINVU, con requisitos flexibilizados (pueden postular como personas solas sin grupo familiar) y tratos diferenciados.',
    quienPuedePostular:'Personas reconocidas en el Informe Valech de la Comisión Nacional sobre Prisión Política y Tortura.',
    requisitosOficiales:[
      'Estar incluido en el Informe Valech de la Comisión Nacional sobre Prisión Política y Tortura',
      'Acreditar calidad de víctima Valech ante el SERVIU',
      'Presentar certificado oficial Valech',
      'Cumplir demás requisitos del subsidio al que se postula (RSH, no propietario, etc.)',
    ],
    ahorroMinimoUF:0,
    modalidad:'Acceso prioritario y condiciones especiales en subsidios habitacionales MINVU (DS49, DS1 y otros).',
    postulacion:'Presencial en SERVIU regional. Se debe presentar certificado Valech.',
    fechasPostulacion2026:'Según los llamados de cada subsidio habitacional. Consultar en SERVIU.',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficio/vivienda/informe-valech/',
      postulacion:'https://postulacionenlinea.minvu.cl',
    },
    aplicar(d){ return false; },
    razones(d){ return ['Este beneficio especial aplica a víctimas reconocidas en el Informe Valech — consulta directamente en SERVIU']; }
  },

  /* ── Información para el Arrendador ─────────────────────────────── */
  {
    id:'arrendador', nombre:'Información para el Arrendador (DS52)', icono:'🏠',
    categoria:'especiales',
    soloNueva:false,
    descripcionOficial:'Información oficial del MINVU para propietarios de vivienda que deseen arrendarla a familias beneficiarias del Subsidio de Arriendo DS52. Explica requisitos de la vivienda, el contrato tipo y la relación con el SERVIU.',
    quienPuedePostular:'Propietarios de vivienda interesados en arrendar a beneficiarios del subsidio DS52.',
    requisitosOficiales:[
      'Ser propietario de vivienda con arriendo máximo de 11 UF/mes (13 UF en regiones extremas)',
      'La vivienda debe cumplir estándares mínimos de habitabilidad MINVU',
      'Firmar contrato de arriendo tipo MINVU con el beneficiario del subsidio',
      'Inscribir el contrato ante el SERVIU',
    ],
    ahorroMinimoUF:0,
    modalidad:'Información para propietarios que arriendan a beneficiarios del DS52.',
    postulacion:'No aplica — es información para arrendadores, no un subsidio de postulación.',
    fechasPostulacion2026:'Disponible de forma continua.',
    linksOficiales:{
      minvu:'https://www.minvu.gob.cl/beneficio/vivienda/informacion-para-el-arrendador/',
      postulacion:'https://www.minvu.gob.cl/beneficio/vivienda/informacion-para-el-arrendador/',
    },
    aplicar(d){ return false; },
    razones(d){ return ['Esta es información para propietarios arrendadores — no aplica al simulador de compra']; }
  },

];

let UF_VALOR = 38500;
let _resultadoCalculado = false;
let _bcoPerfilUsuario = null;

/* HELPERS CLP (inputs tipo text con puntos de miles) */
function parseCLP(id){
  const el=document.getElementById(id);
  if(!el) return 0;
  const raw=el.value.replace(/\./g,'').replace(/[^0-9]/g,'');
  return raw?parseInt(raw,10):0;
}
function formatCLP(id){
  const el=document.getElementById(id);
  if(!el) return;
  const raw=el.value.replace(/\./g,'').replace(/[^0-9]/g,'');
  if(!raw){ el.value=''; return; }
  el.value=parseInt(raw,10).toLocaleString('es-CL');
}

/* SELECTOR AHORRO INICIAL */
function selAhorro(btn){
  document.querySelectorAll('.ahorro-btn').forEach(b=>b.classList.remove('activo'));
  btn.classList.add('activo');
  document.getElementById('ahorro').value = btn.dataset.val;
}

function selSituacion(sit){
  // Actualizar botones
  ['primera','segunda','tengo'].forEach(s=>{
    document.getElementById('sit-btn-'+s).classList.toggle('activo', s===sit);
  });
  // Guardar en campo oculto
  document.getElementById('primera').value = sit;
  // Actualizar hint y aviso
  const hint=document.getElementById('sit-hint');
  const aviso=document.getElementById('sit-aviso');
  if(sit==='primera'){
    hint.textContent='Accedes a todos los subsidios del Estado';
    aviso.classList.remove('visible');
  } else if(sit==='segunda'){
    hint.textContent='Segunda propiedad — algunos subsidios no aplican';
    aviso.innerHTML='⚠️ <strong>Segunda vivienda:</strong> DS49 y DS1 son exclusivos para primera vivienda. Aún puedes acceder a <strong>FOGAES</strong> (pie 10%) si calificas por ingresos.';
    aviso.classList.add('visible');
  } else {
    hint.textContent='Ya tienes casa — aplican subsidios de reemplazo';
    aviso.innerHTML='ℹ️ <strong>Ya tienes vivienda:</strong> Los subsidios DS49 y DS1 no aplican. Puedes acceder a subsidios de <strong>reemplazo de vivienda</strong> si tu propiedad actual tiene deficiencias o es una vivienda precaria.';
    aviso.classList.add('visible');
  }
}

/* MODO PRECIO */
let _modoPrecio = 'precio'; // 'm2' | 'precio'

function selModoPrecio(modo){
  _modoPrecio = modo;
  document.getElementById('modo-btn-m2').classList.toggle('activo', modo==='m2');
  document.getElementById('modo-btn-precio').classList.toggle('activo', modo==='precio');
  document.getElementById('bloque-m2').style.display = modo==='m2' ? '' : 'none';
  document.getElementById('bloque-precio').style.display = modo==='precio' ? '' : 'none';
  // Actualizar hint UF en bloque precio
  const ufHint = document.getElementById('uf-hint-val');
  if(ufHint) ufHint.textContent = fmt(UF_VALOR);
}

function actualizarPrecioEstimado(){
  const m2 = parseFloat(document.getElementById('m2').value) || 0;
  const reg = document.getElementById('region').value;
  const tipo = document.getElementById('tipo').value;
  const hint = document.getElementById('hint-precio-estimado');
  if(!m2 || !reg){
    if(hint) hint.textContent='—';
    return;
  }
  const datos = REGIONES[reg];
  if(!datos){
    if(hint) hint.textContent='—';
    return;
  }
  const ufKey = tipo==='depto'?'depto':tipo==='casa'?'casa':'usada';
  const precioUF = datos[ufKey] * m2;
  const precioCLP = precioUF * UF_VALOR;
  if(hint) hint.textContent = `≈ ${Math.round(precioUF).toLocaleString('es-CL')} UF · $${fmt(precioCLP)}`;
}

function actualizarM2Estimado(){
  const clp = parseCLP('precio-directo');
  const reg = document.getElementById('region').value;
  const tipo = document.getElementById('tipo').value;
  const hint = document.getElementById('hint-m2-estimado');
  if(!clp || !reg){
    if(hint) hint.textContent='—';
    return;
  }
  const datos = REGIONES[reg];
  if(!datos){
    if(hint) hint.textContent='—';
    return;
  }
  const ufKey = tipo==='depto'?'depto':tipo==='casa'?'casa':'usada';
  const precioUF = clp / UF_VALOR;
  const m2est = Math.round(precioUF / datos[ufKey]);
  if(hint) hint.textContent = `≈ ${Math.round(precioUF).toLocaleString('es-CL')} UF · ~${m2est} m² estimados`;
  // Sincronizar al campo UF
  const ufInput = document.getElementById('precio-directo-uf');
  if(ufInput) ufInput.value = Math.round(precioUF);
}

function actualizarDesdUF(){
  const uf = parseFloat(document.getElementById('precio-directo-uf').value) || 0;
  const hint = document.getElementById('hint-m2-estimado');
  if(!uf){
    const clpEl=document.getElementById('precio-directo');
    if(clpEl) clpEl.value='';
    if(hint) hint.textContent='—';
    return;
  }
  const clp = Math.round(uf * UF_VALOR);
  const el = document.getElementById('precio-directo');
  if(el){ el.value = clp.toLocaleString('es-CL'); }
  const reg = document.getElementById('region').value;
  const tipo = document.getElementById('tipo').value;
  const datos = REGIONES[reg];
  if(datos){
    const ufKey = tipo==='depto'?'depto':tipo==='casa'?'casa':'usada';
    const m2est = Math.round(uf / datos[ufKey]);
    if(hint) hint.textContent = `≈ ${Math.round(uf).toLocaleString('es-CL')} UF · ~${m2est} m² estimados`;
  }
}

/* WIZARD */
function showScreen(n){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('activa'));
  const target=document.getElementById('screen-'+n);
  target.classList.add('activa');
  [1,2,3].forEach(i=>{
    const it=document.getElementById('ws'+i);
    it.classList.remove('activo','done');
    it.removeAttribute('aria-current');
    if(i<n) it.classList.add('done');
    else if(i===n){ it.classList.add('activo'); it.setAttribute('aria-current','step'); }
  });
  [1,2].forEach(i=>document.getElementById('ws-l'+i).classList.toggle('done',i<n));
  window.scrollTo({top:0,behavior:'smooth'});
  requestAnimationFrame(()=>{
    const h=target.querySelector('h1,h2');
    if(h){ h.setAttribute('tabindex','-1'); h.focus({preventScroll:true}); }
  });
}

function irAPaso1(){ showScreen(1); }

function irAPaso2(){
  const sueldo=parseCLP('sueldo');
  if(sueldo<=0){
    const el=document.getElementById('sueldo');
    el.style.borderColor='var(--rojo)';
    el.focus();
    el.placeholder='Ingresa tu sueldo para continuar';
    setTimeout(()=>{ el.style.borderColor=''; el.placeholder='Ej: 900.000'; },3000);
    return;
  }
  // Sincronizar casado
  const elCasado=document.getElementById('casado');
  if(elCasado) document.getElementById('btn-casado').classList.toggle('activo',elCasado.checked);
  // Sincronizar región seleccionada en paso 1 → paso 2
  const r1=document.getElementById('region1');
  const r2=document.getElementById('region');
  if(r1&&r2) r2.value=r1.value;
  // Actualizar hint precio estimado al entrar al paso 2
  setTimeout(actualizarPrecioEstimado, 50);
  // Actualizar hint UF
  const ufHint=document.getElementById('uf-hint-val');
  if(ufHint) ufHint.textContent=fmt(UF_VALOR);
  showScreen(2);
}

function irAResultados(){
  showScreen(3);
  calcular();
  renderDesigualdad();
  const sl=document.getElementById('arriendo-slider');
  if(sl&&!sl.dataset.tocado){
    const reg=document.getElementById('region').value;
    const tipo=document.getElementById('tipo').value;
    const m2=parseFloat(document.getElementById('m2').value)||55;
    const ufKey=tipo==='depto'?'depto':tipo==='casa'?'casa':'usada';
    let precioClp=REGIONES[reg][ufKey]*m2*UF_VALOR;
    if(_modoPrecio==='precio'){
      const ufDirecto=parseFloat(document.getElementById('precio-directo-uf').value)||0;
      const clpDirecto=parseCLP('precio-directo');
      if(ufDirecto>0) precioClp=ufDirecto*UF_VALOR;
      else if(clpDirecto>0) precioClp=clpDirecto;
    }
    const sug=Math.round(precioClp*0.042/12/10000)*10000;
    sl.value=Math.min(Math.max(sug,100000),2000000);
    actualizarSliderArriendo();
  }
}

/* TABS */
function switchTab(panelId,btn){
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('activo'));
  document.querySelectorAll('.tab-btn').forEach(b=>{ b.classList.remove('activo'); b.setAttribute('aria-selected','false'); });
  document.getElementById(panelId).classList.add('activo');
  btn.classList.add('activo');
  btn.setAttribute('aria-selected','true');
}

/* UF */
const LS_UF='ccuc_uf_v', LS_UF_TS='ccuc_uf_ts', UF_TTL=3600000; // 1 hora
async function cargarUF(){
  try{
    const ts=parseInt(localStorage.getItem(LS_UF_TS)||'0',10);
    const cached=parseFloat(localStorage.getItem(LS_UF)||'0');
    if(cached>0&&Date.now()-ts<UF_TTL){
      UF_VALOR=cached;
      document.getElementById('uf-valor').textContent=UF_VALOR.toLocaleString('es-CL',{minimumFractionDigits:2,maximumFractionDigits:2});
      if(_resultadoCalculado){ calcular(); renderDesigualdad(); }
      return;
    }
    const r=await fetch('https://mindicador.cl/api/uf');
    const d=await r.json();
    UF_VALOR=d.serie[0].valor;
    try{ localStorage.setItem(LS_UF,UF_VALOR); localStorage.setItem(LS_UF_TS,Date.now()); }catch{}
    document.getElementById('uf-valor').textContent=UF_VALOR.toLocaleString('es-CL',{minimumFractionDigits:2,maximumFractionDigits:2});
    if(_resultadoCalculado){ calcular(); renderDesigualdad(); }
  }catch{
    const cached=parseFloat(localStorage.getItem(LS_UF)||'0');
    if(cached>0) UF_VALOR=cached;
    document.getElementById('uf-valor').textContent=UF_VALOR.toLocaleString('es-CL')+' (ref.)';
  }
}

/* HELPERS */
const fmt=n=>Math.round(n).toLocaleString('es-CL');
const fmtUF=n=>Math.round(n).toLocaleString('es-CL');

function cuotaMensual(montoUF,tasaAnual,años){
  const r=(tasaAnual/100)/12, n=años*12;
  if(r===0) return (montoUF*UF_VALOR)/n;
  return montoUF*UF_VALOR*(r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1);
}

function maxCreditoPorSueldo(sueldoTotal,tasaAnual,años,pctMax=0.30){
  const r=(tasaAnual/100)/12, n=años*12;
  const cuotaMax=sueldoTotal*pctMax;
  if(r===0) return cuotaMax*n;
  return cuotaMax*(Math.pow(1+r,n)-1)/(r*Math.pow(1+r,n));
}

/* CALCULAR */
function calcular(){
  const reg=document.getElementById('region').value;
  const tipo=document.getElementById('tipo').value;
  const sueldo=parseCLP('sueldo');
  const ahorroHoy=parseCLP('ahorro');
  const codeudor=parseCLP('codeudor');
  const edad=0;
  const primera=document.getElementById('primera').value !== 'segunda' && document.getElementById('primera').value !== 'tengo';
  const situacion=document.getElementById('primera').value || 'primera';
  const m2=parseFloat(document.getElementById('m2').value)||55;
  const tasa=parseFloat(document.getElementById('tasa').value)||4.1;
  const plazoIngresado=parseFloat(document.getElementById('plazo').value)||25;
  const plazoMaxEdad=edad>0?Math.max(75-edad,5):40;
  const plazo=edad>0?Math.min(plazoIngresado,plazoMaxEdad):plazoIngresado;
  const piePct=parseFloat(document.getElementById('pie').value)||20;

  const sueldoTotal=sueldo+codeudor;
  const datos=REGIONES[reg];
  const ufKey=tipo==='depto'?'depto':tipo==='casa'?'casa':'usada';
  const ufM2=datos[ufKey];

  // Precio: modo directo o por m²
  let precioUF;
  if(_modoPrecio==='precio'){
    const ufDirecto=parseFloat(document.getElementById('precio-directo-uf').value)||0;
    const clpDirecto=parseCLP('precio-directo');
    if(ufDirecto>0) precioUF=ufDirecto;
    else if(clpDirecto>0) precioUF=clpDirecto/UF_VALOR;
    else precioUF=ufM2*m2;
  } else {
    precioUF=ufM2*m2;
  }
  const precioClp=precioUF*UF_VALOR;
  const ingresoUF=sueldoTotal/UF_VALOR;
  const pieUF=precioUF*piePct/100;
  const pieClp=pieUF*UF_VALOR;
  const credito=precioUF-pieUF;
  const cuota=cuotaMensual(credito,tasa,plazo);
  const pct=sueldoTotal>0?(cuota/sueldoTotal)*100:0;
  const maxCredClp=maxCreditoPorSueldo(sueldoTotal,tasa,plazo);
  const maxCredUF=maxCredClp/UF_VALOR;
  const maxPrecioUF=maxCredUF/(1-piePct/100);
  const maxPrecioClp=maxPrecioUF*UF_VALOR;

  const ctx={sueldo:sueldoTotal, ingresoUF,precioUF,primera,situacion,tipo,tipoOk(s){return !s.soloNueva||tipo!=='usada';}};
  const subsAplican=SUBSIDIOS_DEF.map(s=>({...s,aplica:s.aplicar(ctx)}));
  setSubCtxSimulador(ctx); // Guarda el contexto para la pantalla de subsidios interactivos
  _bcoPerfilUsuario={
    sueldo:sueldoTotal,
    precioUF,
    piePct,
    plazoAnios:plazo,
    region:reg,
    tipo
  };
  if(typeof actualizarAsistenteBancos==='function') actualizarAsistenteBancos();

  /* RESUMEN TOP */
  const tipoLabel=tipo==='depto'?'Depto.':tipo==='casa'?'Casa':'Usada';
  const viviendaResumen = _modoPrecio==='precio'
    ? `Precio directo · ${datos.nombre.split('/')[0].trim()}`
    : `${tipoLabel} ${m2}m² · ${datos.nombre.split('/')[0].trim()}`;
  document.getElementById('resumen-top').innerHTML=`
    <div class="resumen-top-item"><span class="resumen-top-label">Sueldo</span><span class="resumen-top-val">$${fmt(sueldoTotal)}</span></div>
    <div class="resumen-top-sep"></div>
    <div class="resumen-top-item"><span class="resumen-top-label">Vivienda</span><span class="resumen-top-val">${viviendaResumen}</span></div>
    <div class="resumen-top-sep"></div>
    <div class="resumen-top-item"><span class="resumen-top-label">Precio</span><span class="resumen-top-val">$${fmt(precioClp)}</span></div>
  <button class="btn-editar" data-main-action="ir-paso-1">✎ Editar</button>`;

  document.getElementById('label-region-header').innerHTML=datos.nombre+' · <strong>'+ufM2+' UF/m²</strong> · CChC Q3 2025';

  document.getElementById('barra-pct').textContent=sueldoTotal>0?pct.toFixed(1)+'%':'—';
  const bar=document.getElementById('barra');
  bar.style.width=Math.min(pct,100)+'%';
  bar.style.background=pct<=30?'#1A7A4A':pct<=50?'#B7780A':'#C0392B';

  const badge=document.getElementById('semaforo-badge');
  const texto=document.getElementById('texto-semaforo');
  if(sueldoTotal<=0){
    badge.className='pill pill-amarillo'; badge.textContent='Sin sueldo'; texto.textContent='';
  } else if(pct<=30){
    badge.className='pill pill-verde'; badge.textContent='Acceso posible';
    texto.textContent='La cuota es el '+pct.toFixed(1)+'% de tus ingresos, dentro del límite del 30%.';
  } else if(pct<=50){
    badge.className='pill pill-amarillo'; badge.textContent='Esfuerzo alto';
    texto.textContent='La cuota representa el '+pct.toFixed(1)+'% de tus ingresos. Superas el 30% recomendado.';
  } else {
    badge.className='pill pill-rojo'; badge.textContent='Difícil acceso';
    texto.textContent='La cuota es el '+pct.toFixed(1)+'% de tus ingresos. Considera subsidios o codeudor.';
  }

  document.getElementById('m-cuota').textContent='$'+fmt(cuota);
  document.getElementById('m-cuota-sub').textContent=plazo+' años · '+tasa+'% tasa';
  document.getElementById('m-precio').textContent='$'+fmt(precioClp);
  document.getElementById('m-precio-uf').textContent=fmtUF(precioUF)+' UF total';
  document.getElementById('m-pie').textContent='$'+fmt(pieClp);
  document.getElementById('m-pie-sub').textContent=fmtUF(pieUF)+' UF · '+piePct+'% del precio';
  document.getElementById('m-maxcredito').textContent='$'+fmt(maxCredClp);
  document.getElementById('m-maxcredito-sub').textContent='max vivienda $'+fmt(maxPrecioClp);

  const avisoAhorro=document.getElementById('aviso-ahorro');
  if(sueldoTotal>0){
    avisoAhorro.style.display='block';
    const falta=pieClp-ahorroHoy;
    const avisoEdad=(edad>0&&plazo<plazoIngresado)?`<br>⏳ <strong>Plazo ajustado:</strong> con ${edad} años el banco te presta máximo ${plazo} años (no ${plazoIngresado}).`:'';
    // Pie siempre calculado automáticamente como precioUF * piePct / 100
    // ahorroHoy es el ahorro declarado por el usuario (0 / 1M / 5M / 20M)
    if(ahorroHoy>=pieClp){
      avisoAhorro.className='aviso aviso-verde';
      avisoAhorro.innerHTML=`✅ <strong>Tu ahorro cubre el pie completo.</strong><br>
        🏠 Pie requerido: <strong>$${fmt(pieClp)}</strong> (${piePct}% de $${fmt(precioClp)})<br>
        💰 Tu ahorro actual: <strong>$${fmt(ahorroHoy)}</strong> · Te sobran $${fmt(ahorroHoy-pieClp)}<br>
        Puedes comprar si el banco aprueba el crédito.${avisoEdad}`;
    } else if(falta>0){
      const mesesFalta=sueldoTotal*0.20>0?Math.ceil(falta/(sueldoTotal*0.20)):0;
      const aniosFalta=(mesesFalta/12).toFixed(1);
      avisoAhorro.className='aviso aviso-neutro';
      avisoAhorro.innerHTML=`📊 <strong>Pie requerido: $${fmt(pieClp)}</strong> (${piePct}% del precio)<br>
        💰 Tu ahorro actual: <strong>$${fmt(ahorroHoy)}</strong> · Te faltan <strong>$${fmt(falta)}</strong><br>
        ⏱️ Ahorrando el 20% de tu sueldo ($${fmt(Math.round(sueldoTotal*0.20))}/mes), juntas el pie en <strong>${mesesFalta} meses</strong> (~${aniosFalta} años).${avisoEdad}`;
    } else if(avisoEdad){
      avisoAhorro.className='aviso aviso-neutro';
      avisoAhorro.innerHTML=avisoEdad.replace('<br>','');
    }
  } else {
    avisoAhorro.style.display='none';
  }

  const cuotaSinLimiteEdad=cuotaMensual(credito,tasa,plazoIngresado);
  renderBloqueEdad(edad,plazoIngresado,plazo,cuota,cuotaSinLimiteEdad,sueldoTotal,precioClp,pieClp,ahorroHoy);

  const aniosPieCalc=(pieClp-ahorroHoy>0&&sueldoTotal*0.20>0)?(pieClp-ahorroHoy)/(sueldoTotal*0.20)/12:0;
  renderFraseImpacto(sueldoTotal,pct,pieClp,aniosPieCalc,precioClp,datos.nombre,edad,plazo);
  renderEscenarios(precioUF,piePct,tasa,plazo,subsAplican,sueldoTotal,ahorroHoy);
  renderSubsidios(subsAplican,precioUF,tasa,plazo,ctx);
  renderArrVsCompra(precioClp,precioUF,piePct,tasa,plazo,cuota);
  renderTabla(sueldoTotal,piePct,tasa,plazo);
  const histSubEl=document.getElementById('hist-sub');
  if(histSubEl){
    const sfx=reg!=='RM'?` — En ${datos.nombre.split('/')[0].trim()}, un depto de 55 m² cuesta hoy <strong>${fmtUF(datos.depto*55)} UF</strong> (~$${fmt(datos.depto*55*UF_VALOR)}).`:'';
    histSubEl.innerHTML='Referencia RM · Depto 55 m² en Santiago · Sueldos en ese período subieron ~40%'+sfx;
  }
  _resultadoCalculado=true;
}

/* BLOQUE EDAD */
function renderBloqueEdad(edad,plazoIngresado,plazo,cuota,cuotaSinLimite,sueldoTotal,precioClp,pieClp,ahorroHoy){
  const bloque=document.getElementById('bloque-edad');
  if(!bloque) return;
  if(edad<=0){bloque.style.display='none';return;}
  bloque.style.display='block';
  const edadFin=edad+plazo;
  const aniosPagoFin=new Date().getFullYear()+plazo;
  const plazoLimitado=plazo<plazoIngresado;
  const pct=sueldoTotal>0?cuota/sueldoTotal*100:0;
  document.getElementById('edad-subtitulo').textContent=`Tienes ${edad} años · plazo máximo del banco: ${plazo} años (hasta ~75, varía por banco)`;
  const colorPct=pct<=30?'verde':pct<=50?'amarillo':'rojo';
  document.getElementById('edad-metricas').innerHTML=`
    <div class="edad-metrica"><div class="edad-metrica-label">Terminas de pagar</div><div class="edad-metrica-valor ${edadFin>=65?'rojo':edadFin>=55?'amarillo':'verde'}">${edadFin} años</div><div class="edad-metrica-sub">Año ${aniosPagoFin}</div></div>
    <div class="edad-metrica"><div class="edad-metrica-label">Plazo disponible</div><div class="edad-metrica-valor ${plazoLimitado?'amarillo':'verde'}">${plazo} años</div><div class="edad-metrica-sub">${plazoLimitado?`Reducido desde ${plazoIngresado}`:'Sin restricción'}</div></div>
    <div class="edad-metrica"><div class="edad-metrica-label">Cuota mensual</div><div class="edad-metrica-valor ${colorPct}">$${fmt(cuota)}</div><div class="edad-metrica-sub">${pct.toFixed(1)}% de tu sueldo</div></div>`;
  let txt='';
  if(plazoLimitado){ const dif=cuota-cuotaSinLimite; txt+=`⚠️ <strong>Tu edad acorta el plazo de ${plazoIngresado} a ${plazo} años.</strong> Tu cuota sube <em>$${fmt(dif)} más</em> que si pudieras pagar en ${plazoIngresado} años. `; }
  if(edadFin>75){ txt+=`🔴 <strong>El banco no aprobará el plazo de ${plazoIngresado} años</strong> porque tendrías ${edad+plazoIngresado} años al terminar. El plazo real queda en <em>${plazo} años</em>. `; }
  else if(edadFin>=65){ txt+=`🟡 Terminarías de pagar a los <strong>${edadFin} años</strong>, cerca del retiro. Considera que a esa edad tu ingreso puede bajar. `; }
  else if(edadFin<=50){ txt+=`✅ Terminarías de pagar a los <strong>${edadFin} años</strong>, con mucho margen financiero por delante. `; }
  else { txt+=`Terminarías de pagar a los <strong>${edadFin} años</strong>. `; }
  if(ahorroHoy<pieClp&&sueldoTotal>0){
    const mesesParaPie=Math.ceil((pieClp-ahorroHoy)/(sueldoTotal*0.20));
    const edadConPie=edad+mesesParaPie/12;
    const plazoRestante=75-Math.ceil(edadConPie);
    if(plazoRestante<15&&plazoRestante>0){ txt+=`📌 Si tardas <em>${Math.ceil(mesesParaPie/12)} años</em> en juntar el pie, tendrías <strong>${plazoRestante} años</strong> para pagar — lo que subiría aún más la cuota.`; }
    else if(plazoRestante<=0){ txt+=`🔴 <strong>Atención:</strong> al ritmo de ahorro actual juntarías el pie a los <em>${Math.round(edadConPie)} años</em> — ya no calificarías para crédito.`; }
  }
  if(!txt) txt=`Con ${edad} años y plazo de ${plazo} años tienes una ventana normal para este crédito.`;
  document.getElementById('edad-veredicto').innerHTML=txt;
}

/* ESCENARIOS */
function renderEscenarios(precioUF,piePct,tasa,plazo,subs,sueldoTotal,ahorroHoy){
  const grid=document.getElementById('escenarios-grid');
  const pie1=precioUF*piePct/100;
  const cuota1=cuotaMensual(precioUF-pie1,tasa,plazo);
  const pct1=sueldoTotal>0?cuota1/sueldoTotal*100:0;
  const tieneEsc1=ahorroHoy>=pie1*UF_VALOR;

  const subDS=subs.find(s=>s.aplica&&['ds49','ds1t1','ds1t2','ds1t3'].includes(s.id));
  const subBono=null; // Bono Pie DS19 retirado — sin bono separado en nuevo SUBSIDIOS_DEF
  let cuota2=null,pct2=0,pie2=null,pieClp2=null,pieClp2Ef=null;
  if(subDS){
    const prU=Math.max(precioUF-(subDS.montoUF||0),0);
    pie2=prU*piePct/100; pieClp2=pie2*UF_VALOR;
    // subBono siempre null (Bono Pie DS19 eliminado)
    pieClp2Ef=pieClp2;
    cuota2=cuotaMensual(prU-pie2,tasa,plazo); pct2=sueldoTotal>0?cuota2/sueldoTotal*100:0;
  }

  const subFog=subs.find(s=>s.id==='fogaes'&&s.aplica);
  const subTasa=subs.find(s=>s.id==='ley21748'&&s.aplica);
  let cuota3=null,pct3=0,pie3=null,pieClp3=null,tasa3=tasa;
  if(subFog){ tasa3=subTasa?Math.max(tasa-subTasa.tasaDescuento,0.5):tasa; pie3=precioUF*0.10; pieClp3=pie3*UF_VALOR; cuota3=cuotaMensual(precioUF-pie3,tasa3,plazo); pct3=sueldoTotal>0?cuota3/sueldoTotal*100:0; }

  // "Mejor" = primero entre los accesibles (tiene el pie); si ninguno es accesible, el de cuota mínima
  const tieneEsc2=cuota2!==null&&ahorroHoy>=pieClp2Ef;
  const tieneEsc3=cuota3!==null&&ahorroHoy>=pieClp3;
  const todasOpciones=[
    {id:1,cuota:cuota1,acc:tieneEsc1},
    cuota2!==null?{id:2,cuota:cuota2,acc:tieneEsc2}:null,
    cuota3!==null?{id:3,cuota:cuota3,acc:tieneEsc3}:null
  ].filter(Boolean);
  const accesibles=todasOpciones.filter(o=>o.acc);
  const mejor=(accesibles.length>0?accesibles:todasOpciones).slice().sort((a,b)=>a.cuota-b.cuota)[0];

  const pillPct=pct=>{ if(!pct||sueldoTotal<=0) return ''; const cl=pct<=30?'pill-verde':pct<=50?'pill-amarillo':'pill-rojo'; return `<span class="pill ${cl}" style="font-size:11px;padding:2px 9px">${pct.toFixed(1)}%</span>`; };
  // pieClpEf: monto en CLP que el usuario debe tener ahorrado (ya descontado Bono Pie si aplica)
  const veredicto=(pct,pieClpEf,tieneAhorro,noAplica)=>{ if(noAplica) return `<div class="esc-linea" style="margin-top:8px;color:var(--suave2)">No aplica a tu caso</div>`; const acc=pct<=30?'✅ El banco lo aprobaría':pct<=50?'⚠️ Límite del banco':'❌ El banco no lo aprobaría'; const pie_txt=tieneAhorro?'✅ Tienes el pie':`📊 Te faltan $${fmt(Math.max(pieClpEf-ahorroHoy,0))} para el pie`; return `<div class="esc-linea" style="margin-top:8px">${acc}</div><div class="esc-linea">${pie_txt}</div>`; };
  const buildDetalle=(precioU,pieU,tasaD,cuotaD,pieClpEfD,tieneAhorroD,noAplicaD)=>{
    if(noAplicaD||!cuotaD||!pieU) return '';
    const creditoU=precioU-pieU;
    const creditoClp=creditoU*UF_VALOR;
    const totalPagado=cuotaD*plazo*12;
    const totalInteres=Math.round(totalPagado-creditoClp);
    const pctI=creditoClp>0?Math.round(totalInteres/creditoClp*100):0;
    const faltaPie=Math.max(pieClpEfD-ahorroHoy,0);
    const anosPie=faltaPie>0&&sueldoTotal*0.20>0?((faltaPie/(sueldoTotal*0.20))/12).toFixed(1):null;
    const piePctD=Math.round(pieU/precioU*100);
    const row=(k,v)=>`<div class="det-fila"><span class="det-k">${k}</span><span class="det-v">${v}</span></div>`;
    const sep='<hr class="det-sep">';
    return `<div class="esc-card-detalle">
      ${row('Precio vivienda',precioU.toFixed(0)+' UF')}
      ${row('Pie ('+piePctD+'%)',`$${fmt(Math.round(pieU*UF_VALOR))}`)}
      ${row('Crédito',`${creditoU.toFixed(0)} UF`)}
      ${row('Tasa anual',tasaD+'%')}
      ${row('Plazo',plazo+' años ('+plazo*12+' cuotas)')}
      ${sep}
      ${row('Dividendo/mes','<strong>$'+fmt(cuotaD)+'</strong>')}
      ${row('Total dividendos','$'+fmt(Math.round(totalPagado)))}
      ${row('Intereses totales','$'+fmt(totalInteres)+' ('+pctI+'% extra)')}
      ${sep}
      ${row('Tu ahorro actual','$'+fmt(ahorroHoy))}
      ${tieneAhorroD
        ? row('Estado pie','✅ Tienes el pie')
        : row('Te faltan','$'+fmt(faltaPie)+(anosPie?' · ~'+anosPie+' años':''))}
    </div>`;
  };
  const mkCard=(titulo,sub,cuota,pct,pieClpEf,tieneAhorro,esMejor,noAplica,extra,detalle)=>`
    <div class="esc-card ${esMejor?'destacado':''} ${noAplica?'esc-no-aplica':''}">
      ${esMejor?'<span class="esc-badge">✓ Mejor opción</span>':''}
      <div class="esc-card-tag">${titulo}</div>
      <div class="esc-cuota">${cuota?'$'+fmt(cuota):'—'}</div>
      <div style="margin-top:5px">${cuota?pillPct(pct):''}</div>
      <div class="esc-linea" style="margin-top:6px;color:var(--texto)">${sub}</div>
      ${veredicto(pct,pieClpEf,tieneAhorro,noAplica)}
      ${extra||''}
      ${!noAplica&&cuota?'<div class="esc-expand-hint">▾ ver detalles</div>':''}
      ${detalle||''}
    </div>`;

  const extraSub=subDS
    ?`<div class="esc-linea" style="margin-top:4px;color:var(--suave2)">Postula en postulacionenlinea.minvu.cl</div>`
    :'';

  grid.innerHTML=
    mkCard('Sin ayuda',`Pie ${piePct}% · ${plazo} años · ${tasa}%`,cuota1,pct1,pie1*UF_VALOR,tieneEsc1,mejor.id===1,false,'',
      buildDetalle(precioUF,pie1,tasa,cuota1,pie1*UF_VALOR,tieneEsc1,false))+
    mkCard('Con subsidio',subDS?`${subDS.montoUF} UF rebajan el precio`:'No calificas por ahora',cuota2,pct2,pieClp2Ef,tieneEsc2,mejor.id===2&&!!cuota2,!subDS,extraSub,
      buildDetalle(subDS?precioUF-subDS.montoUF:0,pie2||0,tasa,cuota2,pieClp2Ef||0,tieneEsc2,!subDS))+
    mkCard(`Pie 10%${subTasa?'+tasa rebajada':''}`,subFog?`Con FOGAES solo necesitas el 10% de pie`:'Precio supera las 4.500 UF del límite',cuota3,pct3,pieClp3,tieneEsc3,mejor.id===3&&!!cuota3,!subFog,subFog&&pieClp3?`<div class="esc-linea" style="margin-top:4px;color:var(--verde)">💡 Pie baja de $${fmt(pie1*UF_VALOR)} a $${fmt(pieClp3)}</div>`+(subTasa?`<div class="esc-linea" style="margin-top:3px;font-size:11px;color:var(--suave)">⏱ La tasa rebajada aplica los primeros ~5 años, luego sube a ${tasa}%</div>`:''): '',
      buildDetalle(precioUF,pie3||0,tasa3,cuota3,pieClp3||0,tieneEsc3,!subFog));

}

/* SUBSIDIOS */
function renderSubsidios(subs,precioUF,tasa,plazo,ctx){
  const lista=document.getElementById('subs-lista');
  lista.innerHTML='';
  const partes=[];

  // Cabecera con fechas 2026
  partes.push(`
    <div class="sub-calendario">
      <div class="sub-cal-titulo">📅 Próximos llamados MINVU 2026</div>
      <div class="sub-cal-grid">
        <div class="sub-cal-item"><span class="sub-cal-mes">Mayo / Nov.</span><span class="sub-cal-prog">DS1 Tramos 1, 2 y 3 (compra y construcción)</span></div>
        <div class="sub-cal-item"><span class="sub-cal-mes">Jul. / Oct.</span><span class="sub-cal-prog">DS49 Compra y Construcción</span></div>
        <div class="sub-cal-item"><span class="sub-cal-mes">Mayo–Jun. / Ago.</span><span class="sub-cal-prog">DS52 Arriendo</span></div>
        <div class="sub-cal-item"><span class="sub-cal-mes">Abr.–May.</span><span class="sub-cal-prog">Mejoramiento Hogar Mejor</span></div>
        <div class="sub-cal-item"><span class="sub-cal-mes">Mar./May./Jul./Sep./Dic.</span><span class="sub-cal-prog">DS10 Habitabilidad Rural</span></div>
      </div>
      <div style="font-size:11px;color:var(--suave);margin-top:6px">Fechas estimadas — confirma en <a href="https://www.minvu.gob.cl" target="_blank" style="color:var(--negro)">minvu.gob.cl</a></div>
    </div>`);

  // Definición de categorías en orden de presentación
  const CATEGORIAS = [
    {id:'compra',       emoji:'🏠', label:'Compra de vivienda',              desc:'Subsidios para comprar una vivienda construida (nueva o usada)'},
    {id:'arriendo',     emoji:'🏘️', label:'Arriendo',                        desc:'Subsidio temporal para familias que arriendan'},
    {id:'construccion', emoji:'🏗️', label:'Construcción de vivienda',         desc:'Subsidios para construir tu vivienda nueva'},
    {id:'integracion',  emoji:'🤝', label:'Integración Social y Territorial (DS19)', desc:'Proyectos habitacionales integrados en barrios bien localizados'},
    {id:'mejoramiento', emoji:'🔨', label:'Mejoramiento de vivienda y barrios', desc:'Programas Hogar Mejor — reparación, ampliación y eficiencia energética'},
    {id:'rural',        emoji:'🌾', label:'Habitabilidad Rural (DS10)',        desc:'Construcción y mejoramiento en localidades de hasta 5.000 habitantes'},
    {id:'portabilidad', emoji:'🔄', label:'Portabilidad Financiera',           desc:'Cambia de banco manteniendo tu subsidio DS1 o DS19'},
    {id:'especiales',   emoji:'⚡', label:'Programas especiales',              desc:'Informe Valech, información para arrendadores y otros beneficios'},
  ];

  CATEGORIAS.forEach(cat=>{
    const subsEnCat = subs.filter(s=>s.categoria===cat.id);
    if(!subsEnCat.length) return;

    const califica = subsEnCat.some(s=>s.aplica);
    // Siempre plegado por defecto: el usuario despliega con click
    const openAttr = '';

    // Tarjetas de subsidios de esta categoría (primero los que aplican)
    const tarjetas=[];
    const ordenados = [...subsEnCat.filter(s=>s.aplica), ...subsEnCat.filter(s=>!s.aplica)];
    ordenados.forEach(s=>{
      const rs = !s.aplica && s.razones && ctx ? s.razones(ctx) : [];

      // Badge de estado/monto
      let montoHtml;
      if(s.aplica){
        if(s.esFogaes)        montoHtml=`<span class="sub-badge sub-badge--verde">Pie 10%</span>`;
        else if(s.esTasa)     montoHtml=`<span class="sub-badge sub-badge--verde">−${s.tasaDescuento}% tasa</span>`;
        else if(s.esArriendo) montoHtml=`<span class="sub-badge sub-badge--verde">170 UF total</span>`;
        else                  montoHtml=`<span class="sub-badge sub-badge--verde">✓ Calificas</span>`;
      } else {
        montoHtml=`<span class="sub-badge sub-badge--gris">Informativo</span>`;
      }

      // RSH y UF máximas como chips de info
      const infoChips=[];
      if(s.ingresoMaximoRSH) infoChips.push(`<span class="sub-chip">RSH hasta ${s.ingresoMaximoRSH}%</span>`);
      if(s.maxPrecioUF && s.maxPrecioUF<9000) infoChips.push(`<span class="sub-chip">Hasta ${s.maxPrecioUF.toLocaleString('es-CL')} UF</span>`);
      if(s.ahorroMinimoUF>0) infoChips.push(`<span class="sub-chip">Ahorro mín. ${s.ahorroMinimoUF} UF</span>`);
      const chipsHtml = infoChips.length ? `<div class="sub-chips">${infoChips.join('')}</div>` : '';

      // Sección requisitos oficiales
      const reqHtml = s.requisitosOficiales
        ? `<div class="sub-req-wrap">
            <div class="sub-req-titulo">📋 Requisitos oficiales MINVU</div>
            <ul class="sub-req-lista">${s.requisitosOficiales.map(r=>`<li><span class="sub-req-bullet" style="color:${s.aplica?'var(--verde)':'var(--suave2)'}">→</span><span>${r}</span></li>`).join('')}</ul>
          </div>` : '';

      // Razones por qué no califica (solo si viene del simulador)
      const razonesHtml = rs.length
        ? `<div class="sub-razones">
            <div class="sub-razones-titulo">❌ Por qué no calificas hoy</div>
            <ul>${rs.map(r=>`<li><span style="color:var(--rojo);font-weight:700;flex-shrink:0">•</span><span>${r}</span></li>`).join('')}</ul>
          </div>` : '';

      const descHtml    = s.descripcionOficial  ? `<div class="sub-desc">${s.descripcionOficial}</div>` : '';
      const quienHtml   = s.quienPuedePostular  ? `<div class="sub-quien"><strong>¿Quién puede postular?</strong> ${s.quienPuedePostular}</div>` : '';
      const fechaHtml   = s.fechasPostulacion2026 ? `<div class="sub-fecha-tag">📅 ${s.fechasPostulacion2026}</div>` : '';
      const modalHtml   = s.modalidad           ? `<div class="sub-modal"><strong>Modalidad:</strong> ${s.modalidad}</div>` : '';
      const postHtml    = s.postulacion         ? `<div class="sub-modal"><strong>Postulación:</strong> ${s.postulacion}</div>` : '';

      // Botones: siempre "Ir al sitio oficial MINVU" + segundo botón si es diferente
      let botonesHtml='';
      if(s.linksOficiales){
        botonesHtml=`<div class="sub-links-bar">
          <a class="sub-btn sub-btn--primary" href="${s.linksOficiales.minvu}" target="_blank" rel="noopener">Ir al sitio oficial MINVU →</a>
        </div>`;
      }

      tarjetas.push(`
        <div class="sub-item ${s.aplica?'aplica':'no-aplica'}">
          <div class="sub-header">
            <div class="sub-header-left">
              <span class="sub-icono">${s.icono}</span>
              <div>
                <div class="sub-nombre">${s.nombre}</div>
              </div>
            </div>
            <div class="sub-monto">${montoHtml}</div>
          </div>
          ${chipsHtml}
          ${descHtml}
          ${quienHtml}
          ${fechaHtml}
          ${modalHtml}
          ${postHtml}
          ${razonesHtml}
          ${reqHtml}
          ${botonesHtml}
        </div>`);
    });

    // Contador de subsidios en la categoría
    const totalCat  = subsEnCat.length;
    const califCat  = subsEnCat.filter(s=>s.aplica).length;
    const contadorHtml = califica
      ? `<span class="sub-badge sub-badge--verde" style="flex-shrink:0">✓ ${califCat} calificas</span>`
      : `<span style="font-size:.78rem;color:var(--suave);flex-shrink:0">${totalCat} programa${totalCat>1?'s':''}</span>`;

    partes.push(`
      <details class="sub-cat-details" ${openAttr}>
        <summary class="sub-cat-summary">
          <div class="sub-cat-header">
            <span class="sub-cat-emoji">${cat.emoji}</span>
            <div>
              <div class="sub-cat-titulo">${cat.label}</div>
              <div class="sub-cat-desc">${cat.desc}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            ${contadorHtml}
            <span class="sub-cat-chevron">▼</span>
          </div>
        </summary>
        <div class="sub-cat-body subs-lista">
          ${tarjetas.join('')}
        </div>
      </details>`);
  });

  lista.innerHTML=partes.join('');
}

/* TABLA REGIONAL */
function renderTabla(sueldoTotal,piePct,tasa,plazo){
  const regionActual=document.getElementById('region').value;
  const tipo=document.getElementById('tipo').value;
  const m2=parseFloat(document.getElementById('m2').value)||55;
  const ufKey=tipo==='depto'?'depto':tipo==='casa'?'casa':'usada';
  const tipoLabel=tipo==='depto'?'Departamento':tipo==='casa'?'Casa':'Vivienda usada';
  document.getElementById('tabla-sub').textContent=`${tipoLabel} ${m2}m² · dividendo con pie ${piePct}%, ${plazo} años, ${tasa}%`;
  const filas=Object.entries(REGIONES).map(([k,v])=>({k,v,uf:v[ufKey]*m2})).sort((a,b)=>a.uf-b.uf);
  const tbody=document.getElementById('tbody-regiones');
  tbody.innerHTML='';
  filas.forEach(({k,v,uf})=>{
    const clp=uf*UF_VALOR, pieUF=uf*piePct/100, pieClp=pieUF*UF_VALOR;
    const div=cuotaMensual(uf*(1-piePct/100),tasa,plazo);
    const pct=sueldoTotal>0?(div/sueldoTotal)*100:0;
    const pc=pct<=30?'pill-t pill-verde':pct<=50?'pill-t pill-amarillo':'pill-t pill-rojo';
    const lbl=pct<=30?'✅ Posible':pct<=50?'⚠️ Caro':'❌ Muy caro';
    tbody.innerHTML+=`<tr class="${k===regionActual?'fila-activa':''}">
      <td>${v.nombre}</td>
      <td style="font-size:12px">$${fmt(v[ufKey]*UF_VALOR)}<br><span style="color:var(--suave2)">${v[ufKey]} UF</span></td>
      <td>$${fmt(clp)}<br><span style="font-size:11px;color:var(--suave)">${fmtUF(uf)} UF</span></td>
      <td><strong>$${fmt(div)}</strong>/mes</td>
      <td>$${fmt(pieClp)}<br><span style="font-size:11px;color:var(--suave)">${piePct}%</span></td>
      <td><span class="${pc}">${lbl}</span></td>
    </tr>`;
  });
}

/* ARRENDAR vs COMPRAR */
function actualizarSliderArriendo(){
  const val=parseInt(document.getElementById('arriendo-slider').value)||450000;
  document.getElementById('arriendo-display').textContent=fmt(val);
}

function renderArrVsCompra(precioClp,precioUF,piePct,tasa,plazo,cuota){
  const bloque=document.getElementById('avc-bloque');
  if(!bloque) return;
  const arriendoMensual=parseInt(document.getElementById('arriendo-slider').value)||450000;
  document.getElementById('arriendo-display').textContent=fmt(arriendoMensual);
  const pieClp=precioClp*piePct/100;
  const difMes=cuota-arriendoMensual;
  let aniosRecupero=null;
  if(difMes<0){ aniosRecupero=Math.ceil(pieClp/(-difMes)/12); }
  else if(difMes>0){
    const tm=tasa/100/12, cr=precioClp-pieClp;
    let saldo=cr, capitalAcum=0, extraAcum=0;
    for(let mes=1;mes<=plazo*12;mes++){
      const interes=saldo*tm, amort=cuota-interes;
      capitalAcum+=amort; extraAcum+=difMes; saldo-=amort;
      if(capitalAcum>=extraAcum){aniosRecupero=Math.ceil(mes/12);break;}
    }
  }
  const comprarMasBajo=difMes<=0;
  const absDif=fmt(Math.abs(difMes));
  let veredictoColor, veredictoTitulo, veredictoTexto, pros;
  if(comprarMasBajo){
    veredictoColor='var(--verde-l)';
    veredictoTitulo=`✅ Comprar te sale $${absDif}/mes más barato que arrendar`;
    veredictoTexto=`Con este arriendo, el dividendo es menor. Con cada pago estás construyendo patrimonio — esa plata es tuya, no del arrendador.`;
    pros=[{ico:'🏠',txt:'Cada dividendo que pagas es plata que va a tu propiedad'},{ico:'📈',txt:'Con el tiempo, la casa puede valer más'},{ico:'🔒',txt:'Nadie te puede pedir que te vayas ni subir el arriendo'}];
  } else if(aniosRecupero&&aniosRecupero<=plazo){
    const enAños=aniosRecupero===1?'al primer año':`a los ${aniosRecupero} años`;
    const enAñosCap=aniosRecupero===1?'Al primer año':`A los ${aniosRecupero} años`;
    veredictoColor='var(--amarillo-l)';
    veredictoTitulo=`⚖️ Comprar es $${absDif}/mes más caro hoy, pero ${enAños} te empieza a convenir`;
    veredictoTexto=`Hoy pagas más que si arriendaras, pero parte de ese dividendo queda como tuyo (es patrimonio). ${enAñosCap}, lo que acumulaste en tu casa supera lo que pagaste de más.`;
    pros=[{ico:'💰',txt:`Pagas $${absDif}/mes más que arrendando, pero esa plata queda para ti`},{ico:'🏠',txt:`${enAñosCap}, el patrimonio acumulado cubre la diferencia`},{ico:'🔒',txt:'Estabilidad: nadie te sube el arriendo ni te puede echar'}];
  } else {
    veredictoColor='var(--rojo-l)';
    veredictoTitulo=`📊 Arrendar es $${absDif}/mes más barato hoy`;
    veredictoTexto=`Con este dividendo y arriendo, arrendar te deja más plata libre al mes. Comprar igual puede tener sentido si el arriendo sube o buscas estabilidad.`;
    pros=[{ico:'💸',txt:`Te ahorras $${absDif}/mes versus comprar`},{ico:'🔄',txt:'Más flexibilidad para cambiarte si cambia tu situación'},{ico:'⚠️',txt:'Ojo: el arriendo puede subir con el tiempo, el dividendo no'}];
  }
  bloque.innerHTML=`
    <div class="avc-grid">
      <div class="avc-card ${comprarMasBajo?'':'avc-mejor'}">
        ${!comprarMasBajo?'<span class="esc-badge" style="background:var(--azul)">↓ Más barato hoy</span>':''}
        <div class="avc-card-tag">Si arriendas</div>
        <div class="avc-monto">$${fmt(arriendoMensual)}<span style="font-size:.85rem;font-weight:300">/mes</span></div>
        <div class="avc-linea" style="margin-top:8px">Lo que pagas y no vuelve</div>
      </div>
      <div class="avc-card ${comprarMasBajo?'avc-mejor':''}">
        ${comprarMasBajo?'<span class="esc-badge">✓ Mejor opción</span>':''}
        <div class="avc-card-tag">Si compras</div>
        <div class="avc-monto">$${fmt(cuota)}<span style="font-size:.85rem;font-weight:300">/mes</span></div>
        <div class="avc-linea" style="margin-top:8px">Parte de eso queda como tuyo 🏠</div>
      </div>
    </div>
    <div class="avc-fallo" style="background:${veredictoColor}">
      <div class="avc-fallo-titulo">${veredictoTitulo}</div>
      <div class="avc-fallo-txt">${veredictoTexto}</div>
      <div class="avc-pros">${pros.map(p=>`<div class="avc-pro"><span class="avc-pro-ico">${p.ico}</span><span>${p.txt}</span></div>`).join('')}</div>
    </div>
    <div class="aviso aviso-neutro" style="font-size:12px">💡 <strong>¿Qué pasa con el pie?</strong> Para comprar necesitas juntar $${fmt(pieClp)} de entrada (${piePct}%). Revisa los subsidios — pueden cubrir parte del pie.</div>`;
}

/* FRASE IMPACTO */
function renderFraseImpacto(sueldo,pct,pieClp,aniosPie,precioClp,regionNombre,edad,plazo){
  const fraseEl=document.getElementById('frase-impacto');
  const textoEl=document.getElementById('frase-texto');
  if(!sueldo||sueldo<=0){fraseEl.style.display='none';return;}
  fraseEl.style.display='block';
  const sueldoFmt='$'+fmt(sueldo);
  const edadFin=(edad>0&&plazo>0)?edad+plazo:null;
  let frase='';
  if(pct<=30){ frase=`Con <em>${sueldoFmt}/mes</em>, el dividendo representa solo el <strong>${pct.toFixed(1)}% de tu sueldo</strong>. Eres de los pocos chilenos con acceso real a vivienda propia en ${regionNombre}.`; if(edadFin) frase+=` <strong>Terminarías de pagar a los ${edadFin} años.</strong>`; }
  else if(pct<=50){ frase=`Con <em>${sueldoFmt}/mes</em>, destinarías el <strong>${pct.toFixed(1)}% de tu sueldo</strong> al dividendo. Quedarás con poco margen. Y para el pie aún necesitas <strong>${Math.ceil(aniosPie*12)} meses de ahorro disciplinado</strong>.`; if(edadFin) frase+=` Terminarías de pagar a los <strong>${edadFin} años</strong>.`; }
  else if(pct<=80){ frase=`Con <em>${sueldoFmt}/mes</em>, el dividendo se llevaría el <strong>${pct.toFixed(1)}% de tu sueldo</strong>. El banco probablemente no lo aprobará. Necesitarías ganar <strong>el doble</strong> para calificar solo, o conseguir un codeudor.`; if(edadFin) frase+=` Y terminarías pagando a los <strong>${edadFin} años</strong>.`; }
  else { frase=`<strong>Esta vivienda no es accesible para tu sueldo actual.</strong> El dividendo sería el <em>${pct.toFixed(1)}% de tus ingresos</em>. No es un problema tuyo: es la realidad de millones de chilenos hoy.`; }
  if(aniosPie>10&&pct>30) frase+=` Juntarías el pie en <em>${Math.ceil(aniosPie)} años</em> ahorrando el 20% de tu sueldo.`;
  textoEl.innerHTML=frase;
  const url=encodeURIComponent(window.location.href);
  const tweetTxt=pct<=30?`Con mi sueldo puedo comprar un departamento en ${regionNombre} y el dividendo sería el ${pct.toFixed(0)}% de mis ingresos. Calculé en:`:pct<=50?`Necesito ${Math.ceil(aniosPie)} años para juntar el pie de un departamento en ${regionNombre} �� Calculé mi realidad en:`:`El dividendo de un depto en ${regionNombre} sería el ${pct.toFixed(0)}% de mi sueldo. La crisis habitacional es real. Calculé en:`;
  document.getElementById('btn-tw').href=`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetTxt)}&url=${url}`;
}

/* DESIGUALDAD */
function renderDesigualdad(){
  const cont=document.getElementById('desigualdad-visual');
  if(!cont) return;
  const items=Object.entries(REGIONES).map(([k,v])=>({nombre:v.nombre.split('/')[0].trim(),uf:v.depto*55})).sort((a,b)=>a.uf-b.uf);
  const max=items[items.length-1].uf;
  cont.innerHTML=`<div class="desigualdad-header">Precio depto 55 m² en UF · de más barato a más caro</div>`+
    items.map(it=>{ const pct=(it.uf/max)*100; const color=it.uf===max?'var(--rojo)':it.uf===items[0].uf?'var(--verde)':'var(--azul)'; return `<div class="desig-row"><span class="desig-nombre">${it.nombre}</span><div class="desig-barra-wrap"><div class="desig-barra" style="width:${pct}%;background:${color}"></div></div><span class="desig-uf">${fmtUF(it.uf)} UF</span></div>`; }).join('');
}

/* COPIAR */
function copiarLink(){
  navigator.clipboard.writeText(window.location.href).then(()=>{
    const btn=document.querySelector('.btn-share-copy');
    const orig=btn.textContent;
    btn.textContent='✅ ¡Copiado!';
    setTimeout(()=>{btn.textContent=orig;},2200);
  });
}

/* CHECKS */
document.querySelectorAll('.check-btn').forEach(label=>{
  label.addEventListener('change',()=>{
    const cb=label.querySelector('input[type="checkbox"]');
    label.classList.toggle('activo',cb.checked);
    if(cb.id==='casado'&&cb.checked&&parseCLP('codeudor')===0){
      document.getElementById('codeudor').focus();
    }
  });
});

/* INIT */
document.addEventListener('DOMContentLoaded',()=>{
  actualizarSliderArriendo();
  const sl=document.getElementById('arriendo-slider');
  if(sl) sl.addEventListener('pointerdown',()=>{sl.dataset.tocado='1';});
  cargarUF();

  // Precio directo: refrescar hints al cambiar región/tipo/superficie
  const regionSel=document.getElementById('region');
  const tipoSel=document.getElementById('tipo');
  const m2Input=document.getElementById('m2');
  if(regionSel) regionSel.addEventListener('change',()=>{ actualizarPrecioEstimado(); actualizarM2Estimado(); });
  if(tipoSel) tipoSel.addEventListener('change',()=>{ actualizarPrecioEstimado(); actualizarM2Estimado(); });
  if(m2Input) m2Input.addEventListener('input',actualizarPrecioEstimado);
  setTimeout(()=>{
    actualizarPrecioEstimado();
    const ufHint=document.getElementById('uf-hint-val');
    if(ufHint) ufHint.textContent=fmt(UF_VALOR);
  },50);

  // Flujo principal (pantallas 1/2) sin handlers inline
  document.addEventListener('click',e=>{
    const tabBtn=e.target.closest('[role="tab"][data-tab]');
    if(tabBtn){
      switchTab(tabBtn.dataset.tab,tabBtn);
      return;
    }

    const actionEl=e.target.closest('[data-main-action]');
    if(actionEl){
      const action=actionEl.dataset.mainAction;
      if(action==='ir-paso-2') irAPaso2();
      else if(action==='ir-paso-1') irAPaso1();
      else if(action==='ir-resultados') irAResultados();
      else if(action==='ir-regiones') irARegiones();
      else if(action==='ir-arrendar') irAArrendar();
      else if(action==='ir-bancos') irABancos();
      else if(action==='copiar-link') copiarLink();
      else if(action==='reload-page') location.reload();
      else if(action==='volver-screen') volverDesdeScreen();
      else if(action==='volver-subsidios') volverDesdeSubsidios();
      else if(action==='ir-calculadora') irACalculadoraCompleta();
      return;
    }

    const sitBtn=e.target.closest('[data-sit]');
    if(sitBtn){
      selSituacion(sitBtn.dataset.sit);
      return;
    }

    const modoBtn=e.target.closest('[data-modo-precio]');
    if(modoBtn){
      selModoPrecio(modoBtn.dataset.modoPrecio);
    }
  });

  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter'&&e.key!==' ') return;
    const actionEl=e.target.closest('[data-main-action]');
    if(!actionEl) return;
    const tag=(actionEl.tagName||'').toLowerCase();
    if(tag==='button'||tag==='a'||tag==='input'||tag==='select'||tag==='textarea') return;
    e.preventDefault();
    actionEl.click();
  });

  document.addEventListener('input',e=>{
    const fmtEl=e.target.closest('[data-format-clp]');
    if(fmtEl&&fmtEl.id) formatCLP(fmtEl.id);

    const inputEl=e.target.closest('[data-input-action]');
    if(!inputEl) return;
    const action=inputEl.dataset.inputAction;
    if(action==='actualizar-precio-estimado') actualizarPrecioEstimado();
    else if(action==='precio-directo'){
      formatCLP('precio-directo');
      actualizarM2Estimado();
    }else if(action==='precio-uf') actualizarDesdUF();
    else if(action==='arriendo-slider'){
      actualizarSliderArriendo();
      calcular();
    }else if(action==='render-public-regiones') renderPublicRegiones();
    else if(action==='pub-precio'){
      formatCLP('pub-precio');
      calcPublicAVC();
    }else if(action==='pub-arriendo'){
      formatCLP('pub-arriendo');
      calcPublicAVC();
    }
  });

  document.addEventListener('change',e=>{
    const changeEl=e.target.closest('[data-change-action]');
    if(!changeEl) return;
    const action=changeEl.dataset.changeAction;
    if(action==='render-public-regiones') renderPublicRegiones();
  });

  // Escenarios expand/collapse via event delegation (single listener, survives re-renders)
  const escGrid=document.getElementById('escenarios-grid');
  if(escGrid){
    escGrid.addEventListener('click',e=>{
      const card=e.target.closest('.esc-card');
      if(!card||card.classList.contains('esc-no-aplica')) return;
      card.classList.toggle('expandido');
      const hint=card.querySelector('.esc-expand-hint');
      if(hint) hint.textContent=card.classList.contains('expandido')?'▴ ocultar':'▾ ver detalles';
    });
  }

  // Filtros de subsidios (sin onclick inline)
  const subFiltros=document.getElementById('sub-filtros');
  if(subFiltros){
    subFiltros.addEventListener('click',e=>{
      const btn=e.target.closest('.sub-filtro-btn');
      if(!btn) return;
      const cat=btn.dataset.cat||'todos';
      filtrarSubsidiosInteractivos(cat,btn);
    });
  }

  // Bancos 2026 (sin onclick/onchange inline)
  const tabBancos=document.getElementById('tab-bancos');
  if(tabBancos){
    tabBancos.addEventListener('click',e=>{
      const btn=e.target.closest('[data-bco-action]');
      if(!btn) return;
      const action=btn.dataset.bcoAction;
      if(action==='toggle-tab-chat') toggleTabBcoChat();
      else if(action==='sugerir-tab') sugerirComparacionBco('tab');
      else if(action==='abrir-bancos') irABancos();
      else if(action==='ir-paso1') irAPaso1();
    });
    tabBancos.addEventListener('change',e=>{
      const sel=e.target.closest('select[data-bco-select="tab"]');
      if(!sel) return;
      renderComparadorTab();
    });
  }

  const screenBancos=document.getElementById('screen-bancos');
  if(screenBancos){
    screenBancos.addEventListener('click',e=>{
      const btn=e.target.closest('[data-bco-action]');
      if(!btn) return;
      const action=btn.dataset.bcoAction;
      if(action==='toggle-full-chat') toggleBcoChat();
      else if(action==='sugerir-full') sugerirComparacionBco('full');
      else if(action==='scroll') scrollToBcoSeccion(btn.dataset.target);
      else if(action==='ir-paso1') irAPaso1();
    });
    screenBancos.addEventListener('change',e=>{
      const sel=e.target.closest('select[data-bco-select="full"]');
      if(!sel) return;
      renderComparador();
    });
  }

  // Keyboard navigation for tabs (ARIA roving tabindex pattern)
  const tablist=document.querySelector('[role="tablist"]');
  if(tablist){
    tablist.addEventListener('keydown',e=>{
      const tabs=[...tablist.querySelectorAll('[role="tab"]')];
      const idx=tabs.indexOf(document.activeElement);
      if(idx===-1) return;
      let next=-1;
      if(e.key==='ArrowRight') next=(idx+1)%tabs.length;
      else if(e.key==='ArrowLeft') next=(idx-1+tabs.length)%tabs.length;
      else if(e.key==='Home') next=0;
      else if(e.key==='End') next=tabs.length-1;
      if(next!==-1){
        e.preventDefault();
        tabs[next].focus();
        tabs[next].click();
      }
    });
  }
});

/* ─── NAVEGACIÓN EXPLORAR ─── */
function volverDesdeScreen(){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('activa'));
  const target=document.getElementById('screen-1');
  target.classList.add('activa');
  document.querySelector('.wizard-steps').style.display='';
  [1,2,3].forEach(i=>{
    const it=document.getElementById('ws'+i);
    it.classList.remove('activo','done');
    it.removeAttribute('aria-current');
    if(i===1){ it.classList.add('activo'); it.setAttribute('aria-current','step'); }
  });
  [1,2].forEach(i=>document.getElementById('ws-l'+i).classList.remove('done'));
  window.scrollTo({top:0,behavior:'smooth'});
  const h=target.querySelector('h1');
  if(h){ h.setAttribute('tabindex','-1'); h.focus({preventScroll:true}); }
}
function irARegiones(){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('activa'));
  const target=document.getElementById('screen-regiones');
  target.classList.add('activa');
  document.querySelector('.wizard-steps').style.display='none';
  window.scrollTo({top:0,behavior:'smooth'});
  renderPublicRegiones();
  const h=target.querySelector('h1'); if(h){ h.setAttribute('tabindex','-1'); h.focus({preventScroll:true}); }
}
function renderPublicRegiones(){
  const container=document.getElementById('pub-regiones-content');
  if(!container) return;
  const tipoEl=document.getElementById('pub-tipo');
  const m2El=document.getElementById('pub-m2');
  const tipo=tipoEl?tipoEl.value:'depto';
  const m2=m2El?Math.max(10,parseFloat(m2El.value)||55):55;
  const ufKey=tipo==='usada'?'usada':tipo;
  const tipoLabel=tipo==='depto'?'Departamento':tipo==='casa'?'Casa':'Vivienda usada';
  const piePct=20, tasa=4.1, plazo=25;
  document.getElementById('pub-reg-sub').textContent=`${tipoLabel} ${m2}m² · dividendo con pie 20%, 25 años, tasa 4.1% anual`;
  const filas=Object.entries(REGIONES).map(([k,v])=>({k,v,uf:v[ufKey]*m2})).sort((a,b)=>a.uf-b.uf);
  let html=`<div class="tabla-wrap"><table><thead><tr><th>Región</th><th>Precio m²</th><th>Precio ${tipoLabel} ${m2}m²</th><th>Dividendo mensual</th><th>Pie requerido (20%)</th></tr></thead><tbody>`;
  filas.forEach(({k,v,uf})=>{
    const clp=uf*UF_VALOR;
    const div=cuotaMensual(uf*(1-piePct/100),tasa,plazo);
    const pieClp=uf*(piePct/100)*UF_VALOR;
    const priceKey=v[ufKey];
    html+=`<tr><td><strong>${v.nombre}</strong></td><td style="font-size:12px">$${fmt(priceKey*UF_VALOR)}/m²<br><span style="color:var(--suave2)">${priceKey} UF/m²</span></td><td>$${fmt(clp)}<br><span style="font-size:11px;color:var(--suave)">${fmt(Math.round(uf))} UF</span></td><td><strong>$${fmt(div)}</strong>/mes</td><td>$${fmt(pieClp)}</td></tr>`;
  });
  html+='</tbody></table></div>';
  container.innerHTML=html;
}
function irAArrendar(){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('activa'));
  const target=document.getElementById('screen-arrendar');
  target.classList.add('activa');
  document.querySelector('.wizard-steps').style.display='none';
  window.scrollTo({top:0,behavior:'smooth'});
  const h=target.querySelector('h1'); if(h){ h.setAttribute('tabindex','-1'); h.focus({preventScroll:true}); }
}

/* ══════════════════════════════════════════════════════════════════════
   ESTUDIO HIPOTECARIO BANCOS 2026
══════════════════════════════════════════════════════════════════════ */
const BANCOS_2026 = [
  {id:'itau',        nombre:'Banco Itaú',          logo:'🟠', tasaFija:3.39, cae:3.65, dividendoCLP:943200,  dividendoUF:24.50, badge:'mejor-tasa',            colorTasa:'verde',    comentario:'Tasa fija más baja del mercado marzo 2026.'},
  {id:'falabella',   nombre:'Banco Falabella',      logo:'🟢', tasaFija:3.70, cae:3.98, dividendoCLP:965000,  dividendoUF:25.06, badge:'muy-competitivo',       colorTasa:'verde',    comentario:'Segunda tasa más baja. Muy competitivo para viviendas nuevas.'},
  {id:'bancoestado', nombre:'BancoEstado',           logo:'🔵', tasaFija:4.19, cae:4.48, dividendoCLP:995000,  dividendoUF:25.84, badge:'mejor-subsidios',       colorTasa:'amarillo', comentario:'Especializado en operaciones con subsidios MINVU DS49 y DS1.'},
  {id:'coopeuch',    nombre:'Coopeuch',              logo:'🟡', tasaFija:4.50, cae:4.79, dividendoCLP:1018000, dividendoUF:26.44, badge:'buenas-condiciones',    colorTasa:'amarillo', comentario:'Buenas condiciones para socios activos de la cooperativa.'},
  {id:'santander',   nombre:'Banco Santander',       logo:'🔴', tasaFija:4.58, cae:4.89, dividendoCLP:1025000, dividendoUF:26.62, badge:'fuerte-mixta',          colorTasa:'amarillo', comentario:'Fuerte en tasas mixtas. Período inicial fijo ventajoso.'},
  {id:'chile',       nombre:'Banco de Chile',        logo:'🔷', tasaFija:4.60, cae:4.90, dividendoCLP:1027000, dividendoUF:26.67, badge:null,                    colorTasa:'amarillo', comentario:'Banco universal con amplia cobertura. Tasas en el promedio.'},
  {id:'bci',         nombre:'BCI',                   logo:'🔶', tasaFija:4.65, cae:4.95, dividendoCLP:1031000, dividendoUF:26.78, badge:null,                    colorTasa:'amarillo', comentario:'Sólido para clientes con historial crediticio establecido.'},
  {id:'internacional',nombre:'Banco Internacional',  logo:'⚫', tasaFija:4.85, cae:5.10, dividendoCLP:892377,  dividendoUF:22.40, badge:'mejor-dividendo-cmf',   colorTasa:'amarillo', comentario:'Mejor dividendo CMF al 28-03-2026: $892.377 / 22,40 UF.'},
  {id:'scotiabank',  nombre:'Scotiabank',            logo:'🟥', tasaFija:4.80, cae:5.12, dividendoCLP:1048000, dividendoUF:27.21, badge:null,                    colorTasa:'amarillo', comentario:'Tasa levemente sobre el promedio de mercado.'},
  {id:'security',    nombre:'Banco Security',        logo:'🟤', tasaFija:4.90, cae:5.22, dividendoCLP:1055000, dividendoUF:27.40, badge:null,                    colorTasa:'rojo',     comentario:'Orientado a segmento ABC1 con servicios premium.'},
  {id:'consorcio',   nombre:'Banco Consorcio',       logo:'🟣', tasaFija:5.10, cae:5.40, dividendoCLP:1070000, dividendoUF:27.79, badge:null,                    colorTasa:'rojo',     comentario:'Mayor tasa en el comparador CMF. Referencia de techo de mercado.'},
];

const BANCOS_BADGES = {
  'mejor-tasa':          {txt:'⭐ Mejor tasa',         cls:'bco-badge-verde'},
  'muy-competitivo':     {txt:'🔥 Muy competitivo',    cls:'bco-badge-verde'},
  'mejor-subsidios':     {txt:'🏛 Mejor para subsidios',cls:'bco-badge-azul'},
  'buenas-condiciones':  {txt:'✅ Buenas condiciones',  cls:'bco-badge-azul'},
  'fuerte-mixta':        {txt:'📊 Fuerte en mixta',     cls:'bco-badge-amarillo'},
  'mejor-dividendo-cmf': {txt:'💰 Mejor dividendo CMF', cls:'bco-badge-verde'},
};

const REQUISITOS_2026 = [
  {ico:'💼', titulo:'Dependientes', desc:'6 a 12 meses de antigüedad laboral mínima comprobable.'},
  {ico:'📑', titulo:'Independientes', desc:'2 años de actividad con declaraciones de renta SII (Form. 22).'},
  {ico:'📊', titulo:'Carga financiera', desc:'Máximo 25%–30% del ingreso líquido mensual en deudas totales.'},
  {ico:'🏠', titulo:'Pie mínimo legal', desc:'20% del precio de la vivienda (obligatorio por ley desde 2015).'},
  {ico:'📋', titulo:'Documentos clave', desc:'Liquidaciones (3 meses), cotizaciones AFP, carpeta SII, promesa de compraventa.'},
  {ico:'💳', titulo:'Historial crediticio', desc:'DICOM limpio o regularizado. Los bancos consultan Equifax y CMF.'},
];

const TENDENCIAS_2026 = [
  {emoji:'📉', titulo:'TPM a la baja', desc:'El Banco Central mantiene tendencia bajista en la Tasa de Política Monetaria, presionando las tasas hipotecarias hacia abajo.'},
  {emoji:'📊', titulo:'Tasas descendiendo', desc:'Promedio bajó de ~5% en 2024 a 4,35% en marzo 2026. La tasa mínima llega a 3,39% (Itaú).'},
  {emoji:'🏛', titulo:'Ley 21.748 y FOGAES activos', desc:'Permiten pie reducido al 10% y descuento en tasa para viviendas nuevas bajo 2.200 UF.'},
  {emoji:'🏦', titulo:'Mayor competencia bancaria', desc:'La agresividad de Itaú y Falabella generó una guerra de tasas que beneficia a compradores en 2026.'},
];

function bcoColorClass(tasa){ return tasa<4?'verde':tasa<=5?'amarillo':'rojo'; }

function renderBcoGrafico(containerId){
  const cont=document.getElementById(containerId);
  if(!cont) return;
  const max=6;
  const rows=BANCOS_2026.map(b=>{
    const w=Math.round(b.tasaFija/max*100);
    const cl=bcoColorClass(b.tasaFija);
    return `<div class="bco-bar-row">
      <span class="bco-bar-label">${b.logo} ${b.nombre}</span>
      <div class="bco-bar-track">
        <div class="bco-bar-fill ${cl}" style="width:${w}%">${b.tasaFija.toFixed(2)}%</div>
      </div>
      <span class="bco-bar-pct ${cl}">${b.tasaFija.toFixed(2)}%</span>
    </div>`;
  }).join('');
  cont.innerHTML=`<div class="bco-grafico-titulo">Tasa fija anual por banco (datos CMF · marzo 2026)</div>${rows}`;
}

function renderBcoTabla(containerId){
  const tbl=document.getElementById(containerId);
  if(!tbl) return;
  const badgeHtml=b=>{
    if(!b.badge) return '';
    const cfg=BANCOS_BADGES[b.badge];
    return cfg?`<span class="bco-badge ${cfg.cls}">${cfg.txt}</span>`:'';
  };
  const colorCls=t=>t<4?'bco-badge-verde':t<=5?'bco-badge-amarillo':'bco-badge-rojo';
  const rows=BANCOS_2026.map((b,i)=>`
    <tr class="${i===0?'bco-tr-top':''}">
      <td><strong>${b.logo} ${b.nombre}</strong>${badgeHtml(b)?`<br>${badgeHtml(b)}`:''}</td>
      <td><span class="bco-badge ${colorCls(b.tasaFija)}">${b.tasaFija.toFixed(2)}%</span></td>
      <td>${b.cae.toFixed(2)}%</td>
      <td><strong>$${fmt(b.dividendoCLP)}</strong><br><span style="font-size:11px;color:var(--suave)">${b.dividendoUF.toFixed(2)} UF</span></td>
      <td style="font-size:12px;color:var(--suave);max-width:160px">${b.comentario}</td>
    </tr>`).join('');
  tbl.innerHTML=`<thead><tr>
    <th>Banco</th><th>Tasa fija</th><th>CAE</th><th>Dividendo mensual</th><th>Comentario</th>
  </tr></thead><tbody>${rows}</tbody>`;
}

function renderBcoRanking(containerId){
  const cont=document.getElementById(containerId);
  if(!cont) return;
  // Ordenar por tasa fija
  const ordenados=[...BANCOS_2026].sort((a,b)=>a.tasaFija-b.tasaFija);
  cont.innerHTML=ordenados.slice(0,6).map((b,i)=>{
    const cfg=b.badge?BANCOS_BADGES[b.badge]:null;
    const badgeHtml=cfg?`<span class="bco-badge ${cfg.cls}">${cfg.txt}</span>`:'';
    const divBadge=b.id==='internacional'?`<span class="bco-badge bco-badge-verde">💰 Mejor dividendo CMF</span>`:'';
    return `<div class="bco-rank-card${i===0?' top':''}">
      <div class="bco-rank-num">${i+1}</div>
      <div>
        <div class="bco-rank-nombre">${b.logo} ${b.nombre}</div>
        <div class="bco-rank-tasa">Tasa fija: <strong>${b.tasaFija.toFixed(2)}%</strong> · CAE: ${b.cae.toFixed(2)}% · Dividendo: $${fmt(b.dividendoCLP)}</div>
        <div class="bco-rank-coment">${b.comentario}</div>
        <div class="bco-rank-badges">${badgeHtml}${divBadge}</div>
      </div>
    </div>`;
  }).join('');
}

function renderBcoRequisitos(containerId){
  const cont=document.getElementById(containerId);
  if(!cont) return;
  cont.innerHTML=REQUISITOS_2026.map(r=>`
    <div class="bco-req-item">
      <div class="bco-req-ico">${r.ico}</div>
      <div class="bco-req-titulo">${r.titulo}</div>
      <div class="bco-req-desc">${r.desc}</div>
    </div>`).join('');
}

function renderBcoTendencias(containerId){
  const cont=document.getElementById(containerId);
  if(!cont) return;
  cont.innerHTML=TENDENCIAS_2026.map(t=>`
    <div class="bco-tend-item">
      <div class="bco-tend-ico">${t.emoji}</div>
      <div>
        <div class="bco-tend-titulo">${t.titulo}</div>
        <div class="bco-tend-desc">${t.desc}</div>
      </div>
    </div>`).join('');
}

function poblarSelectores(prefijo){
  ['1','2'].forEach(n=>{
    const sel=document.getElementById(`${prefijo}-sel-${n}`);
    if(!sel) return;
    const val=sel.value;
    sel.innerHTML=`<option value="">— Banco ${n==='1'?'A':'B'} —</option>`+
      BANCOS_2026.map(b=>`<option value="${b.id}" ${b.id===val?'selected':''}>${b.logo} ${b.nombre}</option>`).join('');
  });
}

function calcComparador(ids,plazoAnios,montoUF,piePct){
  const plazo=plazoAnios||20, monto=montoUF||2000, pie=(piePct??20);
  return ids.map(id=>BANCOS_2026.find(b=>b.id===id)).filter(Boolean).map(b=>{
    const creditoUF=monto*(1-pie/100);
    const cuotaCLP=Math.round(cuotaMensual(creditoUF,b.tasaFija,plazo));
    const totalCLP=cuotaCLP*plazo*12;
    return {...b,cuotaCLP,totalCLP};
  });
}

function getBcoEscenarioUsuario(){
  if(_bcoPerfilUsuario && _bcoPerfilUsuario.precioUF>0){
    return {
      montoUF:_bcoPerfilUsuario.precioUF,
      plazoAnios:_bcoPerfilUsuario.plazoAnios||25,
      piePct:_bcoPerfilUsuario.piePct??20,
      sueldo:_bcoPerfilUsuario.sueldo||0,
      personalizado:true
    };
  }
  return {montoUF:2000, plazoAnios:20, piePct:20, sueldo:0, personalizado:false};
}

function getBcoRecomendacionBase(){
  const esc=getBcoEscenarioUsuario();
  const porTasa=[...BANCOS_2026].sort((a,b)=>a.tasaFija-b.tasaFija);
  const evaluados=BANCOS_2026.map(b=>{
    const cuotaCLP=Math.round(cuotaMensual(esc.montoUF*(1-esc.piePct/100),b.tasaFija,esc.plazoAnios));
    const pct=esc.sueldo>0?(cuotaCLP/esc.sueldo)*100:null;
    return {...b, cuotaCLP, pct};
  });
  const porDividendo=[...evaluados].sort((a,b)=>a.cuotaCLP-b.cuotaCLP);
  const mejorTasa=porTasa[0];
  const mejorDiv=porDividendo[0];
  const segundo=porDividendo.find(b=>b.id!==mejorDiv.id) || porDividendo[1] || mejorDiv;
  return {
    mejorTasa,
    mejorDiv,
    escenario:esc,
    sugeridos: (mejorTasa.id!==mejorDiv.id)
      ? [mejorTasa,mejorDiv]
      : [mejorTasa,segundo]
  };
}

function getBcoSeleccion(prefijo){
  return ['1','2'].map(n=>document.getElementById(`${prefijo}-sel-${n}`)?.value).filter(Boolean);
}

function setComparadorBancos(prefijo,idA,idB){
  const a=document.getElementById(`${prefijo}-sel-1`);
  const b=document.getElementById(`${prefijo}-sel-2`);
  if(a) a.value=idA;
  if(b) b.value=idB;
  if(prefijo==='bco') renderComparador();
  else renderComparadorTab();
}

function sugerirComparacionBco(scope){
  const rec=getBcoRecomendacionBase();
  const prefijo=scope==='tab'?'tab-bco':'bco';
  setComparadorBancos(prefijo,rec.sugeridos[0].id,rec.sugeridos[1].id);
  if(scope!=='tab') scrollToBcoSeccion('bco-comp-wrap');
}

function actualizarAsistenteBancos(){
  const rec=getBcoRecomendacionBase();
  const esc=rec.escenario;
  const selloEsc=esc.personalizado
    ? `con tu perfil (${Math.round(esc.montoUF).toLocaleString('es-CL')} UF · pie ${esc.piePct}% · ${esc.plazoAnios} años)`
    : 'con simulación referencial (2.000 UF · pie 20% · 20 años)';

  // Estado comparador en pantalla completa
  const idsFull=getBcoSeleccion('bco');
  const compFull=(idsFull.length===2 && idsFull[0]!==idsFull[1])
    ? calcComparador(idsFull,esc.plazoAnios,esc.montoUF,esc.piePct)
    : [];
  const ganadorFull=compFull.length===2?compFull.reduce((a,b)=>a.totalCLP<b.totalCLP?a:b):null;
  const perdedorFull=compFull.length===2?compFull.reduce((a,b)=>a.totalCLP>b.totalCLP?a:b):null;

  // Estado comparador en tab
  const idsTab=getBcoSeleccion('tab-bco');
  const compTab=(idsTab.length===2 && idsTab[0]!==idsTab[1])
    ? calcComparador(idsTab,esc.plazoAnios,esc.montoUF,esc.piePct)
    : [];
  const ganadorTab=compTab.length===2?compTab.reduce((a,b)=>a.totalCLP<b.totalCLP?a:b):null;
  const perdedorTab=compTab.length===2?compTab.reduce((a,b)=>a.totalCLP>b.totalCLP?a:b):null;

  // Full
  const resumenFull=document.getElementById('bco-chat-resumen');
  const insightFull=document.getElementById('bco-chat-insight');
  const ctaFull=document.getElementById('bco-chat-cta-comp');
  if(resumenFull){
    resumenFull.innerHTML=`🏦 <strong>Lectura rápida del mercado</strong><br>
      <div class="bco-chat-dato"><span class="bco-chat-dato-ico">🥇</span><span>Mejor tasa: <strong>${rec.mejorTasa.logo} ${rec.mejorTasa.nombre} ${rec.mejorTasa.tasaFija.toFixed(2)}%</strong></span></div>
      <div class="bco-chat-dato"><span class="bco-chat-dato-ico">💰</span><span>Menor dividendo ${esc.personalizado?'con tus datos':'estimado'}: <strong>${rec.mejorDiv.logo} ${rec.mejorDiv.nombre} $${fmt(rec.mejorDiv.cuotaCLP)}</strong>${rec.mejorDiv.pct!==null?` (${rec.mejorDiv.pct.toFixed(1)}% de tu sueldo)`:''}</span></div>
      <div class="bco-chat-dato"><span class="bco-chat-dato-ico">📊</span><span>Promedio mercado: <strong>4,35%</strong> · 11 bancos</span></div>`;
  }
  if(insightFull){
    if(ganadorFull&&perdedorFull){
      const ahorroMes=perdedorFull.cuotaCLP-ganadorFull.cuotaCLP;
      insightFull.innerHTML=`✅ Entre tus bancos elegidos, conviene <strong>${ganadorFull.logo} ${ganadorFull.nombre}</strong>.<br>
      Ahorro estimado: <strong style="color:#16a34a">$${fmt(ahorroMes)}/mes</strong> vs ${perdedorFull.nombre}, ${selloEsc}.`;
    } else {
      insightFull.innerHTML=`ℹ️ Te recomiendo comparar <strong>${rec.sugeridos[0].logo} ${rec.sugeridos[0].nombre}</strong> vs <strong>${rec.sugeridos[1].logo} ${rec.sugeridos[1].nombre}</strong> para ver ahorro mensual real, ${selloEsc}.`;
    }
  }
  if(ctaFull){
    ctaFull.textContent=(ganadorFull&&perdedorFull)
      ? `⚖️ Recomparar ${ganadorFull.logo} ${ganadorFull.nombre} vs ${perdedorFull.logo} ${perdedorFull.nombre}`
      : `⚖️ Comparar ${rec.sugeridos[0].logo} ${rec.sugeridos[0].nombre} vs ${rec.sugeridos[1].logo} ${rec.sugeridos[1].nombre}`;
  }

  // Tab
  const resumenTab=document.getElementById('tab-bco-chat-resumen');
  const insightTab=document.getElementById('tab-bco-chat-insight');
  const ctaTab=document.getElementById('tab-bco-chat-cta-comp');
  if(resumenTab){
    resumenTab.innerHTML=`🤖 <strong>Asistente hipotecario (rápido)</strong><br>
      <div class="bco-chat-dato"><span class="bco-chat-dato-ico">🥇</span><span>Mejor tasa: <strong>${rec.mejorTasa.logo} ${rec.mejorTasa.nombre}</strong></span></div>
      <div class="bco-chat-dato"><span class="bco-chat-dato-ico">💸</span><span>Menor dividendo ${esc.personalizado?'con tus datos':'estimado'}: <strong>${rec.mejorDiv.logo} ${rec.mejorDiv.nombre} $${fmt(rec.mejorDiv.cuotaCLP)}</strong></span></div>`;
  }
  if(insightTab){
    if(ganadorTab&&perdedorTab){
      const ahorroMes=perdedorTab.cuotaCLP-ganadorTab.cuotaCLP;
      insightTab.innerHTML=`✅ En tu comparación actual gana <strong>${ganadorTab.logo} ${ganadorTab.nombre}</strong>.<br>
      Diferencia estimada: <strong style="color:#16a34a">$${fmt(ahorroMes)}/mes</strong>, ${selloEsc}.`;
    } else {
      insightTab.innerHTML=`💡 Haz clic en “Comparar recomendados” y te dejo una comparación útil en 1 paso.`;
    }
  }
  if(ctaTab){
    ctaTab.textContent=(ganadorTab&&perdedorTab)
      ? `⚖️ Recomparar ${ganadorTab.logo} ${ganadorTab.nombre} vs ${perdedorTab.logo} ${perdedorTab.nombre}`
      : `⚖️ Comparar ${rec.sugeridos[0].logo} ${rec.sugeridos[0].nombre} vs ${rec.sugeridos[1].logo} ${rec.sugeridos[1].nombre}`;
  }
}

function renderComparadorResult(prefijo,resultados){
  const gridEl=document.getElementById(`${prefijo}-comp-grid`);
  const ahorroEl=document.getElementById(`${prefijo}-comp-ahorro`);
  const resultEl=document.getElementById(`${prefijo}-comp-result`);
  if(!gridEl||!ahorroEl||!resultEl) return;
  if(resultados.length<2){ resultEl.classList.remove('visible'); ahorroEl.innerHTML=''; return; }
  resultEl.classList.add('visible');
  const min=resultados.reduce((a,b)=>a.totalCLP<b.totalCLP?a:b);
  const max=resultados.reduce((a,b)=>a.totalCLP>b.totalCLP?a:b);
  gridEl.innerHTML=resultados.map(r=>`
    <div class="bco-comp-card${r.id===min.id?' ganador':''}">
      <div class="bco-comp-banco">${r.logo} ${r.nombre}${r.id===min.id?' 🏆':''}</div>
      <div class="bco-comp-tasa">${r.tasaFija.toFixed(2)}% tasa fija</div>
      <div class="bco-comp-sub">CAE ${r.cae.toFixed(2)}%</div>
      <div class="bco-comp-dividendo">$${fmt(r.cuotaCLP)}<span class="bco-comp-mes">/mes</span></div>
    </div>`).join('');
  const ahorro=max.totalCLP-min.totalCLP;
  const ahorroMes=max.cuotaCLP-min.cuotaCLP;
  ahorroEl.innerHTML=`
    🏆 <strong>${min.logo} ${min.nombre}</strong> es la mejor opción.<br>
    Dividendo: <strong>$${fmt(min.cuotaCLP)}/mes</strong> · Tasa: <strong>${min.tasaFija.toFixed(2)}%</strong><br>
    Ahorras <strong style="color:#16a34a">$${fmt(ahorroMes)}/mes</strong> y <strong style="color:#16a34a">$${fmt(ahorro)}</strong> en total vs. ${max.nombre}.`;
}

function renderComparador(){
  const esc=getBcoEscenarioUsuario();
  const ids=['bco-sel-1','bco-sel-2'].map(id=>document.getElementById(id)?.value).filter(Boolean);
  const ahorroEl=document.getElementById('bco-comp-ahorro');
  const resultEl=document.getElementById('bco-comp-result');
  if(ids.length===2 && ids[0]===ids[1]){
    if(resultEl) resultEl.classList.add('visible');
    if(ahorroEl) ahorroEl.innerHTML='⚠️ Elige <strong>dos bancos distintos</strong> para comparar.';
    const gridEl=document.getElementById('bco-comp-grid');
    if(gridEl) gridEl.innerHTML='';
    actualizarAsistenteBancos();
    return;
  }
  const resultados=calcComparador(ids,esc.plazoAnios,esc.montoUF,esc.piePct);
  renderComparadorResult('bco',resultados);
  actualizarAsistenteBancos();
}
function renderComparadorTab(){
  const esc=getBcoEscenarioUsuario();
  const ids=['tab-bco-sel-1','tab-bco-sel-2'].map(id=>document.getElementById(id)?.value).filter(Boolean);
  const ahorroEl=document.getElementById('tab-bco-comp-ahorro');
  const resultEl=document.getElementById('tab-bco-comp-result');
  if(ids.length===2 && ids[0]===ids[1]){
    if(resultEl) resultEl.classList.add('visible');
    if(ahorroEl) ahorroEl.innerHTML='⚠️ Elige <strong>dos bancos distintos</strong> para comparar.';
    const gridEl=document.getElementById('tab-bco-comp-grid');
    if(gridEl) gridEl.innerHTML='';
    actualizarAsistenteBancos();
    return;
  }
  const resultados=calcComparador(ids,esc.plazoAnios,esc.montoUF,esc.piePct);
  renderComparadorResult('tab-bco',resultados);
  actualizarAsistenteBancos();
}

function initBancos2026(){
  // Pantalla completa screen-bancos
  renderBcoGrafico('bco-grafico');
  renderBcoTabla('bco-tabla');
  renderBcoRanking('bco-ranking');
  renderBcoRequisitos('bco-req-grid');
  renderBcoTendencias('bco-tendencias');
  poblarSelectores('bco');
  // Tab dentro de screen-3
  renderBcoGrafico('tab-bco-grafico');
  renderBcoTabla('tab-bco-tabla');
  renderBcoRanking('tab-bco-ranking');
  renderBcoRequisitos('tab-bco-req-grid');
  renderBcoTendencias('tab-bco-tendencias');
  poblarSelectores('tab-bco');
  actualizarAsistenteBancos();
}
document.addEventListener('DOMContentLoaded', initBancos2026);

function toggleBcoChat(){
  const wrap=document.getElementById('bco-chat-wrap');
  if(!wrap) return;
  const abierto=wrap.classList.toggle('abierto');
  const btn=wrap.querySelector('.bco-chat-trigger');
  if(btn) btn.setAttribute('aria-expanded',abierto?'true':'false');
}
function toggleTabBcoChat(){
  const wrap=document.getElementById('tab-bco-chat-wrap');
  if(!wrap) return;
  const abierto=wrap.classList.toggle('abierto');
  const btn=wrap.querySelector('.bco-chat-trigger');
  if(btn) btn.setAttribute('aria-expanded',abierto?'true':'false');
}
function scrollToBcoSeccion(id){
  const el=document.getElementById(id);
  if(!el) return;
  // Si la sección está dentro de <details>, abrirla antes de scrollear
  const details=el.closest('details.bco-seccion');
  if(details) details.open=true;
  // Cerrar el panel antes de scrollear
  const chatWrap=document.getElementById('bco-chat-wrap');
  if(chatWrap){
    chatWrap.classList.remove('abierto');
    const btn=chatWrap.querySelector('.bco-chat-trigger');
    if(btn) btn.setAttribute('aria-expanded','false');
  }
  setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'start'}),140);
}
function irABancos(){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('activa'));
  const target=document.getElementById('screen-bancos');
  target.classList.add('activa');
  document.querySelector('.wizard-steps').style.display='none';
  actualizarAsistenteBancos();
  window.scrollTo({top:0,behavior:'smooth'});
}
/* ═══════════════════════════════════════════════════════════════════ */
function calcPublicAVC(){
  const precio=parseCLP('pub-precio');
  const arr=parseCLP('pub-arriendo');
  const res=document.getElementById('pub-avc-resultado');
  const hintEl=document.getElementById('pub-div-hint');
  if(precio<=0){ res.innerHTML=''; if(hintEl) hintEl.textContent='Calcularemos el dividendo estimado'; return; }
  const precioUF=precio/UF_VALOR;
  const div=Math.round(cuotaMensual(precioUF*0.80,4.1,25));
  if(hintEl) hintEl.textContent=`→ Dividendo estimado: $${fmt(div)}/mes (pie 20%, 25 años, 4.1%)`;
  if(arr<=0){
    // Solo mostrar el dividendo calculado, sin comparación
    const pieClp=precio*0.20;
    res.innerHTML=`<div style="border:1.5px solid var(--borde);border-radius:14px;padding:1.2rem 1.4rem;margin-bottom:12px">
      <div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--suave);margin-bottom:8px">ESTIMADO DE COMPRA</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div><div style="font-size:11px;color:var(--suave);margin-bottom:3px">Dividendo mensual</div><div style="font-family:'Fraunces',serif;font-size:1.4rem;font-weight:600;color:var(--negro)">$${fmt(div)}<span style="font-size:.8rem;font-weight:300">/mes</span></div></div>
        <div><div style="font-size:11px;color:var(--suave);margin-bottom:3px">Pie requerido (20%)</div><div style="font-family:'Fraunces',serif;font-size:1.4rem;font-weight:600;color:var(--negro)">$${fmt(pieClp)}</div></div>
      </div>
      <div style="font-size:12px;color:var(--suave);margin-top:10px">Ingresa el arriendo mensual para comparar cuál opción te conviene más.</div>
    </div>`;
    return;
  }
  const dif=div-arr;
  const absDif=fmt(Math.abs(dif));
  let veredictoHtml='';
  if(dif<0){
    veredictoHtml=`<div style="background:var(--verde-l);border:1.5px solid var(--verde);border-radius:14px;padding:1.2rem 1.4rem;margin-bottom:12px">
      <div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--verde);margin-bottom:5px">✅ Comprar es más barato hoy</div>
      <div style="font-family:'Fraunces',serif;font-size:1.5rem;font-weight:600;color:var(--negro);margin-bottom:6px">$${absDif}/mes menos que arrendar</div>
      <div style="font-size:13px;color:var(--texto);line-height:1.6">Con cada dividendo estás construyendo patrimonio — esa plata queda para ti. Además tienes estabilidad: nadie te puede subir el arriendo ni pedirte que te vayas.</div>
    </div>`;
  } else {
    // Estima break-even: cuando capital acumulado supera el extra pagado
    const TASA=4.1, r=(TASA/100)/12, n=25*12;
    const monto=precioUF*0.80*UF_VALOR;
    let saldo=monto, capitalAcum=0, extraAcum=0, meses=null;
    for(let m=1;m<=n;m++){
      const interes=saldo*r, amort=div-interes;
      if(amort<=0) break;
      capitalAcum+=amort; extraAcum+=dif; saldo-=amort;
      if(capitalAcum>=extraAcum){ meses=m; break; }
    }
    const beTxt=meses?`A los ${Math.ceil(meses/12)} años te empieza a convenir comprar`:'En el plazo analizado arrendar sigue siendo más barato';
    veredictoHtml=`<div style="background:var(--amarillo-l);border:1.5px solid var(--amarillo);border-radius:14px;padding:1.2rem 1.4rem;margin-bottom:12px">
      <div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--amarillo);margin-bottom:5px">⚖️ Arrendar es más barato hoy</div>
      <div style="font-family:'Fraunces',serif;font-size:1.5rem;font-weight:600;color:var(--negro);margin-bottom:6px">$${absDif}/mes más barato arrendar</div>
      <div style="font-size:13px;color:var(--texto);line-height:1.6">Hoy pagas menos arrendando, pero parte del dividendo queda como tuyo (patrimonio). <strong>${beTxt}</strong> — porque el capital que acumulas en la propiedad supera lo que pagaste de más.</div>
    </div>`;
  }
  const prosHtml=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <div style="border:1.5px solid var(--borde);border-radius:12px;padding:1rem">
      <div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--suave);margin-bottom:8px">🏠 Si compras</div>
      <div style="font-size:12px;color:var(--texto);line-height:1.8">✓ Construyes patrimonio<br>✓ Dividendo fijo, sin alzas<br>✓ Puedes modificar la propiedad<br>✗ Menos liquidez</div>
    </div>
    <div style="border:1.5px solid var(--borde);border-radius:12px;padding:1rem">
      <div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--suave);margin-bottom:8px">📦 Si arriendas</div>
      <div style="font-size:12px;color:var(--texto);line-height:1.8">✓ Más liquidez mensual<br>✓ Flexibilidad para moverte<br>✗ El arriendo puede subir<br>✗ No acumulas patrimonio</div>
    </div>
  </div>`;
  res.innerHTML=veredictoHtml+prosHtml;
}

/* ─── PANEL LATERAL SUBSIDIOS ─── */
function toggleSideSubsidios(){
  const panel=document.getElementById('side-sub-panel');
  const card=document.getElementById('side-card-subsidios');
  const abierto=panel.classList.toggle('abierto');
  card.style.background = abierto ? 'var(--fondo)' : '';
  card.style.borderColor = abierto ? 'var(--borde)' : 'transparent';
  if(abierto){ renderSideSubCtx(); }
}
function renderSideSubCtx(){
  const el=document.getElementById('side-sub-ctx');
  if(!el) return;
  const ctx=_subCtxSimulador;
  if(ctx && ctx.sueldo>0){
    const calif=SUBSIDIOS_DEF.filter(s=>s.aplicar(ctx));
    el.innerHTML=`<div class="side-sub-item verde" style="margin-bottom:7px">
      <div class="side-sub-item-tag verde">📊 Tu simulación</div>
      <div class="side-sub-item-dato">Sueldo: <strong>$${fmt(ctx.sueldo)}</strong></div>
      <div class="side-sub-item-dato">Calificas a <strong>${calif.length}</strong> programa${calif.length!==1?'s':''}</div>
    </div>`;
  } else {
    el.innerHTML=`<div style="font-size:11px;color:var(--suave);margin-bottom:7px;text-align:center">Sin datos del simulador</div>`;
  }
}
function irASubsidiosCat(cat){
  irASubsidios();
  // Espera que la pantalla esté lista y filtra por categoría
  setTimeout(()=>filtrarSubsidiosInteractivos(cat, document.querySelector(`.sub-filtro-btn[data-cat="${cat}"]`)), 100);
}

/* ─── PANTALLA SUBSIDIOS INTERACTIVOS ─── */

// Variable global para el contexto del simulador (se llena cuando el usuario usa la calculadora)
let _subCtxSimulador = null;

function irASubsidios(){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('activa'));
  const target=document.getElementById('screen-subsidios');
  target.classList.add('activa');
  document.querySelector('.wizard-steps').style.display='none';
  window.scrollTo({top:0,behavior:'smooth'});
  renderSubsidiosInteractivos();
  const h=target.querySelector('.sub-hero-title');
  if(h){ h.setAttribute('tabindex','-1'); h.focus({preventScroll:true}); }
}

function volverDesdeSubsidios(){ volverDesdeScreen(); }

function irACalculadoraCompleta(){
  volverDesdeScreen();
}

// Llamada desde la calculadora al terminar el cálculo — guarda contexto para mostrar elegibilidad
function setSubCtxSimulador(ctx){
  _subCtxSimulador = ctx;
}

function renderSubsidiosInteractivos(catFiltro){
  const catActual = catFiltro || 'todos';

  // Obtener contexto del simulador (si está disponible)
  const ctx = _subCtxSimulador;

  // Barra de contexto
  const ctxBar = document.getElementById('sub-contexto-bar');
  if(ctxBar){
    if(ctx && ctx.sueldo > 0){
      ctxBar.innerHTML=`<div class="sub-ctx-bar">
        <span class="sub-ctx-tag">📊 Tu perfil</span>
        <span class="sub-ctx-txt">Simulaste con <strong>$${fmt(ctx.sueldo)}/mes</strong> (${ctx.ingresoUF.toFixed(1)} UF) · ${ctx.situacion==='segunda'?'Segunda vivienda':ctx.situacion==='tengo'?'Ya tengo casa':'Primera vivienda'} · ${ctx.tipo==='depto'?'Departamento':ctx.tipo==='casa'?'Casa':'Vivienda usada'} <strong>${Math.round(ctx.precioUF).toLocaleString('es-CL')} UF</strong></span>
        <button class="sub-ctx-btn" data-main-action="ir-calculadora">← Volver al análisis</button>
      </div>`;
    } else {
      ctxBar.innerHTML=`<div class="sub-sin-ctx">
        <span>💡 Sin datos del simulador — mostrando todos los subsidios con requisitos generales.</span>
        <button class="sub-ctx-btn" data-main-action="ir-calculadora">Usar simulador →</button>
      </div>`;
    }
  }

  // Resetear filtro activo en botones
  document.querySelectorAll('.sub-filtro-btn').forEach(b=>{
    b.classList.toggle('activo', b.dataset.cat===catActual);
  });

  // Construir contexto de evaluación
  const evalCtx = ctx || {
    sueldo:0, ingresoUF:0, primera:true, nueva:true,
    precioUF:1200, tipo:'depto'
  };

  // Filtrar subsidios por categoría
  const TASA=4.1, PLAZO=25, PIE=0.20;
  const todos = SUBSIDIOS_DEF.filter(s=> catActual==='todos' || s.categoria===catActual);

  const lista = document.getElementById('sub-interactivos-lista');
  if(!lista) return;

  const partes=[];

  // Calendario de llamados
  partes.push(`<div class="sub-calendario">
    <div class="sub-cal-titulo">📅 Próximos llamados MINVU 2026</div>
    <div class="sub-cal-grid">
      <div class="sub-cal-item"><span class="sub-cal-mes">Mayo / Nov.</span><span class="sub-cal-prog">DS1 Tramos 1, 2 y 3</span></div>
      <div class="sub-cal-item"><span class="sub-cal-mes">Jul. / Oct.</span><span class="sub-cal-prog">DS49 Compra y Construcción</span></div>
      <div class="sub-cal-item"><span class="sub-cal-mes">Mayo–Jun. / Ago.</span><span class="sub-cal-prog">DS52 Arriendo</span></div>
      <div class="sub-cal-item"><span class="sub-cal-mes">Abr.–May.</span><span class="sub-cal-prog">Mejoramiento Hogar Mejor</span></div>
      <div class="sub-cal-item"><span class="sub-cal-mes">Mar./May./Jul./Sep./Dic.</span><span class="sub-cal-prog">DS10 Rural</span></div>
    </div>
    <div style="font-size:11px;color:var(--suave);margin-top:6px">Fechas estimadas · <a href="https://www.minvu.gob.cl" target="_blank" rel="noopener" style="color:var(--negro)">minvu.gob.cl</a></div>
  </div>`);

  // Agrupar por categoría
  const CATEGORIAS=[
    {id:'compra',       emoji:'🏠', label:'Compra de vivienda',              desc:'Subsidios para comprar vivienda construida (nueva o usada)'},
    {id:'arriendo',     emoji:'🏘️', label:'Arriendo',                        desc:'Subsidio temporal para familias que arriendan'},
    {id:'construccion', emoji:'🏗️', label:'Construcción de vivienda',         desc:'Subsidios para construir tu vivienda nueva'},
    {id:'integracion',  emoji:'🤝', label:'Integración Social (DS19)',         desc:'Proyectos habitacionales integrados en barrios bien localizados'},
    {id:'mejoramiento', emoji:'🔨', label:'Mejoramiento y barrios',            desc:'Reparación, ampliación y eficiencia energética'},
    {id:'rural',        emoji:'🌾', label:'Habitabilidad Rural (DS10)',        desc:'Construcción y mejoramiento en localidades hasta 5.000 hab.'},
  ];

  const catsAMostrar = catActual==='todos'
    ? CATEGORIAS
    : CATEGORIAS.filter(c=>c.id===catActual);

  catsAMostrar.forEach(cat=>{
    const subsEnCat = todos.filter(s=>s.categoria===cat.id);
    if(!subsEnCat.length) return;

    const tarjetas=[];
    // Ordenar: primero los que califican (si hay contexto)
    const conCtx = ctx && ctx.sueldo > 0;
    const ordenados = conCtx
      ? [...subsEnCat.filter(s=>s.aplicar(evalCtx)), ...subsEnCat.filter(s=>!s.aplicar(evalCtx))]
      : subsEnCat;

    ordenados.forEach(s=>{
      const aplica  = conCtx ? s.aplicar(evalCtx) : null;
      const razones = (conCtx && !aplica && s.razones) ? s.razones(evalCtx) : [];

      // Badge de elegibilidad
      let badgeHtml;
      if(!conCtx){
        badgeHtml=`<span class="sub-badge--simular">Simula para ver si calificas</span>`;
      } else if(aplica){
        if(s.esFogaes)    badgeHtml=`<span class="sub-badge--califica">✓ Pie 10% disponible</span>`;
        else if(s.esTasa) badgeHtml=`<span class="sub-badge--califica">✓ −${s.tasaDescuento}% tasa</span>`;
        else              badgeHtml=`<span class="sub-badge--califica">✓ Calificas</span>`;
      } else {
        badgeHtml=`<span class="sub-badge--nocalifica">✗ No calificas hoy</span>`;
      }

      // Chips info
      const chips=[];
      if(s.ingresoMaximoRSH) chips.push(`<span class="sub-chip">RSH hasta ${s.ingresoMaximoRSH}%</span>`);
      if(s.maxPrecioUF && s.maxPrecioUF<9000) chips.push(`<span class="sub-chip">Hasta ${s.maxPrecioUF.toLocaleString('es-CL')} UF</span>`);
      if(s.ahorroMinimoUF>0) chips.push(`<span class="sub-chip">Ahorro mín. ${s.ahorroMinimoUF} UF</span>`);
      const chipsHtml = chips.length ? `<div class="sub-chips">${chips.join('')}</div>` : '';

      // Requisitos
      const reqHtml = s.requisitosOficiales ? `<div class="sub-req-wrap">
        <div class="sub-req-titulo">📋 Requisitos oficiales MINVU</div>
        <ul class="sub-req-lista">${s.requisitosOficiales.map(r=>`<li><span class="sub-req-bullet" style="color:${aplica===true?'var(--verde)':'var(--suave2)'}">→</span><span>${r}</span></li>`).join('')}</ul>
      </div>` : '';

      // Por qué no califica
      const razonesHtml = razones.length ? `<div class="sub-razones">
        <div class="sub-razones-titulo">❌ Por qué no calificas hoy</div>
        <ul>${razones.map(r=>`<li><span style="color:var(--rojo);font-weight:700;flex-shrink:0">•</span><span>${r}</span></li>`).join('')}</ul>
      </div>` : '';

      // Dividendo estimado si aplica y tiene precio
      let dividendoHtml='';
      if(aplica && !s.esFogaes && !s.esTasa && !s.esArriendo && !s.esMejoramiento && !s.esRural && s.montoUF && ctx){
        const precioEf = Math.min(ctx.precioUF, s.maxPrecioUF||ctx.precioUF) - (s.montoUF||0);
        if(precioEf>0){
          const cuota = cuotaMensual(Math.max(0, precioEf*(1-PIE)), TASA, PLAZO);
          dividendoHtml=`<div class="sub-metric" style="background:#f0fdf4;border:1px solid #86efac;border-radius:9px;padding:.55rem .75rem;margin:.5rem 0;display:inline-block">
            <div style="font-size:10px;color:#15803d;font-weight:700;text-transform:uppercase;letter-spacing:.06em">💰 Dividendo estimado con tu subsidio</div>
            <div style="font-family:'Fraunces',serif;font-size:1.25rem;font-weight:600;color:var(--negro)">$${fmt(cuota)}<span style="font-size:.8rem;font-weight:300">/mes</span></div>
            <div style="font-size:11px;color:var(--suave)">Subsidio: ${s.montoUF} UF · pie 20% · 25 años · 4,1%</div>
          </div>`;
        }
      }

      // Botones
      const btns = s.linksOficiales ? `<div class="sub-links-bar">
        <a class="sub-btn sub-btn--primary" href="${s.linksOficiales.minvu}" target="_blank" rel="noopener">Ver requisitos en MINVU →</a>
        ${!conCtx ? `<button class="sub-btn sub-btn--secondary" data-main-action="ir-calculadora">Simular para ver si califico</button>` : ''}
      </div>` : '';

      const claseTarjeta = aplica===true ? 'aplica' : aplica===false ? 'no-aplica' : '';

      tarjetas.push(`<div class="sub-item ${claseTarjeta}" id="sub-item-${s.id}">
        <div class="sub-header">
          <div class="sub-header-left">
            <span class="sub-icono">${s.icono}</span>
            <div><div class="sub-nombre">${s.nombre}</div></div>
          </div>
          <div class="sub-monto">${badgeHtml}</div>
        </div>
        ${chipsHtml}
        ${s.descripcionOficial ? `<div class="sub-desc">${s.descripcionOficial}</div>` : ''}
        ${s.quienPuedePostular ? `<div class="sub-quien"><strong>¿Quién puede postular?</strong> ${s.quienPuedePostular}</div>` : ''}
        ${dividendoHtml}
        ${s.fechasPostulacion2026 ? `<div class="sub-fecha-tag">📅 ${s.fechasPostulacion2026}</div>` : ''}
        ${s.modalidad ? `<div class="sub-modal"><strong>Modalidad:</strong> ${s.modalidad}</div>` : ''}
        ${s.postulacion ? `<div class="sub-modal"><strong>Postulación:</strong> ${s.postulacion}</div>` : ''}
        ${razonesHtml}
        ${reqHtml}
        ${btns}
      </div>`);
    });

    // Contador del acordeón
    const califCat = conCtx ? subsEnCat.filter(s=>s.aplicar(evalCtx)).length : null;
    const contadorHtml = califCat!==null
      ? (califCat>0
          ? `<span class="sub-badge sub-badge--verde" style="flex-shrink:0">✓ ${califCat} calificas</span>`
          : `<span style="font-size:.78rem;color:var(--suave);flex-shrink:0">${subsEnCat.length} programa${subsEnCat.length>1?'s':''}</span>`)
      : `<span style="font-size:.78rem;color:var(--suave);flex-shrink:0">${subsEnCat.length} programa${subsEnCat.length>1?'s':''}</span>`;

    // Siempre plegado por defecto: usuario debe hacer click para desplegar
    partes.push(`<details class="sub-cat-details">
        <summary class="sub-cat-summary">
          <div class="sub-cat-header">
            <span class="sub-cat-emoji">${cat.emoji}</span>
            <div>
              <div class="sub-cat-titulo">${cat.label}</div>
              <div class="sub-cat-desc">${cat.desc}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            ${contadorHtml}
            <span class="sub-cat-chevron">▼</span>
          </div>
        </summary>
        <div class="sub-cat-body subs-lista">${tarjetas.join('')}</div>
      </details>`);
  });

  lista.innerHTML = partes.join('');
}

function filtrarSubsidiosInteractivos(cat, btn){
  renderSubsidiosInteractivos(cat);
}

function checkSubsidiosRapido(){
  const sueldo=parseCLP('sub-sueldo');
  const res=document.getElementById('sub-live-resultado');
  const cta=document.getElementById('sub-cta-completo');
  if(sueldo<=0){ res.innerHTML=''; if(cta) cta.style.display='none'; return; }

  const primera=document.getElementById('sub-primera').checked;
  const nueva=document.getElementById('sub-nueva').checked;
  const situacion=primera?'primera':'segunda';
  const ingresoUF=sueldo/UF_VALOR;
  const TASA=4.1, PLAZO=25, PIE=0.20;

  // Evalúa subsidios DS por ingreso
  const dsOpts=[
    {id:'ds49', nombre:'DS49 — Fondo Solidario de Elección de Vivienda', maxI:25, minI:0,  maxP:950,  monto:314, soloNueva:false},
    {id:'ds1t1',nombre:'DS1 Tramo 1 — Primera casa, sectores medios bajos',maxI:37, minI:0,  maxP:1100, monto:130, soloNueva:false},
    {id:'ds1t2',nombre:'DS1 Tramo 2 — Primera casa, sectores medios',     maxI:60, minI:37, maxP:1600, monto:90,  soloNueva:false},
    {id:'ds1t3',nombre:'DS1 Tramo 3 — Primera casa, sectores medios altos',maxI:78, minI:60, maxP:2200, monto:60,  soloNueva:false},
  ];
  let dsOk=null, dsRazon='';
  for(const ds of dsOpts){
    const ingOk=ingresoUF>ds.minI&&ingresoUF<=ds.maxI;
    const pOk=primera;
    const nOk=!ds.soloNueva||nueva;
    if(ingOk&&pOk&&nOk){ dsOk=ds; break; }
  }
  if(!dsOk){
    if(!primera) dsRazon=situacion==='segunda'
      ? 'Los subsidios DS49 y DS1 son exclusivos para <strong>primera vivienda</strong>. Si es tu segunda propiedad, puedes acceder a FOGAES (pie 10%) si calificas por ingresos.'
      : 'Los subsidios DS49 y DS1 son exclusivos para <strong>primera vivienda</strong>. Si ya tienes casa y quieres reemplazarla, existen subsidios de reemplazo de vivienda.';
    else if(ingresoUF<=25) dsRazon='Verifica tu RSH en registrosocial.gob.cl — el DS49 requiere estar en el 40% más vulnerable.';
    else if(ingresoUF>78) dsRazon=`Tu sueldo de $${fmt(sueldo)} (${ingresoUF.toFixed(1)} UF/mes) supera los 78 UF máximos de los subsidios habitacionales. Los subsidios DS están orientados a ingresos medios y bajos.`;
    else dsRazon='No se encontró un subsidio DS compatible con tu perfil actual.';
  }

  let html='';

  // Tarjeta subsidio DS
  if(dsOk){
    const precioEfUF=dsOk.maxP-dsOk.monto;
    const creditoUF=precioEfUF*(1-PIE);
    const cuota=cuotaMensual(creditoUF,TASA,PLAZO);
    const pieClp=precioEfUF*PIE*UF_VALOR;
    const montoClp=dsOk.monto*UF_VALOR;
    const precioClp=dsOk.maxP*UF_VALOR;
    const bonoPie=false; // Bono Pie DS19 eliminado — DS49 no tiene bono pie separado
    html+=`<div class="sub-card-grande verde">
      <div class="sub-card-label verde">✅ Calificas a subsidio habitacional</div>
      <div style="font-family:'Fraunces',serif;font-size:1.25rem;font-weight:600;color:var(--negro);margin-bottom:3px">${dsOk.nombre}</div>
      <div style="font-size:12px;color:var(--suave);margin-bottom:.75rem">Tu ingreso: ${ingresoUF.toFixed(1)} UF/mes — dentro del rango del subsidio</div>
      <div class="sub-metrics">
        <div class="sub-metric">
          <div class="sub-metric-label">Subsidio del Estado</div>
          <div class="sub-metric-val verde">${dsOk.monto} UF</div>
          <div class="sub-metric-sub">~$${fmt(montoClp)}</div>
        </div>
        <div class="sub-metric">
          <div class="sub-metric-label">Precio máx. vivienda</div>
          <div class="sub-metric-val">${dsOk.maxP} UF</div>
          <div class="sub-metric-sub">~$${fmt(precioClp)}</div>
        </div>
        <div class="sub-metric">
          <div class="sub-metric-label">Dividendo estimado</div>
          <div class="sub-metric-val">$${fmt(cuota)}</div>
          <div class="sub-metric-sub">pie 20%·25 años·4.1%</div>
        </div>
        <div class="sub-metric">
          <div class="sub-metric-label">Pie que necesitas</div>
          <div class="sub-metric-val">$${fmt(pieClp)}</div>
          <div class="sub-metric-sub">${(PIE*100).toFixed(0)}% del precio</div>
        </div>
      </div>
      </div>
    </div>`;
  } else {
    html+=`<div class="sub-card-grande amarillo">
      <div class="sub-card-label amarillo">⚠️ Sin subsidio DS disponible hoy</div>
      <div style="font-size:13px;color:var(--texto);line-height:1.6">${dsRazon}</div>
    </div>`;
  }

  // FOGAES (universal)
  html+=`<div class="sub-universal">
    <span style="font-size:1.3rem;flex-shrink:0">🔑</span>
    <div>
      <div style="font-weight:500;font-size:13.5px;color:var(--negro);margin-bottom:3px">FOGAES — Solo el 10% de pie <span class="pill pill-verde" style="font-size:10px;padding:1px 8px;margin-left:4px">Disponible para ti</span></div>
      <div style="font-size:12.5px;color:var(--texto);line-height:1.6">Con FOGAES el banco acepta <strong>solo el 10% de pie</strong> en vez del 20% estándar — el Estado garantiza la diferencia. Aplica a viviendas hasta 4.500 UF. El banco lo tramita automáticamente, sin postulación en Minvu.</div>
    </div>
  </div>`;

  // Ley 21.748 (vivienda nueva)
  if(nueva){
    html+=`<div class="sub-universal">
      <span style="font-size:1.3rem;flex-shrink:0">📉</span>
      <div>
        <div style="font-weight:500;font-size:13.5px;color:var(--negro);margin-bottom:3px">Ley 21.748 — Subsidio a la tasa <span class="pill pill-verde" style="font-size:10px;padding:1px 8px;margin-left:4px">Vivienda nueva</span></div>
        <div style="font-size:12.5px;color:var(--texto);line-height:1.6">El Estado subsidia tu tasa de interés. Tu tasa baja <strong>0.6%</strong>, lo que equivale a ~$30.000–$60.000 menos en tu dividendo mensual los primeros <strong>~5 años</strong>. Aplica a vivienda nueva hasta 4.000 UF — solo menciónalo en el banco. Después del período subsidiado, el dividendo sube a la tasa normal.</div>
      </div>
    </div>`;
  }

  res.innerHTML=html;
  if(cta) cta.style.display='flex';
}


