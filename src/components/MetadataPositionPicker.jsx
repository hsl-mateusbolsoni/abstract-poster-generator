import { Box, Text } from "@chakra-ui/react";
import SimpleTooltip from "./SimpleTooltip";

const POSITIONS = [
  { id: "bottom", label: "Bottom" },
  { id: "left", label: "Left" },
  { id: "right", label: "Right" },
  { id: "top", label: "Top" },
];

export default function MetadataPositionPicker({ position, onPositionChange }) {
  return (
    <Box display="flex" gap="4px">
      {POSITIONS.map(({ id, label }) => (
        <SimpleTooltip key={id} label={`Metadata: ${label}`}>
          <Box
            as="button"
            h="40px"
            px="10px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="8px"
            border="1px solid"
            borderColor={position === id ? "#525252" : "transparent"}
            bg={position === id ? "#1a1a1a" : "transparent"}
            cursor="pointer"
            transition="all 0.15s"
            _hover={{ bg: "#1a1a1a" }}
            onClick={() => onPositionChange(id)}
          >
            <Text
              color={position === id ? "#FAFAFA" : "#A3A3A3"}
              fontSize="16px"
              fontWeight="500"
              fontFamily="'Manrope', sans-serif"
            >
              {label}
            </Text>
          </Box>
        </SimpleTooltip>
      ))}
    </Box>
  );
}
