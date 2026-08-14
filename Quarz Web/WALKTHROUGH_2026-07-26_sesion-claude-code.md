# Walkthrough Técnico: QUARZ Web — Hero interactivo (scroll + motion graphics)

**Fecha:** 2026-07-26
**Agente:** Claude Code (Sonnet 5 / Opus 4.8)
**Para:** cualquier sesión/agente que continúe este proyecto

---

## 0. Cómo usar este documento

Este archivo es el punto de entrada para retomar el proyecto sin releer el chat completo. Léelo de arriba a abajo antes de tocar nada. Sección 6 ("Cómo verificar") es obligatoria antes de dar nada por roto o por bueno — el entorno de prueba tiene una trampa conocida (ver 6.2).

---

## 1. Resumen ejecutivo

QUARZ es una landing interactiva (un solo `index.html` de hero + subpáginas) para una empresa que vende un producto/servicio con estética "cuarzo con circuito dorado grabado". El hero central es un scroll de 5 etapas: 1 cuarzo → se abre a 3 → 5 (corona completa), con líneas de circuito doradas que nacen de las puntas de los cristales y llegan a 4 títulos de navegación en las esquinas. Esta sesión:

1. Diagnosticó y arregló bugs reales de scroll/animación heredados de ediciones externas previas (ver sección 5).
2. Construyó un flujo completo de "subpáginas + selección estilo videojuego" (4 páginas nuevas + overlay de video de transición) — **que el usuario pidió revertir por completo** tras verlo. Se revirtió 100%; hoy NO existe en el proyecto, pero el código y los aprendizajes quedan documentados en la sección 4 por si se retoma.
3. Integró 2 motion graphics (vídeo) en el hero principal, con una secuencia de aparición encadenada y descarte automático al hacer scroll. Esto **sí sigue vivo** en el proyecto ahora mismo.

**Estado actual (lo único que importa si vas a seguir trabajando):** el hero principal (`index.html`) tiene scroll de 5 etapas + líneas de circuito + 2 motion graphics de vídeo. Las 4 subpáginas NO existen (fueron revertidas). Dos de los 4 links de navegación (`title-ll`, `title-lr`) son placeholders `#b2c` / `#partners` sin página real detrás.

---

## 2. Rutas — MUY IMPORTANTE, leer antes de tocar nada

### 2.1 Carpeta canónica de trabajo
```
D:\A. Jose Angel\Quarz WEB (local)\Quarz Web\
```
Esta es la carpeta que el usuario quiere como fuente de verdad (lo pidió explícitamente en la sesión anterior a esta).

### 2.2 ⚠️ GOTCHA CRÍTICO: Google Drive borra esta carpeta
Esa ruta cuelga de un árbol sincronizado por Google Drive (`G:\Mi unidad\...`). **Durante esta sesión y la anterior, Drive vació la carpeta por completo varias veces** (archivos a la Papelera, incluida `media/`). Pasó al menos 4 veces en dos sesiones.

**Antes de asumir que algo que escribiste "no se guardó" o que "algo se rompió", verifica primero si la carpeta sigue íntegra:**
```powershell
Get-ChildItem "D:\A. Jose Angel\Quarz WEB (local)\Quarz Web" -File | Select-Object Name, Length
```
Si faltan `index.html`, `style.css`, `script.js` o toda `media/`, restaura desde el backup (sección 2.3) — no lo canónico, esta vez, sino al revés: copia desde el backup C: hacia D:.

**Recomendación pendiente para el usuario** (no resuelta, no es algo que un agente pueda arreglar): pausar la sincronización de Drive sobre esa carpeta, o marcarla "disponible sin conexión" en el cliente de Drive.

### 2.3 Backup espejo (fuera del alcance de Drive)
```
C:\Users\jange\quarz-web-work\
```
Copia de seguridad manual, actualizada cada vez que se edita algo en D:. Si D: se vacía, este es el respaldo para restaurar. **Practica recomendada**: después de cualquier edición en D:, copiar el/los archivo(s) tocado(s) también aquí:
```powershell
$dst='D:\A. Jose Angel\Quarz WEB (local)\Quarz Web'; $work='C:\Users\jange\quarz-web-work'
foreach ($f in 'index.html','style.css','script.js') { Copy-Item (Join-Path $dst $f) (Join-Path $work $f) -Force }
```

