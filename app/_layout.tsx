import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, StyleSheet } from "react-native";
import Library from "./library";
import "expo-dev-client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
});
