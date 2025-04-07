import React, { useState, useEffect, useRef, useCallback } from "react";
import { Audio, AVPlaybackStatus } from "expo-av";
import { Track } from "./types";

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track) => Promise<void>;
  pauseTrack: () => Promise<void>;
  playNextTrack: () => Promise<void>;
  setPlaylist: (tracks: Track[]) => void;
  isLoading: boolean;
}

export const AudioContext = React.createContext<AudioContextType>({
  currentTrack: null,
  isPlaying: false,
  playTrack: async () => {},
  pauseTrack: async () => {},
  playNextTrack: async () => {},
  setPlaylist: () => {},
  isLoading: false,
});

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const playbackInstance = useRef<Audio.Sound | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    return () => {
      isMounted.current = false;
      unloadAudio();
    };
  }, []);

  const unloadAudio = useCallback(async () => {
    try {
      if (playbackInstance.current) {
        await playbackInstance.current.stopAsync();
        await playbackInstance.current.unloadAsync();
        playbackInstance.current = null;
      }
    } catch (error) {
      console.error("Unload error:", error);
    }
  }, []);

  const playNextTrack = useCallback(async () => {
    if (!currentTrack || playlist.length === 0 || isLoading) return;

    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex < playlist.length - 1) {
      await playTrack(playlist[currentIndex + 1]);
    } else {
      await unloadAudio();
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  }, [currentTrack, playlist, isLoading, unloadAudio]);

  const handlePlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        return;
      }

      if (status.didJustFinish && isMounted.current) {
        playNextTrack();
      }
    },
    [playNextTrack],
  );

  const playTrack = useCallback(
    async (track: Track) => {
      if (!isMounted.current || isLoading) return;

      setIsLoading(true);
      console.log(`Attempting to play: ${track.title}`);

      try {
        await unloadAudio();

        if (!track.uri) {
          throw new Error("Track URI is missing");
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: track.uri },
          { shouldPlay: true },
          handlePlaybackStatusUpdate,
        );

        playbackInstance.current = sound;
        if (isMounted.current) {
          setCurrentTrack(track);
          setIsPlaying(true);
          console.log(`Now playing: ${track.title}`);
        }
      } catch (error) {
        console.error("Playback error:", error);
        if (isMounted.current) {
          setCurrentTrack(null);
          setIsPlaying(false);
        }
        await unloadAudio();
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    },
    [isLoading, unloadAudio, handlePlaybackStatusUpdate],
  );

  const pauseTrack = useCallback(async () => {
    if (!playbackInstance.current || isLoading) return;

    try {
      if (isPlaying) {
        await playbackInstance.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await playbackInstance.current.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Pause error:", error);
    }
  }, [isPlaying, isLoading]);

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playTrack,
        pauseTrack,
        playNextTrack,
        setPlaylist,
        isLoading,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioPlayer = (): AudioContextType =>
  React.useContext(AudioContext);
