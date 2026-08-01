import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from "ogl";
import type { OGLRenderingContext } from "ogl";
import { useEffect, useRef } from "react";

/**
 * Curved WebGL gallery (adapted from React Bits' CircularGallery).
 *
 * Differences from the upstream source, all deliberate:
 * - TypeScript + typed items, each item may carry an `href` so a tap opens it.
 * - wheel/drag listeners are bound to the container, not `window`, so the page's
 *   Lenis smooth scroll keeps working everywhere outside the canvas.
 * - a short pointer press (little movement, quick release) is treated as a click
 *   on whichever card sits under the cursor and calls `onItemClick`.
 */

export type CircularGalleryItem = {
  image: string;
  text: string;
  href?: string;
};

type Screen = { width: number; height: number };
type Viewport = { width: number; height: number };

function debounce<T extends (...args: never[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t;
}

function getFontSize(font: string) {
  const match = font.match(/(\d+)px/);
  return match ? parseInt(match[1]!, 10) : 30;
}

function createTextTexture(
  gl: OGLRenderingContext,
  text: string,
  font: string,
  color: string,
) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(getFontSize(font) * 1.2);
  canvas.width = textWidth + 20;
  canvas.height = textHeight + 20;
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = "middle";
  context.textAlign = "center";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas as unknown as HTMLImageElement;
  return { texture, width: canvas.width, height: canvas.height };
}

class Title {
  constructor({
    gl,
    plane,
    text,
    textColor,
    font,
  }: {
    gl: OGLRenderingContext;
    plane: Mesh;
    text: string;
    textColor: string;
    font: string;
  }) {
    const { texture, width, height } = createTextTexture(gl, text, font, textColor);
    const geometry = new Plane(gl);
    const program = new Program(gl, {
      vertex: /* glsl */ `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: /* glsl */ `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    });
    const mesh = new Mesh(gl, { geometry, program });
    const aspect = width / height;
    const textHeight = plane.scale.y * 0.12;
    mesh.scale.set(textHeight * aspect, textHeight, 1);
    mesh.position.y = -plane.scale.y * 0.5 - textHeight * 0.5 - 0.12;
    mesh.setParent(plane);
  }
}

class Media {
  extra = 0;
  plane!: Mesh;
  program!: Program;
  scale = 1;
  padding = 2;
  width = 0;
  widthTotal = 0;
  x = 0;
  speed = 0;
  isBefore = false;
  isAfter = false;

  constructor(
    private opts: {
      geometry: Plane;
      gl: OGLRenderingContext;
      image: string;
      index: number;
      length: number;
      scene: Transform;
      screen: Screen;
      text: string;
      viewport: Viewport;
      bend: number;
      textColor: string;
      borderRadius: number;
      font: string;
    },
  ) {
    this.createShader();
    this.createMesh();
    new Title({
      gl: opts.gl,
      plane: this.plane,
      text: opts.text,
      textColor: opts.textColor,
      font: opts.font,
    });
    this.onResize();
  }

  private createShader() {
    const { gl, borderRadius, image } = this.opts;
    const texture = new Texture(gl, { generateMipmaps: true });
    this.program = new Program(gl, {
      depthTest: false,
      depthWrite: false,
      vertex: /* glsl */ `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: /* glsl */ `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: borderRadius },
      },
      transparent: true,
    });
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms["uImageSizes"]!.value = [img.naturalWidth, img.naturalHeight];
    };
  }

  private createMesh() {
    this.plane = new Mesh(this.opts.gl, {
      geometry: this.opts.geometry,
      program: this.program,
    });
    this.plane.setParent(this.opts.scene);
  }

  update(scroll: { current: number; last: number }, direction: "left" | "right") {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.opts.viewport.width / 2;
    const bend = this.opts.bend;

    if (bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const bAbs = Math.abs(bend);
      const R = (H * H + bAbs * bAbs) / (2 * bAbs);
      const effectiveX = Math.min(Math.abs(x), H);
      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms["uTime"]!.value += 0.04;
    this.program.uniforms["uSpeed"]!.value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.opts.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === "right" && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === "left" && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }

  onResize({ screen, viewport }: { screen?: Screen; viewport?: Viewport } = {}) {
    if (screen) this.opts.screen = screen;
    if (viewport) this.opts.viewport = viewport;
    const { screen: s, viewport: v } = this.opts;
    this.scale = s.height / 1500;
    this.plane.scale.y = (v.height * (900 * this.scale)) / s.height;
    this.plane.scale.x = (v.width * (700 * this.scale)) / s.width;
    this.plane.program.uniforms["uPlaneSizes"]!.value = [
      this.plane.scale.x,
      this.plane.scale.y,
    ];
    this.padding = 1.4;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.opts.length;
    this.x = this.width * this.opts.index;
  }
}

