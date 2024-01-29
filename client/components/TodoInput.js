import React from "react";
import { StyleSheet, View, TextInput, Text, Pressable } from "react-native";

const TodoInput = ({ newTodo, setNewTodo, createTodo, isValid }) => {
  return (
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
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    margin: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 10,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 16,
  },
});

export default TodoInput;
