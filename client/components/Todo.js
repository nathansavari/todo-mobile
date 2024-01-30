import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import CheckBox from "expo-checkbox";
import { Link } from "expo-router";

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
      <Link
        style={styles.todoLink}
        href={{
          pathname: "/todo/[id]",
          params: {
            title: todo.title,
            description: todo.description,
          },
        }}
      >
        <View style={styles.todoText}>
          <Text
            style={
              todo.done ? [styles.todoTitle, styles.todoDone] : styles.todoTitle
            }
          >
            {todo.title}
          </Text>
          <Text>{todo.description}</Text>
        </View>
      </Link>
      <CheckBox value={todo.done} onValueChange={handleValueChange} />
    </View>
  );
};

const styles = StyleSheet.create({
  todoItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  todoTitle: {
    fontWeight: "bold",
  },
  todoDone: {
    textDecorationLine: "line-through",
  },
  todoLink: {
    width: "90%",
  },
});

export default Todo;