### 2.4 Carpeta de recursos fuente (renders 3D, videos, logos)
```
D:\A. Jose Angel\Quarz WEB (local)\Logos & Contenido\Visual_3D\
```
Aquí viven los renders/videos originales antes de copiarlos a `Quarz Web\media\`. Subcarpetas relevantes:
- `Update de media para la web\Videos v4\` — los 4 vídeos de despliegue de cuarzos (1→3, 3→5, y sus loops) en **1024×1024, SIN destello dorado en el suelo** (versión limpia; hay una v_anterior con destello, no usarla). Los frames actuales del canvas (`media/frames/phase1|phase2`) vienen de re-extraer estos videos v4 con ffmpeg, 56 frames equiespaciados por fase.
- `Update de media para la web\V1 Cuarzos_secciones\cuarzo_<seccion>\compresion_<seccion>.mp4/.webm(+loop)` — 4 vídeos de "compresión + parpadeo" de la corona, uno por sección (`soluciones_para_empresas`, `metodologia_de_trabajo`, `producto_b2c`, `hub_de_partners`). Se usaron para el sistema de selección de subpáginas que fue revertido (sección 4). **Ya NO están copiados en `Quarz Web\media\`** (se borraron en la reversión); si se retoma esa idea, hay que volver a copiarlos desde aquí.
- `media_web\5_elementos_retro_qz\` — motion graphics estilo "retro/terminal":
  - `cuarzo_naciendo\cuarzo_naciendo_motion.mp4/.webm` (+ `_loop.mp4`) — 800×800, 5s/300f, cuarzo apareciendo en ASCII-art dorado sobre fondo blanco. **Ya integrado** en el hero (ver sección 3).
  - `texto_terminal_web_hero\texto_manifesto_terminal.mp4/.webm` (+ `_loop.mp4`) — 850×420, 8s/480f, texto tipo terminal con frases del manifiesto de la marca. **Ya integrado** en el hero.
  - `pruebas_retro\` — **motion graphics disponibles pero NO integrados todavía**: `hud_telemetria_quarz.mp4/webm(+loop)`, `nodo_red_networking.mp4/webm(+loop)`, `cuarzo_creandose_retro.mp4/webm(+loop)`. Material candidato para futuras secciones/subpáginas.
- `Guia visual para diseño web\` — capturas de referencia del diseño original (7 imágenes `Captura de pantalla 2026-07-23 12*.png`) que marcan el objetivo visual del hero (usadas para iterar el layout en sesiones previas).
- `Guia visual para diseño web\scratchs_code\oportunidad.html` — un borrador HTML con contenido ya redactado por el usuario (radar de perfiles "¿Para quiénes es esta oportunidad?", mecánica de trabajo, plan de carrera). Es contenido de negocio real, no inventado por IA. Se usó y luego se revirtió (sección 4); sigue existiendo ahí como fuente si se quiere reincorporar.

### 2.5 ⚠️ Trabajo concurrente de otra herramienta en la misma carpeta
Durante esta sesión aparecieron en `Quarz Web\` y `Quarz Web\media\` archivos que **esta sesión no creó**:
- `_server.js` (raíz del proyecto)
- `WALKTHROUGH_Antigravity_Setup.md` (raíz — **archivo corrupto, todo bytes nulos**, no sirve como referencia)
- `media\1era seccion web.jpg`, `media\cuarzo_despliegue_veo.mp4`, `media\cuarzo.mp4`, `media\cuarzoclic.jpeg/png`, `media\cuarzocrack.jpeg`, `media\cuarzos-cinta-foto.mp4`
- `media\logos\BANK*.png`, `BBVA.png`, `CORP.png`, `HOTEL*.png`, `LOGO_NIHM.png`, `REST*.png`, `UNI*.png` (logos de clientes/casos de uso, ajenos al branding de QUARZ)

El nombre "Antigravity" sugiere otra herramienta de IA/otra sesión trabajando en paralelo sobre la misma carpeta. **Antes de editar, revisa si estos archivos han cambiado o si hay más nuevos** — puede haber conflictos de edición simultánea. No se tocaron ni se referenciaron desde el código de esta sesión.

---

## 3. Estado actual del hero principal (`index.html`) — lo que SÍ existe hoy

### 3.1 Stack técnico
- HTML/CSS/JS vanilla, sin build step, sin dependencias npm.
- GSAP 3.12.5 + ScrollTrigger (CDN) para animaciones.
- Lenis 1.0.29 (CDN) para scroll suavizado.
- Fuente `Space Grotesk` (Google Fonts) para toda la tipografía.
- Paleta: fondo `#ffffff`/`#fdfdfd`, texto `#111111`, dorado circuito `#c2be9f` (hover `#a8a380`), acento lima `#a6ff00` (poco usado).

