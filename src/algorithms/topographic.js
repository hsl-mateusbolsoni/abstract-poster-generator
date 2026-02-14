export function renderTopographic(ctx, imageData, w, h, params, colorMode) {
  const { contourLevels = 20, lineWeight = 1.5 } = params;
  const data = imageData.data;

  // Build grayscale brightness map
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    gray[i] = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
  }

  // Gaussian blur for smoothing
  const blurred = gaussianBlur(gray, w, h, 3);

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);

  // Draw contour lines using marching squares
  const step = 255 / (contourLevels + 1);

  for (let level = 1; level <= contourLevels; level++) {
    const threshold = level * step;
    const t = threshold / 255;

    if (colorMode === "sampled") {
      // Sample color from image at average position of this contour
      const hue = (level / contourLevels) * 360;
      // Find pixels near this threshold and average their color
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let i = 0; i < w * h; i += 8) {
        if (Math.abs(blurred[i] - threshold) < step * 0.5) {
          const idx = i * 4;
          rSum += data[idx]; gSum += data[idx + 1]; bSum += data[idx + 2];
          count++;
        }
      }
      if (count > 0) {
        ctx.strokeStyle = `rgb(${Math.round(rSum / count)},${Math.round(gSum / count)},${Math.round(bSum / count)})`;
      } else {
        ctx.strokeStyle = `rgb(${Math.round(threshold)},${Math.round(threshold)},${Math.round(threshold)})`;
      }
    } else {
      const v = Math.round(40 + t * 180);
      ctx.strokeStyle = `rgb(${v},${v},${v})`;
    }
    ctx.lineWidth = lineWeight;

    // Marching squares
    for (let y = 0; y < h - 1; y++) {
      for (let x = 0; x < w - 1; x++) {
        const tl = blurred[y * w + x];
        const tr = blurred[y * w + x + 1];
        const bl = blurred[(y + 1) * w + x];
        const br = blurred[(y + 1) * w + x + 1];

        const code =
          (tl >= threshold ? 8 : 0) |
          (tr >= threshold ? 4 : 0) |
          (br >= threshold ? 2 : 0) |
          (bl >= threshold ? 1 : 0);

        if (code === 0 || code === 15) continue;

        const lerp = (a, b) => (threshold - a) / (b - a);

        const top = lerp(tl, tr);
        const right = lerp(tr, br);
        const bottom = lerp(bl, br);
        const left = lerp(tl, bl);

        const segments = marchingSquaresLookup(code, x, y, top, right, bottom, left);
        for (const [x1, y1, x2, y2] of segments) {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }
  }
}

function marchingSquaresLookup(code, x, y, top, right, bottom, left) {
  const t = [x + top, y];
  const r = [x + 1, y + right];
  const b = [x + bottom, y + 1];
  const l = [x, y + left];

  const cases = {
    1: [[l, b]], 2: [[b, r]], 3: [[l, r]], 4: [[t, r]],
    5: [[t, l], [b, r]], 6: [[t, b]], 7: [[t, l]], 8: [[t, l]],
    9: [[t, b]], 10: [[t, r], [b, l]], 11: [[t, r]], 12: [[l, r]],
    13: [[b, r]], 14: [[l, b]],
  };

  const segs = cases[code] || [];
  return segs.map(([p1, p2]) => [p1[0], p1[1], p2[0], p2[1]]);
}

function gaussianBlur(data, w, h, radius) {
  const out = new Float32Array(data.length);
  const kernel = [];
  const sigma = radius / 2;
  let sum = 0;
  for (let i = -radius; i <= radius; i++) {
    const v = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel.push(v);
    sum += v;
  }
  for (let i = 0; i < kernel.length; i++) kernel[i] /= sum;

  // Horizontal pass
  const temp = new Float32Array(data.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let val = 0;
      for (let k = -radius; k <= radius; k++) {
        const sx = Math.min(Math.max(x + k, 0), w - 1);
        val += data[y * w + sx] * kernel[k + radius];
      }
      temp[y * w + x] = val;
    }
  }

  // Vertical pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let val = 0;
      for (let k = -radius; k <= radius; k++) {
        const sy = Math.min(Math.max(y + k, 0), h - 1);
        val += temp[sy * w + x] * kernel[k + radius];
      }
      out[y * w + x] = val;
    }
  }
  return out;
}

export function renderTopographicSVG(imageData, w, h, params, colorMode) {
  const { contourLevels = 20, lineWeight = 1.5 } = params;
  const data = imageData.data;

  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    gray[i] = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
  }
  const blurred = gaussianBlur(gray, w, h, 3);

  let paths = "";
  const step = 255 / (contourLevels + 1);

  for (let level = 1; level <= contourLevels; level++) {
    const threshold = level * step;
    const t = threshold / 255;
    let stroke;
    if (colorMode === "sampled") {
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let i = 0; i < w * h; i += 8) {
        if (Math.abs(blurred[i] - threshold) < step * 0.5) {
          const idx = i * 4;
          rSum += data[idx]; gSum += data[idx + 1]; bSum += data[idx + 2];
          count++;
        }
      }
      stroke = count > 0
        ? `rgb(${Math.round(rSum / count)},${Math.round(gSum / count)},${Math.round(bSum / count)})`
        : `rgb(${Math.round(threshold)},${Math.round(threshold)},${Math.round(threshold)})`;
    } else {
      const v = Math.round(40 + t * 180);
      stroke = `rgb(${v},${v},${v})`;
    }

    let d = "";
    for (let y = 0; y < h - 1; y++) {
      for (let x = 0; x < w - 1; x++) {
        const tl = blurred[y * w + x];
        const tr = blurred[y * w + x + 1];
        const bl = blurred[(y + 1) * w + x];
        const br = blurred[(y + 1) * w + x + 1];
        const code = (tl >= threshold ? 8 : 0) | (tr >= threshold ? 4 : 0) | (br >= threshold ? 2 : 0) | (bl >= threshold ? 1 : 0);
        if (code === 0 || code === 15) continue;
        const lerp = (a, b) => (threshold - a) / (b - a);
        const segments = marchingSquaresLookup(code, x, y, lerp(tl, tr), lerp(tr, br), lerp(bl, br), lerp(tl, bl));
        for (const [x1, y1, x2, y2] of segments) {
          d += `M${x1.toFixed(1)},${y1.toFixed(1)}L${x2.toFixed(1)},${y2.toFixed(1)}`;
        }
      }
    }
    if (d) paths += `<path d="${d}" stroke="${stroke}" stroke-width="${lineWeight}" fill="none"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#FFFFFF"/>${paths}</svg>`;
}
