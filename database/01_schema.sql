/*=============================================================================
  EDUGESTOR - ESQUEMA DE BASE DE DATOS
  17 tablas: personas, estructura escolar, matricula, ensenanza,
  evaluacion, asistencia y auditoria.
=============================================================================*/

CREATE DATABASE EduGestor_SQLServer_Actualizado;
GO

USE EduGestor_SQLServer_Actualizado;
GO

/*=============================================================================
  1. TABLA USUARIO
=============================================================================*/

CREATE TABLE usuario
(
    id_usuario          INT IDENTITY(1,1) NOT NULL,
    correo_electronico  VARCHAR(100) NOT NULL,
    contrasenia         VARCHAR(255) NOT NULL,
    rol                 VARCHAR(20) NOT NULL,

    CONSTRAINT PK_usuario PRIMARY KEY CLUSTERED (id_usuario),
    CONSTRAINT UQ_usuario_correo UNIQUE (correo_electronico),
    CONSTRAINT CK_usuario_rol CHECK
        (rol IN ('Secretaria', 'Profesor', 'Alumno'))
);
GO

/*=============================================================================
  2. TABLA SECRETARIA
=============================================================================*/

CREATE TABLE secretaria
(
    id_secretaria  INT IDENTITY(1,1) NOT NULL,
    id_usuario     INT NOT NULL,
    nombre         VARCHAR(50) NOT NULL,
    apellido       VARCHAR(50) NOT NULL,
    dni            CHAR(8) NOT NULL,

    CONSTRAINT PK_secretaria PRIMARY KEY CLUSTERED (id_secretaria),
    CONSTRAINT UQ_secretaria_usuario UNIQUE (id_usuario),
    CONSTRAINT UQ_secretaria_dni UNIQUE (dni),
    CONSTRAINT CK_secretaria_dni CHECK
        (dni NOT LIKE '%[^0-9]%' AND LEN(dni) = 8),
    CONSTRAINT FK_secretaria_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
);
GO

/*=============================================================================
  3. TABLA PROFESOR
=============================================================================*/

CREATE TABLE profesor
(
    id_profesor          INT IDENTITY(1,1) NOT NULL,
    id_usuario           INT NOT NULL,
    nombre               VARCHAR(50) NOT NULL,
    apellido             VARCHAR(50) NOT NULL,
    dni                  CHAR(8) NOT NULL,
    nivel_especialidad   VARCHAR(20) NOT NULL,

    CONSTRAINT PK_profesor PRIMARY KEY CLUSTERED (id_profesor),
    CONSTRAINT UQ_profesor_usuario UNIQUE (id_usuario),
    CONSTRAINT UQ_profesor_dni UNIQUE (dni),
    CONSTRAINT CK_profesor_dni CHECK
        (dni NOT LIKE '%[^0-9]%' AND LEN(dni) = 8),
    CONSTRAINT CK_profesor_nivel CHECK
        (nivel_especialidad IN ('Inicial', 'Primaria', 'Secundaria')),
    CONSTRAINT FK_profesor_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
);
GO

/*=============================================================================
  4. TABLA ALUMNO
=============================================================================*/

CREATE TABLE alumno
(
    id_alumno          INT IDENTITY(1,1) NOT NULL,
    id_usuario         INT NOT NULL,
    nombre             VARCHAR(50) NOT NULL,
    apellido           VARCHAR(50) NOT NULL,
    dni                CHAR(8) NOT NULL,
    fecha_nacimiento   DATE NOT NULL,
    via_direccion      VARCHAR(150) NULL,
    distrito           VARCHAR(50) NULL,

    CONSTRAINT PK_alumno PRIMARY KEY CLUSTERED (id_alumno),
    CONSTRAINT UQ_alumno_usuario UNIQUE (id_usuario),
    CONSTRAINT UQ_alumno_dni UNIQUE (dni),
    CONSTRAINT CK_alumno_dni CHECK
        (dni NOT LIKE '%[^0-9]%' AND LEN(dni) = 8),
    CONSTRAINT FK_alumno_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
);
GO