### 3.2 Estructura de `index.html`
```
.stage (position:fixed, 100vh, contiene todo el hero)
 ├── header#main-header > img.brand-logo (QUARZ_Logo_Principal_alpha.png — logo con transparencia real)
 ├── .quartz-wrapper > canvas#quartz-canvas (1024×1024) — aquí se dibuja cada frame del scrubbing
 ├── svg#circuit-svg — 4 grupos (group-ul/ur/ll/lr), cada uno con:
 │     path.circuit-path (línea dorada) + 2 circle.circuit-node (nodo inicio/fin)
 ├── video#mg-left, video#mg-right — los 2 motion graphics (ver 3.4)
 └── 4× a.title-label (title-ul, title-ur, title-ll, title-lr) — los títulos de navegación
.scroll-track (400vh, genera el scroll — .stage es fixed y no se mueve, esto es lo que da scroll real a la página)
```

### 3.3 El scroll de 5 etapas (motor: `script.js`, función `initScrollTimeline()`)
- **Frames**: 56 imágenes JPG por fase en `media/frames/phase1/f_001.jpg`...`f_056.jpg` y `phase2/` igual. Se precargan todas al cargar la página (`preloadFrames()`), y `drawFrame(phase, progress)` dibuja el frame correspondiente en el `<canvas>` según el progreso de scroll (0..1 → índice de frame).
- **Timeline maestro** (`masterTL`, GSAP, `scrollTrigger: { trigger: ".scroll-track", scrub: 1.2 }`):
  - 0%–25%: `drawFrame(1, progress)` — cuarzo único se abre a 3 cuarzos (phase1).
  - 25%–50%: se revelan 2 nodos + 2 líneas de circuito superiores (`line-ul`, `line-ur`) + títulos superiores.
  - 50%–75%: `drawFrame(2, progress)` — 3 cuarzos se abren a 5 (corona completa) (phase2).
  - 75%–100%: se revelan 2 nodos + 2 líneas inferiores (`line-ll`, `line-lr`) + títulos inferiores.
- **Líneas de circuito** (`updateCircuitPaths()`): cada línea nace en la punta de un cristal específico (coordenadas normalizadas 0..1 dentro del canvas 1024×1024, comentadas en el propio código: cuarzo interior izq/der para las líneas superiores, exterior izq/der para las inferiores), sube/baja por un "canal" vertical en el margen, y termina en un nodo justo al lado del título correspondiente. Se recalcula en cada `resize` + `ScrollTrigger.refresh()`.
  - **Nota de diseño ya decidida por el usuario en esta sesión**: los nodos (círculos dorados en los extremos de cada línea) fueron pedidos explícitamente por el usuario en un punto ("líneas SIN nodos, elimínalos") y luego una edición externa (la del punto 2.5, probablemente "Antigravity") los **reintrodujo** con este sistema de nacer-en-la-punta-del-cristal. El estado actual (con nodos naciendo en las puntas) es el que quedó vigente cuando el usuario pidió los motion graphics; no se tocó ni se cuestionó en esta sesión. Si el usuario vuelve a quejarse de los nodos, esto es el porqué.

### 3.4 Motion graphics del hero — LO ÚLTIMO QUE SE HIZO EN ESTA SESIÓN

