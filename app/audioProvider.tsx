import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
} from "react";
import { Audio } from "expo-av";
import { Track } from "./types";

export enum RepeatMode {
  Off = "OFF",
  Track = "TRACK",
  Queue = "QUEUE",
}

export const AudioContext = createContext<{
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

  type PlayTrackType = (track: Track) => Promise<void>;
  type PlayNextTrackType = () => Promise<void>;
  type SeekToType = (position: number) => Promise<void>;
  type HandleTrackEndType = () => Promise<void>;

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
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (playbackInstance) {
        playbackInstance.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(updateProgress, 250);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying, updateProgress]);

  const seekTo: SeekToType = useCallback(
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

  const playTrackRef = useRef<PlayTrackType | null>(null);
  const playNextTrackRef = useRef<PlayNextTrackType | null>(null);

  const handleTrackEnd: HandleTrackEndType = useCallback(async () => {
    if (repeatMode === RepeatMode.Track && currentTrack) {
      await seekTo(0);
      await playbackInstance?.playAsync();
    } else if (repeatMode === RepeatMode.Queue) {
      const currentIndex = playlist.findIndex((t) => t.id === currentTrack?.id);
      if (currentIndex === playlist.length - 1) {
        if (playTrackRef.current && playlist.length > 0) {
          await playTrackRef.current(playlist[0]);
        }
      } else {
        if (playNextTrackRef.current) {
          await playNextTrackRef.current();
        }
      }
    } else {
      if (playNextTrackRef.current) {
        await playNextTrackRef.current();
      }
    }
  }, [currentTrack, playlist, repeatMode, seekTo, playbackInstance]);

  const playTrack: PlayTrackType = useCallback(
    async (track: Track) => {
      if (!isMounted.current) return;

      try {
        if (playbackInstance) {
          await playbackInstance.stopAsync();
          await playbackInstance.unloadAsync();
        }

        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }

        if (!track.uri) {
          console.log("Track URI is missing");
          return;
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: track.uri },
          { shouldPlay: true },
          (status) => {
            if (
              "isLoaded" in status &&
              status.isLoaded &&
              status.didJustFinish
            ) {
              handleTrackEnd();
            }
          },
        );

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

  useEffect(() => {
    playTrackRef.current = playTrack;
  }, [playTrack]);

  const playNextTrack: PlayNextTrackType = useCallback(async () => {
    if (!currentTrack || playlist.length === 0) return;

    const currentIndex = playlist.findIndex(
      (track) => track.id === currentTrack.id,
    );
    if (currentIndex < playlist.length - 1) {
      await playTrack(playlist[currentIndex + 1]);
    } else {
      if (playbackInstance) {
        await playbackInstance.stopAsync();
        await playbackInstance.unloadAsync();
      }
      setCurrentTrack(null);
      setIsPlaying(false);
      setPosition(0);
    }
  }, [currentTrack, playlist, playTrack, playbackInstance]);

  useEffect(() => {
    playNextTrackRef.current = playNextTrack;
  }, [playNextTrack]);

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
