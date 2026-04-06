# SEO Visibilidad — Rich Snippets

**Fecha:** 2026-04-06  
**Proyecto:** cuantocuestaunacasa.cl  
**Objetivo:** Aparecer en Google con rich snippets (FAQs expandibles, HowTo, Breadcrumbs) para búsquedas transaccionales e informativas sobre compra de vivienda en Chile.

---

## Contexto

El sitio ya cuenta con:
- `SoftwareApplication` schema en `<head>`
- `WebSite` schema con `SearchAction` (Sitelinks searchbox)
- `FAQPage` JSON-LD en `index.html` con 27 preguntas
- `faq-schema.json` con el contenido completo de las preguntas

**Problema:** El `FAQPage` schema existe pero las preguntas no son visibles en HTML. Google requiere que el contenido del schema esté presente como texto visible en la página para mostrar FAQ rich results. Actualmente no hay FAQ rich snippets activos.

---

## Arquitectura

3 cambios sobre la infraestructura existente (Netlify, `publish = "public"`):

| Archivo | Acción |
|---|---|
| `public/faq.html` | Crear — nueva página FAQ |
| `public/index.html` | Modificar — agregar HowTo schema, BreadcrumbList, link a /faq |
| `public/sitemap.xml` | Modificar — agregar entrada `/faq` |

---

## Componente 1: `public/faq.html`

### Estructura HTML

```
<nav>  logo + "← Volver a la calculadora" (link a /)
<main>
  <h1> Preguntas frecuentes sobre comprar casa en Chile
  <p>  Subtítulo editorial
  <section> × 5 categorías, cada una con <h2> + acordeón <details>/<summary>
  <section> CTA → link a la calculadora
<footer> links privacidad / términos
```

### Categorías de preguntas (27 Q&As de `faq-schema.json`)

1. **Precios y regiones** — precios por m², Santiago, regiones más baratas, vivienda usada
2. **Crédito hipotecario** — tasa, plazo, regla del 30%, honorarios, codeudor
3. **El pie y el ahorro** — cuánto ahorrar, FOGAES, APV, comprar sin pie
4. **Subsidios MINVU** — DS49, DS1 T1/T2/T3, FOGAES, Ley 21.748, cómo postular
5. **Proceso y decisión** — 8 pasos de compra, gastos notariales, arrendar vs comprar

### Acordeón

Usa `<details>/<summary>` nativos, mismo patrón visual que `seccion-empleos.html`. Sin JS adicional.

### Schemas en `/faq`

**FAQPage** (JSON-LD en `<head>`):
- Todas las 27 preguntas con sus respuestas completas
- Contenido idéntico al visible en HTML (requisito Google)

**BreadcrumbList** (JSON-LD en `<head>`):
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://cuantocuestaunacasa.cl/" },
    { "@type": "ListItem", "position": 2, "name": "Preguntas frecuentes", "item": "https://cuantocuestaunacasa.cl/faq" }
  ]
}
```

### SEO on-page de `/faq`

- `<title>`: `Preguntas frecuentes sobre crédito hipotecario y subsidios Chile 2026`
- `<meta description>`: `Respuestas a las 27 preguntas más frecuentes sobre comprar vivienda en Chile: precios, subsidios DS1/DS49, crédito hipotecario, pie, FOGAES y más.`
- `<link rel="canonical">`: `https://cuantocuestaunacasa.cl/faq`
- `<link rel="alternate" hreflang="es-CL">`: apunta a la misma URL

---

## Componente 2: Cambios en `public/index.html`

### HowTo schema (nuevo JSON-LD en `<head>`)

```json
{
  "@type": "HowTo",
  "name": "Cómo comprar una casa en Chile",
  "description": "Los 8 pasos del proceso de compra de vivienda en Chile, desde el ahorro del pie hasta recibir las llaves.",
  "step": [
    { "name": "Ahorrar el pie (10-20%)" },
    { "name": "Pre-aprobación bancaria" },
    { "name": "Buscar propiedad y firmar promesa de compraventa" },
    { "name": "Tasación bancaria" },
    { "name": "Aprobación formal del crédito" },
    { "name": "Escritura ante notario" },
    { "name": "Inscripción en el Conservador de Bienes Raíces" },
    { "name": "Recibir las llaves" }
  ]
}
```

### BreadcrumbList (nuevo JSON-LD en `<head>`)

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://cuantocuestaunacasa.cl/" }
  ]
}
```

### Link al FAQ en nav

En el `<nav>` existente, a la derecha del chip de UF:
```html
<a href="/faq" class="nav-faq-link">Preguntas frecuentes</a>
```
Estilo: mismo peso visual que el chip de UF, sin romper el layout actual.

---

## Componente 3: `public/sitemap.xml`

Agregar entrada:

```xml
<url>
  <loc>https://cuantocuestaunacasa.cl/faq</loc>
  <lastmod>2026-04-06</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

---

## Criterios de éxito

- Google Search Console muestra `/faq` indexada en < 2 semanas tras deploy
- FAQ rich results visibles en Google para al menos 3 queries de la lista de preguntas
- HowTo snippet aparece para "cómo comprar casa Chile" o variantes
- Sin errores de schema en Google Rich Results Test
- El link "Preguntas frecuentes" aparece en el nav en todas las pantallas

---

## Fuera de alcance

- Landing pages por región (Opción C — queda para iteración futura)
- Calculadora interactiva en SERP (requiere elegibilidad especial de Google)
- Traducción o versiones en otros idiomas
