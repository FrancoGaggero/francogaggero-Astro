import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	Group,
	PerspectiveCamera,
	Points,
	Scene,
	ShaderMaterial,
	Vector2,
	Vector3,
	WebGLRenderer,
} from 'three';

const vertexShader = /* glsl */ `
	uniform float uTime;
	uniform float uProgress;
	uniform vec3 uMouse;
	uniform float uMouseForce;
	uniform float uScroll;
	uniform float uPixelRatio;
	uniform float uSize;

	attribute vec3 aStart;
	attribute float aSeed;

	varying float vAlpha;
	varying float vMix;

	void main() {
		float t = clamp(uProgress * 1.6 - aSeed * 0.6, 0.0, 1.0);
		t = t * t * (3.0 - 2.0 * t);
		vec3 p = mix(aStart, position, t);

		// idle breathing
		p.x += sin(uTime * 0.9 + aSeed * 40.0) * 0.025;
		p.y += cos(uTime * 0.8 + aSeed * 30.0) * 0.025;
		p.z += sin(uTime * 0.6 + aSeed * 20.0) * 0.12;

		// mouse repulsion
		vec2 d = p.xy - uMouse.xy;
		float dist = length(d);
		float force = smoothstep(1.4, 0.0, dist) * uMouseForce;
		p.xy += normalize(d + 0.0001) * force * 0.9;
		p.z += force * 1.8;

		// scroll: explode towards camera
		p += normalize(aStart + 0.001) * uScroll * (0.5 + aSeed) * 3.0;

		vec4 mv = modelViewMatrix * vec4(p, 1.0);
		gl_Position = projectionMatrix * mv;
		gl_PointSize = uSize * (0.6 + aSeed) * uPixelRatio * (7.0 / -mv.z);

		vAlpha = (0.35 + 0.65 * t) * (1.0 - uScroll * 0.8);
		vMix = clamp((position.x + 2.5) / 5.0 + (aSeed - 0.5) * 0.4 + force * 0.4, 0.0, 1.0);
	}
`;

const fragmentShader = /* glsl */ `
	varying float vAlpha;
	varying float vMix;

	void main() {
		vec2 c = gl_PointCoord - 0.5;
		float d = length(c);
		if (d > 0.5) discard;
		float glow = smoothstep(0.5, 0.0, d);
		vec3 cyan = vec3(0.13, 0.83, 0.93);
		vec3 violet = vec3(0.65, 0.55, 0.98);
		vec3 magenta = vec3(0.91, 0.47, 0.98);
		vec3 col = vMix < 0.5 ? mix(cyan, violet, vMix * 2.0) : mix(violet, magenta, (vMix - 0.5) * 2.0);
		gl_FragColor = vec4(col, glow * glow * vAlpha);
	}
`;

/** Samples the pixels of a text rendered on a 2D canvas and returns world positions. */
function sampleText(text: string, count: number, width: number): Float32Array {
	const cw = 900;
	const ch = 420;
	const canvas = document.createElement('canvas');
	canvas.width = cw;
	canvas.height = ch;
	const ctx = canvas.getContext('2d')!;
	ctx.fillStyle = '#fff';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = `700 380px "Space Grotesk", Inter, sans-serif`;
	ctx.fillText(text, cw / 2, ch / 2 + 10);
	const data = ctx.getImageData(0, 0, cw, ch).data;

	const pts: number[] = [];
	for (let y = 0; y < ch; y += 3) {
		for (let x = 0; x < cw; x += 3) {
			if (data[(y * cw + x) * 4 + 3] > 128) pts.push(x, y);
		}
	}
	const out = new Float32Array(count * 3);
	const scale = width / cw;
	for (let i = 0; i < count; i++) {
		const j = Math.floor(Math.random() * (pts.length / 2)) * 2;
		out[i * 3] = (pts[j] - cw / 2) * scale + (Math.random() - 0.5) * 0.02;
		out[i * 3 + 1] = -(pts[j + 1] - ch / 2) * scale + (Math.random() - 0.5) * 0.02;
		out[i * 3 + 2] = (Math.random() - 0.5) * 0.35;
	}
	return out;
}

