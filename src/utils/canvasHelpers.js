export function getImageData(img, w, h) {
  const offscreen = document.createElement("canvas");
  offscreen.width = w;
  offscreen.height = h;
  const ctx = offscreen.getContext("2d");

  const imgRatio = img.width / img.height;
  const canvasRatio = w / h;
  let sx, sy, sw, sh;

  if (imgRatio > canvasRatio) {
    sh = img.height;
    sw = img.height * canvasRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = img.width / canvasRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

export function getSmallImageData(img, maxSize = 100) {
  const ratio = img.width / img.height;
  let w, h;
  if (ratio >= 1) {
    w = maxSize;
    h = Math.round(maxSize / ratio);
  } else {
    h = maxSize;
    w = Math.round(maxSize * ratio);
  }
  return getImageData(img, w, h);
}

export function fitToRatio(imgW, imgH, ratio, maxSize) {
  let w, h;
  if (ratio >= 1) {
    h = Math.min(imgH, maxSize);
    w = Math.round(h * ratio);
  } else {
    w = Math.min(imgW, maxSize);
    h = Math.round(w / ratio);
  }
  if (w > maxSize) { w = maxSize; h = Math.round(w / ratio); }
  if (h > maxSize) { h = maxSize; w = Math.round(h * ratio); }
  return { w, h };
}

export function drawPosterFrame(ctx, artworkCanvas, totalW, totalH, borderPct, metadata, metadataPos) {
  const border = Math.round(Math.min(totalW, totalH) * borderPct);
  const artW = totalW - border * 2;
  const artH = totalH - border * 2;

  // White background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, totalW, totalH);

  // Draw artwork
  ctx.drawImage(artworkCanvas, border, border, artW, artH);

  // Metadata
  if (metadata) {
    drawMetadata(ctx, totalW, totalH, border, metadata, metadataPos);
  }
}

function drawMetadata(ctx, totalW, totalH, border, meta, position) {
  const fontSize = Math.max(8, Math.round(Math.min(totalW, totalH) * 0.012));
  const swatchSize = Math.round(fontSize * 1.1);
  const gap = Math.round(fontSize * 0.5);

  ctx.font = `400 ${fontSize}px 'Manrope', sans-serif`;
  ctx.fillStyle = "#737373";
  ctx.letterSpacing = "0.05em";

  const nameText = meta.name;
  const idText = meta.id;
  const dateText = meta.date;
  const styleText = meta.style.toUpperCase();

  const parts = [nameText, idText, dateText];
  const textWidths = parts.map((t) => ctx.measureText(t).width);
  const styleWidth = ctx.measureText(styleText).width;
  const paletteTotalW = meta.palette.length * swatchSize + (meta.palette.length - 1) * 2;

  const totalContentW = textWidths.reduce((a, b) => a + b, 0) + paletteTotalW + styleWidth + gap * (parts.length + 2);

  if (position === "bottom" || !position) {
    const y = totalH - border * 0.4;
    let x = border;

    // Name
    ctx.fillStyle = "#737373";
    ctx.textBaseline = "middle";
    ctx.fillText(nameText, x, y);
    x += textWidths[0] + gap * 2;

    // ID
    ctx.fillText(idText, x, y);
    x += textWidths[1] + gap * 2;

    // Date
    ctx.fillText(dateText, x, y);
    x += textWidths[2] + gap * 2;

    // Palette swatches
    for (let i = 0; i < meta.palette.length; i++) {
      ctx.fillStyle = meta.palette[i];
      ctx.fillRect(x + i * (swatchSize + 2), y - swatchSize / 2, swatchSize, swatchSize);
    }
    x += paletteTotalW + gap * 2;

    // Style name
    ctx.fillStyle = "#737373";
    ctx.fillText(styleText, x, y);

  } else if (position === "top") {
    const y = border * 0.4;
    let x = totalW - border;

    ctx.textBaseline = "middle";
    ctx.fillStyle = "#737373";

    // Right-aligned: style, palette, date, id, name
    x -= styleWidth;
    ctx.fillText(styleText, x, y);
    x -= gap * 2;

    x -= paletteTotalW;
    for (let i = 0; i < meta.palette.length; i++) {
      ctx.fillStyle = meta.palette[i];
      ctx.fillRect(x + i * (swatchSize + 2), y - swatchSize / 2, swatchSize, swatchSize);
    }
    ctx.fillStyle = "#737373";
    x -= gap * 2;

    x -= textWidths[2];
    ctx.fillText(dateText, x, y);
    x -= gap * 2;

    x -= textWidths[1];
    ctx.fillText(idText, x, y);
    x -= gap * 2;

    x -= textWidths[0];
    ctx.fillText(nameText, x, y);

  } else if (position === "left") {
    ctx.save();
    ctx.translate(border * 0.4, totalH - border);
    ctx.rotate(-Math.PI / 2);
    let x = 0;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#737373";

    ctx.fillText(nameText, x, 0);
    x += textWidths[0] + gap * 2;

    ctx.fillText(idText, x, 0);
    x += textWidths[1] + gap * 2;

    ctx.fillText(dateText, x, 0);
    x += textWidths[2] + gap * 2;

    for (let i = 0; i < meta.palette.length; i++) {
      ctx.fillStyle = meta.palette[i];
      ctx.fillRect(x + i * (swatchSize + 2), -swatchSize / 2, swatchSize, swatchSize);
    }
    ctx.fillStyle = "#737373";
    x += paletteTotalW + gap * 2;

    ctx.fillText(styleText, x, 0);
    ctx.restore();

  } else if (position === "right") {
    ctx.save();
    ctx.translate(totalW - border * 0.4, border);
    ctx.rotate(Math.PI / 2);
    let x = 0;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#737373";

    ctx.fillText(nameText, x, 0);
    x += textWidths[0] + gap * 2;

    ctx.fillText(idText, x, 0);
    x += textWidths[1] + gap * 2;

    ctx.fillText(dateText, x, 0);
    x += textWidths[2] + gap * 2;

    for (let i = 0; i < meta.palette.length; i++) {
      ctx.fillStyle = meta.palette[i];
      ctx.fillRect(x + i * (swatchSize + 2), -swatchSize / 2, swatchSize, swatchSize);
    }
    ctx.fillStyle = "#737373";
    x += paletteTotalW + gap * 2;

    ctx.fillText(styleText, x, 0);
    ctx.restore();
  }
}

export function formatDate() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}
