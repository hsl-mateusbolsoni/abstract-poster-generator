const BAYER_4x4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const BAYER_8x8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

function orderedDither(ctx, imageData, w, h, matrix, scale, colorMode) {
  const data = imageData.data;
  const size = matrix.length;
  const levels = size * size;
  const output = ctx.createImageData(w, h);
  const out = output.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const mx = Math.floor(x / scale) % size;
      const my = Math.floor(y / scale) % size;
      const threshold = (matrix[my][mx] / levels) * 255;

      if (colorMode === "sampled") {
        out[idx] = r > threshold ? r : 0;
        out[idx + 1] = g > threshold ? g : 0;
        out[idx + 2] = b > threshold ? b : 0;
      } else {
        const gray = r * 0.299 + g * 0.587 + b * 0.114;
        const val = gray > threshold ? 255 : 0;
        out[idx] = val;
        out[idx + 1] = val;
        out[idx + 2] = val;
      }
      out[idx + 3] = 255;
    }
  }

  ctx.putImageData(output, 0, 0);
}

function floydSteinberg(ctx, imageData, w, h, scale, colorMode) {
  const data = new Float32Array(imageData.data.length);
  for (let i = 0; i < imageData.data.length; i++) data[i] = imageData.data[i];

  const output = ctx.createImageData(w, h);
  const out = output.data;

  if (colorMode === "sampled") {
    for (let ch = 0; ch < 3; ch++) {
      const err = new Float32Array(w * h);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4 + ch;
          const i = y * w + x;
          const old = Math.max(0, Math.min(255, data[idx] + err[i]));
          const val = old > 128 ? 255 : 0;
          out[idx] = val;
          const e = old - val;

          if (x + 1 < w) err[i + 1] += (e * 7) / 16;
          if (y + 1 < h) {
            if (x > 0) err[i + w - 1] += (e * 3) / 16;
            err[i + w] += (e * 5) / 16;
            if (x + 1 < w) err[i + w + 1] += (e * 1) / 16;
          }
        }
      }
    }
    for (let i = 0; i < w * h; i++) out[i * 4 + 3] = 255;
  } else {
    const gray = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      const idx = i * 4;
      gray[i] = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
    }

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const old = Math.max(0, Math.min(255, gray[i]));
        const val = old > 128 ? 255 : 0;
        const idx = i * 4;
        out[idx] = out[idx + 1] = out[idx + 2] = val;
        out[idx + 3] = 255;
        const e = old - val;

        if (x + 1 < w) gray[i + 1] += (e * 7) / 16;
        if (y + 1 < h) {
          if (x > 0) gray[i + w - 1] += (e * 3) / 16;
          gray[i + w] += (e * 5) / 16;
          if (x + 1 < w) gray[i + w + 1] += (e * 1) / 16;
        }
      }
    }
  }

  // Apply scale blockiness
  if (scale > 1) {
    const scaled = ctx.createImageData(w, h);
    const sd = scaled.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const bx = Math.floor(x / scale) * scale;
        const by = Math.floor(y / scale) * scale;
        const si = (by * w + bx) * 4;
        const di = (y * w + x) * 4;
        sd[di] = out[si];
        sd[di + 1] = out[si + 1];
        sd[di + 2] = out[si + 2];
        sd[di + 3] = 255;
      }
    }
    ctx.putImageData(scaled, 0, 0);
  } else {
    ctx.putImageData(output, 0, 0);
  }
}

export function renderDither(ctx, imageData, w, h, params, colorMode) {
  const { pattern = 0, scale = 2 } = params;

  if (pattern === 2) {
    floydSteinberg(ctx, imageData, w, h, scale, colorMode);
  } else {
    const matrix = pattern === 0 ? BAYER_4x4 : BAYER_8x8;
    orderedDither(ctx, imageData, w, h, matrix, scale, colorMode);
  }
}
