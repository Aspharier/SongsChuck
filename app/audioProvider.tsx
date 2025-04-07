import React, { useState, useEffect, useRef, useCallback } from "react";
import { Audio } from "expo-av";
import { Track } from "./types";

// Add repeat mode enum at the top
export enum RepeatMode {
  Off = "OFF",
  Track = "TRACK",
  Queue = "QUEUE",
}

export const AudioContext = React.createContext<{
  currentTrack: Track | null;
  isPlaying: boolean;
  playbackInstance: Audio.Sound | null;
  position: number;
  duration: number;
  repeatMode: RepeatMode;
  playTrack: (track: Track) => Promise<void>;
  pauseTrack: () => Promise<void>;
  playNextTrack: () => Promise<void>;
  playPreviousTrack: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setPlaylist: (tracks: Track[]) => void;
  setRepeatMode: (mode: RepeatMode) => void;
}>({
  currentTrack: null,
  isPlaying: false,
  playbackInstance: null,
  position: 0,
  duration: 0,
  repeatMode: RepeatMode.Off,
  playTrack: async () => {},
  pauseTrack: async () => {},
  playNextTrack: async () => {},
  playPreviousTrack: async () => {},
  seekTo: async () => {},
  setPlaylist: () => {},
  setRepeatMode: () => {},
});

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackInstance, setPlaybackInstance] = useState<Audio.Sound | null>(
    null,
  );
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(RepeatMode.Off);
  const isMounted = useRef(true);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const updateProgress = useCallback(async () => {
    if (!playbackInstance) return;

    try {
      const status = await playbackInstance.getStatusAsync();
      if (status.isLoaded) {
        setPosition(status.positionMillis);
        setDuration(status.durationMillis || 0);
      }
    } catch (error) {
      console.error("Progress update error:", error);
    }
  }, [playbackInstance]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    return () => {
      isMounted.current = false;
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (playbackInstance) {
        playbackInstance.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(updateProgress, 250);
    } else if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, updateProgress]);

  const handleTrackEnd = useCallback(async () => {
    if (repeatMode === RepeatMode.Track && currentTrack) {
      // Replay the current track
      await seekTo(0);
      await playbackInstance?.playAsync();
    } else if (repeatMode === RepeatMode.Queue) {
      // Move to next track or loop to first track
      const currentIndex = playlist.findIndex((t) => t.id === currentTrack?.id);
      if (currentIndex === playlist.length - 1) {
        await playTrack(playlist[0]);
      } else {
        await playNextTrack();
      }
    } else {
      // Default behavior (RepeatMode.Off)
      await playNextTrack();
    }
  }, [
    currentTrack,
    playlist,
    repeatMode,
    playTrack,
    playNextTrack,
    seekTo,
    playbackInstance,
  ]);

  const playTrack = useCallback(
    async (track: Track) => {
      if (!isMounted.current) return;

      try {
        // Clear any existing interval
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }

        // Unload previous track if exists
        if (playbackInstance) {
          await playbackInstance.unloadAsync();
        }

        if (!track.uri) {
          console.log("Track URI is missing");
          return;
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: track.uri },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded && status.didJustFinish) {
              handleTrackEnd();
            }
          },
        );

        // Get initial duration
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setDuration(status.durationMillis || 0);
          setPosition(status.positionMillis);
        }

        setPlaybackInstance(sound);
        setCurrentTrack(track);
        setIsPlaying(true);
      } catch (error) {
        console.error("Failed to load audio", error);
      }
    },
    [playbackInstance, handleTrackEnd],
  );

  const pauseTrack = useCallback(async () => {
    if (!playbackInstance) return;

    try {
      if (isPlaying) {
        await playbackInstance.pauseAsync();
        setIsPlaying(false);
      } else {
        await playbackInstance.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Pause error:", error);
    }
  }, [playbackInstance, isPlaying]);

  const seekTo = useCallback(
    async (position: number) => {
      if (!playbackInstance) return;

      try {
        await playbackInstance.setPositionAsync(position);
        setPosition(position);
      } catch (error) {
        console.error("Seek error:", error);
      }
    },
    [playbackInstance],
  );

  const playNextTrack = useCallback(async () => {
    if (!currentTrack || playlist.length === 0) return;

    const currentIndex = playlist.findIndex(
      (track) => track.id === currentTrack.id,
    );
    if (currentIndex < playlist.length - 1) {
      await playTrack(playlist[currentIndex + 1]);
    } else {
      await playbackInstance?.stopAsync();
      setCurrentTrack(null);
      setIsPlaying(false);
      setPosition(0);
    }
  }, [currentTrack, playlist, playTrack]);

  const playPreviousTrack = useCallback(async () => {
    if (!currentTrack || playlist.length === 0) return;

    const currentIndex = playlist.findIndex(
      (track) => track.id === currentTrack.id,
    );

    try {
      const status = await playbackInstance?.getStatusAsync();
      if (status && status.isLoaded && status.positionMillis < 3000) {
        if (currentIndex > 0) {
          await playTrack(playlist[currentIndex - 1]);
        }
      } else {
        await seekTo(0);
        await playbackInstance?.playAsync();
      }
    } catch (error) {
      console.error("Previous track error:", error);
      if (currentIndex > 0) {
        await playTrack(playlist[currentIndex - 1]);
      }
    }
  }, [currentTrack, playlist, playTrack, playbackInstance, seekTo]);

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playbackInstance,
        position,
        duration,
        repeatMode,
        playTrack,
        pauseTrack,
        playNextTrack,
        playPreviousTrack,
        seekTo,
        setPlaylist,
        setRepeatMode,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioPlayer = () => React.useContext(AudioContext);
