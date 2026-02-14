export function renderDepthContour(ctx, imageData, w, h, params, colorMode) {
  const { layerCount = 8, extrusionStyle = 0 } = params;
  const data = imageData.data;

  // Build brightness map
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    gray[i] = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
  }

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);

  const step = 255 / layerCount;
  const shadowOffset = extrusionStyle === 0 ? 3 : 6;

  // Draw layers from back (brightest) to front (darkest)
  for (let layer = layerCount; layer >= 1; layer--) {
    const threshold = layer * step;

    // Create layer mask
    const mask = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) {
      mask[i] = gray[i] < threshold ? 1 : 0;
    }

    // Sample average color of this layer
    let rSum = 0, gSum = 0, bSum = 0, count = 0;
    for (let i = 0; i < w * h; i += 4) {
      if (mask[i]) {
        const idx = i * 4;
        rSum += data[idx]; gSum += data[idx + 1]; bSum += data[idx + 2];
        count++;
      }
    }

    let fillColor;
    if (count > 0) {
      const r = Math.round(rSum / count);
      const g = Math.round(gSum / count);
      const b = Math.round(bSum / count);
      if (colorMode === "sampled") {
        fillColor = `rgb(${r},${g},${b})`;
      } else {
        const gr = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
        fillColor = `rgb(${gr},${gr},${gr})`;
      }
    } else {
      const v = Math.round(255 - (layer / layerCount) * 200);
      fillColor = `rgb(${v},${v},${v})`;
    }

    const offset = extrusionStyle === 0
      ? (layerCount - layer) * shadowOffset
      : (layerCount - layer) * (shadowOffset * 0.6);

    // Draw shadow first
    if (extrusionStyle === 1 && layer < layerCount) {
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      drawMask(ctx, mask, w, h, offset + 2, offset + 2);
    }

    // Draw the layer
    ctx.fillStyle = fillColor;
    drawMask(ctx, mask, w, h, offset, offset);

    // Edge outline
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 0.5;
    drawMaskOutline(ctx, mask, w, h, offset, offset);
  }
}

function drawMask(ctx, mask, w, h, ox, oy) {
  // Draw mask as rectangles (simplified scanline)
  const blockSize = Math.max(1, Math.round(Math.min(w, h) / 300));
  for (let y = 0; y < h; y += blockSize) {
    let runStart = -1;
    for (let x = 0; x <= w; x += blockSize) {
      const ix = Math.min(x, w - 1);
      const iy = Math.min(y, h - 1);
      const isMasked = x < w && mask[iy * w + ix];

      if (isMasked && runStart < 0) {
        runStart = x;
      } else if (!isMasked && runStart >= 0) {
        ctx.fillRect(runStart + ox, y + oy, x - runStart, blockSize);
        runStart = -1;
      }
    }
  }
}

function drawMaskOutline(ctx, mask, w, h, ox, oy) {
  const step = Math.max(1, Math.round(Math.min(w, h) / 300));
  for (let y = step; y < h - step; y += step) {
    for (let x = step; x < w - step; x += step) {
      if (!mask[y * w + x]) continue;
      // Check if on edge
      if (!mask[y * w + x - step] || !mask[y * w + x + step] ||
          !mask[(y - step) * w + x] || !mask[(y + step) * w + x]) {
        ctx.fillRect(x + ox, y + oy, step, step);
      }
    }
  }
}
