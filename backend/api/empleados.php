<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

$metodo = $_SERVER['REQUEST_METHOD'];
$body   = getBody();

switch ($metodo) {
    case 'GET':
        $sql = "SELECT e.*,
                (SELECT entrada FROM asistencia a WHERE a.empleado_id = e.id AND a.fecha = CURDATE() ORDER BY a.id DESC LIMIT 1) AS entrada_hoy,
                (SELECT salida FROM asistencia a WHERE a.empleado_id = e.id AND a.fecha = CURDATE() ORDER BY a.id DESC LIMIT 1) AS salida_hoy
                FROM empleados e WHERE e.activo = 1 ORDER BY e.nombre_completo";
        jsonResponse($pdo->query($sql)->fetchAll());
        break;

    case 'POST':
        $stmt = $pdo->prepare(
            'INSERT INTO empleados (nombre_completo, rol, telefono, turno) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([$body['nombre_completo'], $body['rol'], $body['telefono'] ?? null, $body['turno'] ?? null]);
        jsonResponse(['mensaje' => 'Empleado agregado al equipo', 'id' => $pdo->lastInsertId()], 201);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare('UPDATE empleados SET activo = 0 WHERE id = ?');
        $stmt->execute([$id]);
        jsonResponse(['mensaje' => 'Empleado eliminado']);
        break;

    default:
        jsonError('Método no permitido.', 405);
}
