import { useEffect } from "react";
import { Box, Text } from "@chakra-ui/react";
import { Shuffle, ArrowsClockwise, UploadSimple } from "@phosphor-icons/react";
import UploadZone from "./components/UploadZone";
import PosterPreview from "./components/PosterPreview";
import StyleSelector from "./components/StyleSelector";
import ParameterControls, { DEFAULT_PARAMS } from "./components/ParameterControls";
import RatioSelector from "./components/RatioSelector";
import ExportButton from "./components/ExportButton";
import MetadataPositionPicker from "./components/MetadataPositionPicker";
import SimpleTooltip from "./components/SimpleTooltip";
import useImageProcessor from "./hooks/useImageProcessor";

function App() {
  const {
    canvasRef, sourceImage, fileName,
    style, setStyle, ratio, setRatio,
    colorMode, setColorMode,
    params, setParams, onParamChange,
    onImageLoad, processing, canvasSize,
    randomize, regenerate, exportPoster,
    metadataPos, setMetadataPos,
    posterMeta, palette,
  } = useImageProcessor();

  useEffect(() => {
    setParams(DEFAULT_PARAMS[style] || {});
  }, [style, setParams]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      h="100vh"
      bg="#0A0A0A"
      fontFamily="'Manrope', sans-serif"
      overflow="hidden"
    >
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px="24px"
        h="56px"
        borderBottom="1px solid #262626"
        flexShrink="0"
      >
        <Box display="flex" alignItems="center" gap="12px">
          <Text color="#FAFAFA" fontSize="16px" fontWeight="600" fontFamily="'Manrope', sans-serif">
            POSTER
          </Text>
          {posterMeta && (
            <>
              <Text color="#A3A3A3" fontSize="16px" fontWeight="400" fontFamily="'Manrope', sans-serif">
                {posterMeta.name}
              </Text>
              <Text color="#525252" fontSize="16px" fontWeight="400" fontFamily="'Manrope', sans-serif">
                {posterMeta.id}
              </Text>
            </>
          )}
        </Box>
        <Box display="flex" alignItems="center" gap="8px">
          {sourceImage && (
            <SimpleTooltip label="Upload new image">
              <Box
                as="button"
                w="40px" h="40px"
                display="flex" alignItems="center" justifyContent="center"
                borderRadius="8px" cursor="pointer"
                transition="all 0.15s" _hover={{ bg: "#1a1a1a" }}
                onClick={() => window.location.reload()}
              >
                <UploadSimple size={18} color="#A3A3A3" />
              </Box>
            </SimpleTooltip>
          )}
          <ExportButton style={style} onExport={exportPoster} disabled={!sourceImage} />
        </Box>
      </Box>

      {/* Preview */}
      <Box flex="1" display="flex" alignItems="center" justifyContent="center" position="relative" p="24px" minH="0">
        {!sourceImage ? (
          <UploadZone onImageLoad={onImageLoad} fileName={fileName} />
        ) : (
          <PosterPreview canvasRef={canvasRef} width={canvasSize.w} height={canvasSize.h} processing={processing} />
        )}
      </Box>

      {/* Palette preview below poster */}
      {sourceImage && palette.length > 0 && (
        <Box display="flex" justifyContent="center" gap="4px" pb="8px">
          {palette.map((c, i) => (
            <Box key={i} w="16px" h="16px" borderRadius="2px" bg={c} border="1px solid #262626" />
          ))}
        </Box>
      )}

      {/* Controls */}
      {sourceImage && (
        <Box
          borderTop="1px solid #262626"
          px="24px" py="16px"
          display="flex" flexDirection="column" gap="16px"
          flexShrink="0" bg="#0A0A0A"
        >
          {/* Row 1: Styles + actions */}
          <Box display="flex" alignItems="center" gap="16px" flexWrap="wrap">
            <StyleSelector activeStyle={style} onStyleChange={setStyle} />

            <Box w="1px" h="24px" bg="#262626" flexShrink="0" />

            <RatioSelector activeRatio={ratio} onRatioChange={setRatio} />

            <Box w="1px" h="24px" bg="#262626" flexShrink="0" />

            {/* Color Mode Toggle */}
            <SimpleTooltip label={colorMode === "grayscale" ? "Switch to sampled colors" : "Switch to grayscale"}>
              <Box
                as="button" h="40px" px="12px"
                display="flex" alignItems="center" gap="8px"
                borderRadius="8px" border="1px solid"
                borderColor={colorMode === "sampled" ? "#525252" : "transparent"}
                bg={colorMode === "sampled" ? "#1a1a1a" : "transparent"}
                cursor="pointer" transition="all 0.15s"
                _hover={{ bg: "#1a1a1a" }}
                onClick={() => setColorMode((m) => m === "grayscale" ? "sampled" : "grayscale")}
              >
                <Box
                  w="14px" h="14px" borderRadius="50%"
                  bg={colorMode === "sampled"
                    ? "linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1)"
                    : "linear-gradient(135deg, #666, #999, #ccc)"}
                />
                <Text
                  color={colorMode === "sampled" ? "#FAFAFA" : "#A3A3A3"}
                  fontSize="16px" fontWeight="500" fontFamily="'Manrope', sans-serif"
                >
                  {colorMode === "sampled" ? "Color" : "B&W"}
                </Text>
              </Box>
            </SimpleTooltip>

            <Box w="1px" h="24px" bg="#262626" flexShrink="0" />

            <MetadataPositionPicker position={metadataPos} onPositionChange={setMetadataPos} />

            <Box w="1px" h="24px" bg="#262626" flexShrink="0" />

            <SimpleTooltip label="Randomize parameters">
              <Box
                as="button" w="40px" h="40px"
                display="flex" alignItems="center" justifyContent="center"
                borderRadius="8px" cursor="pointer"
                transition="all 0.15s" _hover={{ bg: "#1a1a1a" }}
                onClick={randomize}
              >
                <Shuffle size={20} color="#A3A3A3" />
              </Box>
            </SimpleTooltip>

            <SimpleTooltip label="Regenerate">
              <Box
                as="button" w="40px" h="40px"
                display="flex" alignItems="center" justifyContent="center"
                borderRadius="8px" cursor="pointer"
                transition="all 0.15s" _hover={{ bg: "#1a1a1a" }}
                onClick={regenerate}
              >
                <ArrowsClockwise size={20} color="#A3A3A3" />
              </Box>
            </SimpleTooltip>
          </Box>

          {/* Row 2: Parameter sliders */}
          <Box maxW="600px">
            <ParameterControls style={style} params={params} onParamChange={onParamChange} />
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default App;
