export function renderPixelSort(ctx, imageData, w, h, params, colorMode) {
  const { direction = 1, threshold = 128 } = params;
  const data = new Uint8ClampedArray(imageData.data);
  const output = ctx.createImageData(w, h);
  const out = output.data;

  // Copy original data
  for (let i = 0; i < data.length; i++) out[i] = data[i];

  const getBrightness = (idx) =>
    data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;

  const sortInterval = (pixels) => {
    if (colorMode === "sampled") {
      pixels.sort((a, b) => {
        const ba =
          data[a] * 0.299 + data[a + 1] * 0.587 + data[a + 2] * 0.114;
        const bb =
          data[b] * 0.299 + data[b + 1] * 0.587 + data[b + 2] * 0.114;
        return ba - bb;
      });
    } else {
      pixels.sort((a, b) => {
        const ba =
          data[a] * 0.299 + data[a + 1] * 0.587 + data[a + 2] * 0.114;
        const bb =
          data[b] * 0.299 + data[b + 1] * 0.587 + data[b + 2] * 0.114;
        return ba - bb;
      });
    }
    return pixels;
  };

  // Direction: 0=up, 1=down, 2=left, 3=right
  const isVertical = direction <= 1;
  const isReversed = direction === 0 || direction === 2;

  if (isVertical) {
    for (let x = 0; x < w; x++) {
      let interval = [];
      const indices = [];

      for (let y = 0; y < h; y++) {
        const idx = (y * w + x) * 4;
        const b = getBrightness(idx);

        if (b > threshold) {
          interval.push(idx);
          indices.push(idx);
        } else {
          if (interval.length > 1) {
            const sorted = sortInterval([...interval]);
            if (isReversed) sorted.reverse();
            for (let k = 0; k < sorted.length; k++) {
              const destIdx = indices[indices.length - interval.length + k];
              const srcIdx = sorted[k];
              out[destIdx] = data[srcIdx];
              out[destIdx + 1] = data[srcIdx + 1];
              out[destIdx + 2] = data[srcIdx + 2];
              out[destIdx + 3] = 255;
            }
          }
          interval = [];
        }
      }

      // Flush remaining
      if (interval.length > 1) {
        const sorted = sortInterval([...interval]);
        if (isReversed) sorted.reverse();
        for (let k = 0; k < sorted.length; k++) {
          const destIdx = indices[indices.length - interval.length + k];
          const srcIdx = sorted[k];
          out[destIdx] = data[srcIdx];
          out[destIdx + 1] = data[srcIdx + 1];
          out[destIdx + 2] = data[srcIdx + 2];
          out[destIdx + 3] = 255;
        }
      }
    }
  } else {
    for (let y = 0; y < h; y++) {
      let interval = [];
      const indices = [];

      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const b = getBrightness(idx);

        if (b > threshold) {
          interval.push(idx);
          indices.push(idx);
        } else {
          if (interval.length > 1) {
            const sorted = sortInterval([...interval]);
            if (isReversed) sorted.reverse();
            for (let k = 0; k < sorted.length; k++) {
              const destIdx = indices[indices.length - interval.length + k];
              const srcIdx = sorted[k];
              out[destIdx] = data[srcIdx];
              out[destIdx + 1] = data[srcIdx + 1];
              out[destIdx + 2] = data[srcIdx + 2];
              out[destIdx + 3] = 255;
            }
          }
          interval = [];
        }
      }

      if (interval.length > 1) {
        const sorted = sortInterval([...interval]);
        if (isReversed) sorted.reverse();
        for (let k = 0; k < sorted.length; k++) {
          const destIdx = indices[indices.length - interval.length + k];
          const srcIdx = sorted[k];
          out[destIdx] = data[srcIdx];
          out[destIdx + 1] = data[srcIdx + 1];
          out[destIdx + 2] = data[srcIdx + 2];
          out[destIdx + 3] = 255;
        }
      }
    }
  }

  // Convert to grayscale if needed
  if (colorMode !== "sampled") {
    for (let i = 0; i < w * h; i++) {
      const idx = i * 4;
      const gray = out[idx] * 0.299 + out[idx + 1] * 0.587 + out[idx + 2] * 0.114;
      out[idx] = out[idx + 1] = out[idx + 2] = gray;
    }
  }

  ctx.putImageData(output, 0, 0);
}
