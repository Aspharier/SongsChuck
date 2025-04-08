import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, StyleSheet } from "react-native";
import Library from "./library";
import PlayScreen from "./player";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "expo-dev-client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AudioProvider } from "./audioProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AudioProvider>
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
                <Stack.Screen
                  component={PlayScreen}
                  name="player"
                  options={{
                    presentation: "transparentModal",
                    gestureEnabled: true,
                    gestureDirection: "vertical",
                    animation: "fade",
                    headerShown: false,
                  }}
                />
              </Stack.Navigator>
            </View>
          </AudioProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
});
