const bcrypt = require('bcryptjs');
const { sql, getPool, execQuery } = require('../config/db');

async function listarProfesores(req, res, next) {
    try {
        const result = await execQuery(
            `SELECT p.id_profesor, p.nombre, p.apellido, p.dni, p.nivel_especialidad, u.correo_electronico
             FROM profesor p INNER JOIN usuario u ON u.id_usuario = p.id_usuario
             ORDER BY p.apellido, p.nombre`
        );
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

async function listarAlumnos(req, res, next) {
    try {
        const result = await execQuery(
            `SELECT a.id_alumno, a.nombre, a.apellido, a.dni, a.fecha_nacimiento, u.correo_electronico
             FROM alumno a INNER JOIN usuario u ON u.id_usuario = a.id_usuario
             ORDER BY a.apellido, a.nombre`
        );
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

async function crearUsuarioConPerfil(rol, datosPerfilInsert, { correo_electronico, contrasenia }) {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        const hash = await bcrypt.hash(contrasenia, 10);

        const usuarioResult = await new sql.Request(transaction)
            .input('correo', correo_electronico)
            .input('hash', hash)
            .input('rol', rol)
            .query(`
                INSERT INTO usuario (correo_electronico, contrasenia, rol)
                OUTPUT INSERTED.id_usuario
                VALUES (@correo, @hash, @rol)
            `);
        const id_usuario = usuarioResult.recordset[0].id_usuario;

        const perfilResult = await datosPerfilInsert(transaction, id_usuario);

        await transaction.commit();
        return perfilResult;
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

async function crearProfesor(req, res, next) {
    try {
        const { correo_electronico, contrasenia, nombre, apellido, dni, nivel_especialidad } = req.body;

        const perfil = await crearUsuarioConPerfil('Profesor', async (transaction, id_usuario) => {
            const result = await new sql.Request(transaction)
                .input('id_usuario', id_usuario)
                .input('nombre', nombre)
                .input('apellido', apellido)
                .input('dni', dni)
                .input('nivel', nivel_especialidad)
                .query(`
                    INSERT INTO profesor (id_usuario, nombre, apellido, dni, nivel_especialidad)
                    OUTPUT INSERTED.*
                    VALUES (@id_usuario, @nombre, @apellido, @dni, @nivel)
                `);
            return result.recordset[0];
        }, { correo_electronico, contrasenia });

        res.status(201).json(perfil);
    } catch (err) {
        next(err);
    }
}

async function crearAlumno(req, res, next) {
    try {
        const { correo_electronico, contrasenia, nombre, apellido, dni, fecha_nacimiento, via_direccion, distrito } = req.body;

        const perfil = await crearUsuarioConPerfil('Alumno', async (transaction, id_usuario) => {
            const result = await new sql.Request(transaction)
                .input('id_usuario', id_usuario)
                .input('nombre', nombre)
                .input('apellido', apellido)
                .input('dni', dni)
                .input('fecha_nacimiento', fecha_nacimiento)
                .input('via_direccion', via_direccion || null)
                .input('distrito', distrito || null)
                .query(`
                    INSERT INTO alumno (id_usuario, nombre, apellido, dni, fecha_nacimiento, via_direccion, distrito)
                    OUTPUT INSERTED.*
                    VALUES (@id_usuario, @nombre, @apellido, @dni, @fecha_nacimiento, @via_direccion, @distrito)
                `);
            return result.recordset[0];
        }, { correo_electronico, contrasenia });

        res.status(201).json(perfil);
    } catch (err) {
        next(err);
    }
}

module.exports = { crearProfesor, crearAlumno, listarProfesores, listarAlumnos };
