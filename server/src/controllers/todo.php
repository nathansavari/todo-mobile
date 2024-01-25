<?php

namespace Application\Controllers;

use Application\Lib\DatabaseConnection;
use Application\Model\Todo;
use Exception;

class TodoRepository
{
    public static function getTodos(): string
    {
        try {
            $statement = DatabaseConnection::getInstance()->query("SELECT id, title, description, done, creation_date FROM items ORDER BY creation_date DESC");
            $todos = [];
            while (($row = $statement->fetch())) {
                $todo = new Todo();
                $todo->title = $row['title'];
                // Assuming creation_date is stored in a DATETIME format in the database
                $todo->creation_date = (new \DateTime($row['creation_date']))->format('d/m/Y à H\hi\ms\ss');
                $todo->description = $row['description'];
                $todo->id = $row['id'];
                $todo->done = $row['done'];

                $todos[] = $todo;
            }
        } catch (Exception $e) {
            return json_encode(['error' => $e->getMessage()]);
        } finally {
            DatabaseConnection::closeConnection();
        }

        return json_encode($todos);
    }

    public static function checkTodo(int $todo_id): string
    {
        try {
            $statement = DatabaseConnection::getInstance()->prepare("UPDATE items SET done = 1 - done WHERE id=?");
            $statement->execute([$todo_id]);
            $message = 'Todo checked';
        } catch (Exception $e) {
            $message = 'Error: ' . $e->getMessage();
        } finally {
            DatabaseConnection::closeConnection();
        }

        return json_encode(['message' => $message]);
    }


    public static function checkTodoOffline(string $title, string $description): string
    {
        try {
            $statement = DatabaseConnection::getInstance()->prepare("SELECT id FROM items WHERE title=? AND description=?");
            $statement->execute([$title, $description]);
            $todo = $statement->fetch();
            if ($todo) {
                $statement = DatabaseConnection::getInstance()->prepare("UPDATE items SET done = 1 - done WHERE id=?");
                $statement->execute([$todo['id']]);
                $message = 'Todo checked';
            } else {
                $message = 'Todo not found';
            }
        } catch (Exception $e) {
            $message = 'Error: ' . $e->getMessage();
        } finally {
            DatabaseConnection::closeConnection();
        }

        return json_encode(['message' => $message]);
    }

    public static function createTodo(string $title, string $description): string
    {
        try {
            $statement = DatabaseConnection::getInstance()->prepare("INSERT INTO items (title, description, creation_date, done) VALUES (?, ?, NOW(), 0)");
            $statement->execute([$title, $description]);
            $message = 'Todo created';
        } catch (Exception $e) {
            $message = 'Error: ' . $e->getMessage();
        } finally {
            DatabaseConnection::closeConnection();
        }

        return json_encode(['message' => $message]);
    }

    public static function deleteTodo(int $todo_id): string
    {
        try {
            $statement = DatabaseConnection::getInstance()->prepare("DELETE FROM items WHERE id=?");
            $statement->execute([$todo_id]);
            $message = 'Todo deleted';
        } catch (Exception $e) {
            $message = 'Error: ' . $e->getMessage();
        } finally {
            DatabaseConnection::closeConnection();
        }

        return json_encode(['message' => $message]);
    }
}
