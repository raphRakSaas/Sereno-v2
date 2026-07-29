#!/usr/bin/env python3
"""Generate Sereno Open Graph images with logo, tagline, and donut chart."""

from __future__ import annotations

import textwrap
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "public" / "og"
LOGO_PATH = ROOT / "public" / "brand" / "sereno-logo.png"

PAGE = (250, 248, 246)
SURFACE = (255, 255, 255)
TEXT = (23, 20, 18)
TEXT_MUTED = (107, 99, 92)
BORDER = (232, 228, 224)
ACCENT = (255, 77, 109)

CHART_COLORS = [
    (255, 77, 109),
    (255, 128, 149),
    (255, 179, 191),
    (23, 131, 107),
    (180, 118, 42),
    (255, 217, 223),
]

FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


@dataclass(frozen=True)
class ChartSlice:
    label: str
    amount: int


@dataclass(frozen=True)
class OgVariant:
    filename: str
    width: int
    height: int
    tagline: str
    chart_title: str
    chart_center_label: str
    slices: tuple[ChartSlice, ...]


VARIANTS: tuple[OgVariant, ...] = (
    OgVariant(
        filename="og-image.png",
        width=1200,
        height=630,
        tagline="Gère ton budget en toute sérénité.",
        chart_title="Répartition par catégorie",
        chart_center_label="1 250 €",
        slices=(
            ChartSlice("Logement", 450),
            ChartSlice("Alimentation", 300),
            ChartSlice("Transports", 180),
            ChartSlice("Loisirs", 120),
            ChartSlice("Autres", 200),
        ),
    ),
    OgVariant(
        filename="og-image-twitter.png",
        width=1200,
        height=600,
        tagline="Vois clairement où va ton argent, sans jugement.",
        chart_title="Soldes du mois",
        chart_center_label="2 400 €",
        slices=(
            ChartSlice("Dépenses", 1250),
            ChartSlice("Épargne", 620),
            ChartSlice("Disponible", 530),
        ),
    ),
    OgVariant(
        filename="og-image-square.png",
        width=1200,
        height=1200,
        tagline="Simple, local, sans compte ni connexion bancaire.",
        chart_title="Activité récente",
        chart_center_label="Ce mois",
        slices=(
            ChartSlice("Courses", 458),
            ChartSlice("Loyer", 850),
            ChartSlice("Salaire", 2400),
            ChartSlice("Transport", 180),
            ChartSlice("Loisirs", 120),
        ),
    ),
)


def load_font(path: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


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


def wrap_tagline(text: str, max_chars: int) -> str:
    return "\n".join(textwrap.wrap(text, width=max_chars))


def draw_decorative_circles(draw: ImageDraw.ImageDraw, width: int, height: int) -> None:
    draw.ellipse((width - 220, -80, width + 60, 200), fill=ACCENT + (18,))
    draw.ellipse((-90, height - 170, 150, height + 20), fill=ACCENT + (14,))


def draw_rounded_rect(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    radius: int,
    fill: tuple[int, int, int],
    outline: tuple[int, int, int] | None = None,
) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=2 if outline else 0)


def draw_donut_chart(
    image: Image.Image,
    center: tuple[int, int],
    outer_radius: int,
    inner_radius: int,
    slices: tuple[ChartSlice, ...],
) -> None:
    draw = ImageDraw.Draw(image)
    total = sum(slice_item.amount for slice_item in slices)
    start_angle = -90.0

    for index, slice_item in enumerate(slices):
        sweep = 360.0 * slice_item.amount / total
        end_angle = start_angle + sweep
        color = CHART_COLORS[index % len(CHART_COLORS)]

        draw.pieslice(
            (
                center[0] - outer_radius,
                center[1] - outer_radius,
                center[0] + outer_radius,
                center[1] + outer_radius,
            ),
            start=start_angle,
            end=end_angle,
            fill=color,
        )
        start_angle = end_angle

    draw.ellipse(
        (
            center[0] - inner_radius,
            center[1] - inner_radius,
            center[0] + inner_radius,
            center[1] + inner_radius,
        ),
        fill=SURFACE,
    )


def format_amount(amount: int) -> str:
    return f"{amount:,}".replace(",", " ") + " €"


