"""Builds one 1200x630 share card per blog post: img/og/<slug>.jpg.

Run after adding or retitling a post, then commit the images:

    python tools-make-og-posts.py

Why per post: every post used to share the homepage card, so a link pasted into
WhatsApp showed the homepage headline under the post's own title. The card
carries the post's title as rendered text, so it goes stale when the title in
data/blog-posts.json changes — rerun this.

The look follows img/og.jpg (tools-make-og.py): navy ground with a soft teal
glow, the kicker as an aqua pill, white title, the white logo lockup.

Needs Pillow, arabic_reshaper and python-bidi. arabic_reshaper strips
diacritics unless told not to, which would turn تُغلق into تغلق on the card.
"""
import json
import os

import arabic_reshaper
from bidi.algorithm import get_display
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
NAVY, TEAL, AQUA, MUTED = (8, 27, 58), (0, 169, 157), (52, 214, 198), (159, 179, 200)
FONT = r"C:\Windows\Fonts\segoeuib.ttf"
LOGO = "img/logo-lockup-white.png"
OUT_DIR = "img/og"
RIGHT, LEFT = 1110, 90          # text is right-aligned (RTL); LEFT bounds the line width
MAX_W = RIGHT - LEFT
MAX_LINES = 3

_reshaper = arabic_reshaper.ArabicReshaper(
    configuration={"delete_harakat": False, "support_ligatures": True}
)


def ar(t):
    return get_display(_reshaper.reshape(t))


def background():
    base = Image.new("RGB", (W, H), NAVY)
    glow = Image.new("RGB", (W, H), NAVY)
    ImageDraw.Draw(glow).ellipse([-120, 60, 700, 720], fill=(14, 78, 92))
    return Image.blend(base, glow.filter(ImageFilter.GaussianBlur(110)), 0.85)


def wrap(d, text, font):
    """Greedy word wrap in logical order; each line is shaped on its own."""
    lines, cur = [], ""
    for word in text.split():
        trial = f"{cur} {word}".strip()
        if cur and d.textlength(ar(trial), font=font) > MAX_W:
            lines.append(cur)
            cur = word
        else:
            cur = trial
    lines.append(cur)
    return lines


def card(post):
    img = background()
    d = ImageDraw.Draw(img)

    # Largest size at which the title fits in MAX_LINES lines.
    for size in range(68, 38, -2):
        font = ImageFont.truetype(FONT, size)
        lines = wrap(d, post["title"], font)
        if len(lines) <= MAX_LINES:
            break

    # Kicker pill, top right.
    f_k = ImageFont.truetype(FONT, 25)
    kicker = ar(post["kicker"])
    kw = d.textlength(kicker, font=f_k)
    d.rounded_rectangle([RIGHT - kw - 30, 70, RIGHT, 125], 27, fill=(16, 60, 74))
    d.text((RIGHT - kw - 15, 80), kicker, font=f_k, fill=AQUA)

    # Title, right-aligned.
    y = 165
    for ln in lines:
        t = ar(ln)
        d.text((RIGHT - d.textlength(t, font=font), y), t, font=font, fill=(255, 255, 255))
        y += int(size * 1.42)

    # Footer: logo on the left, blog name on the right.
    logo = Image.open(LOGO).convert("RGBA")
    lh = 96
    logo = logo.resize((round(logo.width * lh / logo.height), lh), Image.LANCZOS)
    img.paste(logo, (LEFT - 10, H - lh - 36), logo)
    f_b = ImageFont.truetype(FONT, 27)
    tag = ar("مدونة اقرأ للمعلمين")
    d.text((RIGHT - d.textlength(tag, font=f_b), H - 82), tag, font=f_b, fill=TEAL)

    return img, len(lines), size


def main():
    with open("data/blog-posts.json", encoding="utf-8") as f:
        posts = json.load(f)["posts"]
    os.makedirs(OUT_DIR, exist_ok=True)
    for p in posts:
        img, n, size = card(p)
        out = f"{OUT_DIR}/{p['slug']}.jpg"
        img.save(out, "JPEG", quality=86, optimize=True)
        print(f"wrote {out}  {os.path.getsize(out) // 1024} KB  title: {n} line(s) at {size}px")


if __name__ == "__main__":
    main()
