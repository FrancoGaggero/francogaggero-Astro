import type { ImageMetadata } from 'astro';
import type { Lang } from '../i18n/ui';

import inventariosmart from '../assets/projects/inventariosmart.png';
import krowdsupply from '../assets/projects/krowdsupply.png';
import softstudio from '../assets/projects/softstudio.png';
import taskmanager from '../assets/projects/taskmanager.png';
import nycguide from '../assets/projects/nycguide.png';
import miniplay from '../assets/projects/miniplayparty.png';
import orangestudio from '../assets/projects/orangestudio.png';
import valentina from '../assets/projects/valentinabozzone.png';
import cleansa from '../assets/projects/claeansa.png';
import capibara from '../assets/capibara/feature.jpg';
import blockscript from '../assets/projects/blockscript.png';

export type Category = 'fullstack' | 'web' | 'landing' | 'game';
export type Status = 'new' | 'wip' | 'featured' | 'uni';

export interface Project {
  slug: string;
  title: string;
  desc: Record<Lang, string>;
  tags: string[];
  category: Category;
  image?: ImageMetadata;
  /** Gradient used for the generated cover when there is no screenshot. */
  accent: [string, string];
  live?: string;
  repo?: string;
  playStore?: string;
  appStore?: 'soon';
  status?: Status;
  /** Shown on the home page bento. */
  featured?: boolean;
  year: number;
}

const gh = (repo: string) => `https://github.com/FrancoGaggero/${repo}`;

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.krowdsupply.capibaraLearnPlay';

