import React, { useEffect, useState, useRef } from "react";
import {
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import * as MediaLibrary from "expo-media-library";
import { useQuery } from "@tanstack/react-query";
import {
  MetadataPresets,
  getMetadata,
} from "@missingcore/react-native-metadata-retriever";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Track {
  id: string;
  filename: string;
  uri: string;
  duration?: number;
  title?: string;
  artist?: string;
  albumTitle?: string;
  artworkData?: string;
  lastModified?: number;
}

interface GetTracksResult {
  duration: string;
  tracks: Track[];
}

const TRACKS_CACHE_KEY = "cached_audio_tracks";
const CACHE_EXPIRY_DAYS = 7;

const isValidAudioFile = (uri: string): boolean => {
  const invalidPatterns = [
    "NrvqLxhkCcloQ0GaAZZqjRjhYdAz21aLGRhbkbOsvxk2K0yM3x1no6UusW+ptb2q",
  ];
  return !!uri && !invalidPatterns.some((pattern) => uri.includes(pattern));
};

const getBasicTrackInfo = (asset: MediaLibrary.Asset): Track => ({
  id: asset.id,
  filename: asset.filename || "Unknown",
  uri: asset.uri,
  duration: asset.duration,
  title: asset.filename?.replace(/\.[^/.]+$/, "") || "Unknown",
  artist: "Unknown Artist",
  lastModified: asset.modificationTime
    ? new Date(asset.modificationTime).getTime()
    : Date.now(),
});

async function loadFromCache(): Promise<GetTracksResult | null> {
  try {
    const cachedData = await AsyncStorage.getItem(TRACKS_CACHE_KEY);
    if (!cachedData) return null;

    const parsedData: GetTracksResult & { cacheTimestamp?: number } =
      JSON.parse(cachedData);

    if (
      parsedData.cacheTimestamp &&
      Date.now() - parsedData.cacheTimestamp >
        CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    ) {
      return null;
    }

    return parsedData;
  } catch (error) {
    console.warn("Failed to load from cache:", error);
    return null;
  }
}

async function saveToCache(data: GetTracksResult): Promise<void> {
  try {
    const cacheData = {
      ...data,
      cacheTimestamp: Date.now(),
    };
    await AsyncStorage.setItem(TRACKS_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn("Failed to save to cache:", error);
  }
}

async function getTracks(): Promise<GetTracksResult> {
  const start = performance.now();

  const cachedData = await loadFromCache();
  if (cachedData) {
    console.log("Using cached tracks data");
    return cachedData;
  }

  try {
    const { granted } = await MediaLibrary.requestPermissionsAsync();
    if (!granted) throw new Error("Media library permission not granted");

    const { totalCount } = await MediaLibrary.getAssetsAsync({
      mediaType: "audio",
      first: 0,
    });

    const batchSize = 100;
    let audioFiles: MediaLibrary.Asset[] = [];
    let currentIndex = 0;

    while (currentIndex < totalCount) {
      const batch = await MediaLibrary.getAssetsAsync({
        mediaType: "audio",
        first: batchSize,
        after: currentIndex.toString(),
      });
      audioFiles = [...audioFiles, ...batch.assets];
      currentIndex += batchSize;
    }

    console.log(
      `Found ${audioFiles.length} audio files in ${((performance.now() - start) / 1000).toFixed(4)}s.`,
    );

    const tracks = await Promise.all(
      audioFiles.map(async (asset) => {
        if (!isValidAudioFile(asset.uri)) {
          return getBasicTrackInfo(asset);
        }

        try {
          const metadata = await getMetadata(
            asset.uri,
            MetadataPresets.standardArtwork,
          );
          return {
            ...getBasicTrackInfo(asset),
            title:
              metadata.title ||
              asset.filename?.replace(/\.[^/.]+$/, "") ||
              "Unknown",
            artist: metadata.artist || "Unknown Artist",
            albumTitle: metadata.albumTitle || null,
            artworkData: metadata.artworkData || null,
          };
        } catch (error) {
          console.warn(`Metadata error for ${asset.filename}:`, error);
          return getBasicTrackInfo(asset);
        }
      }),
    );

    const uniqueTracks = tracks.filter(
      (track, index, self) =>
        index === self.findIndex((t) => t.id === track.id),
    ) as Track[];

    const result: GetTracksResult = {
      duration: ((performance.now() - start) / 1000).toFixed(4),
      tracks: uniqueTracks,
    };

    await saveToCache(result);

    return result;
  } catch (error) {
    console.error("Error in getTracks:", error);
    throw error;
  }
}

const formatDuration = (milliseconds?: number): string => {
  if (!milliseconds) return "--:--";
  const seconds = Math.floor(milliseconds / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const TrackItem: React.FC<{ item: Track }> = React.memo(({ item }) => (
  <TouchableOpacity style={styles.item}>
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

const Library: React.FC = () => {
  const ref = useRef<FlashList<Track>>(null);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions({
    granularPermissions: ["audio"],
  });
  const [hasPermissions, setHasPermissions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { isPending, error, data, refetch } = useQuery<GetTracksResult, Error>({
    queryKey: ["tracks"],
    queryFn: getTracks,
    enabled: hasPermissions,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await AsyncStorage.removeItem(TRACKS_CACHE_KEY);
      await refetch();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const checkPermissions = async () => {
      if (permissionResponse?.status !== "granted") {
        const { canAskAgain, status } = await requestPermission();
        if (canAskAgain || status === "denied") return;
      } else {
        setHasPermissions(true);
      }
    };
    checkPermissions();
  }, [permissionResponse?.status, requestPermission]);

  if (isPending && !data) {
    return <Text style={styles.headerTitle}>Loading tracks...</Text>;
  }

  if (error) {
    return (
      <>
        <Text style={styles.headerTitle}>An error was encountered:</Text>
        <Text style={styles.songContent}>{error.message}</Text>
      </>
    );
  }

  if (!hasPermissions) {
    return (
      <Text style={styles.headerTitle}>
        Read permissions for media content was not granted.
      </Text>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={[]}>
        <FlashList
          data={data?.tracks || []}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitle}>All Songs</Text>
              <Text style={styles.songCount}>{data?.tracks?.length || 0}</Text>
            </View>
          }
          renderItem={({ item }) => <TrackItem item={item} />}
          keyExtractor={({ id }) => id}
          estimatedItemSize={120}
          contentContainerStyle={styles.listContent}
          ref={ref}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="black"
              colors={["black"]}
            />
          }
          removeClippedSubviews={true}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

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
  songInfo: {
    alignItems: "flex-end",
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
  songContentText: {
    fontSize: 16,
    color: "white",
  },
});

export default Library;
