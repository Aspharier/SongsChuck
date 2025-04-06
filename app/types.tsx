export interface Track {
  id: string;
  filename: string;
  uri: string;
  duration?: number;
  title?: string;
  artist?: string;
  albumTitle?: string;
  artworkData?: string;
  lastModified?: number;
  artwork?: any;
}

export interface GetTracksResult {
  duration: string;
  tracks: Track[];
}
