import { useState, useRef, useCallback, useEffect } from "react";
import { renderHalftone, renderHalftoneSVG } from "../algorithms/halftone";
import { renderDither } from "../algorithms/dither";
import { renderVoronoi, renderVoronoiSVG } from "../algorithms/voronoi";
import { renderStipple, renderStippleSVG } from "../algorithms/stipple";
import { renderLineScan, renderLineScanSVG } from "../algorithms/lineScan";
import { renderPixelSort } from "../algorithms/pixelSort";
import { renderColorBlocks, renderColorBlocksSVG } from "../algorithms/colorBlocks";
import { renderTopographic, renderTopographicSVG } from "../algorithms/topographic";
import { renderConcentric, renderConcentricSVG } from "../algorithms/concentric";
import { renderASCII } from "../algorithms/ascii";
import { renderTriangleMesh, renderTriangleMeshSVG } from "../algorithms/triangleMesh";
import { renderSlitScan } from "../algorithms/slitScan";
import { renderChromatic } from "../algorithms/chromatic";
import { renderDepthContour } from "../algorithms/depthContour";
import { extractPalette } from "../utils/colorExtraction";
import { generatePoeticName } from "../utils/nameGenerator";
import { generatePosterId } from "../utils/idGenerator";
import { getImageData, fitToRatio, drawPosterFrame, formatDate } from "../utils/canvasHelpers";
import { STYLE_PARAMS } from "../components/ParameterControls";

const RATIOS = { "2:3": 2 / 3, "4:5": 4 / 5, "1:1": 1, A4: 1 / 1.414 };
const BORDER_PCT = 0.04;
const PREVIEW_MAX = 800;
const EXPORT_MAX = 3840;

const RENDERERS = {
  halftone: renderHalftone,
  dither: renderDither,
  voronoi: renderVoronoi,
  stipple: renderStipple,
  lineScan: renderLineScan,
  pixelSort: renderPixelSort,
  colorBlocks: renderColorBlocks,
  topographic: renderTopographic,
  concentric: renderConcentric,
  ascii: renderASCII,
  triangleMesh: renderTriangleMesh,
  slitScan: renderSlitScan,
  chromatic: renderChromatic,
  depthContour: renderDepthContour,
};

const SVG_RENDERERS = {
  halftone: renderHalftoneSVG,
  voronoi: renderVoronoiSVG,
  stipple: renderStippleSVG,
  lineScan: renderLineScanSVG,
  topographic: renderTopographicSVG,
  triangleMesh: renderTriangleMeshSVG,
  colorBlocks: renderColorBlocksSVG,
  concentric: renderConcentricSVG,
};