Dos `<video>` (silenciosos, `muted playsinline`, con fuente `.webm` + fallback `.mp4`) posicionados en `position:absolute` sobre el hero, con `mix-blend-mode: multiply` (ambos vídeos tienen fondo blanco; el blend los funde con la página sin caja visible).

**`#mg-left`** — `media/videos/texto_manifesto_terminal.webm/mp4` — manifiesto en texto de terminal.
```css
#mg-left { left: 2vw; top: 19vh; width: 34vw; aspect-ratio: 850/420; height: auto; }
```

**`#mg-right`** — `media/videos/cuarzo_naciendo_motion.webm/mp4` — "Desliza hacia abajo" + cuarzo ASCII naciendo.
```css
#mg-right { right: 2vw; bottom: 5vh; width: 30vw; aspect-ratio: 1/1; height: auto; top: auto; }
```
(El usuario pidió que este fuera "bastante más grande" que el ajuste inicial porque su contenido tiene mucho aire alrededor y no se leía pequeño — de ahí `width: 30vw` anclado a la esquina inferior derecha en vez de una caja intermedia fija.)

**Secuencia (código en `script.js`, buscar `revealHeroMotion`, `showSecondMotion`, `dismissHeroMotion`):**
1. Al terminar la animación de intro (logo + cuarzo entrando), se llama `revealHeroMotion()`: reproduce y hace fade-in de `mg-left` (el terminal).
2. Cuando `mg-left` dispara su evento `ended` (termina de reproducirse, ~8s), se llama `showSecondMotion()`: reproduce y hace fade-in de `mg-right` (el "desliza"). Hay una red de seguridad por `setTimeout` (duración del vídeo + 600ms) por si el evento `ended` no llegara a disparar.
3. **Descarte**: en cuanto el usuario hace scroll (por rueda, touch, teclas de flecha/page/espacio, o el propio evento de scroll de Lenis), `dismissHeroMotion()` mata cualquier tween en curso y hace fade-out + `display:none` + `pause()` de AMBOS vídeos, sin importar en qué punto de la secuencia estén (incluso si el scroll ocurre ANTES de que lleguen a aparecer, en cuyo caso `heroMotionDismissed=true` bloquea que `revealHeroMotion`/`showSecondMotion` hagan nada).

**⚠️ Detalle NO resuelto / a vigilar**: el usuario reportó en un punto que las asignaciones vídeo↔caja estaban "al revés" respecto a lo que él mismo había pedido por escrito en el mensaje anterior — y su propia captura de referencia (con las proporciones dibujadas a mano) confirmaba que el intercambio era correcto. Se corrigió intercambiando qué vídeo va en `mg-left` vs `mg-right` (el HTML de arriba ya refleja el estado corregido y confirmado). Si en el futuro parece que están de nuevo cambiados, comparar contra la típica proporción: terminal = apaisado (850×420), "desliza" = cuadrado (800×800).

