const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const catalogoRoutes = require('./routes/catalogoRoutes');
const personaRoutes = require('./routes/personaRoutes');
const periodoRoutes = require('./routes/periodoRoutes');
const aulaRoutes = require('./routes/aulaRoutes');
const profesorRoutes = require('./routes/profesorRoutes');
const notaRoutes = require('./routes/notaRoutes');
const asistenciaRoutes = require('./routes/asistenciaRoutes');
const alumnoRoutes = require('./routes/alumnoRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/catalogos', catalogoRoutes);
app.use('/api/personas', personaRoutes);
app.use('/api/periodos', periodoRoutes);
app.use('/api/aulas', aulaRoutes);
app.use('/api/profesores', profesorRoutes);
app.use('/api/notas', notaRoutes);
app.use('/api/asistencias', asistenciaRoutes);
app.use('/api/alumnos', alumnoRoutes);
app.use('/api/reportes', reporteRoutes);

app.use(errorHandler);

module.exports = app;
