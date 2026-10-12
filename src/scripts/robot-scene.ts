/**
 * 3D scene: a little robot coding at a desk, next to a rocket on a launch pad.
 * `portfolio:deploy` (window CustomEvent) triggers the launch sequence; when it
 * finishes the scene dispatches `portfolio:launched`.
 * Everything is procedural (primitives + canvas textures), no external models.
 */
import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	CanvasTexture,
	Color,
	ConeGeometry,
	CylinderGeometry,
	DirectionalLight,
	Fog,
	GridHelper,
	Group,
	HemisphereLight,
	LatheGeometry,
	LineBasicMaterial,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	NormalBlending,
	PerspectiveCamera,
	PlaneGeometry,
	PointLight,
	Points,
	Scene,
	ShaderMaterial,
	SphereGeometry,
	CapsuleGeometry,
	TorusGeometry,
	Vector2,
	Vector3,
	WebGLRenderer,
	BoxGeometry,
	DoubleSide,
	SRGBColorSpace,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const BG = 0x07080d;
const CYAN = 0x22d3ee;
const VIOLET = 0xa78bfa;

// ---------------------------------------------------------------- particles
const particleVS = /* glsl */ `
	attribute float aSize;
	attribute float aAlpha;
	attribute vec3 aColor;
	varying float vAlpha;
	varying vec3 vColor;
	uniform float uPixelRatio;
	void main() {
		vec4 mv = modelViewMatrix * vec4(position, 1.0);
		gl_Position = projectionMatrix * mv;
		gl_PointSize = aSize * uPixelRatio * (10.0 / -mv.z);
		vAlpha = aAlpha;
		vColor = aColor;
	}
`;
const particleFS = /* glsl */ `
	varying float vAlpha;
	varying vec3 vColor;
	void main() {
		float d = length(gl_PointCoord - 0.5);
		if (d > 0.5) discard;
		float a = smoothstep(0.5, 0.0, d);
		gl_FragColor = vec4(vColor, a * vAlpha);
	}
`;

class ParticlePool {
	readonly points: Points;
	private pos: Float32Array;
	private size: Float32Array;
	private alpha: Float32Array;
	private color: Float32Array;
	private vel: Float32Array;
	private life: Float32Array;
	private maxLife: Float32Array;
	private baseSize: Float32Array;
	private next = 0;

	constructor(
		private count: number,
		additive: boolean,
		pixelRatio: number,
		private opts: { grow: number; gravity: number; drag: number; fade: 'out' | 'inout' },
	) {
		const geo = new BufferGeometry();
		this.pos = new Float32Array(count * 3).fill(9999);
		this.size = new Float32Array(count);
		this.alpha = new Float32Array(count);
		this.color = new Float32Array(count * 3);
		this.vel = new Float32Array(count * 3);
		this.life = new Float32Array(count);
		this.maxLife = new Float32Array(count).fill(1);
		this.baseSize = new Float32Array(count);
		geo.setAttribute('position', new BufferAttribute(this.pos, 3));
		geo.setAttribute('aSize', new BufferAttribute(this.size, 1));
		geo.setAttribute('aAlpha', new BufferAttribute(this.alpha, 1));
		geo.setAttribute('aColor', new BufferAttribute(this.color, 3));
		const mat = new ShaderMaterial({
			vertexShader: particleVS,
			fragmentShader: particleFS,
			uniforms: { uPixelRatio: { value: pixelRatio } },
			transparent: true,
			depthWrite: false,
			blending: additive ? AdditiveBlending : NormalBlending,
		});
		this.points = new Points(geo, mat);
		this.points.frustumCulled = false;
	}

	emit(p: Vector3, v: Vector3, life: number, size: number, c: Color) {
		const i = this.next;
		this.next = (this.next + 1) % this.count;
		this.pos.set([p.x, p.y, p.z], i * 3);
		this.vel.set([v.x, v.y, v.z], i * 3);
		this.color.set([c.r, c.g, c.b], i * 3);
		this.life[i] = life;
		this.maxLife[i] = life;
		this.baseSize[i] = size;
	}

