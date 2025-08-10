const {
    getOrdenes,
    getOrdenById,
    crearOrden,
    actualizarEstadoOrden
  } = require('../models/ordenesModel');
  
  async function listarOrdenes(req, res) {
    try {
      const ordenes = await getOrdenes();
      res.json(ordenes);
    } catch (err) {
      console.error('Error al listar órdenes:', err.message);
      res.status(500).json({ error: 'Error interno' });
    }
  }
  
  async function obtenerOrden(req, res) {
    try {
      const orden = await getOrdenById(req.params.id);
      if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
      res.json(orden);
    } catch (err) {
      console.error('Error al obtener orden:', err.message);
      res.status(500).json({ error: 'Error interno' });
    }
  }
  
  async function crearNuevaOrden(req, res) {
    try {
      const nuevaOrden = await crearOrden(req.body);
      res.status(201).json(nuevaOrden);
      
      await crearLog({
        usuario_id: 2, // 🔒 temporal hasta usar JWT
        accion: 'crear_orden',
        tabla: 'ordenes_trabajo',
        registro_id: nuevaOrden.id
      });
      
    } catch (err) {
      console.error('Error al crear orden:', err);
      res.status(500).json({ error: err.message });
    }
  }
  
  async function cambiarEstado(req, res) {
    try {
      const orden = await actualizarEstadoOrden(req.params.id, req.body.estado);
  
      await crearLog({
        usuario_id: 2,
        accion: 'actualizar_estado_orden',
        tabla: 'ordenes_trabajo',
        registro_id: orden.id
      });
  
      res.json(orden);
    } catch (err) {
      console.error('Error al actualizar estado:', err); // ✅ Importante para depuración
      res.status(500).json({ error: 'Error al actualizar estado' });
    }
  }  
  
  const { getOrdenDetallada } = require('../models/ordenesModel');

  async function detalleOrden(req, res) {
    try {
      const orden = await getOrdenDetallada(req.params.id);
      if (!orden) {
        return res.status(404).json({ error: 'Orden no encontrada' });
      }
      res.json(orden);
    } catch (err) {
      console.error('Error al obtener detalle de orden:', err);
      res.status(500).json({ error: err.message });
    }
  }  
  const { crearLog } = require('../models/logsAuditoriaModel');
  
  module.exports = {
    listarOrdenes,
    obtenerOrden,
    crearNuevaOrden,
    cambiarEstado,
    detalleOrden
  };
  
  