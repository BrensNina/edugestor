/*=============================================================================
  EDUGESTOR - INDICES Y OBJETOS DE PROGRAMACION
  Requiere haber ejecutado 01_schema.sql (y opcionalmente 02_seed.sql).

  CONTIENE:
  - 11 indices nonclustered.
  - 10 vistas.
  - 2 funciones definidas por el usuario.
  - 6 stored procedures operativos con transacciones y manejo de errores.
  - 9 triggers de validacion y auditoria.
  - 4 stored procedures con cursores, cada uno atado a un requerimiento
    funcional (RF) o no funcional (RNF) del sistema.
=============================================================================*/

USE EduGestor_SQLServer_Actualizado;
GO

/*=============================================================================
  PARTE 1. INDICES NONCLUSTERED

  Las PK del archivo 01 ya tienen indices CLUSTERED.
  Las restricciones UNIQUE tambien crean indices automaticamente.
=============================================================================*/

/* Acelera la busqueda de matriculas por aula. */
CREATE NONCLUSTERED INDEX IX_matricula_aula
ON matricula (id_aula_periodo)
INCLUDE (id_alumno, anio_academico);
GO

/* Acelera la busqueda de las aulas donde se dicta un curso. */
CREATE NONCLUSTERED INDEX IX_curso_aula_curso
ON curso_aula (id_curso)
INCLUDE (id_aula_periodo, id_profesor);
GO

/* Acelera la busqueda de materias y carga horaria por profesor. */
CREATE NONCLUSTERED INDEX IX_curso_aula_profesor
ON curso_aula (id_profesor)
INCLUDE (id_aula_periodo, id_curso);
GO

/* Acelera la relacion entre las materias y sus horarios. */
CREATE NONCLUSTERED INDEX IX_horario_curso_aula
ON horario_clase (id_curso_aula)
INCLUDE (dia_semana, hora_inicio, hora_fin, id_aula_periodo);
GO

/* Ayuda a comparar clases del mismo dia para detectar cruces. */
CREATE NONCLUSTERED INDEX IX_horario_dia_horas
ON horario_clase (dia_semana, hora_inicio, hora_fin)
INCLUDE (id_curso_aula, id_aula_periodo);
GO

/* Acelera la busqueda de evaluaciones por periodo. */
CREATE NONCLUSTERED INDEX IX_evaluacion_periodo
ON evaluacion (id_periodo)
INCLUDE (id_curso_aula, nombre, peso, fecha);
GO

/* Acelera la busqueda de notas por matricula. */
CREATE NONCLUSTERED INDEX IX_calificacion_matricula
ON calificacion (id_matricula)
INCLUDE (id_evaluacion, nota, observacion);
GO

/* Acelera el historial y porcentaje de asistencia de un alumno. */
CREATE NONCLUSTERED INDEX IX_asistencia_matricula
ON asistencia (id_matricula)
INCLUDE (id_horario, fecha, estado);
GO

/* Acelera la asistencia por fecha y horario. */
CREATE NONCLUSTERED INDEX IX_asistencia_fecha_horario
ON asistencia (fecha, id_horario)
INCLUDE (id_matricula, estado);
GO

/* Acelera la busqueda del periodo activo de cada año. */
CREATE NONCLUSTERED INDEX IX_periodo_anio_activo
ON periodo_academico (anio_academico, esta_activo)
INCLUDE (nombre, fecha_inicio, fecha_fin);
GO

/* Acelera la consulta del historial de auditoria de una tabla por fecha. */
CREATE NONCLUSTERED INDEX IX_auditoria_tabla_fecha
ON auditoria (tabla, fecha)
INCLUDE (accion, id_registro, usuario_db);
GO

/*=============================================================================
  PARTE 2. VISTAS
=============================================================================*/

/* Muestra alumnos matriculados con grado, seccion, turno y año. */
CREATE OR ALTER VIEW vw_alumnos_matriculados
AS
SELECT
    m.id_matricula,
    a.id_alumno,
    a.nombre,
    a.apellido,
    a.dni,
    ap.id_aula_periodo,
    g.nivel,
    g.numero_grado,
    s.letra AS seccion,
    t.nombre_turno,
    m.anio_academico,
    m.fecha_matricula
FROM matricula m
INNER JOIN alumno a ON a.id_alumno = m.id_alumno
INNER JOIN aula_periodo ap ON ap.id_aula_periodo = m.id_aula_periodo
INNER JOIN grado g ON g.id_grado = ap.id_grado
INNER JOIN seccion s ON s.id_seccion = ap.id_seccion
INNER JOIN turno t ON t.id_turno = ap.id_turno;
GO

/* Muestra las aulas que tienen cupos disponibles. */
CREATE OR ALTER VIEW vw_aulas_disponibles
AS
SELECT
    ap.id_aula_periodo,
    g.nivel,
    g.numero_grado,
    s.letra AS seccion,
    t.nombre_turno,
    ap.anio_academico,
    ap.aforo_maximo,
    ap.cantidad_matriculados,
    ap.aforo_maximo - ap.cantidad_matriculados AS cupos_disponibles
FROM aula_periodo ap
INNER JOIN grado g ON g.id_grado = ap.id_grado
INNER JOIN seccion s ON s.id_seccion = ap.id_seccion
INNER JOIN turno t ON t.id_turno = ap.id_turno
WHERE ap.cantidad_matriculados < ap.aforo_maximo;
GO

