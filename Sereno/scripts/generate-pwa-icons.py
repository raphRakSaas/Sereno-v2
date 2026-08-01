#!/usr/bin/env python3
"""Generate PWA icons from the Sereno mark on a sky-blue accent background."""

from __future__ import annotations

import subprocess
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SVG_PATH = ROOT / "public" / "brand" / "sereno-icon-pwa.svg"
OUTPUT_DIR = ROOT / "public" / "icons"
TMP_ICON = OUTPUT_DIR / "_sereno-icon-render.png"

# Sereno accent — matches --color-accent in styles.css
SERENO_ACCENT = (43, 127, 212)


def render_svg_mark(icon_size: int) -> Image.Image:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    subprocess.run(
        [
            "npx",
            "--yes",
            "@resvg/resvg-js-cli",
            str(SVG_PATH),
            str(TMP_ICON),
            "--fit-width",
            str(icon_size),
        ],
        check=True,
        cwd=ROOT,
    )

    return Image.open(TMP_ICON).convert("RGBA")


def build_square_icon(canvas_size: int, icon_ratio: float) -> Image.Image:
    canvas = Image.new("RGBA", (canvas_size, canvas_size), SERENO_ACCENT + (255,))
    icon_size = int(canvas_size * icon_ratio)
    icon = render_svg_mark(icon_size)

    offset_x = (canvas_size - icon.width) // 2
    offset_y = (canvas_size - icon.height) // 2
    canvas.paste(icon, (offset_x, offset_y), icon)

    return canvas.convert("RGB")


def main() -> None:
    icons = {
        "icon-192x192.png": (192, 0.58),
        "icon-512x512.png": (512, 0.58),
        "icon-maskable-512x512.png": (512, 0.48),
        "apple-touch-icon.png": (180, 0.58),
    }

    for filename, (size, ratio) in icons.items():
        icon = build_square_icon(size, ratio)
        output_path = OUTPUT_DIR / filename
        icon.save(output_path, format="PNG", optimize=True)
        print(f"Generated {output_path.relative_to(ROOT)} ({size}x{size})")

    if TMP_ICON.exists():
        TMP_ICON.unlink()


if __name__ == "__main__":
    main()
