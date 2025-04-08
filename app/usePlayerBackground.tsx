import { useEffect, useState } from "react";
import { getColors } from "react-native-image-colors";
import { colors as themeColors } from "./token";

export type PlayerBackgroundColors = {
  background: string;
  primary: string;
  secondary: string;
  detail: string;
};

type ImageColorsResult = {
  platform: "android" | "ios" | "web";
  dominant?: string;
  vibrant?: string;
  muted?: string;
  darkMuted?: string;
  background?: string;
  primary?: string;
  secondary?: string;
  detail?: string;
};

export const usePlayerBackground = (imageUrl: string) => {
  const [imageColors, setImageColors] = useState<PlayerBackgroundColors | null>(
    null,
  );

  const fallbackColors: PlayerBackgroundColors = {
    background: themeColors.background,
    primary: themeColors.primary,
    secondary: themeColors.textMuted || themeColors.text,
    detail: themeColors.text,
  };

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const result = (await getColors(imageUrl, {
          fallback: themeColors.background,
          cache: true,
          key: imageUrl,
        })) as ImageColorsResult;

        const finalColors: PlayerBackgroundColors = {
          background:
            result.platform === "android"
              ? result.dominant || fallbackColors.background
              : result.background || fallbackColors.background,
          primary:
            result.platform === "android"
              ? result.vibrant || fallbackColors.primary
              : result.primary || fallbackColors.primary,
          secondary:
            result.platform === "android"
              ? result.muted || fallbackColors.secondary
              : result.secondary || fallbackColors.secondary,
          detail:
            result.platform === "android"
              ? result.darkMuted || fallbackColors.detail
              : result.detail || fallbackColors.detail,
        };

        setImageColors(finalColors);
      } catch (error) {
        console.error("Error extracting colors:", error);
        setImageColors(fallbackColors);
      }
    };

    fetchColors();
  }, [imageUrl]);

  return { imageColors };
};
