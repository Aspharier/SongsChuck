import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAudioPlayer } from "./audioProvider";
import { Image } from "expo-image";
import { MovingText } from "./movingText";
import { PlayerControls } from "./playerControls";
import { PlayerProgressBar } from "./playerProgressBar";
import { PlayerRepeatToggle } from "./playerRepeatToggle";

const unknownTrackImageUri = "../assets/images/sample3.png";

const PlayScreen = () => {
  const { top, bottom } = useSafeAreaInsets();
  const { currentTrack } = useAudioPlayer();

  if (!currentTrack) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DismissPlayerSymbol />

      <View
        style={[
          styles.contentContainer,
          { marginTop: top + 40, marginBottom: bottom },
        ]}
      >
        {/* Album Artwork */}
        <View style={styles.artworkContainer}>
          <Image
            source={{ uri: currentTrack.artworkData ?? unknownTrackImageUri }}
            style={styles.artworkImage}
          />
        </View>

        {/* Track Info */}
        <View style={styles.trackInfoContainer}>
          <View style={styles.trackTextContainer}>
            <View style={styles.trackTitleContainer}>
              <MovingText
                text={currentTrack.title ?? ""}
                animationThreshold={30}
                style={styles.trackTitleText}
              />
            </View>
            {currentTrack.artist && (
              <Text numberOfLines={1} style={styles.trackArtistText}>
                {currentTrack.artist}
              </Text>
            )}
          </View>

          {/* Progress Bar */}
          <PlayerProgressBar style={styles.progressBar} />

          {/* Controls */}
          <PlayerControls style={styles.controls} />

          {/* Repeat Toggle */}
          <View style={styles.repeatContainer}>
            <PlayerRepeatToggle size={28} />
          </View>
        </View>
      </View>
    </View>
  );
};

const DismissPlayerSymbol = () => {
  return (
    <View style={styles.dismissSymbolContainer}>
      <View style={styles.dismissSymbol} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  contentContainer: {
    flex: 1,
  },
  dismissSymbolContainer: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  dismissSymbol: {
    width: 50,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  artworkContainer: {
    flex: 0.6,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  artworkImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
  },
  trackInfoContainer: {
    flex: 0.4,
    justifyContent: "flex-end",
    paddingBottom: 20,
  },
  trackTextContainer: {
    marginBottom: 30,
  },
  trackTitleContainer: {
    marginBottom: 8,
  },
  trackTitleText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  trackArtistText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
  },
  progressBar: {
    marginBottom: 30,
  },
  controls: {
    marginBottom: 20,
  },
  repeatContainer: {
    alignItems: "center",
    marginTop: 10,
  },
});

export default PlayScreen;