const STYLE_LABELS = {
  halftone: "HALFTONE", dither: "DITHER", voronoi: "VORONOI",
  stipple: "STIPPLE", lineScan: "LINE SCAN", pixelSort: "PIXEL SORT",
  colorBlocks: "COLOR BLOCKS", topographic: "TOPOGRAPHIC",
  concentric: "CONCENTRIC", ascii: "ASCII", triangleMesh: "TRIANGLE MESH",
  slitScan: "SLIT SCAN", chromatic: "CHROMATIC", depthContour: "DEPTH CONTOUR",
};

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
  const [metadataPos, setMetadataPos] = useState("bottom");
  const [posterMeta, setPosterMeta] = useState(null);
  const [palette, setPalette] = useState([]);
  const debounceRef = useRef(null);

  // Generate poster identity on image load
  const generateIdentity = useCallback(() => {
    return {
      name: generatePoeticName(),
      id: generatePosterId(),
      date: formatDate(),
    };
  }, []);

  const render = useCallback(
    (forceParams) => {
      if (!sourceImage || !canvasRef.current) return;

      const ratioVal = RATIOS[ratio];
      const { w: artW, h: artH } = fitToRatio(
        sourceImage.width, sourceImage.height, ratioVal, PREVIEW_MAX
      );

      const border = Math.round(Math.min(artW, artH) * BORDER_PCT);
      const totalW = artW + border * 2;
      const totalH = artH + border * 2;

      const canvas = canvasRef.current;
      canvas.width = totalW;
      canvas.height = totalH;
      setCanvasSize({ w: totalW, h: totalH });

      const ctx = canvas.getContext("2d");
      const imageData = getImageData(sourceImage, artW, artH);
      const renderer = RENDERERS[style];

      if (renderer) {
        setProcessing(true);
        requestAnimationFrame(() => {
          // Render artwork to offscreen canvas
          const artCanvas = document.createElement("canvas");
          artCanvas.width = artW;
          artCanvas.height = artH;
          const artCtx = artCanvas.getContext("2d");
          renderer(artCtx, imageData, artW, artH, forceParams || params, colorMode);

          // Draw poster frame with metadata
          const meta = posterMeta
            ? { ...posterMeta, palette, style: style }
            : null;

          drawPosterFrame(ctx, artCanvas, totalW, totalH, BORDER_PCT, meta, metadataPos);
          setProcessing(false);
        });
      }
    },
    [sourceImage, style, ratio, colorMode, params, posterMeta, palette, metadataPos]
  );

  useEffect(() => {
    if (!sourceImage) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => render(), 150);
    return () => clearTimeout(debounceRef.current);
  }, [sourceImage, style, ratio, colorMode, params, posterMeta, palette, metadataPos, render]);

  const onImageLoad = useCallback((img, name) => {
    setSourceImage(img);
    setFileName(name);
    const identity = {
      name: generatePoeticName(),
      id: generatePosterId(),
      date: formatDate(),
    };
    setPosterMeta(identity);

    // Extract palette from small version
    const smallCanvas = document.createElement("canvas");
    const smallSize = 100;
    const imgRatio = img.width / img.height;
    const sw = imgRatio >= 1 ? smallSize : Math.round(smallSize * imgRatio);
    const sh = imgRatio >= 1 ? Math.round(smallSize / imgRatio) : smallSize;
    smallCanvas.width = sw;
    smallCanvas.height = sh;
    const sCtx = smallCanvas.getContext("2d");
    sCtx.drawImage(img, 0, 0, sw, sh);
    const smallData = sCtx.getImageData(0, 0, sw, sh);
    const colors = extractPalette(smallData, 6);
    setPalette(colors);
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
      newParams[p.key] = p.min + Math.floor(Math.random() * (steps + 1)) * p.step;
    });
    setParams(newParams);
  }, [style]);

  const regenerate = useCallback(() => {
    setPosterMeta({
      name: generatePoeticName(),
      id: generatePosterId(),
      date: formatDate(),
    });
    // Force re-render by toggling a dummy state via params spread
    setParams((p) => ({ ...p }));
  }, []);

  const exportPoster = useCallback(
    (format) => {
      if (!sourceImage || !posterMeta) return;

      const ratioVal = RATIOS[ratio];
      const { w: artW, h: artH } = fitToRatio(
        sourceImage.width, sourceImage.height, ratioVal, EXPORT_MAX
      );

      const border = Math.round(Math.min(artW, artH) * BORDER_PCT);
      const totalW = artW + border * 2;
      const totalH = artH + border * 2;

      const slugName = posterMeta.name.toLowerCase().replace(/\s+/g, "-");
      const filename = `${slugName}_${posterMeta.id}_${style}.${format}`;

      if (format === "svg" && SVG_RENDERERS[style]) {
        const imageData = getImageData(sourceImage, artW, artH);
        const svgContent = SVG_RENDERERS[style](imageData, artW, artH, params, colorMode);
        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      // PNG export with poster frame
      const imageData = getImageData(sourceImage, artW, artH);
      const artCanvas = document.createElement("canvas");
      artCanvas.width = artW;
      artCanvas.height = artH;
      const artCtx = artCanvas.getContext("2d");
      RENDERERS[style](artCtx, imageData, artW, artH, params, colorMode);

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = totalW;
      exportCanvas.height = totalH;
      const ctx = exportCanvas.getContext("2d");

      const meta = { ...posterMeta, palette, style: style };
      drawPosterFrame(ctx, artCanvas, totalW, totalH, BORDER_PCT, meta, metadataPos);

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
    },
    [sourceImage, style, ratio, colorMode, params, posterMeta, palette, metadataPos]
  );

  return {
    canvasRef, sourceImage, fileName,
    style, setStyle, ratio, setRatio,
    colorMode, setColorMode,
    params, setParams, onParamChange,
    onImageLoad, processing, canvasSize,
    randomize, regenerate, exportPoster,
    metadataPos, setMetadataPos,
    posterMeta, palette,
  };
}
