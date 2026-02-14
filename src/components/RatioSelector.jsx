import { Box, Text, Tooltip } from "@chakra-ui/react";

const RATIOS = [
  { id: "2:3", label: "2:3", value: 2 / 3 },
  { id: "4:5", label: "4:5", value: 4 / 5 },
  { id: "1:1", label: "1:1", value: 1 },
  { id: "A4", label: "A4", value: 1 / 1.414 },
];

export default function RatioSelector({ activeRatio, onRatioChange }) {
  return (
    <Box display="flex" gap="4px">
      {RATIOS.map(({ id, label }) => (
        <Tooltip key={id} content={`Ratio ${label}`} openDelay={300}>
          <Box
            as="button"
            h="40px"
            px="12px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="8px"
            border="1px solid"
            borderColor={activeRatio === id ? "#525252" : "transparent"}
            bg={activeRatio === id ? "#1a1a1a" : "transparent"}
            cursor="pointer"
            transition="all 0.15s"
            _hover={{ bg: "#1a1a1a" }}
            onClick={() => onRatioChange(id)}
          >
            <Text
              color={activeRatio === id ? "#FAFAFA" : "#A3A3A3"}
              fontSize="16px"
              fontWeight="500"
              fontFamily="'Manrope', sans-serif"
            >
              {label}
            </Text>
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
}

export { RATIOS };
