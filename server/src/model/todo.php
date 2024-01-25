<?php

namespace Application\Model;

require_once('src/lib/database.php');

class Todo
{
    public int $id;
    public string $title;
    public string $description;
    public bool $done;
    public string $creation_date;
}
