export function renderChromatic(ctx, imageData, w, h, params, colorMode) {
  const { offsetAmount = 8, angle = 0 } = params;
  const data = imageData.data;
  const output = ctx.createImageData(w, h);
  const out = output.data;

  const rad = (angle * Math.PI) / 180;
  const dx = Math.round(Math.cos(rad) * offsetAmount);
  const dy = Math.round(Math.sin(rad) * offsetAmount);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dstIdx = (y * w + x) * 4;

      // Red channel: offset in one direction
      const rx = Math.min(Math.max(x + dx, 0), w - 1);
      const ry = Math.min(Math.max(y + dy, 0), h - 1);
      const rIdx = (ry * w + rx) * 4;

      // Green channel: no offset (anchor)
      const gIdx = (y * w + x) * 4;

      // Blue channel: offset in opposite direction
      const bx = Math.min(Math.max(x - dx, 0), w - 1);
      const by = Math.min(Math.max(y - dy, 0), h - 1);
      const bIdx = (by * w + bx) * 4;

      if (colorMode === "sampled") {
        // Additive blending of separated channels
        out[dstIdx] = Math.min(255, data[rIdx]);
        out[dstIdx + 1] = Math.min(255, data[gIdx + 1]);
        out[dstIdx + 2] = Math.min(255, data[bIdx + 2]);
      } else {
        // Grayscale with channel separation still visible
        const rGray = data[rIdx] * 0.299 + data[rIdx + 1] * 0.587 + data[rIdx + 2] * 0.114;
        const gGray = data[gIdx] * 0.299 + data[gIdx + 1] * 0.587 + data[gIdx + 2] * 0.114;
        const bGray = data[bIdx] * 0.299 + data[bIdx + 1] * 0.587 + data[bIdx + 2] * 0.114;

        out[dstIdx] = Math.min(255, Math.round(rGray));
        out[dstIdx + 1] = Math.min(255, Math.round(gGray));
        out[dstIdx + 2] = Math.min(255, Math.round(bGray));
      }
      out[dstIdx + 3] = 255;
    }
  }

  ctx.putImageData(output, 0, 0);
}
