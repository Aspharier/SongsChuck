import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, StyleSheet } from "react-native";
import Library from "./library";

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "black",
          },
          statusBarStyle: "light",
          statusBarBackgroundColor: "black",
        }}
      >
        <Stack.Screen name="Library" component={Library} />
      </Stack.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
});