	update(dt: number) {
		const { grow, gravity, drag, fade } = this.opts;
		for (let i = 0; i < this.count; i++) {
			if (this.life[i] <= 0) {
				this.alpha[i] = 0;
				continue;
			}
			this.life[i] -= dt;
			const k = 1 - this.life[i] / this.maxLife[i]; // 0 → 1
			const j = i * 3;
			this.vel[j + 1] -= gravity * dt;
			const d = Math.pow(drag, dt * 60);
			this.vel[j] *= d;
			this.vel[j + 1] *= d;
			this.vel[j + 2] *= d;
			this.pos[j] += this.vel[j] * dt;
			this.pos[j + 1] += this.vel[j + 1] * dt;
			this.pos[j + 2] += this.vel[j + 2] * dt;
			this.size[i] = this.baseSize[i] * (1 + k * grow);
			this.alpha[i] = fade === 'out' ? 1 - k : Math.sin(Math.PI * Math.min(1, k * 1.3)) * (1 - k);
		}
		const g = this.points.geometry;
		g.attributes.position.needsUpdate = true;
		g.attributes.aSize.needsUpdate = true;
		g.attributes.aAlpha.needsUpdate = true;
		g.attributes.aColor.needsUpdate = true;
	}
}

// ---------------------------------------------------------------- hologram screen
const CODE = [
	[['const ', '#c084fc'], ['deploy', '#67e8f9'], [' = async () => {', '#e2e8f0']],
	[['  await ', '#c084fc'], ['runTests', '#67e8f9'], ['();', '#e2e8f0']],
	[['  const ', '#c084fc'], ['build', '#e2e8f0'], [' = ', '#e2e8f0'], ['await ', '#c084fc'], ['vite', '#67e8f9'], ['.build();', '#e2e8f0']],
	[['  if ', '#c084fc'], ['(!build.ok) ', '#e2e8f0'], ['throw ', '#f472b6'], ['new Error();', '#e2e8f0']],
	[['  return ', '#c084fc'], ['rocket', '#fbbf24'], ['.launch({ to: ', '#e2e8f0'], ["'prod'", '#86efac'], [' });', '#e2e8f0']],
	[['};', '#e2e8f0']],
	[['', '#e2e8f0']],
	[['// TODO: ', '#64748b'], ['hire Franco ✓', '#86efac']],
	[['export default ', '#c084fc'], ['function ', '#c084fc'], ['App', '#fbbf24'], ['() {', '#e2e8f0']],
	[['  return ', '#c084fc'], ['<Portfolio ', '#67e8f9'], ['stack', '#fbbf24'], ['="fullstack" />', '#86efac']],
	[['}', '#e2e8f0']],
	[['', '#e2e8f0']],
	[['test', '#67e8f9'], ["('ships to prod', ", '#86efac'], ['() => {', '#e2e8f0']],
	[['  expect', '#67e8f9'], ['(deploy()).', '#e2e8f0'], ['resolves', '#67e8f9'], ['.toBe(', '#e2e8f0'], ['true', '#fbbf24'], [');', '#e2e8f0']],
	[['});', '#e2e8f0']],
] as const;

class Hologram {
	readonly texture: CanvasTexture;
	private ctx: CanvasRenderingContext2D;
	private canvas: HTMLCanvasElement;
	private line = 0;
	private char = 0;
	private acc = 0;
	mode: 'code' | 'count' | 'done' = 'code';
	countText = '';

	constructor() {
		this.canvas = document.createElement('canvas');
		this.canvas.width = 512;
		this.canvas.height = 300;
		this.ctx = this.canvas.getContext('2d')!;
		this.texture = new CanvasTexture(this.canvas);
		this.texture.colorSpace = SRGBColorSpace;
		this.draw();
	}

	private frame() {
		const c = this.ctx;
		c.fillStyle = 'rgba(6, 20, 30, 0.92)';
		c.fillRect(0, 0, 512, 300);
		c.strokeStyle = 'rgba(34, 211, 238, 0.7)';
		c.lineWidth = 4;
		c.strokeRect(2, 2, 508, 296);
		c.fillStyle = 'rgba(34, 211, 238, 0.15)';
		c.fillRect(2, 2, 508, 26);
		c.font = '600 15px "JetBrains Mono", monospace';
		c.fillStyle = '#67e8f9';
		c.fillText('deploy.ts — franco@portfolio', 14, 20);
		// scanlines
		c.fillStyle = 'rgba(255,255,255,0.025)';
		for (let y = 30; y < 300; y += 4) c.fillRect(0, y, 512, 1);
	}

