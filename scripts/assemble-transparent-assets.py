"""Assemble transparent MewMuze web renders without modifying the desktop app.

The input PNG frames are rendered from the app's procedural sprite source. This
helper only crops the face mark and packs already-rendered frames into lossless
animated WebP files.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image


def assemble_webp(frames_dir: Path, output: Path, durations_file: Path) -> None:
    frame_paths = sorted(frames_dir.glob("*.png"))
    if not frame_paths:
        raise RuntimeError(f"No PNG frames found in {frames_dir}")

    durations = json.loads(durations_file.read_text(encoding="utf-8"))
    if len(durations) != len(frame_paths):
        raise RuntimeError("Frame and duration counts do not match")

    frames = [Image.open(path).convert("RGBA") for path in frame_paths]
    output.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(
        output,
        format="WEBP",
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        lossless=True,
        method=6,
        minimize_size=True,
    )
    for frame in frames:
        frame.close()


def face_crop(source: Path, output_dir: Path) -> None:
    image = Image.open(source).convert("RGBA")
    alpha_box = image.getbbox()
    if alpha_box is None:
        raise RuntimeError(f"No opaque pixels found in {source}")

    # The authentic front renderer uses a stable square design space. Crop its
    # face region deliberately rather than using the whole alpha bounds: the
    # curled tail rises beside the head and must never enter the brand mark.
    crop = image.crop(
        (
            round(image.width * 0.16),
            round(image.height * 0.015),
            round(image.width * 0.73),
            round(image.height * 0.535),
        )
    )

    side = max(crop.width, crop.height)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.alpha_composite(crop, ((side - crop.width) // 2, (side - crop.height) // 2))

    output_dir.mkdir(parents=True, exist_ok=True)
    sizes = {
        "mewmuze-face-logo-hd.png": 512,
        "mewmuze-face-logo-192.png": 192,
        "mewmuze-face-logo-180.png": 180,
        "mewmuze-face-logo-48.png": 48,
        "mewmuze-face-logo-32.png": 32,
    }
    for filename, size in sizes.items():
        rendered = square.resize((size, size), Image.Resampling.LANCZOS)
        rendered.save(output_dir / filename, format="PNG", optimize=True)
        rendered.close()

    crop.close()
    square.close()
    image.close()


def hero_layers(base: Path, blink: Path, ears: Path, output_dir: Path) -> None:
    """Split the seated hero into a stable body and independently moving head."""

    output_dir.mkdir(parents=True, exist_ok=True)
    base_image = Image.open(base).convert("RGBA")
    blink_image = Image.open(blink).convert("RGBA")
    ears_image = Image.open(ears).convert("RGBA")

    body = base_image.copy()
    body.paste(
        (0, 0, 0, 0),
        (0, 0, body.width, round(body.height * 0.56)),
    )
    body.save(output_dir / "mewmuze-hero-front-body-hd.png", format="PNG", optimize=True)

    for source, filename in [
        (base_image, "mewmuze-hero-front-head-hd.png"),
        (blink_image, "mewmuze-hero-front-head-blink-hd.png"),
        (ears_image, "mewmuze-hero-front-head-ears-hd.png"),
    ]:
        head = source.copy()
        neck_top = round(head.height * 0.55)
        neck_bottom = round(head.height * 0.60)
        neck_left = round(head.width * 0.37)
        neck_right = round(head.width * 0.63)
        head.paste(
            (0, 0, 0, 0),
            (0, neck_bottom, head.width, head.height),
        )
        head.paste((0, 0, 0, 0), (0, neck_top, neck_left, neck_bottom))
        head.paste((0, 0, 0, 0), (neck_right, neck_top, head.width, neck_bottom))
        head.save(output_dir / filename, format="PNG", optimize=True)
        head.close()

    body.close()
    base_image.close()
    blink_image.close()
    ears_image.close()


def main() -> None:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)

    webp_parser = subparsers.add_parser("webp")
    webp_parser.add_argument("--frames", type=Path, required=True)
    webp_parser.add_argument("--durations", type=Path, required=True)
    webp_parser.add_argument("--output", type=Path, required=True)

    face_parser = subparsers.add_parser("face")
    face_parser.add_argument("--source", type=Path, required=True)
    face_parser.add_argument("--output-dir", type=Path, required=True)

    hero_parser = subparsers.add_parser("hero")
    hero_parser.add_argument("--base", type=Path, required=True)
    hero_parser.add_argument("--blink", type=Path, required=True)
    hero_parser.add_argument("--ears", type=Path, required=True)
    hero_parser.add_argument("--output-dir", type=Path, required=True)

    args = parser.parse_args()
    if args.command == "webp":
        assemble_webp(args.frames, args.output, args.durations)
    elif args.command == "hero":
        hero_layers(args.base, args.blink, args.ears, args.output_dir)
    else:
        face_crop(args.source, args.output_dir)


if __name__ == "__main__":
    main()
