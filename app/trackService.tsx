import * as MediaLibrary from "expo-media-library";
import {
  MetadataPresets,
  getMetadata,
} from "@missingcore/react-native-metadata-retriever";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetTracksResult, Track, CachedTrackData } from "./types";
import {
  TRACKS_CACHE_KEY,
  CACHE_EXPIRY_DAYS,
  MAX_CACHED_TRACKS,
  isValidAudioFile,
  getBasicTrackInfo,
} from "./utils";
import { decode as base64Decode, encode as base64Encode } from "base-64";

const CACHE_VERSION = 2;

function artworkToCacheFormat(artworkData: string | null): string | null {
  if (!artworkData) return null;
  return base64Encode(artworkData);
}
function artworkFromCacheFormat(cachedArtwork: string | null): string | null {
  if (!cachedArtwork) return null;
  return base64Decode(cachedArtwork);
}

export async function loadFromCache(): Promise<GetTracksResult | null> {
  try {
    const cachedData = await AsyncStorage.getItem(TRACKS_CACHE_KEY);
    if (!cachedData) return null;

    const parsedData: CachedTrackData = JSON.parse(cachedData);

    if (parsedData.version !== CACHE_VERSION) {
      console.log("Cache version mismatch, ignoring old cache");
      return null;
    }

    if (
      Date.now() - parsedData.cacheTimestamp >
      CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    ) {
      return null;
    }

    const tracksWithArtwork = parsedData.tracks.map((track) => ({
      ...track,
      artworkData: artworkFromCacheFormat(track.artworkData as string | null),
    }));

    return {
      ...parsedData,
      tracks: tracksWithArtwork,
    };
  } catch (error) {
    console.warn("Failed to load from cache:", error);
    return null;
  }
}

export async function saveToCache(data: GetTracksResult): Promise<void> {
  try {
    const tracksToCache = data.tracks
      .slice(0, MAX_CACHED_TRACKS)
      .map((track) => ({
        ...track,
        artworkData: artworkToCacheFormat(track.artworkData || null),
      }));

    const cacheData: CachedTrackData = {
      ...data,
      tracks: tracksToCache,
      cacheTimestamp: Date.now(),
      version: CACHE_VERSION,
    };

    await AsyncStorage.setItem(TRACKS_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error: unknown) {
    console.warn("Failed to save to cache:", error);
    await handleCacheStorageError(error, data);
  }
}

async function handleCacheStorageError(
  error: unknown,
  data: GetTracksResult,
): Promise<void> {
  if (isStorageFullError(error)) {
    console.log("Storage full, attempting to clear space...");
    await clearNonEssentialCache();

    const minimalTracks = data.tracks.slice(0, 50).map((track) => ({
      id: track.id,
      title: track.title || track.filename,
      artist: track.artist,
      uri: track.uri,
      duration: track.duration,
      artworkData: artworkToCacheFormat(track.artworkData || null),
    }));

    try {
      await AsyncStorage.setItem(
        TRACKS_CACHE_KEY,
        JSON.stringify({
          duration: data.duration,
          tracks: minimalTracks,
          totalTracks: data.tracks.length,
          cacheTimestamp: Date.now(),
          version: CACHE_VERSION,
        }),
      );
      console.log("Successfully saved reduced cache");
    } catch (secondError) {
      console.error("Failed to save reduced cache:", secondError);
    }
  }
}

function isStorageFullError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as any).message === "string" &&
    (error as any).message.includes("SQLITE_FULL")
  );
}

export async function getTracks(): Promise<GetTracksResult> {
  const start = performance.now();

  const cachedData = await loadFromCache();
  if (cachedData) {
    console.log(
      `Using cached tracks data (${cachedData.tracks.length} tracks)`,
    );
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
        const basicInfo = getBasicTrackInfo(asset);

        if (!isValidAudioFile(asset.uri)) {
          return basicInfo;
        }

        try {
          const metadata = await getMetadata(
            asset.uri,
            MetadataPresets.standardArtwork,
          );
          return {
            ...basicInfo,
            title: metadata.title || basicInfo.title,
            artist: metadata.artist || basicInfo.artist,
            albumTitle: metadata.albumTitle || null,
            artworkData: metadata.artworkData || null,
          };
        } catch (error) {
          console.warn(`Metadata error for ${asset.filename}:`, error);
          return basicInfo;
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
      totalTracks: uniqueTracks.length,
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

export async function clearNonEssentialCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const nonCriticalKeys = keys.filter(
      (key) =>
        !key.includes("user_") &&
        !key.includes("settings_") &&
        key !== TRACKS_CACHE_KEY,
    );

    if (nonCriticalKeys.length > 0) {
      await AsyncStorage.multiRemove(nonCriticalKeys);
      console.log(`Removed ${nonCriticalKeys.length} non-critical cache items`);
    }
  } catch (error) {
    console.warn("Non-essential cache cleanup failed:", error);
  }
}

export async function clearAllCache(): Promise<void> {
  try {
    await AsyncStorage.clear();
    console.log("All app cache cleared successfully");
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
      await clearNonEssentialCache();
    }
  } catch (error) {
    console.warn("Storage check failed:", error);
  }
}
