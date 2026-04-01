#!/usr/bin/env python3
"""
build.py — Genera index.html (minificado) a partir de cuantocuestauncasa.html
Uso: python3 build.py
"""
import re
import sys

try:
    import htmlmin
except ImportError:
    sys.exit("Instala htmlmin: pip3 install htmlmin")

SRC  = "cuantocuestauncasa.html"
DEST = "index.html"


def minify_css(css: str) -> str:
    """Minifica CSS inline de forma segura."""
    # 1. Eliminar comentarios /* ... */
    css = re.sub(r'/\*[\s\S]*?\*/', '', css)
    # 2. Colapsar líneas y tabulaciones a un solo espacio
    css = re.sub(r'[ \t]+', ' ', css)
    css = re.sub(r'\n\s*', '\n', css)
    # 3. Eliminar espacio alrededor de { } ; ,
    css = re.sub(r' *\{ *', '{', css)
    css = re.sub(r' *\} *', '}', css)
    css = re.sub(r' *; *', ';', css)
    css = re.sub(r' *, *', ',', css)
    # 4. Eliminar punto y coma redundante antes de }
    css = re.sub(r';}', '}', css)
    # 5. Eliminar líneas vacías
    css = re.sub(r'\n+', '\n', css).strip()
    return css


def process(content: str) -> str:
    # ── Minificar bloque <style> ──────────────────────────────
    def replace_style(m):
        return m.group(1) + minify_css(m.group(2)) + m.group(3)

    content = re.sub(
        r'(<style[^>]*>)([\s\S]*?)(</style>)',
        replace_style,
        content
    )

    # ── Minificar HTML (sin tocar <script> ni <style>) ────────
    content = htmlmin.minify(
        content,
        remove_comments=True,
        remove_empty_space=True,
        reduce_boolean_attributes=True,
        keep_pre=True,
    )

    return content


def main():
    with open(SRC, 'r', encoding='utf-8') as f:
        original = f.read()

    minified = process(original)

    with open(DEST, 'w', encoding='utf-8') as f:
        f.write(minified)

    orig_kb  = len(original.encode('utf-8')) / 1024
    mini_kb  = len(minified.encode('utf-8')) / 1024
    saving   = 100 * (1 - mini_kb / orig_kb)
    print(f"  Original : {orig_kb:,.1f} KB")
    print(f"  Minificado: {mini_kb:,.1f} KB")
    print(f"  Ahorro   : {saving:.1f}%")
    print(f"  -> {DEST} generado correctamente.")


if __name__ == "__main__":
    main()
