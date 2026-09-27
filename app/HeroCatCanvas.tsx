"use client";

import { useEffect, useRef, type RefObject } from "react";

export type Rgb = readonly [number, number, number];

/**
 * Draws the realistic hero film with a real alpha channel and a recoloured jacket.
 *
 * The film was rendered on a plain studio backdrop, so every frame is keyed live:
 * a small copy of the frame is read back, the backdrop is flood-filled in from the
 * frame edges (so the white face and chest, which are enclosed by darker fur, are
 * never keyed), and a second flood fill grows the jacket up from the bottom edge
 * (so the green eyes are never mistaken for jacket). The full-resolution shader then
 * keys the backdrop, removes its spill from soft fur edges and maps the jacket's own
 * shading onto the chosen colour. The cat itself is always the untouched source film.
 */

const ANALYSIS_W = 256;
const ANALYSIS_H = 144;
// Masks are refreshed at most this often; the key itself runs every frame.
const ANALYSIS_INTERVAL_MS = 66;
// Backdrop colour field: one cell per 8x8 analysis pixels.
const CELL = 8;
const GRID_W = Math.ceil(ANALYSIS_W / CELL);
const GRID_H = Math.ceil(ANALYSIS_H / CELL);
// Luminance of the film's lime jacket in full light; shading is measured against it.
const JACKET_BASE_LUMINANCE = 0.8;

const VERTEX = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// A 3x3 box sample so the small analysis frame is not an aliased point sample.
const ANALYSIS_FRAGMENT = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uSrc;
uniform vec2 uStep;
void main() {
  vec3 sum = vec3(0.0);
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      sum += texture2D(uSrc, vUv + vec2(float(x), float(y)) * uStep).rgb;
    }
  }
  gl_FragColor = vec4(sum / 9.0, 1.0);
}`;

const COMPOSITE_FRAGMENT = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uSrc;
uniform sampler2D uMask;
uniform sampler2D uBackdrop;
uniform vec3 uJacket;
uniform float uJacketBase;

vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

void main() {
  vec3 c = texture2D(uSrc, vUv).rgb;
  vec4 m = texture2D(uMask, vUv);
  // The studio backdrop has a soft vignette, so its colour is looked up locally.
  vec3 backdrop = texture2D(uBackdrop, vUv).rgb;

  // Only pixels inside the edge-connected backdrop region may become transparent.
  float region = smoothstep(0.12, 0.55, m.r);
  vec3 diff = abs(c - backdrop);
  float channel = max(max(diff.r, diff.g), diff.b);
  float darker = dot(backdrop - c, vec3(0.299, 0.587, 0.114));
  float keyed = smoothstep(0.045, 0.2, max(channel, darker * 1.4));
  float alpha = mix(1.0, keyed, region);

  // Remove the backdrop that is mixed into semi-transparent fur and whiskers.
  vec3 fg = alpha > 0.004 ? clamp((c - (1.0 - alpha) * backdrop) / alpha, 0.0, 1.0) : vec3(0.0);

  // Recolour the jacket only where the bottom-grown jacket region agrees with its hue.
  vec3 hsv = rgb2hsv(fg);
  float hueMatch = smoothstep(0.08, 0.12, hsv.x) * (1.0 - smoothstep(0.36, 0.43, hsv.x));
  // Soft silhouette pixels carry less colour, so they need less saturation to count,
  // and are choked slightly so no pale original-colour outline survives.
  float jacketRegion = smoothstep(0.15, 0.6, m.g);
  float satFloor = mix(0.04, 0.14, alpha);
  float jacket = jacketRegion * hueMatch * smoothstep(satFloor, satFloor + 0.16, hsv.y);
  alpha *= mix(1.0, smoothstep(0.1, 0.6, alpha), jacketRegion * region);
  float shade = dot(fg, vec3(0.299, 0.587, 0.114)) / uJacketBase;
  vec3 dyed = uJacket * min(shade, 1.0) + (vec3(1.0) - uJacket) * max(shade - 1.0, 0.0) * 1.6;
  fg = mix(fg, clamp(dyed, 0.0, 1.0), jacket);

  gl_FragColor = vec4(fg * alpha, alpha);
}`;

