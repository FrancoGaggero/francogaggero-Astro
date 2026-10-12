import * as si from 'simple-icons';
import type { Lang } from '../i18n/ui';

type SimpleIcon = { path: string; hex: string; title: string };

export interface Tech {
	name: string;
	/** SVG path (24x24 viewBox) — undefined renders an initials badge. */
	path?: string;
	/** Brand color, lightened when too dark to read on the void background. */
	color: string;
	/** Short text shown instead of a logo when there is no icon. */
	badge?: string;
}

export interface StackCategory {
	id: string;
	label: Record<Lang, string>;
	items: Tech[];
}

export interface Workflow {
	name: string;
	desc: Record<Lang, string>;
}

function readable(hex: string) {
	const n = parseInt(hex, 16);
	const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
	return lum < 0.35 ? '#e2e8f0' : `#${hex}`;
}

function tech(name: string, icon?: SimpleIcon, color?: string, badge?: string): Tech {
	return { name, path: icon?.path, color: color ?? (icon ? readable(icon.hex) : '#a78bfa'), badge };
}

export const stack: StackCategory[] = [
	{
		id: 'frontend',
		label: { es: 'Frontend', en: 'Frontend' },
		items: [
			tech('React', si.siReact),
			tech('Next.js', si.siNextdotjs),
			tech('Angular', si.siAngular, '#dd0031'),
			tech('Astro', si.siAstro),
			tech('TypeScript', si.siTypescript),
			tech('JavaScript', si.siJavascript),
			tech('Tailwind', si.siTailwindcss),
			tech('HTML5', si.siHtml5),
			tech('CSS', si.siCss, '#a78bfa'),
			tech('Three.js', si.siThreedotjs),
		],
	},
	{
		id: 'backend',
		label: { es: 'Backend', en: 'Backend' },
		items: [
			tech('Node.js', si.siNodedotjs),
			tech('NestJS', si.siNestjs),
			tech('Express', si.siExpress),
			tech('Python', si.siPython),
			tech('Django', si.siDjango, '#44b78b'),
			tech('Flask', si.siFlask),
			tech('Laravel', si.siLaravel),
			tech('PHP', si.siPhp),
			tech('Java', si.siOpenjdk, '#f89820'),
			tech('OpenAPI / Swagger', si.siSwagger),
			tech('REST APIs'),
		],
	},
	{
		id: 'mobile',
		label: { es: 'Mobile & Sistemas', en: 'Mobile & Systems' },
		items: [
			tech('Flutter', si.siFlutter, '#54c5f8'),
			tech('Dart', si.siDart, '#40c4ff'),
			tech('C', si.siC),
			tech('C++', si.siCplusplus, '#659ad2'),
			tech('Lua · Solar2D', si.siLua, '#7c8cff'),
		],
	},
	{
		id: 'data',
		label: { es: 'Datos', en: 'Data' },
		items: [
			tech('PostgreSQL', si.siPostgresql),
			tech('MySQL', si.siMysql),
			tech('MongoDB', si.siMongodb),
			tech('Mongoose', si.siMongoose, '#ef4444'),
			tech('Prisma', si.siPrisma),
			tech('SQLAlchemy', si.siSqlalchemy),
			tech('Firebase', si.siFirebase, '#ffca28'),
		],
	},
	{
		id: 'testing',
		label: { es: 'Testing & Calidad', en: 'Testing & Quality' },
		items: [
			tech('Jest', si.siJest),
			tech('Vitest', si.siVitest),
			tech('Testing Library', si.siTestinglibrary),
			tech('Supertest'),
			tech('Flutter test', si.siFlutter, '#54c5f8'),
			tech('ESLint', si.siEslint, '#8080f2'),
			tech('Prettier', si.siPrettier),
		],
	},
	{
		id: 'devops',
		label: { es: 'DevOps & Cloud', en: 'DevOps & Cloud' },
		items: [
			tech('Docker', si.siDocker),
			tech('AWS', undefined, '#ff9900', 'AWS'),
			tech('Linux', si.siLinux),
			tech('Nginx', si.siNginx),
			tech('Git', si.siGit),
			tech('GitHub', si.siGithub),
			tech('GitHub Actions', si.siGithubactions),
			tech('CI/CD'),
			tech('Vercel', si.siVercel),
			tech('Netlify', si.siNetlify),
			tech('Render', si.siRender),
			tech('Neon', si.siNeon),
			tech('pnpm monorepos', si.siPnpm),
		],
	},
	{
		id: 'tools',
		label: { es: 'Herramientas', en: 'Tools' },
		items: [
			tech('Postman', si.siPostman),
			tech('Figma', si.siFigma),
			tech('Jira', si.siJira, '#4c9aff'),
			tech('Trello', si.siTrello, '#4c9aff'),
			tech('Notion', si.siNotion),
			tech('Claude Code', si.siClaude),
		],
	},
];


export const workflows: Workflow[] = [
	{ name: 'SDD · Spec-Driven Development', desc: { es: 'Specs primero con OpenSpec: propuesta → diseño → tareas → código.', en: 'Specs first with OpenSpec: proposal → design → tasks → code.' } },
	{ name: 'TDD & integration testing', desc: { es: 'Tests unitarios y de integración como red de seguridad.', en: 'Unit and integration tests as a safety net.' } },
	{ name: 'CI/CD', desc: { es: 'Lint, typecheck y tests automáticos en cada push.', en: 'Automated lint, typecheck and tests on every push.' } },
	{ name: 'Git Flow · Conventional Commits', desc: { es: 'Ramas por feature e historial legible.', en: 'Feature branches and a readable history.' } },
	{ name: 'Code Review · Pull Requests', desc: { es: 'Cambios chicos, revisados y documentados.', en: 'Small, reviewed, documented changes.' } },
	{ name: 'Scrum / Agile', desc: { es: 'Sprints, historias de usuario y entregas incrementales.', en: 'Sprints, user stories and incremental delivery.' } },
	{ name: 'Clean Architecture · SOLID', desc: { es: 'Capas desacopladas y código mantenible.', en: 'Decoupled layers and maintainable code.' } },
	{ name: 'Requirements · UML', desc: { es: 'Relevamiento, casos de uso y diagramas.', en: 'Requirements gathering, use cases and diagrams.' } },
	{ name: 'AI-assisted dev', desc: { es: 'Agentes de IA (Claude Code) integrados al flujo de trabajo.', en: 'AI agents (Claude Code) built into the workflow.' } },
];

/** Logos shown in the 3D sphere (only items that have an icon). */
export const sphereItems: Tech[] = stack.flatMap((c) => c.items).filter((t, i, all) => t.path && all.findIndex((o) => o.path === t.path) === i);