/* Clasifica cada aula como Disponible, Por llenarse o Llena. */
CREATE OR ALTER VIEW vw_ocupacion_aulas
AS
SELECT
    ap.id_aula_periodo,
    g.nivel,
    g.numero_grado,
    s.letra AS seccion,
    t.nombre_turno,
    ap.anio_academico,
    ap.cantidad_matriculados,
    ap.aforo_maximo,
    ap.cantidad_matriculados * 100.0 / ap.aforo_maximo AS porcentaje_ocupacion,
    CASE
        WHEN ap.cantidad_matriculados = ap.aforo_maximo THEN 'Llena'
        WHEN ap.cantidad_matriculados >= ap.aforo_maximo * 0.80 THEN 'Por llenarse'
        ELSE 'Disponible'
    END AS estado_aula
FROM aula_periodo ap
INNER JOIN grado g ON g.id_grado = ap.id_grado
INNER JOIN seccion s ON s.id_seccion = ap.id_seccion
INNER JOIN turno t ON t.id_turno = ap.id_turno;
GO

/* Muestra los cursos y profesores asignados a cada aula. */
CREATE OR ALTER VIEW vw_materias_aula
AS
SELECT
    ca.id_curso_aula,
    ap.id_aula_periodo,
    ap.anio_academico,
    g.nivel,
    g.numero_grado,
    s.letra AS seccion,
    c.id_curso,
    c.nombre_curso,
    p.id_profesor,
    p.nombre AS nombre_profesor,
    p.apellido AS apellido_profesor,
    p.nivel_especialidad
FROM curso_aula ca
INNER JOIN aula_periodo ap ON ap.id_aula_periodo = ca.id_aula_periodo
INNER JOIN grado g ON g.id_grado = ap.id_grado
INNER JOIN seccion s ON s.id_seccion = ap.id_seccion
INNER JOIN curso c ON c.id_curso = ca.id_curso
LEFT JOIN profesor p ON p.id_profesor = ca.id_profesor;
GO

/* Reune el calendario semanal de los alumnos. numero_dia ayuda a React a
   ordenar desde lunes hasta viernes. */
CREATE OR ALTER VIEW vw_horario_alumno
AS
SELECT
    a.id_alumno,
    a.nombre,
    a.apellido,
    m.anio_academico,
    h.id_horario,
    h.dia_semana,
    h.hora_inicio,
    h.hora_fin,
    c.nombre_curso,
    p.nombre AS nombre_profesor,
    p.apellido AS apellido_profesor,
    CASE h.dia_semana
        WHEN 'Lunes' THEN 1
        WHEN 'Martes' THEN 2
        WHEN 'Miércoles' THEN 3
        WHEN 'Jueves' THEN 4
        WHEN 'Viernes' THEN 5
    END AS numero_dia
FROM alumno a
INNER JOIN matricula m ON m.id_alumno = a.id_alumno
INNER JOIN horario_clase h ON h.id_aula_periodo = m.id_aula_periodo
INNER JOIN curso_aula ca ON ca.id_curso_aula = h.id_curso_aula
INNER JOIN curso c ON c.id_curso = ca.id_curso
LEFT JOIN profesor p ON p.id_profesor = ca.id_profesor;
GO

/* Calcula el promedio ponderado y estado por alumno, curso y periodo. */
CREATE OR ALTER VIEW vw_boleta_alumno
AS
SELECT
    a.id_alumno,
    a.nombre,
    a.apellido,
    c.id_curso,
    c.nombre_curso,
    pa.id_periodo,
    pa.nombre AS periodo,
    pa.anio_academico,
    CASE
        WHEN SUM(e.peso) = 0 THEN 0
        ELSE SUM(cal.nota * e.peso) / SUM(e.peso)
    END AS promedio,
    CASE
        WHEN SUM(e.peso) = 0 THEN 'Sin promedio'
        WHEN SUM(cal.nota * e.peso) / SUM(e.peso) >= 11 THEN 'Aprobado'
        ELSE 'Desaprobado'
    END AS estado
FROM calificacion cal
INNER JOIN matricula m ON m.id_matricula = cal.id_matricula
INNER JOIN alumno a ON a.id_alumno = m.id_alumno
INNER JOIN evaluacion e ON e.id_evaluacion = cal.id_evaluacion
INNER JOIN periodo_academico pa ON pa.id_periodo = e.id_periodo
INNER JOIN curso_aula ca ON ca.id_curso_aula = e.id_curso_aula
INNER JOIN curso c ON c.id_curso = ca.id_curso
GROUP BY
    a.id_alumno, a.nombre, a.apellido,
    c.id_curso, c.nombre_curso,
    pa.id_periodo, pa.nombre, pa.anio_academico;
GO

/* Genera el acta general con promedio por materia, periodo y alumno. */
CREATE OR ALTER VIEW vw_acta_curso
AS
SELECT
    ca.id_curso_aula,
    c.nombre_curso,
    p.id_profesor,
    m.id_matricula,
    a.id_alumno,
    a.nombre,
    a.apellido,
    e.id_periodo,
    CASE
        WHEN SUM(e.peso) = 0 THEN 0
        ELSE SUM(cal.nota * e.peso) / SUM(e.peso)
    END AS promedio,
    CASE
        WHEN SUM(e.peso) = 0 THEN 'Sin promedio'
        WHEN SUM(cal.nota * e.peso) / SUM(e.peso) >= 11 THEN 'Aprobado'
        ELSE 'Desaprobado'
    END AS estado
FROM curso_aula ca
INNER JOIN curso c ON c.id_curso = ca.id_curso
LEFT JOIN profesor p ON p.id_profesor = ca.id_profesor
INNER JOIN matricula m ON m.id_aula_periodo = ca.id_aula_periodo
INNER JOIN alumno a ON a.id_alumno = m.id_alumno
INNER JOIN evaluacion e ON e.id_curso_aula = ca.id_curso_aula
INNER JOIN calificacion cal
    ON cal.id_evaluacion = e.id_evaluacion
   AND cal.id_matricula = m.id_matricula