type AppOptions = {
  items: CircularGalleryItem[];
  bend: number;
  textColor: string;
  borderRadius: number;
  font: string;
  scrollSpeed: number;
  scrollEase: number;
  onItemClick?: (index: number) => void;
};

class App {
  private renderer!: Renderer;
  private gl!: OGLRenderingContext;
  private camera!: Camera;
  private scene!: Transform;
  private planeGeometry!: Plane;
  private medias: Media[] = [];
  private mediaItems: CircularGalleryItem[] = [];
  private screen: Screen = { width: 0, height: 0 };
  private viewport: Viewport = { width: 0, height: 0 };
  private scroll = { ease: 0.05, current: 0, target: 0, last: 0, position: 0 };
  private raf = 0;
  private isDown = false;
  private start = 0;
  private startY = 0;
  private startTime = 0;
  private moved = 0;
  private onCheckDebounce: () => void;
  private ro?: ResizeObserver;

  constructor(
    private container: HTMLElement,
    private options: AppOptions,
  ) {
    this.scroll.ease = options.scrollEase;
    this.onCheckDebounce = debounce(() => this.onCheck(), 200);
    this.createRenderer();
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
    this.scene = new Transform();
    this.onResize();
    this.planeGeometry = new Plane(this.gl, { heightSegments: 50, widthSegments: 100 });
    this.createMedias();
    this.update();
    this.addEventListeners();
  }