def draw_chart_legend(
    draw: ImageDraw.ImageDraw,
    origin: tuple[int, int],
    slices: tuple[ChartSlice, ...],
    font_regular: ImageFont.ImageFont,
    amount_offset: int,
) -> None:
    x_origin, y_origin = origin

    for index, slice_item in enumerate(slices):
        y_pos = y_origin + index * 34
        color = CHART_COLORS[index % len(CHART_COLORS)]
        draw.rounded_rectangle((x_origin, y_pos + 5, x_origin + 14, y_pos + 19), radius=4, fill=color)
        draw.text((x_origin + 24, y_pos), slice_item.label, font=font_regular, fill=TEXT)
        draw.text(
            (x_origin + amount_offset, y_pos),
            format_amount(slice_item.amount),
            font=font_regular,
            fill=TEXT_MUTED,
        )


def render_variant(variant: OgVariant) -> None:
    image = Image.new("RGB", (variant.width, variant.height), PAGE)
    draw = ImageDraw.Draw(image)
    draw_decorative_circles(draw, variant.width, variant.height)

    padding = 64
    left_panel_width = int(variant.width * 0.4)
    card_left = left_panel_width + 24
    card_top = 48
    card_right = variant.width - 48
    card_bottom = variant.height - 48
    card_box = (card_left, card_top, card_right, card_bottom)

    is_compact = variant.height <= 630
    logo_width = 250 if is_compact else 280
    tagline_size = 28 if is_compact else 32
    subtitle_size = 18 if is_compact else 20

    logo = remove_near_white_background(Image.open(LOGO_PATH))
    logo_height = int(logo.height * (logo_width / logo.width))
    logo = logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)

    tagline_font = load_font(FONT_BOLD, tagline_size)
    subtitle_font = load_font(FONT_REGULAR, subtitle_size)
    title_font = load_font(FONT_BOLD, 22 if is_compact else 24)
    center_font = load_font(FONT_BOLD, 24 if is_compact else 28)
    legend_font = load_font(FONT_REGULAR, 18 if is_compact else 20)

    logo_x = padding
    logo_y = padding + 12
    image.paste(logo, (logo_x, logo_y), logo)

    wrapped_tagline = wrap_tagline(variant.tagline, max_chars=16 if is_compact else 18)
    tagline_y = logo_y + logo_height + 28
    draw.multiline_text(
        (padding, tagline_y),
        wrapped_tagline,
        font=tagline_font,
        fill=TEXT,
        spacing=6,
    )

    tagline_lines = wrapped_tagline.count("\n") + 1
    subtitle_y = tagline_y + tagline_lines * (tagline_size + 8) + 12
    draw.text(
        (padding, subtitle_y),
        "Ton assistant budget personnel.",
        font=subtitle_font,
        fill=TEXT_MUTED,
    )

    draw_rounded_rect(draw, card_box, 20, SURFACE, BORDER)

    card_width = card_box[2] - card_box[0]
    card_height = card_box[3] - card_box[1]
    chart_center = (
        card_box[0] + int(card_width * 0.34),
        card_box[1] + card_height // 2 + 8,
    )
    outer_radius = min(card_height // 2 - 40, 130 if is_compact else 155)
    inner_radius = int(outer_radius * 0.58)

    draw.text((card_box[0] + 24, card_box[1] + 20), variant.chart_title, font=title_font, fill=TEXT)

    draw_donut_chart(image, chart_center, outer_radius, inner_radius, variant.slices)

    center_text = variant.chart_center_label
    center_box = draw.textbbox((0, 0), center_text, font=center_font)
    center_width = center_box[2] - center_box[0]
    center_height = center_box[3] - center_box[1]
    draw.text(
        (chart_center[0] - center_width // 2, chart_center[1] - center_height // 2 - 2),
        center_text,
        font=center_font,
        fill=TEXT,
    )

    legend_x = chart_center[0] + outer_radius + 28
    legend_y = card_box[1] + (card_height - len(variant.slices) * 34) // 2 + 6
    amount_offset = 150 if is_compact else 170
    draw_chart_legend(draw, (legend_x, legend_y), variant.slices, legend_font, amount_offset)

    output_path = OUTPUT_DIR / variant.filename
    image.save(output_path, format="PNG", optimize=True)
    print(f"Generated {output_path} ({variant.width}x{variant.height})")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for variant in VARIANTS:
        render_variant(variant)


if __name__ == "__main__":
    main()
