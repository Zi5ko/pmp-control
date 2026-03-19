//server/middlewares/orders.js

const ESTADOS_PERMITIDOS = ['pendiente', 'asignada', 'realizada', 'reprogramada', 'omitida', 'validada', 'firmada'];

function validarEstadoOrden(req, res, next) {
  const { estado } = req.body;

  if (estado && !ESTADOS_PERMITIDOS.includes(estado)) {
    return res.status(400).json({ error: `Estado no válido. Permitidos: ${ESTADOS_PERMITIDOS.join(', ')}` });
  }

  next();
}

module.exports = validarEstadoOrden;