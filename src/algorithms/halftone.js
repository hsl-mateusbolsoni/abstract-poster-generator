export function renderHalftone(ctx, imageData, w, h, params, colorMode) {
  const { dotSize = 8, angle = 45 } = params;
  const cellSize = dotSize * 2;
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const data = imageData.data;

  ctx.fillStyle = colorMode === "sampled" ? "#FFFFFF" : "#FFFFFF";
  ctx.fillRect(0, 0, w, h);

  const diag = Math.sqrt(w * w + h * h);
  const steps = Math.ceil(diag / cellSize) + 2;

  for (let yi = -steps; yi <= steps; yi++) {
    for (let xi = -steps; xi <= steps; xi++) {
      const gx = xi * cellSize;
      const gy = yi * cellSize;
      const px = Math.round(cos * gx - sin * gy + w / 2);
      const py = Math.round(sin * gx + cos * gy + h / 2);

      if (px < 0 || px >= w || py < 0 || py >= h) continue;

      const idx = (py * w + px) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

      const radius = ((1 - brightness) * cellSize) / 2;
      if (radius < 0.5) continue;

      if (colorMode === "sampled") {
        ctx.fillStyle = `rgb(${r},${g},${b})`;
      } else {
        ctx.fillStyle = "#000000";
      }

      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function renderHalftoneSVG(imageData, w, h, params, colorMode) {
  const { dotSize = 8, angle = 45 } = params;
  const cellSize = dotSize * 2;
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const data = imageData.data;

  let circles = "";
  const diag = Math.sqrt(w * w + h * h);
  const steps = Math.ceil(diag / cellSize) + 2;

  for (let yi = -steps; yi <= steps; yi++) {
    for (let xi = -steps; xi <= steps; xi++) {
      const gx = xi * cellSize;
      const gy = yi * cellSize;
      const px = Math.round(cos * gx - sin * gy + w / 2);
      const py = Math.round(sin * gx + cos * gy + h / 2);

      if (px < 0 || px >= w || py < 0 || py >= h) continue;

      const idx = (py * w + px) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      const radius = ((1 - brightness) * cellSize) / 2;
      if (radius < 0.5) continue;

      const fill =
        colorMode === "sampled" ? `rgb(${r},${g},${b})` : "#000000";
      circles += `<circle cx="${px}" cy="${py}" r="${radius.toFixed(1)}" fill="${fill}"/>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#FFFFFF"/>${circles}</svg>`;
}
