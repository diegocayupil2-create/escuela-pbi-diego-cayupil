// Genera los íconos de la app (PNG) desde un SVG. Se corre a mano solo si cambia el diseño:
//   node sitio/scripts/iconos.mjs
// Diseño: tres barras sobre pizarra; dos en gris de contexto y una en el acento. Es la regla de
// «color con intención» del capítulo 19: el gris da contexto y el color marca lo importante.
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const PUBLICO = fileURLToPath(new URL('../public/', import.meta.url));

const svg = (redondeo) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${redondeo}" fill="#17202B"/>
  <rect x="128" y="276" width="68" height="116" rx="14" fill="#8A95A3"/>
  <rect x="222" y="204" width="68" height="188" rx="14" fill="#8A95A3"/>
  <rect x="316" y="120" width="68" height="272" rx="14" fill="#6E9EFF"/>
</svg>
`;

await mkdir(`${PUBLICO}iconos`, { recursive: true });
await writeFile(`${PUBLICO}favicon.svg`, svg(112));
const salidas = [
  ['iconos/icono-192.png', 192, 112],
  ['iconos/icono-512.png', 512, 112],
  ['iconos/icono-maskable-512.png', 512, 0], // a sangre: el celular le pone su propia forma
  ['iconos/apple-touch-icon.png', 180, 0], // el iPhone redondea las esquinas solo
];
for (const [ruta, lado, redondeo] of salidas) {
  await sharp(Buffer.from(svg(redondeo))).resize(lado, lado).png({ compressionLevel: 9 }).toFile(`${PUBLICO}${ruta}`);
  console.log(`listo: sitio/public/${ruta}`);
}
