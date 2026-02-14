export function renderSlitScan(ctx, imageData, w, h, params, colorMode) {
  const { scanPosition = 50, direction = 0 } = params;
  const data = imageData.data;
  const output = ctx.createImageData(w, h);
  const out = output.data;

  if (direction === 0) {
    // Horizontal: sample a single column, stretch across width
    const col = Math.min(Math.max(Math.round((scanPosition / 100) * (w - 1)), 0), w - 1);

    for (let y = 0; y < h; y++) {
      const srcIdx = (y * w + col) * 4;
      const r = data[srcIdx], g = data[srcIdx + 1], b = data[srcIdx + 2];

      for (let x = 0; x < w; x++) {
        const dstIdx = (y * w + x) * 4;
        if (colorMode === "sampled") {
          out[dstIdx] = r; out[dstIdx + 1] = g; out[dstIdx + 2] = b;
        } else {
          const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
          out[dstIdx] = out[dstIdx + 1] = out[dstIdx + 2] = gray;
        }
        out[dstIdx + 3] = 255;
      }
    }
  } else {
    // Vertical: sample a single row, stretch across height
    const row = Math.min(Math.max(Math.round((scanPosition / 100) * (h - 1)), 0), h - 1);

    for (let x = 0; x < w; x++) {
      const srcIdx = (row * w + x) * 4;
      const r = data[srcIdx], g = data[srcIdx + 1], b = data[srcIdx + 2];

      for (let y = 0; y < h; y++) {
        const dstIdx = (y * w + x) * 4;
        if (colorMode === "sampled") {
          out[dstIdx] = r; out[dstIdx + 1] = g; out[dstIdx + 2] = b;
        } else {
          const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
          out[dstIdx] = out[dstIdx + 1] = out[dstIdx + 2] = gray;
        }
        out[dstIdx + 3] = 255;
      }
    }
  }

  ctx.putImageData(output, 0, 0);
}
