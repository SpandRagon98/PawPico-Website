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

    args = parser.parse_args()
    if args.command == "webp":
        assemble_webp(args.frames, args.output, args.durations)
    else:
        face_crop(args.source, args.output_dir)


if __name__ == "__main__":
    main()
