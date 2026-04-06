# SEO Visibilidad — Rich Snippets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Habilitar rich snippets en Google (FAQs, HowTo, Breadcrumbs) creando `/faq` como página con contenido HTML visible y agregando schemas estructurados a la home.

**Architecture:** Nueva página `public/faq.html` con 30 Q&As visibles en acordeón `<details>/<summary>` + `FAQPage` y `BreadcrumbList` JSON-LD. La home (`public/index.html`) recibe `HowTo`, `BreadcrumbList` JSON-LD y un link al FAQ en el nav.

**Tech Stack:** HTML, CSS (variables de `styles.css`), JSON-LD (schema.org), Netlify (publish = `public/`)

---

## Mapa de archivos

| Archivo | Acción |
|---|---|
| `public/styles.css` | Modificar — agregar `.nav-link` |
| `public/index.html` | Modificar — schemas HowTo + BreadcrumbList + link nav |
| `public/faq.html` | Crear — página FAQ completa |
| `public/sitemap.xml` | Modificar — agregar entrada `/faq` |

---

## Task 1: Agregar `.nav-link` a `public/styles.css`

**Files:**
- Modify: `public/styles.css` (después de la regla `.uf-chip`, ~línea 67)

- [ ] **Step 1: Agregar la regla CSS**

En `public/styles.css`, después del bloque `.uf-chip { ... }` (línea ~67), agregar:

```css
.nav-link {
  font-size: 13px;
  color: var(--suave);
  text-decoration: none;
  white-space: nowrap;
}
.nav-link:hover { color: var(--negro); }
```

- [ ] **Step 2: Verificar visualmente**

```bash
python3 -m http.server 8000 -d public/
```
Abrir `http://localhost:8000` — el nav no debe verse alterado aún (la clase `.nav-link` existe pero no se usa todavía).

- [ ] **Step 3: Commit**

```bash
git add public/styles.css
git commit -m "style: agregar .nav-link para navegación entre páginas"
```

---

## Task 2: Modificar `public/index.html` — schemas + link al FAQ

**Files:**
- Modify: `public/index.html`

### Cambio A: Agregar HowTo + BreadcrumbList JSON-LD en `<head>`

- [ ] **Step 1: Localizar punto de inserción**

En `public/index.html`, localizar el bloque que termina con el cierre del WebSite schema:
```html
  }
  </script>

  <!-- JSON-LD: FAQPage -->
```

Insertar entre `</script>` del WebSite y el comentario `<!-- JSON-LD: FAQPage -->`:

```html
  <!-- JSON-LD: HowTo -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Cómo comprar una casa en Chile",
    "description": "Los 8 pasos del proceso de compra de vivienda en Chile, desde ahorrar el pie hasta recibir las llaves.",
    "step": [
      { "@type": "HowToStep", "position": "1", "name": "Ahorrar el pie (10–20% del precio)" },
      { "@type": "HowToStep", "position": "2", "name": "Obtener pre-aprobación bancaria" },
      { "@type": "HowToStep", "position": "3", "name": "Buscar la propiedad y firmar la promesa de compraventa" },
      { "@type": "HowToStep", "position": "4", "name": "Tasación bancaria de la propiedad" },
      { "@type": "HowToStep", "position": "5", "name": "Aprobación formal del crédito hipotecario" },
      { "@type": "HowToStep", "position": "6", "name": "Firma de escritura ante notario" },
      { "@type": "HowToStep", "position": "7", "name": "Inscripción en el Conservador de Bienes Raíces (CBR)" },
      { "@type": "HowToStep", "position": "8", "name": "Recibir las llaves de la propiedad" }
    ]
  }
  </script>

  <!-- JSON-LD: BreadcrumbList -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://cuantocuestaunacasa.cl/"
      }
    ]
  }
  </script>
```

### Cambio B: Agregar link al FAQ en el nav

- [ ] **Step 2: Localizar el nav**

En `public/index.html`, localizar:
```html
    <div class="uf-chip">
      <span class="dot-live"></span>
      UF $<span id="uf-valor">—</span>
    </div>
  </nav>
```

Reemplazar con:
```html
    <div class="uf-chip">
      <span class="dot-live"></span>
      UF $<span id="uf-valor">—</span>
    </div>
    <a href="/faq" class="nav-link">Preguntas frecuentes</a>
  </nav>
```

- [ ] **Step 3: Verificar en el navegador**

```bash
python3 -m http.server 8000 -d public/
```
Abrir `http://localhost:8000`:
- El nav muestra: `[logo]  [● UF 38.xxx]  [Preguntas frecuentes]`
- Clic en "Preguntas frecuentes" lleva a `/faq` (aún no existe — 404 es esperado en este punto)

- [ ] **Step 4: Validar JSON-LD**

Abrir `http://localhost:8000` y copiar el HTML fuente. Pegar en `https://validator.schema.org/` y verificar que HowTo y BreadcrumbList aparecen sin errores.

- [ ] **Step 5: Commit**

```bash
git add public/index.html
git commit -m "seo: agregar HowTo, BreadcrumbList y link FAQ a index.html"
```

---

## Task 3: Crear `public/faq.html`

**Files:**
- Create: `public/faq.html`

