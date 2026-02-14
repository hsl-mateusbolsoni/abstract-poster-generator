export function renderConcentric(ctx, imageData, w, h, params, colorMode) {
  const { ringCount = 50, centerMode = 0 } = params;
  const data = imageData.data;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);

  // Find focal point
  let cx, cy;
  if (centerMode === 0) {
    // Auto: find highest contrast area
    const focal = findFocalPoint(data, w, h);
    cx = focal.x;
    cy = focal.y;
  } else {
    cx = w / 2;
    cy = h / 2;
  }

  const maxRadius = Math.sqrt(
    Math.max(cx, w - cx) ** 2 + Math.max(cy, h - cy) ** 2
  );
  const ringSpacing = maxRadius / ringCount;

  for (let i = ringCount; i >= 1; i--) {
    const radius = i * ringSpacing;
    const prevRadius = (i - 1) * ringSpacing;
    const midRadius = (radius + prevRadius) / 2;

    // Sample color at this radius (average around the ring)
    const samples = Math.max(8, Math.round(midRadius * 0.5));
    let rSum = 0, gSum = 0, bSum = 0, count = 0;

    for (let s = 0; s < samples; s++) {
      const angle = (s / samples) * Math.PI * 2;
      const sx = Math.round(cx + Math.cos(angle) * midRadius);
      const sy = Math.round(cy + Math.sin(angle) * midRadius);
      if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
        const idx = (sy * w + sx) * 4;
        rSum += data[idx]; gSum += data[idx + 1]; bSum += data[idx + 2];
        count++;
      }
    }

    if (count > 0) {
      const r = Math.round(rSum / count);
      const g = Math.round(gSum / count);
      const b = Math.round(bSum / count);

      if (colorMode === "sampled") {
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
      } else {
        const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
        ctx.strokeStyle = `rgb(${gray},${gray},${gray})`;
        ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
      }

      const thickness = Math.max(1, ringSpacing * 0.9);
      ctx.lineWidth = thickness;
      ctx.beginPath();
      ctx.arc(cx, cy, midRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function findFocalPoint(data, w, h) {
  // Compute gradient magnitude, find center of mass of high-gradient area
  let sumX = 0, sumY = 0, sumW = 0;
  const step = 4;

  for (let y = step; y < h - step; y += step) {
    for (let x = step; x < w - step; x += step) {
      const idx = (y * w + x) * 4;
      const idxR = (y * w + x + step) * 4;
      const idxD = ((y + step) * w + x) * 4;

      const bC = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
      const bR = data[idxR] * 0.299 + data[idxR + 1] * 0.587 + data[idxR + 2] * 0.114;
      const bD = data[idxD] * 0.299 + data[idxD + 1] * 0.587 + data[idxD + 2] * 0.114;

      const grad = Math.abs(bR - bC) + Math.abs(bD - bC);
      sumX += x * grad;
      sumY += y * grad;
      sumW += grad;
    }
  }

  return {
    x: sumW > 0 ? Math.round(sumX / sumW) : w / 2,
    y: sumW > 0 ? Math.round(sumY / sumW) : h / 2,
  };
}

export function renderConcentricSVG(imageData, w, h, params, colorMode) {
  const { ringCount = 50, centerMode = 0 } = params;
  const data = imageData.data;

  let cx, cy;
  if (centerMode === 0) {
    const focal = findFocalPoint(data, w, h);
    cx = focal.x; cy = focal.y;
  } else {
    cx = w / 2; cy = h / 2;
  }

  const maxRadius = Math.sqrt(Math.max(cx, w - cx) ** 2 + Math.max(cy, h - cy) ** 2);
  const ringSpacing = maxRadius / ringCount;
  let circles = "";

  for (let i = 1; i <= ringCount; i++) {
    const midRadius = (i - 0.5) * ringSpacing;
    const samples = Math.max(8, Math.round(midRadius * 0.5));
    let rSum = 0, gSum = 0, bSum = 0, count = 0;

    for (let s = 0; s < samples; s++) {
      const angle = (s / samples) * Math.PI * 2;
      const sx = Math.round(cx + Math.cos(angle) * midRadius);
      const sy = Math.round(cy + Math.sin(angle) * midRadius);
      if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
        const idx = (sy * w + sx) * 4;
        rSum += data[idx]; gSum += data[idx + 1]; bSum += data[idx + 2];
        count++;
      }
    }

    if (count > 0) {
      const r = Math.round(rSum / count), g = Math.round(gSum / count), b = Math.round(bSum / count);
      let stroke;
      if (colorMode === "sampled") { stroke = `rgb(${r},${g},${b})`; }
      else { const gr = Math.round(r * 0.299 + g * 0.587 + b * 0.114); stroke = `rgb(${gr},${gr},${gr})`; }
      const thickness = Math.max(1, ringSpacing * 0.9);
      circles += `<circle cx="${cx}" cy="${cy}" r="${midRadius.toFixed(1)}" fill="none" stroke="${stroke}" stroke-width="${thickness.toFixed(1)}"/>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#FFFFFF"/>${circles}</svg>`;
}
