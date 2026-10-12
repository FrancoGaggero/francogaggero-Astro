# Franco Gaggero — Portfolio

Portfolio personal construido con **Astro 5 + Tailwind**, bilingüe (ES `/` · EN `/en/`).

## Destacados
- **Hero WebGL** (`src/scripts/particles.ts`, three.js): ~11k partículas que forman "FG" y reaccionan al mouse/scroll. Fallback estático con `prefers-reduced-motion` o sin WebGL.
- **Terminal interactiva** (`src/scripts/terminal.ts`): comandos `help`, `skills`, `projects`, `experience`, `contact`, `sudo hire-me`…
- **Esfera 3D de tecnologías** (`src/scripts/tech-sphere.ts`) + marquees por categoría (`src/components/Stack.astro`, datos en `src/data/stack.ts`, logos de `simple-icons` en build).
- **Timeline `git log`** dibujado con el scroll (`src/components/Timeline.astro`, datos en `src/data/timeline.ts`).
- **Galería horizontal** de proyectos fijada con GSAP ScrollTrigger (scroll-snap en mobile).
- **Cards 3D** con tilt + spotlight (`src/components/ProjectCard.astro`, motor en `src/layouts/Layout.astro`).
- Smooth scroll con Lenis, imágenes optimizadas con `astro:assets`.

## Agregar un proyecto
Editá `src/data/projects.ts` (descripción en `es` y `en`, captura en `src/assets/projects/`). `featured: true` lo muestra en la home.

## Textos
Todos los textos de UI están en `src/i18n/ui.ts`.

## Comandos
| Comando | Acción |
| --- | --- |
| `npm install` | Instala dependencias |
| `npm run dev` | Dev server en `localhost:8080` |
| `npm run build` | Build a `./dist/` |
| `npm run preview` | Previsualiza el build |
