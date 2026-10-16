<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

$metodo = $_SERVER['REQUEST_METHOD'];
$accion = $_GET['accion'] ?? '';
$body   = getBody();

if ($metodo === 'POST' && $accion === '') {
    $usuarioId  = $body['usuario_id'] ?? null;
    $metodoPago = $body['metodo_pago'] ?? null;
    $notas      = $body['notas'] ?? null;
    $facturaNombre = $body['factura_nombre'] ?? null;
    $facturaRuc    = $body['factura_ruc'] ?? null;
    $items      = $body['items'] ?? [];

    if (!$usuarioId || !$metodoPago || empty($items)) {
        jsonError('usuario_id, metodo_pago e items son obligatorios.');
    }

    try {
        $pdo->beginTransaction();
        $total = 0;
        $detalles = [];

        foreach ($items as $item) {
            $stmt = $pdo->prepare('SELECT * FROM productos WHERE id = ? FOR UPDATE');
            $stmt->execute([$item['producto_id']]);
            $producto = $stmt->fetch();
            if (!$producto) throw new Exception('Producto no encontrado.');
            if ($producto['stock'] < $item['cantidad']) {
                throw new Exception("Stock insuficiente para {$producto['nombre']}.");
            }
            $subtotal = $producto['precio'] * $item['cantidad'];
            $total += $subtotal;
            $detalles[] = [
                'producto_id' => $producto['id'], 'nombre' => $producto['nombre'],
                'cantidad' => $item['cantidad'], 'precio_unitario' => $producto['precio'], 'subtotal' => $subtotal,
            ];
            $upd = $pdo->prepare('UPDATE productos SET stock = stock - ? WHERE id = ?');
            $upd->execute([$item['cantidad'], $producto['id']]);
        }

        $codigo = generarCodigoTicket();
        $stmt = $pdo->prepare(
            'INSERT INTO pedidos (usuario_id, metodo_pago, estado, total, notas, factura_nombre, factura_ruc, codigo_ticket)
             VALUES (?, ?, "pendiente", ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$usuarioId, $metodoPago, $total, $notas, $facturaNombre, $facturaRuc, $codigo]);
        $pedidoId = $pdo->lastInsertId();

        $stmtDetalle = $pdo->prepare(
            'INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)'
        );
        foreach ($detalles as $d) {
            $stmtDetalle->execute([$pedidoId, $d['producto_id'], $d['cantidad'], $d['precio_unitario'], $d['subtotal']]);
        }

        // Genera automáticamente el comprobante de factura simplificada (numeración provisoria, se corrige abajo)
        $stmtFac = $pdo->prepare(
            'INSERT INTO facturas (pedido_id, numero_comprobante, ruc_documento, razon_social, total) VALUES (?, ?, ?, ?, ?)'
        );
        $stmtFac->execute([$pedidoId, 'TEMP', $facturaRuc, $facturaNombre, $total]);
        $facturaId = $pdo->lastInsertId();
        $numFactura = '001-001-' . str_pad((string)$facturaId, 7, '0', STR_PAD_LEFT);
        $pdo->prepare('UPDATE facturas SET numero_comprobante = ? WHERE id = ?')->execute([$numFactura, $facturaId]);

        $pdo->commit();

        jsonResponse([
            'mensaje' => 'Pedido creado correctamente', 'pedido_id' => $pedidoId,
            'codigo_ticket' => $codigo, 'total' => $total, 'metodo_pago' => $metodoPago,
            'estado' => 'pendiente', 'items' => $detalles,
            'factura' => [
                'numero_display' => $numFactura, 'razon_social' => $facturaNombre,
                'ruc_documento' => $facturaRuc, 'emitida_en' => date('c'), 'codigo_ticket' => $codigo,
            ],
        ], 201);
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonError($e->getMessage(), 400);
    }
}

if ($metodo === 'PUT' && $accion === 'estado') {
    $id = $body['id'] ?? null;
    $estado = $body['estado'] ?? null;
    $validos = ['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'];
    if (!$id || !in_array($estado, $validos, true)) jsonError('id y estado válido son obligatorios.');
    $stmt = $pdo->prepare('UPDATE pedidos SET estado = ? WHERE id = ?');
    $stmt->execute([$estado, $id]);
    jsonResponse(['mensaje' => 'Estado actualizado']);
}

if ($metodo === 'GET' && $accion === 'seguimiento') {
    $id = $_GET['id'] ?? null;
    if (!$id) jsonError('ID requerido.');
    $stmt = $pdo->prepare('SELECT id, estado, codigo_ticket FROM pedidos WHERE id = ?');
    $stmt->execute([$id]);
    $pedido = $stmt->fetch();
    if (!$pedido) jsonError('Pedido no encontrado.', 404);
    jsonResponse($pedido);
}

if ($metodo === 'GET' && $accion === 'tablero') {
    // Pedidos del día agrupados para el panel Kanban de la cantina
    $sql = 'SELECT pe.*, u.nombre_completo,
            (SELECT GROUP_CONCAT(CONCAT(dp.cantidad, "x ", pr.nombre) SEPARATOR "||")
             FROM detalle_pedidos dp JOIN productos pr ON pr.id = dp.producto_id
             WHERE dp.pedido_id = pe.id) AS items_resumen
            FROM pedidos pe JOIN usuarios u ON u.id = pe.usuario_id
            WHERE DATE(pe.creado_en) = CURDATE() AND pe.estado <> "cancelado"
            ORDER BY pe.creado_en DESC';
    $filas = $pdo->query($sql)->fetchAll();
    $tablero = ['pendiente' => [], 'en_preparacion' => [], 'listo' => [], 'entregado' => []];
    foreach ($filas as $f) {
        $f['items'] = $f['items_resumen'] ? explode('||', $f['items_resumen']) : [];
        unset($f['items_resumen']);
        $tablero[$f['estado']][] = $f;
    }
    jsonResponse($tablero);
}

if ($metodo === 'GET' && $accion === '') {
    $usuarioId = $_GET['usuario_id'] ?? null;
    $sql = 'SELECT * FROM pedidos';
    $params = [];
    if ($usuarioId) { $sql .= ' WHERE usuario_id = ?'; $params[] = $usuarioId; }
    $sql .= ' ORDER BY creado_en DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    jsonResponse($stmt->fetchAll());
}

jsonError('Método no permitido.', 405);
