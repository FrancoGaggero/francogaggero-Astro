# 🚀 Guía de Personalización - Portfolio Franco Gaggero

## ✅ ¡Tu portfolio está listo!

Tu portfolio personal está funcionando correctamente en `http://localhost:4322/`. Aquí tienes todo lo que necesitas saber para personalizarlo.

## 📝 Personalización Rápida

### 1. Información Personal

**Archivo**: `src/components/Hero.astro`
- Cambia "Franco Gaggero" por tu nombre
- Actualiza el título y descripción profesional
- Modifica los emojis de las tecnologías flotantes

**Archivo**: `src/components/About.astro`
- Personaliza tu historia en "Mi Historia" y "Lo que me motiva"
- Actualiza las tecnologías en cada categoría (Frontend, Backend, Herramientas)
- Agrega o quita habilidades según tu experiencia

**Archivo**: `src/components/Contact.astro`
- Cambia todos los enlaces de contacto por los tuyos reales
- Actualiza tu email, LinkedIn, GitHub
- Modifica tu ubicación

### 2. Proyectos

**Archivo**: `src/components/Projects.astro`
- Reemplaza los 6 proyectos de ejemplo con tus proyectos reales
- Actualiza títulos, descripciones, tecnologías
- Cambia los enlaces de GitHub y demo por los tuyos
- Marca como `featured: true` tus mejores proyectos

### 3. Imágenes

**Agrega tus imágenes reales en `public/`:**
- `profile.jpg` o `profile.png` - Tu foto profesional (300x300px)
- `project1.jpg` hasta `project6.jpg` - Capturas de tus proyectos (400x250px)

**Actualiza las referencias en los componentes:**
- En `Hero.astro`: cambia `/profile.svg` por `/profile.jpg`
- En `Projects.astro`: cambia `.svg` por `.jpg` en todas las imágenes

### 4. Colores y Branding

**Colores principales:**
```css
/* Azul principal */
#2563eb

/* Gradiente principal */
linear-gradient(135deg, #667eea 0%, #764ba2 100%)

/* Texto secundario */
#64748b
```

**Para cambiar la paleta de colores:**
1. Busca estos valores en todos los archivos `.astro`
2. Reemplázalos por tus colores preferidos
3. Mantén la consistencia en todos los componentes

### 5. SEO y Metadatos

**Archivo**: `src/layouts/Layout.astro`
- Actualiza el título por defecto
- Cambia la descripción meta
- Considera agregar más metadatos (Open Graph, Twitter Cards)

## 🌐 Deploy

### Opción 1: Vercel (Recomendado)
1. Sube tu código a GitHub
2. Conecta tu repositorio en [vercel.com](https://vercel.com)
3. Deploy automático en cada push

### Opción 2: Netlify
1. Ejecuta `npm run build`
2. Arrastra la carpeta `dist/` a [netlify.com](https://netlify.com)

### Opción 3: GitHub Pages
1. Instala: `npm install --save-dev gh-pages`
2. Agrega script en `package.json`: `"deploy": "npm run build && gh-pages -d dist"`
3. Ejecuta: `npm run deploy`

## 🎨 Mejoras Adicionales

### Animaciones
- Considera agregar [AOS (Animate On Scroll)](https://michalsnik.github.io/aos/)
- Agrega más transiciones CSS para mejor UX

### Funcionalidad
- Conecta el formulario de contacto con [Formspree](https://formspree.io/) o [Netlify Forms](https://www.netlify.com/products/forms/)
- Agrega Google Analytics para métricas
- Implementa un blog con Astro Content Collections

### Performance
- Optimiza imágenes con herramientas como [TinyPNG](https://tinypng.com/)
- Considera usar WebP para mejor compresión
- Agrega lazy loading para imágenes

## 📞 Soporte

Si tienes dudas sobre la personalización:
1. Revisa la [documentación de Astro](https://docs.astro.build)
2. Consulta este archivo nuevamente
3. Experimenta con los estilos CSS en cada componente

¡Tu portfolio está listo para impresionar! 🚀
