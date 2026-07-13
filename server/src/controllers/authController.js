const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { execQuery } = require('../config/db');

const PERFIL_QUERY = {
    Secretaria: 'SELECT id_secretaria AS id_perfil, nombre, apellido FROM secretaria WHERE id_usuario = @id_usuario',
    Profesor: 'SELECT id_profesor AS id_perfil, nombre, apellido, nivel_especialidad FROM profesor WHERE id_usuario = @id_usuario',
    Alumno: 'SELECT id_alumno AS id_perfil, nombre, apellido FROM alumno WHERE id_usuario = @id_usuario'
};

async function login(req, res, next) {
    try {
        const { correo_electronico, contrasenia } = req.body;

        const usuarioResult = await execQuery(
            'SELECT id_usuario, correo_electronico, contrasenia, rol FROM usuario WHERE correo_electronico = @correo',
            { correo: correo_electronico }
        );
        const usuario = usuarioResult.recordset[0];

        if (!usuario || !(await bcrypt.compare(contrasenia, usuario.contrasenia))) {
            return res.status(401).json({ message: 'Credenciales invalidas.' });
        }

        const perfilResult = await execQuery(PERFIL_QUERY[usuario.rol], { id_usuario: usuario.id_usuario });
        const perfil = perfilResult.recordset[0];

        const payload = {
            id_usuario: usuario.id_usuario,
            rol: usuario.rol,
            id_perfil: perfil.id_perfil,
            nombre: perfil.nombre,
            apellido: perfil.apellido
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '8h'
        });

        res.json({ token, usuario: payload });
    } catch (err) {
        next(err);
    }
}

module.exports = { login };
