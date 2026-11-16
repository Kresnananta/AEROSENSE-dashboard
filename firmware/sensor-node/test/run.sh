#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
work="$(mktemp -d)"; trap 'rm -rf "$work"' EXIT
git -c advice.detachedHead=false clone -q --depth 1 https://github.com/adafruit/Adafruit-GFX-Library.git "$work/gfx"
g++ -std=c++17 -DARDUINO=200 -Wall -Wno-unused-function -I"$here/shim" -I"$work/gfx" -I"$here/.." \
  "$here/preview.cpp" "$work/gfx/Adafruit_GFX.cpp" -o "$work/preview"
mkdir -p "$here/out"
"$work/preview" "$here/out"
python3 -c "import sys,glob; from PIL import Image; [Image.open(p).resize((384,480),Image.NEAREST).save(p[:-4]+'.png') for p in glob.glob(sys.argv[1]+'/*.ppm')]" "$here/out"
rm -f "$here/out"/*.ppm
echo "PNG di $here/out"
