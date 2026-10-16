<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

$accion = $_GET['accion'] ?? '';
$body   = getBody();

function calcularTotales(PDO $pdo, string $fecha): array
{
    $resumen = $pdo->prepare(
        'SELECT metodo_pago, COALESCE(SUM(total),0) AS total FROM pedidos
         WHERE DATE(creado_en) = ? AND estado <> "cancelado" GROUP BY metodo_pago'
    );
    $resumen->execute([$fecha]);
    $totales = ['Efectivo' => 0.0, 'Tarjeta' => 0.0];
    foreach ($resumen->fetchAll() as $r) $totales[$r['metodo_pago']] = (float)$r['total'];
    return $totales;
}

if ($accion === 'abrir' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare('INSERT INTO caja (usuario_id, fecha, monto_apertura, estado) VALUES (?, CURDATE(), ?, "abierta")');
    $stmt->execute([$body['usuario_id'], $body['monto_apertura'] ?? 0]);
    jsonResponse(['mensaje' => 'Caja abierta', 'id' => $pdo->lastInsertId()], 201);
}

if ($accion === 'estado' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT * FROM caja WHERE estado = "abierta" ORDER BY id DESC LIMIT 1');
    $caja = $stmt->fetch();
    if (!$caja) jsonResponse(null);

    $totales = calcularTotales($pdo, $caja['fecha']);
    $egresos = $pdo->prepare('SELECT COALESCE(SUM(monto),0) AS total FROM egresos WHERE caja_id = ?');
    $egresos->execute([$caja['id']]);
    $totalEgresos = (float)$egresos->fetch()['total'];

    $caja['total_efectivo'] = $totales['Efectivo'];
    $caja['total_tarjeta']  = $totales['Tarjeta'];
    $caja['total_egresos']  = $totalEgresos;
    $caja['efectivo_esperado'] = (float)$caja['monto_apertura'] + $totales['Efectivo'] - $totalEgresos;

    $listaEgresos = $pdo->prepare('SELECT * FROM egresos WHERE caja_id = ? ORDER BY creado_en DESC');
    $listaEgresos->execute([$caja['id']]);
    $caja['egresos'] = $listaEgresos->fetchAll();

    jsonResponse($caja);
}

if ($accion === 'egreso' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare('INSERT INTO egresos (caja_id, concepto, monto) VALUES (?, ?, ?)');
    $stmt->execute([$body['caja_id'], $body['concepto'], $body['monto']]);
    jsonResponse(['mensaje' => 'Egreso registrado', 'id' => $pdo->lastInsertId()], 201);
}

if ($accion === 'cerrar' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $cajaId = $body['caja_id'] ?? null;
    $efectivoContado = $body['efectivo_contado'] ?? null;
    if (!$cajaId) jsonError('caja_id requerido.');

    $caja = $pdo->prepare('SELECT * FROM caja WHERE id = ?');
    $caja->execute([$cajaId]);
    $cajaRow = $caja->fetch();
    if (!$cajaRow) jsonError('Caja no encontrada.', 404);

    $totales = calcularTotales($pdo, $cajaRow['fecha']);
    $egresos = $pdo->prepare('SELECT COALESCE(SUM(monto),0) AS total FROM egresos WHERE caja_id = ?');
    $egresos->execute([$cajaId]);
    $totalEgresos = (float)$egresos->fetch()['total'];

    $upd = $pdo->prepare(
        'UPDATE caja SET efectivo_contado=?, total_efectivo=?, total_tarjeta=?, total_egresos=?, estado="cerrada", cerrada_en=NOW() WHERE id = ?'
    );
    $upd->execute([$efectivoContado, $totales['Efectivo'], $totales['Tarjeta'], $totalEgresos, $cajaId]);

    jsonResponse([
        'mensaje' => 'Caja cerrada',
        'monto_apertura' => (float)$cajaRow['monto_apertura'],
        'total_efectivo' => $totales['Efectivo'],
        'total_tarjeta'  => $totales['Tarjeta'],
        'total_egresos'  => $totalEgresos,
        'efectivo_esperado' => (float)$cajaRow['monto_apertura'] + $totales['Efectivo'] - $totalEgresos,
        'efectivo_contado' => (float)$efectivoContado,
    ]);
}

jsonError('Acción no encontrada.', 404);