GROUP BY
    ca.id_curso_aula, c.nombre_curso, p.id_profesor,
    m.id_matricula, a.id_alumno, a.nombre, a.apellido, e.id_periodo;
GO

/* Resume sesiones, asistencias y porcentaje por alumno y curso.
   Presente y Tarde cuentan como asistencia. */
CREATE OR ALTER VIEW vw_asistencia_alumno
AS
SELECT
    a.id_alumno,
    a.nombre,
    a.apellido,
    c.id_curso,
    c.nombre_curso,
    COUNT(*) AS total_sesiones,
    SUM(CASE WHEN asi.estado IN ('Presente', 'Tarde') THEN 1 ELSE 0 END)
        AS sesiones_asistidas,
    SUM(CASE WHEN asi.estado = 'Ausente' THEN 1 ELSE 0 END) AS ausencias,
    SUM(CASE WHEN asi.estado = 'Justificado' THEN 1 ELSE 0 END) AS justificados,
    SUM(CASE WHEN asi.estado IN ('Presente', 'Tarde') THEN 1.0 ELSE 0.0 END)
        * 100 / COUNT(*) AS porcentaje_asistencia
FROM asistencia asi
INNER JOIN matricula m ON m.id_matricula = asi.id_matricula
INNER JOIN alumno a ON a.id_alumno = m.id_alumno
INNER JOIN horario_clase h ON h.id_horario = asi.id_horario
INNER JOIN curso_aula ca ON ca.id_curso_aula = h.id_curso_aula
INNER JOIN curso c ON c.id_curso = ca.id_curso
GROUP BY a.id_alumno, a.nombre, a.apellido, c.id_curso, c.nombre_curso;
GO

/* Consolida clases, aulas y horas semanales por profesor sin DATEDIFF. */
CREATE OR ALTER VIEW vw_carga_docente
AS
SELECT
    p.id_profesor,
    p.nombre,
    p.apellido,
    p.nivel_especialidad,
    COUNT(h.id_horario) AS clases_semanales,
    COUNT(DISTINCT ca.id_aula_periodo) AS cantidad_aulas,
    SUM
    (
        (DATEPART(HOUR, h.hora_fin) * 60 + DATEPART(MINUTE, h.hora_fin))
        -
        (DATEPART(HOUR, h.hora_inicio) * 60 + DATEPART(MINUTE, h.hora_inicio))
    ) / 60.0 AS horas_semanales
FROM profesor p
LEFT JOIN curso_aula ca ON ca.id_profesor = p.id_profesor
LEFT JOIN horario_clase h ON h.id_curso_aula = ca.id_curso_aula
GROUP BY p.id_profesor, p.nombre, p.apellido, p.nivel_especialidad;
GO

/* Usa una CTE para resumir las matriculas de Inicial, Primaria y Secundaria. */
CREATE OR ALTER VIEW vw_resumen_nivel
AS
WITH MatriculasPorNivel AS
(
    SELECT
        g.nivel,
        COUNT(m.id_matricula) AS cantidad_matriculas
    FROM grado g
    INNER JOIN aula_periodo ap ON ap.id_grado = g.id_grado
    LEFT JOIN matricula m ON m.id_aula_periodo = ap.id_aula_periodo
    GROUP BY g.nivel
)
SELECT nivel, cantidad_matriculas
FROM MatriculasPorNivel;
GO

/*=============================================================================
  PARTE 3. FUNCIONES
=============================================================================*/

/* Funcion escalar: recibe matricula, materia y periodo; devuelve un promedio. */
CREATE OR ALTER FUNCTION fn_promedio_curso
(
    @id_matricula INT,
    @id_curso_aula INT,
    @id_periodo INT
)
RETURNS DECIMAL(5,2)
AS
BEGIN
    DECLARE @suma_notas DECIMAL(12,2);
    DECLARE @suma_pesos DECIMAL(12,2);
    DECLARE @promedio DECIMAL(5,2);

    SELECT
        @suma_notas = SUM(cal.nota * e.peso),
        @suma_pesos = SUM(e.peso)
    FROM evaluacion e
    INNER JOIN calificacion cal ON cal.id_evaluacion = e.id_evaluacion
    WHERE e.id_curso_aula = @id_curso_aula
      AND e.id_periodo = @id_periodo
      AND cal.id_matricula = @id_matricula;

    IF @suma_pesos IS NULL OR @suma_pesos = 0
        SET @promedio = 0;
    ELSE
        SET @promedio = @suma_notas / @suma_pesos;

    RETURN @promedio;
END;
GO

/* Funcion tipo tabla: devuelve el horario de un alumno y año determinados. */
CREATE OR ALTER FUNCTION fn_horario_alumno
(
    @id_alumno INT,
    @anio_academico INT
)
RETURNS TABLE
AS
RETURN
(
    SELECT
        a.id_alumno,
        a.nombre,
        a.apellido,
        h.id_horario,
        h.dia_semana,
        h.hora_inicio,
        h.hora_fin,
        c.nombre_curso,
        p.nombre AS nombre_profesor,
        p.apellido AS apellido_profesor,
        CASE h.dia_semana
            WHEN 'Lunes' THEN 1
            WHEN 'Martes' THEN 2
            WHEN 'Miércoles' THEN 3
            WHEN 'Jueves' THEN 4
            WHEN 'Viernes' THEN 5
        END AS numero_dia
    FROM alumno a
    INNER JOIN matricula m ON m.id_alumno = a.id_alumno
    INNER JOIN horario_clase h ON h.id_aula_periodo = m.id_aula_periodo
    INNER JOIN curso_aula ca ON ca.id_curso_aula = h.id_curso_aula
    INNER JOIN curso c ON c.id_curso = ca.id_curso
    LEFT JOIN profesor p ON p.id_profesor = ca.id_profesor
    WHERE a.id_alumno = @id_alumno
      AND m.anio_academico = @anio_academico
);
GO

