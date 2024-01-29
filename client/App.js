import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, ScrollView } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import Todo from "./components/Todo";
import TodoInput from "./components/TodoInput";

import axios from "axios";

export default function App() {
  const [data, setData] = useState([]);
  const [newTodo, setNewTodo] = useState({ title: "", description: "" });
  const [isValid, setIsValid] = useState(true);

  const url = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    getData();
  }, []);

  function getData() {
    axios
      .post(url, {}, { timeout: 2000 })
      .then((response) => {
        if (response.status !== 200) {
          throw new Error("Network response was not ok");
        }
        return response.data;
      })
      .then((data) => {
        setData(data);
        AsyncStorage.setItem("todos", JSON.stringify(data));
        return AsyncStorage.getItem("unsynced_changes");
      })
      .then((unsyncedChanges) => {
        const changes = unsyncedChanges ? JSON.parse(unsyncedChanges) : [];
        console.log("Unsynced changes:", changes);

        return Promise.all(
          changes.map((change) => {
            const requestOptions = {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              data: `action=${encodeURIComponent(
                change.action
              )}&todoId=${encodeURIComponent(
                change.todoId
              )}&done=${encodeURIComponent(
                change.done
              )}&title=${encodeURIComponent(
                change.title
              )}&description=${encodeURIComponent(change.description)}`,
            };

            return axios
              .post(url, requestOptions.data, {
                headers: requestOptions.headers,
              })
              .then((response) => {
                if (response.status !== 200) {
                  throw new Error("Failed to sync change");
                }
                return response.data;
              })
              .catch((error) => console.log("Sync error:", error));
          })
        );
      })
      .then(() => {
        AsyncStorage.setItem("unsynced_changes", JSON.stringify([]));
        // Fetch data again to refresh UI using axios
        return axios.post(url);
      })
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Axios error:", error);
        // Load local data if there is a network error
        loadLocalData();
      });
  }

  const loadLocalData = async () => {
    try {
      const localData = await AsyncStorage.getItem("todos");
      if (localData !== null) {
        setData(JSON.parse(localData));
      }
    } catch (e) {
      console.error("Error reading from local storage", e);
    }
  };

  const createTodo = () => {
    if (!newTodo.title.trim() || !newTodo.description.trim()) {
      setIsValid(false); // Update validation state
      return;
    }

    setIsValid(true);

    axios
      .post(
        url,
        `action=create&title=${encodeURIComponent(
          newTodo.title
        )}&description=${encodeURIComponent(newTodo.description)}`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 2000,
        }
      )
      .then((response) => {
        const newItem = response.data;
        const updatedData = [...data, newItem];
        setData(updatedData);
        AsyncStorage.setItem("todos", JSON.stringify(updatedData));
      })
      .then(getData)
      .catch((error) => {
        const thenewtodo = {
          title: newTodo.title,
          description: newTodo.description,
          done: false,
          creation_date: new Date().toLocaleString("fr-FR"),
        };

        data.unshift(thenewtodo);

        setData(data);
        AsyncStorage.setItem("todos", JSON.stringify(data));
        loadLocalData();

        AsyncStorage.getItem("unsynced_changes").then((unsyncedChanges) => {
          let changes = unsyncedChanges ? JSON.parse(unsyncedChanges) : [];
          changes.push({
            action: "create",
            title: newTodo.title,
            description: newTodo.description,
          });

          AsyncStorage.setItem("unsynced_changes", JSON.stringify(changes));
        });
      });

    setNewTodo({ title: "", description: "" });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.head}>Todolist</Text>
      <TodoInput
        newTodo={newTodo}
        setNewTodo={setNewTodo}
        createTodo={createTodo}
        isValid={isValid}
      />
      {data.map((todo, index) => (
        <Todo key={index} todo={todo} data={data} setData={setData} url={url} />
      ))}
      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 100,
  },
  head: {
    fontSize: 40,
    marginHorizontal: 20,
  },
});