### 3.5 Navegación (4 títulos, esquinas)
```html
<a href="soluciones.html" id="title-ul">SOLUCIONES PARA EMPRESAS</a>   <!-- arriba-izquierda -->
<a href="oportunidad.html" id="title-ur">METODOLOGÍA DE TRABAJO</a>    <!-- arriba-derecha -->
<a href="#b2c" id="title-ll">PRODUCTO B2C</a>                          <!-- abajo-izquierda: PLACEHOLDER, no hay página -->
<a href="#partners" id="title-lr">HUB DE PARTNERS</a>                  <!-- abajo-derecha: PLACEHOLDER, no hay página -->
```
`soluciones.html` y `oportunidad.html` **no existen actualmente** en `Quarz Web\` (se crearon y luego se borraron en la reversión de la sección 4). Estos 2 links están rotos ahora mismo hasta que se recreen esas páginas o se cambien los hrefs.

---

## 4. Historia relevante: sistema de subpáginas + selección (CONSTRUIDO Y LUEGO REVERTIDO)

Esto **no existe hoy en el proyecto**, pero se documenta porque (a) el usuario podría pedirlo de nuevo, y (b) contiene aprendizajes técnicos reales que costó descubrir.

### 4.1 Qué se construyó
- **Overlay de selección en `index.html`**: al hacer clic en un título de esquina, este titilaba (flash dorado/lima) y se mostraba un `<video>` fullscreen reproduciendo `compresion_<seccion>.mp4` (los 4 vídeos de "compresión de corona" de la sección 2.4) antes de navegar. Con fallback por `setTimeout` de 2.6s para garantizar la navegación aunque el vídeo fallara.
- **4 subpáginas**: `soluciones.html`, `metodologia.html`, `producto-b2c.html`, `oportunidad.html` — todas compartiendo un "hero" reutilizable (`subpage.css` + `subpage.js`, función `initSubHero()`): título + logo con flecha (`>` si el logo va a la derecha, `<` si va a la izquierda) + línea de circuito (horizontal bajo el header + caída vertical) + un cuarzo de esquina recortado (con transparencia real, extraído con Pillow de un cristal individual de la corona v4) que se desliza al entrar. El lado del hero se decidía según de qué esquina venía el link en el index (izquierda→hero con logo a la derecha, y viceversa).
- **`producto-b2c.html`** tenía un patrón especial: radar "HAGA CLIC" con círculos concéntricos pulsantes; al clicar, el radar se desvanecía y el cuarzo se revelaba (`data-manual-reveal` + función `revealQuartz()` expuesta por `initSubHero`).
- **`oportunidad.html`** reemplazaba el `<nav>` genérico del borrador del usuario (sección 2.4) por el hero compartido, pero **conservaba intacto** todo el contenido de negocio (radar de perfiles, mecánica de trabajo, plan de carrera) tal cual lo redactó el usuario. Se reasignó a "HUB DE PARTNERS" en vez de "METODOLOGÍA DE TRABAJO" porque el contenido (contratos, ecosistema, plan de carrera) encajaba temáticamente mejor ahí — **esta reasignación no fue confirmada explícitamente por el usuario**, quedó como decisión de la sesión.

### 4.2 Bug real encontrado y su fix (aplica también si se reconstruye algo similar)
El listener de `window.addEventListener("resize", layout)` en `subpage.js` recalculaba la geometría de la línea de circuito Y **reseteaba `strokeDashoffset` a la longitud total** en cada resize — incluido un resize que el propio navegador dispara poco después de cargar (p. ej. al reajustar la barra de la extensión). Esto dejaba la línea invisible para siempre tras la carga, aunque la animación de entrada hubiera terminado bien.
**Fix aplicado**: una bandera `drawn` que solo fuerza `strokeDashoffset = len` (oculto) en el layout INICIAL; en recálculos posteriores por resize, mantiene `strokeDashoffset: 0` (visible). Ver si el código de `script.js` actual (sección 3.3, líneas de circuito del index) tiene el mismo patrón de riesgo — ahí NO se corrigió porque el `scrub` de ScrollTrigger recalcula continuamente y se autocorrige solo; pero si alguna vez se cambia esa lógica a una animación "de una sola vez" (no scrub), aplicar el mismo fix.

### 4.3 Por qué se revirtió
El usuario probó el resultado y respondió: *"las modificaciones no han sido de mi agrado me gustaría que vuelvas a como estaba previamente y elimines lo generado"* — sin más detalle sobre qué específicamente no le gustó. Se revirtieron `index.html`/`style.css`/`script.js` a su contenido exacto previo, y se eliminaron todos los archivos nuevos (`subpage.css`, `subpage.js`, las 4 páginas, los 2 PNG de cuarzo de esquina, la carpeta `media/videos/selection/` con los 4 vídeos de compresión).

**Si se retoma esta idea**: antes de reconstruir igual, vale la pena preguntar al usuario qué específicamente no le convenció (¿el timing de la selección? ¿el aspecto de las subpáginas? ¿el contenido placeholder "Contenido en construcción"? ¿la reasignación de oportunidad.html a HUB DE PARTNERS?) en vez de asumir.

---

## 5. Bugs reales encontrados y corregidos en el hero principal (siguen vigentes, ya arreglados)

1. **Scroll completamente muerto** — `html, body { height: 100% }` recortaba el documento a la altura del viewport, anulando el scroll que genera `.scroll-track` (400vh). Fix: `min-height: 100%` en vez de `height: 100%`. Verificado: `maxScroll` pasó de 0 a >2900px.
2. **Cuarzo descentrado / recortado** — la animación de entrada de GSAP sobre `.quartz-wrapper` (que usaba `translate(-50%,-50%)` para centrar) se veía anulada al animar `y`. Fix: wrapper con `inset:0` + flex-center, entrada limpia solo con `translateY`.
3. **Destello dorado no deseado en el suelo del render** — resuelto de raíz usando los vídeos "v4" (sección 2.4), que no tienen ese artefacto, en vez de intentar limpiarlo por procesamiento de imagen (que se probó primero con Pillow y se descartó al encontrar la fuente limpia).
4. **Logo con caja blanca visible** — el PNG del logo no tenía transparencia real (fondo casi-blanco `RGB(253,253,253)`). Se generó `QUARZ_Logo_Principal_alpha.png` con Pillow (alfa derivado de la luminosidad, texto negro `#111`) — este es el que usa `index.html` hoy.

