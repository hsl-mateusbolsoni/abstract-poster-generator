import Delaunator from "delaunator";

export function renderTriangleMesh(ctx, imageData, w, h, params, colorMode) {
  const { triangleCount = 500, edgeVisibility = 1 } = params;
  const data = imageData.data;

  // Generate points weighted by edge detection
  const pointCount = Math.round(triangleCount * 0.6);
  const points = generateWeightedPoints(data, w, h, pointCount);

  // Add corner and edge points
  points.push([0, 0], [w, 0], [0, h], [w, h]);
  for (let i = 1; i < 8; i++) {
    points.push([w * i / 8, 0], [w * i / 8, h], [0, h * i / 8], [w, h * i / 8]);
  }

  const coords = new Float64Array(points.length * 2);
  for (let i = 0; i < points.length; i++) {
    coords[i * 2] = points[i][0];
    coords[i * 2 + 1] = points[i][1];
  }

  const delaunay = new Delaunator(coords);
  const triangles = delaunay.triangles;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < triangles.length; i += 3) {
    const i0 = triangles[i], i1 = triangles[i + 1], i2 = triangles[i + 2];
    const x0 = points[i0][0], y0 = points[i0][1];
    const x1 = points[i1][0], y1 = points[i1][1];
    const x2 = points[i2][0], y2 = points[i2][1];

    // Center of triangle
    const cx = (x0 + x1 + x2) / 3;
    const cy = (y0 + y1 + y2) / 3;
    const ix = Math.min(Math.max(Math.round(cx), 0), w - 1);
    const iy = Math.min(Math.max(Math.round(cy), 0), h - 1);

    // Sample average color in triangle area
    const { r, g, b } = sampleTriangleColor(data, w, h, x0, y0, x1, y1, x2, y2);

    if (colorMode === "sampled") {
      ctx.fillStyle = `rgb(${r},${g},${b})`;
    } else {
      const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
      ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
    }

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.fill();

    if (edgeVisibility === 1) {
      ctx.strokeStyle = colorMode === "sampled"
        ? `rgba(${Math.max(0, r - 30)},${Math.max(0, g - 30)},${Math.max(0, b - 30)},0.3)`
        : "rgba(0,0,0,0.08)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }
}

function sampleTriangleColor(data, w, h, x0, y0, x1, y1, x2, y2) {
  // Simple: sample center and a few points
  const points = [
    [(x0 + x1 + x2) / 3, (y0 + y1 + y2) / 3],
    [(x0 + x1) / 2, (y0 + y1) / 2],
    [(x1 + x2) / 2, (y1 + y2) / 2],
    [(x0 + x2) / 2, (y0 + y2) / 2],
  ];

  let rSum = 0, gSum = 0, bSum = 0, count = 0;
  for (const [px, py] of points) {
    const ix = Math.min(Math.max(Math.round(px), 0), w - 1);
    const iy = Math.min(Math.max(Math.round(py), 0), h - 1);
    const idx = (iy * w + ix) * 4;
    rSum += data[idx]; gSum += data[idx + 1]; bSum += data[idx + 2];
    count++;
  }

  return {
    r: Math.round(rSum / count),
    g: Math.round(gSum / count),
    b: Math.round(bSum / count),
  };
}

function generateWeightedPoints(data, w, h, count) {
  const points = [];
  // Compute edge weights
  const weights = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (i) => { const p = i * 4; return data[p] * 0.299 + data[p + 1] * 0.587 + data[p + 2] * 0.114; };
      const c = idx(y * w + x);
      const r = idx(y * w + x + 1);
      const d = idx((y + 1) * w + x);
      weights[y * w + x] = Math.abs(r - c) + Math.abs(d - c);
    }
  }

  // Normalize
  let max = 0;
  for (let i = 0; i < weights.length; i++) if (weights[i] > max) max = weights[i];
  if (max > 0) for (let i = 0; i < weights.length; i++) weights[i] = 0.15 + (weights[i] / max) * 0.85;

  let placed = 0, attempts = 0;
  while (placed < count && attempts < count * 20) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const ix = Math.floor(x), iy = Math.floor(y);
    if (ix >= 0 && ix < w && iy >= 0 && iy < h && Math.random() < weights[iy * w + ix]) {
      points.push([x, y]);
      placed++;
    }
    attempts++;
  }
  while (points.length < count) points.push([Math.random() * w, Math.random() * h]);
  return points;
}

export function renderTriangleMeshSVG(imageData, w, h, params, colorMode) {
  const { triangleCount = 500, edgeVisibility = 1 } = params;
  const data = imageData.data;

  const pointCount = Math.round(triangleCount * 0.6);
  const points = generateWeightedPoints(data, w, h, pointCount);
  points.push([0, 0], [w, 0], [0, h], [w, h]);
  for (let i = 1; i < 8; i++) {
    points.push([w * i / 8, 0], [w * i / 8, h], [0, h * i / 8], [w, h * i / 8]);
  }

  const coords = new Float64Array(points.length * 2);
  for (let i = 0; i < points.length; i++) {
    coords[i * 2] = points[i][0]; coords[i * 2 + 1] = points[i][1];
  }

  const delaunay = new Delaunator(coords);
  const triangles = delaunay.triangles;
  let polys = "";

  for (let i = 0; i < triangles.length; i += 3) {
    const i0 = triangles[i], i1 = triangles[i + 1], i2 = triangles[i + 2];
    const x0 = points[i0][0], y0 = points[i0][1];
    const x1 = points[i1][0], y1 = points[i1][1];
    const x2 = points[i2][0], y2 = points[i2][1];

    const { r, g, b } = sampleTriangleColor(data, w, h, x0, y0, x1, y1, x2, y2);
    let fill;
    if (colorMode === "sampled") fill = `rgb(${r},${g},${b})`;
    else { const gr = Math.round(r * 0.299 + g * 0.587 + b * 0.114); fill = `rgb(${gr},${gr},${gr})`; }

    const stroke = edgeVisibility === 1 ? `stroke="rgba(0,0,0,0.08)" stroke-width="0.5"` : "";
    polys += `<polygon points="${x0.toFixed(1)},${y0.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" fill="${fill}" ${stroke}/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#FFFFFF"/>${polys}</svg>`;
}