/*=============================================================================
  PARTE 4. STORED PROCEDURES OPERATIVOS Y TRANSACCIONES
=============================================================================*/

/* Matricula un alumno validando existencia, año, duplicado y aforo.
   La transaccion revierte el proceso completo si ocurre un error. */
CREATE OR ALTER PROCEDURE usp_matricular_alumno
    @id_alumno INT,
    @id_aula_periodo INT,
    @anio_academico INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (SELECT 1 FROM alumno WHERE id_alumno = @id_alumno)
            THROW 51001, 'El alumno indicado no existe.', 1;

        IF NOT EXISTS
        (
            SELECT 1 FROM aula_periodo
            WHERE id_aula_periodo = @id_aula_periodo
              AND anio_academico = @anio_academico
        )
            THROW 51002, 'El aula no existe o pertenece a otro año.', 1;

        IF EXISTS
        (
            SELECT 1 FROM matricula
            WHERE id_alumno = @id_alumno
              AND anio_academico = @anio_academico
        )
            THROW 51003, 'El alumno ya tiene matricula en ese año.', 1;

        IF EXISTS
        (
            SELECT 1 FROM aula_periodo WITH (UPDLOCK, HOLDLOCK)
            WHERE id_aula_periodo = @id_aula_periodo
              AND cantidad_matriculados >= aforo_maximo
        )
            THROW 51004, 'El aula ya alcanzo su aforo maximo.', 1;

        INSERT INTO matricula
        (id_alumno, id_aula_periodo, anio_academico, fecha_matricula)
        VALUES
        (@id_alumno, @id_aula_periodo, @anio_academico, GETDATE());

        COMMIT TRANSACTION;

        SELECT * FROM matricula WHERE id_matricula = SCOPE_IDENTITY();
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

/* Asigna un profesor a una materia solamente si su nivel coincide con el aula. */
CREATE OR ALTER PROCEDURE usp_asignar_profesor
    @id_curso_aula INT,
    @id_profesor INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM profesor WHERE id_profesor = @id_profesor)
        THROW 51005, 'El profesor indicado no existe.', 1;

    IF NOT EXISTS (SELECT 1 FROM curso_aula WHERE id_curso_aula = @id_curso_aula)
        THROW 51006, 'La materia-seccion indicada no existe.', 1;

    IF EXISTS
    (
        SELECT 1
        FROM curso_aula ca
        INNER JOIN aula_periodo ap ON ap.id_aula_periodo = ca.id_aula_periodo
        INNER JOIN grado g ON g.id_grado = ap.id_grado
        INNER JOIN profesor p ON p.id_profesor = @id_profesor
        WHERE ca.id_curso_aula = @id_curso_aula
          AND p.nivel_especialidad <> g.nivel
    )
        THROW 51007, 'El profesor no pertenece al nivel del aula.', 1;

    UPDATE curso_aula
    SET id_profesor = @id_profesor
    WHERE id_curso_aula = @id_curso_aula;

    SELECT * FROM curso_aula WHERE id_curso_aula = @id_curso_aula;
END;
GO

/* Genera 15 clases: tres bloques por dia de lunes a viernes.
   Reparte las materias del aula y utiliza una transaccion. */
CREATE OR ALTER PROCEDURE usp_generar_horario_aula
    @id_aula_periodo INT,
    @mostrar_resultado BIT = 1
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS
            (SELECT 1 FROM aula_periodo WHERE id_aula_periodo = @id_aula_periodo)
            THROW 51008, 'El aula indicada no existe.', 1;

        IF NOT EXISTS
            (SELECT 1 FROM curso_aula WHERE id_aula_periodo = @id_aula_periodo)
            THROW 51009, 'El aula no tiene materias asignadas.', 1;

        DELETE FROM horario_clase
        WHERE id_aula_periodo = @id_aula_periodo;

        DECLARE @Franjas TABLE
        (
            numero INT PRIMARY KEY,
            dia VARCHAR(10),
            hora_inicio TIME,
            hora_fin TIME
        );

        INSERT INTO @Franjas VALUES
        (1,'Lunes','08:00','09:30'), (2,'Lunes','09:45','11:15'),
        (3,'Lunes','11:30','13:00'), (4,'Martes','08:00','09:30'),
        (5,'Martes','09:45','11:15'), (6,'Martes','11:30','13:00'),
        (7,'Miércoles','08:00','09:30'), (8,'Miércoles','09:45','11:15'),
        (9,'Miércoles','11:30','13:00'), (10,'Jueves','08:00','09:30'),
        (11,'Jueves','09:45','11:15'), (12,'Jueves','11:30','13:00'),
        (13,'Viernes','08:00','09:30'), (14,'Viernes','09:45','11:15'),
        (15,'Viernes','11:30','13:00');

        ;WITH Materias AS
        (
            SELECT
                id_curso_aula,
                ROW_NUMBER() OVER (ORDER BY id_curso_aula) AS numero,
                COUNT(*) OVER () AS total
            FROM curso_aula
            WHERE id_aula_periodo = @id_aula_periodo
        )
        INSERT INTO horario_clase
        (id_aula_periodo, id_curso_aula, dia_semana, hora_inicio, hora_fin)
        SELECT
            @id_aula_periodo,
            m.id_curso_aula,
            f.dia,
            f.hora_inicio,
            f.hora_fin
        FROM @Franjas f
        INNER JOIN Materias m
            ON m.numero = ((f.numero - 1) % m.total) + 1;

        COMMIT TRANSACTION;

        IF @mostrar_resultado = 1
            SELECT * FROM horario_clase
            WHERE id_aula_periodo = @id_aula_periodo;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

