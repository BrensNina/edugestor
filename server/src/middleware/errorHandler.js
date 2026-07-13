function errorHandler(err, req, res, next) {
    const sqlNumber = err.number;

    if (sqlNumber >= 50000) {
        return res.status(400).json({ message: err.message });
    }

    if (sqlNumber === 547) {
        return res.status(400).json({ message: 'La operacion viola una restriccion de la base de datos.' });
    }

    if (sqlNumber === 2627 || sqlNumber === 2601) {
        return res.status(409).json({ message: 'El registro ya existe.' });
    }

    console.error(err);
    res.status(500).json({ message: 'Error interno del servidor.' });
}

module.exports = errorHandler;
