export function renderStipple(ctx, imageData, w, h, params, colorMode) {
  const { dotDensity = 15000, dotSize = 2 } = params;
  const data = imageData.data;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);

  // Pre-compute grayscale brightness
  const brightness = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    brightness[i] =
      (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) /
      255;
  }

  let placed = 0;
  let attempts = 0;
  const maxAttempts = dotDensity * 10;

  while (placed < dotDensity && attempts < maxAttempts) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    if (ix < 0 || ix >= w || iy < 0 || iy >= h) {
      attempts++;
      continue;
    }

    const b = brightness[iy * w + ix];
    // Darker areas = higher probability of placing a dot
    const prob = 1 - b;

    if (Math.random() < prob) {
      if (colorMode === "sampled") {
        const idx = (iy * w + ix) * 4;
        ctx.fillStyle = `rgb(${data[idx]},${data[idx + 1]},${data[idx + 2]})`;
      } else {
        ctx.fillStyle = "#000000";
      }

      ctx.beginPath();
      ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
      ctx.fill();
      placed++;
    }
    attempts++;
  }
}

export function renderStippleSVG(imageData, w, h, params, colorMode) {
  const { dotDensity = 15000, dotSize = 2 } = params;
  const data = imageData.data;

  const brightness = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    brightness[i] =
      (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) /
      255;
  }

  let dots = "";
  let placed = 0;
  let attempts = 0;
  const maxAttempts = dotDensity * 10;
  const r = dotSize / 2;

  while (placed < dotDensity && attempts < maxAttempts) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    if (ix < 0 || ix >= w || iy < 0 || iy >= h) {
      attempts++;
      continue;
    }

    const b = brightness[iy * w + ix];
    if (Math.random() < 1 - b) {
      let fill;
      if (colorMode === "sampled") {
        const idx = (iy * w + ix) * 4;
        fill = `rgb(${data[idx]},${data[idx + 1]},${data[idx + 2]})`;
      } else {
        fill = "#000000";
      }
      dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${fill}"/>`;
      placed++;
    }
    attempts++;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#FFFFFF"/>${dots}</svg>`;
}
