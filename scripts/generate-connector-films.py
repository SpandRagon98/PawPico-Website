"""Generate connector feature films from PawPico's existing app-rendered footage.

This script never imports or writes to the application repository. It crops the
cat motion from the already exported product films in public/videos, places it
inside accurate Gmail, Calendar, and reminder UI stories, and encodes H.264 MP4.

Requirements: Pillow and an ffmpeg executable supplied through FFMPEG_EXE.
"""

from __future__ import annotations

import math
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
VIDEOS = ROOT / "public" / "videos"
FFMPEG = Path(os.environ["FFMPEG_EXE"])
FPS = 30
W, H = 1280, 720

DISPLAY = "C:/Windows/Fonts/georgia.ttf"
SANS = "C:/Windows/Fonts/bahnschrift.ttf"
MONO = "C:/Windows/Fonts/consola.ttf"

COLORS = {
    "ink": "#2b201b",
    "muted": "#746357",
    "paper": "#eadcc4",
    "paper_hi": "#f8edda",
    "paper_lo": "#ccb493",
    "walnut": "#3a2822",
    "copper": "#b85c42",
    "amber": "#d59a43",
    "green": "#5f8067",
    "sage": "#75856d",
    "coral": "#bd604d",
    "line": "#8c7059",
    "white": "#fff7ea",
}


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


F_DISPLAY_52 = font(DISPLAY, 52)
F_DISPLAY_31 = font(DISPLAY, 31)
F_SANS_23 = font(SANS, 23)
F_SANS_18 = font(SANS, 18)
F_SANS_15 = font(SANS, 15)
F_MONO_16 = font(MONO, 16)
F_MONO_13 = font(MONO, 13)
F_MONO_11 = font(MONO, 11)


