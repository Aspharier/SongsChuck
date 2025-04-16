export interface Track {
  id: string;
  filename: string;
  uri: string;
  duration: number;
  title: string;
  artist: string;
  albumTitle: string | null;
  artworkData: string | null;
  lastModified: number;
}

export interface GetTracksResult {
  duration: string;
  tracks: Track[];
  totalTracks: number;
}

export interface CachedTrackData extends GetTracksResult {
  cacheTimestamp: number;
  version: number;
}

export enum RepeatMode {
  Off = "OFF",
  Track = "TRACK",
  Queue = "QUEUE",
}
