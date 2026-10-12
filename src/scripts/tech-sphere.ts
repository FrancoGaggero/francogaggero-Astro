/**
 * Draggable 3D sphere of tech logos. Pure DOM + CSS transforms, no WebGL.
 * Items are the direct children with [data-sphere-item] inside the container.
 */
export function initTechSphere(container: HTMLElement) {
	const items = Array.from(container.querySelectorAll<HTMLElement>('[data-sphere-item]'));
	const n = items.length;
	if (!n) return;

	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// Fibonacci sphere distribution
	const golden = Math.PI * (3 - Math.sqrt(5));
	const pts = items.map((_, i) => {
		const y = 1 - (i / (n - 1)) * 2;
		const r = Math.sqrt(1 - y * y);
		const theta = golden * i;
		return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r };
	});

	let radius = 0;
	const measure = () => (radius = container.clientWidth * 0.38);
	measure();
	new ResizeObserver(measure).observe(container);

	const idle = reduced ? 0 : 0.0035;
	let vx = 0; // rotation speed around X axis (rad/frame)
	let vy = idle; // rotation speed around Y axis
	let dragging = false;
	let lastX = 0;
	let lastY = 0;
	let hoverX = 0;
	let hoverY = 0;

	const rotate = (ax: number, ay: number) => {
		const cx = Math.cos(ax), sx = Math.sin(ax);
		const cy = Math.cos(ay), sy = Math.sin(ay);
		for (const p of pts) {
			// around Y
			const x1 = p.x * cy + p.z * sy;
			const z1 = -p.x * sy + p.z * cy;
			// around X
			const y2 = p.y * cx - z1 * sx;
			const z2 = p.y * sx + z1 * cx;
			p.x = x1;
			p.y = y2;
			p.z = z2;
		}
	};

	const render = () => {
		items.forEach((el, i) => {
			const p = pts[i];
			const depth = (p.z + 1) / 2; // 0 back → 1 front
			const scale = 0.55 + depth * 0.65;
			el.style.transform = `translate(-50%, -50%) translate3d(${p.x * radius}px, ${p.y * radius}px, 0) scale(${scale})`;
			el.style.opacity = String(0.2 + depth * 0.8);
			el.style.zIndex = String(Math.round(depth * 100));
			el.style.filter = depth < 0.35 ? `blur(${(0.35 - depth) * 4}px)` : '';
			el.style.pointerEvents = depth > 0.5 ? 'auto' : 'none';
		});
	};

	container.addEventListener('pointerdown', (e) => {
		dragging = true;
		lastX = e.clientX;
		lastY = e.clientY;
		container.setPointerCapture(e.pointerId);
		container.classList.add('cursor-grabbing');
	});
	container.addEventListener('pointermove', (e) => {
		const r = container.getBoundingClientRect();
		hoverX = ((e.clientX - r.left) / r.width - 0.5) * 2;
		hoverY = ((e.clientY - r.top) / r.height - 0.5) * 2;
		if (!dragging) return;
		vy = (e.clientX - lastX) * 0.005;
		vx = -(e.clientY - lastY) * 0.005;
		lastX = e.clientX;
		lastY = e.clientY;
	});
	const end = () => {
		dragging = false;
		container.classList.remove('cursor-grabbing');
	};
	container.addEventListener('pointerup', end);
	container.addEventListener('pointercancel', end);
	container.addEventListener('pointerleave', () => {
		hoverX = 0;
		hoverY = 0;
	});

	let visible = false;
	new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(container);

	const tick = () => {
		requestAnimationFrame(tick);
		if (!visible) return;
		if (!dragging) {
			// ease back to idle spin, slightly steered by the cursor
			const targetY = idle + hoverX * 0.012;
			const targetX = -hoverY * 0.012;
			vy += (targetY - vy) * 0.03;
			vx += (targetX - vx) * 0.03;
		}
		rotate(vx, vy);
		render();
	};
	render();
	tick();
}
