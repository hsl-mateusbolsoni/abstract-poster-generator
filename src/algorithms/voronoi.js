function sobelEdgeWeights(imageData, w, h) {
  const data = imageData.data;
  const weights = new Float32Array(w * h);

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (i) => {
        const p = i * 4;
        return data[p] * 0.299 + data[p + 1] * 0.587 + data[p + 2] * 0.114;
      };

      const tl = idx((y - 1) * w + x - 1);
      const t = idx((y - 1) * w + x);
      const tr = idx((y - 1) * w + x + 1);
      const l = idx(y * w + x - 1);
      const r = idx(y * w + x + 1);
      const bl = idx((y + 1) * w + x - 1);
      const b = idx((y + 1) * w + x);
      const br = idx((y + 1) * w + x + 1);

      const gx = -tl + tr - 2 * l + 2 * r - bl + br;
      const gy = -tl - 2 * t - tr + bl + 2 * b + br;
      weights[y * w + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }

  // Normalize
  let max = 0;
  for (let i = 0; i < weights.length; i++) if (weights[i] > max) max = weights[i];
  if (max > 0) for (let i = 0; i < weights.length; i++) weights[i] /= max;

  // Add base weight so non-edge areas still get some points
  for (let i = 0; i < weights.length; i++) weights[i] = 0.1 + weights[i] * 0.9;

  return weights;
}

function generateWeightedPoints(n, w, h, weights) {
  const points = [];
  let attempts = 0;
  const maxAttempts = n * 20;

  while (points.length < n && attempts < maxAttempts) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix < 0 || ix >= w || iy < 0 || iy >= h) {
      attempts++;
      continue;
    }
    const weight = weights[iy * w + ix];
    if (Math.random() < weight) {
      points.push([x, y]);
    }
    attempts++;
  }

  // Fill remaining with random points
  while (points.length < n) {
    points.push([Math.random() * w, Math.random() * h]);
  }

  return points;
}

export function renderVoronoi(ctx, imageData, w, h, params, colorMode) {
  const { cellCount = 500 } = params;
  const data = imageData.data;

  const weights = sobelEdgeWeights(imageData, w, h);
  const points = generateWeightedPoints(cellCount, w, h, weights);

  // Use a grid-based approach for faster nearest-neighbor lookup
  const gridSize = Math.max(4, Math.floor(Math.sqrt((w * h) / cellCount)));
  const gridW = Math.ceil(w / gridSize);
  const gridH = Math.ceil(h / gridSize);
  const grid = new Array(gridW * gridH).fill(null).map(() => []);

  points.forEach((p, i) => {
    const gx = Math.min(Math.floor(p[0] / gridSize), gridW - 1);
    const gy = Math.min(Math.floor(p[1] / gridSize), gridH - 1);
    grid[gy * gridW + gx].push(i);
  });

  // Assign each pixel to nearest point
  const assignment = new Int32Array(w * h);
  const colorSums = new Float64Array(cellCount * 4);
  const colorCounts = new Int32Array(cellCount);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const gx = Math.min(Math.floor(x / gridSize), gridW - 1);
      const gy = Math.min(Math.floor(y / gridSize), gridH - 1);

      let minDist = Infinity;
      let minIdx = 0;

      // Search nearby grid cells
      const searchR = 2;
      for (
        let dy = Math.max(0, gy - searchR);
        dy <= Math.min(gridH - 1, gy + searchR);
        dy++
      ) {
        for (
          let dx = Math.max(0, gx - searchR);
          dx <= Math.min(gridW - 1, gx + searchR);
          dx++
        ) {
          const cell = grid[dy * gridW + dx];
          for (let k = 0; k < cell.length; k++) {
            const pi = cell[k];
            const px = points[pi][0] - x;
            const py = points[pi][1] - y;
            const d = px * px + py * py;
            if (d < minDist) {
              minDist = d;
              minIdx = pi;
            }
          }
        }
      }

      assignment[y * w + x] = minIdx;
      const idx = (y * w + x) * 4;
      colorSums[minIdx * 4] += data[idx];
      colorSums[minIdx * 4 + 1] += data[idx + 1];
      colorSums[minIdx * 4 + 2] += data[idx + 2];
      colorCounts[minIdx]++;
    }
  }

  // Compute average colors
  const cellColors = new Uint8Array(cellCount * 3);
  for (let i = 0; i < cellCount; i++) {
    if (colorCounts[i] > 0) {
      cellColors[i * 3] = colorSums[i * 4] / colorCounts[i];
      cellColors[i * 3 + 1] = colorSums[i * 4 + 1] / colorCounts[i];
      cellColors[i * 3 + 2] = colorSums[i * 4 + 2] / colorCounts[i];
    }
  }

  // Draw cells
  const output = ctx.createImageData(w, h);
  const out = output.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pi = (y * w + x) * 4;
      const ci = assignment[y * w + x];

      // Check if border (neighbor has different assignment)
      let isBorder = false;
      if (x > 0 && assignment[y * w + x - 1] !== ci) isBorder = true;
      if (x < w - 1 && assignment[y * w + x + 1] !== ci) isBorder = true;
      if (y > 0 && assignment[(y - 1) * w + x] !== ci) isBorder = true;
      if (y < h - 1 && assignment[(y + 1) * w + x] !== ci) isBorder = true;

      if (isBorder) {
        if (colorMode === "sampled") {
          const r = cellColors[ci * 3];
          const g = cellColors[ci * 3 + 1];
          const b = cellColors[ci * 3 + 2];
          out[pi] = Math.max(0, r - 40);
          out[pi + 1] = Math.max(0, g - 40);
          out[pi + 2] = Math.max(0, b - 40);
        } else {
          const gray =
            cellColors[ci * 3] * 0.299 +
            cellColors[ci * 3 + 1] * 0.587 +
            cellColors[ci * 3 + 2] * 0.114;
          const border = Math.max(0, gray - 40);
          out[pi] = out[pi + 1] = out[pi + 2] = border;
        }
      } else {
        if (colorMode === "sampled") {
          out[pi] = cellColors[ci * 3];
          out[pi + 1] = cellColors[ci * 3 + 1];
          out[pi + 2] = cellColors[ci * 3 + 2];
        } else {
          const gray =
            cellColors[ci * 3] * 0.299 +
            cellColors[ci * 3 + 1] * 0.587 +
            cellColors[ci * 3 + 2] * 0.114;
          out[pi] = out[pi + 1] = out[pi + 2] = gray;
        }
      }
      out[pi + 3] = 255;
    }
  }

  ctx.putImageData(output, 0, 0);
}

export function renderVoronoiSVG(imageData, w, h, params, colorMode) {
  const { cellCount = 500 } = params;
  const data = imageData.data;

  const weights = sobelEdgeWeights(imageData, w, h);
  const points = generateWeightedPoints(cellCount, w, h, weights);

  // Sample color at each point
  const colors = points.map(([px, py]) => {
    const ix = Math.min(Math.floor(px), w - 1);
    const iy = Math.min(Math.floor(py), h - 1);
    const idx = (iy * w + ix) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    if (colorMode === "sampled") {
      return `rgb(${r},${g},${b})`;
    }
    const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
    return `rgb(${gray},${gray},${gray})`;
  });

  // Build SVG with circles approximation for Voronoi cells
  let elements = "";
  const cellRadius = Math.sqrt((w * h) / cellCount) * 0.8;
  points.forEach(([px, py], i) => {
    elements += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${cellRadius.toFixed(1)}" fill="${colors[i]}" stroke="${colors[i]}" stroke-width="1"/>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#808080"/>${elements}</svg>`;
}
