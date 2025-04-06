import * as MediaLibrary from "expo-media-library";
import { Track } from "./types";

export const TRACKS_CACHE_KEY = "cached_audio_tracks";
export const CACHE_EXPIRY_DAYS = 7;

export const isValidAudioFile = (uri: string): boolean => {
  const invalidPatterns = [
    "NrvqLxhkCcloQ0GaAZZqjRjhYdAz21aLGRhbkbOsvxk2K0yM3x1no6UusW+ptb2q",
  ];
  return !!uri && !invalidPatterns.some((pattern) => uri.includes(pattern));
};

export const getBasicTrackInfo = (asset: MediaLibrary.Asset): Track => ({
  id: asset.id,
  filename: asset.filename || "Unknown",
  uri: asset.uri,
  duration: asset.duration,
  title: asset.filename?.replace(/\.[^/.]+$/, "") || "Unknown",
  artist: "Unknown Artist",
  lastModified: asset.modificationTime
    ? new Date(asset.modificationTime).getTime()
    : Date.now(),
});

export const formatDuration = (milliseconds?: number): string => {
  if (!milliseconds) return "--:--";
  const seconds = Math.floor(milliseconds / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};
