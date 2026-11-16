// Home page model: a 3D model rendered by three.js off-screen and converted
// to coloured ASCII by textmode.js, inside the #bust box.
// Drag = rotate, scroll = zoom in, idle = slow spin.
// Loaded on demand by index.astro when the bust is about to be seen.
import { textmode } from "textmode.js";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const MODEL_URL = "/models/helios_vaporwave_bust.glb";
const AUTO_SPIN = 0.005; // radians per frame when idle
const DRAG_SPEED = 0.008; // radians per pixel dragged
const DOWNSCALE = 2; // three.js renders at 1/2 size; cells are coarser anyway
const FONT_SIZE = 8; // px per character (the reference's 8px density): smaller = more model detail
const CAMERA_Z = 2.8; // distance to the model: smaller = model fills more of the box
// Phones get 30 fps: at 8px ASCII cells the difference is hard to see
const FRAME_RATE = matchMedia("(max-width: 768px)").matches ? 30 : 60;

export function start(canvas: HTMLCanvasElement) {
  const box = canvas.parentElement!; // receives the drag and scroll

  // ── three.js scene (never added to the page) ──
  const renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = CAMERA_Z;

  // Colours each face by its direction: full-spectrum look, no lights needed
  const material = new THREE.MeshNormalMaterial();
  const pivot = new THREE.Group();
  scene.add(pivot);
  // The camera never moves. Scrolling resizes the model instead.
  let baseScale = 1; // fits the model to a standard size
  let zoom = 1; // user's scroll zoom on top of that

  // Centre the object on the pivot and scale it to a fixed on-screen size
  const show = (object: THREE.Object3D) => {
    const bounds = new THREE.Box3().setFromObject(object);
    object.position.sub(bounds.getCenter(new THREE.Vector3()));
    pivot.clear();
    baseScale = 3 / bounds.getSize(new THREE.Vector3()).length();
    pivot.scale.setScalar(baseScale * zoom);
    pivot.add(object);
  };

  // No placeholder: the box stays empty until the model arrives
  new GLTFLoader().load(MODEL_URL, (gltf) => {
    gltf.scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = material;
    });
    show(gltf.scene);
  });

  // Match the three.js render to the box
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(Math.ceil(w / DOWNSCALE), Math.ceil(h / DOWNSCALE), false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();

  // ── interaction: starts inside the box only ──
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let spinX = 0; // rotation to apply next frame
  let spinY = AUTO_SPIN;

  box.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  // On the document, so a drag keeps working when the pointer leaves the box
  document.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    spinY += (e.clientX - lastX) * DRAG_SPEED;
    spinX += (e.clientY - lastY) * DRAG_SPEED;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  const stopDrag = () => (dragging = false);
  document.addEventListener("pointerup", stopDrag);
  document.addEventListener("pointercancel", stopDrag);

  box.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault(); // zoom the model instead of scrolling the page
      // 1 = default size is the smallest: you can zoom in, never out past it
      zoom = Math.min(2.5, Math.max(1, zoom * Math.exp(-e.deltaY * 0.001)));
      pivot.scale.setScalar(baseScale * zoom);
    },
    { passive: false },
  );

  // ── textmode ──
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const t = textmode.create({
    canvas,
    fontSize: FONT_SIZE,
    frameRate: FRAME_RATE,
  });

  let tex: ReturnType<typeof t.createTexture> | undefined;

  t.setup(() => {
    tex = t.createTexture(renderer.domElement);
    tex
      .characters(" .:-=+*#%@")
      .charColorMode("sampled")
      .cellColorMode("fixed")
      .cellColor(0);
  });

  t.draw(() => {
    pivot.rotation.y += spinY;
    pivot.rotation.x += spinX;
    if (dragging) {
      spinX = spinY = 0; // only move while the pointer moves
    } else {
      spinX *= 0.9;
      spinY += (AUTO_SPIN - spinY) * 0.05; // ease back to the idle spin
    }

    renderer.render(scene, camera);

    t.background(10);
    if (tex && t.grid) t.image(tex, t.grid.cols, t.grid.rows);
  });

  t.windowResized(() => {
    t.resizeCanvas(canvas.clientWidth, canvas.clientHeight);
    resize();
  });

  // Stop rendering while the bust is scrolled out of view
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) t.loop();
    else t.noLoop();
  }).observe(box);
}
