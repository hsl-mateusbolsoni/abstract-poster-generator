import { useCallback, useRef, useState } from "react";
import { Box, Text } from "@chakra-ui/react";
import { UploadSimple } from "@phosphor-icons/react";

const MAX_SIZE = 20 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export default function UploadZone({ onImageLoad, fileName }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);

  const processFile = useCallback(
    (file) => {
      setError(null);
      if (!ACCEPTED.includes(file.type)) {
        setError("Unsupported format. Use JPG, PNG, or WebP.");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("File exceeds 20MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => onImageLoad(img, file.name);
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    [onImageLoad]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  if (fileName) return null;

  return (
    <Box
      position="absolute"
      inset="0"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="10"
    >
      <Box
        border="2px dashed"
        borderColor={dragOver ? "#525252" : "#262626"}
        borderRadius="12px"
        p="48px"
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap="12px"
        cursor="pointer"
        transition="border-color 0.15s"
        _hover={{ borderColor: "#525252" }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <UploadSimple size={32} color="#A3A3A3" />
        <Text color="#A3A3A3" fontWeight="500" fontSize="16px">
          Drop image or click to upload
        </Text>
        {error && (
          <Text color="#A3A3A3" fontSize="16px">
            {error}
          </Text>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleChange}
          style={{ display: "none" }}
        />
      </Box>
    </Box>
  );
}
