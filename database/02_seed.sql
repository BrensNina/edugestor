/*=============================================================================
  EDUGESTOR - DATOS DE PRUEBA
  Requiere haber ejecutado 01_schema.sql. La contraseña de todos los usuarios
  de prueba es "demo1234" (ya viene hasheada con bcrypt para que funcione con
  el login del servidor).
=============================================================================*/

USE EduGestor_SQLServer_Actualizado;
GO

INSERT INTO usuario
(correo_electronico, contrasenia, rol)
VALUES
('secretaria@colegio.pe', '$2b$10$.Xj59Y.R1aQygy/z1xw02OniKTeRCw4SSoNMRvWD1RVgzLya1PYSi', 'Secretaria'),
('prof.perez@colegio.pe', '$2b$10$.Xj59Y.R1aQygy/z1xw02OniKTeRCw4SSoNMRvWD1RVgzLya1PYSi', 'Profesor'),
('prof.garcia@colegio.pe', '$2b$10$.Xj59Y.R1aQygy/z1xw02OniKTeRCw4SSoNMRvWD1RVgzLya1PYSi', 'Profesor'),
('ana.torres@colegio.pe', '$2b$10$.Xj59Y.R1aQygy/z1xw02OniKTeRCw4SSoNMRvWD1RVgzLya1PYSi', 'Alumno'),
('luis.ramos@colegio.pe', '$2b$10$.Xj59Y.R1aQygy/z1xw02OniKTeRCw4SSoNMRvWD1RVgzLya1PYSi', 'Alumno'),
('maria.lopez@colegio.pe', '$2b$10$.Xj59Y.R1aQygy/z1xw02OniKTeRCw4SSoNMRvWD1RVgzLya1PYSi', 'Alumno'),
('jorge.diaz@colegio.pe', '$2b$10$.Xj59Y.R1aQygy/z1xw02OniKTeRCw4SSoNMRvWD1RVgzLya1PYSi', 'Alumno'),
('carla.rojas@colegio.pe', '$2b$10$.Xj59Y.R1aQygy/z1xw02OniKTeRCw4SSoNMRvWD1RVgzLya1PYSi', 'Alumno'),
('diego.flores@colegio.pe', '$2b$10$.Xj59Y.R1aQygy/z1xw02OniKTeRCw4SSoNMRvWD1RVgzLya1PYSi', 'Alumno'),
('valeria.cruz@colegio.pe', '$2b$10$.Xj59Y.R1aQygy/z1xw02OniKTeRCw4SSoNMRvWD1RVgzLya1PYSi', 'Alumno');
GO

INSERT INTO secretaria
(id_usuario, nombre, apellido, dni)
VALUES
(1, 'Rosa', 'Mendoza', '12345678');
GO

INSERT INTO profesor
(id_usuario, nombre, apellido, dni, nivel_especialidad)
VALUES
(2, 'Carlos', 'Perez', '23456789', 'Secundaria'),
(3, 'Elena', 'Garcia', '34567890', 'Secundaria');
GO

INSERT INTO alumno
(id_usuario, nombre, apellido, dni, fecha_nacimiento, via_direccion, distrito)
VALUES
(4, 'Ana', 'Torres', '45678901', '2012-04-15', 'Av. Los Jardines 120', 'San Miguel'),
(5, 'Luis', 'Ramos', '56789012', '2012-08-20', 'Jr. Las Flores 450', 'Pueblo Libre'),
(6, 'Maria', 'Lopez', '67890123', '2012-01-10', 'Calle Lima 230', 'Breña'),
(7, 'Jorge', 'Diaz', '78901234', '2012-06-05', 'Jr. Union 88', 'Lince'),
(8, 'Carla', 'Rojas', '89012345', '2011-11-22', 'Av. Brasil 300', 'Jesus Maria'),
(9, 'Diego', 'Flores', '90123456', '2012-02-18', 'Calle Tacna 55', 'Magdalena'),
(10, 'Valeria', 'Cruz', '01234567', '2011-09-30', 'Av. Salaverry 210', 'San Isidro');
GO

INSERT INTO grado
(nivel, numero_grado)
VALUES
('Inicial', '3 años'),
('Inicial', '4 años'),
('Inicial', '5 años'),
('Primaria', '1ro'),
('Primaria', '2do'),
('Primaria', '3ro'),
('Primaria', '4to'),
('Primaria', '5to'),
('Primaria', '6to'),
('Secundaria', '1ro'),
('Secundaria', '2do'),
('Secundaria', '3ro'),
('Secundaria', '4to'),
('Secundaria', '5to');
GO

