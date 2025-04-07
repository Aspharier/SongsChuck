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
      <View style={{ justifyContent: "center", flex: 1 }}>
        <ActivityIndicator color={styles.icon.color} />
      </View>
    );
  }
  return (
    <View style={styles.overlayContainer}>
      <DismissPlayerSymbol />
      <View style={{ flex: 1, marginTop: top + 70, marginBottom: bottom }}>
        <View style={styles.artworkImageContainer}>
          <Image
            source={{
              uri: currentTrack.artworkData ?? unknownTrackImageUri,
            }}
            style={styles.artworkImage}
          />
        </View>
        <View style={{ marginTop: "auto" }}>
          <View style={{ height: 60 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* Track Title */}
              <View style={styles.trackTitleContainer}>
                <MovingText
                  text={currentTrack.title ?? ""}
                  animationThreshold={30}
                  style={styles.trackTitleText}
                />
              </View>
              {/* Track artist */}
              {currentTrack.artist && (
                <Text numberOfLines={1} style={styles.trackArtistText}>
                  {currentTrack.artist}
                </Text>
              )}
            </View>
            <PlayerProgressBar style={{ marginTop: 32 }} />
            <PlayerControls style={{ marginTop: 40 }} />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <PlayerRepeatToggle size={30} style={{ marginBottom: 6 }} />
          </View>
        </View>
      </View>
    </View>
  );
};

const DismissPlayerSymbol = () => {
  const { top } = useSafeAreaInsets();
  return (
    <View
      style={{
        position: "absolute",
        top: top + 8,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <View
        accessible={false}
        style={{
          width: 50,
          height: 8,
          borderRadius: 8,
          backgroundColor: "white",
          opacity: 0.7,
        }}
      ></View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  icon: { color: "#fff" },
  artworkImageContainer: {
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 11.0,
    flexDirection: "row",
    justifyContent: "center",
    height: "45%",
  },
  artworkImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 12,
  },
  trackTitleContainer: {
    flex: 1,
    overflow: "hidden",
  },
  trackTitleText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  trackArtistText: {
    marginTop: 8,
    color: "#fff",
    fontSize: 20,
    opacity: 0.8,
    maxWidth: "90%",
  },
});
export default PlayScreen;