def ease(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return 1 - (1 - value) ** 3


def rounded(draw: ImageDraw.ImageDraw, box, radius: int, fill, outline=None, width: int = 1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def text(draw: ImageDraw.ImageDraw, xy, value: str, fnt, fill, anchor=None):
    draw.text(xy, value, font=fnt, fill=fill, anchor=anchor)


def fit_text(draw: ImageDraw.ImageDraw, value: str, fnt, max_width: int) -> list[str]:
    words = value.split()
    lines: list[str] = []
    line = ""
    for word in words:
        probe = f"{line} {word}".strip()
        if draw.textbbox((0, 0), probe, font=fnt)[2] <= max_width:
            line = probe
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def draw_grid(draw: ImageDraw.ImageDraw):
    draw.rectangle((0, 0, W, H), fill=COLORS["paper"])
    draw.ellipse((-160, -210, 620, 570), fill="#f2e5d0")


def draw_window(draw: ImageDraw.ImageDraw, title: str, code: str, accent: str):
    rounded(draw, (23, 21, 1257, 699), 27, COLORS["walnut"], "#201512", 3)
    rounded(draw, (36, 34, 1244, 687), 20, COLORS["paper_hi"], "#6a4d3d", 2)
    rounded(draw, (36, 34, 1244, 86), 19, accent)
    draw.rectangle((36, 64, 1244, 86), fill=accent)
    text(draw, (60, 59), title.upper(), F_MONO_13, COLORS["white"], anchor="lm")
    text(draw, (1018, 59), code, F_MONO_11, "#f2dcc2", anchor="rm")
    for i, color in enumerate(("#779174", "#d7a252", "#c76a55")):
        draw.ellipse((1166 + i * 20, 51, 1176 + i * 20, 61), fill=color, outline="#4c382e")
    draw.line((56, 651, 1224, 651), fill="#8c7059", width=2)


def draw_cat_stage(canvas: Image.Image, draw: ImageDraw.ImageDraw, source: Image.Image):
    rounded(draw, (57, 111, 670, 623), 16, "#eadcc4", "#6b4b3a", 3)

    # Motion-only clips are rendered from the real application sprite system at
    # 720x480. Crop empty side space, never the cat, to fit this tall viewport.
    crop = source.crop((70, 0, 650, 480))
    crop = crop.resize((575, 472), Image.Resampling.LANCZOS)
    canvas.paste(crop, (76, 130))
    rounded(draw, (82, 138, 254, 169), 5, "#f7ead6", "#82654f", 1)
    text(draw, (95, 153), "ACTUAL PAWPICO MOTION", F_MONO_11, COLORS["ink"], anchor="lm")


def indicator(draw: ImageDraw.ImageDraw, x: int, y: int, label: str, on: bool = True):
    color = COLORS["green"] if on else "#9d8976"
    draw.ellipse((x, y - 5, x + 10, y + 5), fill=color, outline="#405243")
    text(draw, (x + 18, y), label.upper(), F_MONO_11, COLORS["muted"], anchor="lm")


def label(draw: ImageDraw.ImageDraw, x: int, y: int, value: str, color: str):
    width = draw.textbbox((0, 0), value.upper(), font=F_MONO_11)[2] + 22
    rounded(draw, (x, y, x + width, y + 28), 14, color)
    text(draw, (x + 11, y + 14), value.upper(), F_MONO_11, COLORS["white"], anchor="lm")


def panel(draw: ImageDraw.ImageDraw, title_value: str, subtitle: str, accent: str):
    text(draw, (716, 126), title_value, F_DISPLAY_52, COLORS["ink"])
    text(draw, (718, 190), subtitle.upper(), F_MONO_11, accent)
    rounded(draw, (711, 221, 1211, 611), 15, "#f1e4cf", "#93765d", 2)
    draw.line((733, 272, 1189, 272), fill="#b39b80", width=1)


def notice(draw: ImageDraw.ImageDraw, y: int, message: str, tone: str, progress: float, actions: tuple[str, ...] = ()):
    slide = int((1 - ease(progress)) * 44)
    y += slide
    bg = {"plain": "#fffaf0", "warn": "#e7f0dc", "due": "#f3d8d0"}[tone]
    stroke = {"plain": "#625044", "warn": "#61805f", "due": "#a65445"}[tone]
    rounded(draw, (737, y, 1186, y + 112), 9, bg, stroke, 2)
    draw.polygon(((754, y + 112), (779, y + 112), (763, y + 128)), fill=bg, outline=stroke)
    for index, line in enumerate(fit_text(draw, message, F_SANS_18, 410)[:2]):
        text(draw, (758, y + 24 + index * 25), line, F_SANS_18, COLORS["ink"])
    if actions:
        x = 758
        for action in actions:
            width = draw.textbbox((0, 0), action.upper(), font=F_MONO_11)[2] + 24
            rounded(draw, (x, y + 77, x + width, y + 101), 5, COLORS["paper_lo"], "#8a6f57")
            text(draw, (x + 12, y + 89), action.upper(), F_MONO_11, COLORS["ink"], anchor="lm")
            x += width + 8


def gmail_scene(canvas: Image.Image, draw: ImageDraw.ImageDraw, source: Image.Image, t: float):
    draw_window(draw, "Gmail connector", "G-01 / 60 SEC POLL", COLORS["green"])
    draw_cat_stage(canvas, draw, source)
    panel(draw, "Mail, with paws.", "direct Gmail connection / newest envelope only", COLORS["green"])
    indicator(draw, 742, 248, "Gmail connected")
    text(draw, (1158, 248), "1 MIN", F_MONO_11, COLORS["green"], anchor="rm")

    rounded(draw, (738, 292, 1184, 361), 9, "#e4d4bb", "#a58b6e")
    text(draw, (758, 313), "INBOX STATUS", F_MONO_11, COLORS["muted"])
    text(draw, (758, 330), "12 unread", F_SANS_23, COLORS["ink"])
    text(draw, (1162, 337), "UID 1842", F_MONO_11, COLORS["muted"], anchor="rm")

    if t < 2.0:
        label(draw, 741, 391, "quiet baseline", COLORS["sage"])
        text(draw, (741, 440), "Existing mail stays quiet.", F_SANS_18, COLORS["muted"])
        text(draw, (741, 469), "A first poll never creates a burst.", F_SANS_15, COLORS["muted"])
    else:
        p = (t - 2.0) / 0.6
        notice(draw, 391, "Spandan, new email from Alice — Project review", "plain", p)
        label(draw, 741, 545, "wave + optional meow", COLORS["copper"])
    text(draw, (62, 672), "APP PASSWORD / IMAP TLS / NEWEST SENDER + SUBJECT / MESSAGE BODY NEVER READ", F_MONO_11, "#785f4d", anchor="lm")


def calendar_scene(canvas: Image.Image, draw: ImageDraw.ImageDraw, source: Image.Image, t: float):
    draw_window(draw, "Google Calendar connector", "C-02 / 5 MIN SYNC", COLORS["sage"])
    draw_cat_stage(canvas, draw, source)
    panel(draw, "Time, gently kept.", "private iCal address / configurable warning", COLORS["sage"])
    indicator(draw, 742, 248, "Calendar connected")
    text(draw, (1158, 248), "WARN 10 MIN", F_MONO_11, COLORS["sage"], anchor="rm")

    rounded(draw, (738, 292, 1184, 361), 9, "#e4d4bb", "#a58b6e")
    text(draw, (758, 313), "NEXT EVENT", F_MONO_11, COLORS["muted"])
    text(draw, (758, 330), "Design review", F_SANS_23, COLORS["ink"])
    time_label = "10:30" if t < 6.2 else "NOW"
    text(draw, (1162, 337), time_label, F_MONO_16, COLORS["sage"] if t < 6.2 else COLORS["coral"], anchor="rm")

    if t < 2.7:
        label(draw, 741, 391, "upcoming", COLORS["sage"])
        text(draw, (741, 440), "The feed refreshes quietly.", F_SANS_18, COLORS["muted"])
        text(draw, (741, 469), "No alarm outside the warn window.", F_SANS_15, COLORS["muted"])
    elif t < 6.2:
        notice(draw, 391, "Spandan, Design review in 5 minutes", "warn", (t - 2.7) / 0.6, ("Snooze", "OK"))
    else:
        notice(draw, 391, "Design review is starting now", "due", (t - 6.2) / 0.5, ("Snooze", "OK"))
    text(draw, (62, 672), "HTTPS ONLY / TIMED EVENTS / LOCAL TIME ZONE / ALL-DAY EVENTS SKIP TIMED ALARMS", F_MONO_11, "#785f4d", anchor="lm")


def notices_scene(canvas: Image.Image, draw: ImageDraw.ImageDraw, source: Image.Image, t: float):
    draw_window(draw, "Smart notifications", "N-03 / ONE NOTICE LANGUAGE", COLORS["coral"])
    draw_cat_stage(canvas, draw, source)
    panel(draw, "Never a noisy toast.", "reminders / work-rest / mail / calendar", COLORS["coral"])
    indicator(draw, 742, 248, "notebook notices")
    text(draw, (1158, 248), "FULL-SCREEN QUIET", F_MONO_11, COLORS["coral"], anchor="rm")

    if t < 3.2:
        rounded(draw, (738, 292, 1184, 361), 9, "#e4d4bb", "#a58b6e")
        text(draw, (758, 313), "ACTIVE-USE CHECK", F_MONO_11, COLORS["muted"])
        text(draw, (758, 330), "Stretch with me", F_SANS_23, COLORS["ink"])
        notice(draw, 391, "Spandan, take a short rest — stretch with me!", "plain", min(1, t / 0.6), ("Snooze", "OK"))
    elif t < 6.2:
        rounded(draw, (738, 292, 1184, 361), 9, "#e4d4bb", "#a58b6e")
        text(draw, (758, 313), "STAKEHOLDER MEETING", F_MONO_11, COLORS["muted"])
        text(draw, (758, 330), "5 minute warning", F_SANS_23, COLORS["ink"])
        notice(draw, 391, "Stakeholder Meeting in 5 minutes.", "warn", (t - 3.2) / 0.5, ("Snooze", "Done"))
    else:
        rounded(draw, (738, 292, 1184, 361), 9, "#ead0c8", "#b56757")
        text(draw, (758, 313), "STAKEHOLDER MEETING", F_MONO_11, COLORS["coral"])
        text(draw, (758, 330), "Due now", F_SANS_23, COLORS["ink"])
        notice(draw, 391, "Stakeholder Meeting is now. Please join.", "due", (t - 6.2) / 0.5, ("Snooze", "Done"))
    text(draw, (62, 672), "TYPEWRITER REVEAL / 5 MIN SNOOZE / MARK DONE / ABOVE THE CAT / NEVER A WINDOWS POP-UP", F_MONO_11, "#785f4d", anchor="lm")


SCENES = {
    "gmail-connector.mp4": (gmail_scene, "gmail-motion.mp4"),
    "calendar-connector.mp4": (calendar_scene, "calendar-motion.mp4"),
    "smart-notifications.mp4": (notices_scene, "notices-motion.mp4"),
}


def extract_frames(source: Path, target: Path):
    subprocess.run(
        [str(FFMPEG), "-y", "-loglevel", "error", "-i", str(source), "-vf", f"fps={FPS}", str(target / "%04d.png")],
        check=True,
    )


def encode(frames: Path, output: Path):
    subprocess.run(
        [
            str(FFMPEG),
            "-y",
            "-loglevel",
            "error",
            "-framerate",
            str(FPS),
            "-i",
            str(frames / "%04d.png"),
            "-c:v",
            "libx264",
            "-preset",
            "slow",
            "-crf",
            "20",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            str(output),
        ],
        check=True,
    )


def main():
    temp_root = Path(tempfile.mkdtemp(prefix="pawpico-films-"))
    try:
        for output_name, (scene, source_name) in SCENES.items():
            sources_dir = temp_root / source_name.replace(".mp4", "")
            sources_dir.mkdir()
            extract_frames(VIDEOS / source_name, sources_dir)
            sources = sorted(sources_dir.glob("*.png"))
            if not sources:
                raise RuntimeError(f"No frames were extracted from {source_name}")
            frames_dir = temp_root / output_name.replace(".mp4", "")
            frames_dir.mkdir()
            for frame_index in range(FPS * 10):
                source = Image.open(sources[frame_index % len(sources)]).convert("RGB")
                canvas = Image.new("RGB", (W, H), COLORS["paper"])
                draw = ImageDraw.Draw(canvas)
                draw_grid(draw)
                scene(canvas, draw, source, frame_index / FPS)
                canvas.save(frames_dir / f"{frame_index + 1:04d}.png", optimize=False)
                source.close()
            encode(frames_dir, VIDEOS / output_name)
            print(f"generated {VIDEOS / output_name}")
    finally:
        shutil.rmtree(temp_root, ignore_errors=True)


if __name__ == "__main__":
    main()