---

## 6. Cómo verificar cambios en este proyecto

### 6.1 Levantar el servidor local
No hay build ni `npm install`. Es un servidor Node estático mínimo (sin dependencias) que sirve `Quarz Web\` en `http://localhost:8123`. El script vivía en el directorio de scratchpad de la sesión anterior (**efímero, no existe en una sesión nueva** — recréalo):

```js
// guardar como quarz-server.js en cualquier ruta persistente, p.ej. dentro de Quarz Web\ mismo
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = 'D:\\A. Jose Angel\\Quarz WEB (local)\\Quarz Web';
const PORT = 8123;
const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.mp4':'video/mp4', '.webm':'video/webm', '.svg':'image/svg+xml' };
http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(ROOT, urlPath);
  if (!path.resolve(filePath).startsWith(path.resolve(ROOT))) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found: ' + urlPath); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log('QUARZ dev server on http://localhost:' + PORT));
```
Ejecutar con `node quarz-server.js` en background, luego abrir `http://localhost:8123/index.html`.

**Nota**: en esta sesión, el servidor fue detenido repetidas veces por una fuerza externa (probablemente la herramienta "Antigravity" del punto 2.5, o el propio usuario vía `/remote-control`). Si se detiene solo tras un rato, no es un bug del servidor — algo más está gestionando ese puerto/proceso.

### 6.2 ⚠️ TRAMPA: la pestaña de automatización del navegador no reproduce vídeo ni corre rAF en segundo plano
Si usas Chrome-en-automatización (MCP `claude-in-chrome`) para verificar: **Chrome pausa `requestAnimationFrame` y la decodificación de vídeo en pestañas que no tienen foco real del sistema operativo**. Síntomas que esto causa (no son bugs del código):
- Animaciones GSAP se quedan "a medias" indefinidamente.
- `<video>.readyState` se queda en `0` para siempre, `currentTime` no avanza.
- Screenshots tomados justo tras cargar muestran solo una parte de la animación de entrada.

**Cómo verificar de todas formas:**
- Para lógica GSAP: forzar `timeline.progress(1)` (salta al final, dispara `onComplete`) y leer el DOM/computed style después — no depende de rAF real.
- Para simular eventos (scroll, resize, fin de vídeo): `window.dispatchEvent(new Event('resize'))`, `video.dispatchEvent(new Event('ended'))`, `gsap.getTweensOf(el).forEach(t=>t.progress(1))`.
- Para verificar encuadre/posición de un `<video>` sin poder verlo reproducir: extraer un frame de muestra con `ffmpeg -ss <t> -i video.mp4 -frames:v 1 out.jpg`, e inyectar temporalmente un `<img>` con ese frame en las mismas coordenadas/tamaño computados del `<video>` real (`getBoundingClientRect()` + `getComputedStyle()`), tomar el screenshot, y luego **borrar el archivo temporal** — no dejar basura en `media/`.
- Abrir una pestaña NUEVA (`tabs_create_mcp`) para cada verificación da un compositor limpio; reutilizar una pestaña vieja a veces arrastra fotogramas fantasma de tamaños de ventana anteriores.
- Si tras cerrar pestañas queda solo 1 en el grupo, el grupo se re-crea con un ID nuevo — hay que volver a llamar `tabs_context_mcp`.

