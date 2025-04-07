import { View, TouchableOpacity, StyleSheet, ViewProps } from "react-native";
import { Image } from "expo-image";
import React from "react";
import { useAudioPlayer } from "./audioProvider";
import { FontAwesome6 } from "@expo/vector-icons";
import { MovingText } from "./movingText";
import { useRouter } from "expo-router";

const unknownTrackImageUri = "../assets/images/sample3.png";

export const PlayPauseButton = ({ iconSize = 24 }: { iconSize?: number }) => {
  const { isPlaying, pauseTrack } = useAudioPlayer();

  return (
    <TouchableOpacity onPress={pauseTrack}>
      <FontAwesome6
        name={isPlaying ? "pause" : "play"}
        size={iconSize}
        color="#d8f3dc"
      />
    </TouchableOpacity>
  );
};

export const SkipToNextButton = ({ iconSize = 24 }: { iconSize?: number }) => {
  const { playNextTrack } = useAudioPlayer();

  return (
    <TouchableOpacity onPress={playNextTrack}>
      <FontAwesome6 name="forward" size={iconSize} color="#d8f3dc" />
    </TouchableOpacity>
  );
};

export const FloatingPlayer = ({ style }: ViewProps) => {
  const router = useRouter();
  const { currentTrack } = useAudioPlayer();
  if (!currentTrack) {
    return null;
  }

  const handlePress = () => {
    router.navigate("/player");
  };
  return (
    <TouchableOpacity onPress={handlePress} style={[styles.container, style]}>
      <Image
        source={{
          uri: currentTrack.artworkData ?? unknownTrackImageUri,
        }}
        style={styles.trackArtworkImage}
      />
      <View style={styles.trackTitleContainer}>
        <MovingText
          style={styles.trackTitle}
          animationThreshold={25}
          text={currentTrack.title ?? ""}
        />
      </View>
      <View style={styles.trackControlsContainer}>
        <PlayPauseButton iconSize={24} />
        <SkipToNextButton iconSize={24} />
      </View>
    </TouchableOpacity>
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
    color: "#52b788",
    marginBottom: 5,
  },
  artistName: {
    fontSize: 14,
    color: "#d8f3dc",
  },
  trackControlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 20,
    marginLeft: 16,
  },
});
