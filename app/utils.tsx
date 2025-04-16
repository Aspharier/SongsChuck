import * as MediaLibrary from "expo-media-library";
import { Track } from "./types";

export const TRACKS_CACHE_KEY = "cached_audio_tracks";
export const CACHE_EXPIRY_DAYS = 7;
export const MAX_CACHED_TRACKS = 100;

export const isValidAudioFile = (uri: string): boolean => {
  const invalidPatterns = [
    "NrvqLxhkCcloQ0GaAZZqjRjhYdAz21aLGRhbkbOsvxk2K0yM3x1no6UusW+ptb2q",
    "content://",
    "raw:/",
  ];
  return !!uri && !invalidPatterns.some((pattern) => uri.includes(pattern));
};

export const getBasicTrackInfo = (asset: MediaLibrary.Asset): Track => ({
  id: asset.id,
  filename: asset.filename || "Unknown",
  uri: asset.uri,
  duration: asset.duration || 0,
  title: asset.filename?.replace(/\.[^/.]+$/, "") || "Unknown",
  artist: "Unknown Artist",
  albumTitle: null,
  artworkData: null,
  lastModified: asset.modificationTime
    ? new Date(asset.modificationTime).getTime()
    : Date.now(),
});

export const formatDuration = (milliseconds?: number): string => {
  if (!milliseconds || isNaN(milliseconds)) return "--:--";
  const seconds = Math.floor(milliseconds / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

export const AUDIO_EXTENSIONS = [
  "mp3",
  "wav",
  "ogg",
  "m4a",
  "flac",
  "aac",
  "wma",
];

export const hasAudioExtension = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return AUDIO_EXTENSIONS.includes(ext);
};
