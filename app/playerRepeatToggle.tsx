import { colors } from "./token";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { match } from "ts-pattern";
import { useAudioPlayer, RepeatMode } from "./audioProvider";

type IconProps = Omit<ComponentProps<typeof MaterialCommunityIcons>, "name">;
type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const repeatOrder = [
  RepeatMode.Off,
  RepeatMode.Track,
  RepeatMode.Queue,
] as const;

export const PlayerRepeatToggle = ({ ...iconProps }: IconProps) => {
  const { repeatMode, setRepeatMode } = useAudioPlayer();

  const toggleRepeatMode = () => {
    const currentIndex = repeatOrder.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % repeatOrder.length;
    setRepeatMode(repeatOrder[nextIndex]);
  };

  const icon = match(repeatMode)
    .returnType<IconName>()
    .with(RepeatMode.Off, () => "repeat-off")
    .with(RepeatMode.Track, () => "repeat-once")
    .with(RepeatMode.Queue, () => "repeat")
    .otherwise(() => "repeat-off");

  const iconColor = match(repeatMode)
    .with(RepeatMode.Off, () => colors.icon)
    .with(RepeatMode.Track, () => colors.primary)
    .with(RepeatMode.Queue, () => colors.primary)
    .otherwise(() => colors.icon);

  return (
    <MaterialCommunityIcons
      name={icon}
      onPress={toggleRepeatMode}
      color={iconColor}
      {...iconProps}
    />
  );
};
