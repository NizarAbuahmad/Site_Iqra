"""Raster favicons from the same artwork as favicon.svg.

Nothing here can rasterise SVG, so the leaf's cubic bezier path is sampled
into a polygon. Points are the SVG's own control points, in its 24x24
viewBox, offset by the translate(4 4) that centres it on the 32x32 tile.
"""
from PIL import Image, ImageDraw

OUT = r"C:\Users\Lenovo\Downloads\Site_Iqra"
TEAL, WHITE, AQUA = (0, 169, 157), (255, 255, 255), (52, 214, 198)

# (start, control1, control2, end) per segment, absolute, 24x24 viewBox.
LEAF = [
    ((4.6, 20.2), (4.0, 13.6), (6.8, 8.0), (13.0, 4.6)),
    ((13.0, 4.6), (15.1, 3.4), (17.3, 2.7), (19.4, 2.5)),
    ((19.4, 2.5), (19.9, 9.4), (17.2, 14.9), (11.4, 18.6)),
    ((11.4, 18.6), (9.3, 19.9), (7.0, 20.6), (4.6, 20.2)),
]


def bezier(p0, p1, p2, p3, steps=40):
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        yield (
            u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0],
            u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1],
        )


def render(size):
    """Draw at 8x and downsample — PIL has no antialiased polygon fill."""
    ss = size * 8
    k = ss / 32.0  # the artwork is authored on a 32x32 tile
    img = Image.new("RGBA", (ss, ss), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, ss - 1, ss - 1], radius=int(8 * k), fill=TEAL)

    pts = []
    for seg in LEAF:
        pts.extend(((x + 4) * k, (y + 4) * k) for x, y in bezier(*seg))
    d.polygon(pts, fill=WHITE)

    cx, cy, r = (17.8 + 4) * k, (20.4 + 4) * k, 2.05 * k
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=AQUA)
    return img.resize((size, size), Image.LANCZOS)


# Safari and older crawlers ask for .ico; iOS home screen wants a 180px PNG
# on an opaque tile, since it ignores transparency and composites on black.
render(256).save(f"{OUT}/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

apple = Image.new("RGB", (180, 180), TEAL)
apple.paste(render(180), (0, 0), render(180))
apple.save(f"{OUT}/apple-touch-icon.png")

render(192).save(f"{OUT}/icon-192.png")
print("wrote favicon.ico, apple-touch-icon.png, icon-192.png")
