<?php

declare(strict_types=1);

namespace Application\Lib;

use PDO;
use PDOException;
use RuntimeException;

class DatabaseConnection
{
    private static ?PDO $instance = null;

    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            try {

                $env = parse_ini_file('.env');
                if (!$env) {
                    throw new RuntimeException('Configuration file not found');
                }

                $user = $env['USER'] ?? '';
                $pass = $env['PASS'] ?? '';
                $host = $env['DB_HOST'] ?? '';
                $port = $env['DB_PORT'] ?? '';
                $dbname = $env['DB_NAME'] ?? '';
                $charset = $env['DB_CHARSET'] ?? '';

                $url = "mysql:host=localhost:{$host};port={$port};dbname={$dbname};charset={$charset}";

                self::$instance = new PDO($url, $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]);
            } catch (PDOException $e) {
                // Erreur générique pour pas dévoiler des infos
                throw new RuntimeException("Database connection error");
            }
        }

        return self::$instance;
    }

    public static function closeConnection(): void
    {
        self::$instance = null;
    }
}
