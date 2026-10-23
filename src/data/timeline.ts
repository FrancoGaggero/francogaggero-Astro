import type { Lang } from '../i18n/ui';

export interface Commit {
	date: string;
	type: 'init' | 'feat' | 'ship' | 'client' | 'uni';
	scope?: string;
	msg: Record<Lang, string>;
	tags: string[];
	/** 0 = main line, 1 = side branch */
	lane: 0 | 1;
	head?: boolean;
}

/** Newest first, like `git log`. */
export const timeline: Commit[] = [
	{
		date: '2026-10',
		type: 'feat',
		scope: 'thesis',
		msg: { es: 'InventarioSmart: SaaS de inventario con NestJS, React y Flutter', en: 'InventarioSmart: inventory SaaS with NestJS, React and Flutter' },
		tags: ['SDD', 'CI/CD', 'Testing'],
		lane: 0,
		head: true,
	},
	{
		date: '2026-10',
		type: 'ship',
		scope: 'creative',
		msg: { es: 'BlockScript: mundo 3D que se programa desde una consola', en: 'BlockScript: a 3D world you program from a console' },
		tags: ['Three.js', 'Remotion'],
		lane: 1,
	},
	{
		date: '2026-09',
		type: 'ship',
		scope: 'mobile',
		msg: { es: 'Capibara Learn & Play publicado en Google Play', en: 'Capibara Learn & Play live on Google Play' },
		tags: ['Game Dev', 'Android'],
		lane: 1,
	},
	{
		date: '2026-09',
		type: 'client',
		msg: { es: 'Landing corporativa para Krowd Supply LLC (EE. UU.)', en: 'Corporate landing page for Krowd Supply LLC (USA)' },
		tags: ['React', 'Framer Motion'],
		lane: 0,
	},
	{
		date: '2026-07',
		type: 'client',
		msg: { es: 'Sitios para CIAVA, Soft Studio y Valentina Bozzone', en: 'Sites for CIAVA, Soft Studio and Valentina Bozzone' },
		tags: ['Astro', 'Tailwind'],
		lane: 1,
	},
	{
		date: '2026-05',
		type: 'feat',
		msg: { es: 'Texas Calculator (Next.js + Math.js) y Koi Games', en: 'Texas Calculator (Next.js + Math.js) and Koi Games' },
		tags: ['Next.js', 'TypeScript'],
		lane: 0,
	},
	{
		date: '2026-03',
		type: 'uni',
		msg: { es: 'Clean S.A (Django) y TaskManager Pro full stack', en: 'Clean S.A (Django) and full stack TaskManager Pro' },
		tags: ['Python', 'Express', 'Prisma'],
		lane: 0,
	},
	{
		date: '2025-09',
		type: 'client',
		msg: { es: 'Landing para Orange Studio Games', en: 'Landing page for Orange Studio Games' },
		tags: ['Astro'],
		lane: 1,
	},
	{
		date: '2025-08',
		type: 'feat',
		scope: 'gamedev',
		msg: { es: 'Space Games: primer juego con Lua y Solar2D', en: 'Space Games: first game with Lua and Solar2D' },
		tags: ['Lua', 'Solar2D'],
		lane: 1,
	},
	{
		date: '2025-07',
		type: 'feat',
		msg: { es: 'Nakama E-commerce (Laravel) y CarWeb (PHP)', en: 'Nakama E-commerce (Laravel) and CarWeb (PHP)' },
		tags: ['PHP', 'MySQL'],
		lane: 0,
	},
	{
		date: '2024',
		type: 'init',
		msg: { es: 'Empiezo Analista de Sistemas en DaVinci University', en: 'Start Systems Analyst degree at DaVinci University' },
		tags: ['Buenos Aires'],
		lane: 0,
	},
];

/** Deterministic short "hash" so it stays stable between builds. */
export function shortHash(s: string) {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
	return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7);
}
