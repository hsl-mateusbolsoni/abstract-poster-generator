import { useRef, useEffect } from "react";
import { Box, Spinner } from "@chakra-ui/react";

export default function PosterPreview({
  canvasRef,
  width,
  height,
  processing,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;

    const maxW = container.clientWidth;
    const maxH = container.clientHeight;
    const scale = Math.min(maxW / width, maxH / height, 1);

    canvas.style.width = `${width * scale}px`;
    canvas.style.height = `${height * scale}px`;
  }, [canvasRef, width, height]);

  return (
    <Box
      ref={containerRef}
      flex="1"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
      minH="0"
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          borderRadius: "4px",
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
        }}
      />
      {processing && (
        <Box
          position="absolute"
          inset="0"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="rgba(10,10,10,0.6)"
        >
          <Spinner size="lg" color="#525252" borderWidth="2px" />
        </Box>
      )}
    </Box>
  );
}
