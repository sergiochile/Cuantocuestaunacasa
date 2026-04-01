import re

filepath = '/Users/sergecchile./Desktop/cuantocuestauncasa/cuantocuestauncasa.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# ─── 1. QUITAR BLOQUE SUBSIDIOS DEL ASIDE LATERAL ───────────────────────────
# Quita desde el comentario "<!-- Subsidios" hasta el cierre del side-sub-panel,
# dejando intacto el div de irARegiones()
pattern_aside = r'\n  <!-- Subsidios.*?</div>\n  </div>\n  (<div class="bypass-card" onclick="irARegiones\(\)">)'
replacement_aside = r'\n  \1'
new_content = re.sub(pattern_aside, replacement_aside, content, flags=re.DOTALL)
if new_content != content:
    print('ASIDE subsidios: eliminado ✅')
    content = new_content
else:
    print('ASIDE subsidios: sin cambio (revisar patrón)')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Archivo guardado.')