export const projects: Project[] = [
  {
    slug: 'blockscript',
    title: 'BlockScript',
    desc: {
      es: 'Mundo de bloques 3D que se programa desde una consola: un lenguaje de comandos propio y JavaScript real, ejecutado en un Web Worker, lo construyen paso a paso. Motion graphics en vivo con Remotion: animaciones por comando, logros y un replay 3D de tu construcción.',
      en: 'A 3D block world you program from a console: a custom command language and real JavaScript, sandboxed in a Web Worker, build it step by step. Live Remotion motion graphics: per-command animations, achievements and a 3D replay of your build.',
    },
    tags: ['React', 'Three.js', 'Remotion', 'TypeScript'],
    category: 'web',
    image: blockscript,
    accent: ['#b6ff3b', '#22d3ee'],
    live: 'https://blockscriptshell.netlify.app',
    repo: gh('BlockScript'),
    status: 'new',
    featured: true,
    year: 2026,
  },
  {
    slug: 'inventariosmart',
    title: 'InventarioSmart',
    desc: {
      es: 'SaaS de inventario e inteligencia financiera para PyMEs: stock, rentabilidad y reposición inteligente. API NestJS + Prisma sobre PostgreSQL, web en React y app Android en Flutter. Mi trabajo final de carrera.',
      en: 'Inventory & financial-intelligence SaaS for small businesses: stock, profitability and smart restocking. NestJS + Prisma API on PostgreSQL, React web app and a Flutter Android app. My degree capstone project.',
    },
    tags: ['NestJS', 'Prisma', 'PostgreSQL', 'React', 'Flutter'],
    category: 'fullstack',
    image: inventariosmart,
    accent: ['#f59e0b', '#b45309'],
    live: 'https://inventariosmart0.vercel.app',
    repo: gh('inventariosmart'),
    status: 'new',
    featured: true,
    year: 2026,
  },
  {
    slug: 'capibara',
    title: 'Capibara Learn & Play',
    desc: {
      es: 'Juego mobile educativo publicado en Google Play: más de 10 minijuegos con capibaras — puzzles, matemática, música, colorear y memoria.',
      en: 'Educational mobile game live on Google Play: 10+ capybara minigames — puzzles, math, music, coloring and memory.',
    },
    tags: ['Mobile', 'Game Dev', 'Android', 'Kids'],
    category: 'game',
    image: capibara,
    accent: ['#fb923c', '#a16207'],
    playStore: PLAY_STORE_URL,
    appStore: 'soon',
    status: 'new',
    year: 2026,
  },
  {
    slug: 'krowd-supply',
    title: 'Krowd Supply LLC',
    desc: {
      es: 'Landing corporativa para una distribuidora retail de la costa este de EE. UU. Animaciones de scroll con Framer Motion y diseño enfocado en conversión.',
      en: 'Corporate landing page for a U.S. East Coast retail distributor. Framer Motion scroll animations and a conversion-focused design.',
    },
    tags: ['React', 'TypeScript', 'Tailwind v4', 'Framer Motion'],
    category: 'landing',
    image: krowdsupply,
    accent: ['#f59e0b', '#14b8a6'],
    live: 'https://krowdsupply.netlify.app',
    repo: gh('Krowd-Supply-LLC'),
    status: 'new',
    featured: true,
    year: 2026,
  },
  {
    slug: 'taskmanager',
    title: 'TaskManager Pro',
    desc: {
      es: 'Gestor de tareas full stack: frontend React/Next.js en Vercel, API Express en Render y PostgreSQL en Neon con Prisma. Login con JWT.',
      en: 'Full stack task manager: React/Next.js frontend on Vercel, Express API on Render and PostgreSQL on Neon with Prisma. JWT login.',
    },
    tags: ['Next.js', 'Express', 'Prisma', 'PostgreSQL'],
    category: 'fullstack',
    image: taskmanager,
    accent: ['#3b82f6', '#8b5cf6'],
    live: 'https://frontend-navy-sigma-96.vercel.app/',
    repo: gh('TaskManager'),
    featured: true,
    year: 2026,
  },
  {
    slug: 'softstudio',
    title: 'Soft Studio',
    desc: {
      es: 'Sitio portfolio para un estudio de diseño web, con widget de chat a WhatsApp, modo claro/oscuro y secciones de servicios.',
      en: 'Portfolio site for a web design studio, with a WhatsApp chat widget, light/dark mode and service sections.',
    },
    tags: ['Astro', 'Tailwind', 'JavaScript'],
    category: 'landing',
    image: softstudio,
    accent: ['#2563eb', '#0ea5e9'],
    live: 'https://soft-studio.netlify.app',
    repo: gh('SoftStudio'),
    featured: true,
    year: 2026,
  },
  {
    slug: 'explora-ny',
    title: 'Explora NY',
    desc: {
      es: 'Guía interactiva e inmersiva de Nueva York: lugares ocultos, moda y gastronomía con imágenes en alta resolución y un mapa de exploración.',
      en: 'An immersive interactive guide to New York City: hidden gems, fashion and food with high-resolution imagery and an exploration map.',
    },
    tags: ['React', 'base44', 'UI/UX'],
    category: 'web',
    image: nycguide,
    accent: ['#eab308', '#ef4444'],
    live: 'https://nycguide.base44.app/',
    featured: true,
    year: 2026,
  },
  {
    slug: 'miniplay',
    title: 'MiniPlay',
    desc: {
      es: 'Plataforma de minijuegos casuales para todas las edades — trivia, memoria y reflejos — con ranking global.',
      en: 'Casual minigames platform for all ages — trivia, memory and reflex challenges — with a global leaderboard.',
    },
    tags: ['React', 'base44', 'Games'],
    category: 'game',
    image: miniplay,
    accent: ['#ec4899', '#8b5cf6'],
    live: 'https://miniplayparty.base44.app/',
    year: 2026,
  },
  {
    slug: 'ciava',
    title: 'CIAVA Studio',
    desc: {
      es: 'Landing para un estudio de fotografía y moda, con estética editorial y galerías.',
      en: 'Landing page for a photography & fashion studio, with an editorial look and galleries.',
    },
    tags: ['Astro', 'TypeScript', 'Python'],
    category: 'landing',
    accent: ['#f472b6', '#7c3aed'],
    repo: gh('CIAVA'),
    year: 2026,
  },
  {
    slug: 'koi',
    title: 'Koi Games',
    desc: {
      es: 'Landing para una desarrolladora de videojuegos indie.',
      en: 'Landing page for an indie game development company.',
    },
    tags: ['Astro', 'CSS', 'JavaScript'],
    category: 'landing',
    accent: ['#f97316', '#dc2626'],
    repo: gh('Koi-'),
    year: 2026,
  },
  {
    slug: 'apptexas',
    title: 'Texas Calculator',
    desc: {
      es: 'Calculadora científica online inspirada en la TI-Nspire CX II CAS. Next.js, TypeScript y Math.js, con autenticación y persistencia en camino.',
      en: 'Online scientific calculator inspired by the TI-Nspire CX II CAS. Next.js, TypeScript and Math.js, with auth and persistence on the way.',
    },
    tags: ['Next.js', 'TypeScript', 'Math.js', 'Prisma'],
    category: 'web',
    accent: ['#06b6d4', '#2563eb'],
    repo: gh('AppTexas'),
    status: 'wip',
    year: 2026,
  },
  {
    slug: 'orange-studio',
    title: 'Orange Studio Games',
    desc: {
      es: 'Landing moderna y responsive para un estudio de juegos, con animaciones suaves y performance optimizada.',
      en: 'Modern, responsive landing page for a game studio, with smooth animations and optimized performance.',
    },
    tags: ['Astro', 'Tailwind', 'JavaScript'],
    category: 'landing',
    image: orangestudio,
    accent: ['#f97316', '#facc15'],
    live: 'https://orangestudiogames.netlify.app/',
    repo: gh('Orange-Studio-Games'),
    year: 2025,
  },
  {
    slug: 'valentina-bozzone',
    title: 'Portfolio Valentina Bozzone',
    desc: {
      es: 'Portfolio personal para una cliente: proyectos, habilidades y experiencia con diseño moderno.',
      en: 'Personal portfolio for a client: projects, skills and experience with a modern design.',
    },
    tags: ['Astro', 'Tailwind', 'JavaScript'],
    category: 'landing',
    image: valentina,
    accent: ['#a78bfa', '#f472b6'],
    live: 'https://valenbozzone.netlify.app/',
    repo: gh('portfolio-valentina-bozzone'),
    year: 2026,
  },
  {
    slug: 'clean-sa',
    title: 'Clean S.A',
    desc: {
      es: 'Plataforma de ventas y gestión de clientes, proyecto final para DaVinci University. Backend Python con Django, Flask y SQLAlchemy.',
      en: 'Sales and client management platform, final project for DaVinci University. Python backend with Django, Flask and SQLAlchemy.',
    },
    tags: ['Python', 'Django', 'Flask', 'SQLAlchemy'],
    category: 'fullstack',
    image: cleansa,
    accent: ['#10b981', '#0ea5e9'],
    live: 'https://python-lw6o.onrender.com/',
    repo: gh('CleanSA-python-E-commerce'),
    status: 'uni',
    year: 2026,
  },
  {
    slug: 'nakama',
    title: 'Nakama E-commerce',
    desc: {
      es: 'E-commerce full stack con autenticación de clientes, carrito y panel de administración.',
      en: 'Full stack e-commerce with customer authentication, shopping cart and admin panel.',
    },
    tags: ['PHP', 'Laravel', 'Blade', 'MySQL'],
    category: 'fullstack',
    accent: ['#ef4444', '#8b5cf6'],
    repo: gh('Nakama-E-commerce'),
    year: 2025,
  },
  {
    slug: 'spacegames',
    title: 'Space Games',
    desc: {
      es: 'Juego 2D de naves desarrollado en Lua con el motor Solar2D.',
      en: '2D space shooter built in Lua with the Solar2D engine.',
    },
    tags: ['Lua', 'Solar2D', 'Game Dev'],
    category: 'game',
    accent: ['#6366f1', '#22d3ee'],
    repo: gh('SpaceGames'),
    year: 2025,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