INSERT INTO seccion
(letra)
VALUES
('A'),
('B');
GO

INSERT INTO turno
(nombre_turno)
VALUES
('Mañana'),
('Tarde'),
('Noche');
GO

INSERT INTO curso
(nombre_curso)
VALUES
('Matemática'),
('Comunicación'),
('Ciencia y Tecnología'),
('Personal Social'),
('Inglés'),
('Arte y Cultura'),
('Educación Física'),
('Religión'),
('Psicomotricidad'),
('Álgebra'),
('Lenguaje');
GO

INSERT INTO periodo_academico
(anio_academico, nombre, fecha_inicio, fecha_fin, esta_activo)
VALUES
(2026, 'Bimestre I', '2026-03-01', '2026-05-09', 1),
(2026, 'Bimestre II', '2026-05-12', '2026-07-18', 0),
(2026, 'Bimestre III', '2026-08-04', '2026-10-10', 0),
(2026, 'Bimestre IV', '2026-10-13', '2026-12-19', 0),
(2025, 'Bimestre I', '2025-03-03', '2025-05-09', 1),
(2025, 'Bimestre II', '2025-05-12', '2025-07-18', 1);
GO

INSERT INTO aula_periodo
(id_grado, id_seccion, id_turno, anio_academico,
 aforo_maximo, cantidad_matriculados)
VALUES
(12, 1, 1, 2026, 30, 5),
(13, 2, 2, 2026, 30, 2),
(12, 1, 1, 2027, 30, 0),
(11, 2, 1, 2026, 25, 0);
GO

INSERT INTO matricula
(id_alumno, id_aula_periodo, anio_academico, fecha_matricula)
VALUES
(1, 1, 2026, '2026-02-10 08:30:00'),
(2, 1, 2026, '2026-02-10 09:00:00'),
(3, 1, 2026, '2026-02-11 10:00:00'),
(4, 1, 2026, '2026-02-12 08:15:00'),
(5, 1, 2026, '2026-02-12 08:45:00'),
(6, 2, 2026, '2026-02-13 09:00:00'),
(7, 2, 2026, '2026-02-13 09:20:00');
GO

INSERT INTO curso_aula
(id_aula_periodo, id_curso, id_profesor)
VALUES
(1, 1, 1),
(1, 2, 2),
(1, 3, 1),
(2, 1, 1),
(2, 4, 2),
(4, 1, 1),
(4, 2, 2);
GO

INSERT INTO horario_clase
(id_aula_periodo, id_curso_aula, dia_semana, hora_inicio, hora_fin)
VALUES
(1, 1, 'Lunes', '08:00:00', '09:30:00'),
(1, 2, 'Lunes', '09:45:00', '11:15:00'),
(1, 3, 'Martes', '08:00:00', '09:30:00'),
(1, 1, 'Miércoles', '08:00:00', '09:30:00'),
(1, 2, 'Jueves', '09:45:00', '11:15:00'),
(1, 3, 'Viernes', '11:30:00', '13:00:00');
GO

INSERT INTO evaluacion
(id_curso_aula, id_periodo, nombre, peso, fecha)
VALUES
(1, 1, 'Practica 1', 1.00, '2026-03-20'),
(1, 1, 'Examen parcial', 2.00, '2026-04-15'),
(2, 1, 'Comprension lectora', 1.00, '2026-03-25'),
(3, 1, 'Proyecto de ciencias', 2.00, '2026-04-20'),
(4, 1, 'Practica 1', 1.00, '2026-03-22'),
(4, 1, 'Examen parcial', 2.00, '2026-04-18'),
(5, 1, 'Trabajo grupal', 1.00, '2026-03-27');
GO

