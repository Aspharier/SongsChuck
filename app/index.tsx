import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import Library from "./library";

export default function Index() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <Library />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
});
