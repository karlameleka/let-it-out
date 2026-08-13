from PIL import Image
import os

BASE = "public/brand"

def trim_and_key(infile, outfile, key_is_white):
    img = Image.open(infile).convert("RGBA")
    img = img.crop((3, 3, img.width - 3, img.height - 3))
    corner = img.getpixel((2, 2))
    cr, cg, cb = corner[0], corner[1], corner[2]
    datas = img.getdata()
    new_data = []
    for r, g, b, a in datas:
        if key_is_white:
            is_bg = r > 245 and g > 245 and b > 245
        else:
            is_bg = abs(r - cr) < 20 and abs(g - cg) < 20 and abs(b - cb) < 20
        if is_bg:
            new_data.append((r, g, b, 0))
        else:
            new_data.append((r, g, b, a))
    img.putdata(new_data)
    alpha = img.split()[3]
    bbox = alpha.getbbox()
    if bbox:
        pad = 10
        l, t, r, b = bbox
        l = max(0, l - pad)
        t = max(0, t - pad)
        r = min(img.width, r + pad)
        b = min(img.height, b + pad)
        img = img.crop((l, t, r, b))
    img.save(outfile)
    print(outfile, img.size)

trim_and_key(f"{BASE}/tmp_horiz_teal-4.png", f"{BASE}/logo-horizontal-teal.png", key_is_white=True)
trim_and_key(f"{BASE}/tmp_horiz_white-3.png", f"{BASE}/logo-horizontal-white.png", key_is_white=False)
trim_and_key(f"{BASE}/tmp_icon_teal-6.png", f"{BASE}/logo-icon-teal.png", key_is_white=True)
trim_and_key(f"{BASE}/tmp_icon_white-5.png", f"{BASE}/logo-icon-white.png", key_is_white=False)

for f in os.listdir(BASE):
    if f.startswith("tmp_"):
        os.remove(os.path.join(BASE, f))
