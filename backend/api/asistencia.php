<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

$accion = $_GET['accion'] ?? '';
$body   = getBody();

if ($accion === 'entrada' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $empleadoId = $body['empleado_id'] ?? null;
    $stmt = $pdo->prepare('SELECT id FROM asistencia WHERE empleado_id = ? AND fecha = CURDATE()');
    $stmt->execute([$empleadoId]);
    if ($stmt->fetch()) jsonError('Ya existe una marcación de entrada para hoy.', 409);

    $ins = $pdo->prepare('INSERT INTO asistencia (empleado_id, fecha, entrada) VALUES (?, CURDATE(), NOW())');
    $ins->execute([$empleadoId]);
    jsonResponse(['mensaje' => 'Entrada registrada'], 201);
}

if ($accion === 'salida' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $empleadoId = $body['empleado_id'] ?? null;
    $upd = $pdo->prepare(
        'UPDATE asistencia SET salida = NOW() WHERE empleado_id = ? AND fecha = CURDATE() AND salida IS NULL'
    );
    $upd->execute([$empleadoId]);
    if ($upd->rowCount() === 0) jsonError('No hay una entrada abierta para hoy.', 400);
    jsonResponse(['mensaje' => 'Salida registrada']);
}

jsonError('Acción no encontrada.', 404);
