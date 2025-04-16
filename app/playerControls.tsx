import { FontAwesome6 } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { useAudioPlayer } from "./audioProvider";
type PlayerControlsProps = {
  style?: ViewStyle;
};

type PlayerButtonProps = {
  style?: ViewStyle;
  iconSize?: number;
};

export const PlayerControls = ({ style }: PlayerControlsProps) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <SkipToPreviousButton />

        <PlayPauseButton />

        <SkipToNextButton />
      </View>
    </View>
  );
};

export const PlayPauseButton = ({
  style,
  iconSize = 50,
}: PlayerButtonProps) => {
  const { isPlaying, pauseTrack } = useAudioPlayer();
  return (
    <View style={[{ height: iconSize }, style]}>
      <TouchableOpacity activeOpacity={0.85} onPress={pauseTrack}>
        <FontAwesome6
          name={isPlaying ? "pause" : "play"}
          size={iconSize}
          color={styles.text.color}
        />
      </TouchableOpacity>
    </View>
  );
};

export const SkipToNextButton = ({ iconSize = 35 }: PlayerButtonProps) => {
  const { playNextTrack } = useAudioPlayer();
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={playNextTrack}>
      <FontAwesome6 name="forward" size={iconSize} color={styles.text.color} />
    </TouchableOpacity>
  );
};

export const SkipToPreviousButton = ({ iconSize = 35 }: PlayerButtonProps) => {
  const { playPreviousTrack } = useAudioPlayer();
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={playPreviousTrack}>
      <FontAwesome6
        name={"backward"}
        size={iconSize}
        color={styles.text.color}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  text: {
    color: "#fff",
  },
});
