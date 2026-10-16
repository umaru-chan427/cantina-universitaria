<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/images.php';
require_once __DIR__ . '/../helpers/response.php';

$metodo = $_SERVER['REQUEST_METHOD'];
$accion = $_GET['accion'] ?? '';
$body   = getBody();

function estadoStock(int $stock, bool $habilitado): array
{
    if (!$habilitado) return ['color' => 'rojo', 'texto' => 'Agotado'];
    if ($stock <= 0)  return ['color' => 'rojo', 'texto' => 'Agotado'];
    if ($stock <= 3)  return ['color' => 'naranja', 'texto' => "¡Últimas unidades! (Stock: {$stock})"];
    return ['color' => 'verde', 'texto' => "Disponible (Stock: {$stock})"];
}

function mapearProducto(array $p): array
{
    $habilitado = (bool)$p['habilitado'];
    return [
        'id'          => (int)$p['id'],
        'categoria_id'=> (int)$p['categoria_id'],
        'categoria'   => $p['categoria_nombre'] ?? null,
        'nombre'      => $p['nombre'],
        'descripcion' => $p['descripcion'],
        'precio'      => (float)$p['precio'],
        'foto_url'    => resolverFotoProducto($p['foto_url'], $p['categoria_slug'] ?? null),
        'stock'       => (int)$p['stock'],
        'habilitado'  => $habilitado,
        'estado_stock'=> estadoStock((int)$p['stock'], $habilitado),
    ];
}

switch (true) {
    case $metodo === 'GET':
        $sql = 'SELECT p.*, c.nombre AS categoria_nombre, c.slug AS categoria_slug
                FROM productos p JOIN categorias c ON c.id = p.categoria_id
                WHERE p.activo = 1 ORDER BY c.id, p.nombre';
        jsonResponse(array_map('mapearProducto', $pdo->query($sql)->fetchAll()));
        break;

    case $metodo === 'POST':
        $stmt = $pdo->prepare(
            'INSERT INTO productos (categoria_id, nombre, descripcion, precio, foto_url, stock) VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $body['categoria_id'], trim($body['nombre'] ?? ''), $body['descripcion'] ?? null,
            $body['precio'] ?? 0, $body['foto_url'] ?? null, $body['stock'] ?? 0,
        ]);
        jsonResponse(['mensaje' => 'Producto creado', 'id' => $pdo->lastInsertId()], 201);
        break;

    case $metodo === 'PUT' && $accion === 'stock':
        // Ajuste rápido +/- desde la tabla de inventario
        $id = $body['id'] ?? null;
        $delta = (int)($body['delta'] ?? 0);
        if (!$id) jsonError('ID requerido.');
        $stmt = $pdo->prepare('UPDATE productos SET stock = GREATEST(0, stock + ?) WHERE id = ?');
        $stmt->execute([$delta, $id]);
        jsonResponse(['mensaje' => 'Stock actualizado']);
        break;

    case $metodo === 'PUT' && $accion === 'habilitar':
        $id = $body['id'] ?? null;
        if (!$id) jsonError('ID requerido.');
        $stmt = $pdo->prepare('UPDATE productos SET habilitado = NOT habilitado WHERE id = ?');
        $stmt->execute([$id]);
        jsonResponse(['mensaje' => 'Disponibilidad actualizada']);
        break;

    case $metodo === 'PUT':
        $id = $body['id'] ?? null;
        if (!$id) jsonError('ID de producto requerido.');
        $stmt = $pdo->prepare(
            'UPDATE productos SET categoria_id=?, nombre=?, descripcion=?, precio=?, foto_url=?, stock=? WHERE id=?'
        );
        $stmt->execute([
            $body['categoria_id'], $body['nombre'], $body['descripcion'] ?? null,
            $body['precio'], $body['foto_url'] ?? null, $body['stock'], $id,
        ]);
        jsonResponse(['mensaje' => 'Producto actualizado']);
        break;

    case $metodo === 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) jsonError('ID de producto requerido.');
        $stmt = $pdo->prepare('UPDATE productos SET activo = 0 WHERE id = ?');
        $stmt->execute([$id]);
        jsonResponse(['mensaje' => 'Producto eliminado']);
        break;

    default:
        jsonError('Método no permitido.', 405);
}
