<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

$metodo = $_SERVER['REQUEST_METHOD'];
$accion = $_GET['accion'] ?? '';
$body   = getBody();

function formatearNumero(int $id): string
{
    return '001-001-' . str_pad((string)$id, 7, '0', STR_PAD_LEFT);
}

if ($metodo === 'GET') {
    $facturas = $pdo->query(
        'SELECT f.*, p.codigo_ticket, p.metodo_pago FROM facturas f JOIN pedidos p ON p.id = f.pedido_id ORDER BY f.id DESC'
    )->fetchAll();

    $stmtItems = $pdo->prepare(
        'SELECT dp.cantidad, dp.precio_unitario, dp.subtotal, pr.nombre
         FROM detalle_pedidos dp JOIN productos pr ON pr.id = dp.producto_id
         WHERE dp.pedido_id = ?'
    );

    $resumen = ['emitidos' => 0, 'anulados' => 0, 'facturado' => 0.0];
    foreach ($facturas as &$f) {
        $f['numero_display'] = formatearNumero($f['id']);
        $stmtItems->execute([$f['pedido_id']]);
        $f['items'] = $stmtItems->fetchAll();
        if ($f['estado'] === 'emitida') {
            $resumen['emitidos']++;
            $resumen['facturado'] += (float)$f['total'];
        } else {
            $resumen['anulados']++;
        }
    }
    jsonResponse(['resumen' => $resumen, 'facturas' => $facturas]);
}

if ($metodo === 'PUT' && $accion === 'anular') {
    $id = $body['id'] ?? null;
    if (!$id) jsonError('ID requerido.');
    $stmt = $pdo->prepare('UPDATE facturas SET estado = "anulada" WHERE id = ?');
    $stmt->execute([$id]);
    jsonResponse(['mensaje' => 'Factura anulada']);
}

jsonError('Método no permitido.', 405);
