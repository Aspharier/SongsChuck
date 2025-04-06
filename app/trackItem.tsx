import React from "react";
import { Image, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { Track } from "./types";

interface TrackItemProps {
  item: Track;
  onPress?: (track: Track) => void;
}

const TrackItem: React.FC<TrackItemProps> = React.memo(({ item, onPress }) => (
  <TouchableOpacity
    style={styles.item}
    onPress={() => onPress && onPress(item)}
  >
    <View style={styles.songContent}>
      {item.artworkData ? (
        <Image
          source={{ uri: item.artworkData }}
          style={styles.albumCover}
          fadeDuration={0}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.albumCoverPlaceholder} />
      )}
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.songTitle,
            item.title === "Invalid Audio File" && styles.invalidFile,
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  item: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  songContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  albumCover: {
    height: 100,
    width: 100,
    borderRadius: 10,
    backgroundColor: "#121212",
  },
  albumCoverPlaceholder: {
    height: 100,
    width: 100,
    borderRadius: 10,
    backgroundColor: "#121212",
  },
  songTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "white",
    marginBottom: 5,
  },
  invalidFile: {
    color: "#ff5555",
  },
  songArtist: {
    fontSize: 15,
    color: "#888",
  },
});

export default TrackItem;
