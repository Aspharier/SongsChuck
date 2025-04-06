import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewProps,
} from "react-native";
import { Image } from "expo-image";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "./audioProvider";
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";

const unknownTrackImageUri = "../assets/images/sample3.png";

export const PlayPauseButton = ({ iconSize = 24 }: { iconSize?: number }) => {
  const { isPlaying, pauseTrack } = useAudioPlayer();

  return (
    <TouchableOpacity onPress={pauseTrack}>
      <FontAwesome
        name={isPlaying ? "pause" : "play"}
        size={iconSize}
        color="white"
      />
    </TouchableOpacity>
  );
};

export const SkipToNextButton = ({ iconSize = 24 }: { iconSize?: number }) => {
  const { playNextTrack } = useAudioPlayer();

  return (
    <TouchableOpacity onPress={playNextTrack}>
      <FontAwesome6 name="forward" size={iconSize} color="white" />
    </TouchableOpacity>
  );
};

export const FloatingPlayer = ({ style }: ViewProps) => {
  const { currentTrack } = useAudioPlayer();
  if (!currentTrack) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{
          uri: currentTrack.artworkData ?? unknownTrackImageUri,
        }}
        style={styles.trackArtworkImage}
      />
      <View style={styles.trackTitleContainer}>
        <Text style={styles.trackTitle}>{currentTrack.title}</Text>
        {currentTrack.artist && (
          <Text style={styles.artistName}>{currentTrack.artist}</Text>
        )}
      </View>
      <View style={styles.trackControlsContainer}>
        <PlayPauseButton iconSize={24} />
        <SkipToNextButton iconSize={24} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  trackArtworkImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  trackTitleContainer: {
    flex: 1,
    overflow: "hidden",
    marginLeft: 10,
    paddingLeft: 10,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 5,
  },
  artistName: {
    fontSize: 14,
    color: "#666",
  },
  trackControlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 20,
    marginLeft: 16,
  },
});
