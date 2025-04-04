import { Image, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import * as MediaLibrary from "expo-media-library";
import { useQuery } from "@tanstack/react-query";
import {
  MetadataPresets,
  getMetadata,
} from "@missingcore/react-native-metadata-retriever";
import { useEffect, useState } from "react";
import { isFulfilled, isRejected } from "./utils/promise";

async function getTracks() {
  const start = performance.now();

  const { totalCount } = await MediaLibrary.getAssetsAsync({
    mediaType: "audio",
    first: 0,
  });
  let audioFiles = (
    await MediaLibrary.getAssetsAsync({
      mediaType: "audio",
      first: totalCount,
    })
  ).assets.filter((a) =>
    a.uri.startsWith("file:///storage/emulated/0/Download/"),
  );
  console.log(
    `Got list of audio files in ${((performance.now() - start) / 1000).toFixed(4)}s.`,
  );

  const tracksMetadata = await Promise.allSettled(
    audioFiles.map(async ({ id, filename, uri }) => {
      const data = await getMetadata(uri, MetadataPresets.standardArtwork);
      return { id, filename, ...data };
    }),
  );
  console.log(
    `Got metadata of ${audioFiles.length} tracks in ${((performance.now() - start) / 1000).toFixed(4)}s.`,
  );

  const errors = tracksMetadata.filter(isRejected).map(({ reason }) => reason);
  console.log("Errors:", errors);

  return {
    duration: ((performance.now() - start) / 1000).toFixed(4),
    tracks: tracksMetadata.filter(isFulfilled).map(({ value }) => value),
  };
}

const Library = () => {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions({
    granularPermissions: ["audio"],
  });
  const [hasPermissions, setHasPermissions] = useState(false);

  const { isPending, error, data } = useQuery({
    queryKey: ["tracks"],
    queryFn: getTracks,
    enabled: hasPermissions,
  });

  useEffect(() => {
    async function checkPermissions() {
      if (permissionResponse?.status !== "granted") {
        const { canAskAgain, status } = await requestPermission();
        if (canAskAgain || status === "denied") return;
      } else {
        setHasPermissions(true);
      }
    }
    checkPermissions();
  }, [permissionResponse?.status, requestPermission]);

  if (isPending) {
    return <Text style={styles.headerTitle}>Loading tracks...</Text>;
  } else if (error) {
    return (
      <>
        <Text style={styles.headerTitle}>An error was encountered:</Text>
        <Text style={styles.songContent}>{error.message}</Text>
      </>
    );
  } else if (!hasPermissions) {
    return (
      <Text style={styles.headerTitle}>
        Read permissions for media content was not granted.
      </Text>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <FlashList
          data={data?.tracks || []}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitle}>All Songs</Text>
              <Text style={styles.songCount}>{data.tracks.length}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item}>
              <View style={styles.songContent}>
                {item.artworkData ? (
                  <Image
                    source={{ uri: item.artworkData }}
                    style={styles.albumCover}
                  />
                ) : (
                  <View style={styles.albumCoverPlaceholder} />
                )}
                <View style={styles.textContainer}>
                  <Text style={styles.songTitle} numberOfLines={1}>
                    {item.title || item.filename}
                  </Text>
                  <Text style={styles.songArtist} numberOfLines={1}>
                    {item.artist || "Unknown Artist"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={({ id }) => id}
          estimatedItemSize={80}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Library;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  listContent: {
    paddingTop: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "black",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
  },
  songCount: {
    fontSize: 20,
    color: "#888",
  },
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
  },
  albumCoverPlaceholder: {
    height: 100,
    width: 100,
    borderRadius: 10,
    backgroundColor: "black",
  },
  songTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "white",
    marginBottom: 10,
  },
  songArtist: {
    fontSize: 14,
    color: "#888",
  },
  songDuration: {
    fontSize: 14,
    color: "#888",
    marginBottom: 3,
  },
  songType: {
    fontSize: 12,
    color: "#555",
  },
});