	private draw() {
		this.frame();
		const c = this.ctx;
		if (this.mode === 'code') {
			c.font = '16px "JetBrains Mono", monospace';
			const visible = 12;
			const start = Math.max(0, this.line - visible + 1);
			for (let l = start; l <= this.line; l++) {
				const tokens = CODE[l % CODE.length];
				let x = 40;
				const y = 52 + (l - start) * 20.5;
				c.fillStyle = '#334155';
				c.fillText(String((l % CODE.length) + 1).padStart(2, ' '), 10, y);
				let remaining = l === this.line ? this.char : Infinity;
				for (const [text, color] of tokens) {
					if (remaining <= 0) break;
					const part = text.slice(0, remaining);
					remaining -= text.length;
					c.fillStyle = color;
					c.fillText(part, x, y);
					x += c.measureText(part).width;
				}
				if (l === this.line && Math.floor(performance.now() / 400) % 2) {
					c.fillStyle = '#67e8f9';
					c.fillRect(x + 1, y - 13, 8, 16);
				}
			}
		} else {
			c.textAlign = 'center';
			c.font = this.mode === 'count' ? '700 120px "Space Grotesk", sans-serif' : '700 46px "Space Grotesk", sans-serif';
			c.fillStyle = this.mode === 'count' ? '#fbbf24' : '#86efac';
			c.fillText(this.countText, 256, this.mode === 'count' ? 205 : 175);
			c.textAlign = 'left';
		}
		this.texture.needsUpdate = true;
	}

	update(dt: number, typing: boolean) {
		this.acc += dt;
		if (this.mode !== 'code') return;
		if (typing && this.acc > 0.045) {
			this.acc = 0;
			const len = CODE[this.line % CODE.length].reduce((n, [t]) => n + t.length, 0);
			this.char++;
			if (this.char > len) {
				this.line++;
				this.char = 0;
			}
			this.draw();
		} else if (this.acc > 0.4) {
			this.acc = 0;
			this.draw(); // cursor blink
		}
	}

	show(mode: 'code' | 'count' | 'done', text = '') {
		this.mode = mode;
		this.countText = text;
		this.draw();
	}
}

// ---------------------------------------------------------------- builders
function buildRobot() {
	const white = new MeshStandardMaterial({ color: 0xe8edf5, metalness: 0.25, roughness: 0.35 });
	const grey = new MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.4 });
	const dark = new MeshStandardMaterial({ color: 0x0b1020, metalness: 0.3, roughness: 0.2 });
	const glow = new MeshBasicMaterial({ color: CYAN });

	const robot = new Group();

	const torso = new Mesh(new RoundedBoxGeometry(0.95, 0.95, 0.62, 4, 0.18), white);
	torso.position.y = 1.45;
	robot.add(torso);
	const chest = new Mesh(new RoundedBoxGeometry(0.42, 0.26, 0.05, 2, 0.04), dark);
	chest.position.set(0, 1.5, 0.31);
	robot.add(chest);
	const chestLight = new Mesh(new BoxGeometry(0.3, 0.05, 0.02), glow);
	chestLight.position.set(0, 1.5, 0.34);
	robot.add(chestLight);

	const neck = new Mesh(new CylinderGeometry(0.1, 0.12, 0.16, 12), grey);
	neck.position.y = 2.0;
	robot.add(neck);

	const head = new Group();
	head.position.y = 2.38;
	robot.add(head);
	head.add(new Mesh(new RoundedBoxGeometry(0.82, 0.62, 0.62, 4, 0.2), white));
	const visor = new Mesh(new RoundedBoxGeometry(0.66, 0.3, 0.05, 2, 0.08), dark);
	visor.position.set(0, 0.02, 0.31);
	head.add(visor);
	const eyes: Mesh[] = [];
	for (const x of [-0.14, 0.14]) {
		const eye = new Mesh(new CapsuleGeometry(0.045, 0.06, 4, 8), glow);
		eye.position.set(x, 0.02, 0.345);
		head.add(eye);
		eyes.push(eye);
	}
	for (const x of [-0.43, 0.43]) {
		const ear = new Mesh(new CylinderGeometry(0.09, 0.09, 0.08, 16), grey);
		ear.rotation.z = Math.PI / 2;
		ear.position.x = x;
		head.add(ear);
	}
	const antenna = new Mesh(new CylinderGeometry(0.015, 0.015, 0.3, 6), grey);
	antenna.position.y = 0.45;
	head.add(antenna);
	const bulbMat = new MeshBasicMaterial({ color: 0xf43f5e });
	const bulb = new Mesh(new SphereGeometry(0.06, 12, 12), bulbMat);
	bulb.position.y = 0.62;
	head.add(bulb);

	const makeArm = (side: 1 | -1) => {
		const shoulder = new Group();
		shoulder.position.set(0.56 * side, 1.78, 0);
		robot.add(shoulder);
		const joint = new Mesh(new SphereGeometry(0.12, 16, 16), grey);
		shoulder.add(joint);
		const upper = new Mesh(new CapsuleGeometry(0.09, 0.32, 4, 10), white);
		upper.position.y = -0.24;
		shoulder.add(upper);
		const elbow = new Group();
		elbow.position.y = -0.46;
		shoulder.add(elbow);
		const fore = new Mesh(new CapsuleGeometry(0.08, 0.3, 4, 10), white);
		fore.position.y = -0.2;
		elbow.add(fore);
		const hand = new Mesh(new SphereGeometry(0.1, 12, 12), grey);
		hand.position.y = -0.42;
		elbow.add(hand);
		return { shoulder, elbow };
	};

	return { robot, head, eyes, bulbMat, left: makeArm(-1), right: makeArm(1) };
}

