import { useState, useRef, useCallback, useEffect } from "react";
import { renderHalftone, renderHalftoneSVG } from "../algorithms/halftone";
import { renderDither } from "../algorithms/dither";
import { renderVoronoi, renderVoronoiSVG } from "../algorithms/voronoi";
import { renderStipple, renderStippleSVG } from "../algorithms/stipple";
import { renderLineScan, renderLineScanSVG } from "../algorithms/lineScan";
import { renderPixelSort } from "../algorithms/pixelSort";
import { STYLE_PARAMS } from "../components/ParameterControls";

const RATIOS = {
  "2:3": 2 / 3,
  "4:5": 4 / 5,
  "1:1": 1,
  A4: 1 / 1.414,
};

const RENDERERS = {
  halftone: renderHalftone,
  dither: renderDither,
  voronoi: renderVoronoi,
  stipple: renderStipple,
  lineScan: renderLineScan,
  pixelSort: renderPixelSort,
};

const SVG_RENDERERS = {
  halftone: renderHalftoneSVG,
  voronoi: renderVoronoiSVG,
  stipple: renderStippleSVG,
  lineScan: renderLineScanSVG,
};

const PREVIEW_MAX = 800;
const EXPORT_MAX = 3840;

function fitToRatio(imgW, imgH, ratio, maxSize) {
  let w, h;
  if (ratio >= 1) {
    h = Math.min(imgH, maxSize);
    w = Math.round(h * ratio);
  } else {
    w = Math.min(imgW, maxSize);
    h = Math.round(w / ratio);
  }

  // Ensure neither exceeds maxSize
  if (w > maxSize) {
    w = maxSize;
    h = Math.round(w / ratio);
  }
  if (h > maxSize) {
    h = maxSize;
    w = Math.round(h * ratio);
  }

  return { w, h };
}

function getImageData(img, w, h) {
  const offscreen = document.createElement("canvas");
  offscreen.width = w;
  offscreen.height = h;
  const ctx = offscreen.getContext("2d");

  // Cover: fill canvas while maintaining aspect ratio, cropping excess
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

export default function useImageProcessor() {
  const canvasRef = useRef(null);
  const [sourceImage, setSourceImage] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [style, setStyle] = useState("halftone");
  const [ratio, setRatio] = useState("2:3");
  const [colorMode, setColorMode] = useState("grayscale");
  const [params, setParams] = useState({});
  const [processing, setProcessing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 400, h: 600 });
  const debounceRef = useRef(null);
  const seedRef = useRef(Date.now());

  const render = useCallback(
    (forceParams) => {
      if (!sourceImage || !canvasRef.current) return;

      const ratioVal = RATIOS[ratio];
      const { w, h } = fitToRatio(
        sourceImage.width,
        sourceImage.height,
        ratioVal,
        PREVIEW_MAX
      );

      const canvas = canvasRef.current;
      canvas.width = w;
      canvas.height = h;
      setCanvasSize({ w, h });

      const ctx = canvas.getContext("2d");
      const imageData = getImageData(sourceImage, w, h);
      const renderer = RENDERERS[style];

      if (renderer) {
        setProcessing(true);
        // Use requestAnimationFrame to let the UI update before heavy processing
        requestAnimationFrame(() => {
          renderer(ctx, imageData, w, h, forceParams || params, colorMode);
          setProcessing(false);
        });
      }
    },
    [sourceImage, style, ratio, colorMode, params]
  );

  // Re-render on state changes (debounced)
  useEffect(() => {
    if (!sourceImage) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => render(), 150);
    return () => clearTimeout(debounceRef.current);
  }, [sourceImage, style, ratio, colorMode, params, render]);

  const onImageLoad = useCallback((img, name) => {
    setSourceImage(img);
    setFileName(name);
  }, []);

  const onParamChange = useCallback((key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  const randomize = useCallback(() => {
    const defs = STYLE_PARAMS[style];
    if (!defs) return;

    const newParams = {};
    defs.forEach((p) => {
      const range = p.max - p.min;
      const steps = Math.round(range / p.step);
      const randomStep = Math.floor(Math.random() * (steps + 1));
      newParams[p.key] = p.min + randomStep * p.step;
    });
    setParams(newParams);
    seedRef.current = Date.now();
  }, [style]);

  const regenerate = useCallback(() => {
    seedRef.current = Date.now();
    render();
  }, [render]);

  const exportPoster = useCallback(
    (format) => {
      if (!sourceImage) return;

      const ratioVal = RATIOS[ratio];
      const { w, h } = fitToRatio(
        sourceImage.width,
        sourceImage.height,
        ratioVal,
        EXPORT_MAX
      );

      const timestamp = Date.now();
      const filename = `poster-${style}-${timestamp}.${format}`;

      if (format === "svg" && SVG_RENDERERS[style]) {
        const imageData = getImageData(sourceImage, w, h);
        const svgContent = SVG_RENDERERS[style](
          imageData,
          w,
          h,
          params,
          colorMode
        );
        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      // PNG export at 4K
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = w;
      exportCanvas.height = h;
      const ctx = exportCanvas.getContext("2d");
      const imageData = getImageData(sourceImage, w, h);
      const renderer = RENDERERS[style];

      if (renderer) {
        renderer(ctx, imageData, w, h, params, colorMode);
        exportCanvas.toBlob(
          (blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
          },
          "image/png",
          1.0
        );
      }
    },
    [sourceImage, style, ratio, colorMode, params]
  );

  return {
    canvasRef,
    sourceImage,
    fileName,
    style,
    setStyle,
    ratio,
    setRatio,
    colorMode,
    setColorMode,
    params,
    setParams,
    onParamChange,
    onImageLoad,
    processing,
    canvasSize,
    randomize,
    regenerate,
    exportPoster,
  };
}