type Renderer = {
  draw: (source: TexImageSource, jacket: Rgb, analyse: boolean) => void;
  dispose: () => void;
};

function compile(gl: WebGLRenderingContext, fragment: string): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  for (const [type, code] of [
    [gl.VERTEX_SHADER, VERTEX],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
    gl.attachShader(program, shader);
  }
  gl.bindAttribLocation(program, 0, "aPos");
  gl.linkProgram(program);
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}

function texture(gl: WebGLRenderingContext): WebGLTexture | null {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}

/** Breadth-first fill over `allowed` pixels, starting from the given seeds. */
function floodFill(allowed: Uint8Array, seeds: number[], w: number, h: number): Uint8Array {
  const filled = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;
  for (const seed of seeds) {
    if (allowed[seed] && !filled[seed]) {
      filled[seed] = 1;
      queue[tail++] = seed;
    }
  }
  while (head < tail) {
    const i = queue[head++];
    const x = i % w;
    const neighbours = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w];
    for (const j of neighbours) {
      if (j >= 0 && j < w * h && allowed[j] && !filled[j]) {
        filled[j] = 1;
        queue[tail++] = j;
      }
    }
  }
  return filled;
}

/** One-pixel dilation followed by a 3x3 blur, written as 0-255 into one channel. */
function soften(mask: Uint8Array, out: Uint8Array, channel: number, w: number, h: number, grow: number) {
  let grown = mask;
  for (let pass = 0; pass < grow; pass++) {
    const next = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        next[i] =
          grown[i] ||
          (x > 0 && grown[i - 1]) ||
          (x < w - 1 && grown[i + 1]) ||
          (y > 0 && grown[i - w]) ||
          (y < h - 1 && grown[i + w])
            ? 1
            : 0;
      }
    }
    grown = next;
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w) continue;
          sum += grown[yy * w + xx];
          count++;
        }
      }
      out[(y * w + x) * 4 + channel] = Math.round((sum / count) * 255);
    }
  }
}

