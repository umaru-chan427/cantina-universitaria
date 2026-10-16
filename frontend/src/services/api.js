import axios from 'axios';

const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } });

// Auth
export const registrarUsuario = (data) => api.post('/auth.php?accion=registro', data);
export const loginUsuario = (data) => api.post('/auth.php?accion=login', data);
export const solicitarRecuperacion = (data) => api.post('/auth.php?accion=solicitar-recuperacion', data);
export const restablecerPassword = (data) => api.post('/auth.php?accion=restablecer', data);

// Catálogo
export const obtenerCategorias = () => api.get('/categorias.php');
export const obtenerProductos = () => api.get('/productos.php');
export const crearProducto = (data) => api.post('/productos.php', data);
export const actualizarProducto = (data) => api.put('/productos.php', data);
export const ajustarStock = (id, delta) => api.put('/productos.php?accion=stock', { id, delta });
export const alternarHabilitado = (id) => api.put('/productos.php?accion=habilitar', { id });
export const eliminarProducto = (id) => api.delete(`/productos.php?id=${id}`);

// Pedidos
export const crearPedido = (data) => api.post('/pedidos.php', data);
export const obtenerPedidos = (usuarioId) => api.get(usuarioId ? `/pedidos.php?usuario_id=${usuarioId}` : '/pedidos.php');
export const obtenerTablero = () => api.get('/pedidos.php?accion=tablero');
export const consultarSeguimiento = (id) => api.get(`/pedidos.php?accion=seguimiento&id=${id}`);
export const cambiarEstadoPedido = (id, estado) => api.put('/pedidos.php?accion=estado', { id, estado });

// Caja
export const abrirCaja = (data) => api.post('/caja.php?accion=abrir', data);
export const cerrarCaja = (data) => api.post('/caja.php?accion=cerrar', data);
export const estadoCaja = () => api.get('/caja.php?accion=estado');
export const registrarEgreso = (data) => api.post('/caja.php?accion=egreso', data);

// Facturación
export const obtenerFacturas = () => api.get('/facturas.php');
export const anularFactura = (id) => api.put('/facturas.php?accion=anular', { id });

// Personal
export const obtenerEmpleados = () => api.get('/empleados.php');
export const crearEmpleado = (data) => api.post('/empleados.php', data);
export const eliminarEmpleado = (id) => api.delete(`/empleados.php?id=${id}`);
export const marcarEntrada = (empleadoId) => api.post('/asistencia.php?accion=entrada', { empleado_id: empleadoId });
export const marcarSalida = (empleadoId) => api.post('/asistencia.php?accion=salida', { empleado_id: empleadoId });
export const obtenerPagos = () => api.get('/pagos.php');
export const registrarPago = (data) => api.post('/pagos.php', data);

// Insumos
export const obtenerInsumos = () => api.get('/insumos.php');
export const crearInsumo = (data) => api.post('/insumos.php', data);
export const ajustarInsumo = (id, delta) => api.put('/insumos.php?accion=cantidad', { id, delta });
export const eliminarInsumo = (id) => api.delete(`/insumos.php?id=${id}`);

export default api;
