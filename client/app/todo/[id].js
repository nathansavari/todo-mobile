import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import axios from "axios";
import { useState, useEffect } from "react";

export default function Page() {
  const [data, setData] = useState({});
  const { id } = useLocalSearchParams();

  useEffect(() => {
    const url = process.env.EXPO_PUBLIC_API_URL;

    axios
      .post(url, `action=getTodo&todoId=${encodeURIComponent(id)}`, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 2000,
      })
      .then((response) => {
        console.log(response.data);
        setData(response.data);
      })
      .catch((error) => {
        console.error("Axios error:", error);
      });
  }, [id]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data.title}</Text>
      <Text style={styles.description}>{data.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 30,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
  },
});
