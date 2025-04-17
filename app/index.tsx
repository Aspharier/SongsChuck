import { View, StyleSheet } from "react-native";
import Library from "./library";
import React from "react";

export default function Index() {
  console.log("Rendering Index component");
  return (
    <View style={styles.container}>
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
