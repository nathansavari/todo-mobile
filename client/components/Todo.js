import React from "react";
import { StyleSheet, View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import CheckBox from "expo-checkbox";

const Todo = ({ todo, data, setData, url }) => {
  const handleValueChange = () => {
    const updatedData = data.map((item) => {
      if (
        item.id === todo.id ||
        (item.description === todo.description && item.title === todo.title)
      ) {
        return { ...item, done: !item.done };
      }
      return item;
    });

    setData(updatedData);
    AsyncStorage.setItem("todos", JSON.stringify(updatedData));

    axios
      .post(url, `action=check&todoId=${encodeURIComponent(todo.id)}`, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 2000,
      })
      .catch((error) => {
        console.error("Fetch error:", error);

        AsyncStorage.getItem("unsynced_changes").then((unsyncedChanges) => {
          let changes = unsyncedChanges ? JSON.parse(unsyncedChanges) : [];
          changes.push({
            action: "check",
            todoId: todo.id,
            done: !todo.done,
            title: todo.title,
            description: todo.description,
          });

          AsyncStorage.setItem("unsynced_changes", JSON.stringify(changes));
        });
      });
  };

  return (
    <View style={styles.todoItem}>
      <View>
        <Text style={styles.todoTitle}>{todo.title}</Text>
        <Text>{todo.description}</Text>
      </View>
      <View>
        <CheckBox value={todo.done} onValueChange={handleValueChange} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default Todo;