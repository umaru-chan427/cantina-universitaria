<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    jsonResponse($pdo->query('SELECT * FROM categorias ORDER BY id')->fetchAll());
}
jsonError('Método no permitido.', 405);