- [ ] **Step 1: Crear el archivo con el siguiente contenido completo**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Preguntas frecuentes sobre crédito hipotecario y subsidios Chile 2026</title>
  <meta name="description" content="Respuestas a las 30 preguntas más frecuentes sobre comprar vivienda en Chile: precios por región, subsidios DS1/DS49, crédito hipotecario, pie, FOGAES y más.">

  <link href="https://cuantocuestaunacasa.cl/faq" rel="canonical">
  <link rel="alternate" hreflang="es-CL" href="https://cuantocuestaunacasa.cl/faq">
  <link rel="alternate" hreflang="x-default" href="https://cuantocuestaunacasa.cl/faq">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,300&family=DM+Sans:wght@300;400;500&display=swap" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,300&family=DM+Sans:wght@300;400;500&display=swap"></noscript>

  <link rel="stylesheet" href="styles.css">

  <style>
  .faq-wrap        { max-width: 680px; margin: 0 auto; padding: 2.5rem 2rem 4rem; }
  .faq-kicker      { font-size: 10px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--suave2); margin-bottom: .5rem; }
  .faq-h1          { font-family: 'Fraunces', serif; font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 300; color: var(--negro); line-height: 1.2; margin-bottom: .5rem; }
  .faq-h1 em       { font-style: italic; color: var(--rojo); }
  .faq-intro       { font-size: 15px; color: var(--suave); margin-bottom: 2.5rem; line-height: 1.7; }
  .faq-cat         { margin-bottom: 2.2rem; }
  .faq-cat-title   { font-family: 'Fraunces', serif; font-size: 1.05rem; font-weight: 600; color: var(--negro); margin-bottom: .75rem; padding-bottom: .5rem; border-bottom: 1.5px solid var(--borde); }
  .faq-list        { display: flex; flex-direction: column; gap: 6px; }
  .faq-item        { border: 1.5px solid var(--borde); border-radius: 12px; overflow: hidden; }
  .faq-item[open]  { border-color: var(--negro); }
  .faq-q           { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: .85rem 1.1rem; cursor: pointer; list-style: none; user-select: none; background: var(--blanco); font-weight: 500; font-size: 14.5px; color: var(--negro); line-height: 1.4; }
  .faq-q::-webkit-details-marker { display: none; }
  .faq-q::marker   { display: none; }
  .faq-q:hover     { background: var(--fondo); }
  .faq-item[open] > .faq-q { background: var(--fondo); border-bottom: 1px solid var(--borde); }
  .faq-chevron     { font-size: 11px; color: var(--suave2); flex-shrink: 0; transition: transform .2s; }
  .faq-item[open] .faq-chevron { transform: rotate(180deg); }
  .faq-a           { padding: 1rem 1.1rem; font-size: 14.5px; color: var(--texto); line-height: 1.75; }
  .faq-cta         { margin-top: 3rem; padding: 1.5rem 1.8rem; background: var(--fondo); border-radius: 14px; text-align: center; }
  .faq-cta-title   { font-family: 'Fraunces', serif; font-size: 1.3rem; font-weight: 300; color: var(--negro); margin-bottom: .4rem; }
  .faq-cta-title em { font-style: italic; color: var(--rojo); }
  .faq-cta-sub     { font-size: 14px; color: var(--suave); margin-bottom: 1.2rem; line-height: 1.6; }
  .faq-cta-btn     { display: inline-block; padding: .75rem 1.8rem; background: var(--negro); color: var(--blanco); border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px; }
  .faq-cta-btn:hover { background: var(--rojo); }
  .faq-footer      { border-top: 1px solid var(--borde); padding: 1.5rem 2rem; text-align: center; font-size: 12px; color: var(--suave2); }
  .faq-footer a    { color: var(--suave2); text-decoration: none; }
  .faq-footer a:hover { color: var(--negro); }
  </style>

  <!-- JSON-LD: FAQPage -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "name": "Preguntas frecuentes sobre comprar una casa en Chile",
    "description": "Respuestas a las 30 preguntas más frecuentes sobre comprar vivienda en Chile: precios, subsidios DS1/DS49, crédito hipotecario, pie, FOGAES y más.",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta un departamento en Santiago en 2026?",
        "acceptedAnswer": { "@type": "Answer", "text": "En la Región Metropolitana el precio por m² es de ~77 UF para departamentos nuevos (CChC Q3 2025). Un departamento de 55 m² cuesta aproximadamente 4.235 UF (~$163.000.000). Varía mucho según la comuna: Providencia y Las Condes superan los 100 UF/m², mientras que comunas periféricas pueden estar bajo 60 UF/m²." }
      },
      {
        "@type": "Question",
        "name": "¿Cuál es la región más barata para comprar casa en Chile?",
        "acceptedAnswer": { "@type": "Answer", "text": "Las regiones con precios por m² más bajos son La Araucanía (36 UF/m²), Ñuble (38 UF/m²) y Aysén (35 UF/m²). Un departamento de 55 m² en Araucanía cuesta ~1.980 UF (~$76.000.000). El dividendo sería de ~$400.000/mes con pie 20% y 25 años." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta una casa usada en Chile?",
        "acceptedAnswer": { "@type": "Answer", "text": "Las viviendas usadas tienen un descuento promedio de 10-20% respecto a las nuevas. En Santiago, una casa usada de 55 m² está en ~62 UF/m² (~$132.000.000). En regiones intermedias, alrededor de 35-45 UF/m². Los subsidios DS19 y DS1 en algunos tramos no aplican a vivienda usada." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto vale el metro cuadrado en Valparaíso?",
        "acceptedAnswer": { "@type": "Answer", "text": "En la Región de Valparaíso el precio promedio es de 58 UF/m² para departamentos (CChC Q3 2025). Un departamento de 55 m² vale ~3.190 UF (~$122.000.000). El dividendo con pie 20% y 25 años sería de ~$665.000/mes." }
      },
      {
        "@type": "Question",
        "name": "¿Puedo comprar una casa con un sueldo de $600.000?",
        "acceptedAnswer": { "@type": "Answer", "text": "Con $600.000/mes el banco puede prestarte hasta ~$28.000.000 (30% de esfuerzo, 25 años, tasa 4.1%). Eso alcanza para una vivienda de ~$35.000.000. En regiones como Maule, Araucanía o Biobío hay opciones dentro de ese rango. Además, con ese ingreso (15.6 UF/mes) calificas al subsidio DS19, que descuenta hasta 180 UF del precio." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto sueldo necesito para comprar una casa en Santiago?",
        "acceptedAnswer": { "@type": "Answer", "text": "Un departamento de 55 m² en Santiago cuesta ~4.235 UF (~$163.000.000). Para pagarlo con pie 20% y 25 años, necesitas al menos $1.300.000/mes de sueldo. Con codeudor, los sueldos se suman. También puedes usar subsidio DS1 (hasta 78 UF/mes de ingreso) para reducir el precio efectivo." }
      },
      {
        "@type": "Question",
        "name": "¿Con qué sueldo mínimo puedo pedir un crédito hipotecario en Chile?",
        "acceptedAnswer": { "@type": "Answer", "text": "No hay un mínimo fijo, pero el banco exige que el dividendo no supere el 25-30% de tu sueldo. Para un crédito de $50.000.000 a 25 años y 4.1%, el dividendo es ~$268.000/mes, así que necesitarías al menos $900.000 de sueldo. Con subsidio DS19 y precio más bajo, puedes entrar con menos." }
      },
      {
        "@type": "Question",
        "name": "¿Puedo comprar una casa siendo arrendatario?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. No necesitas tener vivienda propia ni propiedad previa para calificar a un crédito hipotecario (a menos que sea un subsidio que exija primera vivienda). El banco evalúa tu sueldo, historial crediticio y capacidad de pago, no tu situación habitacional actual." }
      },
      {
        "@type": "Question",
        "name": "¿Qué pasa si mi sueldo es informal o a honorarios?",
        "acceptedAnswer": { "@type": "Answer", "text": "Puedes pedir un crédito hipotecario siendo independiente o a honorarios, pero el banco pedirá acreditar ingresos: declaración de renta, cotizaciones previsionales, estados de cuenta o un año de historial. Algunos bancos usan el promedio de los últimos 12-24 meses como ingreso base." }
      },
      {
        "@type": "Question",
        "name": "¿Puedo comprar con un codeudor?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. Con un codeudor (pareja, familiar), los sueldos se suman para calcular el crédito máximo. Ambos quedan como titulares del crédito y la propiedad. Es la forma más común de acceder a viviendas de mayor valor cuando un solo sueldo no alcanza." }
      },
      {
        "@type": "Question",
        "name": "¿Cómo funciona el crédito hipotecario en Chile?",
        "acceptedAnswer": { "@type": "Answer", "text": "El banco financia hasta el 80-90% del valor de la propiedad. Tú pones el resto (pie). El crédito se paga en cuotas mensuales fijas (dividendo) durante 15 a 30 años. La tasa promedio en Chile es 4-5% anual en UF. La regla principal es que el dividendo no supere el 25-30% de tu sueldo líquido." }
      },
      {
        "@type": "Question",
        "name": "¿Cuál es la tasa de interés hipotecaria en Chile en 2026?",
        "acceptedAnswer": { "@type": "Answer", "text": "En 2026, la tasa promedio para créditos hipotecarios en Chile está entre 3.8% y 5% anual en UF, según el banco y el plazo. La CMF publica las tasas actualizadas mensualmente. Con la Ley 21.748 (subsidio a la tasa), viviendas nuevas hasta 4.000 UF pueden acceder a una rebaja de ~0.6% los primeros años." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto tiempo dura un crédito hipotecario en Chile?",
        "acceptedAnswer": { "@type": "Answer", "text": "El plazo estándar es 20 a 30 años, siendo 25 años el más común. A mayor plazo, menor dividendo mensual, pero pagas más intereses en total. El banco no puede prestar hasta una edad que supere los ~75-80 años del solicitante, por lo que si tienes más de 45-50 años, el plazo disponible se reduce." }
      },
      {
        "@type": "Question",
        "name": "¿Qué es la regla del 30% en créditos hipotecarios?",
        "acceptedAnswer": { "@type": "Answer", "text": "Es la regla de esfuerzo financiero. Los bancos en Chile generalmente exigen que el dividendo mensual no supere el 25-30% de tu sueldo líquido total (incluyendo codeudores). Si tu sueldo es $1.000.000, el dividendo máximo aprobable sería ~$300.000/mes." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto hay que ahorrar para el pie de una casa en Chile?",
        "acceptedAnswer": { "@type": "Answer", "text": "El pie estándar es el 20% del precio de la propiedad. Para una vivienda de $100.000.000, necesitas $20.000.000. Con FOGAES, el mínimo baja al 10% ($10.000.000). Si calificas al DS19, el bono pie puede cubrir hasta 30 UF (~$1.200.000) adicionales." }
      },
      {
        "@type": "Question",
        "name": "¿Qué es FOGAES y cómo funciona?",
        "acceptedAnswer": { "@type": "Answer", "text": "El Fondo de Garantía Especial (FOGAES) es un programa del Estado chileno que garantiza el 10% del precio de la vivienda ante el banco, permitiéndote comprar con solo el 10% de pie en vez del 20% estándar. Aplica a viviendas hasta 4.500 UF, no requiere ser primera vivienda y lo tramita el banco automáticamente." }
      },
      {
        "@type": "Question",
        "name": "¿Puedo comprar una casa sin pie en Chile?",
        "acceptedAnswer": { "@type": "Answer", "text": "Es muy difícil conseguir financiamiento al 100% en Chile. Con FOGAES el mínimo baja al 10%. Con el subsidio DS19 más el Bono Pie DS19, el aporte propio puede ser muy bajo (el Estado cubre gran parte). Fuera de eso, los bancos generalmente no financian más del 90% del valor." }
      },
      {
        "@type": "Question",
        "name": "¿Puedo usar mis ahorros del APV para el pie?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sí. El Ahorro Previsional Voluntario (APV) puede retirarse anticipadamente para comprar primera vivienda, con ciertas condiciones tributarias. También puedes usar la Cuenta 2 de la AFP. Consulta con tu AFP o asesor financiero las condiciones específicas." }
      },
      {
        "@type": "Question",
        "name": "¿Qué subsidio habitacional me conviene en Chile?",
        "acceptedAnswer": { "@type": "Answer", "text": "Depende de tu ingreso mensual: hasta 25 UF/mes aplica DS19 (180 UF de subsidio, primera vivienda nueva hasta 950 UF); hasta 37 UF/mes aplica DS1 Tramo 1 (130 UF); hasta 60 UF/mes aplica DS1 Tramo 2 (90 UF); hasta 78 UF/mes aplica DS1 Tramo 3 (60 UF). Para todos: FOGAES (pie 10%) y Ley 21.748 (tasa rebajada en vivienda nueva)." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto es el subsidio DS19 en 2026?",
        "acceptedAnswer": { "@type": "Answer", "text": "El subsidio DS19 en 2026 entrega hasta 180 UF (~$6.900.000) de subsidio directo para comprar vivienda social nueva hasta 950 UF (~$36.500.000). Aplica a familias con ingresos hasta 25 UF/mes y sin vivienda previa. Además existe el Bono Pie DS19 de hasta 30 UF adicionales para cubrir la entrada." }
      },
      {
        "@type": "Question",
        "name": "¿Cómo postulo al subsidio habitacional en Chile?",
        "acceptedAnswer": { "@type": "Answer", "text": "Puedes postular en minvu.gob.cl o en la SEREMI de Vivienda de tu región. Los subsidios DS1 se abren por llamado (revisa el calendario Minvu). Para el DS19, necesitas estar inscrito en el Registro Social de Hogares (RSH) y tener cuenta de ahorro con al menos 10-100 UF según el tramo." }
      },
      {
        "@type": "Question",
        "name": "¿Qué es el subsidio a la tasa Ley 21.748?",
        "acceptedAnswer": { "@type": "Answer", "text": "La Ley 21.748 subsidia parte de la tasa de interés del crédito hipotecario. Tu tasa baja ~0.6% los primeros años, lo que reduce el dividendo mensual entre $30.000 y $60.000 dependiendo del monto. Aplica a vivienda nueva hasta 4.000 UF. El banco lo aplica directamente, solo menciona que quieres usarlo." }
      },
      {
        "@type": "Question",
        "name": "¿Conviene arrendar o comprar en Chile en 2026?",
        "acceptedAnswer": { "@type": "Answer", "text": "Depende de tu situación. Comprar conviene si el dividendo es similar o menor al arriendo, planeas quedarte 5 o más años, tienes el pie y buscas estabilidad y patrimonio. Arrendar conviene si necesitas flexibilidad, el dividendo supera el 30% de tu sueldo o aún no tienes el pie. En Chile el arriendo sube con la UF; el dividendo es fijo." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto se paga de arriendo en Santiago en 2026?",
        "acceptedAnswer": { "@type": "Answer", "text": "Un departamento de 50-60 m² en Santiago se arrienda entre $450.000 y $800.000/mes según la comuna. En comunas centrales (Providencia, Ñuñoa) el arriendo promedio supera $600.000. En comunas periféricas puede bajar a $350.000-$450.000. El arriendo se reajusta con la variación del IPC o la UF." }
      },
      {
        "@type": "Question",
        "name": "¿Es mejor comprar o seguir arrendando si el dividendo sería el doble del arriendo?",
        "acceptedAnswer": { "@type": "Answer", "text": "Si el dividendo duplica el arriendo, en el corto plazo arrendar es más conveniente financieramente. Sin embargo, parte del dividendo queda como patrimonio (amortización del capital). El punto de equilibrio suele ser a los 8-15 años. Calcula con la herramienta de Arrendar vs Comprar de cuantocuestaunacasa.cl para tu caso específico." }
      },
      {
        "@type": "Question",
        "name": "¿Cuáles son los pasos para comprar una casa en Chile?",
        "acceptedAnswer": { "@type": "Answer", "text": "El proceso tiene 8 pasos: (1) Ahorrar el pie (10-20%), (2) Pre-aprobación bancaria, (3) Buscar la propiedad y firmar promesa de compraventa, (4) Tasación bancaria, (5) Aprobación formal del crédito, (6) Escritura ante notario, (7) Inscripción en el Conservador de Bienes Raíces, (8) Recibir las llaves. El proceso completo toma 2-3 meses." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto cuestan los gastos notariales al comprar una casa en Chile?",
        "acceptedAnswer": { "@type": "Answer", "text": "Los gastos operacionales suman aproximadamente el 1.5-2.5% del valor de la propiedad e incluyen: tasación (~$150.000-$250.000), gastos notariales (~$200.000-$400.000), inscripción CBR (~$100.000-$300.000) y seguros obligatorios (desgravamen e incendio). Para una vivienda de $100.000.000, considera $1.500.000-$2.500.000 adicionales." }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto tiempo tarda el proceso de compra de una vivienda en Chile?",
        "acceptedAnswer": { "@type": "Answer", "text": "El proceso completo toma entre 2 y 4 meses: negociación y promesa (1-2 semanas), aprobación del crédito bancario (2-4 semanas), firma de escritura (1-2 semanas), inscripción en el CBR (5-10 días hábiles). Si el banco tiene mucha demanda, puede extenderse hasta 3-4 meses." }
      },
      {
        "@type": "Question",
        "name": "¿Qué es la promesa de compraventa?",
        "acceptedAnswer": { "@type": "Answer", "text": "Es un contrato privado o notarial donde el comprador y vendedor se comprometen a realizar la compraventa en una fecha futura. Al firmarlo, se paga una reserva o garantía (1-5% del precio). Si el comprador desiste sin causa, pierde la garantía. Si el vendedor desiste, debe devolver el doble. Es el paso previo a la escritura definitiva." }
      },
      {
        "@type": "Question",
        "name": "¿Qué es la UF y por qué los precios de las casas se expresan en UF?",
        "acceptedAnswer": { "@type": "Answer", "text": "La Unidad de Fomento (UF) es una unidad de cuenta reajustable según el IPC mensual en Chile. Su valor cambia diariamente. Las propiedades se expresan en UF para mantener el valor real en el tiempo, independiente de la inflación. Puedes consultar el valor actual de la UF en el Banco Central o en mindicador.cl." }
      }
    ]
  }
  </script>

  <!-- JSON-LD: BreadcrumbList -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://cuantocuestaunacasa.cl/" },
      { "@type": "ListItem", "position": 2, "name": "Preguntas frecuentes", "item": "https://cuantocuestaunacasa.cl/faq" }
    ]
  }
  </script>
</head>
<body>

  <nav class="site-nav">
    <a href="/" class="nav-logo">¿cuánto cuesta una <em>casa</em>?</a>
    <a href="/" class="nav-link">← Calculadora</a>
  </nav>

  <main>
    <div class="faq-wrap">

      <p class="faq-kicker">GUÍA COMPLETA · 2026</p>
      <h1 class="faq-h1">Preguntas frecuentes sobre comprar <em>casa en Chile</em></h1>
      <p class="faq-intro">30 respuestas sobre crédito hipotecario, subsidios MINVU, precios por región y el proceso de compra.</p>

      <!-- ── CATEGORÍA 1: Precios y regiones ────────────────── -->
      <section class="faq-cat">
        <h2 class="faq-cat-title">Precios y regiones</h2>
        <div class="faq-list">

          <details class="faq-item">
            <summary class="faq-q">¿Cuánto cuesta un departamento en Santiago en 2026? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">En la Región Metropolitana el precio por m² es de ~77 UF para departamentos nuevos (CChC Q3 2025). Un departamento de 55 m² cuesta aproximadamente 4.235 UF (~$163.000.000). Varía mucho según la comuna: Providencia y Las Condes superan los 100 UF/m², mientras que comunas periféricas pueden estar bajo 60 UF/m².</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Cuál es la región más barata para comprar casa en Chile? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">Las regiones con precios por m² más bajos son La Araucanía (36 UF/m²), Ñuble (38 UF/m²) y Aysén (35 UF/m²). Un departamento de 55 m² en Araucanía cuesta ~1.980 UF (~$76.000.000). El dividendo sería de ~$400.000/mes con pie 20% y 25 años.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Cuánto cuesta una casa usada en Chile? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">Las viviendas usadas tienen un descuento promedio de 10-20% respecto a las nuevas. En Santiago, una casa usada de 55 m² está en ~62 UF/m² (~$132.000.000). En regiones intermedias, alrededor de 35-45 UF/m². Los subsidios DS19 y DS1 en algunos tramos no aplican a vivienda usada.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Cuánto vale el metro cuadrado en Valparaíso? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">En la Región de Valparaíso el precio promedio es de 58 UF/m² para departamentos (CChC Q3 2025). Un departamento de 55 m² vale ~3.190 UF (~$122.000.000). El dividendo con pie 20% y 25 años sería de ~$665.000/mes.</p>
          </details>

        </div>
      </section>

      <!-- ── CATEGORÍA 2: Tu sueldo y el crédito ────────────── -->
      <section class="faq-cat">
        <h2 class="faq-cat-title">Tu sueldo y el crédito hipotecario</h2>
        <div class="faq-list">

          <details class="faq-item">
            <summary class="faq-q">¿Puedo comprar una casa con un sueldo de $600.000? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">Con $600.000/mes el banco puede prestarte hasta ~$28.000.000 (30% de esfuerzo, 25 años, tasa 4.1%). Eso alcanza para una vivienda de ~$35.000.000. En regiones como Maule, Araucanía o Biobío hay opciones dentro de ese rango. Además, con ese ingreso (15.6 UF/mes) calificas al subsidio DS19, que descuenta hasta 180 UF del precio.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Cuánto sueldo necesito para comprar una casa en Santiago? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">Un departamento de 55 m² en Santiago cuesta ~4.235 UF (~$163.000.000). Para pagarlo con pie 20% y 25 años, necesitas al menos $1.300.000/mes de sueldo. Con codeudor, los sueldos se suman. También puedes usar subsidio DS1 (hasta 78 UF/mes de ingreso) para reducir el precio efectivo.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Con qué sueldo mínimo puedo pedir un crédito hipotecario en Chile? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">No hay un mínimo fijo, pero el banco exige que el dividendo no supere el 25-30% de tu sueldo. Para un crédito de $50.000.000 a 25 años y 4.1%, el dividendo es ~$268.000/mes, así que necesitarías al menos $900.000 de sueldo. Con subsidio DS19 y precio más bajo, puedes entrar con menos.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Puedo comprar una casa siendo arrendatario? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">Sí. No necesitas tener vivienda propia ni propiedad previa para calificar a un crédito hipotecario (a menos que sea un subsidio que exija primera vivienda). El banco evalúa tu sueldo, historial crediticio y capacidad de pago, no tu situación habitacional actual.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Qué pasa si mi sueldo es informal o a honorarios? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">Puedes pedir un crédito hipotecario siendo independiente o a honorarios, pero el banco pedirá acreditar ingresos: declaración de renta, cotizaciones previsionales, estados de cuenta o un año de historial. Algunos bancos usan el promedio de los últimos 12-24 meses como ingreso base.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Puedo comprar con un codeudor? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">Sí. Con un codeudor (pareja, familiar), los sueldos se suman para calcular el crédito máximo. Ambos quedan como titulares del crédito y la propiedad. Es la forma más común de acceder a viviendas de mayor valor cuando un solo sueldo no alcanza.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Cómo funciona el crédito hipotecario en Chile? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">El banco financia hasta el 80-90% del valor de la propiedad. Tú pones el resto (pie). El crédito se paga en cuotas mensuales fijas (dividendo) durante 15 a 30 años. La tasa promedio en Chile es 4-5% anual en UF. La regla principal es que el dividendo no supere el 25-30% de tu sueldo líquido.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Cuál es la tasa de interés hipotecaria en Chile en 2026? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">En 2026, la tasa promedio para créditos hipotecarios en Chile está entre 3.8% y 5% anual en UF, según el banco y el plazo. La CMF publica las tasas actualizadas mensualmente. Con la Ley 21.748 (subsidio a la tasa), viviendas nuevas hasta 4.000 UF pueden acceder a una rebaja de ~0.6% los primeros años.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Cuánto tiempo dura un crédito hipotecario en Chile? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">El plazo estándar es 20 a 30 años, siendo 25 años el más común. A mayor plazo, menor dividendo mensual, pero pagas más intereses en total. El banco no puede prestar hasta una edad que supere los ~75-80 años del solicitante, por lo que si tienes más de 45-50 años, el plazo disponible se reduce.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Qué es la regla del 30% en créditos hipotecarios? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">Es la regla de esfuerzo financiero. Los bancos en Chile generalmente exigen que el dividendo mensual no supere el 25-30% de tu sueldo líquido total (incluyendo codeudores). Si tu sueldo es $1.000.000, el dividendo máximo aprobable sería ~$300.000/mes.</p>
          </details>

        </div>
      </section>

      <!-- ── CATEGORÍA 3: El pie y el ahorro ────────────────── -->
      <section class="faq-cat">
        <h2 class="faq-cat-title">El pie y el ahorro</h2>
        <div class="faq-list">

          <details class="faq-item">
            <summary class="faq-q">¿Cuánto hay que ahorrar para el pie de una casa en Chile? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">El pie estándar es el 20% del precio de la propiedad. Para una vivienda de $100.000.000, necesitas $20.000.000. Con FOGAES, el mínimo baja al 10% ($10.000.000). Si calificas al DS19, el bono pie puede cubrir hasta 30 UF (~$1.200.000) adicionales.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Qué es FOGAES y cómo funciona? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">El Fondo de Garantía Especial (FOGAES) es un programa del Estado chileno que garantiza el 10% del precio de la vivienda ante el banco, permitiéndote comprar con solo el 10% de pie en vez del 20% estándar. Aplica a viviendas hasta 4.500 UF, no requiere ser primera vivienda y lo tramita el banco automáticamente.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Puedo comprar una casa sin pie en Chile? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">Es muy difícil conseguir financiamiento al 100% en Chile. Con FOGAES el mínimo baja al 10%. Con el subsidio DS19 más el Bono Pie DS19, el aporte propio puede ser muy bajo (el Estado cubre gran parte). Fuera de eso, los bancos generalmente no financian más del 90% del valor.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Puedo usar mis ahorros del APV para el pie? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">Sí. El Ahorro Previsional Voluntario (APV) puede retirarse anticipadamente para comprar primera vivienda, con ciertas condiciones tributarias. También puedes usar la Cuenta 2 de la AFP. Consulta con tu AFP o asesor financiero las condiciones específicas.</p>
          </details>

        </div>
      </section>

      <!-- ── CATEGORÍA 4: Subsidios MINVU ───────────────────── -->
      <section class="faq-cat">
        <h2 class="faq-cat-title">Subsidios MINVU</h2>
        <div class="faq-list">

          <details class="faq-item">
            <summary class="faq-q">¿Qué subsidio habitacional me conviene en Chile? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">Depende de tu ingreso mensual: hasta 25 UF/mes aplica DS19 (180 UF de subsidio, primera vivienda nueva hasta 950 UF); hasta 37 UF/mes aplica DS1 Tramo 1 (130 UF); hasta 60 UF/mes aplica DS1 Tramo 2 (90 UF); hasta 78 UF/mes aplica DS1 Tramo 3 (60 UF). Para todos: FOGAES (pie 10%) y Ley 21.748 (tasa rebajada en vivienda nueva).</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Cuánto es el subsidio DS19 en 2026? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">El subsidio DS19 en 2026 entrega hasta 180 UF (~$6.900.000) de subsidio directo para comprar vivienda social nueva hasta 950 UF (~$36.500.000). Aplica a familias con ingresos hasta 25 UF/mes y sin vivienda previa. Además existe el Bono Pie DS19 de hasta 30 UF adicionales para cubrir la entrada.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Cómo postulo al subsidio habitacional en Chile? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">Puedes postular en minvu.gob.cl o en la SEREMI de Vivienda de tu región. Los subsidios DS1 se abren por llamado (revisa el calendario Minvu). Para el DS19, necesitas estar inscrito en el Registro Social de Hogares (RSH) y tener cuenta de ahorro con al menos 10-100 UF según el tramo.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Qué es el subsidio a la tasa Ley 21.748? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">La Ley 21.748 subsidia parte de la tasa de interés del crédito hipotecario. Tu tasa baja ~0.6% los primeros años, lo que reduce el dividendo mensual entre $30.000 y $60.000 dependiendo del monto. Aplica a vivienda nueva hasta 4.000 UF. El banco lo aplica directamente, solo menciona que quieres usarlo.</p>
          </details>

        </div>
      </section>

      <!-- ── CATEGORÍA 5: Proceso y decisión ───────────────── -->
      <section class="faq-cat">
        <h2 class="faq-cat-title">Proceso de compra y decisión arrendar vs comprar</h2>
        <div class="faq-list">

          <details class="faq-item">
            <summary class="faq-q">¿Conviene arrendar o comprar en Chile en 2026? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">Depende de tu situación. Comprar conviene si el dividendo es similar o menor al arriendo, planeas quedarte 5 o más años, tienes el pie y buscas estabilidad y patrimonio. Arrendar conviene si necesitas flexibilidad, el dividendo supera el 30% de tu sueldo o aún no tienes el pie. En Chile el arriendo sube con la UF; el dividendo es fijo.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Cuánto se paga de arriendo en Santiago en 2026? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">Un departamento de 50-60 m² en Santiago se arrienda entre $450.000 y $800.000/mes según la comuna. En comunas centrales (Providencia, Ñuñoa) el arriendo promedio supera $600.000. En comunas periféricas puede bajar a $350.000-$450.000. El arriendo se reajusta con la variación del IPC o la UF.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Es mejor comprar o seguir arrendando si el dividendo sería el doble del arriendo? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">Si el dividendo duplica el arriendo, en el corto plazo arrendar es más conveniente financieramente. Sin embargo, parte del dividendo queda como patrimonio (amortización del capital). El punto de equilibrio suele ser a los 8-15 años. Calcula con la herramienta de Arrendar vs Comprar de cuantocuestaunacasa.cl para tu caso específico.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Cuáles son los pasos para comprar una casa en Chile? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">El proceso tiene 8 pasos: (1) Ahorrar el pie (10-20%), (2) Pre-aprobación bancaria, (3) Buscar la propiedad y firmar promesa de compraventa, (4) Tasación bancaria, (5) Aprobación formal del crédito, (6) Escritura ante notario, (7) Inscripción en el Conservador de Bienes Raíces, (8) Recibir las llaves. El proceso completo toma 2-3 meses.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Cuánto cuestan los gastos notariales al comprar una casa en Chile? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">Los gastos operacionales suman aproximadamente el 1.5-2.5% del valor de la propiedad e incluyen: tasación (~$150.000-$250.000), gastos notariales (~$200.000-$400.000), inscripción CBR (~$100.000-$300.000) y seguros obligatorios (desgravamen e incendio). Para una vivienda de $100.000.000, considera $1.500.000-$2.500.000 adicionales.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Cuánto tiempo tarda el proceso de compra de una vivienda en Chile? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">El proceso completo toma entre 2 y 4 meses: negociación y promesa (1-2 semanas), aprobación del crédito bancario (2-4 semanas), firma de escritura (1-2 semanas), inscripción en el CBR (5-10 días hábiles). Si el banco tiene mucha demanda, puede extenderse hasta 3-4 meses.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Qué es la promesa de compraventa? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">Es un contrato privado o notarial donde el comprador y vendedor se comprometen a realizar la compraventa en una fecha futura. Al firmarlo, se paga una reserva o garantía (1-5% del precio). Si el comprador desiste sin causa, pierde la garantía. Si el vendedor desiste, debe devolver el doble. Es el paso previo a la escritura definitiva.</p>
          </details>

          <details class="faq-item">
            <summary class="faq-q">¿Qué es la UF y por qué los precios de las casas se expresan en UF? <span class="faq-chevron">▼</span></summary>
            <p class="faq-a">La Unidad de Fomento (UF) es una unidad de cuenta reajustable según el IPC mensual en Chile. Su valor cambia diariamente. Las propiedades se expresan en UF para mantener el valor real en el tiempo, independiente de la inflación. Puedes consultar el valor actual de la UF en el Banco Central o en mindicador.cl.</p>
          </details>

        </div>
      </section>

      <!-- ── CTA ─────────────────────────────────────────────── -->
      <section class="faq-cta">
        <p class="faq-cta-title">¿Cuánto cuesta una <em>casa</em> con tu sueldo?</p>
        <p class="faq-cta-sub">Ingresa tu sueldo y descubre si puedes comprar vivienda en Chile, qué subsidios te corresponden y cómo se compara con arrendar.</p>
        <a href="/" class="faq-cta-btn">Usar la calculadora gratis →</a>
      </section>

    </div>
  </main>

  <footer class="faq-footer">
    <a href="/privacidad">Política de privacidad</a> &nbsp;·&nbsp;
    <a href="/terminos">Términos de uso</a>
  </footer>

</body>
</html>
```

- [ ] **Step 2: Verificar en el navegador**

```bash
python3 -m http.server 8000 -d public/
```
Abrir `http://localhost:8000/faq.html`:
- El nav muestra el logo + "← Calculadora" como link
- El H1 es visible con el estilo correcto (Fraunces, tamaño grande)
- Los 5 acordeones se expanden al hacer clic
- El chevron rota al abrir
- El CTA al final es visible

- [ ] **Step 3: Verificar que el contenido JSON-LD y HTML son idénticos**

Confirmar que cada pregunta visible en el acordeón tiene su equivalente exacto en el bloque `FAQPage` JSON-LD del `<head>`. Comparar visualmente las primeras 3 preguntas de cada categoría.

- [ ] **Step 4: Validar schemas**

Abrir `http://localhost:8000/faq.html`, copiar el HTML fuente completo y pegarlo en `https://validator.schema.org/`.
Resultado esperado: FAQPage con 30 preguntas y BreadcrumbList con 2 items, sin errores.

- [ ] **Step 5: Commit**

```bash
git add public/faq.html
git commit -m "feat: crear página /faq con 30 Q&As, FAQPage schema y BreadcrumbList"
```

---

## Task 4: Actualizar `public/sitemap.xml` y commit final

**Files:**
- Modify: `public/sitemap.xml`

- [ ] **Step 1: Agregar entrada `/faq`**

En `public/sitemap.xml`, antes de `</urlset>`, agregar:

```xml
  <url>
    <loc>https://cuantocuestaunacasa.cl/faq</loc>
    <lastmod>2026-04-06</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
```

- [ ] **Step 2: Verificar el sitemap**

```bash
python3 -m http.server 8000 -d public/
```
Abrir `http://localhost:8000/sitemap.xml` y confirmar que aparecen 4 URLs: `/`, `/privacidad`, `/terminos` y `/faq`.

- [ ] **Step 3: Smoke test de navegación completa**

Con el servidor corriendo:
1. `http://localhost:8000` — nav muestra "Preguntas frecuentes", clic lleva a `/faq.html`
2. `http://localhost:8000/faq.html` — clic en logo y en "← Calculadora" vuelven a `/`
3. Los acordeones de /faq funcionan sin JS adicional
4. El CTA "Usar la calculadora gratis →" lleva a `/`

- [ ] **Step 4: Commit final**

```bash
git add public/sitemap.xml
git commit -m "seo: agregar /faq al sitemap.xml"
```

---

## Self-review del plan

**Spec coverage:**
- ✅ `public/faq.html` con 30 Q&As visibles en HTML — Task 3
- ✅ `FAQPage` JSON-LD en `/faq` — Task 3
- ✅ `BreadcrumbList` en `/faq` (Home → FAQ) — Task 3
- ✅ `BreadcrumbList` en `/` (Home) — Task 2
- ✅ `HowTo` schema en `/` (8 pasos) — Task 2
- ✅ Link "Preguntas frecuentes" en nav de `/` — Task 2
- ✅ `.nav-link` style — Task 1
- ✅ `sitemap.xml` actualizado — Task 4

**Placeholders:** ninguno — todo el HTML de faq.html está completo y los schemas son exactos.

**Consistencia:** `.nav-link` definida en Task 1 y usada en Task 2 (index.html) y Task 3 (faq.html). `.faq-*` clases definidas inline en faq.html — sin dependencias externas.
