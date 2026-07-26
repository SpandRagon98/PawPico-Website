import { createHash, createPrivateKey, sign } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const productRoot = join(root, "public", "store", "products", "mecha-hero");
const staging = join(root, ".iron-man-cat-costume-staging");
const privateKeyPath = process.env.MEWMUZE_MECHA_SIGNING_KEY;
const marketingImage = join(productRoot, "iron-man-cat.png");

if (!privateKeyPath || !existsSync(privateKeyPath)) {
  throw new Error("Set MEWMUZE_MECHA_SIGNING_KEY to an external Ed25519 PKCS#8 PEM file.");
}
if (!existsSync(marketingImage)) {
  throw new Error("Generate public/store/products/mecha-hero/iron-man-cat.png first.");
}

rmSync(staging, { recursive: true, force: true });
mkdirSync(staging, { recursive: true });
execFileSync(
  "powershell.exe",
  [
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", join(root, "scripts", "generate-iron-man-cat-costume-art.ps1"),
    "-OutputDirectory", staging,
    "-MarketingImage", marketingImage,
  ],
  { stdio: "inherit" },
);

const assetPaths = [
  "thumbnail.png",
  "preview.png",
  "assets/body-front.png",
  "assets/body-front-open.png",
  "assets/body-front-glow.png",
  "assets/body-side.png",
  "assets/body-side-open.png",
  "assets/body-side-glow.png",
  "assets/body-back.png",
];
const assetHashes = Object.fromEntries(
  assetPaths.map((path) => [
    path,
    createHash("sha256").update(readFileSync(join(staging, path))).digest("hex"),
  ]),
);
const manifest = {
  schemaVersion: 1,
  id: "mewmuze.iron-man-cat.v1",
  name: "Iron Man Cat",
  version: "1.0.1",
  creator: "MewMuze Studio",
  description: "Fitted red-and-gold armor worn over your existing MewMuze cat, with an opening faceplate and intermittent glowing helmet eyes.",
  category: "heroes",
  supportedBodies: ["classic", "chonk", "fluffy", "siamese", "kitten"],
  minimumAppVersion: "0.1.0",
  maximumAppVersion: null,
  thumbnail: "thumbnail.png",
  preview: "preview.png",
  assets: [
    { path: "assets/body-front.png", view: "front", layer: "overlay", variant: "base", offsetX: 0, offsetY: 0, scale: 1, opacity: 1 },
    { path: "assets/body-front-open.png", view: "front", layer: "overlay", variant: "maskOpen", offsetX: 0, offsetY: 0, scale: 1, opacity: 1 },
    { path: "assets/body-front-glow.png", view: "front", layer: "overlay", variant: "eyeGlow", offsetX: 0, offsetY: 0, scale: 1, opacity: 1 },
    { path: "assets/body-side.png", view: "side", layer: "overlay", variant: "base", offsetX: 0, offsetY: 0, scale: 1, opacity: 1 },
    { path: "assets/body-side-open.png", view: "side", layer: "overlay", variant: "maskOpen", offsetX: 0, offsetY: 0, scale: 1, opacity: 1 },
    { path: "assets/body-side-glow.png", view: "side", layer: "overlay", variant: "eyeGlow", offsetX: 0, offsetY: 0, scale: 1, opacity: 1 },
    { path: "assets/body-back.png", view: "back", layer: "overlay", variant: "base", offsetX: 0, offsetY: 0, scale: 1, opacity: 1 }
  ],
  assetHashes,
  packageSize: 0,
  licenseId: "mock-iron-man-cat-v1",
  signatureKeyId: "store-key-mecha-2026-02"
};
const entitlement = {
  costumeId: manifest.id,
  entitlementId: "mock-iron-man-cat-entitlement-v1",
  issuedAt: Math.floor(Date.now() / 1000),
  mode: "mock"
};
const privateKey = createPrivateKey(readFileSync(privateKeyPath));
const manifestBytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
const entitlementBytes = Buffer.from(`${JSON.stringify(entitlement, null, 2)}\n`);
writeFileSync(join(staging, "manifest.json"), manifestBytes);
writeFileSync(join(staging, "entitlement.json"), entitlementBytes);
writeFileSync(join(staging, "signature.ed25519"), `${sign(null, manifestBytes, privateKey).toString("base64")}\n`);
writeFileSync(join(staging, "entitlement.ed25519"), `${sign(null, entitlementBytes, privateKey).toString("base64")}\n`);

const packageAssets = join(productRoot, "package");
rmSync(packageAssets, { recursive: true, force: true });
mkdirSync(packageAssets, { recursive: true });
writeFileSync(join(packageAssets, "manifest.json"), manifestBytes);
for (const path of assetPaths) {
  const destination = join(packageAssets, path);
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(join(staging, path), destination);
}

const zipPath = join(productRoot, "iron-man-cat.zip");
const packagePath = join(productRoot, "iron-man-cat.mewcostume");
rmSync(zipPath, { force: true });
rmSync(packagePath, { force: true });
execFileSync(
  "powershell.exe",
  [
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", join(root, "scripts", "generate-sample-costume-archive.ps1"),
    "-SourceDirectory", staging,
    "-DestinationPath", zipPath,
  ],
  { stdio: "inherit" },
);
renameSync(zipPath, packagePath);
rmSync(staging, { recursive: true, force: true });
console.log(`Created ${packagePath}`);
