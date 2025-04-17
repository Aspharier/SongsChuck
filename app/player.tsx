import {
  StatusBar,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAudioPlayer } from "./audioProvider";
import { Image } from "expo-image";
import { MovingText } from "./movingText";
import { PlayerControls } from "./playerControls";
import { PlayerProgressBar } from "./playerProgressBar";
import { PlayerRepeatToggle } from "./playerRepeatToggle";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { usePlayerBackground } from "./usePlayerBackground";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";

const unknownArtworkImage = require("../assets/images/sample3.png");

const PlayScreen = () => {
  const { top, bottom } = useSafeAreaInsets();
  const { currentTrack } = useAudioPlayer();
  const navigation = useNavigation();
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const [artworkUrl, setArtworkUrl] = useState("");

  useEffect(() => {
    if (
      currentTrack?.artworkData &&
      typeof currentTrack.artworkData === "string"
    ) {
      try {
        new URL(currentTrack.artworkData);
        setArtworkUrl(currentTrack.artworkData);
      } catch (e) {
        console.log("Invalid artwork URL, using local fallback");
        setArtworkUrl("");
      }
    } else {
      setArtworkUrl("");
    }
  }, [currentTrack]);

  const { imageColors } = usePlayerBackground(artworkUrl);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
        scale.value = interpolate(
          event.translationY,
          [0, 300],
          [1, 0.8],
          Extrapolation.CLAMP,
        );
        opacity.value = interpolate(
          event.translationY,
          [0, 300],
          [1, 0.5],
          Extrapolation.CLAMP,
        );
      }
    })
    .onEnd((event) => {
      if (event.translationY > 150) {
        translateY.value = withTiming(500, { duration: 150 });
        opacity.value = withTiming(0, { duration: 150 }, (finished) => {
          if (finished) {
            runOnJS(navigation.goBack)();
          }
        });
      } else {
        translateY.value = withSpring(0, { damping: 20 });
        scale.value = withSpring(1);
        opacity.value = withSpring(1);
      }
    });

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedArtworkStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          translateY.value,
          [0, 300],
          [1, 0.9],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  if (!currentTrack) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }

  const imageSource = artworkUrl ? { uri: artworkUrl } : unknownArtworkImage;

  return (
    <LinearGradient
      style={{ flex: 1 }}
      colors={[imageColors.background, imageColors.primary]}
    >
      <StatusBar hidden translucent backgroundColor="transparent" />
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.container, animatedContainerStyle]}>
          <View
            style={[
              styles.contentContainer,
              { marginTop: top + 40, marginBottom: bottom },
            ]}
          >
            {/* Album Artwork with animated style */}
            <Animated.View
              style={[styles.artworkContainer, animatedArtworkStyle]}
            >
              <Image
                source={imageSource}
                style={styles.artworkImage}
                contentFit="cover"
                transition={300}
              />
            </Animated.View>

            {/* Track Info */}
            <View style={styles.trackInfoContainer}>
              <View style={styles.trackTextContainer}>
                <View style={styles.trackTitleContainer}>
                  <MovingText
                    text={currentTrack.title ?? "Unknown Track"}
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

              <PlayerProgressBar style={styles.progressBar} />
              <PlayerControls style={styles.controls} />
              <View style={styles.repeatContainer}>
                <PlayerRepeatToggle size={28} />
              </View>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingTop: 0,
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
  artworkContainer: {
    flex: 1,
    justifyContent: "flex-start",
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
    marginBottom: 5,
  },
  trackTitleText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "700",
    textAlign: "left",
  },
  trackArtistText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 20,
    textAlign: "left",
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
