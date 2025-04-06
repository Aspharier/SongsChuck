import { useState, useEffect } from "react";
import * as MediaLibrary from "expo-media-library";

export function useMediaLibraryPermissions() {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions({
    granularPermissions: ["audio"],
  });
  const [hasPermissions, setHasPermissions] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      if (permissionResponse?.status !== "granted") {
        const { canAskAgain, status } = await requestPermission();
        if (canAskAgain || status === "denied") return;
      } else {
        setHasPermissions(true);
      }
    };
    checkPermissions();
  }, [permissionResponse?.status, requestPermission]);

  return { hasPermissions, permissionResponse, requestPermission };
}
