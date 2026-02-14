export function renderLineScan(ctx, imageData, w, h, params, colorMode) {
  const { direction = 0, lineThickness = 3 } = params;
  const data = imageData.data;
  const spacing = lineThickness * 3;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);

  if (direction === 0) {
    // Horizontal lines
    for (let y = 0; y < h; y += spacing) {
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const idx = (Math.min(y, h - 1) * w + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const brightness =
          (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        const thickness = (1 - brightness) * lineThickness * 2;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        if (colorMode === "sampled") {
          ctx.strokeStyle = `rgb(${r},${g},${b})`;
          ctx.lineWidth = Math.max(0.5, thickness);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x, y);
        } else {
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = Math.max(0.5, thickness);
        }
      }
      if (colorMode !== "sampled") {
        // For grayscale, draw line with varying thickness using segments
        ctx.stroke();
      }
    }

    // Re-render with per-pixel thickness for grayscale mode
    if (colorMode !== "sampled") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, w, h);

      for (let y = 0; y < h; y += spacing) {
        for (let x = 0; x < w; x++) {
          const idx = (Math.min(y, h - 1) * w + x) * 4;
          const brightness =
            (data[idx] * 0.299 +
              data[idx + 1] * 0.587 +
              data[idx + 2] * 0.114) /
            255;
          const thickness = (1 - brightness) * lineThickness * 2;
          if (thickness < 0.3) continue;

          ctx.fillStyle = "#000000";
          ctx.fillRect(x, y - thickness / 2, 1, thickness);
        }
      }
    }
  } else {
    // Vertical lines
    for (let x = 0; x < w; x += spacing) {
      for (let y = 0; y < h; y++) {
        const idx = (y * w + Math.min(x, w - 1)) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const brightness =
          (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        const thickness = (1 - brightness) * lineThickness * 2;
        if (thickness < 0.3) continue;

        if (colorMode === "sampled") {
          ctx.fillStyle = `rgb(${r},${g},${b})`;
        } else {
          ctx.fillStyle = "#000000";
        }
        ctx.fillRect(x - thickness / 2, y, thickness, 1);
      }
    }
  }
}

export function renderLineScanSVG(imageData, w, h, params, colorMode) {
  const { direction = 0, lineThickness = 3 } = params;
  const data = imageData.data;
  const spacing = lineThickness * 3;
  let elements = "";

  // Sample at intervals to keep SVG manageable
  const step = Math.max(1, Math.floor(w > h ? w / 600 : h / 600));

  if (direction === 0) {
    for (let y = 0; y < h; y += spacing) {
      let pathD = "";
      for (let x = 0; x < w; x += step) {
        const idx = (Math.min(y, h - 1) * w + Math.min(x, w - 1)) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        const thickness = (1 - brightness) * lineThickness * 2;

        let fill;
        if (colorMode === "sampled") {
          fill = `rgb(${r},${g},${b})`;
        } else {
          fill = "#000000";
        }
        if (thickness > 0.3) {
          elements += `<rect x="${x}" y="${(y - thickness / 2).toFixed(1)}" width="${step}" height="${thickness.toFixed(1)}" fill="${fill}"/>`;
        }
      }
    }
  } else {
    for (let x = 0; x < w; x += spacing) {
      for (let y = 0; y < h; y += step) {
        const idx = (Math.min(y, h - 1) * w + Math.min(x, w - 1)) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        const thickness = (1 - brightness) * lineThickness * 2;

        let fill;
        if (colorMode === "sampled") {
          fill = `rgb(${r},${g},${b})`;
        } else {
          fill = "#000000";
        }
        if (thickness > 0.3) {
          elements += `<rect x="${(x - thickness / 2).toFixed(1)}" y="${y}" width="${thickness.toFixed(1)}" height="${step}" fill="${fill}"/>`;
        }
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#FFFFFF"/>${elements}</svg>`;
}
