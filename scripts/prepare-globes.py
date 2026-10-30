"""Prepara los globos del atlas móvil: quita el fondo, los recorta en círculo y se queda con la mitad superior.

Uso: python scripts/prepare-globes.py
Lee scripts/data/globes-source/*.png (globo completo, con fondo negro o transparente irregular)
y escribe public/atlas/globes/<region>.webp (media esfera con fondo transparente).
Requiere Pillow, numpy y scipy.
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "data" / "globes-source"
OUT = ROOT.parent / "public" / "atlas" / "globes"
NAMES = {"America": "america", "Europa": "europa", "Asia": "asia", "Africa": "africa", "Oceania": "oceania"}
INSET = 9  # píxeles que se recortan del borde para quitar el halo del fondo
HALF_SIZE = (1100, 594)


def globe_mask(im: Image.Image) -> np.ndarray:
    rgba = np.asarray(im.convert("RGBA")).astype(np.int16)
    solid = (rgba[..., 3] > 128) & (rgba[..., :3].max(axis=-1) > 25)
    solid = ndimage.binary_opening(solid, structure=np.ones((15, 15)))
    labels, count = ndimage.label(solid)
    sizes = ndimage.sum(solid, labels, range(1, count + 1))
    return labels == (1 + int(np.argmax(sizes)))


for source in sorted(SOURCE.glob("*.png")):
    im = Image.open(source).convert("RGBA")
    mask = globe_mask(im)
    ys, xs = np.where(mask)
    cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
    radius = ((xs.max() - xs.min()) + (ys.max() - ys.min())) / 4 - INSET

    yy, xx = np.mgrid[0 : im.height, 0 : im.width]
    alpha = np.clip(radius - np.hypot(xx - cx, yy - cy) + 0.5, 0, 1)
    pixels = np.asarray(im).copy()
    # Cerca del borde, lo muy oscuro es resto del fondo (el halo negro de algunos archivos).
    luma = pixels[..., :3].astype(np.float32).max(axis=-1)
    edge = np.hypot(xx - cx, yy - cy) > radius - 45
    alpha = np.where(edge, alpha * np.clip((luma - 70) / 40, 0, 1), alpha)
    pixels[..., 3] = (alpha * 255).astype(np.uint8)

    # Mitad superior del globo: desde el borde de arriba hasta un poco pasado el centro.
    top, bottom = int(cy - radius), int(cy + radius * 0.08)
    left, right = int(cx - radius), int(cx + radius) + 1
    half = Image.fromarray(pixels).crop((left, top, right, bottom))
    half = half.resize(HALF_SIZE, Image.LANCZOS)  # mismo tamaño en las cinco, para que el cambio no salte
    OUT.mkdir(parents=True, exist_ok=True)
    target = OUT / f"{NAMES[source.stem]}.webp"
    half.save(target, "WEBP", quality=88, method=6)
    print(f"{source.name}: centro=({cx:.0f},{cy:.0f}) radio={radius:.0f} -> {target.name} {half.size} {target.stat().st_size // 1024} KB")
