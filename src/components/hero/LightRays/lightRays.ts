import { Renderer, Program, Triangle, Mesh } from "ogl";

export type RaysOrigin =
  | "top-center"
  | "top-left"
  | "top-right"
  | "right"
  | "left"
  | "bottom-center"
  | "bottom-right"
  | "bottom-left";

type Vec2 = [number, number];
type Vec3 = [number, number, number];

interface Options {
  raysOrigin: RaysOrigin;
  raysColor: string;
  raysSpeed: number;
  lightSpread: number;
  rayLength: number;
  pulsating: boolean;
  fadeDistance: number;
  saturation: number;
  followMouse: boolean;
  mouseInfluence: number;
  noiseAmount: number;
  distortion: number;
}

const hexToRgb = (hex: string): Vec3 => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255]
    : [1, 1, 1];
};

const getAnchorAndDir = (
  origin: RaysOrigin,
  w: number,
  h: number,
): { anchor: Vec2; dir: Vec2 } => {
  const outside = 0.2;
  switch (origin) {
    case "top-left":
      return { anchor: [0, -outside * h], dir: [0, 1] };
    case "top-right":
      return { anchor: [w, -outside * h], dir: [0, 1] };
    case "left":
      return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
    case "right":
      return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
    case "bottom-left":
      return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
    case "bottom-center":
      return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
    case "bottom-right":
      return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
    default:
      return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
  }
};

const readOptions = (el: HTMLElement): Options => {
  const d = el.dataset;
  return {
    raysOrigin: (d.origin as RaysOrigin) ?? "top-center",
    raysColor: d.color ?? "#ffffff",
    raysSpeed: Number(d.speed ?? 1),
    lightSpread: Number(d.spread ?? 1),
    rayLength: Number(d.length ?? 2),
    pulsating: d.pulsating === "1",
    fadeDistance: Number(d.fade ?? 1),
    saturation: Number(d.saturation ?? 1),
    followMouse: d.followMouse !== "0",
    mouseInfluence: Number(d.mouseInfluence ?? 0.1),
    noiseAmount: Number(d.noise ?? 0),
    distortion: Number(d.distortion ?? 0),
  };
};

const VERT = /* glsl */ `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAG = /* glsl */ `precision highp float;

uniform float iTime;
uniform vec2  iResolution;
uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);

  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);

  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
                           1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
                           1.1 * raysSpeed);

  fragColor = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}`;

export const mountLightRays = (container: HTMLElement): (() => void) => {
  const opts = readOptions(container);

  const renderer = new Renderer({
    dpr: Math.min(window.devicePixelRatio, 2),
    alpha: true,
  });
  const gl = renderer.gl;
  const canvas = gl.canvas as HTMLCanvasElement;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  container.appendChild(canvas);

  const uniforms = {
    iTime: { value: 0 },
    iResolution: { value: [1, 1] as Vec2 },
    rayPos: { value: [0, 0] as Vec2 },
    rayDir: { value: [0, 1] as Vec2 },
    raysColor: { value: hexToRgb(opts.raysColor) },
    raysSpeed: { value: opts.raysSpeed },
    lightSpread: { value: opts.lightSpread },
    rayLength: { value: opts.rayLength },
    pulsating: { value: opts.pulsating ? 1 : 0 },
    fadeDistance: { value: opts.fadeDistance },
    saturation: { value: opts.saturation },
    mousePos: { value: [0.5, 0.5] as Vec2 },
    mouseInfluence: { value: opts.mouseInfluence },
    noiseAmount: { value: opts.noiseAmount },
    distortion: { value: opts.distortion },
  };

  const geometry = new Triangle(gl);
  const program = new Program(gl, { vertex: VERT, fragment: FRAG, uniforms });
  const mesh = new Mesh(gl, { geometry, program });

  const mouse = { x: 0.5, y: 0.5 };
  const smoothMouse = { x: 0.5, y: 0.5 };

  const updatePlacement = () => {
    renderer.dpr = Math.min(window.devicePixelRatio, 2);
    const { clientWidth: wCSS, clientHeight: hCSS } = container;
    if (wCSS === 0 || hCSS === 0) return;
    renderer.setSize(wCSS, hCSS);
    const w = wCSS * renderer.dpr;
    const h = hCSS * renderer.dpr;
    uniforms.iResolution.value = [w, h];
    const { anchor, dir } = getAnchorAndDir(opts.raysOrigin, w, h);
    uniforms.rayPos.value = anchor;
    uniforms.rayDir.value = dir;
  };

  let rafId = 0;
  let disposed = false;
  const loop = (t: number) => {
    if (disposed) return;
    uniforms.iTime.value = t * 0.001;
    if (opts.followMouse && opts.mouseInfluence > 0) {
      const k = 0.92;
      smoothMouse.x = smoothMouse.x * k + mouse.x * (1 - k);
      smoothMouse.y = smoothMouse.y * k + mouse.y * (1 - k);
      uniforms.mousePos.value = [smoothMouse.x, smoothMouse.y];
    }
    try {
      renderer.render({ scene: mesh });
    } catch {
      return;
    }
    rafId = requestAnimationFrame(loop);
  };

  const onMouseMove = (e: MouseEvent) => {
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    mouse.x = (e.clientX - rect.left) / rect.width;
    mouse.y = (e.clientY - rect.top) / rect.height;
  };

  const ro = new ResizeObserver(updatePlacement);
  ro.observe(container);
  updatePlacement();
  if (opts.followMouse) window.addEventListener("mousemove", onMouseMove, { passive: true });
  rafId = requestAnimationFrame(loop);

  return () => {
    disposed = true;
    cancelAnimationFrame(rafId);
    ro.disconnect();
    if (opts.followMouse) window.removeEventListener("mousemove", onMouseMove);
    try {
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    } catch {
      /* noop */
    }
  };
};
