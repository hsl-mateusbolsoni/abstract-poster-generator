function rgbToLab(r, g, b) {
  // sRGB to linear
  let rl = r / 255, gl = g / 255, bl = b / 255;
  rl = rl > 0.04045 ? Math.pow((rl + 0.055) / 1.055, 2.4) : rl / 12.92;
  gl = gl > 0.04045 ? Math.pow((gl + 0.055) / 1.055, 2.4) : gl / 12.92;
  bl = bl > 0.04045 ? Math.pow((bl + 0.055) / 1.055, 2.4) : bl / 12.92;

  // Linear RGB to XYZ
  let x = (rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375) / 0.95047;
  let y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750;
  let z = (rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041) / 1.08883;

  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  x = f(x); y = f(y); z = f(z);

  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

function labToRgb(L, a, b) {
  let y = (L + 16) / 116;
  let x = a / 500 + y;
  let z = y - b / 200;

  const finv = (t) => (t > 0.206897 ? t * t * t : (t - 16 / 116) / 7.787);
  x = finv(x) * 0.95047;
  y = finv(y);
  z = finv(z) * 1.08883;

  let rl = x * 3.2404542 - y * 1.5371385 - z * 0.4985314;
  let gl = -x * 0.9692660 + y * 1.8760108 + z * 0.0415560;
  let bl = x * 0.0556434 - y * 0.2040259 + z * 1.0572252;

  const gamma = (c) => Math.max(0, Math.min(255, Math.round(
    (c > 0.0031308 ? 1.055 * Math.pow(c, 1 / 2.4) - 0.055 : 12.92 * c) * 255
  )));

  return [gamma(rl), gamma(gl), gamma(bl)];
}

export function extractPalette(imageData, k = 6) {
  const data = imageData.data;
  const pixels = [];

  // Sample every ~4th pixel for speed
  const step = Math.max(1, Math.floor(data.length / 4 / 2000));
  for (let i = 0; i < data.length; i += step * 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    pixels.push(rgbToLab(r, g, b));
  }

  // K-means in LAB space
  let centroids = [];
  for (let i = 0; i < k; i++) {
    centroids.push([...pixels[Math.floor(Math.random() * pixels.length)]]);
  }

  for (let iter = 0; iter < 20; iter++) {
    const clusters = Array.from({ length: k }, () => []);

    for (const px of pixels) {
      let minDist = Infinity, minIdx = 0;
      for (let c = 0; c < k; c++) {
        const dL = px[0] - centroids[c][0];
        const da = px[1] - centroids[c][1];
        const db = px[2] - centroids[c][2];
        const d = dL * dL + da * da + db * db;
        if (d < minDist) { minDist = d; minIdx = c; }
      }
      clusters[minIdx].push(px);
    }

    for (let c = 0; c < k; c++) {
      if (clusters[c].length === 0) continue;
      const sum = [0, 0, 0];
      for (const px of clusters[c]) {
        sum[0] += px[0]; sum[1] += px[1]; sum[2] += px[2];
      }
      centroids[c] = [
        sum[0] / clusters[c].length,
        sum[1] / clusters[c].length,
        sum[2] / clusters[c].length,
      ];
    }
  }

  // Convert back to RGB hex, sort by luminance
  const colors = centroids
    .map((lab) => {
      const [r, g, b] = labToRgb(lab[0], lab[1], lab[2]);
      return { hex: `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`, l: lab[0] };
    })
    .sort((a, b) => b.l - a.l)
    .map((c) => c.hex);

  return colors;
}

export function getDominantColors(imageData, k = 6) {
  const data = imageData.data;
  const pixels = [];
  const step = Math.max(1, Math.floor(data.length / 4 / 3000));
  for (let i = 0; i < data.length; i += step * 4) {
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }

  // Simple k-means in RGB
  let centroids = [];
  for (let i = 0; i < k; i++) {
    centroids.push([...pixels[Math.floor(Math.random() * pixels.length)]]);
  }

  for (let iter = 0; iter < 15; iter++) {
    const clusters = Array.from({ length: k }, () => []);
    for (const px of pixels) {
      let minDist = Infinity, minIdx = 0;
      for (let c = 0; c < k; c++) {
        const d = (px[0] - centroids[c][0]) ** 2 + (px[1] - centroids[c][1]) ** 2 + (px[2] - centroids[c][2]) ** 2;
        if (d < minDist) { minDist = d; minIdx = c; }
      }
      clusters[minIdx].push(px);
    }
    for (let c = 0; c < k; c++) {
      if (clusters[c].length === 0) continue;
      const s = [0, 0, 0];
      for (const px of clusters[c]) { s[0] += px[0]; s[1] += px[1]; s[2] += px[2]; }
      centroids[c] = [s[0] / clusters[c].length, s[1] / clusters[c].length, s[2] / clusters[c].length];
    }
  }

  return centroids.map(([r, g, b]) => [Math.round(r), Math.round(g), Math.round(b)]);
}
