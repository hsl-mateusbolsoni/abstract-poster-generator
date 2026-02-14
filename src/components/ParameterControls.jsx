import { Box, Text, Tooltip, Slider } from "@chakra-ui/react";

const STYLE_PARAMS = {
  halftone: [
    { key: "dotSize", label: "Dot Size", min: 1, max: 20, step: 1 },
    { key: "angle", label: "Angle", min: 0, max: 180, step: 1 },
  ],
  dither: [
    {
      key: "pattern",
      label: "Pattern",
      min: 0,
      max: 2,
      step: 1,
      labels: ["Bayer 4x4", "Bayer 8x8", "Floyd-Steinberg"],
    },
    { key: "scale", label: "Scale", min: 1, max: 8, step: 1 },
  ],
  voronoi: [
    { key: "cellCount", label: "Cell Count", min: 50, max: 2000, step: 10 },
  ],
  stipple: [
    {
      key: "dotDensity",
      label: "Dot Density",
      min: 1000,
      max: 50000,
      step: 500,
    },
    { key: "dotSize", label: "Dot Size", min: 1, max: 4, step: 0.5 },
  ],
  lineScan: [
    {
      key: "direction",
      label: "Direction",
      min: 0,
      max: 1,
      step: 1,
      labels: ["Horizontal", "Vertical"],
    },
    { key: "lineThickness", label: "Thickness", min: 1, max: 8, step: 1 },
  ],
  pixelSort: [
    {
      key: "direction",
      label: "Direction",
      min: 0,
      max: 3,
      step: 1,
      labels: ["\u2191", "\u2193", "\u2190", "\u2192"],
    },
    { key: "threshold", label: "Threshold", min: 0, max: 255, step: 1 },
  ],
};

const DEFAULT_PARAMS = {
  halftone: { dotSize: 8, angle: 45 },
  dither: { pattern: 0, scale: 2 },
  voronoi: { cellCount: 500 },
  stipple: { dotDensity: 15000, dotSize: 2 },
  lineScan: { direction: 0, lineThickness: 3 },
  pixelSort: { direction: 1, threshold: 128 },
};

export default function ParameterControls({ style, params, onParamChange }) {
  const paramDefs = STYLE_PARAMS[style] || [];

  return (
    <Box display="flex" flexDirection="column" gap="12px" w="100%">
      {paramDefs.map((p) => {
        const val = params[p.key] ?? p.min;
        const displayLabel = p.labels ? p.labels[val] : val;

        return (
          <Box key={p.key} display="flex" alignItems="center" gap="16px">
            <Tooltip content={p.label} openDelay={200}>
              <Text
                color="#A3A3A3"
                fontSize="16px"
                fontWeight="500"
                minW="80px"
                textAlign="right"
                cursor="default"
                fontFamily="'Manrope', sans-serif"
              >
                {p.label}
              </Text>
            </Tooltip>
            <Box flex="1">
              <Slider.Root
                min={p.min}
                max={p.max}
                step={p.step}
                value={[val]}
                onValueChange={(details) =>
                  onParamChange(p.key, details.value[0])
                }
                size="sm"
              >
                <Slider.Control>
                  <Slider.Track h="4px" bg="#262626" borderRadius="2px">
                    <Slider.Range bg="#525252" />
                  </Slider.Track>
                  <Slider.Thumb
                    index={0}
                    w="16px"
                    h="16px"
                    bg="#FAFAFA"
                    borderRadius="8px"
                    border="none"
                    boxShadow="none"
                    _hover={{ transform: "scale(1.15)" }}
                  />
                </Slider.Control>
              </Slider.Root>
            </Box>
            <Text
              color="#A3A3A3"
              fontSize="16px"
              fontWeight="400"
              minW="80px"
              fontFamily="'Manrope', sans-serif"
            >
              {displayLabel}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}

export { STYLE_PARAMS, DEFAULT_PARAMS };
