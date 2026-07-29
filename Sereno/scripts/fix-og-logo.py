#!/usr/bin/env python3
"""Replace only the AI-generated icon mark on og-image.png."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OG_IMAGE = ROOT / "public/og/og-image.png"
LOGO = ROOT / "public/brand/sereno-logo.png"

ICON_SIZE = 94
ICON_LEFT = 68
ICON_TOP = 122

PATCH_LEFT = 52
PATCH_TOP = 108
PATCH_WIDTH = 150
PATCH_HEIGHT = 118


def extract_icon_mark(logo: Image.Image) -> Image.Image:
    square_side = logo.height
    return logo.crop((0, 0, square_side, square_side))


def sample_background_color(image: Image.Image, x_pos: int, y_pos: int) -> tuple[int, int, int]:
    red, green, blue, _alpha = image.getpixel((x_pos, y_pos))
    return (red, green, blue)


def remove_near_white_background(image: Image.Image, threshold: int = 245) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size

    for y_pos in range(height):
        for x_pos in range(width):
            red, green, blue, alpha = pixels[x_pos, y_pos]
            if red >= threshold and green >= threshold and blue >= threshold:
                pixels[x_pos, y_pos] = (red, green, blue, 0)

    return rgba


def erase_pink_artifacts(
    image: Image.Image,
    left: int,
    top: int,
    right: int,
    bottom: int,
    background: tuple[int, int, int],
) -> None:
    pixels = image.load()
    for y_pos in range(top, bottom):
        for x_pos in range(left, right):
            red, green, blue, alpha = pixels[x_pos, y_pos]
            is_reddish = red > 135 and red > green + 12 and red > blue + 12
            if is_reddish:
                pixels[x_pos, y_pos] = background + (255,)


def main() -> None:
    base = Image.open(OG_IMAGE).convert("RGBA")
    background = sample_background_color(base, 380, 145)

    icon = remove_near_white_background(extract_icon_mark(Image.open(LOGO)))
    icon = icon.resize((ICON_SIZE, ICON_SIZE), Image.Resampling.LANCZOS)

    patch = Image.new("RGBA", (PATCH_WIDTH, PATCH_HEIGHT), background + (255,))
    base.paste(patch, (PATCH_LEFT, PATCH_TOP), patch)
    erase_pink_artifacts(
        base,
        PATCH_LEFT,
        PATCH_TOP,
        218,
        PATCH_TOP + PATCH_HEIGHT + 10,
        background,
    )
    base.paste(icon, (ICON_LEFT, ICON_TOP), icon)

    base.convert("RGB").save(OG_IMAGE, format="PNG", optimize=True)
    print(f"Updated {OG_IMAGE}")


if __name__ == "__main__":
    main()