  private createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.canvas.style.display = "block";
    this.container.appendChild(this.gl.canvas);
  }

  private createMedias() {
    const { items, bend, textColor, borderRadius, font } = this.options;
    // Duplicated so the infinite loop always has cards to recycle.
    this.mediaItems = items.concat(items);
    this.medias = this.mediaItems.map(
      (data, index) =>
        new Media({
          geometry: this.planeGeometry,
          gl: this.gl,
          image: data.image,
          index,
          length: this.mediaItems.length,
          scene: this.scene,
          screen: this.screen,
          text: data.text,
          viewport: this.viewport,
          bend,
          textColor,
          borderRadius,
          font,
        }),
    );
  }

  private pointerX(e: MouseEvent | TouchEvent) {
    return "touches" in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
  }

  private pointerY(e: MouseEvent | TouchEvent) {
    return "touches" in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;
  }

  private onTouchDown = (e: MouseEvent | TouchEvent) => {
    this.isDown = true;
    this.moved = 0;
    this.startTime = Date.now();
    this.scroll.position = this.scroll.current;
    this.start = this.pointerX(e);
    this.startY = this.pointerY(e);
  };

  private onTouchMove = (e: MouseEvent | TouchEvent) => {
    if (!this.isDown) return;
    const x = this.pointerX(e);
    this.moved = Math.max(
      this.moved,
      Math.abs(this.start - x) + Math.abs(this.startY - this.pointerY(e)),
    );
    const distance = (this.start - x) * (this.options.scrollSpeed * 0.025);
    this.scroll.target = this.scroll.position + distance;
  };

  private onTouchUp = (e: MouseEvent | TouchEvent) => {
    if (!this.isDown) return;
    this.isDown = false;
    const wasTap = this.moved < 8 && Date.now() - this.startTime < 500;
    this.onCheck();
    if (wasTap) this.handleTap(e);
  };

  /** Map the pointer to whichever card currently sits under it. */
  private handleTap(e: MouseEvent | TouchEvent) {
    const rect = this.container.getBoundingClientRect();
    const clientX =
      "changedTouches" in e && e.changedTouches?.[0]
        ? e.changedTouches[0].clientX
        : this.start;
    const clientY =
      "changedTouches" in e && e.changedTouches?.[0]
        ? e.changedTouches[0].clientY
        : this.startY;
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return;
    }
    const nx = (clientX - rect.left) / rect.width - 0.5;
    const worldX = nx * this.viewport.width;
    let hit = -1;
    let best = Infinity;
    this.medias.forEach((media, index) => {
      const d = Math.abs(media.plane.position.x - worldX);
      if (d < media.plane.scale.x / 2 && d < best) {
        best = d;
        hit = index;
      }
    });
    if (hit < 0) return;
    const source = this.options.items.length;
    this.options.onItemClick?.(hit % source);
  }

  private onWheel = (e: WheelEvent) => {
    const delta = e.deltaY;
    this.scroll.target += (delta > 0 ? this.options.scrollSpeed : -this.options.scrollSpeed) * 0.2;
    this.onCheckDebounce();
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      this.scroll.target += this.options.scrollSpeed * 5;
      this.onCheckDebounce();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      this.scroll.target -= this.options.scrollSpeed * 5;
      this.onCheckDebounce();
    }
  };

  private onCheck() {
    const first = this.medias[0];
    if (!first || !first.width) return;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / first.width);
    const item = first.width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }

  onResize = () => {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };
    if (!this.screen.width || !this.screen.height) return;
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    this.medias.forEach((media) =>
      media.onResize({ screen: this.screen, viewport: this.viewport }),
    );
  };

  private update = () => {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? "right" : "left";
    this.medias.forEach((media) => media.update(this.scroll, direction));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update);
  };

  private addEventListeners() {
    // Bound to the container so page scrolling elsewhere is untouched.
    this.container.addEventListener("wheel", this.onWheel, { passive: true });
    this.container.addEventListener("mousedown", this.onTouchDown);
    this.container.addEventListener("touchstart", this.onTouchDown, { passive: true });
    this.container.addEventListener("touchmove", this.onTouchMove, { passive: true });
    this.container.addEventListener("touchend", this.onTouchUp);
    this.container.addEventListener("keydown", this.onKeyDown);
    // Drag can leave the canvas; finish the gesture wherever it ends.
    window.addEventListener("mousemove", this.onTouchMove);
    window.addEventListener("mouseup", this.onTouchUp);
    window.addEventListener("resize", this.onResize);
    if (typeof ResizeObserver !== "undefined") {
      this.ro = new ResizeObserver(() => this.onResize());
      this.ro.observe(this.container);
    }
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    this.container.removeEventListener("wheel", this.onWheel);
    this.container.removeEventListener("mousedown", this.onTouchDown);
    this.container.removeEventListener("touchstart", this.onTouchDown);
    this.container.removeEventListener("touchmove", this.onTouchMove);
    this.container.removeEventListener("touchend", this.onTouchUp);
    this.container.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("mousemove", this.onTouchMove);
    window.removeEventListener("mouseup", this.onTouchUp);
    window.removeEventListener("resize", this.onResize);
    this.ro?.disconnect();
    const canvas = this.renderer?.gl?.canvas;
    if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
  }
}

export default function CircularGallery({
  items,
  bend = 3,
  textColor = "#ffffff",
  borderRadius = 0.05,
  font = "600 26px Inter, system-ui, sans-serif",
  scrollSpeed = 2,
  scrollEase = 0.05,
  onItemClick,
  className,
  ariaLabel = "Draggable product gallery",
}: {
  items: CircularGalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
  onItemClick?: (index: number) => void;
  className?: string;
  ariaLabel?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Keeps the latest handler reachable without tearing down the WebGL scene.
  const clickRef = useRef(onItemClick);
  clickRef.current = onItemClick;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !items.length) return;
    let app: App | undefined;
    try {
      app = new App(container, {
        items,
        bend,
        textColor,
        borderRadius,
        font,
        scrollSpeed,
        scrollEase,
        onItemClick: (i) => clickRef.current?.(i),
      });
    } catch (error) {
      console.error("CircularGallery: WebGL unavailable", error);
    }
    return () => app?.destroy();
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase]);

  return (
    <div
      ref={containerRef}
      role="group"
      tabIndex={0}
      aria-label={ariaLabel}
      className={className}
      style={{ width: "100%", height: "100%", overflow: "hidden", cursor: "grab" }}
    />
  );
}
