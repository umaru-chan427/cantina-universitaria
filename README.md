# Cantina Universitaria (v2)

Recreación del prototipo con: pantalla de acceso con foto real de fondo, catálogo con categorías fotográficas, carrito lateral con datos de facturación, panel de cantina con tablero Kanban de pedidos, caja diaria con arqueo y egresos, facturación con numeración estilo timbrado, personal con marcación de entrada/salida y sueldos/adelantos, e inventario con productos + insumos y materia prima.

Stack: **React + Vite + Tailwind CSS** · **PHP (PDO) + MySQL** · **XAMPP** + **VS Code**.

## 1. Backend (XAMPP)

1. Copiá `backend/` a `C:\xampp\htdocs\cantina-universitaria\backend`.
2. Importá `database/cantina_db.sql` en phpMyAdmin (crea `cantina_db` con todas las tablas y datos de ejemplo).
3. Iniciá Apache y MySQL en XAMPP.
4. Generá la contraseña real del admin: creá un archivo temporal `backend/generar_hash.php` con
   `<?php echo password_hash('Admin123!', PASSWORD_BCRYPT);`, abrilo en el navegador, copiá el hash
   y reemplazalo en la tabla `usuarios` (columna `password_hash` del usuario `admin@cantina.com`) desde phpMyAdmin.
   Borrá el archivo después.

## 2. Frontend (VS Code)

```bash
cd frontend
npm install
npm run dev
```

Abrí `http://localhost:5173`. El proxy de Vite redirige `/api/*` al backend PHP (ajustá `target` en `vite.config.js` si tu ruta de XAMPP es distinta).

## 3. Flujo de la app

- **Pantalla de acceso** (`/`): login o registro de alumno, con opción "Acceso personal de cantina".
- **Vista alumno**: catálogo con categorías fotográficas, buscador, carrito lateral (método de pago, nota, datos de factura) y banner de pedido confirmado con código y estado.
- **Vista cantina** (solo para cuentas con rol `admin`/`cantina`): tablero de pedidos en tiempo real (Pendiente → En preparación → Listo → Entregado), caja diaria con arqueo y egresos, facturación con comprobantes tipo timbrado, personal (marcación + sueldos/adelantos), e inventario (productos + insumos).

## 4. Estructura

```
cantina-universitaria/
├── database/cantina_db.sql
├── backend/
│   ├── config/ (db.php, images.php)
│   ├── helpers/response.php
│   └── api/ (auth, categorias, productos, pedidos, caja, facturas, empleados, asistencia, pagos, insumos)
└── frontend/src/
    ├── components/ (AccesoAlumno, Navbar, Catalogo, ProductCard, CartDrawer, PedidoConfirmadoBanner)
    └── admin/ (AccesoCantina, AdminDashboard, PedidosKanban, CajaDiaria, Facturacion, Personal, Inventario, ModalProducto)
```

## 5. Notas de seguridad para producción

- Contraseñas con `password_hash` (bcrypt).
- Agregá autenticación por token (JWT) antes de exponer la API públicamente.
- Cambiá `Access-Control-Allow-Origin: *` por el dominio real antes de publicar.
