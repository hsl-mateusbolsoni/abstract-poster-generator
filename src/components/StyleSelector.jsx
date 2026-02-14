import { Box } from "@chakra-ui/react";
import {
  CirclesThree,
  SquaresFour,
  Hexagon,
  Sparkle,
  Barcode,
  SortAscending,
  Square,
  Mountains,
  CirclesFour,
  TextT,
  Triangle,
  ArrowsOutLineHorizontal,
  Stack,
  StackSimple,
} from "@phosphor-icons/react";
import SimpleTooltip from "./SimpleTooltip";

const STYLES = [
  { id: "halftone", label: "Halftone", Icon: CirclesThree },
  { id: "dither", label: "Dither", Icon: SquaresFour },
  { id: "voronoi", label: "Voronoi", Icon: Hexagon },
  { id: "stipple", label: "Stipple", Icon: Sparkle },
  { id: "lineScan", label: "Line Scan", Icon: Barcode },
  { id: "pixelSort", label: "Pixel Sort", Icon: SortAscending },
  { id: "colorBlocks", label: "Color Blocks", Icon: Square },
  { id: "topographic", label: "Topographic", Icon: Mountains },
  { id: "concentric", label: "Concentric", Icon: CirclesFour },
  { id: "ascii", label: "ASCII", Icon: TextT },
  { id: "triangleMesh", label: "Triangle Mesh", Icon: Triangle },
  { id: "slitScan", label: "Slit Scan", Icon: ArrowsOutLineHorizontal },
  { id: "chromatic", label: "Chromatic", Icon: Stack },
  { id: "depthContour", label: "Depth Contour", Icon: StackSimple },
];

export default function StyleSelector({ activeStyle, onStyleChange }) {
  return (
    <Box display="flex" gap="2px" flexWrap="wrap" maxW="336px">
      {STYLES.map(({ id, label, Icon }) => (
        <SimpleTooltip key={id} label={label}>
          <Box
            as="button"
            w="40px"
            h="40px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="8px"
            border="1px solid"
            borderColor={activeStyle === id ? "#525252" : "transparent"}
            bg={activeStyle === id ? "#1a1a1a" : "transparent"}
            cursor="pointer"
            transition="all 0.15s"
            _hover={{ bg: "#1a1a1a" }}
            onClick={() => onStyleChange(id)}
          >
            <Icon
              size={18}
              color={activeStyle === id ? "#FAFAFA" : "#A3A3A3"}
              weight={activeStyle === id ? "fill" : "regular"}
            />
          </Box>
        </SimpleTooltip>
      ))}
    </Box>
  );
}

export { STYLES };