### 6.3 Utilidades de imagen disponibles en el entorno
- **ffmpeg / ffprobe**: instalados vía winget, en PATH (`ffmpeg -version` funciona directo).
- **Python + Pillow (PIL) 12.2.0**: vía el comando `py` (no `python`). Usado para: generar el logo con transparencia real, recortar/limpiar un cristal individual de la corona con alfa por luminosidad.
- **ImageMagick**: NO instalado (`magick` no encontrado); `convert.exe` que existe es el de Windows (conversión de sistemas de archivos), no ImageMagick — no usar para imágenes.

---

## 7. Decisiones pendientes / preguntas abiertas para el usuario

Cosas que un agente que continúe **no debería asumir por su cuenta**, sino preguntar:

1. ¿Se retoma el sistema de subpáginas + selección (sección 4), con qué cambios respecto a lo que no le gustó? (No se sabe qué específicamente falló a sus ojos.)
2. Los links `PRODUCTO B2C` (`#b2c`) y `HUB DE PARTNERS` (`#partners`) están rotos ahora mismo (placeholders `#`). ¿Recrear `soluciones.html`/`oportunidad.html`, o dejarlos como placeholder mientras se decide el contenido?
3. La reasignación de `oportunidad.html` (contenido del usuario) a "HUB DE PARTNERS" en vez de "METODOLOGÍA DE TRABAJO" fue una inferencia de la sesión anterior, nunca confirmada explícitamente.
4. Los motion graphics "retro" no usados (`hud_telemetria`, `nodo_red_networking`, `cuarzo_creandose_retro` — sección 2.4) están disponibles: ¿tienen un destino pensado?
5. Confirmar con el usuario si sigue usando Google Drive para sincronizar esta carpeta — mientras lo haga, el riesgo de borrado accidental (sección 2.2) sigue activo en cada sesión.
6. Aclarar con el usuario qué es la herramienta/archivo "Antigravity" (sección 2.5) que edita la misma carpeta en paralelo, para evitar pisarse el trabajo mutuamente.

---

## 8. Inventario rápido de archivos vivos (para copiar/pegar en el próximo prompt si hace falta)

```
D:\A. Jose Angel\Quarz WEB (local)\Quarz Web\
├── index.html          (3996 B — hero: canvas scroll + circuito + motion graphics + 4 links de nav)
├── style.css           (5428 B)
├── script.js           (14142 B)
├── _server.js          (ajeno a esta sesión, no tocar sin confirmar su propósito)
├── WALKTHROUGH_Antigravity_Setup.md   (corrupto, ignorar)
├── WALKTHROUGH_2026-07-26_sesion-claude-code.md   (este archivo)
└── media\
    ├── frames\phase1\f_001..056.jpg   (corona 1→3 cuarzos, 1024×1024, sin destello)
    ├── frames\phase2\f_001..056.jpg   (corona 3→5 cuarzos, 1024×1024, sin destello)
    ├── logos\QUARZ_Logo_Principal_alpha.png   (logo con transparencia real — el que usa index.html)
    ├── logos\ (+ variantes de color + logos de clientes ajenos, ver 2.5)
    ├── videos\texto_manifesto_terminal.mp4/webm   (motion graphic izquierda)
    ├── videos\cuarzo_naciendo_motion.mp4/webm     (motion graphic derecha)
    ├── videos\despliegue_cuarzos_*.mp4/webm       (sin usar actualmente, vestigio de una versión anterior del canvas)
    └── images\ + otros sueltos (ver sección "media" del inventario completo arriba)

C:\Users\jange\quarz-web-work\   (espejo/backup — mismo index.html/style.css/script.js)
```

---

**Fin del walkthrough. Próxima sesión: leer este archivo completo antes de tocar código.**
