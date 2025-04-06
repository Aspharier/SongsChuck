import React, { useState, useEffect } from "react";
import { Audio } from "expo-av";
import { Track } from "./types";

export const AudioContext = React.createContext<{
  currentTrack: Track | null;
  isPlaying: boolean;
  playbackInstance: Audio.Sound | null;
  playTrack: (track: Track) => Promise<void>;
  pauseTrack: () => Promise<void>;
  playNextTrack: () => Promise<void>;
  setPlaylist: (tracks: Track[]) => void;
}>({
  currentTrack: null,
  isPlaying: false,
  playbackInstance: null,
  playTrack: async () => {},
  pauseTrack: async () => {},
  playNextTrack: async () => {},
  setPlaylist: () => {},
});

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackInstance, setPlaybackInstance] = useState<Audio.Sound | null>(
    null,
  );
  const [playlist, setPlaylist] = useState<Track[]>([]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    return () => {
      if (playbackInstance) {
        playbackInstance.unloadAsync();
      }
    };
  }, []);

  const playTrack = async (track: Track) => {
    if (playbackInstance) {
      await playbackInstance.unloadAsync();
    }
    if (!track.uri) {
      console.log("Track URI is missing");
      return;
    }

    try {
      if (playbackInstance) {
        await playbackInstance.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        { shouldPlay: true },
        onPlaybackStatusUpdate,
      );
      setPlaybackInstance(sound);
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (error) {
      console.error("Failed to load audio", error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.didJustFinish) {
      playNextTrack();
    }
  };

  const pauseTrack = async () => {
    if (!playbackInstance) return;
    if (isPlaying) {
      await playbackInstance.pauseAsync();
      setIsPlaying(false);
    } else {
      await playbackInstance.playAsync();
      setIsPlaying(true);
    }
  };

  const playNextTrack = async () => {
    if (!currentTrack || playlist.length === 0) return;

    const currentIndex = playlist.findIndex(
      (track) => track.id === currentTrack.id,
    );
    if (currentIndex < playlist.length - 1) {
      await playTrack(playlist[currentIndex + 1]);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playbackInstance,
        playTrack,
        pauseTrack,
        playNextTrack,
        setPlaylist,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioPlayer = () => React.useContext(AudioContext);
