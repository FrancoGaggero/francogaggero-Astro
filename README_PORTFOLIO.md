# Franco Gaggero - Portfolio Personal

Portfolio profesional desarrollado con Astro, presentando mis habilidades como desarrollador Full Stack.

## 🚀 Características

- **Diseño Moderno**: Interface limpia y profesional con animaciones suaves
- **Responsive**: Optimizado para todos los dispositivos
- **Performance**: Construido con Astro para máxima velocidad
- **SEO Friendly**: Metadatos optimizados y estructura semántica

## 🛠️ Tecnologías Utilizadas

- **Framework**: Astro
- **Estilos**: CSS moderno con Grid y Flexbox
- **Tipografía**: Google Fonts (Inter)
- **Iconos**: SVG personalizados

## 📁 Estructura del Proyecto

```
/
├── public/
│   ├── favicon.svg
│   ├── profile.jpg           # Imagen de perfil (agregar)
│   └── project[1-6].jpg      # Imágenes de proyectos (agregar)
├── src/
│   ├── components/
│   │   ├── Hero.astro        # Sección principal
│   │   ├── About.astro       # Sobre mí
│   │   ├── Projects.astro    # Proyectos destacados
│   │   └── Contact.astro     # Formulario de contacto
│   ├── layouts/
│   │   └── Layout.astro      # Layout principal
│   └── pages/
│       └── index.astro       # Página principal
└── package.json
```

## 🚀 Comandos

| Comando                   | Acción                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Instala dependencias                            |
| `npm run dev`             | Inicia el servidor de desarrollo en `localhost:4321`      |
| `npm run build`           | Construye el sitio para producción en `./dist/`          |
| `npm run preview`         | Previsualiza la construcción localmente, antes del deploy |

## 📝 Personalización

### Información Personal
Edita los siguientes archivos para personalizar tu información:

1. **src/components/Hero.astro**: Actualiza nombre, título y descripción
2. **src/components/About.astro**: Modifica tu historia y habilidades
3. **src/components/Projects.astro**: Agrega tus proyectos reales
4. **src/components/Contact.astro**: Actualiza información de contacto

### Imágenes
Agrega las siguientes imágenes en la carpeta `public/`:
- `profile.jpg` - Tu foto de perfil (300x300px recomendado)
- `project1.jpg` hasta `project6.jpg` - Capturas de tus proyectos

### Colores y Estilos
Los colores principales están definidos en cada componente. Busca estos valores para personalizarlos:
- Azul principal: `#2563eb`
- Gradiente: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

## 🌐 Deploy

Este proyecto puede ser desplegado en cualquier plataforma que soporte sitios estáticos:

- **Vercel**: Conecta tu repositorio para deploy automático
- **Netlify**: Arrastra la carpeta `dist/` después de `npm run build`
- **GitHub Pages**: Configura Actions para deploy automático

## 📞 Contacto

¿Preguntas sobre este portfolio? Contáctame:

- **Email**: franco.gaggero@email.com
- **LinkedIn**: [franco-gaggero](https://linkedin.com/in/franco-gaggero)
- **GitHub**: [francogaggero](https://github.com/francogaggero)

---

⭐ Si te gusta este portfolio, no olvides darle una estrella al repositorio!
