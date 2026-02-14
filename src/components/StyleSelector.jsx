import { Box, Tooltip } from "@chakra-ui/react";
import {
  CirclesThree,
  SquaresFour,
  Hexagon,
  Sparkle,
  Barcode,
  SortAscending,
} from "@phosphor-icons/react";

const STYLES = [
  { id: "halftone", label: "Halftone", Icon: CirclesThree },
  { id: "dither", label: "Dither", Icon: SquaresFour },
  { id: "voronoi", label: "Voronoi", Icon: Hexagon },
  { id: "stipple", label: "Stipple", Icon: Sparkle },
  { id: "lineScan", label: "Line Scan", Icon: Barcode },
  { id: "pixelSort", label: "Pixel Sort", Icon: SortAscending },
];

export default function StyleSelector({ activeStyle, onStyleChange }) {
  return (
    <Box display="flex" gap="4px">
      {STYLES.map(({ id, label, Icon }) => (
        <Tooltip key={id} content={label} openDelay={300}>
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
              size={20}
              color={activeStyle === id ? "#FAFAFA" : "#A3A3A3"}
              weight={activeStyle === id ? "fill" : "regular"}
            />
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
}

export { STYLES };
