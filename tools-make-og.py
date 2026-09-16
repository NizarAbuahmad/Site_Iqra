"""Builds img/og.jpg, the 1200x630 share card.

Run after the hero headline changes, then commit the image:

    python tools-make-og.py

The card carries the headline as rendered text, so it goes stale the moment
the <h1> in index.html moves — and nothing on the site will tell you. Keep
HEADLINE below identical to the <h1>.

Needs Pillow, arabic_reshaper and python-bidi. arabic_reshaper strips
diacritics unless told not to, which would turn جهّز into جهز on the card.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import arabic_reshaper
from bidi.algorithm import get_display

W, H = 1200, 630
NAVY, TEAL, AQUA, MUTED = (8, 27, 58), (0, 169, 157), (52, 214, 198), (159, 179, 200)
OUT = "img/og.jpg"
SHOT = "img/tools.jpg"
FONT = r"C:\Windows\Fonts\segoeuib.ttf"

HEADLINE = ["من تحضير الدرس إلى إعداد الاختبار،", "اقرأ معك في كل خطوة"]
EYEBROW = "للمعلمين والمدارس في الأردن"
SUB = "خطط دروس · أوراق عمل · اختبارات قصيرة · أنشطة صفية"
BRAND = "اقرأ · مساعد المعلّم العربي"

_reshaper = arabic_reshaper.ArabicReshaper(
    configuration={"delete_harakat": False, "support_ligatures": True}
)


def ar(t):
    return get_display(_reshaper.reshape(t))


def rounded(img, r):
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, *img.size], r, fill=255)
    img.putalpha(mask)
    return img


base = Image.new("RGB", (W, H), NAVY)
glow = Image.new("RGB", (W, H), NAVY)
ImageDraw.Draw(glow).ellipse([-120, 60, 640, 700], fill=(14, 78, 92))
base = Image.blend(base, glow.filter(ImageFilter.GaussianBlur(110)), 0.85)

# Phone screenshot on the left, with a soft shadow.
shot = Image.open(SHOT).convert("RGBA")
sh = 520
sw = round(shot.width * sh / shot.height)
shot = rounded(shot.resize((sw, sh), Image.LANCZOS), 26)
shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(shadow).rounded_rectangle([110, 70, 110 + sw, 70 + sh], 26, fill=(0, 0, 0, 150))
shadow = shadow.filter(ImageFilter.GaussianBlur(28))
base.paste(Image.new("RGB", (W, H), (0, 0, 0)), (0, 0), shadow.split()[3])
base.paste(shot, (110, 55), shot)

d = ImageDraw.Draw(base)
RIGHT = 1120
COL = RIGHT - (110 + sw + 50)  # text column must clear the phone


def fit(text, size, max_w):
    """Largest size at or below `size` whose rendered width fits max_w."""
    while size > 24:
        f = ImageFont.truetype(FONT, size)
        if d.textlength(ar(text), font=f) <= max_w:
            return f
        size -= 2
    return ImageFont.truetype(FONT, size)


def line(text, font, fill, y):
    t = ar(text)
    d.text((RIGHT - d.textlength(t, font=font), y), t, font=font, fill=fill)


f_eye = ImageFont.truetype(FONT, 25)
eye = ar(EYEBROW)
ew = d.textlength(eye, font=f_eye)
d.rounded_rectangle([RIGHT - ew - 30, 112, RIGHT, 167], 27, fill=(16, 60, 74))
d.text((RIGHT - ew - 15, 122), eye, font=f_eye, fill=AQUA)

# Both headline lines share one size so they read as one sentence.
f_head = min((fit(h, 56, COL) for h in HEADLINE), key=lambda f: f.size)
line(HEADLINE[0], f_head, (255, 255, 255), 200)
line(HEADLINE[1], f_head, (255, 255, 255), 200 + f_head.size + 22)
line(SUB, fit(SUB, 28, COL), MUTED, 410)
line(BRAND, ImageFont.truetype(FONT, 26), TEAL, 470)

base.save(OUT, "JPEG", quality=88, optimize=True)
print(f"wrote {OUT} {base.size}, headline at {f_head.size}px in a {COL}px column")
