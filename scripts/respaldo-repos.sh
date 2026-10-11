#!/usr/bin/env bash
# Respaldo de repos de GitHub (IscoSanchezL) en tu carpeta 0PROYECTOS de Drive.
# Uso:  bash respaldo-repos.sh "/ruta/a/Google Drive/0PROYECTOS"
# - Si el repo no está: lo clona.  - Si está atrasado: lo actualiza.  - Si está al día: no hace nada.
# Requiere git. Para repos privados: instala GitHub CLI y ejecuta antes  gh auth login
set -u
DEST="${1:?Indica la ruta de tu carpeta 0PROYECTOS}"
USUARIO="IscoSanchezL"
REPOS="Kody teclea-respaldos beto-algoritmos iscosanchezl Teclea classdrive Laboratorio-anti-phishing Goldberg-Machine Puzzles Typing partes-del-computador Detectives-de-Carpetas Proyecto_Paint_2do Correos4to techstore rednexo plannergi"

# Carpeta de Drive donde vive cada repo (los demás usan su propio nombre)
carpeta() {
  case "$1" in
    Kody) echo "Kody" ;;
    classdrive) echo "ClassDrive" ;;
    beto-algoritmos) echo "ALGORITMOS" ;;
    techstore) echo "TechStore" ;;
    rednexo) echo "RedNexo" ;;
    *) echo "$1" ;;
  esac
}

for r in $REPOS; do
  base="$DEST/$(carpeta "$r")"
  dir="$base/$r"
  mkdir -p "$base"
  if [ -d "$dir/.git" ]; then
    if ! git -C "$dir" fetch -q origin; then echo "✗ $r (no se pudo consultar GitHub)"; continue; fi
    if [ "$(git -C "$dir" rev-parse HEAD)" = "$(git -C "$dir" rev-parse '@{u}' 2>/dev/null)" ]; then
      echo "✓ $r ya está al día"
    elif git -C "$dir" pull -q --ff-only; then
      echo "↻ $r actualizado"
    else
      echo "✗ $r tiene cambios locales: revísalo a mano"
    fi
  elif git clone -q "https://github.com/$USUARIO/$r.git" "$dir"; then
    echo "⬇ $r descargado"
  else
    echo "✗ $r no se pudo descargar (¿es privado? ejecuta: gh auth login)"
  fi
done
echo "Listo."
