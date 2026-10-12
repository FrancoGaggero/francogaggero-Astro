/**
 * Interactive portfolio terminal. Vanilla TS.
 * Output is built from typed segments (never innerHTML) and typed out char by char.
 * Colors come from CSS variables (see Terminal.astro) so `theme` can switch them live.
 */

export interface TerminalData {
	lang: 'es' | 'en';
	altUrl: string;
	email: string;
	site: string;
	projects: { title: string; desc: string; url?: string; repo?: string }[];
	projectCount: number;
	stack: { id: string; label: string; items: string[] }[];
	workflows: string[];
	timeline: { date: string; type: string; msg: string }[];
	game: { title: string; url: string };
}

type Seg = { t: string; c?: string; href?: string };
type Line = Seg[];
type Out = Line[] | void;

const C = {
	dim: 't-dim',
	accent: 't-accent',
	violet: 't-violet',
	ok: 't-ok',
	warn: 't-warn',
	err: 't-err',
	white: 't-white',
};

const L = (...segs: (Seg | string)[]): Line => segs.map((s) => (typeof s === 'string' ? { t: s } : s));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const ART = [
	'███████  ██████ ',
	'██      ██      ',
	'█████   ██  ███ ',
	'██      ██   ██ ',
	'██       ██████ ',
];

