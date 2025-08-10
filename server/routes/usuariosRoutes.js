
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUsuarioByEmail } = require('../models/usuariosModel');
const { listarUsuarios } = require('../controllers/usuariosController');

const router = express.Router();

// Clave secreta para JWT desde variables de entorno
const JWT_SECRET = process.env.JWT_SECRET;

// Ruta de login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validar entrada
    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    try {
        // Obtener usuario por email
        const usuario = await getUsuarioByEmail(email);
        if (!usuario) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, usuario.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Generar JWT
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol_id },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Responder con el token y datos del usuario
        res.json({
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol_id: usuario.rol_id,
            },
        });
    } catch (error) {
        console.error('Error en /login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/usuarios', listarUsuarios);

module.exports = router;