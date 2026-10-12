/**
 * Interactive portfolio terminal. Vanilla TS.
 * Output is built from typed segments (never innerHTML) and typed out char by char.
 */

export interface TerminalData {
	lang: 'es' | 'en';
	altUrl: string;
	email: string;
	projects: { title: string; desc: string; url?: string; repo?: string }[];
	stack: { id: string; label: string; items: string[] }[];
	learning: string[];
	workflows: string[];
	timeline: { date: string; type: string; msg: string }[];
	game: { title: string; url: string };
}

type Seg = { t: string; c?: string; href?: string };
type Line = Seg[];

const C = {
	dim: 'text-slate-500',
	accent: 'text-cyan-300',
	violet: 'text-violet-300',
	ok: 'text-emerald-300',
	warn: 'text-amber-300',
	err: 'text-rose-300',
	white: 'text-white',
};

const L = (...segs: (Seg | string)[]): Line => segs.map((s) => (typeof s === 'string' ? { t: s } : s));

export function initTerminal(root: HTMLElement, data: TerminalData) {
	const out = root.querySelector<HTMLElement>('[data-term-out]')!;
	const input = root.querySelector<HTMLInputElement>('[data-term-input]')!;
	const body = root.querySelector<HTMLElement>('[data-term-body]')!;
	const es = data.lang === 'es';
	const history: string[] = [];
	let hIndex = 0;
	let busy = false;
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const tx = (esText: string, enText: string) => (es ? esText : enText);

	// ---------- commands ----------
	const commands: Record<string, { desc: string; run: (args: string[]) => Line[] | void }> = {
		help: {
			desc: tx('lista de comandos', 'list commands'),
			run: () => [
				L({ t: tx('Comandos disponibles:', 'Available commands:'), c: C.white }),
				...Object.entries(commands)
					.filter(([k]) => !hidden.has(k))
					.map(([k, v]) => L({ t: `  ${k.padEnd(12)}`, c: C.accent }, { t: v.desc, c: C.dim })),
				L({ t: tx('  Tip: usá ↑/↓ para el historial y Tab para autocompletar.', '  Tip: use ↑/↓ for history and Tab to autocomplete.'), c: C.dim }),
			],
		},
		whoami: {
			desc: tx('quién soy', 'who am I'),
			run: () => [
				L({ t: 'Franco Gaggero', c: C.white }, { t: ' — Full Stack Developer & Game Maker', c: C.accent }),
				L(tx('Analista de Sistemas (DaVinci University) · Buenos Aires, AR', 'Systems Analyst (DaVinci University) · Buenos Aires, AR')),
				L(tx('Construyo productos web y mobile end-to-end, con specs, tests y CI.', 'I build web & mobile products end to end, with specs, tests and CI.')),
			],
		},
		skills: {
			desc: tx('stack por categoría — ej: skills testing', 'stack by category — e.g. skills testing'),
			run: (args) => {
				const q = (args[0] ?? '').toLowerCase();
				const cats = q ? data.stack.filter((c) => c.id.startsWith(q) || c.label.toLowerCase().includes(q)) : data.stack;
				if (q && !cats.length) {
					if ('workflows'.startsWith(q)) return data.workflows.map((w) => L({ t: '  ▸ ', c: C.violet }, w));
					return [L({ t: tx(`Categoría no encontrada: ${q}. Probá: `, `Unknown category: ${q}. Try: `), c: C.err }, { t: data.stack.map((c) => c.id).join(', ') + ', workflows', c: C.accent })];
				}
				const lines = cats.map((c) => L({ t: `  ${c.label.padEnd(20)}`, c: C.accent }, c.items.join(' · ')));
				if (!q) {
					lines.push(L({ t: `  ${'Workflows'.padEnd(20)}`, c: C.violet }, data.workflows.join(' · ')));
					lines.push(L({ t: `  ${tx('Aprendiendo', 'Learning').padEnd(20)}`, c: C.dim }, data.learning.join(' · ')));
				}
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
	const aliases: Record<string, string> = { about: 'whoami', stack: 'skills', exp: 'experience', git: 'experience', cls: 'clear', ls: 'projects', '?': 'help', theme: 'matrix' };
	const hidden = new Set(['sudo', 'matrix']);

	// ---------- output ----------
	const scrollDown = () => (body.scrollTop = body.scrollHeight);

	async function typeLine(line: Line, instant = false) {
		const row = document.createElement('div');
		row.className = 'whitespace-pre-wrap break-words';
		out.appendChild(row);
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
					await new Promise((r) => setTimeout(r, 8));
				}
			}
		}
		scrollDown();
	}

	async function exec(raw: string) {
		const cmdline = raw.trim();
		await typeLine(L({ t: 'franco@portfolio', c: C.ok }, { t: ':~$ ', c: C.dim }, { t: cmdline, c: C.white }), true);
		if (!cmdline) return;
		history.push(cmdline);
		hIndex = history.length;
		const [name, ...args] = cmdline.split(/\s+/);
		const key = aliases[name.toLowerCase()] ?? name.toLowerCase();
		const cmd = commands[key];
		const lines = cmd ? cmd.run(args) : [L({ t: tx(`comando no encontrado: ${name}. Escribí `, `command not found: ${name}. Type `), c: C.err }, { t: 'help', c: C.accent })];
		if (lines) for (const l of lines) await typeLine(l);
	}

	const queue: string[] = [];
	async function submit(value: string) {
		input.value = '';
		queue.push(value);
		drain();
	}
	async function drain() {
		if (busy) return;
		busy = true;
		while (queue.length) await exec(queue.shift()!);
		busy = false;
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

	// ---------- input ----------
	root.querySelector('form')!.addEventListener('submit', (e) => {
		e.preventDefault();
		submit(input.value);
	});
	input.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowUp' && history.length) {
			e.preventDefault();
			hIndex = Math.max(0, hIndex - 1);
			input.value = history[hIndex];
		} else if (e.key === 'ArrowDown' && history.length) {
			e.preventDefault();
			hIndex = Math.min(history.length, hIndex + 1);
			input.value = history[hIndex] ?? '';
		} else if (e.key === 'Tab') {
			const v = input.value.trim().toLowerCase();
			if (!v) return;
			const match = Object.keys(commands).filter((k) => !hidden.has(k)).find((k) => k.startsWith(v));
			if (match) {
				e.preventDefault();
				input.value = match + ' ';
			}
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
	window.addEventListener('keydown', (e) => {
		const tag = (document.activeElement as HTMLElement | null)?.tagName;
		if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
			e.preventDefault();
			root.scrollIntoView({ behavior: 'smooth', block: 'center' });
			input.focus({ preventScroll: true });
		}
	});

	// Welcome message once visible
	let greeted = false;
	new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting && !greeted) {
				greeted = true;
				(async () => {
					busy = true;
					await typeLine(L({ t: tx('Bienvenido/a 👋 Soy la terminal de Franco.', "Welcome 👋 I'm Franco's terminal."), c: C.white }));
					await typeLine(L(tx('Escribí ', 'Type '), { t: 'help', c: C.accent }, tx(' o tocá un comando de abajo.', ' or tap a command below.')));
					busy = false;
					drain();
				})();
			}
		},
		{ threshold: 0.4 },
	).observe(root);
}
