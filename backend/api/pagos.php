<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

$metodo = $_SERVER['REQUEST_METHOD'];
$body   = getBody();

if ($metodo === 'GET') {
    $sql = 'SELECT pp.*, e.nombre_completo FROM pagos_personal pp
            JOIN empleados e ON e.id = pp.empleado_id ORDER BY pp.creado_en DESC';
    jsonResponse($pdo->query($sql)->fetchAll());
}

if ($metodo === 'POST') {
    $stmt = $pdo->prepare('INSERT INTO pagos_personal (empleado_id, tipo, monto) VALUES (?, ?, ?)');
    $stmt->execute([$body['empleado_id'], $body['tipo'], $body['monto']]);
    jsonResponse(['mensaje' => 'Pago registrado', 'id' => $pdo->lastInsertId()], 201);
}

jsonError('Método no permitido.', 405);
