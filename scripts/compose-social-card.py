"""Compose MewMuze's social card from the exact supplied flower-band cat asset."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
WIDTH, HEIGHT = 1200, 630


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(f"C:/Windows/Fonts/{name}", size)


canvas = Image.new("RGB", (WIDTH, HEIGHT), "#f5f6f7")
draw = ImageDraw.Draw(canvas)

# Single white tactile surface with a consistent upper-left light.
draw.rounded_rectangle((28, 24, 1172, 594), radius=34, fill="#c9cdd1")
draw.rounded_rectangle(
    (28, 18, 1172, 588),
    radius=34,
    fill="#ffffff",
    outline="#bfc3c8",
    width=2,
)
draw.line((44, 38, 1156, 38), fill="#ffffff", width=3)

# The authentic current cat, enlarged only with nearest-neighbour sampling.
cat = Image.open(PUBLIC / "mewmuze-flower-cat.png").convert("RGBA")
cat = cat.resize((275, 430), Image.Resampling.NEAREST)
canvas.paste(cat, (-32, 105), cat)
draw.rectangle((25, 44, 38, 568), fill="#e3e5e7", outline="#bfc3c8", width=1)

sans_bold = font("bahnschrift.ttf", 70)
sans_small = font("bahnschrift.ttf", 22)
mono = font("consola.ttf", 17)
mono_small = font("consola.ttf", 14)

draw.ellipse((325, 103, 339, 117), fill="#a9d8bd", outline="#467c57", width=2)
draw.text(
    (354, 99),
    "A PERSONAL DESKTOP CAT FOR WINDOWS",
    font=mono,
    fill="#4f555b",
)

headline_lines = ["Your screen could use", "a little more life."]
for index, line in enumerate(headline_lines):
    draw.text((322, 153 + index * 82), line, font=sans_bold, fill="#202326")

copy = (
    "Quiet company, local tools, gentle reminders and a little more life "
    "for an ordinary Windows workday."
)
words = copy.split()
line = ""
lines: list[str] = []
for word in words:
    probe = f"{line} {word}".strip()
    if draw.textbbox((0, 0), probe, font=sans_small)[2] <= 760:
        line = probe
    else:
        lines.append(line)
        line = word
lines.append(line)
for index, text_line in enumerate(lines):
    draw.text((324, 350 + index * 34), text_line, font=sans_small, fill="#666b72")

draw.rounded_rectangle(
    (322, 479, 520, 535),
    radius=13,
    fill="#a9d8bd",
    outline="#76a986",
    width=2,
)
draw.text((350, 497), "MEET MEWMUZE", font=mono_small, fill="#202326")
draw.text(
    (558, 498),
    "LOCAL-FIRST / WINDOWS 10 + 11",
    font=mono_small,
    fill="#666b72",
)

canvas.save(PUBLIC / "og-mewmuze.png", optimize=True)
print(f"Saved {PUBLIC / 'og-mewmuze.png'}")