export function initTerminal(root: HTMLElement, data: TerminalData) {
	const out = root.querySelector<HTMLElement>('[data-term-out]')!;
	const input = root.querySelector<HTMLInputElement>('[data-term-input]')!;
	const ghost = root.querySelector<HTMLElement>('[data-term-ghost]')!;
	const body = root.querySelector<HTMLElement>('[data-term-body]')!;
	const es = data.lang === 'es';
	const history: string[] = [];
	let hIndex = 0;
	let busy = false;
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const bootAt = performance.now();

	const tx = (esText: string, enText: string) => (es ? esText : enText);

	// ---------- output primitives ----------
	const scrollDown = () => (body.scrollTop = body.scrollHeight);

	function makeRow() {
		const row = document.createElement('div');
		row.className = 'whitespace-pre-wrap break-words';
		out.appendChild(row);
		return row;
	}

	async function typeLine(line: Line, instant = false) {
		const row = makeRow();
		for (const seg of line) {
			const el = seg.href ? document.createElement('a') : document.createElement('span');
			if (seg.c) el.className = seg.c;
			if (seg.href && el instanceof HTMLAnchorElement) {
				el.href = seg.href;
				if (!seg.href.startsWith('mailto:')) {
					el.target = '_blank';
					el.rel = 'noopener';
				}
				el.classList.add('underline', 'decoration-dotted', 'underline-offset-4', 'hover:text-white');
			}
			row.appendChild(el);
			if (instant || reduced) {
				el.textContent = seg.t;
			} else {
				const step = Math.max(1, Math.ceil(seg.t.length / 40));
				for (let i = 0; i < seg.t.length; i += step) {
					el.textContent = seg.t.slice(0, i + step);
					scrollDown();
					await sleep(7);
				}
			}
		}
		scrollDown();
	}

	async function printAll(lines: Line[], delay = 0) {
		for (const l of lines) {
			await typeLine(l, delay > 0);
			if (delay) await sleep(delay);
		}
	}

	/** A single line that is rewritten in place (progress bars). */
	function liveLine() {
		const row = makeRow();
		return (line: Line) => {
			row.textContent = '';
			for (const seg of line) {
				const el = document.createElement('span');
				if (seg.c) el.className = seg.c;
				el.textContent = seg.t;
				row.appendChild(el);
			}
			scrollDown();
		};
	}

	const bar = (p: number, width = 24) => '█'.repeat(Math.round(p * width)) + '░'.repeat(width - Math.round(p * width));

	// ---------- rich commands ----------
	function uptime() {
		const s = Math.floor((performance.now() - bootAt) / 1000);
		const m = Math.floor(s / 60);
		return m ? `${m}m ${s % 60}s` : `${s}s`;
	}

	async function neofetch() {
		const row = (label: string, value: string) => L({ t: label.padEnd(11), c: C.violet }, value);
		const info: Line[] = [
			L({ t: 'franco', c: C.accent }, { t: '@', c: C.dim }, { t: 'portfolio', c: C.accent }),
			L({ t: '─'.repeat(22), c: C.dim }),
			row('OS:', 'Portfolio OS 2026 x86_64'),
			row(tx('Rol:', 'Role:'), 'Full Stack Developer'),
			row(tx('Ubicación:', 'Location:'), 'Buenos Aires, AR'),
			row('Stack:', 'TypeScript · React · NestJS · Flutter'),
			row('DevOps:', 'Docker · AWS · GitHub Actions'),
			row(tx('Proyectos:', 'Projects:'), String(data.projectCount)),
			row(tx('Juego:', 'Game:'), `${data.game.title} (Google Play)`),
			row('Shell:', 'zsh 5.9'),
			row('Uptime:', uptime()),
			L({ t: '███', c: 't-sw1' }, { t: '███', c: 't-sw2' }, { t: '███', c: 't-sw3' }, { t: '███', c: 't-sw4' }, { t: '███', c: 't-sw5' }, { t: '███', c: 't-sw6' }),
		];
		// Two real columns (logo | info) so block glyphs can't misalign the text
		const wrap = document.createElement('div');
		wrap.className = 'flex flex-wrap items-start gap-x-8 gap-y-3 py-1';
		const logo = document.createElement('div');
		logo.className = 'shrink-0 leading-[1.05] tracking-[-0.05em]';
		ART.forEach((a, i) => {
			const r = document.createElement('div');
			r.className = i % 2 ? C.violet : C.accent;
			r.style.whiteSpace = 'pre';
			r.textContent = a;
			logo.appendChild(r);
		});
		const col = document.createElement('div');
		col.className = 'min-w-0';
		wrap.append(logo, col);
		out.appendChild(wrap);
		for (const line of info) {
			const r = document.createElement('div');
			r.className = 'whitespace-pre-wrap break-words';
			for (const seg of line) {
				const el = document.createElement('span');
				if (seg.c) el.className = seg.c;
				el.textContent = seg.t;
				r.appendChild(el);
			}
			col.appendChild(r);
			scrollDown();
			await sleep(reduced ? 0 : 35);
		}
	}

	async function npmTest() {
		const suites: [string, string[]][] = [
			['src/auth/auth.service.spec.ts', ['issues JWT for valid credentials', 'rejects invalid password', 'refreshes expired sessions']],
			['src/products/products.controller.spec.ts', ['lists products with search filter', 'creates product (201)', 'validates payload with zod (400)']],
			['src/movements/movements.e2e-spec.ts', ['registers stock movement', 'is idempotent with Idempotency-Key', 'voids movement and restores stock']],
			['web/src/components/Dashboard.test.tsx', ['renders KPIs', 'shows low-stock alerts', 'handles empty state']],
			['mobile/test/inventory_test.dart', ['loads inventory list', 'syncs offline changes']],
		];
		await printAll([L({ t: '> jest --coverage', c: C.dim }), L('')], 0);
		let total = 0;
		for (const [file, tests] of suites) {
			await sleep(reduced ? 0 : 220);
			await typeLine(L({ t: ' PASS ', c: 't-pass' }, ' ', { t: file, c: C.white }), true);
			for (const name of tests) {
				total++;
				await sleep(reduced ? 0 : 60);
				await typeLine(L({ t: '    ✓ ', c: C.ok }, name, { t: ` (${4 + Math.floor(Math.random() * 40)} ms)`, c: C.dim }), true);
			}
		}
		const cov: [string, number][] = [
			['auth', 0.96],
			['products', 0.91],
			['movements', 0.94],
			['web/ui', 0.87],
		];
		await printAll(
			[
				L(''),
				L({ t: 'Test Suites: ', c: C.white }, { t: `${suites.length} passed`, c: C.ok }, `, ${suites.length} total`),
				L({ t: 'Tests:       ', c: C.white }, { t: `${total} passed`, c: C.ok }, `, ${total} total`),
				L({ t: 'Time:        ', c: C.white }, `${(2 + Math.random()).toFixed(2)} s`),
				L(''),
				L({ t: 'Coverage', c: C.white }),
				...cov.map(([n, p]) => L({ t: `  ${n.padEnd(11)}`, c: C.dim }, { t: bar(p, 20), c: p > 0.9 ? C.ok : C.warn }, ` ${Math.round(p * 100)}%`)),
			],
			reduced ? 0 : 40,
		);
	}

	async function deploy() {
		await printAll([L({ t: '> portfolio@2.0.0 deploy', c: C.dim }), L({ t: '> astro check && astro build && rocket launch --prod', c: C.dim }), L('')], 0);
		await typeLine(L({ t: '✓ ', c: C.ok }, tx('0 errores, 0 warnings', '0 errors, 0 warnings')), true);
		await typeLine(L({ t: 'vite ', c: C.violet }, 'v6.4.1 ', { t: tx('compilando para producción…', 'building for production…'), c: C.ok }), true);
		const progress = liveLine();
		const steps = reduced ? 4 : 36;
		for (let i = 0; i <= steps; i++) {
			const p = i / steps;
			progress(L({ t: '[', c: C.dim }, { t: bar(p), c: C.accent }, { t: ']', c: C.dim }, ` ${String(Math.round(p * 100)).padStart(3)}%  `, { t: `transforming (${Math.round(p * 412)}) modules`, c: C.dim }));
			await sleep(reduced ? 0 : 45);
		}
		const chunks: [string, string][] = [
			['dist/index.html', '38.21 kB'],
			['dist/_astro/index.css', '41.87 kB'],
			['dist/_astro/robot-scene.js', '96.40 kB'],
			['dist/_astro/terminal.js', '9.12 kB'],
		];
		await printAll(chunks.map(([f, s]) => L({ t: `  ${f.padEnd(30)}`, c: C.dim }, { t: s, c: C.white })), reduced ? 0 : 50);
		await typeLine(L({ t: '✓ ', c: C.ok }, tx('build listo en 2.41s', 'built in 2.41s')), true);
		await typeLine(L(''), true);
		await typeLine(L({ t: '🚀 ', c: C.warn }, { t: tx('Iniciando secuencia de lanzamiento…', 'Starting launch sequence…'), c: C.warn }));

		const launched = new Promise<void>((resolve) => {
			const done = () => resolve();
			window.addEventListener('portfolio:launched', done, { once: true });
			setTimeout(done, 15000);
		});
		root.dispatchEvent(new CustomEvent('term:deploying', { bubbles: true }));
		// a maximized terminal would cover the launch
		if (root.classList.contains('is-max')) setMax(false);
		window.dispatchEvent(new CustomEvent('portfolio:deploy'));
		await launched;
		await printAll([
			L({ t: '✔ ', c: C.ok }, { t: tx('Deploy exitoso en ', 'Deployed to '), c: C.white }, { t: data.site, c: C.accent, href: data.site }),
			L({ t: tx('  Tiempo total 9.6s · 0 downtime · CI ✓', '  Total time 9.6s · 0 downtime · CI ✓'), c: C.dim }),
		]);
		root.dispatchEvent(new CustomEvent('term:deployed', { bubbles: true }));
	}

	// ---------- command table ----------
	const commands: Record<string, { desc: string; run: (args: string[]) => Out | Promise<Out> }> = {
		help: {
			desc: tx('lista de comandos', 'list commands'),
			run: () => [
				L({ t: tx('Comandos disponibles:', 'Available commands:'), c: C.white }),
				...Object.entries(commands)
					.filter(([k]) => !hidden.has(k))
					.map(([k, v]) => L({ t: `  ${k.padEnd(16)}`, c: C.accent }, { t: v.desc, c: C.dim })),
				L({ t: tx('  Tip: Tab o → completa · ↑/↓ historial · / enfoca la terminal', '  Tip: Tab or → completes · ↑/↓ history · / focuses the terminal'), c: C.dim }),
			],
		},
		neofetch: { desc: tx('info del sistema', 'system info'), run: () => neofetch() },
		whoami: {
			desc: tx('quién soy', 'who am I'),
			run: () => [
				L({ t: 'Franco Gaggero', c: C.white }, { t: ' — Full Stack Developer & Game Maker', c: C.accent }),
				L(tx('Analista de Sistemas (DaVinci University) · Buenos Aires, AR', 'Systems Analyst (DaVinci University) · Buenos Aires, AR')),
				L(tx('Construyo productos web y mobile end-to-end: specs (SDD), tests, CI/CD y deploy.', 'I build web & mobile products end to end: specs (SDD), tests, CI/CD and deploy.')),
				L({ t: tx('Abierto a: ', 'Open to: '), c: C.dim }, { t: tx('full-time · freelance · remoto', 'full-time · freelance · remote'), c: C.ok }),
			],
		},
		skills: {
			desc: tx('stack — ej: skills devops', 'stack — e.g. skills devops'),
			run: (args) => {
				const q = (args[0] ?? '').toLowerCase();
				const cats = q ? data.stack.filter((c) => c.id.startsWith(q) || c.label.toLowerCase().includes(q)) : data.stack;
				if (q && !cats.length) {
					if ('workflows'.startsWith(q)) return data.workflows.map((w) => L({ t: '  ▸ ', c: C.violet }, w));
					return [L({ t: tx(`Categoría no encontrada: ${q}. Probá: `, `Unknown category: ${q}. Try: `), c: C.err }, { t: data.stack.map((c) => c.id).join(', ') + ', workflows', c: C.accent })];
				}
				const lines = cats.map((c) => L({ t: `  ${c.label.padEnd(20)}`, c: C.accent }, c.items.join(' · ')));
				if (!q) lines.push(L({ t: `  ${'Workflows'.padEnd(20)}`, c: C.violet }, data.workflows.join(' · ')));
				return lines;
			},
		},
		projects: {
			desc: tx('proyectos destacados', 'featured projects'),
			run: () =>
				data.projects.flatMap((p, i) => [
					L({ t: `  ${String(i + 1).padStart(2, '0')} `, c: C.dim }, { t: p.title, c: C.white }, ...(p.url ? [{ t: '  ↗ ' + tx('ver', 'open'), c: C.accent, href: p.url }] : []), ...(p.repo ? [{ t: '  ⌥ repo', c: C.violet, href: p.repo }] : [])),
					L({ t: `     ${p.desc}`, c: C.dim }),
				]),
		},
		'npm test': { desc: tx('corre la suite de tests', 'run the test suite'), run: () => npmTest() },
		'npm run deploy': { desc: tx('build + deploy a producción 🚀', 'build + deploy to production 🚀'), run: () => deploy() },
		experience: {
			desc: tx('mi recorrido (git log)', 'my journey (git log)'),
			run: () => data.timeline.map((c) => L({ t: `  * ${c.date.padEnd(8)}`, c: C.warn }, { t: `${c.type}: `, c: C.accent }, c.msg)),
		},
		game: {
			desc: tx('mi juego mobile', 'my mobile game'),
			run: () => [
				L({ t: data.game.title, c: C.white }, tx(' — juego educativo con capibaras.', ' — educational capybara game.')),
				L({ t: '  ▶ Google Play', c: C.ok, href: data.game.url }, { t: tx('   App Store: próximamente', '   App Store: coming soon'), c: C.dim }),
			],
		},
		contact: {
			desc: tx('cómo contactarme', 'how to reach me'),
			run: () => [
				L({ t: '  email     ', c: C.dim }, { t: data.email, c: C.accent, href: `mailto:${data.email}` }),
				L({ t: '  linkedin  ', c: C.dim }, { t: 'in/francogaggero', c: C.accent, href: 'https://www.linkedin.com/in/francogaggero/' }),
				L({ t: '  github    ', c: C.dim }, { t: 'FrancoGaggero', c: C.accent, href: 'https://github.com/FrancoGaggero' }),
			],
		},
		theme: {
			desc: 'cyan | green | amber',
			run: (args) => {
				const t = args[0];
				if (t === 'cyan' || t === 'green' || t === 'amber') {
					root.dataset.theme = t;
					return [L({ t: tx(`Tema cambiado a ${t}.`, `Theme set to ${t}.`), c: C.ok })];
				}
				if (t === 'matrix') return commands.matrix.run([]) as Out;
				return [L({ t: tx('Uso: theme cyan | green | amber', 'Usage: theme cyan | green | amber'), c: C.dim })];
			},
		},
		lang: {
			desc: 'es | en',
			run: (args) => {
				const target = args[0];
				if (target && target !== data.lang && (target === 'es' || target === 'en')) {
					setTimeout(() => (window.location.href = `${data.altUrl}#terminal`), 400);
					return [L({ t: target === 'en' ? 'Switching to English…' : 'Cambiando a español…', c: C.ok })];
				}
				return [L({ t: tx('Uso: lang es | lang en', 'Usage: lang es | lang en'), c: C.dim })];
			},
		},
		history: {
			desc: tx('comandos anteriores', 'previous commands'),
			run: () => (history.length ? history.map((h, i) => L({ t: `  ${String(i + 1).padStart(3)}  `, c: C.dim }, h)) : [L({ t: tx('(vacío)', '(empty)'), c: C.dim })]),
		},
		date: { desc: tx('fecha y hora', 'date and time'), run: () => [L(new Date().toLocaleString(es ? 'es-AR' : 'en-US', { dateStyle: 'full', timeStyle: 'medium' }))] },
		echo: { desc: tx('repite el texto', 'print text'), run: (args) => [L(args.join(' '))] },
		clear: { desc: tx('limpiar pantalla', 'clear screen'), run: () => void (out.innerHTML = '') },
		sudo: {
			desc: '',
			run: (args) => {
				if (args.join(' ') === 'hire-me' || args.join(' ') === 'hire me') {
					confetti();
					return [
						L({ t: tx('[sudo] contraseña para recruiter: ********', '[sudo] password for recruiter: ********'), c: C.dim }),
						L({ t: tx('✔ Acceso concedido. Excelente decisión 🎉', '✔ Access granted. Excellent decision 🎉'), c: C.ok }),
						L(tx('Escribime a ', 'Email me at '), { t: data.email, c: C.accent, href: `mailto:${data.email}` }),
					];
				}
				return [L({ t: tx('Permiso denegado. Probá: sudo hire-me', 'Permission denied. Try: sudo hire-me'), c: C.err })];
			},
		},
		matrix: {
			desc: '',
			run: () => {
				matrix();
				return [L({ t: tx('Despertá, Neo…', 'Wake up, Neo…'), c: C.ok })];
			},
		},
	};
	const aliases: Record<string, string> = { about: 'whoami', stack: 'skills', exp: 'experience', 'git log': 'experience', cls: 'clear', ls: 'projects', '?': 'help', deploy: 'npm run deploy', test: 'npm test', 'npm run test': 'npm test' };
	const hidden = new Set(['sudo', 'matrix']);
	const names = Object.keys(commands).filter((k) => !hidden.has(k));
	const completions = [...names, 'sudo hire-me', 'skills frontend', 'skills backend', 'skills testing', 'skills devops', 'skills tools', 'theme amber', 'theme green', 'theme cyan', 'lang en', 'lang es'];

	/** Longest command name (multi-word supported) that prefixes the input. */
	function resolve(cmdline: string): { key: string; args: string[] } | null {
		const lower = cmdline.toLowerCase();
		const all = [...Object.keys(commands), ...Object.keys(aliases)].sort((a, b) => b.length - a.length);
		for (const name of all) {
			if (lower === name || lower.startsWith(name + ' ')) {
				const key = aliases[name] ?? name;
				const args = cmdline.slice(name.length).trim().split(/\s+/).filter(Boolean);
				return { key, args };
			}
		}
		return null;
	}

	async function exec(raw: string) {
		const cmdline = raw.trim();
		await typeLine(L({ t: 'franco@portfolio', c: 't-prompt' }, { t: ':~$ ', c: C.dim }, { t: cmdline, c: C.white }), true);
		if (!cmdline) return;
		history.push(cmdline);
		hIndex = history.length;
		const found = resolve(cmdline);
		const lines = found
			? await commands[found.key].run(found.args)
			: [L({ t: tx(`zsh: comando no encontrado: ${cmdline.split(' ')[0]}. Escribí `, `zsh: command not found: ${cmdline.split(' ')[0]}. Type `), c: C.err }, { t: 'help', c: C.accent })];
		if (lines) await printAll(lines);
	}

	const queue: string[] = [];
	function submit(value: string) {
		input.value = '';
		updateGhost();
		queue.push(value);
		drain();
	}
	async function drain() {
		if (busy) return;
		busy = true;
		root.classList.add('is-busy');
		while (queue.length) await exec(queue.shift()!);
		busy = false;
		root.classList.remove('is-busy');
	}

	// ---------- effects ----------
	function confetti() {
		if (reduced) return;
		const colors = ['#22d3ee', '#a78bfa', '#e879f9', '#fb923c', '#34d399'];
		const rect = root.getBoundingClientRect();
		for (let i = 0; i < 90; i++) {
			const p = document.createElement('span');
			p.className = 'pointer-events-none fixed z-[70] h-2 w-1.5 rounded-sm';
			p.style.background = colors[i % colors.length];
			p.style.left = `${rect.left + rect.width / 2}px`;
			p.style.top = `${rect.top + rect.height / 2}px`;
			document.body.appendChild(p);
			const angle = Math.random() * Math.PI * 2;
			const dist = 120 + Math.random() * 260;
			p.animate(
				[
					{ transform: 'translate(0,0) rotate(0)', opacity: 1 },
					{ transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist + 200}px) rotate(${Math.random() * 720}deg)`, opacity: 0 },
				],
				{ duration: 1200 + Math.random() * 800, easing: 'cubic-bezier(.2,.7,.3,1)' },
			).onfinish = () => p.remove();
		}
	}

	function matrix() {
		if (reduced) return;
		const canvas = document.createElement('canvas');
		canvas.className = 'pointer-events-none absolute inset-0 h-full w-full opacity-80';
		body.parentElement!.appendChild(canvas);
		const ctx = canvas.getContext('2d')!;
		canvas.width = canvas.clientWidth;
		canvas.height = canvas.clientHeight;
		const cols = Math.floor(canvas.width / 14);
		const drops = Array.from({ length: cols }, () => Math.random() * -20);
		const chars = 'アイウエオカキクケコ01{}<>/=FRANCO';
		const t0 = performance.now();
		const loop = (now: number) => {
			ctx.fillStyle = 'rgba(7,8,13,0.15)';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = '#34d399';
			ctx.font = '13px JetBrains Mono, monospace';
			drops.forEach((y, i) => {
				ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 14, y * 16);
				drops[i] = y * 16 > canvas.height && Math.random() > 0.95 ? 0 : y + 1;
			});
			if (now - t0 < 3500) requestAnimationFrame(loop);
			else canvas.animate([{ opacity: 0.8 }, { opacity: 0 }], { duration: 600 }).onfinish = () => canvas.remove();
		};
		requestAnimationFrame(loop);
	}

	// ---------- input: ghost completion + validation ----------
	let suggestion = '';
	function updateGhost() {
		const v = input.value;
		const lower = v.toLowerCase();
		suggestion = v ? (completions.find((c) => c.startsWith(lower) && c !== lower) ?? '') : '';
		ghost.textContent = '';
		if (suggestion) {
			const typed = document.createElement('span');
			typed.className = 'text-transparent';
			typed.textContent = v;
			const rest = document.createElement('span');
			rest.textContent = suggestion.slice(v.length);
			ghost.append(typed, rest);
		}
		const trimmed = v.trim();
		const valid = !!trimmed && !!resolve(trimmed);
		const partial = !!trimmed && completions.some((c) => c.startsWith(trimmed.toLowerCase()));
		input.classList.toggle('is-valid', valid);
		input.classList.toggle('is-invalid', !!trimmed && !valid && !partial);
	}
	const acceptSuggestion = () => {
		if (!suggestion) return false;
		input.value = suggestion;
		updateGhost();
		return true;
	};

	root.querySelector('form')!.addEventListener('submit', (e) => {
		e.preventDefault();
		submit(input.value);
	});
	input.addEventListener('input', updateGhost);
	input.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowUp' && history.length) {
			e.preventDefault();
			hIndex = Math.max(0, hIndex - 1);
			input.value = history[hIndex];
			updateGhost();
		} else if (e.key === 'ArrowDown' && history.length) {
			e.preventDefault();
			hIndex = Math.min(history.length, hIndex + 1);
			input.value = history[hIndex] ?? '';
			updateGhost();
		} else if (e.key === 'Tab') {
			if (acceptSuggestion()) e.preventDefault();
		} else if (e.key === 'ArrowRight' && input.selectionStart === input.value.length) {
			if (acceptSuggestion()) e.preventDefault();
		} else if (e.key === 'l' && e.ctrlKey) {
			e.preventDefault();
			out.innerHTML = '';
		}
	});

	// ---------- window chrome ----------
	const win = root;
	const setMax = (on: boolean) => {
		win.classList.toggle('is-max', on);
		document.documentElement.classList.toggle('term-max-open', on);
		(window as any).__lenis?.[on ? 'stop' : 'start']?.();
		input.focus({ preventScroll: true });
	};
	root.querySelector('[data-term-close]')?.addEventListener('click', () => {
		out.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 250 }).onfinish = () => (out.innerHTML = '');
		setMax(false);
		win.classList.remove('is-min');
	});
	root.querySelector('[data-term-min]')?.addEventListener('click', () => {
		setMax(false);
		win.classList.toggle('is-min');
	});
	root.querySelector('[data-term-max]')?.addEventListener('click', () => {
		win.classList.remove('is-min');
		setMax(!win.classList.contains('is-max'));
	});
	window.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && win.classList.contains('is-max')) setMax(false);
		const tag = (document.activeElement as HTMLElement | null)?.tagName;
		if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
			e.preventDefault();
			root.scrollIntoView({ behavior: 'smooth', block: 'center' });
			input.focus({ preventScroll: true });
		}
	});

	root.querySelectorAll<HTMLButtonElement>('[data-term-suggest]').forEach((b) =>
		b.addEventListener('click', () => {
			submit(b.dataset.termSuggest!);
			input.focus({ preventScroll: true });
		}),
	);
	body.addEventListener('click', () => {
		if (!window.getSelection()?.toString()) input.focus({ preventScroll: true });
	});

	// ---------- boot sequence (once visible) ----------
	let booted = false;
	new IntersectionObserver(
		([entry]) => {
			if (!entry.isIntersecting || booted) return;
			booted = true;
			(async () => {
				busy = true;
				const services = ['network.target', 'portfolio-api.service', 'three-renderer.service', 'robot@coding.service', 'launchpad.socket'];
				for (const s of services) {
					await typeLine(L({ t: '[  ', c: C.dim }, { t: 'OK', c: C.ok }, { t: '  ] ', c: C.dim }, tx('Iniciado ', 'Started '), { t: s, c: C.white }), true);
					await sleep(reduced ? 0 : 90);
				}
				await typeLine(L(''), true);
				await neofetch();
				await typeLine(L(''), true);
				await typeLine(L(tx('Escribí ', 'Type '), { t: 'help', c: C.accent }, tx(' o probá ', ' or try '), { t: 'npm run deploy', c: C.warn }, ' 🚀'));
				busy = false;
				drain();
			})();
		},
		{ threshold: 0.35 },
	).observe(root);

	/** Lets external buttons run commands. */
	return { run: (cmd: string) => submit(cmd), isBusy: () => busy };
}