function buildDesk() {
	const desk = new Group();
	const top = new MeshStandardMaterial({ color: 0x1e293b, metalness: 0.4, roughness: 0.5 });
	const plank = new Mesh(new RoundedBoxGeometry(2.0, 0.08, 0.95, 2, 0.03), top);
	plank.position.y = 1.0;
	desk.add(plank);
	for (const x of [-0.9, 0.9]) {
		const leg = new Mesh(new BoxGeometry(0.07, 1.0, 0.8), top);
		leg.position.set(x, 0.5, 0);
		desk.add(leg);
	}
	const kb = new Mesh(new RoundedBoxGeometry(0.95, 0.05, 0.32, 2, 0.02), new MeshStandardMaterial({ color: 0x0f172a, metalness: 0.5, roughness: 0.3 }));
	kb.position.set(0, 1.07, 0.12);
	desk.add(kb);
	const keyGlow = new Mesh(new PlaneGeometry(0.85, 0.24), new MeshBasicMaterial({ color: VIOLET, transparent: true, opacity: 0.35 }));
	keyGlow.rotation.x = -Math.PI / 2;
	keyGlow.position.set(0, 1.1, 0.12);
	desk.add(keyGlow);
	const mug = new Mesh(new CylinderGeometry(0.08, 0.07, 0.16, 16), new MeshStandardMaterial({ color: 0xfb923c, roughness: 0.4 }));
	mug.position.set(0.72, 1.12, 0.1);
	desk.add(mug);
	return desk;
}

const flameVS = /* glsl */ `
	varying vec2 vUv;
	void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const flameFS = /* glsl */ `
	uniform float uTime;
	uniform float uPower;
	varying vec2 vUv;
	float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
	float noise(vec2 p) {
		vec2 i = floor(p); vec2 f = fract(p);
		float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
		vec2 u = f * f * (3.0 - 2.0 * f);
		return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
	}
	void main() {
		float y = vUv.y; // 0 = tip (bottom), 1 = nozzle
		float n = noise(vec2(vUv.x * 8.0, y * 6.0 + uTime * 14.0));
		float core = smoothstep(0.0, 1.0, y) * (0.65 + 0.35 * n);
		vec3 col = mix(vec3(1.0, 0.25, 0.05), vec3(1.0, 0.85, 0.4), core);
		col = mix(col, vec3(0.8, 0.95, 1.0), smoothstep(0.85, 1.0, y));
		float alpha = core * uPower * (0.75 + 0.25 * n);
		gl_FragColor = vec4(col * 2.0, alpha);
	}
