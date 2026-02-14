const CHAR_SETS = {
  blocks: [" ", "░", "▒", "▓", "█"],
  ascii: [" ", ".", ":", "-", "=", "+", "*", "#", "%", "@"],
  braille: generateBrailleSet(),
};

function generateBrailleSet() {
  // 8 levels from empty to full
  return [" ", "⠁", "⠃", "⠇", "⡇", "⡗", "⡷", "⣷", "⣿"];
}

export function renderASCII(ctx, imageData, w, h, params, colorMode) {
  const { charSet = 0, density = 1 } = params;
  const data = imageData.data;
  const sets = [CHAR_SETS.blocks, CHAR_SETS.ascii, CHAR_SETS.braille];
  const chars = sets[charSet] || sets[0];

  const cellW = Math.max(4, Math.round(8 / density));
  const cellH = Math.max(6, Math.round(12 / density));
  const fontSize = Math.round(cellH * 1.1);

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);

  ctx.font = `${fontSize}px monospace`;
  ctx.textBaseline = "top";

  for (let y = 0; y < h; y += cellH) {
    for (let x = 0; x < w; x += cellW) {
      // Average brightness in this cell
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let cy = y; cy < Math.min(y + cellH, h); cy++) {
        for (let cx = x; cx < Math.min(x + cellW, w); cx++) {
          const idx = (cy * w + cx) * 4;
          rSum += data[idx]; gSum += data[idx + 1]; bSum += data[idx + 2];
          count++;
        }
      }

      const r = rSum / count, g = gSum / count, b = bSum / count;
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

      // Map brightness to character (dark = dense character)
      const charIdx = Math.min(
        chars.length - 1,
        Math.floor((1 - brightness) * chars.length)
      );
      const ch = chars[charIdx];

      if (ch === " ") continue;

      if (colorMode === "sampled") {
        ctx.fillStyle = `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
      } else {
        ctx.fillStyle = "#000000";
      }
      ctx.fillText(ch, x, y);
    }
  }
}