function createRenderer(canvas: HTMLCanvasElement): Renderer | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    preserveDrawingBuffer: false,
  });
  if (!gl) return null;
  const analysis = compile(gl, ANALYSIS_FRAGMENT);
  const composite = compile(gl, COMPOSITE_FRAGMENT);
  const sourceTex = texture(gl);
  const maskTex = texture(gl);
  const backdropTex = texture(gl);
  const analysisTex = texture(gl);
  const framebuffer = gl.createFramebuffer();
  const quad = gl.createBuffer();
  if (!analysis || !composite || !sourceTex || !maskTex || !backdropTex || !analysisTex || !framebuffer || !quad) {
    return null;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  gl.bindTexture(gl.TEXTURE_2D, analysisTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, ANALYSIS_W, ANALYSIS_H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, analysisTex, 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) return null;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  const pixels = new Uint8Array(ANALYSIS_W * ANALYSIS_H * 4);
  const mask = new Uint8Array(ANALYSIS_W * ANALYSIS_H * 4);
  const count = ANALYSIS_W * ANALYSIS_H;
  const backdropAllowed = new Uint8Array(count);
  const jacketAllowed = new Uint8Array(count);
  const cellSum = new Float32Array(GRID_W * GRID_H * 4);
  const cellColour = new Float32Array(GRID_W * GRID_H * 3);
  const cellKnown = new Uint8Array(GRID_W * GRID_H);
  const backdropField = new Uint8Array(GRID_W * GRID_H * 4);
  const location = {
    analysisSrc: gl.getUniformLocation(analysis, "uSrc"),
    analysisStep: gl.getUniformLocation(analysis, "uStep"),
    src: gl.getUniformLocation(composite, "uSrc"),
    mask: gl.getUniformLocation(composite, "uMask"),
    backdrop: gl.getUniformLocation(composite, "uBackdrop"),
    jacket: gl.getUniformLocation(composite, "uJacket"),
    jacketBase: gl.getUniformLocation(composite, "uJacketBase"),
  };

  const draw = (source: TexImageSource, jacket: Rgb, analyse: boolean) => {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sourceTex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

    // The masks change slowly, so the costly read-back and flood fills run a
    // few times a second while every frame is still keyed and dyed on the GPU.
    if (analyse) {
      // 1. Small copy of the frame for the flood fills.
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.viewport(0, 0, ANALYSIS_W, ANALYSIS_H);
      gl.useProgram(analysis);
      gl.uniform1i(location.analysisSrc, 0);
      gl.uniform2f(location.analysisStep, 1 / (ANALYSIS_W * 3), 1 / (ANALYSIS_H * 3));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.readPixels(0, 0, ANALYSIS_W, ANALYSIS_H, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      // readPixels is bottom-up; index everything top-down to match the mask texture.
      const at = (i: number) => {
        const x = i % ANALYSIS_W;
        const y = (i / ANALYSIS_W) | 0;
        return ((ANALYSIS_H - 1 - y) * ANALYSIS_W + x) * 4;
      };

      // Overall backdrop brightness from the most neutral pixels along the top edge.
      let brightest = 0;
      let samples = 0;
      for (let x = 0; x < ANALYSIS_W; x++) {
        for (const y of [0, 1]) {
          const p = at(y * ANALYSIS_W + x);
          const min = Math.min(pixels[p], pixels[p + 1], pixels[p + 2]);
          if (min > 200 && Math.max(pixels[p], pixels[p + 1], pixels[p + 2]) - min < 18) {
            brightest += min;
            samples++;
          }
        }
      }
      const floor = (samples ? brightest / samples : 245) - 34;

      for (let i = 0; i < count; i++) {
        const p = at(i);
        const r = pixels[p];
        const g = pixels[p + 1];
        const b = pixels[p + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        backdropAllowed[i] = min > floor && max - min < 16 ? 1 : 0;
        // Lime to green hue with real saturation: the jacket family.
        let hue = 0;
        if (max !== min) {
          if (max === g) hue = 60 * ((b - r) / (max - min) + 2);
          else if (max === r) hue = 60 * (((g - b) / (max - min)) % 6);
          else hue = 60 * ((r - g) / (max - min) + 4);
        }
        if (hue < 0) hue += 360;
        const saturation = max ? (max - min) / max : 0;
        jacketAllowed[i] = hue > 38 && hue < 150 && saturation > 0.24 && max > 60 ? 1 : 0;
      }

      const edgeSeeds: number[] = [];
      for (let x = 0; x < ANALYSIS_W; x++) {
        edgeSeeds.push(x, (ANALYSIS_H - 1) * ANALYSIS_W + x);
      }
      for (let y = 0; y < ANALYSIS_H; y++) {
        edgeSeeds.push(y * ANALYSIS_W, y * ANALYSIS_W + ANALYSIS_W - 1);
      }
      const bottomSeeds: number[] = [];
      for (let y = ANALYSIS_H - 3; y < ANALYSIS_H; y++) {
        for (let x = 0; x < ANALYSIS_W; x++) bottomSeeds.push(y * ANALYSIS_W + x);
      }

      const backdropRegion = floodFill(backdropAllowed, edgeSeeds, ANALYSIS_W, ANALYSIS_H);
      soften(backdropRegion, mask, 0, ANALYSIS_W, ANALYSIS_H, 1);
      soften(floodFill(jacketAllowed, bottomSeeds, ANALYSIS_W, ANALYSIS_H), mask, 1, ANALYSIS_W, ANALYSIS_H, 2);

      // Backdrop colour field: average the keyed backdrop per cell, then grow the
      // known cells inward so cells behind the cat inherit their surroundings.
      cellSum.fill(0);
      for (let i = 0; i < count; i++) {
        if (!backdropRegion[i]) continue;
        const cell = (((i / ANALYSIS_W) | 0) / CELL | 0) * GRID_W + ((i % ANALYSIS_W) / CELL | 0);
        const p = at(i);
        cellSum[cell * 4] += pixels[p];
        cellSum[cell * 4 + 1] += pixels[p + 1];
        cellSum[cell * 4 + 2] += pixels[p + 2];
        cellSum[cell * 4 + 3] += 1;
      }
      let unknown = 0;
      for (let cell = 0; cell < GRID_W * GRID_H; cell++) {
        const n = cellSum[cell * 4 + 3];
        cellKnown[cell] = n > 4 ? 1 : 0;
        if (!cellKnown[cell]) unknown++;
        for (let k = 0; k < 3; k++) cellColour[cell * 3 + k] = n > 4 ? cellSum[cell * 4 + k] / n : 0;
      }
      for (let pass = 0; unknown > 0 && pass < GRID_W + GRID_H; pass++) {
        const grown: number[] = [];
        for (let cell = 0; cell < GRID_W * GRID_H; cell++) {
          if (cellKnown[cell]) continue;
          const x = cell % GRID_W;
          let r = 0;
          let g = 0;
          let b = 0;
          let n = 0;
          for (const next of [x > 0 ? cell - 1 : -1, x < GRID_W - 1 ? cell + 1 : -1, cell - GRID_W, cell + GRID_W]) {
            if (next < 0 || next >= GRID_W * GRID_H || !cellKnown[next]) continue;
            r += cellColour[next * 3];
            g += cellColour[next * 3 + 1];
            b += cellColour[next * 3 + 2];
            n++;
          }
          if (n) {
            cellColour[cell * 3] = r / n;
            cellColour[cell * 3 + 1] = g / n;
            cellColour[cell * 3 + 2] = b / n;
            grown.push(cell);
          }
        }
        for (const cell of grown) cellKnown[cell] = 1;
        unknown -= grown.length;
        if (!grown.length) break;
      }
      for (let cell = 0; cell < GRID_W * GRID_H; cell++) {
        for (let k = 0; k < 3; k++) {
          backdropField[cell * 4 + k] = cellKnown[cell] ? Math.round(cellColour[cell * 3 + k]) : 246;
        }
        backdropField[cell * 4 + 3] = 255;
      }

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, maskTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, ANALYSIS_W, ANALYSIS_H, 0, gl.RGBA, gl.UNSIGNED_BYTE, mask);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, backdropTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, GRID_W, GRID_H, 0, gl.RGBA, gl.UNSIGNED_BYTE, backdropField);
    }

    // 2. Full-resolution key, despill and jacket colour.
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(composite);
    gl.uniform1i(location.src, 0);
    gl.uniform1i(location.mask, 1);
    gl.uniform1i(location.backdrop, 2);
    gl.uniform3f(location.jacket, jacket[0], jacket[1], jacket[2]);
    gl.uniform1f(location.jacketBase, JACKET_BASE_LUMINANCE);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  return {
    draw,
    dispose: () => {
      gl.deleteTexture(sourceTex);
      gl.deleteTexture(maskTex);
      gl.deleteTexture(backdropTex);
      gl.deleteTexture(analysisTex);
      gl.deleteFramebuffer(framebuffer);
      gl.deleteBuffer(quad);
      gl.deleteProgram(analysis);
      gl.deleteProgram(composite);
    },
  };
}

export function HeroCatCanvas({
  videoRef,
  posterSrc,
  jacket,
  reducedMotion,
  onRendererChange,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  posterSrc: string;
  jacket: Rgb;
  reducedMotion: boolean;
  onRendererChange: (renderer: "webgl" | "fallback") => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const jacketTarget = useRef<Rgb>(jacket);
  const redraw = useRef<(() => void) | null>(null);
  const reducedMotionRef = useRef(reducedMotion);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    let renderer: Renderer | null = null;
    try {
      renderer = createRenderer(canvas);
    } catch {
      renderer = null;
    }
    if (!renderer) {
      onRendererChange("fallback");
      return;
    }

    let disposed = false;
    let rendered = false;
    let frame = 0;
    let lastTime = -1;
    let poster: HTMLImageElement | null = null;
    let lastAnalysis = 0;
    let lastSource: TexImageSource | null = null;
    let current: Rgb = jacketTarget.current;
    let from: Rgb = current;
    let transitionStart = 0;
    const TRANSITION_MS = 650;

    const source = (): TexImageSource | null => {
      if (video.readyState >= 2 && video.videoWidth) return video;
      if (poster?.complete && poster.naturalWidth) return poster;
      return null;
    };

    const resize = () => {
      // A soft-edged photographic film gains nothing visible above 1.5x density.
      const scale = Math.min(window.devicePixelRatio || 1, 1.5);
      // The film is 1920x1080; drawing it larger only costs fill rate.
      const width = Math.min(1920, Math.round(canvas.clientWidth * scale));
      const height = Math.min(1080, Math.round(canvas.clientHeight * scale));
      if (width && height && (canvas.width !== width || canvas.height !== height)) {
        canvas.width = width;
        canvas.height = height;
        return true;
      }
      return false;
    };

    const render = () => {
      const src = source();
      if (!src || !renderer || disposed) return;
      const now = performance.now();
      const analyse = resize() || !rendered || src !== lastSource || now - lastAnalysis >= ANALYSIS_INTERVAL_MS;
      if (analyse) {
        lastAnalysis = now;
        lastSource = src;
      }
      renderer.draw(src, current, analyse);
      if (!rendered) {
        rendered = true;
        onRendererChange("webgl");
      }
    };

    // One loop drives both new film frames and jacket colour transitions, and it
    // stops itself whenever the film is paused and no transition is running.
    const tick = (now: number) => {
      frame = 0;
      let animating = false;
      const target = jacketTarget.current;
      if (current !== target) {
        if (from === current && transitionStart === 0) transitionStart = now;
        const t = reducedMotionRef.current ? 1 : Math.min(1, (now - transitionStart) / TRANSITION_MS);
        const eased = t * t * (3 - 2 * t);
        current = [0, 1, 2].map((k) => from[k] + (target[k] - from[k]) * eased) as unknown as Rgb;
        if (t >= 1) {
          current = target;
          from = target;
          transitionStart = 0;
        } else {
          animating = true;
        }
        render();
      } else if (!video.paused && video.currentTime !== lastTime) {
        lastTime = video.currentTime;
        render();
      }
      if (animating || !video.paused) frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!frame && !disposed) frame = requestAnimationFrame(tick);
    };

    redraw.current = () => {
      from = current;
      transitionStart = 0;
      wake();
    };

    poster = new Image();
    poster.decoding = "async";
    poster.onload = () => {
      if (!rendered || video.readyState < 2) render();
    };
    poster.src = posterSrc;

    const onFrameReady = () => {
      render();
      wake();
    };
    video.addEventListener("play", wake);
    video.addEventListener("loadeddata", onFrameReady);
    video.addEventListener("seeked", onFrameReady);
    const observer = new ResizeObserver(() => {
      if (resize()) render();
    });
    observer.observe(canvas);
    const onLost = (event: Event) => {
      event.preventDefault();
      onRendererChange("fallback");
    };
    canvas.addEventListener("webglcontextlost", onLost);
    if (!video.paused) wake();

    return () => {
      disposed = true;
      redraw.current = null;
      if (frame) cancelAnimationFrame(frame);
      video.removeEventListener("play", wake);
      video.removeEventListener("loadeddata", onFrameReady);
      video.removeEventListener("seeked", onFrameReady);
      canvas.removeEventListener("webglcontextlost", onLost);
      observer.disconnect();
      if (poster) poster.onload = null;
      renderer?.dispose();
    };
  }, [videoRef, posterSrc, onRendererChange]);

  useEffect(() => {
    jacketTarget.current = jacket;
    redraw.current?.();
  }, [jacket]);

  return <canvas ref={canvasRef} className="hero-cat-canvas" aria-hidden="true" />;
}
