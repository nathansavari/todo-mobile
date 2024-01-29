import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Todo List" }} />
      <Stack.Screen name="todo/[id]" options={{ headerTitle: "Todo" }} />
    </Stack>
  );
}
