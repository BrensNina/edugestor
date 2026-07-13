const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado.' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token invalido o expirado.' });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ message: 'No tiene permisos para esta accion.' });
        }
        next();
    };
}

function requireOwnAlumno(paramName) {
    return (req, res, next) => {
        const esPersonalDelColegio = req.user.rol === 'Secretaria' || req.user.rol === 'Profesor';
        const esElPropioAlumno = req.user.rol === 'Alumno'
            && String(req.user.id_perfil) === String(req.params[paramName]);

        if (esPersonalDelColegio || esElPropioAlumno) {
            return next();
        }
        res.status(403).json({ message: 'No tiene permisos para esta accion.' });
    };
}

function requireOwnProfesor(paramName) {
    return (req, res, next) => {
        const esSecretaria = req.user.rol === 'Secretaria';
        const esElPropioProfesor = req.user.rol === 'Profesor'
            && String(req.user.id_perfil) === String(req.params[paramName]);

        if (esSecretaria || esElPropioProfesor) {
            return next();
        }
        res.status(403).json({ message: 'No tiene permisos para esta accion.' });
    };
}

module.exports = { authenticate, requireRole, requireOwnAlumno, requireOwnProfesor };
