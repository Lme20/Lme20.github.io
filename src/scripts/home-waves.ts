// Home page backdrop, modelled on loopdroneloop.nicolastilly.fr.
//
// That site builds its background with the textmode.synth.js plugin:
//   solid(...).blend(osc(9, .014).kaleid(5), .34)
//     .modulate(noise(1, .014), .18).contrast(1.12)
//     .charColor(plasma(4.2, .024, 0, 1.12).color(.12, 1.3, 3.67))
//     .charMap("§ @ > ( * , )")
// The plugin is AGPL-licensed and needs a newer textmode.js than this project
// has, so the same steps are worked out by hand here, one character at a time:
//   1. warp the coordinates with slow noise        (modulate)
//   2. fold them into 5 mirrored slices            (kaleid)
//   3. run a sine wave across the folded shape     (osc)
//   4. turn the wave's height into a character     (charMap)
// The spaces in GLYPHS are real entries: they are the black gaps between lines.
import { textmode } from "textmode.js";

// The canvas is in layouts/Base.astro, so the waves run on every page.
// Its data-dim attribute sets the brightness (fainter on inner pages).
const canvas = document.querySelector<HTMLCanvasElement>("#bg-waves");

if (canvas) {
  const FONT_SIZE = 8; // px per character, matching the bust
  const GLYPHS = "§ @ > ( * , )"; // low to high; spaces = black bands
  const COLOR = [0.12, 1.3, 3.67]; // blue-cyan tint, as on the reference
  const SLICES = 5; // mirrored slices around the centre
  const FREQUENCY = 9; // waves across the shape: higher = more, tighter lines
  const WARP = 0.18; // how far the noise bends the shape
  const SPREAD = 0.8; // share of the glyph set one wave sweeps through
  const DRIFT = 0.014; // how fast the waves and the warp move
  const DIM = Number(canvas.dataset.dim ?? 0.22); // brightness: lower = darker, more subtle
  // Visitors who ask their system for less motion get a still pattern
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const slice = (Math.PI * 2) / SLICES;

  // ponytail: sums of sines stand in for the plugin's simplex noise. It is
  // smooth and cheap; swap in real noise if the warp looks too regular.
  const noise = (x: number, y: number, z: number) =>
    (Math.sin(x * 3.1 + z * 6) * Math.cos(y * 2.7 - z * 4) +
      Math.sin((x + y) * 4.3 + z * 5) * 0.5) /
    1.5;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // The waves drift slowly (about 0.13 rad/s), so 10 fps looks the same as 30
  // for a third of the work.
  const t = textmode.create({ canvas, fontSize: FONT_SIZE, frameRate: 10 });

  // Reduced motion: draw one still frame instead of redrawing it forever
  t.setup(() => {
    if (still) t.noLoop();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) t.noLoop();
    else if (!still) t.loop();
  });

  t.draw(() => {
    t.background(10);
    if (!t.grid) return;

    const { cols, rows } = t.grid;
    const time = still ? 0 : performance.now() / 1000; // seconds

    // Slowly slides which glyphs each line uses, over about two minutes
    const base = 0.12 + 0.06 * Math.sin((time * Math.PI * 2) / 120);
    const colorTime = time * 0.024;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const sx = (x + 0.5) / cols; // 0..1 across the screen
        const sy = (y + 0.5) / rows;

        // 1. warp
        const n = noise(sx, sy, time * DRIFT) * WARP;
        const px = sx + n - 0.5;
        const py = sy + n - 0.5;

        // 2. fold into mirrored slices around the centre
        const radius = Math.hypot(px, py);
        let angle = Math.atan2(py, px);
        angle = ((angle % slice) + slice) % slice;
        angle = Math.abs(angle - slice / 2);
        const folded = radius * Math.cos(angle);

        // 3. wave, 0..1
        const wave =
          Math.sin((folded + time * DRIFT) * FREQUENCY) * 0.5 + 0.5;

        // 4. character
        const level = Math.min(0.999, Math.max(0, base + wave * SPREAD));
        const glyph = GLYPHS[Math.floor(level * GLYPHS.length)];
        if (glyph === " ") continue; // gap between lines: leave black

        // Colour: a slow plasma, tinted blue-cyan and clipped per channel
        let plasma =
          (Math.sin(sx * 4.2 + colorTime) +
            Math.sin(sy * 4.62 + colorTime * 1.2) +
            Math.sin((sx + sy) * 2.94 + colorTime * 0.8)) /
            6 +
          0.5;
        plasma = (plasma - 0.5) * 1.12 + 0.5;

        t.char(glyph);
        t.charColor(
          Math.floor(Math.min(1, COLOR[0] * plasma) * 255 * DIM),
          Math.floor(Math.min(1, COLOR[1] * plasma) * 255 * DIM),
          Math.floor(Math.min(1, COLOR[2] * plasma) * 255 * DIM),
        );

        t.translate(x - cols / 2, y - rows / 2);
        t.rect(1, 1);
        t.translate(-(x - cols / 2), -(y - rows / 2));
      }
    }
  });

  t.windowResized(() => {
    t.resizeCanvas(window.innerWidth, window.innerHeight);
    if (still) t.redraw();
  });
}
