import React, { useRef, useState, useEffect } from "react";
import { Text, View, RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Track } from "./types";
import { getTracks, clearTrackCache } from "./trackService";
import styles from "./styles";
import { useMediaLibraryPermissions } from "./usePermissions";
import TrackItem from "./trackItem";
import { useAudioPlayer } from "./audioProvider";
import { FloatingPlayer } from "./floatingPlayer";

const Library: React.FC = () => {
  const ref = useRef<FlashList<Track>>(null);
  const { hasPermissions } = useMediaLibraryPermissions();
  const [refreshing, setRefreshing] = useState(false);
  const { playTrack, setPlaylist } = useAudioPlayer();

  const { isPending, error, data, refetch } = useQuery({
    queryKey: ["tracks"],
    queryFn: getTracks,
    enabled: hasPermissions,
  });

  useEffect(() => {
    if (data?.tracks) {
      setPlaylist(data.tracks);
    }
  }, [data]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await clearTrackCache();
      await refetch();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTrackSelect = (track: Track) => {
    playTrack(track);
  };

  if (isPending && !data) {
    return <Text style={styles.headerTitle}>Loading tracks...</Text>;
  }

  if (error) {
    return (
      <>
        <Text style={styles.headerTitle}>An error was encountered:</Text>
        <Text style={styles.songContentText}>{(error as Error).message}</Text>
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
    <SafeAreaView style={styles.container} edges={[]}>
      <FlashList
        data={data?.tracks || []}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>All Songs</Text>
            <Text style={styles.songCount}>{data?.tracks?.length || 0}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TrackItem item={item} onPress={() => handleTrackSelect(item)} />
        )}
        keyExtractor={({ id }) => id}
        estimatedItemSize={120}
        contentContainerStyle={{
          ...styles.listContent,
          paddingBottom: 80,
        }}
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
      <FloatingPlayer style={styles.floatingPlayerStyles} />
    </SafeAreaView>
  );
};

export default Library;
