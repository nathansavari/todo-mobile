import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import CheckBox from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [data, setData] = useState([]);
  const [newTodo, setNewTodo] = useState({ title: "", description: "" });
  const [isValid, setIsValid] = useState(true); // New state to track validation

  const url = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    getData();
  }, []);

  function getData() {
    fetch(url, {
      method: "POST",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((json) => {
        setData(json);
        AsyncStorage.setItem("todos", JSON.stringify(json));
        return AsyncStorage.getItem("unsynced_changes");
      })
      .then((unsyncedChanges) => {
        const changes = unsyncedChanges ? JSON.parse(unsyncedChanges) : [];
        console.log("Unsynced changes:", changes);

        return Promise.all(
          changes.map((change) => {
            const requestOptions = {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: `action=${change.action}&todoId=${encodeURIComponent(
                change.todoId
              )}&done=${encodeURIComponent(
                change.done
              )}&title=${encodeURIComponent(
                change.title
              )}&description=${encodeURIComponent(change.description)}`,
            };

            return fetch(url, requestOptions)
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Failed to sync change");
                }
                return response.json();
              })
              .catch((error) => console.log("Sync error:", error));
          })
        );
      })
      .then(() => {
        AsyncStorage.setItem("unsynced_changes", JSON.stringify([]));
        // Fetch data again to refresh UI
        return fetch(url, { method: "POST" });
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((json) => setData(json))
      .catch((error) => {
        console.error("Fetch error:", error);
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

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `action=create&title=${encodeURIComponent(
        newTodo.title
      )}&description=${encodeURIComponent(newTodo.description)}`,
    })
      .then((response) => response.json())
      .then((newItem) => {
        const updatedData = [...data, newItem];
        setData(updatedData);
        AsyncStorage.setItem("todos", JSON.stringify(updatedData));
      })
      .then(getData())
      .catch((error) => {
        const thenewtodo = {
          title: newTodo.title,
          description: newTodo.description,
          done: false,
          creation_date: new Date().toLocaleString("fr-FR"),
        };

        data.unshift(thenewtodo);

        console.log(data);

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
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={newTodo.title}
          onChangeText={(text) => setNewTodo({ ...newTodo, title: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={newTodo.description}
          onChangeText={(text) => setNewTodo({ ...newTodo, description: text })}
        />
        {!isValid && (
          <Text style={styles.errorText}>
            Title and Description are required.
          </Text>
        )}

        <Pressable
          onPress={createTodo}
          style={{
            padding: 10,
            backgroundColor: "teal",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white" }}>Add Todo</Text>
        </Pressable>
      </View>
      {data.map((todo, index) => (
        <View key={index} style={styles.todoItem}>
          <View>
            <Text style={styles.todoTitle}>{todo.title}</Text>
            <Text>{todo.description}</Text>
          </View>
          <View>
            <CheckBox
              value={todo.done}
              onValueChange={() => {
                const updatedData = data.map((item) => {
                  if (
                    item.id === todo.id ||
                    (item.description === todo.description &&
                      item.title === todo.title)
                  ) {
                    return { ...item, done: !item.done };
                  }
                  return item;
                });

                setData(updatedData);
                AsyncStorage.setItem("todos", JSON.stringify(updatedData));

                const requestOptions = {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                  body: `action=check&todoId=${encodeURIComponent(todo.id)}`,
                };

                fetch(url, requestOptions).catch((error) => {
                  console.error("Fetch error:", error);

                  // Handle offline scenario
                  // Store the unsynchronized change in AsyncStorage with a specific key
                  AsyncStorage.getItem("unsynced_changes").then(
                    (unsyncedChanges) => {
                      let changes = unsyncedChanges
                        ? JSON.parse(unsyncedChanges)
                        : [];
                      changes.push({
                        action: "check",
                        todoId: todo.id,
                        done: !todo.done,
                        title: todo.title,
                        description: todo.description,
                      });

                      AsyncStorage.setItem(
                        "unsynced_changes",
                        JSON.stringify(changes)
                      );
                    }
                  );
                });
              }}
            />
          </View>
        </View>
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
  inputContainer: {
    margin: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 10,
  },
  todoItem: {
    padding: 20,
    paddingRight: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  todoTitle: {
    fontWeight: "bold",
  },
  head: {
    fontSize: 40,
    marginHorizontal: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 16,
  },
});
