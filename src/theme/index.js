import { createSystem, defineConfig, defaultConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'Manrope', sans-serif" },
        body: { value: "'Manrope', sans-serif" },
      },
      colors: {
        bg: { value: "#0A0A0A" },
        surface: { value: "#141414" },
        border: { value: "#262626" },
        textPrimary: { value: "#FAFAFA" },
        textSecondary: { value: "#A3A3A3" },
        accent: { value: "#525252" },
      },
    },
  },
  globalCss: {
    "html, body": {
      bg: "#0A0A0A",
      color: "#FAFAFA",
      fontFamily: "'Manrope', sans-serif",
      fontSize: "16px",
      lineHeight: "1.5",
      margin: 0,
      padding: 0,
      minHeight: "100vh",
      overflowX: "hidden",
    },
    "*": {
      borderColor: "#262626",
    },
    "::-webkit-scrollbar": {
      width: "6px",
    },
    "::-webkit-scrollbar-track": {
      background: "#0A0A0A",
    },
    "::-webkit-scrollbar-thumb": {
      background: "#262626",
      borderRadius: "3px",
    },
  },
});

export const system = createSystem(defaultConfig, config);
