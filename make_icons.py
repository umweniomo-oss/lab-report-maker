import os, sys
from PIL import Image, ImageDraw
BG = (16, 40, 58)
RES = 'android/app/src/main/res'
if not os.path.isdir(RES):
    sys.exit('Android res folder not found: ' + RES)
fg = Image.open('icon-fg.png').convert('RGBA')
dens = {'mdpi': (48, 108), 'hdpi': (72, 162), 'xhdpi': (96, 216), 'xxhdpi': (144, 324), 'xxxhdpi': (192, 432)}

def legacy(size, circle):
    s = size * 4
    img = Image.new('RGBA', (s, s), BG + (255,))
    big = fg.resize((int(s * 1.3), int(s * 1.3)), Image.LANCZOS)
    img.alpha_composite(big, ((s - big.width) // 2, (s - big.height) // 2))
    m = Image.new('L', (s, s), 0)
    dr = ImageDraw.Draw(m)
    if circle: dr.ellipse([0, 0, s - 1, s - 1], fill=255)
    else: dr.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.22), fill=255)
    img.putalpha(m)
    return img.resize((size, size), Image.LANCZOS)

for name, (leg, adp) in dens.items():
    folder = os.path.join(RES, 'mipmap-' + name)
    os.makedirs(folder, exist_ok=True)
    legacy(leg, False).save(os.path.join(folder, 'ic_launcher.png'))
    legacy(leg, True).save(os.path.join(folder, 'ic_launcher_round.png'))
    fg.resize((adp, adp), Image.LANCZOS).save(os.path.join(folder, 'ic_launcher_foreground.png'))
vals = os.path.join(RES, 'values')
os.makedirs(vals, exist_ok=True)
with open(os.path.join(vals, 'ic_launcher_background.xml'), 'w') as f:
    f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#10283A</color>\n</resources>\n')
print('Icons written to', RES)
