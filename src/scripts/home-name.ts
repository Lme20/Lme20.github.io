// Home page name, drawn by textmode.js so it gets the library's own chunky
// pixel glyphs (the same look as the reference site's heading).
// Hovering scrambles the letters under the pointer; on load the name decodes
// from left to right. The readable name for screen readers is in the <h1>.
import { textmode } from "textmode.js";

const canvas = document.querySelector<HTMLCanvasElement>("#name-canvas");

if (canvas) {
  const LINES = ["LOUIS", "MERCIER"];
  const SCRAMBLE = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&$@";
  // Pink → purple → cyan, left to right
  const STOPS = [
    [255, 61, 154],
    [176, 58, 216],
    [58, 216, 255],
  ];
  const widest = Math.max(...LINES.map((line) => line.length));

  // One letter is about 7% of the window wide, capped at 120px.
  // ponytail: sized once on load; reload the page after a big window resize.
  const size = Math.round(Math.min(window.innerWidth * 0.07, 120));
  canvas.width = widest * size;
  canvas.height = Math.round(LINES.length * size * 1.25);
  canvas.style.width = `${canvas.width}px`;
  canvas.style.height = `${canvas.height}px`;

  const t = textmode.create({ canvas, fontSize: size, frameRate: 30 });

  // For each letter, the time (ms) until which it shows random glyphs
  const until = LINES.map((line) => new Float64Array(line.length));

  // Decode-in on load, unless the visitor asked their system for less motion
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const start = performance.now();
    until.forEach((line) =>
      line.forEach((_, c) => (line[c] = start + 300 + c * 90)),
    );
  }

  canvas.addEventListener("pointermove", (e) => {
    if (!t.grid) return;
    const col = Math.floor((e.offsetX / canvas.clientWidth) * t.grid.cols);
    const row = Math.floor((e.offsetY / canvas.clientHeight) * t.grid.rows);
    const line = until[row];
    if (!line) return;
    for (let c = col - 1; c <= col + 1; c++) {
      if (c >= 0 && c < line.length) line[c] = performance.now() + 300;
    }
  });

  t.draw(() => {
    t.background(0); // pure black: the canvas is blended over the waves
    if (!t.grid) return;

    const { cols, rows } = t.grid;
    const now = performance.now();
    const step = Math.floor(now / 60); // scrambled letters change ~16x a second

    LINES.forEach((line, r) => {
      for (let c = 0; c < line.length; c++) {
        const scrambling = now < until[r][c];
        t.char(
          scrambling
            ? SCRAMBLE[(step * 7 + c * 13 + r * 5) % SCRAMBLE.length]
            : line[c],
        );

        const p = (c / (widest - 1)) * (STOPS.length - 1);
        const a = STOPS[Math.floor(p)];
        const b = STOPS[Math.min(STOPS.length - 1, Math.floor(p) + 1)];
        const mix = p - Math.floor(p);
        t.charColor(
          Math.floor(a[0] + (b[0] - a[0]) * mix),
          Math.floor(a[1] + (b[1] - a[1]) * mix),
          Math.floor(a[2] + (b[2] - a[2]) * mix),
        );

        // Left-aligned, one line per row. Whole numbers only: with an odd
        // column count, cols / 2 lands between cells and the first letter
        // falls off the left edge.
        const x = c - Math.floor(cols / 2);
        const y = r - Math.floor(rows / 2);
        t.translate(x, y);
        t.rect(1, 1);
        t.translate(-x, -y);
      }
    });
  });
}
