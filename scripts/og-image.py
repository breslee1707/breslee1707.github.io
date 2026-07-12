"""Generate public/assets/og-image.png (1200x630) for social/link previews.

Matches the site's "precision-instrument editorial" system: deep ink
background, one warm amber signal, mono labels, portrait in a thin frame.

Run from the repo root:  python scripts/og-image.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "assets" / "og-image.png"
PORTRAIT = ROOT / "public" / "assets" / "portrait.jpg"

W, H = 1200, 630

# Site palette (dark theme), converted from the oklch tokens in index.css.
BG = (19, 22, 28)
SURFACE = (26, 30, 38)
INK = (242, 243, 245)
MUTED = (163, 168, 178)
FAINT = (120, 126, 138)
LINE = (56, 61, 72)
ACCENT = (234, 182, 98)

FONTS = Path("C:/Windows/Fonts")


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / name), size)


img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# --- Ambient: soft amber glow, top-left ---
glow = Image.new("RGB", (W, H), BG)
gd = ImageDraw.Draw(glow)
gd.ellipse([-260, -300, 420, 320], fill=(48, 40, 30))
glow = glow.filter(ImageFilter.GaussianBlur(120))
img = Image.blend(img, glow, 0.9)
d = ImageDraw.Draw(img)

# --- Agent-graph motif (faint nodes + edges, right of center) ---
nodes = [(690, 96), (800, 60), (905, 110), (760, 168), (874, 196)]
edges = [(0, 1), (1, 2), (0, 3), (3, 4), (2, 4), (1, 3)]
for a, b in edges:
    d.line([nodes[a], nodes[b]], fill=LINE, width=2)
for i, (x, y) in enumerate(nodes):
    r = 5 if i else 7
    fill = ACCENT if i == 0 else FAINT
    d.ellipse([x - r, y - r, x + r, y + r], fill=fill)

# --- Portrait in a thin amber frame (echoes the hero frame) ---
frame_w, frame_h = 320, 430
fx, fy = W - frame_w - 84, (H - frame_h) // 2
if PORTRAIT.exists():
    p = Image.open(PORTRAIT).convert("RGB")
    scale = max(frame_w / p.width, frame_h / p.height)
    p = p.resize((round(p.width * scale), round(p.height * scale)))
    px = (p.width - frame_w) // 2
    py = max((p.height - frame_h) // 3, 0)  # bias crop toward the face
    p = p.crop((px, py, px + frame_w, py + frame_h))
    img.paste(p, (fx, fy))
d = ImageDraw.Draw(img)
d.rectangle([fx - 1, fy - 1, fx + frame_w, fy + frame_h], outline=ACCENT, width=2)
# Frame caption bar
d.rectangle([fx, fy + frame_h - 44, fx + frame_w - 1, fy + frame_h - 1], fill=(0, 0, 0))
cap_font = font("consola.ttf", 17)
d.text((fx + 14, fy + frame_h - 33), "AI ENGINEER · INTEL", font=cap_font, fill=ACCENT)

# --- Left column: kicker, name, sub-name, tags, url ---
lx = 84
mono = font("consola.ttf", 22)
d.text((lx, 96), "PORTFOLIO — VOL. 01 / '26", font=mono, fill=ACCENT)
d.line([(lx, 140), (lx + 560, 140)], fill=LINE, width=1)

name_font = font("segoeuib.ttf", 88)
d.text((lx, 176), "Lê Ngọc", font=name_font, fill=INK)
d.text((lx, 276), "Gia Huy", font=name_font, fill=INK)

sub_font = font("seguisb.ttf", 30)
d.text((lx, 398), "Le Ngoc Gia Huy — AI Engineer at Intel", font=sub_font, fill=MUTED)

tag_font = font("consola.ttf", 21)
d.text(
    (lx, 458),
    "AGENTIC AI · RAG · COMPUTER VISION · ROBOTICS · AIOT",
    font=tag_font,
    fill=FAINT,
)

d.line([(lx, 516), (lx + 560, 516)], fill=LINE, width=1)
d.text((lx, 536), "breslee1707.github.io", font=font("consola.ttf", 24), fill=ACCENT)

img.save(OUT, "PNG", optimize=True)
print(f"wrote {OUT} ({OUT.stat().st_size // 1024} KB)")