`;

function buildRocket() {
	const rocket = new Group();
	const body = new MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.35, roughness: 0.3 });
	const red = new MeshStandardMaterial({ color: 0xef4444, metalness: 0.3, roughness: 0.35 });

	// body profile (lathe)
	const pts: Vector2[] = [];
	for (let i = 0; i <= 20; i++) {
		const t = i / 20;
		const y = t * 2.0;
		const r = t < 0.12 ? 0.24 + t * 0.6 : 0.31 - Math.pow(Math.max(0, t - 0.55), 2) * 1.2;
		pts.push(new Vector2(Math.max(0.02, r), y));
	}
	const hull = new Mesh(new LatheGeometry(pts, 28), body);
	rocket.add(hull);
	const nose = new Mesh(new ConeGeometry(0.21, 0.55, 28), red);
	nose.position.y = 2.25;
	rocket.add(nose);
	const band = new Mesh(new CylinderGeometry(0.315, 0.315, 0.1, 28), red);
	band.position.y = 0.5;
	rocket.add(band);
	const win = new Mesh(new TorusGeometry(0.11, 0.03, 10, 24), new MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 }));
	win.position.set(0, 1.4, 0.29);
	rocket.add(win);
	const glass = new Mesh(new SphereGeometry(0.1, 16, 16), new MeshBasicMaterial({ color: CYAN }));
	glass.scale.z = 0.3;
	glass.position.set(0, 1.4, 0.28);
	rocket.add(glass);
	for (let i = 0; i < 3; i++) {
		const fin = new Mesh(new BoxGeometry(0.04, 0.5, 0.32), red);
		const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
		fin.position.set(Math.cos(a) * 0.32, 0.25, Math.sin(a) * 0.32);
		fin.rotation.y = -a;
		rocket.add(fin);
	}
	const nozzle = new Mesh(new CylinderGeometry(0.16, 0.22, 0.18, 20, 1, true), new MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3, side: DoubleSide }));
	nozzle.position.y = -0.06;
	rocket.add(nozzle);

	const flameMat = new ShaderMaterial({
		vertexShader: flameVS,
		fragmentShader: flameFS,
		uniforms: { uTime: { value: 0 }, uPower: { value: 0 } },
		transparent: true,
		depthWrite: false,
		blending: AdditiveBlending,
		side: DoubleSide,
	});
	const flame = new Mesh(new ConeGeometry(0.2, 1.4, 24, 1, true), flameMat);
	flame.rotation.x = Math.PI; // tip down
	flame.position.y = -0.85;
	flame.scale.set(1, 0.01, 1);
	rocket.add(flame);

	const engineLight = new PointLight(0xff8a3d, 0, 6, 1.5);
	engineLight.position.y = -0.4;
	rocket.add(engineLight);

	return { rocket, flame, flameMat, engineLight };
}

function buildPad() {
	const pad = new Group();
	const metal = new MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.35 });
	const base = new Mesh(new CylinderGeometry(0.85, 0.95, 0.2, 32), metal);
	base.position.y = 0.1;
	pad.add(base);
	const ringMat = new MeshBasicMaterial({ color: CYAN });
	const ring = new Mesh(new TorusGeometry(0.88, 0.025, 8, 48), ringMat);
	ring.rotation.x = Math.PI / 2;
	ring.position.y = 0.2;
	pad.add(ring);
	// support tower
	const tower = new Mesh(new BoxGeometry(0.12, 2.6, 0.12), metal);
	tower.position.set(-0.75, 1.3, -0.35);
	pad.add(tower);
	const arm = new Mesh(new BoxGeometry(0.5, 0.06, 0.06), metal);
	arm.position.set(-0.5, 1.9, -0.25);
	pad.add(arm);
	const warn = new MeshBasicMaterial({ color: 0x22c55e });
	const beacon = new Mesh(new SphereGeometry(0.07, 12, 12), warn);
	beacon.position.set(-0.75, 2.66, -0.35);
	pad.add(beacon);
	return { pad, ringMat, beaconMat: warn };
}

// ---------------------------------------------------------------- scene
export function initRobotScene(container: HTMLElement) {
	const canvas = document.createElement('canvas');
	const gl = canvas.getContext('webgl2');
	if (!gl) throw new Error('no-webgl');

	const isMobile = window.innerWidth < 768;
	const dpr = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);
	const renderer = new WebGLRenderer({ canvas, context: gl, antialias: true, powerPreference: 'high-performance' });
	renderer.setPixelRatio(dpr);
	canvas.className = 'absolute inset-0 h-full w-full';
	container.appendChild(canvas);

	const scene = new Scene();
	scene.background = new Color(BG);
	scene.fog = new Fog(BG, 9, 22);

	const camera = new PerspectiveCamera(40, 1, 0.1, 100);
	const camBase = new Vector3(0.1, 2.3, 8.6);
	const lookBase = new Vector3(0.1, 1.75, 0);
	const look = lookBase.clone();
	camera.position.copy(camBase);

	scene.add(new HemisphereLight(0xb4c6ff, 0x0b0d14, 1.1));
	const key = new DirectionalLight(0xffffff, 1.6);
	key.position.set(3, 6, 5);
	scene.add(key);
	const rim = new PointLight(VIOLET, 6, 10, 1.5);
	rim.position.set(-3, 3, -2);
	scene.add(rim);
	const screenLight = new PointLight(CYAN, 4, 5, 1.5);
	screenLight.position.set(-1.1, 2.9, 0.6);
	scene.add(screenLight);

	// floor
	const grid = new GridHelper(30, 40, CYAN, 0x1e293b);
	const gridMat = grid.material as LineBasicMaterial;
	gridMat.transparent = true;
	gridMat.opacity = 0.35;
	scene.add(grid);
	const floor = new Mesh(new PlaneGeometry(30, 30), new MeshStandardMaterial({ color: 0x0a0c14, roughness: 0.9 }));
	floor.rotation.x = -Math.PI / 2;
	floor.position.y = -0.01;
	scene.add(floor);

	// stars
	const starGeo = new BufferGeometry();
	const starPos = new Float32Array(500 * 3);
	for (let i = 0; i < 500; i++) starPos.set([(Math.random() - 0.5) * 40, 3 + Math.random() * 25, -8 - Math.random() * 10], i * 3);
	starGeo.setAttribute('position', new BufferAttribute(starPos, 3));
	scene.add(new Points(starGeo, new ShaderMaterial({ vertexShader: 'void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=2.0;}', fragmentShader: 'void main(){gl_FragColor=vec4(0.8,0.85,1.0,0.7);}', transparent: true })));

	// robot workstation
	const station = new Group();
	station.position.set(-1.15, 0, 0);
	station.rotation.y = 0.28;
	scene.add(station);
	const bot = buildRobot();
	bot.robot.position.z = -0.55;
	station.add(bot.robot);
	station.add(buildDesk());

	const holo = new Hologram();
	const holoMesh = new Mesh(new PlaneGeometry(2.0, 1.17), new MeshBasicMaterial({ map: holo.texture, transparent: true, opacity: 0.95, toneMapped: false }));
	holoMesh.position.set(-0.05, 3.62, -0.2);
	holoMesh.rotation.x = 0.05;
	station.add(holoMesh);

	// rocket
	const padWrap = new Group();
	padWrap.position.set(1.55, 0, -0.2);
	scene.add(padWrap);
	const padParts = buildPad();
	padWrap.add(padParts.pad);
	const rk = buildRocket();
	rk.rocket.position.y = 0.32;
	padWrap.add(rk.rocket);

	// particles
	const smoke = new ParticlePool(isMobile ? 260 : 520, false, dpr, { grow: 4, gravity: -0.15, drag: 0.97, fade: 'inout' });
	const sparks = new ParticlePool(isMobile ? 160 : 320, true, dpr, { grow: -0.6, gravity: 6, drag: 0.985, fade: 'out' });
	const trail = new ParticlePool(isMobile ? 220 : 420, true, dpr, { grow: 1.5, gravity: 0, drag: 0.94, fade: 'out' });
	scene.add(smoke.points, sparks.points, trail.points);

	// post-processing
	const composer = new EffectComposer(renderer);
	composer.addPass(new RenderPass(scene, camera));
	const bloom = new UnrealBloomPass(new Vector2(256, 256), 0.55, 0.5, 0.75);
	composer.addPass(bloom);
	composer.addPass(new OutputPass());

	const resize = () => {
		const w = container.clientWidth;
		const h = container.clientHeight;
		renderer.setSize(w, h, false);
		composer.setSize(w, h);
		camera.aspect = w / h;
		// keep the whole set in frame on narrow containers
		camera.fov = w / h < 0.85 ? 48 : 40;
		camera.updateProjectionMatrix();
	};
	resize();
	new ResizeObserver(resize).observe(container);

	// pointer
	const pointer = new Vector2();
	container.addEventListener('pointermove', (e) => {
		const r = container.getBoundingClientRect();
		pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
	});
	container.addEventListener('pointerleave', () => pointer.set(0, 0));

	// ---------------------------------------------------------- launch state
	let launching = false;
	let tl = 0; // seconds since launch start
	let countShown = '';
	const tmpP = new Vector3();
	const tmpV = new Vector3();
	const smokeColor = new Color(0x9ca3af);
	const sparkColor = new Color(0xffb347);
	const fireColor = new Color(0xff7a2f);
	const nozzleWorld = new Vector3();

	window.addEventListener('portfolio:deploy', () => {
		if (launching) return;
		launching = true;
		tl = 0;
	});

	const emitSmoke = (n: number, spread: number, y = 0.2) => {
		for (let i = 0; i < n; i++) {
			const a = Math.random() * Math.PI * 2;
			tmpP.set(padWrap.position.x + Math.cos(a) * 0.3, y, padWrap.position.z + Math.sin(a) * 0.3);
			tmpV.set(Math.cos(a) * spread * (0.5 + Math.random()), Math.random() * 0.6, Math.sin(a) * spread * (0.5 + Math.random()) * 0.6);
			smoke.emit(tmpP, tmpV, 1.8 + Math.random() * 1.4, 18 + Math.random() * 14, smokeColor);
		}
	};
	const emitSparks = (n: number, origin: Vector3, power: number) => {
		for (let i = 0; i < n; i++) {
			tmpV.set((Math.random() - 0.5) * 4 * power, Math.random() * 2.5 * power, (Math.random() - 0.5) * 3 * power);
			sparks.emit(origin, tmpV, 0.4 + Math.random() * 0.5, 4 + Math.random() * 4, sparkColor);
		}
	};

	// ---------------------------------------------------------- loop
	let visible = true;
	new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(container);
	let last = performance.now();
	let time = 0;
	let shake = 0;
	let blinkIn = 2;

	const tick = (now: number) => {
		requestAnimationFrame(tick);
		if (!visible) {
			last = now;
			return;
		}
		const dt = Math.min((now - last) / 1000, 1 / 20);
		last = now;
		time += dt;

		// --- robot idle / typing
		const typing = !launching || tl > 8.6;
		const lookRocket = launching && tl < 8.6 ? 1 : 0;
		bot.head.rotation.y += ((lookRocket ? 0.9 : pointer.x * 0.35) - bot.head.rotation.y) * 0.08;
		bot.head.rotation.x += ((lookRocket ? -0.25 - Math.min(tl, 7) * 0.05 : -pointer.y * 0.15 + 0.12) - bot.head.rotation.x) * 0.08;
		bot.head.position.y = 2.38 + Math.sin(time * 2) * 0.012;
		if (typing) {
			const s = time * 16;
			bot.left.shoulder.rotation.x += (-0.9 + Math.sin(s) * 0.12 - bot.left.shoulder.rotation.x) * 0.3;
			bot.right.shoulder.rotation.x += (-0.9 + Math.sin(s + 1.7) * 0.12 - bot.right.shoulder.rotation.x) * 0.3;
			bot.left.elbow.rotation.x = -0.7 + Math.max(0, Math.sin(s * 1.3)) * 0.25;
			bot.right.elbow.rotation.x = -0.7 + Math.max(0, Math.sin(s * 1.3 + 2)) * 0.25;
			bot.right.shoulder.rotation.z += (0 - bot.right.shoulder.rotation.z) * 0.1;
		} else {
			// right arm up (cheering towards the rocket), left resting
			bot.right.shoulder.rotation.x += (-2.7 - bot.right.shoulder.rotation.x) * 0.08;
			bot.right.shoulder.rotation.z += (-0.25 + Math.sin(time * 10) * 0.12 - bot.right.shoulder.rotation.z) * 0.15;
			bot.right.elbow.rotation.x += (-0.3 - bot.right.elbow.rotation.x) * 0.1;
			bot.left.shoulder.rotation.x += (-0.5 - bot.left.shoulder.rotation.x) * 0.08;
			bot.left.elbow.rotation.x += (-0.4 - bot.left.elbow.rotation.x) * 0.08;
		}
		blinkIn -= dt;
		const blink = blinkIn < 0 && blinkIn > -0.12;
		if (blinkIn < -0.12) blinkIn = 2 + Math.random() * 3;
		bot.eyes.forEach((e) => (e.scale.y = blink ? 0.1 : 1));
		bot.bulbMat.color.setHex(Math.floor(time * 2) % 2 ? 0xf43f5e : 0x7f1d1d);
		holo.update(dt, typing);
		holoMesh.position.y = 3.62 + Math.sin(time * 1.5) * 0.04;

		// --- launch sequence
		rk.flameMat.uniforms.uTime.value = time;
		let power = 0;
		if (launching) {
			tl += dt;
			const count = tl < 1 ? '' : tl < 2 ? '3' : tl < 3 ? '2' : tl < 4 ? '1' : tl < 8 ? 'GO' : 'done';
			if (count !== countShown) {
				countShown = count;
				if (count === 'done') holo.show('done', '✓ DEPLOYED');
				else if (count === 'GO') holo.show('count', '🚀');
				else if (count) holo.show('count', count);
			}
			padParts.beaconMat.color.setHex(tl < 4 && Math.floor(tl * 4) % 2 ? 0xef4444 : tl < 4 ? 0x450a0a : 0x22c55e);
			padParts.ringMat.color.setHex(tl > 2.5 && tl < 6 ? 0xfb923c : CYAN);

			rk.rocket.getWorldPosition(nozzleWorld);
			if (tl > 2.6 && tl < 4) {
				power = (tl - 2.6) / 1.4 * 0.5;
				if (Math.random() < 0.5) emitSparks(3, nozzleWorld, 0.6);
				emitSmoke(1, 1.2);
				rk.rocket.position.x = (Math.random() - 0.5) * 0.02;
			} else if (tl >= 4 && tl < 8.2) {
				power = 1;
				const t = tl - 4;
				// slow lift-off then acceleration
				rk.rocket.position.y = 0.32 + (t < 0.7 ? t * 0.25 : 0.175 + 0.5 * 3.6 * (t - 0.7) ** 2);
				rk.rocket.position.x = (Math.random() - 0.5) * 0.03 * Math.max(0, 1 - t);
				if (t < 1.4) emitSmoke(isMobile ? 4 : 7, 3.2);
				if (t < 0.9) emitSparks(6, nozzleWorld, 1.2);
				for (let i = 0; i < (isMobile ? 3 : 5); i++) {
					tmpP.set(nozzleWorld.x + (Math.random() - 0.5) * 0.15, nozzleWorld.y - 0.4, nozzleWorld.z + (Math.random() - 0.5) * 0.15);
					tmpV.set((Math.random() - 0.5) * 0.6, -2 - Math.random() * 2, (Math.random() - 0.5) * 0.6);
					trail.emit(tmpP, tmpV, 0.5 + Math.random() * 0.4, 10 + Math.random() * 8, fireColor);
				}
				shake = Math.max(shake, t < 1.5 ? 0.06 : 0.02);
			} else if (tl >= 8.2 && tl < 9.6) {
				// new rocket rises from the pad
				const k = Math.min(1, (tl - 8.2) / 1.2);
				rk.rocket.position.y = -2.6 + k * 2.92;
				rk.rocket.position.x = 0;
			} else if (tl >= 9.6) {
				rk.rocket.position.y = 0.32;
				launching = false;
				countShown = '';
				holo.show('code');
				window.dispatchEvent(new CustomEvent('portfolio:launched'));
			}
		}
		const flameTarget = power;
		rk.flameMat.uniforms.uPower.value += (flameTarget - rk.flameMat.uniforms.uPower.value) * 0.2;
		const fp = rk.flameMat.uniforms.uPower.value;
		rk.flame.scale.set(0.8 + fp * 0.5, Math.max(0.01, fp * (1.1 + Math.sin(time * 40) * 0.12)), 0.8 + fp * 0.5);
		rk.engineLight.intensity = fp * (7 + Math.random() * 4);
		bloom.strength = 0.55 + fp * 0.5;

		smoke.update(dt);
		sparks.update(dt);
		trail.update(dt);

		// --- camera: parallax + follow the rocket + shake
		const follow = launching && tl > 4.5 && tl < 8.2 ? Math.min(1.6, (tl - 4.5) * 0.6) : 0;
		const tx = camBase.x + pointer.x * 0.5;
		const ty = camBase.y + pointer.y * 0.25 + follow * 0.6;
		camera.position.x += (tx - camera.position.x) * 0.05;
		camera.position.y += (ty - camera.position.y) * 0.05;
		look.y += (lookBase.y + follow - look.y) * 0.05;
		shake *= 0.92;
		camera.position.x += (Math.random() - 0.5) * shake;
		camera.position.y += (Math.random() - 0.5) * shake;
		camera.lookAt(look);

		composer.render();
	};
	requestAnimationFrame(tick);
}
