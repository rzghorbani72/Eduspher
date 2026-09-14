#!/usr/bin/env node
/**
 * Rasterize logo-mark.svg into SERP/favicon sizes using the sharp already
 * vendored by Next. Run from edusphere: `node scripts/generate-brand-icons.mjs`
 */
const fs = require('fs');
const path = require('path');

function resolveSharp() {
  const root = path.join(__dirname, '..', 'node_modules', '.pnpm');
  const entries = fs.readdirSync(root).filter((d) => d.startsWith('sharp@'));
  if (!entries.length) {
    throw new Error('sharp not found under node_modules/.pnpm');
  }
  return require(path.join(root, entries[0], 'node_modules', 'sharp'));
}

const sharp = resolveSharp();
const publicDir = path.join(__dirname, '..', 'public');
const appDir = path.join(__dirname, '..', 'app');
const svg = fs.readFileSync(path.join(publicDir, 'logo-mark.svg'));

async function transparentPng(file, size) {
  await sharp(svg, { density: 512 })
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(publicDir, file));
  console.log('wrote', file, size);
}

async function appleTouch(file, size) {
  const mark = await sharp(svg, { density: 512 })
    .resize(Math.round(size * 0.72), Math.round(size * 0.72), {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 255 },
    },
  })
    .composite([{ input: mark, gravity: 'centre' }])
    .png()
    .toFile(path.join(publicDir, file));
  console.log('wrote', file, size);
}

function writeIco(pngBuf, dest) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(48, 0);
  entry.writeUInt8(48, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuf.length, 8);
  entry.writeUInt32LE(22, 12);
  fs.writeFileSync(dest, Buffer.concat([header, entry, pngBuf]));
}

(async () => {
  await transparentPng('icon-48.png', 48);
  await transparentPng('icon-192.png', 192);
  await transparentPng('icon-512.png', 512);
  await transparentPng('logo-mark.png', 512);
  await appleTouch('apple-touch-icon.png', 180);

  const png48 = await sharp(path.join(publicDir, 'icon-48.png')).png().toBuffer();
  writeIco(png48, path.join(publicDir, 'favicon.ico'));
  console.log('wrote favicon.ico');

  fs.copyFileSync(path.join(publicDir, 'icon-48.png'), path.join(appDir, 'icon.png'));
  fs.copyFileSync(
    path.join(publicDir, 'apple-touch-icon.png'),
    path.join(appDir, 'apple-icon.png'),
  );
  console.log('synced app/icon.png and app/apple-icon.png');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
