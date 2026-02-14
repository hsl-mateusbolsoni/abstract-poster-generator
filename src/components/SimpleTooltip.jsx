import { Tooltip, Portal } from "@chakra-ui/react";

export default function SimpleTooltip({ label, children, openDelay = 300 }) {
  return (
    <Tooltip.Root openDelay={openDelay}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content
            bg="#262626"
            color="#FAFAFA"
            fontSize="16px"
            fontFamily="'Manrope', sans-serif"
            px="12px"
            py="6px"
            borderRadius="8px"
            border="1px solid #363636"
          >
            {label}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}