function randomSphere(count: number, radius: number): Float32Array {
	const out = new Float32Array(count * 3);
	for (let i = 0; i < count; i++) {
		const u = Math.random();
		const v = Math.random();
		const theta = u * Math.PI * 2;
		const phi = Math.acos(2 * v - 1);
		const r = radius * Math.cbrt(Math.random());
		out[i * 3] = r * Math.sin(phi) * Math.cos(theta);
		out[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
		out[i * 3 + 2] = r * Math.cos(phi);
	}
	return out;
}

export async function initParticles(container: HTMLElement) {
	const canvas = document.createElement('canvas');
	const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
	if (!gl) throw new Error('no-webgl');

	await document.fonts.load('700 100px "Space Grotesk"').catch(() => {});

	const isMobile = window.innerWidth < 768;
	const count = isMobile ? 4500 : 11000;
	const dustCount = isMobile ? 500 : 1400;

	const renderer = new WebGLRenderer({ canvas, context: gl as WebGLRenderingContext, antialias: false, alpha: true, powerPreference: 'high-performance' });
	const dpr = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);
	renderer.setPixelRatio(dpr);
	renderer.setClearColor(0x000000, 0);
	canvas.className = 'absolute inset-0 h-full w-full';
	container.appendChild(canvas);

	const scene = new Scene();
	const camera = new PerspectiveCamera(45, 1, 0.1, 100);
	camera.position.set(0, 0, 9);

	const group = new Group();
	scene.add(group);

	// --- Logo particles ---
	const geo = new BufferGeometry();
	geo.setAttribute('position', new BufferAttribute(sampleText('FG', count, 5.2), 3));
	geo.setAttribute('aStart', new BufferAttribute(randomSphere(count, 9), 3));
	const seeds = new Float32Array(count);
	for (let i = 0; i < count; i++) seeds[i] = Math.random();
	geo.setAttribute('aSeed', new BufferAttribute(seeds, 1));

	const uniforms = {
		uTime: { value: 0 },
		uProgress: { value: 0 },
		uMouse: { value: new Vector3(99, 99, 0) },
		uMouseForce: { value: 0 },
		uScroll: { value: 0 },
		uPixelRatio: { value: dpr },
		uSize: { value: isMobile ? 7 : 6 },
	};
	const material = new ShaderMaterial({
		vertexShader,
		fragmentShader,
		uniforms,
		transparent: true,
		depthWrite: false,
		blending: AdditiveBlending,
	});
	group.add(new Points(geo, material));

	// --- Ambient dust (always scattered) ---
	const dustGeo = new BufferGeometry();
	const dustPos = randomSphere(dustCount, 12);
	dustGeo.setAttribute('position', new BufferAttribute(dustPos, 3));
	dustGeo.setAttribute('aStart', new BufferAttribute(dustPos, 3));
	const dustSeeds = new Float32Array(dustCount);
	for (let i = 0; i < dustCount; i++) dustSeeds[i] = Math.random();
	dustGeo.setAttribute('aSeed', new BufferAttribute(dustSeeds, 1));
	const dustMat = material.clone();
	dustMat.uniforms = { ...uniforms, uProgress: { value: 1 }, uSize: { value: 4 }, uMouseForce: { value: 0 } };
	const dust = new Points(dustGeo, dustMat);
	scene.add(dust);

	// --- Layout ---
	const resize = () => {
		const w = container.clientWidth;
		const h = container.clientHeight;
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		const wide = w >= 1024;
		group.position.x = wide ? 2.6 : 0;
		group.position.y = wide ? 0 : 2.1;
		group.scale.setScalar(wide ? 1 : Math.min(1, w / 700));
	};
	resize();
	window.addEventListener('resize', resize);

	// --- Pointer ---
	const pointer = new Vector2(0, 0);
	const target = new Vector3(99, 99, 0);
	let forceTarget = 0;
	let lastMove = 0;
	const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
	const onPointer = (e: PointerEvent) => {
		const r = container.getBoundingClientRect();
		pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
		pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
		target.set(
			(pointer.x * halfH * camera.aspect - group.position.x) / group.scale.x,
			(pointer.y * halfH - group.position.y) / group.scale.y,
			0,
		);
		forceTarget = 1;
		lastMove = performance.now();
	};
	window.addEventListener('pointermove', onPointer, { passive: true });
	window.addEventListener('pointerdown', onPointer, { passive: true });

	// --- Loop (paused when hero is offscreen) ---
	let visible = true;
	new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(container);

	const start = performance.now();
	let rotX = 0;
	let rotY = 0;
	const tick = () => {
		requestAnimationFrame(tick);
		if (!visible) return;
		const now = performance.now();
		const elapsed = (now - start) / 1000;
		uniforms.uTime.value = elapsed;
		uniforms.uProgress.value = Math.min(1, elapsed / 2.6);
		if (now - lastMove > 900) forceTarget = 0;
		uniforms.uMouseForce.value += (forceTarget - uniforms.uMouseForce.value) * 0.06;
		uniforms.uMouse.value.lerp(target, 0.15);
		uniforms.uScroll.value = Math.min(1, window.scrollY / (container.clientHeight * 0.9));

		rotY += (pointer.x * 0.35 - rotY) * 0.04;
		rotX += (-pointer.y * 0.2 - rotX) * 0.04;
		group.rotation.set(rotX, rotY + Math.sin(elapsed * 0.3) * 0.05, 0);
		dust.rotation.y = elapsed * 0.02;

		renderer.render(scene, camera);
	};
	tick();
}
