import { useState, useRef, useEffect } from "react";
import { Box, Text } from "@chakra-ui/react";
import { Export, CaretDown } from "@phosphor-icons/react";
import SimpleTooltip from "./SimpleTooltip";

const VECTOR_STYLES = ["halftone", "voronoi", "lineScan", "stipple"];

export default function ExportButton({ style, onExport, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const hasSvg = VECTOR_STYLES.includes(style);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <Box position="relative" ref={ref}>
      <SimpleTooltip label="Export poster">
        <Box
          as="button"
          h="40px"
          px="16px"
          display="flex"
          alignItems="center"
          gap="8px"
          borderRadius="8px"
          bg="#141414"
          border="1px solid #262626"
          cursor={disabled ? "not-allowed" : "pointer"}
          opacity={disabled ? 0.4 : 1}
          transition="all 0.15s"
          _hover={disabled ? {} : { borderColor: "#525252" }}
          onClick={() => !disabled && setOpen(!open)}
        >
          <Export size={18} color="#FAFAFA" />
          <Text
            color="#FAFAFA"
            fontSize="16px"
            fontWeight="500"
            fontFamily="'Manrope', sans-serif"
          >
            Export
          </Text>
          <CaretDown size={14} color="#A3A3A3" />
        </Box>
      </SimpleTooltip>
      {open && (
        <Box
          position="absolute"
          top="48px"
          right="0"
          bg="#141414"
          border="1px solid #262626"
          borderRadius="8px"
          overflow="hidden"
          zIndex="100"
          minW="160px"
        >
          <Box
            as="button"
            display="block"
            w="100%"
            px="16px"
            py="10px"
            textAlign="left"
            cursor="pointer"
            _hover={{ bg: "#1a1a1a" }}
            onClick={() => {
              onExport("png");
              setOpen(false);
            }}
          >
            <Text
              color="#FAFAFA"
              fontSize="16px"
              fontWeight="400"
              fontFamily="'Manrope', sans-serif"
            >
              PNG (4K)
            </Text>
          </Box>
          {hasSvg && (
            <Box
              as="button"
              display="block"
              w="100%"
              px="16px"
              py="10px"
              textAlign="left"
              cursor="pointer"
              _hover={{ bg: "#1a1a1a" }}
              onClick={() => {
                onExport("svg");
                setOpen(false);
              }}
            >
              <Text
                color="#FAFAFA"
                fontSize="16px"
                fontWeight="400"
                fontFamily="'Manrope', sans-serif"
              >
                SVG
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
