<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';

$accion = $_GET['accion'] ?? '';
$body   = getBody();

if ($accion === 'registro' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre   = trim($body['nombre_completo'] ?? '');
    $email    = trim($body['email'] ?? '') ?: null;
    $telefono = trim($body['telefono'] ?? '') ?: null;
    $password = $body['password'] ?? '';

    if (!$nombre || !$password || (!$email && !$telefono)) {
        jsonError('Nombre, contraseña y (email o teléfono) son obligatorios.');
    }
    if (strlen($password) < 4) {
        jsonError('La contraseña debe tener al menos 4 caracteres.');
    }

    $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = ? OR telefono = ?');
    $stmt->execute([$email, $telefono]);
    if ($stmt->fetch()) jsonError('Ya existe una cuenta con ese email o teléfono.', 409);

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare(
        'INSERT INTO usuarios (nombre_completo, email, telefono, password_hash, rol) VALUES (?, ?, ?, ?, "alumno")'
    );
    $stmt->execute([$nombre, $email, $telefono, $hash]);

    jsonResponse(['mensaje' => 'Cuenta creada correctamente', 'id' => $pdo->lastInsertId()], 201);
}

if ($accion === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $identificador = trim($body['identificador'] ?? '');
    $password      = $body['password'] ?? '';

    $stmt = $pdo->prepare('SELECT * FROM usuarios WHERE (email = ? OR telefono = ?) AND activo = 1');
    $stmt->execute([$identificador, $identificador]);
    $usuario = $stmt->fetch();

    if (!$usuario || !password_verify($password, $usuario['password_hash'])) {
        jsonError('Credenciales inválidas.', 401);
    }

    unset($usuario['password_hash']);
    jsonResponse(['usuario' => $usuario]);
}

if ($accion === 'solicitar-recuperacion' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $identificador = trim($body['identificador'] ?? '');
    if (!$identificador) jsonError('Ingresá tu correo o teléfono.');

    $stmt = $pdo->prepare('SELECT id, nombre_completo, email FROM usuarios WHERE (email = ? OR telefono = ?) AND activo = 1');
    $stmt->execute([$identificador, $identificador]);
    $usuario = $stmt->fetch();

    // Por seguridad, siempre respondemos "ok" exista o no la cuenta (no revelamos si el correo está registrado).
    if (!$usuario) {
        jsonResponse(['mensaje' => 'Si el dato existe, vas a recibir un correo con instrucciones.']);
    }

    $token = bin2hex(random_bytes(32));
    $expira = date('Y-m-d H:i:s', strtotime('+1 hour'));

    $ins = $pdo->prepare('INSERT INTO password_resets (usuario_id, token, expira_en) VALUES (?, ?, ?)');
    $ins->execute([$usuario['id'], $token, $expira]);

    // Armamos el link que el frontend usará para mostrar el formulario de nueva contraseña.
    $origen = $_SERVER['HTTP_ORIGIN'] ?? ('http://' . ($_SERVER['HTTP_HOST'] ?? 'localhost:5173'));
    $enlace = rtrim($origen, '/') . '/?reset=' . $token;

    $enviado = false;
    if (!empty($usuario['email'])) {
        $asunto = 'Recuperar contraseña - La Cafetería Provending';
        $cuerpo = "Hola {$usuario['nombre_completo']},\n\nHacé clic en el siguiente enlace para crear una nueva contraseña (válido por 1 hora):\n{$enlace}\n\nSi no pediste esto, podés ignorar este mensaje.";
        $cabeceras = 'From: no-responder@provending.com';
        // mail() requiere un servidor SMTP configurado en php.ini; en XAMPP local normalmente no está activo.
        $enviado = @mail($usuario['email'], $asunto, $cuerpo, $cabeceras);
    }

    $respuesta = ['mensaje' => 'Si el dato existe, vas a recibir un correo con instrucciones.'];
    if (!$enviado) {
        // Modo desarrollo: si no hay servidor de correo configurado, devolvemos el enlace
        // para poder probar el flujo completo sin necesidad de un SMTP real.
        $respuesta['modo_desarrollo'] = true;
        $respuesta['enlace_recuperacion'] = $enlace;
    }
    jsonResponse($respuesta);
}

if ($accion === 'restablecer' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = trim($body['token'] ?? '');
    $password = $body['password'] ?? '';
    if (!$token || !$password) jsonError('Token y nueva contraseña son obligatorios.');
    if (strlen($password) < 4) jsonError('La contraseña debe tener al menos 4 caracteres.');

    $stmt = $pdo->prepare('SELECT * FROM password_resets WHERE token = ? AND usado = 0 AND expira_en >= NOW()');
    $stmt->execute([$token]);
    $reset = $stmt->fetch();
    if (!$reset) jsonError('El enlace no es válido o ya expiró. Solicitá uno nuevo.', 400);

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $upd = $pdo->prepare('UPDATE usuarios SET password_hash = ? WHERE id = ?');
    $upd->execute([$hash, $reset['usuario_id']]);

    $marcar = $pdo->prepare('UPDATE password_resets SET usado = 1 WHERE id = ?');
    $marcar->execute([$reset['id']]);

    jsonResponse(['mensaje' => 'Contraseña actualizada correctamente. Ya podés iniciar sesión.']);
}

jsonError('Acción no encontrada.', 404);
