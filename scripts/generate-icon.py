from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "build" / "icon.ico"
SIZE = 256


def create_icon() -> Image.Image:
    image = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    draw.ellipse((4, 4, 252, 252), fill=(122, 75, 0, 255))
    draw.ellipse((20, 20, 236, 236), fill=(255, 215, 61, 255))
    draw.ellipse((76, 88, 96, 108), fill=(36, 26, 0, 255))
    draw.ellipse((160, 88, 180, 108), fill=(36, 26, 0, 255))
    draw.arc((64, 100, 192, 174), start=20, end=160, fill=(36, 26, 0, 255), width=16)

    return image


OUTPUT.parent.mkdir(parents=True, exist_ok=True)
create_icon().save(OUTPUT, format="ICO", sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
print(OUTPUT)
