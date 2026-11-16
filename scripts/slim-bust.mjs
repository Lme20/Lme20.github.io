// One-off: strips the textures, materials and UV/tangent data the site never
// uses (home-3d.ts swaps in MeshNormalMaterial), then quantizes the geometry.
// three.js reads quantized meshes natively, so no decoder is needed.
// Run with: node scripts/slim-bust.mjs
import { NodeIO } from "@gltf-transform/core";
import { prune, weld, quantize } from "@gltf-transform/functions";

const path = "public/models/helios_vaporwave_bust.glb";
const io = new NodeIO();
const doc = await io.read(path);

doc.getRoot().listTextures().forEach((t) => t.dispose());
doc.getRoot().listMaterials().forEach((m) => m.dispose());
await doc.transform(prune({ keepAttributes: false }), weld(), quantize());

await io.write(path, doc);
