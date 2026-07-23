"""Composite PawPico's exact supplied logo and verified copy onto the social card."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"

background = Image.open(PUBLIC / "og-console-background.png").convert("RGB")
logo = Image.open(PUBLIC / "pawpico-face-logo.png").convert("RGB")
draw = ImageDraw.Draw(background)

display = ImageFont.truetype("C:/Windows/Fonts/georgiab.ttf", 96)
display_italic = ImageFont.truetype("C:/Windows/Fonts/georgiai.ttf", 50)
sans = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 31)
mono = ImageFont.truetype("C:/Windows/Fonts/consolab.ttf", 21)

# Preserve the exact logo image while giving it a clean circular medallion crop.
logo = logo.resize((500, 500), Image.Resampling.LANCZOS)
mask = Image.new("L", logo.size, 0)
ImageDraw.Draw(mask).ellipse((5, 5, 495, 495), fill=255)
shadow = Image.new("RGBA", background.size, (0, 0, 0, 0))
shadow_draw = ImageDraw.Draw(shadow)
shadow_draw.ellipse((132, 212, 652, 732), fill=(60, 35, 24, 72))
shadow = shadow.filter(ImageFilter.GaussianBlur(18))
background.paste(shadow, (0, 0), shadow)
background.paste(logo, (142, 198), mask)

ink = "#2a1f1a"
copper = "#b65b3f"
muted = "#6d5c50"
green = "#5e7d63"

draw.text((700, 270), "PawPico", font=display, fill=ink)
draw.text((706, 384), "Your desktop,", font=display_italic, fill=copper)
draw.text((706, 440), "now with a pulse.", font=display_italic, fill=copper)
draw.text((710, 523), "AN EXPRESSIVE WINDOWS CAT + A TINY PRODUCTIVITY CONSOLE", font=mono, fill=muted)

features = ["WORK MODE", "GMAIL", "CALENDAR", "87 MOTION STATES"]
x = 708
for index, feature in enumerate(features):
    box = draw.textbbox((0, 0), feature, font=mono)
    width = box[2] - box[0] + 36
    fill = green if index in (1, 2) else copper
    draw.rounded_rectangle((x, 589, x + width, 639), radius=24, fill=fill)
    draw.text((x + 18, 615), feature, font=mono, fill="#fff5e6", anchor="lm")
    x += width + 14

draw.text((710, 700), "Local-first. Connected only when you choose.", font=sans, fill=ink)
draw.text((710, 754), "Windows 10 / 11  •  one-time license  •  no subscription", font=sans, fill=muted)

background.save(PUBLIC / "og-v2.png", optimize=True)
print(PUBLIC / "og-v2.png")
