<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Accept, Content-Type, Access-Control-Allow-Origin');

use Application\Controllers\TodoRepository;

require_once('src/model/todo.php');
require_once('./src/controllers/todo.php');

// Préparation des données POST 

$params = [
    'todoId' => $_POST["todoId"] ?? null,
    'done' => $_POST["done"] ?? null,
    'action' => $_POST["action"] ?? null,
    'title' => $_POST["title"] ?? null,
    'description' => $_POST["description"] ?? null
];


//Le router traite les infos selon les requêtes

switch ($params['action']) {
    default:
        // Get and display todos
        $todos = TodoRepository::getTodos();

        print_r($todos);
        break;
    case 'create':
        if ($params['title'] && $params['description']) {
            $todos = TodoRepository::createTodo($params['title'], $params['description']);
            print_r($todos);
        } else {
            echo json_encode(array("error" => 'Please fill up all the informations'));
        }
        break;
    case 'check':
        if ($params['title'] && $params['description']) {
            $todos = TodoRepository::checkTodoOffline($params['title'], $params['description']);
            print_r($todos);
        } else {
            $todos = TodoRepository::checkTodo($params['todoId']);
            print_r($todos);
        }
        break;
    case 'delete':
        if ($params['todoId']) {
            $todos = TodoRepository::deleteTodo($params['todoId']);
            print_r($todos);
        }
        break;
}
