-- =====================================================================
-- LA CAFETERÍA PROVENDING - Base de Datos MySQL (v3)
-- Compatible con XAMPP (MySQL 5.7+ / MariaDB 10.3+)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS cantina_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cantina_db;

-- ---------------------------------------------------------------------
-- usuarios
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NULL,
    telefono VARCHAR(30) UNIQUE NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('alumno', 'cantina', 'admin') NOT NULL DEFAULT 'alumno',
    documento VARCHAR(30) NULL COMMENT 'RUC / Cedula para facturacion',
    activo TINYINT(1) NOT NULL DEFAULT 1,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_contacto CHECK (email IS NOT NULL OR telefono IS NOT NULL)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- categorias
-- ---------------------------------------------------------------------
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    slug VARCHAR(80) NOT NULL UNIQUE,
    foto_url VARCHAR(500) NULL COMMENT 'Foto real representativa de la categoria'
) ENGINE=InnoDB;

INSERT INTO categorias (nombre, slug, foto_url) VALUES
('Empanadas', 'empanadas', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600'),
('Minutas', 'minutas', 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600'),
('Bebidas', 'bebidas', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600'),
('Postres', 'postres', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600'),
('Cafetería', 'cafeteria', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600');

-- ---------------------------------------------------------------------
-- productos
-- ---------------------------------------------------------------------
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion VARCHAR(255) NULL,
    precio DECIMAL(10,2) NOT NULL,
    foto_url VARCHAR(500) NULL,
    stock INT NOT NULL DEFAULT 0,
    habilitado TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Deshabilitado manualmente por la cantina (boton bloquear)',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Eliminado logico',
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) ENGINE=InnoDB;

-- Empanadas (categoria_id = 1)
INSERT INTO productos (categoria_id, nombre, descripcion, precio, foto_url, stock) VALUES
(1, 'Empanada de carne', 'Recién horneada, jugosa', 9000, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600', 24),
(1, 'Empanada de pollo', 'Rellena de pollo desmenuzado', 9000, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600', 20),
(1, 'Empanada de jamón y queso', 'Clásica combinación', 9000, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600', 18),
(1, 'Empanada 4 quesos', 'Mezcla de quesos fundidos', 9000, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600', 15),
(1, 'Empanada de pollo c/catupiry', 'Pollo con catupiry cremoso', 9000, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600', 12),
(1, 'Empanada chilena', 'Estilo chileno, bien rellena', 9000, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600', 10),
(1, 'Empanada de espinaca', 'Espinaca salteada con queso', 9000, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600', 14),
(1, 'Empanada de verduras', 'Mix de verduras de estación', 9000, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600', 14),
(1, 'Panchonada', 'Empanada estilo panchito', 9000, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600', 10),
(1, 'Pan de viena', 'Individual, recién horneado', 9000, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600', 20);

-- Minutas (categoria_id = 2)
INSERT INTO productos (categoria_id, nombre, descripcion, precio, foto_url, stock) VALUES
(2, 'Sándwich de jamón y queso', 'En pan francés', 7000, 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600', 15),
(2, 'Sándwich de verduras', 'Vegetariano, bien fresco', 8000, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600', 10),
(2, 'Sándwich de milanesa de carne', 'Milanesa, lechuga y tomate', 12000, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600', 8),
(2, 'Sándwich de milanesa de pollo', 'Milanesa de pollo, lechuga y tomate', 12000, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600', 8),
(2, 'Mixto normal', 'Jamón y queso tostado', 8000, 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600', 12),
(2, 'Mixto árabe', 'Estilo árabe, en pan pita', 9000, 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600', 8),
(2, 'Tarta de pollo', 'Porción individual', 14000, 'https://images.unsplash.com/photo-1619740455993-9d77689bdaf9?w=600', 6),
(2, 'Tarta de jamón y queso', 'Porción individual', 14000, 'https://images.unsplash.com/photo-1619740455993-9d77689bdaf9?w=600', 6),
(2, 'Fugazza', 'Pizza de cebolla', 10000, 'https://images.unsplash.com/photo-1548365328-9f547fb0953b?w=600', 6),
(2, 'Pizzeta', 'Individual, con muzzarella', 14000, 'https://images.unsplash.com/photo-1548365328-9f547fb0953b?w=600', 6);

-- Bebidas (categoria_id = 3)
INSERT INTO productos (categoria_id, nombre, descripcion, precio, foto_url, stock) VALUES
(3, 'Pulp 500 ml', 'Jugo de fruta bien frío', 8000, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600', 20),
(3, 'Gaseosa cola 500 ml', 'Botella individual', 9000, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600', 24),
(3, 'Gaseosa lima-limón 500 ml', 'Botella individual', 9000, 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=600', 20),
(3, 'Gaseosa lima-limón zero 500 ml', 'Sin azúcar', 9000, 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=600', 15),
(3, 'Agua saborizada c/gas 500 ml', 'Bien fría', 4000, 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=600', 30),
(3, 'Jugo en polvo 1 L', 'Preparado del día', 13000, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600', 10),
(3, 'Jugo en polvo 200 ml', 'Individual', 5000, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600', 20),
(3, 'Jugo en polvo light 200 ml', 'Individual, sin azúcar', 5000, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600', 15),
(3, 'Jugo de naranja natural 1 L', 'Exprimido en el momento', 12000, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600', 10),
(3, 'Jugo de naranja natural 200 ml', 'Individual, recién exprimido', 4500, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600', 15),
(3, 'Jugo de frutas 500 ml', 'Sabor surtido', 12000, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600', 12),
(3, 'Chocolatada 200 ml', 'Individual', 4000, 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600', 20),
(3, 'Chocolatada 500 ml', 'Familiar', 6500, 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600', 15),
(3, 'Yogurt bebible 140 gr', 'Individual', 4000, 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=600', 20),
(3, 'Yogurt bebible 350 gr', 'Familiar', 6000, 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=600', 15),
(3, 'Yogurt con cereal', 'Con cereales crocantes', 6500, 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=600', 12);

-- Postres (categoria_id = 4)
INSERT INTO productos (categoria_id, nombre, descripcion, precio, foto_url, stock) VALUES
(4, 'Alfajor de maicena', 'Con coco rallado y mucho dulce de leche', 7000, 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600', 20),
(4, 'Pastafrola', 'Porción individual, de membrillo', 9000, 'https://images.unsplash.com/photo-1519869325930-281384150729?w=600', 10),
(4, 'Brownie', 'Con nuez y chocolate', 12000, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600', 12);

-- Cafetería (categoria_id = 5)
INSERT INTO productos (categoria_id, nombre, descripcion, precio, foto_url, stock) VALUES
(5, 'Café negro corto', 'Espresso simple', 4000, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600', 40),
(5, 'Café cortado', 'Con un toque de leche', 5000, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600', 40),
(5, 'Café con leche', 'Cremoso y recién preparado', 5000, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600', 40),
(5, 'Capuccino', 'Con espuma de leche', 5000, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600', 30),
(5, 'Cocido con leche', 'Infusión tradicional paraguaya', 4000, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600', 30),
(5, 'Chocolate caliente', 'Ideal para el frío', 5000, 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600', 25);

-- ---------------------------------------------------------------------
-- pedidos
-- ---------------------------------------------------------------------
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    metodo_pago ENUM('Efectivo', 'Tarjeta') NOT NULL,
    estado ENUM('pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado') NOT NULL DEFAULT 'pendiente',
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    notas VARCHAR(255) NULL,
    factura_nombre VARCHAR(150) NULL,
    factura_ruc VARCHAR(30) NULL,
    codigo_ticket VARCHAR(20) UNIQUE NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- detalle_pedidos
-- ---------------------------------------------------------------------
CREATE TABLE detalle_pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- caja (apertura/cierre diario)
-- ---------------------------------------------------------------------
CREATE TABLE caja (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    fecha DATE NOT NULL,
    monto_apertura DECIMAL(10,2) NOT NULL DEFAULT 0,
    efectivo_contado DECIMAL(10,2) NULL,
    total_efectivo DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_tarjeta DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_egresos DECIMAL(10,2) NOT NULL DEFAULT 0,
    estado ENUM('abierta', 'cerrada') NOT NULL DEFAULT 'abierta',
    abierta_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    cerrada_en DATETIME NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- egresos (gastos menores dentro de una caja)
-- ---------------------------------------------------------------------
CREATE TABLE egresos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    caja_id INT NOT NULL,
    concepto VARCHAR(150) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (caja_id) REFERENCES caja(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- facturas
-- ---------------------------------------------------------------------
CREATE TABLE facturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    numero_comprobante VARCHAR(30) UNIQUE NOT NULL,
    ruc_documento VARCHAR(30) NULL,
    razon_social VARCHAR(150) NULL,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('emitida', 'anulada') NOT NULL DEFAULT 'emitida',
    emitida_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- empleados (Personal)
-- ---------------------------------------------------------------------
CREATE TABLE empleados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    rol VARCHAR(80) NOT NULL COMMENT 'Cajera, Cocinero, Apoyo de salon, etc.',
    telefono VARCHAR(30) NULL,
    turno VARCHAR(40) NULL COMMENT 'Ej: 07:00 - 13:00',
    activo TINYINT(1) NOT NULL DEFAULT 1,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- asistencia (marcacion de entrada/salida)
-- ---------------------------------------------------------------------
CREATE TABLE asistencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empleado_id INT NOT NULL,
    fecha DATE NOT NULL,
    entrada DATETIME NULL,
    salida DATETIME NULL,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- pagos_personal (sueldos y adelantos)
-- ---------------------------------------------------------------------
CREATE TABLE pagos_personal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empleado_id INT NOT NULL,
    tipo ENUM('adelanto', 'sueldo') NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- insumos (materia prima / stock de cocina)
-- ---------------------------------------------------------------------
CREATE TABLE insumos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    unidad VARCHAR(20) NOT NULL COMMENT 'kg, L, fetas, unidades, etc.',
    cantidad DECIMAL(10,2) NOT NULL DEFAULT 0,
    minimo DECIMAL(10,2) NOT NULL DEFAULT 0,
    vencimiento DATE NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO insumos (nombre, unidad, cantidad, minimo, vencimiento) VALUES
('Harina 000', 'kg', 25, 10, '2026-12-20'),
('Leche entera', 'L', 8, 10, '2026-09-12'),
('Jamón cocido', 'fetas', 120, 60, '2026-09-15'),
('Queso paraguay', 'kg', 4, 5, '2026-09-10'),
('Café molido', 'kg', 6, 3, '2027-03-01'),
('Carne molida', 'kg', 12, 8, '2026-09-09');

-- ---------------------------------------------------------------------
-- password_resets (recuperación de contraseña)
-- ---------------------------------------------------------------------
CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    expira_en DATETIME NOT NULL,
    usado TINYINT(1) NOT NULL DEFAULT 0,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Usuario admin por defecto (generar el hash real con password_hash())
-- ---------------------------------------------------------------------
INSERT INTO usuarios (nombre_completo, email, password_hash, rol) VALUES
('Administrador Cafetería', 'admin@provending.com', '$2y$10$REEMPLAZAR_CON_TU_HASH_REAL', 'admin');