INSERT INTO calificacion
(id_evaluacion, id_matricula, nota, observacion, registrado_en)
VALUES
(1, 1, 16.00, 'Buen trabajo', '2026-03-20 14:00:00'),
(1, 2, 10.00, 'Debe practicar mas', '2026-03-20 14:05:00'),
(1, 3, 18.00, 'Excelente', '2026-03-20 14:10:00'),
(2, 1, 15.00, NULL, '2026-04-15 14:00:00'),
(2, 2, 9.00, 'Necesita reforzamiento', '2026-04-15 14:05:00'),
(2, 3, 17.00, NULL, '2026-04-15 14:10:00'),
(3, 1, 17.00, NULL, '2026-03-25 15:00:00'),
(3, 2, 12.00, NULL, '2026-03-25 15:05:00'),
(3, 3, 16.00, NULL, '2026-03-25 15:10:00'),
(4, 1, 18.00, 'Buen proyecto', '2026-04-20 16:00:00'),
(4, 2, 11.00, NULL, '2026-04-20 16:05:00'),
(4, 3, 19.00, 'Excelente proyecto', '2026-04-20 16:10:00'),
(1, 4, 9.00, 'Debe reforzar operaciones basicas', '2026-03-20 14:15:00'),
(1, 5, 15.00, NULL, '2026-03-20 14:20:00'),
(2, 4, 8.00, 'Necesita apoyo', '2026-04-15 14:15:00'),
(2, 5, 16.00, NULL, '2026-04-15 14:20:00'),
(3, 4, 14.00, NULL, '2026-03-25 15:15:00'),
(3, 5, 17.00, NULL, '2026-03-25 15:20:00'),
(4, 4, 10.00, 'Presento el proyecto incompleto', '2026-04-20 16:15:00'),
(4, 5, 19.00, 'Excelente proyecto', '2026-04-20 16:20:00'),
(5, 6, 8.00, 'Debe reforzar operaciones basicas', '2026-03-22 10:00:00'),
(5, 7, 17.00, NULL, '2026-03-22 10:05:00'),
(6, 6, 7.00, 'Necesita apoyo urgente', '2026-04-18 10:00:00'),
(6, 7, 18.00, NULL, '2026-04-18 10:05:00'),
(7, 6, 13.00, NULL, '2026-03-27 11:00:00'),
(7, 7, 15.00, NULL, '2026-03-27 11:05:00');
GO

/* id_horario identifica la clase del horario a la que corresponde
   cada registro de asistencia. */
INSERT INTO asistencia
(id_horario, id_matricula, fecha, estado)
VALUES
(1, 1, '2026-03-09', 'Presente'),
(1, 2, '2026-03-09', 'Tarde'),
(1, 3, '2026-03-09', 'Presente'),
(2, 1, '2026-03-09', 'Presente'),
(2, 2, '2026-03-09', 'Ausente'),
(2, 3, '2026-03-09', 'Justificado'),
(3, 1, '2026-03-10', 'Presente'),
(3, 2, '2026-03-10', 'Presente'),
(3, 3, '2026-03-10', 'Presente'),
(1, 4, '2026-03-09', 'Presente'),
(1, 5, '2026-03-09', 'Presente'),
(2, 4, '2026-03-09', 'Presente'),
(2, 5, '2026-03-09', 'Presente'),
(3, 4, '2026-03-10', 'Presente'),
(3, 5, '2026-03-10', 'Presente'),
(1, 1, '2026-03-16', 'Presente'),
(1, 3, '2026-03-16', 'Presente'),
(1, 2, '2026-03-16', 'Ausente'),
(1, 1, '2026-03-23', 'Presente'),
(1, 3, '2026-03-23', 'Presente'),
(1, 2, '2026-03-23', 'Ausente'),
(1, 1, '2026-03-30', 'Presente'),
(1, 3, '2026-03-30', 'Presente'),
(1, 2, '2026-03-30', 'Ausente'),
(1, 1, '2026-04-06', 'Presente'),
(1, 3, '2026-04-06', 'Presente'),
(1, 2, '2026-04-06', 'Presente');
GO

INSERT INTO auditoria
(tabla, accion, id_registro, datos, usuario_db, fecha)
VALUES
('matricula', 'INSERT', 1,
 'Se registro la matricula del alumno 1',
 'administrador', '2026-02-10 08:30:00'),
('calificacion', 'INSERT', 1,
 'Se registro la nota 16 del alumno 1',
 'profesor_perez', '2026-03-20 14:00:00'),
('asistencia', 'INSERT', 1,
 'Se registro la asistencia del alumno 1',
 'profesor_perez', '2026-03-09 09:35:00');
GO

PRINT 'Datos de prueba insertados correctamente.';
GO