/* Inserta una nota nueva o actualiza la existente. Valida periodo y aula. */
CREATE OR ALTER PROCEDURE usp_registrar_nota
    @id_evaluacion INT,
    @id_matricula INT,
    @nota DECIMAL(4,2),
    @observacion VARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF @nota < 0 OR @nota > 20
            THROW 51010, 'La nota debe estar entre 0 y 20.', 1;

        IF NOT EXISTS
        (
            SELECT 1
            FROM evaluacion e
            INNER JOIN periodo_academico pa ON pa.id_periodo = e.id_periodo
            WHERE e.id_evaluacion = @id_evaluacion
              AND pa.esta_activo = 1
        )
            THROW 51011, 'La evaluacion no existe o su periodo esta cerrado.', 1;

        IF NOT EXISTS
        (
            SELECT 1
            FROM evaluacion e
            INNER JOIN curso_aula ca ON ca.id_curso_aula = e.id_curso_aula
            INNER JOIN matricula m ON m.id_matricula = @id_matricula
            WHERE e.id_evaluacion = @id_evaluacion
              AND ca.id_aula_periodo = m.id_aula_periodo
        )
            THROW 51012, 'El alumno no pertenece al aula evaluada.', 1;

        IF EXISTS
        (
            SELECT 1 FROM calificacion
            WHERE id_evaluacion = @id_evaluacion
              AND id_matricula = @id_matricula
        )
        BEGIN
            UPDATE calificacion
            SET nota = @nota,
                observacion = @observacion,
                registrado_en = GETDATE()
            WHERE id_evaluacion = @id_evaluacion
              AND id_matricula = @id_matricula;
        END
        ELSE
        BEGIN
            INSERT INTO calificacion
            (id_evaluacion, id_matricula, nota, observacion, registrado_en)
            VALUES
            (@id_evaluacion, @id_matricula, @nota, @observacion, GETDATE());
        END;

        COMMIT TRANSACTION;

        SELECT * FROM calificacion
        WHERE id_evaluacion = @id_evaluacion
          AND id_matricula = @id_matricula;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

/* Inserta o actualiza la asistencia de un alumno en una clase y fecha. */
CREATE OR ALTER PROCEDURE usp_registrar_asistencia
    @id_horario INT,
    @id_matricula INT,
    @fecha DATE,
    @estado VARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF @estado NOT IN ('Presente', 'Tarde', 'Ausente', 'Justificado')
            THROW 51013, 'El estado de asistencia no es valido.', 1;

        IF NOT EXISTS
        (
            SELECT 1
            FROM horario_clase h
            INNER JOIN matricula m ON m.id_matricula = @id_matricula
            WHERE h.id_horario = @id_horario
              AND h.id_aula_periodo = m.id_aula_periodo
        )
            THROW 51014, 'El alumno no pertenece al aula del horario.', 1;

        IF EXISTS
        (
            SELECT 1 FROM asistencia
            WHERE id_horario = @id_horario
              AND id_matricula = @id_matricula
              AND fecha = @fecha
        )
        BEGIN
            UPDATE asistencia
            SET estado = @estado
            WHERE id_horario = @id_horario
              AND id_matricula = @id_matricula
              AND fecha = @fecha;
        END
        ELSE
        BEGIN
            INSERT INTO asistencia
            (id_horario, id_matricula, fecha, estado)
            VALUES
            (@id_horario, @id_matricula, @fecha, @estado);
        END;

        COMMIT TRANSACTION;

        SELECT * FROM asistencia
        WHERE id_horario = @id_horario
          AND id_matricula = @id_matricula
          AND fecha = @fecha;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

/* Desactiva los periodos del año y activa solamente el periodo seleccionado. */
CREATE OR ALTER PROCEDURE usp_activar_periodo
    @id_periodo INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @anio_academico INT;

        SELECT @anio_academico = anio_academico
        FROM periodo_academico
        WHERE id_periodo = @id_periodo;

        IF @anio_academico IS NULL
            THROW 51015, 'El periodo indicado no existe.', 1;

        UPDATE periodo_academico
        SET esta_activo = 0
        WHERE anio_academico = @anio_academico;

        UPDATE periodo_academico
        SET esta_activo = 1
        WHERE id_periodo = @id_periodo;

        COMMIT TRANSACTION;

        SELECT * FROM periodo_academico
        WHERE anio_academico = @anio_academico;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

/*=============================================================================
  PARTE 5. TRIGGERS DE VALIDACION
=============================================================================*/

/* Recalcula automaticamente la cantidad de matriculados de las aulas afectadas. */
CREATE OR ALTER TRIGGER trg_matricula_aforo
ON matricula
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH AulasAfectadas AS
    (
        SELECT id_aula_periodo FROM inserted
        UNION
        SELECT id_aula_periodo FROM deleted
    )
    UPDATE ap
    SET cantidad_matriculados =
    (
        SELECT COUNT(*)
        FROM matricula m
        WHERE m.id_aula_periodo = ap.id_aula_periodo
    )
    FROM aula_periodo ap
    INNER JOIN AulasAfectadas aa
        ON aa.id_aula_periodo = ap.id_aula_periodo;
END;
GO

