import * as MediaLibrary from "expo-media-library";
import {
  MetadataPresets,
  getMetadata,
} from "@missingcore/react-native-metadata-retriever";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetTracksResult, Track } from "./types";
import {
  TRACKS_CACHE_KEY,
  CACHE_EXPIRY_DAYS,
  isValidAudioFile,
  getBasicTrackInfo,
} from "./utils";

const MAX_CACHED_TRACKS = 100;

export async function loadFromCache(): Promise<GetTracksResult | null> {
  try {
    const cachedData = await AsyncStorage.getItem(TRACKS_CACHE_KEY);
    if (!cachedData) return null;

    const parsedData: GetTracksResult & { cacheTimestamp?: number } =
      JSON.parse(cachedData);

    if (
      parsedData.cacheTimestamp &&
      Date.now() - parsedData.cacheTimestamp >
        CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    ) {
      return null;
    }

    return parsedData;
  } catch (error) {
    console.warn("Failed to load from cache:", error);
    return null;
  }
}

export async function saveToCache(data: GetTracksResult): Promise<void> {
  const tracksToCache =
    data.tracks.length > MAX_CACHED_TRACKS
      ? data.tracks.slice(0, MAX_CACHED_TRACKS)
      : data.tracks;
  try {
    const slimmedTracks = tracksToCache.map((track) => ({
      id: track.id,
      filename: track.filename,
      uri: track.uri,
      duration: track.duration,
      title: track.title,
      artist: track.artist,
      albumTitle: track.albumTitle,
      lastModified: track.lastModified,
    }));

    const cacheData = {
      duration: data.duration,
      tracks: slimmedTracks,
      totalTracks: data.tracks.length,
      cacheTimestamp: Date.now(),
    };

    await AsyncStorage.setItem(TRACKS_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error: unknown) {
    console.warn("Failed to save to cache:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as any).message === "string" &&
      (error as any).message.includes("SQLITE_FULL")
    ) {
      try {
        console.log("Storage full, attempting to clear space...");
        const keys = await AsyncStorage.getAllKeys();
        const keysToRemove = keys.filter(
          (key) =>
            key !== TRACKS_CACHE_KEY &&
            !key.includes("user_") &&
            !key.includes("settings_"),
        );

        if (keysToRemove.length > 0) {
          console.log(
            `Removing ${keysToRemove.length} cached items to free space`,
          );
          await AsyncStorage.multiRemove(keysToRemove);

          const minimalTracks = tracksToCache
            .slice(0, 50)
            .map((track: Track) => ({
              id: track.id,
              title: track.title || track.filename,
              artist: track.artist,
              uri: track.uri,
            }));

          const minimalCacheData = {
            duration: data.duration,
            tracks: minimalTracks,
            totalTracks: data.tracks.length,
            cacheTimestamp: Date.now(),
          };

          await AsyncStorage.setItem(
            TRACKS_CACHE_KEY,
            JSON.stringify(minimalCacheData),
          );
          console.log("Successfully saved reduced cache");
        } else {
          console.warn("No non-critical items to remove from cache");
        }
      } catch (secondError) {
        console.error("Failed to recover storage space:", secondError);
        try {
          await AsyncStorage.clear();
          console.log(
            "Cleared all AsyncStorage due to persistent storage issues",
          );
        } catch (finalError) {
          console.error("Failed to clear AsyncStorage:", finalError);
        }
      }
    }
  }
}

export async function getTracks(): Promise<GetTracksResult> {
  const start = performance.now();

  const cachedData = await loadFromCache();
  if (cachedData) {
    console.log("Using cached tracks data");
    return cachedData;
  }

  try {
    const { granted } = await MediaLibrary.requestPermissionsAsync();
    if (!granted) throw new Error("Media library permission not granted");

    const { totalCount } = await MediaLibrary.getAssetsAsync({
      mediaType: "audio",
      first: 0,
    });

    const batchSize = 100;
    let audioFiles: MediaLibrary.Asset[] = [];
    let currentIndex = 0;

    while (currentIndex < totalCount) {
      const batch = await MediaLibrary.getAssetsAsync({
        mediaType: "audio",
        first: batchSize,
        after: currentIndex.toString(),
      });
      audioFiles = [...audioFiles, ...batch.assets];
      currentIndex += batchSize;
    }

    console.log(
      `Found ${audioFiles.length} audio files in ${((performance.now() - start) / 1000).toFixed(4)}s.`,
    );

    const tracks = await Promise.all(
      audioFiles.map(async (asset) => {
        if (!isValidAudioFile(asset.uri)) {
          return getBasicTrackInfo(asset);
        }

        try {
          const metadata = await getMetadata(
            asset.uri,
            MetadataPresets.standardArtwork,
          );
          return {
            ...getBasicTrackInfo(asset),
            title:
              metadata.title ||
              asset.filename?.replace(/\.[^/.]+$/, "") ||
              "Unknown",
            artist: metadata.artist || "Unknown Artist",
            albumTitle: metadata.albumTitle || null,
            artworkData: metadata.artworkData || null,
          };
        } catch (error) {
          console.warn(`Metadata error for ${asset.filename}:`, error);
          return getBasicTrackInfo(asset);
        }
      }),
    );

    const uniqueTracks = tracks.filter(
      (track, index, self) =>
        index === self.findIndex((t) => t.id === track.id),
    ) as Track[];

    const result: GetTracksResult = {
      duration: ((performance.now() - start) / 1000).toFixed(4),
      tracks: uniqueTracks,
    };

    await saveToCache(result);

    return result;
  } catch (error) {
    console.error("Error in getTracks:", error);
    throw error;
  }
}

export async function clearTrackCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TRACKS_CACHE_KEY);
    console.log("Track cache cleared successfully");
  } catch (error) {
    console.error("Failed to clear track cache:", error);
    throw error;
  }
}

export async function clearAllCache(): Promise<void> {
  try {
    await AsyncStorage.clear();
    console.log("All app cache cleared successfully");
    return Promise.resolve();
  } catch (error) {
    console.error("Error clearing all cache:", error);
    throw error;
  }
}

export async function checkAndCleanupStorage(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();

    if (keys.length > 20) {
      console.log("Storage contains many items, performing preventive cleanup");

      const nonCriticalKeys = keys.filter(
        (key) =>
          !key.includes("user_") &&
          !key.includes("settings_") &&
          key !== TRACKS_CACHE_KEY,
      );

      if (nonCriticalKeys.length > 0) {
        await AsyncStorage.multiRemove(nonCriticalKeys);
        console.log(
          `Removed ${nonCriticalKeys.length} non-critical cache items`,
        );
      }
    }
  } catch (error) {
    console.warn("Storage check failed:", error);
  }
}
