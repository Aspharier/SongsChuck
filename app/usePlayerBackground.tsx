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
  average?: string;
  muted?: string;
  darkMuted?: string;
  lightMuted?: string;
  darkVibrant?: string;
  lightVibrant?: string;
  background?: string;
  primary?: string;
  secondary?: string;
  detail?: string;
};

const fallbackColors: PlayerBackgroundColors = {
  background: themeColors.background,
  primary: themeColors.primary,
  secondary: themeColors.textMuted || themeColors.text,
  detail: themeColors.text,
};

export const usePlayerBackground = (imageUrl: string) => {
  const [imageColors, setImageColors] =
    useState<PlayerBackgroundColors>(fallbackColors);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    if (isMounted) {
      setImageColors(fallbackColors);
    }

    if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim() === "") {
      setIsLoading(false);
      return;
    }

    const fetchColors = async () => {
      try {
        const config = {
          fallback: themeColors.background,
          cache: true,
          key: imageUrl,
        };

        const result = (await getColors(imageUrl, config)) as ImageColorsResult;

        if (!isMounted) return;

        if (result.platform === "android") {
          const finalColors: PlayerBackgroundColors = {
            background:
              result.dominant || result.average || fallbackColors.background,
            primary:
              result.vibrant || result.darkVibrant || fallbackColors.primary,
            secondary:
              result.muted || result.lightMuted || fallbackColors.secondary,
            detail:
              result.darkMuted || result.lightVibrant || fallbackColors.detail,
          };
          setImageColors(finalColors);
        } else {
          const finalColors: PlayerBackgroundColors = {
            background: result.background || fallbackColors.background,
            primary: result.primary || fallbackColors.primary,
            secondary: result.secondary || fallbackColors.secondary,
            detail: result.detail || fallbackColors.detail,
          };
          setImageColors(finalColors);
        }
      } catch (error) {
        console.error("Error extracting colors:", error);

        if (error instanceof Error) {
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const timerId = setTimeout(() => {
      fetchColors();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [imageUrl]);

  return { imageColors, isLoading };
};