/* Impide asignar un profesor a un aula de otro nivel. */
CREATE OR ALTER TRIGGER trg_curso_aula_nivel
ON curso_aula
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM inserted i
        INNER JOIN profesor p ON p.id_profesor = i.id_profesor
        INNER JOIN aula_periodo ap ON ap.id_aula_periodo = i.id_aula_periodo
        INNER JOIN grado g ON g.id_grado = ap.id_grado
        WHERE i.id_profesor IS NOT NULL
          AND p.nivel_especialidad <> g.nivel
    )
        THROW 52001, 'El profesor no pertenece al nivel del aula.', 1;
END;
GO

/* Impide que un profesor tenga dos clases cuyas horas se crucen. */
CREATE OR ALTER TRIGGER trg_horario_no_cruce
ON horario_clase
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM inserted i
        INNER JOIN curso_aula ca_nueva ON ca_nueva.id_curso_aula = i.id_curso_aula
        INNER JOIN horario_clase h ON h.id_horario <> i.id_horario
        INNER JOIN curso_aula ca_existente ON ca_existente.id_curso_aula = h.id_curso_aula
        WHERE ca_nueva.id_profesor IS NOT NULL
          AND ca_existente.id_profesor = ca_nueva.id_profesor
          AND h.dia_semana = i.dia_semana
          AND i.hora_inicio < h.hora_fin
          AND h.hora_inicio < i.hora_fin
    )
        THROW 52002, 'El profesor ya tiene una clase en una franja que se cruza.', 1;
END;
GO

/* Impide registrar notas en periodos cerrados o para alumnos de otra aula. */
CREATE OR ALTER TRIGGER trg_calificacion_validar
ON calificacion
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM inserted i
        INNER JOIN evaluacion e ON e.id_evaluacion = i.id_evaluacion
        INNER JOIN periodo_academico pa ON pa.id_periodo = e.id_periodo
        WHERE pa.esta_activo = 0
    )
        THROW 52003, 'El periodo esta cerrado; no se puede registrar la nota.', 1;

    IF EXISTS
    (
        SELECT 1
        FROM inserted i
        INNER JOIN evaluacion e ON e.id_evaluacion = i.id_evaluacion
        INNER JOIN curso_aula ca ON ca.id_curso_aula = e.id_curso_aula
        INNER JOIN matricula m ON m.id_matricula = i.id_matricula
        WHERE ca.id_aula_periodo <> m.id_aula_periodo
    )
        THROW 52004, 'El alumno no pertenece al aula evaluada.', 1;
END;
GO

/* Impide registrar asistencia de un alumno que no pertenece al aula. */
CREATE OR ALTER TRIGGER trg_asistencia_validar
ON asistencia
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM inserted i
        INNER JOIN horario_clase h ON h.id_horario = i.id_horario
        INNER JOIN matricula m ON m.id_matricula = i.id_matricula
        WHERE h.id_aula_periodo <> m.id_aula_periodo
    )
        THROW 52005, 'El alumno no pertenece al aula del horario.', 1;
END;
GO

/*=============================================================================
  PARTE 6. TRIGGERS DE AUDITORIA

  Registran automaticamente el historial de cambios sobre las tablas
  academicas mas sensibles.
=============================================================================*/

/* Registra INSERT, UPDATE o DELETE realizados sobre matricula. */
CREATE OR ALTER TRIGGER trg_auditoria_matricula
ON matricula
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO auditoria
    (tabla, accion, id_registro, datos, usuario_db, fecha)
    SELECT
        'matricula',
        CASE
            WHEN i.id_matricula IS NULL THEN 'DELETE'
            WHEN d.id_matricula IS NULL THEN 'INSERT'
            ELSE 'UPDATE'
        END,
        COALESCE(i.id_matricula, d.id_matricula),
        CONCAT('Alumno: ', COALESCE(i.id_alumno, d.id_alumno),
               ', Aula: ', COALESCE(i.id_aula_periodo, d.id_aula_periodo)),
        SYSTEM_USER,
        GETDATE()
    FROM inserted i
    FULL JOIN deleted d ON d.id_matricula = i.id_matricula;
END;
GO

/* Registra cambios realizados en horario_clase. */
CREATE OR ALTER TRIGGER trg_auditoria_horario
ON horario_clase
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO auditoria
    (tabla, accion, id_registro, datos, usuario_db, fecha)
    SELECT
        'horario_clase',
        CASE
            WHEN i.id_horario IS NULL THEN 'DELETE'
            WHEN d.id_horario IS NULL THEN 'INSERT'
            ELSE 'UPDATE'
        END,
        COALESCE(i.id_horario, d.id_horario),
        CONCAT('Curso-aula: ', COALESCE(i.id_curso_aula, d.id_curso_aula),
               ', Dia: ', COALESCE(i.dia_semana, d.dia_semana)),
        SYSTEM_USER,
        GETDATE()
    FROM inserted i
    FULL JOIN deleted d ON d.id_horario = i.id_horario;
END;
GO

/* Registra cambios realizados en evaluacion. */
CREATE OR ALTER TRIGGER trg_auditoria_evaluacion
ON evaluacion
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO auditoria
    (tabla, accion, id_registro, datos, usuario_db, fecha)
    SELECT
        'evaluacion',
        CASE
            WHEN i.id_evaluacion IS NULL THEN 'DELETE'
            WHEN d.id_evaluacion IS NULL THEN 'INSERT'
            ELSE 'UPDATE'
        END,
        COALESCE(i.id_evaluacion, d.id_evaluacion),
        CONCAT('Evaluacion: ', COALESCE(i.nombre, d.nombre),
               ', Peso: ', COALESCE(i.peso, d.peso)),
        SYSTEM_USER,
        GETDATE()
    FROM inserted i
    FULL JOIN deleted d ON d.id_evaluacion = i.id_evaluacion;