/*=============================================================================
  5. TABLA GRADO
=============================================================================*/

CREATE TABLE grado
(
    id_grado       INT IDENTITY(1,1) NOT NULL,
    nivel          VARCHAR(20) NOT NULL,
    numero_grado   VARCHAR(20) NOT NULL,

    CONSTRAINT PK_grado PRIMARY KEY CLUSTERED (id_grado),
    CONSTRAINT UQ_grado_nivel_numero UNIQUE (nivel, numero_grado),
    CONSTRAINT CK_grado_nivel_numero CHECK
    (
        (nivel = 'Inicial'
            AND numero_grado IN ('3 años', '4 años', '5 años'))
        OR
        (nivel = 'Primaria'
            AND numero_grado IN ('1ro', '2do', '3ro', '4to', '5to', '6to'))
        OR
        (nivel = 'Secundaria'
            AND numero_grado IN ('1ro', '2do', '3ro', '4to', '5to'))
    )
);
GO

/*=============================================================================
  6. TABLA SECCION
=============================================================================*/

CREATE TABLE seccion
(
    id_seccion   INT IDENTITY(1,1) NOT NULL,
    letra        CHAR(1) NOT NULL,

    CONSTRAINT PK_seccion PRIMARY KEY CLUSTERED (id_seccion),
    CONSTRAINT UQ_seccion_letra UNIQUE (letra),
    CONSTRAINT CK_seccion_letra CHECK (letra LIKE '[A-Z]')
);
GO

/*=============================================================================
  7. TABLA TURNO
=============================================================================*/

CREATE TABLE turno
(
    id_turno       INT IDENTITY(1,1) NOT NULL,
    nombre_turno   VARCHAR(10) NOT NULL,

    CONSTRAINT PK_turno PRIMARY KEY CLUSTERED (id_turno),
    CONSTRAINT UQ_turno_nombre UNIQUE (nombre_turno),
    CONSTRAINT CK_turno_nombre CHECK
        (nombre_turno IN ('Mañana', 'Tarde', 'Noche'))
);
GO

/*=============================================================================
  8. TABLA CURSO
=============================================================================*/

CREATE TABLE curso
(
    id_curso       INT IDENTITY(1,1) NOT NULL,
    nombre_curso   VARCHAR(50) NOT NULL,

    CONSTRAINT PK_curso PRIMARY KEY CLUSTERED (id_curso),
    CONSTRAINT UQ_curso_nombre UNIQUE (nombre_curso)
);
GO

/*=============================================================================
  9. TABLA PERIODO ACADEMICO
=============================================================================*/

CREATE TABLE periodo_academico
(
    id_periodo       INT IDENTITY(1,1) NOT NULL,
    anio_academico   INT NOT NULL,
    nombre           VARCHAR(30) NOT NULL,
    fecha_inicio     DATE NOT NULL,
    fecha_fin        DATE NOT NULL,
    esta_activo      BIT NOT NULL,

    CONSTRAINT PK_periodo_academico PRIMARY KEY CLUSTERED (id_periodo),
    CONSTRAINT UQ_periodo_anio_nombre UNIQUE (anio_academico, nombre),
    CONSTRAINT CK_periodo_fechas CHECK (fecha_fin > fecha_inicio)
);
GO

/*=============================================================================
  10. TABLA AULA PERIODO

  Representa un grado, seccion y turno durante un año academico determinado.
=============================================================================*/

