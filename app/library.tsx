import { Text, View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

const DATA = [
  {
    id: "1",
    title: "03 am in 6ix",
    artist: "JJ47/Jokhay - Talk To You Later",
    duration: "2:58",
    type: "mp3",
    albumImage: require("../assets/images/1.png"),
  },
  {
    id: "2",
    title: "051021",
    artist: "Shamoon Ismail/Talha Anjum - Scars & Screws",
    duration: "3:32",
    type: "mp3",
    albumImage: require("../assets/images/sample3.png"),
  },
  {
    id: "3",
    title: "100 Bars",
    artist: "Talha Anjum - 100 Bars",
    duration: "6:08",
    type: "mp3",
    albumImage: require("../assets/images/sample4.png"),
  },
  {
    id: "4",
    title: "100 Million",
    artist: "DIVINE/Karan Aujia - 100 Million",
    duration: "3:13",
    type: "mp3",
    albumImage: require("../assets/images/1.png"),
  },
  {
    id: "5",
    title: "101",
    artist: "Seedhe Maut - 101",
    duration: "3:17",
    type: "mp3",
    albumImage: require("../assets/images/sample4.png"),
  },
  {
    id: "7",
    title: "Rootho Na",
    artist: "Akanksha Bhandari/Raghav Kaushik - Rootho Na",
    albumImage: require("../assets/images/sample3.png"),
  },
  {
    id: "8",
    title: "Rootho Na",
    artist: "Akanksha Bhandari/Raghav Kaushik - Rootho Na",
    albumImage: require("../assets/images/sample3.png"),
  },
  {
    id: "9",
    title: "Rootho Na",
    artist: "Akanksha Bhandari/Raghav Kaushik - Rootho Na",
    albumImage: require("../assets/images/sample3.png"),
  },
  {
    id: "10",
    title: "Rootho Na",
    artist: "Akanksha Bhandari/Raghav Kaushik - Rootho Na",
    albumImage: require("../assets/images/sample3.png"),
  },
  {
    id: "11",
    title: "Rootho Na",
    artist: "Akanksha Bhandari/Raghav Kaushik - Rootho Na",
    albumImage: require("../assets/images/sample3.png"),
  },
  {
    id: "12",
    title: "Rootho Na",
    artist: "Akanksha Bhandari/Raghav Kaushik - Rootho Na",
    albumImage: require("../assets/images/sample3.png"),
  },
  {
    id: "13",
    title: "Rootho Na",
    artist: "Akanksha Bhandari/Raghav Kaushik - Rootho Na",
    albumImage: require("../assets/images/sample3.png"),
  },
  {
    id: "14",
    title: "Rootho Na",
    artist: "Akanksha Bhandari/Raghav Kaushik - Rootho Na",
    albumImage: require("../assets/images/sample3.png"),
  },
  {
    id: "15",
    title: "Rootho Na",
    artist: "Akanksha Bhandari/Raghav Kaushik - Rootho Na",
    albumImage: require("../assets/images/sample3.png"),
  },
  {
    id: "16",
    title: "Rootho Na",
    artist: "Akanksha Bhandari/Raghav Kaushik - Rootho Na",
    albumImage: require("../assets/images/sample3.png"),
  },
  {
    id: "17",
    title: "Rootho Na",
    artist: "Akanksha Bhandari/Raghav Kaushik - Rootho Na",
    albumImage: require("../assets/images/sample3.png"),
  },
  {
    id: "18",
    title: "Rootho Na",
    artist: "Akanksha Bhandari/Raghav Kaushik - Rootho Na",
    albumImage: require("../assets/images/sample3.png"),
  },
  {
    id: "19",
    title: "Rootho Na",
    artist: "Akanksha Bhandari/Raghav Kaushik - Rootho Na",
    albumImage: require("../assets/images/sample3.png"),
  },
  {
    id: "20",
    title: "Rootho Na",
    artist: "Akanksha Bhandari/Raghav Kaushik - Rootho Na",
    albumImage: require("../assets/images/sample3.png"),
  },
  {
    id: "21",
    title: "Rootho Na",
    artist: "Akanksha Bhandari/Raghav Kaushik - Rootho Na",
    albumImage: require("../assets/images/sample3.png"),
  },
  {
    id: "22",
    title: "Rootho Na",
    artist: "Akanksha Bhandari/Raghav Kaushik - Rootho Na",
    albumImage: require("../assets/images/sample3.png"),
  },
  {
    id: "23",
    title: "Rootho Na",
    artist: "Akanksha Bhandari/Raghav Kaushik - Rootho Na",
    albumImage: require("../assets/images/sample3.png"),
  },
  {
    id: "24",
    title: "Rootho Na",
    artist: "Akanksha Bhandari/Raghav Kaushik - Rootho Na",
    albumImage: require("../assets/images/sample3.png"),
  },
  {
    id: "25",
    title: "Rootho Na",
    artist: "Akanksha Bhandari/Raghav Kaushik - Rootho Na",
    albumImage: require("../assets/images/sample3.png"),
  },
];

type ItemProps = {
  title: string;
  artist: string;
  albumImage?: number;
};

const Item = ({ title, artist, albumImage }: ItemProps) => (
  <TouchableOpacity style={styles.item}>
    <View style={styles.songContent}>
      <Image source={albumImage} style={styles.albumCover} />
      <View style={styles.textContainer}>
        <Text style={styles.songTitle}>{title}</Text>
        <Text style={styles.songArtist}>{artist}</Text>
      </View>
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
            <Item
              title={item.title}
              artist={item.artist}
              albumImage={item.albumImage}
            />
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
    fontSize: 30,
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
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  albumCover: {
    height: 80,
    width: 80,
    marginRight: 12,
    borderRadius: 10,
  },
  songTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color: "white",
  },
  songArtist: {
    fontSize: 15,
    color: "#999",
  },
  songType: {
    fontSize: 14,
    color: "#666",
  },
});