END;
GO

/* Registra la nota anterior y la nota nueva. */
CREATE OR ALTER TRIGGER trg_auditoria_calificacion
ON calificacion
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO auditoria
    (tabla, accion, id_registro, datos, usuario_db, fecha)
    SELECT
        'calificacion',
        CASE
            WHEN i.id_calificacion IS NULL THEN 'DELETE'
            WHEN d.id_calificacion IS NULL THEN 'INSERT'
            ELSE 'UPDATE'
        END,
        COALESCE(i.id_calificacion, d.id_calificacion),
        CONCAT('Nota anterior: ', d.nota, ', Nota nueva: ', i.nota),
        SYSTEM_USER,
        GETDATE()
    FROM inserted i
    FULL JOIN deleted d ON d.id_calificacion = i.id_calificacion;
END;
GO

/*=============================================================================
  PARTE 7. STORED PROCEDURES CON CURSORES

  Cada cursor cubre un requerimiento real del sistema, no solo una muestra
  academica del tema:
  - usp_recalcular_aforos_cursor       -> RNF de integridad y recuperacion.
  - usp_generar_horarios_faltantes_cursor -> RF de generacion masiva de horarios.
  - usp_alumnos_en_riesgo_cursor       -> RF de alerta temprana por notas.
  - usp_inasistencias_consecutivas_cursor -> RF de alerta temprana por faltas.
=============================================================================*/

/* RNF de integridad de datos: herramienta de mantenimiento para que la
   secretaria reconcilie el contador de matriculados de cada aula tras
   restaurar un backup o migrar datos. En operacion normal el trigger
   trg_matricula_aforo ya mantiene el contador al dia; este procedimiento
   cubre el caso de recuperacion, donde el contador pudo quedar desfasado. */
CREATE OR ALTER PROCEDURE usp_recalcular_aforos_cursor
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @id_aula INT;
    DECLARE @cantidad_real INT;
    DECLARE @aulas_corregidas INT = 0;

    DECLARE cursor_aulas CURSOR LOCAL FAST_FORWARD FOR
        SELECT id_aula_periodo FROM aula_periodo;

    OPEN cursor_aulas;
    FETCH NEXT FROM cursor_aulas INTO @id_aula;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SELECT @cantidad_real = COUNT(*)
        FROM matricula
        WHERE id_aula_periodo = @id_aula;

        IF EXISTS
        (
            SELECT 1 FROM aula_periodo
            WHERE id_aula_periodo = @id_aula
              AND cantidad_matriculados <> @cantidad_real
        )
        BEGIN
            UPDATE aula_periodo
            SET cantidad_matriculados = @cantidad_real
            WHERE id_aula_periodo = @id_aula;

            SET @aulas_corregidas = @aulas_corregidas + 1;
        END;

        FETCH NEXT FROM cursor_aulas INTO @id_aula;
    END;

    CLOSE cursor_aulas;
    DEALLOCATE cursor_aulas;

    SELECT @aulas_corregidas AS aulas_corregidas;
END;
GO

/* RF de generacion masiva de horarios: recorre las aulas que ya tienen
   materias asignadas pero no las 15 clases completas (por ejemplo, al abrir
   un periodo academico con muchas aulas nuevas de golpe) y llama al
   generador de horario de cada una dentro de su propia transaccion. */
CREATE OR ALTER PROCEDURE usp_generar_horarios_faltantes_cursor
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @id_aula INT;
    DECLARE @aulas_programadas INT = 0;

    DECLARE cursor_horarios CURSOR LOCAL FAST_FORWARD FOR
        SELECT ap.id_aula_periodo
        FROM aula_periodo ap
        WHERE EXISTS
            (SELECT 1 FROM curso_aula ca WHERE ca.id_aula_periodo = ap.id_aula_periodo)
          AND
            (SELECT COUNT(*) FROM horario_clase h
             WHERE h.id_aula_periodo = ap.id_aula_periodo) <> 15;

    OPEN cursor_horarios;
    FETCH NEXT FROM cursor_horarios INTO @id_aula;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC usp_generar_horario_aula
            @id_aula_periodo = @id_aula,
            @mostrar_resultado = 0;

        SET @aulas_programadas = @aulas_programadas + 1;
        FETCH NEXT FROM cursor_horarios INTO @id_aula;
    END;

    CLOSE cursor_horarios;
    DEALLOCATE cursor_horarios;

    SELECT @aulas_programadas AS aulas_programadas;
END;
GO

/* RF de alerta temprana por bajo rendimiento: recorre los promedios menores
   a 11 de un periodo para que la secretaria y los profesores puedan
   intervenir a tiempo con el alumno. */
