import { createHash, createPrivateKey, sign } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sampleRoot = join(root, "public", "store", "samples", "space-explorer");
const staging = join(root, ".sample-costume-staging");
const privateKeyPath = process.env.MEWMUZE_SAMPLE_SIGNING_KEY;

if (!privateKeyPath || !existsSync(privateKeyPath)) {
  throw new Error("Set MEWMUZE_SAMPLE_SIGNING_KEY to an external Ed25519 PKCS#8 PEM file.");
}

rmSync(staging, { recursive: true, force: true });
mkdirSync(staging, { recursive: true });
execFileSync(
  "powershell.exe",
  [
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", join(root, "scripts", "generate-sample-costume-art.ps1"),
    "-OutputDirectory", staging,
  ],
  { stdio: "inherit" },
);

const assetPaths = [
  "thumbnail.png",
  "preview.png",
  "assets/body-front.png",
  "assets/body-side.png",
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
  id: "mewmuze.space-explorer.sample",
  name: "Space Explorer — Development Sample",
  version: "1.0.0",
  creator: "MewMuze Studio",
  description: "An original, signed visual-only sample used to test the local costume installer.",
  category: "development",
  supportedBodies: ["classic", "chonk", "fluffy", "siamese", "kitten"],
  minimumAppVersion: "0.1.0",
  maximumAppVersion: null,
  thumbnail: "thumbnail.png",
  preview: "preview.png",
  assets: [
    { path: "assets/body-front.png", view: "front", layer: "overlay", offsetX: 0, offsetY: 0, scale: 1, opacity: 1 },
    { path: "assets/body-side.png", view: "side", layer: "overlay", offsetX: 0, offsetY: 0, scale: 1, opacity: 1 },
    { path: "assets/body-back.png", view: "back", layer: "overlay", offsetX: 0, offsetY: 0, scale: 1, opacity: 1 }
  ],
  assetHashes,
  packageSize: 0,
  licenseId: "development-sample-space-explorer",
  signatureKeyId: "store-key-2026-01"
};
const entitlement = {
  costumeId: manifest.id,
  entitlementId: "development-sample-entitlement",
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

mkdirSync(sampleRoot, { recursive: true });
writeFileSync(join(sampleRoot, "manifest.json"), manifestBytes);
for (const path of assetPaths) {
  const destination = join(sampleRoot, path);
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(join(staging, path), destination);
}
const zipPath = join(root, "public", "store", "samples", "space-explorer.zip");
const packagePath = join(root, "public", "store", "samples", "space-explorer-sample.mewcostume");
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