CREATE TABLE aula_periodo
(
    id_aula_periodo        INT IDENTITY(1,1) NOT NULL,
    id_grado               INT NOT NULL,
    id_seccion              INT NOT NULL,
    id_turno               INT NOT NULL,
    anio_academico         INT NOT NULL,
    aforo_maximo           INT NOT NULL,
    cantidad_matriculados  INT NOT NULL,

    CONSTRAINT PK_aula_periodo PRIMARY KEY CLUSTERED (id_aula_periodo),
    CONSTRAINT UQ_aula_grado_seccion_turno_anio
        UNIQUE (id_grado, id_seccion, id_turno, anio_academico),
    CONSTRAINT CK_aula_anio CHECK (anio_academico >= 2000),
    CONSTRAINT CK_aula_aforo CHECK (aforo_maximo > 0),
    CONSTRAINT CK_aula_cantidad CHECK
        (cantidad_matriculados >= 0
         AND cantidad_matriculados <= aforo_maximo),
    CONSTRAINT FK_aula_grado FOREIGN KEY (id_grado)
        REFERENCES grado(id_grado),
    CONSTRAINT FK_aula_seccion FOREIGN KEY (id_seccion)
        REFERENCES seccion(id_seccion),
    CONSTRAINT FK_aula_turno FOREIGN KEY (id_turno)
        REFERENCES turno(id_turno)
);
GO

/*=============================================================================
  11. TABLA MATRICULA
=============================================================================*/

CREATE TABLE matricula
(
    id_matricula       INT IDENTITY(1,1) NOT NULL,
    id_alumno          INT NOT NULL,
    id_aula_periodo    INT NOT NULL,
    anio_academico     INT NOT NULL,
    fecha_matricula    DATETIME NOT NULL,

    CONSTRAINT PK_matricula PRIMARY KEY CLUSTERED (id_matricula),
    CONSTRAINT UQ_matricula_alumno_anio UNIQUE (id_alumno, anio_academico),
    CONSTRAINT CK_matricula_anio CHECK (anio_academico >= 2000),
    CONSTRAINT FK_matricula_alumno FOREIGN KEY (id_alumno)
        REFERENCES alumno(id_alumno),
    CONSTRAINT FK_matricula_aula FOREIGN KEY (id_aula_periodo)
        REFERENCES aula_periodo(id_aula_periodo)
);
GO

/*=============================================================================
  12. TABLA CURSO AULA
=============================================================================*/

CREATE TABLE curso_aula
(
    id_curso_aula      INT IDENTITY(1,1) NOT NULL,
    id_aula_periodo    INT NOT NULL,
    id_curso           INT NOT NULL,
    id_profesor        INT NULL,

    CONSTRAINT PK_curso_aula PRIMARY KEY CLUSTERED (id_curso_aula),
    CONSTRAINT UQ_curso_aula UNIQUE (id_aula_periodo, id_curso),
    CONSTRAINT FK_curso_aula_aula FOREIGN KEY (id_aula_periodo)
        REFERENCES aula_periodo(id_aula_periodo),
    CONSTRAINT FK_curso_aula_curso FOREIGN KEY (id_curso)
        REFERENCES curso(id_curso),
    CONSTRAINT FK_curso_aula_profesor FOREIGN KEY (id_profesor)
        REFERENCES profesor(id_profesor)
);
GO

/*=============================================================================
  13. TABLA HORARIO CLASE
=============================================================================*/

