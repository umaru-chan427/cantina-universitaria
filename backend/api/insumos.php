<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

$metodo = $_SERVER['REQUEST_METHOD'];
$accion = $_GET['accion'] ?? '';
$body   = getBody();

function estadoInsumo(array $i): string
{
    $hoy = new DateTime();
    if ($i['vencimiento']) {
        $venc = new DateTime($i['vencimiento']);
        $dias = (int)$hoy->diff($venc)->format('%r%a');
        if ($dias >= 0 && $dias <= 5) return 'Por vencer';
    }
    if ((float)$i['cantidad'] <= (float)$i['minimo']) return 'Stock crítico';
    return 'En orden';
}

switch (true) {
    case $metodo === 'GET':
        $insumos = $pdo->query('SELECT * FROM insumos ORDER BY nombre')->fetchAll();
        foreach ($insumos as &$i) { $i['estado'] = estadoInsumo($i); }
        jsonResponse($insumos);
        break;

    case $metodo === 'POST':
        $stmt = $pdo->prepare(
            'INSERT INTO insumos (nombre, unidad, cantidad, minimo, vencimiento) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $body['nombre'], $body['unidad'], $body['cantidad'] ?? 0,
            $body['minimo'] ?? 0, $body['vencimiento'] ?: null,
        ]);
        jsonResponse(['mensaje' => 'Insumo agregado', 'id' => $pdo->lastInsertId()], 201);
        break;

    case $metodo === 'PUT' && $accion === 'cantidad':
        $id = $body['id'] ?? null;
        $delta = (float)($body['delta'] ?? 0);
        if (!$id) jsonError('ID requerido.');
        $stmt = $pdo->prepare('UPDATE insumos SET cantidad = GREATEST(0, cantidad + ?) WHERE id = ?');
        $stmt->execute([$delta, $id]);
        jsonResponse(['mensaje' => 'Cantidad actualizada']);
        break;

    case $metodo === 'DELETE':
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare('DELETE FROM insumos WHERE id = ?');
        $stmt->execute([$id]);
        jsonResponse(['mensaje' => 'Insumo eliminado']);
        break;

    default:
        jsonError('Método no permitido.', 405);
}
