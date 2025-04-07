import { StyleSheet, Text, View, ViewProps } from "react-native";
import { Slider } from "react-native-awesome-slider";
import { useSharedValue } from "react-native-reanimated";
import { useAudioPlayer } from "./audioProvider";
import { formatSecondsToMinutes } from "./miscellaneous";
import { colors, fontSize } from "./token";

export const PlayerProgressBar = ({ style }: ViewProps) => {
  const { position, duration, seekTo, isPlaying } = useAudioPlayer();

  const isSliding = useSharedValue(false);
  const progress = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(1);

  if (!isSliding.value && duration > 0) {
    progress.value = position / duration;
  }

  const trackElapsedTime = formatSecondsToMinutes(position / 1000);
  const trackRemainingTime = formatSecondsToMinutes(
    (duration - position) / 1000,
  );

  return (
    <View style={style}>
      <Slider
        progress={progress}
        minimumValue={min}
        maximumValue={max}
        containerStyle={styles.slider}
        thumbWidth={0}
        renderBubble={() => null}
        theme={{
          minimumTrackTintColor: colors.minimumTrackTintColor,
          maximumTrackTintColor: colors.maximumTrackTintColor,
        }}
        onSlidingStart={() => {
          isSliding.value = true;
        }}
        onValueChange={async (value) => {
          if (duration > 0) {
            const newPosition = value * duration;
            await seekTo(newPosition);
          }
        }}
        onSlidingComplete={async () => {
          isSliding.value = false;
          if (isPlaying) {
            const { playbackInstance } = useAudioPlayer();
            await playbackInstance?.playAsync();
          }
        }}
      />

      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{trackElapsedTime}</Text>
        <Text style={styles.timeText}>-{trackRemainingTime}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 20,
  },
  timeText: {
    color: colors.text,
    opacity: 0.75,
    fontSize: fontSize.xs,
    letterSpacing: 0.7,
    fontWeight: "500",
  },
  slider: {
    height: 7,
    borderRadius: 16,
  },
});