CREATE TABLE horario_clase
(
    id_horario         INT IDENTITY(1,1) NOT NULL,
    id_aula_periodo    INT NOT NULL,
    id_curso_aula      INT NOT NULL,
    dia_semana         VARCHAR(10) NOT NULL,
    hora_inicio        TIME NOT NULL,
    hora_fin           TIME NOT NULL,

    CONSTRAINT PK_horario_clase PRIMARY KEY CLUSTERED (id_horario),
    CONSTRAINT UQ_horario_aula_franja
        UNIQUE (id_aula_periodo, dia_semana, hora_inicio),
    CONSTRAINT CK_horario_dia CHECK
        (dia_semana IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes')),
    CONSTRAINT CK_horario_horas CHECK (hora_fin > hora_inicio),
    CONSTRAINT FK_horario_aula FOREIGN KEY (id_aula_periodo)
        REFERENCES aula_periodo(id_aula_periodo),
    CONSTRAINT FK_horario_curso_aula FOREIGN KEY (id_curso_aula)
        REFERENCES curso_aula(id_curso_aula)
);
GO

/*=============================================================================
  14. TABLA EVALUACION
=============================================================================*/

CREATE TABLE evaluacion
(
    id_evaluacion    INT IDENTITY(1,1) NOT NULL,
    id_curso_aula    INT NOT NULL,
    id_periodo       INT NOT NULL,
    nombre           VARCHAR(60) NOT NULL,
    peso             DECIMAL(4,2) NOT NULL,
    fecha            DATE NOT NULL,

    CONSTRAINT PK_evaluacion PRIMARY KEY CLUSTERED (id_evaluacion),
    CONSTRAINT UQ_evaluacion_curso_periodo_nombre
        UNIQUE (id_curso_aula, id_periodo, nombre),
    CONSTRAINT CK_evaluacion_peso CHECK (peso > 0),
    CONSTRAINT FK_evaluacion_curso_aula FOREIGN KEY (id_curso_aula)
        REFERENCES curso_aula(id_curso_aula),
    CONSTRAINT FK_evaluacion_periodo FOREIGN KEY (id_periodo)
        REFERENCES periodo_academico(id_periodo)
);
GO

/*=============================================================================
  15. TABLA CALIFICACION
=============================================================================*/

CREATE TABLE calificacion
(
    id_calificacion   INT IDENTITY(1,1) NOT NULL,
    id_evaluacion     INT NOT NULL,
    id_matricula      INT NOT NULL,
    nota              DECIMAL(4,2) NOT NULL,
    observacion       VARCHAR(200) NULL,
    registrado_en     DATETIME NOT NULL,

    CONSTRAINT PK_calificacion PRIMARY KEY CLUSTERED (id_calificacion),
    CONSTRAINT UQ_calificacion_evaluacion_matricula
        UNIQUE (id_evaluacion, id_matricula),
    CONSTRAINT CK_calificacion_nota CHECK (nota BETWEEN 0 AND 20),
    CONSTRAINT FK_calificacion_evaluacion FOREIGN KEY (id_evaluacion)
        REFERENCES evaluacion(id_evaluacion),
    CONSTRAINT FK_calificacion_matricula FOREIGN KEY (id_matricula)
        REFERENCES matricula(id_matricula)
);
GO

/*=============================================================================
  16. TABLA ASISTENCIA

  id_horario identifica la clase programada.
  La fecha identifica el dia concreto en que se realizo esa clase.
=============================================================================*/

CREATE TABLE asistencia
(
    id_asistencia    INT IDENTITY(1,1) NOT NULL,
    id_horario       INT NOT NULL,
    id_matricula     INT NOT NULL,
    fecha            DATE NOT NULL,
    estado           VARCHAR(15) NOT NULL,

    CONSTRAINT PK_asistencia PRIMARY KEY CLUSTERED (id_asistencia),
    CONSTRAINT UQ_asistencia_horario_matricula_fecha
        UNIQUE (id_horario, id_matricula, fecha),
    CONSTRAINT CK_asistencia_estado CHECK
        (estado IN ('Presente', 'Tarde', 'Ausente', 'Justificado')),
    CONSTRAINT FK_asistencia_horario FOREIGN KEY (id_horario)
        REFERENCES horario_clase(id_horario),
    CONSTRAINT FK_asistencia_matricula FOREIGN KEY (id_matricula)
        REFERENCES matricula(id_matricula)
);
GO

/*=============================================================================
  17. TABLA AUDITORIA

  Se llena automaticamente mediante los triggers de auditoria (ver 03_objects.sql).
=============================================================================*/

CREATE TABLE auditoria
(
    id_auditoria   BIGINT IDENTITY(1,1) NOT NULL,
    tabla          VARCHAR(40) NOT NULL,
    accion         VARCHAR(10) NOT NULL,
    id_registro    INT NULL,
    datos          VARCHAR(500) NULL,
    usuario_db     VARCHAR(100) NOT NULL,
    fecha          DATETIME NOT NULL,

    CONSTRAINT PK_auditoria PRIMARY KEY CLUSTERED (id_auditoria),
    CONSTRAINT CK_auditoria_accion CHECK
        (accion IN ('INSERT', 'UPDATE', 'DELETE'))
);
GO