CREATE OR ALTER PROCEDURE usp_alumnos_en_riesgo_cursor
    @id_periodo INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @alumno VARCHAR(110);
    DECLARE @curso VARCHAR(50);
    DECLARE @promedio DECIMAL(5,2);

    DECLARE @Resultado TABLE
    (
        alumno VARCHAR(110),
        curso VARCHAR(50),
        promedio DECIMAL(5,2)
    );

    DECLARE cursor_riesgo CURSOR LOCAL FAST_FORWARD FOR
        SELECT
            CONCAT(a.nombre, ' ', a.apellido),
            c.nombre_curso,
            SUM(cal.nota * e.peso) / SUM(e.peso)
        FROM calificacion cal
        INNER JOIN matricula m ON m.id_matricula = cal.id_matricula
        INNER JOIN alumno a ON a.id_alumno = m.id_alumno
        INNER JOIN evaluacion e ON e.id_evaluacion = cal.id_evaluacion
        INNER JOIN curso_aula ca ON ca.id_curso_aula = e.id_curso_aula
        INNER JOIN curso c ON c.id_curso = ca.id_curso
        WHERE e.id_periodo = @id_periodo
        GROUP BY a.id_alumno, a.nombre, a.apellido, c.id_curso, c.nombre_curso
        HAVING SUM(cal.nota * e.peso) / SUM(e.peso) < 11;

    OPEN cursor_riesgo;
    FETCH NEXT FROM cursor_riesgo INTO @alumno, @curso, @promedio;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        INSERT INTO @Resultado (alumno, curso, promedio)
        VALUES (@alumno, @curso, @promedio);

        FETCH NEXT FROM cursor_riesgo INTO @alumno, @curso, @promedio;
    END;

    CLOSE cursor_riesgo;
    DEALLOCATE cursor_riesgo;

    SELECT * FROM @Resultado ORDER BY promedio;
END;
GO

/* RF de alerta temprana por inasistencia: recorre la asistencia de cada
   alumno y curso ordenada por fecha dentro del periodo indicado y detecta
   la racha mas larga de faltas seguidas sin justificar. El calculo de racha
   depende del resultado acumulado de la fila anterior, por eso se resuelve
   con un cursor y no con un agregado simple. Reporta a los alumnos cuya
   racha alcanza el minimo indicado, para que se intervenga antes de que
   la inasistencia se vuelva critica. */
CREATE OR ALTER PROCEDURE usp_inasistencias_consecutivas_cursor
    @id_periodo INT,
    @faltas_consecutivas_minimas INT = 3
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @fecha_inicio DATE;
    DECLARE @fecha_fin DATE;

    SELECT @fecha_inicio = fecha_inicio, @fecha_fin = fecha_fin
    FROM periodo_academico
    WHERE id_periodo = @id_periodo;

    DECLARE @id_alumno_fila INT;
    DECLARE @id_curso_fila INT;
    DECLARE @alumno_fila VARCHAR(110);
    DECLARE @curso_fila VARCHAR(50);
    DECLARE @estado_fila VARCHAR(15);

    DECLARE @id_alumno_actual INT = NULL;
    DECLARE @id_curso_actual INT = NULL;
    DECLARE @alumno_actual VARCHAR(110);
    DECLARE @curso_actual VARCHAR(50);
    DECLARE @racha_actual INT = 0;
    DECLARE @racha_maxima INT = 0;

    DECLARE @Resultado TABLE
    (
        id_alumno INT,
        alumno VARCHAR(110),
        curso VARCHAR(50),
        faltas_consecutivas INT
    );

    DECLARE cursor_inasistencias CURSOR LOCAL FAST_FORWARD FOR
        SELECT
            a.id_alumno,
            c.id_curso,
            CONCAT(a.nombre, ' ', a.apellido),
            c.nombre_curso,
            asi.estado
        FROM asistencia asi
        INNER JOIN matricula m ON m.id_matricula = asi.id_matricula
        INNER JOIN alumno a ON a.id_alumno = m.id_alumno
        INNER JOIN horario_clase h ON h.id_horario = asi.id_horario
        INNER JOIN curso_aula ca ON ca.id_curso_aula = h.id_curso_aula
        INNER JOIN curso c ON c.id_curso = ca.id_curso
        WHERE asi.fecha BETWEEN @fecha_inicio AND @fecha_fin
        ORDER BY a.id_alumno, c.id_curso, asi.fecha;

    OPEN cursor_inasistencias;
    FETCH NEXT FROM cursor_inasistencias
        INTO @id_alumno_fila, @id_curso_fila, @alumno_fila, @curso_fila, @estado_fila;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        IF @id_alumno_actual IS NULL
           OR @id_alumno_fila <> @id_alumno_actual
           OR @id_curso_fila <> @id_curso_actual
        BEGIN
            IF @id_alumno_actual IS NOT NULL AND @racha_maxima >= @faltas_consecutivas_minimas
                INSERT INTO @Resultado (id_alumno, alumno, curso, faltas_consecutivas)
                VALUES (@id_alumno_actual, @alumno_actual, @curso_actual, @racha_maxima);

            SET @id_alumno_actual = @id_alumno_fila;
            SET @id_curso_actual = @id_curso_fila;
            SET @alumno_actual = @alumno_fila;
            SET @curso_actual = @curso_fila;
            SET @racha_actual = 0;
            SET @racha_maxima = 0;
        END;

        IF @estado_fila = 'Ausente'
        BEGIN
            SET @racha_actual = @racha_actual + 1;
            IF @racha_actual > @racha_maxima
                SET @racha_maxima = @racha_actual;
        END
        ELSE
            SET @racha_actual = 0;

        FETCH NEXT FROM cursor_inasistencias
            INTO @id_alumno_fila, @id_curso_fila, @alumno_fila, @curso_fila, @estado_fila;
    END;

    IF @id_alumno_actual IS NOT NULL AND @racha_maxima >= @faltas_consecutivas_minimas
        INSERT INTO @Resultado (id_alumno, alumno, curso, faltas_consecutivas)
        VALUES (@id_alumno_actual, @alumno_actual, @curso_actual, @racha_maxima);

    CLOSE cursor_inasistencias;
    DEALLOCATE cursor_inasistencias;

    SELECT * FROM @Resultado ORDER BY faltas_consecutivas DESC, alumno;
END;
GO

PRINT 'Indices, vistas, funciones, procedimientos, triggers y cursores creados correctamente.';
GO
