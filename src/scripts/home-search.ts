// Home animation, version 1: breadth-first search over the character grid.
// Click = new source. The flood spreads around the walls, coloured by
// distance. Hover = shortest path from the cursor back to the source.
// Enable by importing this file from the <script> in src/pages/index.astro.
import { textmode } from "textmode.js";

const t = textmode.create({
  width: window.innerWidth,
  height: window.innerHeight,
  fontSize: 16,
  frameRate: 60,
});

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$@=+-?!/[]{}";
const SEARCH_SPEED = 0.6; // BFS layers revealed per frame
const HUE_PER_STEP = 5; // degrees of hue per BFS step
const HUE_FLOW = 1.5; // degrees per frame the colour bands drift outward

let cols = 0;
let rows = 0;
let walls = new Uint8Array(0);
let dist = new Int32Array(0); // BFS steps from the source, -1 = unreachable
let parent = new Int32Array(0); // previous cell on the shortest path
let onPath = new Uint8Array(0);
let searchStart = 0; // frame the current search began
const pointer = { x: -1, y: -1 };

function search(sx: number, sy: number) {
  const src = sy * cols + sx;
  walls[src] = 0;
  dist.fill(-1);
  parent[src] = -1;
  dist[src] = 0;

  const queue = new Int32Array(cols * rows);
  let head = 0;
  let tail = 0;
  queue[tail++] = src;

  while (head < tail) {
    const i = queue[head++];
    const x = i % cols;
    const neighbours = [
      x > 0 ? i - 1 : -1,
      x < cols - 1 ? i + 1 : -1,
      i - cols,
      i + cols,
    ];
    for (const n of neighbours) {
      if (n < 0 || n >= dist.length || walls[n] || dist[n] !== -1) continue;
      dist[n] = dist[i] + 1;
      parent[n] = i;
      queue[tail++] = n;
    }
  }
  searchStart = t.frameCount;
}

// Rebuild the maze whenever the grid size changes (first frame, resize)
function reset() {
  cols = t.grid!.cols;
  rows = t.grid!.rows;
  walls = new Uint8Array(cols * rows);
  dist = new Int32Array(cols * rows);
  parent = new Int32Array(cols * rows);
  onPath = new Uint8Array(cols * rows);

  // Blobby obstacles from overlapping sine waves (~15% of cells)
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const v =
        Math.sin(x * 0.31) +
        Math.sin(y * 0.53) +
        Math.sin((x + y) * 0.17) +
        Math.sin((x - y) * 0.23);
      walls[y * cols + x] = v > 1.4 ? 1 : 0;
    }
  }
  search(Math.floor(cols / 2), Math.floor(rows / 2));
}

function cellAt(px: number, py: number) {
  const x = Math.floor((px / window.innerWidth) * cols);
  const y = Math.floor((py / window.innerHeight) * rows);
  return [
    Math.min(cols - 1, Math.max(0, x)),
    Math.min(rows - 1, Math.max(0, y)),
  ];
}

// Hue in degrees → fully saturated RGB
function hueToRgb(h: number) {
  h = ((h % 360) + 360) % 360;
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return Math.floor(255 * (1 - Math.max(0, Math.min(k, 4 - k, 1))));
  };
  return [f(5), f(3), f(1)];
}

document.addEventListener("pointermove", (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
});

document.addEventListener("click", (e) => {
  if ((e.target as HTMLElement).closest("a") || !cols) return;
  const [x, y] = cellAt(e.clientX, e.clientY);
  search(x, y);
});

t.draw(() => {
  t.background(10);

  if (!t.grid) return;
  if (t.grid.cols !== cols || t.grid.rows !== rows) reset();

  const reach = (t.frameCount - searchStart) * SEARCH_SPEED;

  // Walk from the hovered cell back to the source
  onPath.fill(0);
  if (pointer.x >= 0) {
    const [px, py] = cellAt(pointer.x, pointer.y);
    let i = py * cols + px;
    if (dist[i] >= 0 && dist[i] <= reach) {
      while (i !== -1) {
        onPath[i] = 1;
        i = parent[i];
      }
    }
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (walls[i]) continue; // walls stay as bare background

      // Each cell flips to a new glyph on its own slow clock
      const seed = (x * 73856093) ^ (y * 19349663);
      const tick = Math.floor((t.frameCount + (seed & 255)) / 40);
      t.char(GLYPHS[Math.abs(seed + tick * 7919) % GLYPHS.length]);

      const d = dist[i];
      if (onPath[i]) {
        t.charColor(10, 10, 10);
        t.cellColor(255, 255, 255);
      } else if (d >= 0 && d <= reach) {
        const [r, g, b] = hueToRgb(d * HUE_PER_STEP - t.frameCount * HUE_FLOW);
        if (reach - d < 3) {
          // search frontier: solid colour block
          t.charColor(255, 255, 255);
          t.cellColor(r, g, b);
        } else {
          t.charColor(r, g, b);
          t.cellColor(
            Math.floor(r * 0.25),
            Math.floor(g * 0.25),
            Math.floor(b * 0.25),
          );
        }
      } else {
        // not reached yet
        t.charColor(45, 45, 60);
        t.cellColor(10, 10, 10);
      }

      t.translate(x - cols / 2, y - rows / 2);
      t.rect(1, 1);
      t.translate(-(x - cols / 2), -(y - rows / 2));
    }
  }
});

t.windowResized(() => {
  t.resizeCanvas(window.innerWidth, window.innerHeight);
});
