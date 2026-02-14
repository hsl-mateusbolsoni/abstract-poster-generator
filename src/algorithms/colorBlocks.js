import { getDominantColors } from "../utils/colorExtraction";

export function renderColorBlocks(ctx, imageData, w, h, params, colorMode) {
  const { blockCount = 6, arrangement = 0 } = params;
  const data = imageData.data;
  const colors = getDominantColors(imageData, blockCount);

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);

  if (arrangement === 0) {
    // Grid arrangement
    const cols = Math.ceil(Math.sqrt(blockCount * (w / h)));
    const rows = Math.ceil(blockCount / cols);
    const cellW = w / cols;
    const cellH = h / rows;
    const gap = 3;

    let ci = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (ci >= blockCount) break;
        const color = colors[ci % colors.length];
        if (colorMode === "sampled") {
          ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
        } else {
          const gray = Math.round(color[0] * 0.299 + color[1] * 0.587 + color[2] * 0.114);
          ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
        }
        ctx.fillRect(c * cellW + gap, r * cellH + gap, cellW - gap * 2, cellH - gap * 2);
        ci++;
      }
    }
  } else {
    // Organic arrangement — random rectangles
    const rects = [];
    for (let i = 0; i < blockCount; i++) {
      const rw = w * (0.2 + Math.random() * 0.5);
      const rh = h * (0.15 + Math.random() * 0.4);
      const rx = Math.random() * (w - rw * 0.3) - rw * 0.15;
      const ry = Math.random() * (h - rh * 0.3) - rh * 0.15;
      rects.push({ x: rx, y: ry, w: rw, h: rh, ci: i });
    }

    for (const rect of rects) {
      const color = colors[rect.ci % colors.length];
      if (colorMode === "sampled") {
        ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
      } else {
        const gray = Math.round(color[0] * 0.299 + color[1] * 0.587 + color[2] * 0.114);
        ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
      }
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
  }
}

export function renderColorBlocksSVG(imageData, w, h, params, colorMode) {
  const { blockCount = 6, arrangement = 0 } = params;
  const colors = getDominantColors(imageData, blockCount);
  let elements = "";

  const toFill = (color) => {
    if (colorMode === "sampled") return `rgb(${color[0]},${color[1]},${color[2]})`;
    const g = Math.round(color[0] * 0.299 + color[1] * 0.587 + color[2] * 0.114);
    return `rgb(${g},${g},${g})`;
  };

  if (arrangement === 0) {
    const cols = Math.ceil(Math.sqrt(blockCount * (w / h)));
    const rows = Math.ceil(blockCount / cols);
    const cellW = w / cols, cellH = h / rows, gap = 3;
    let ci = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (ci >= blockCount) break;
        elements += `<rect x="${c * cellW + gap}" y="${r * cellH + gap}" width="${cellW - gap * 2}" height="${cellH - gap * 2}" fill="${toFill(colors[ci % colors.length])}"/>`;
        ci++;
      }
    }
  } else {
    for (let i = 0; i < blockCount; i++) {
      const rw = w * (0.2 + Math.random() * 0.5);
      const rh = h * (0.15 + Math.random() * 0.4);
      const rx = Math.random() * (w - rw * 0.3) - rw * 0.15;
      const ry = Math.random() * (h - rh * 0.3) - rh * 0.15;
      elements += `<rect x="${rx.toFixed(1)}" y="${ry.toFixed(1)}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}" fill="${toFill(colors[i % colors.length])}"/>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#FFFFFF"/>${elements}</svg>`;
}
