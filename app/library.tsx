import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

const DATA = [
  {
    id: "1",
    title: "03 am in 6ix",
    artist: "JJ47/Jokhay - Talk To You Later",
    duration: "2:58",
    type: "mp3",
  },
  {
    id: "2",
    title: "051021",
    artist: "Shamoon Ismail/Talha Anjum - Scars & Screws",
    duration: "3:32",
    type: "mp3",
  },
  {
    id: "3",
    title: "100 Bars",
    artist: "Talha Anjum - 100 Bars",
    duration: "6:08",
    type: "mp3",
  },
  {
    id: "4",
    title: "100 Million",
    artist: "DIVINE/Karan Aujia - 100 Million",
    duration: "3:13",
    type: "mp3",
  },
  {
    id: "5",
    title: "101",
    artist: "Seedhe Maut - 101",
    duration: "3:17",
    type: "mp3",
  },
  {
    id: "6",
    title: "Rootho Na",
    artist: "Akanksha Bhandari/Raghav Kaushik - Rootho Na",
  },
];

type ItemProps = {
  title: string;
  artist: string;
};
const Item = ({ title, artist }: ItemProps) => (
  <TouchableOpacity style={styles.item}>
    <View style={styles.songContent}>
      <Text style={styles.songTitle}>{title}</Text>
      <Text style={styles.songArtist}>{artist}</Text>
    </View>
  </TouchableOpacity>
);

const Library = () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>All Songs</Text>
        </View>

        <FlashList
          data={DATA}
          renderItem={({ item }) => (
            <Item title={item.title} artist={item.artist} />
          )}
          keyExtractor={(item) => item.id}
          estimatedItemSize={80}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
    marginHorizontal: 16,
  },
  item: {
    backgroundColor: "transparent",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  songContent: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "white",
  },
  songArtist: {
    fontSize: 14,
    color: "#999",
  },
  songType: {
    fontSize: 14,
    color: "#666",
  },
});
