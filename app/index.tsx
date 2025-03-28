import { Dimensions, View, Text, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import Library from "./library";

export default function Index() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="black" />
      <Library />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    backgroundColor: "black",
  },
});
