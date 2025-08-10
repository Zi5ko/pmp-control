const bcrypt = require('bcryptjs');
const { crearUsuario } = require('./models/usuariosModel');

async function crearUsuarioPrueba() {
  const nombre = 'Francisco Vargas';
  const email = 'fco.vargas.petros@gmail.com';
  const passwordPlano = 'pmpcontrol1307';
  const rol_id = 1; // administrador

  try {
    const password_hash = await bcrypt.hash(passwordPlano, 10);

    const nuevoUsuario = await crearUsuario({
      nombre,
      email,
      password_hash,
      rol_id
    });

    console.log('✅ Usuario creado:', nuevoUsuario);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al crear usuario:', err.message);
    process.exit(1);
  }
}

crearUsuarioPrueba();
