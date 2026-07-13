# EduGestor

Sistema de gestión académica para colegios (Inicial, Primaria, Secundaria) — proyecto final del
curso Base de Datos II, UNFV. Tres roles: Secretaría, Profesor, Alumno.

## Stack

- **database/**: SQL Server. Tablas, índices, vistas, funciones, stored procedures, triggers y
  cursores. Toda la validación de negocio fuerte (aforo, duplicados, cruces de horario, notas
  fuera de rango, periodos cerrados) vive aquí, no en la aplicación.
- **server/**: API en Node.js + Express. Única capa autorizada a conectarse a SQL Server (mssql).
  Es una capa delgada: ejecuta los stored procedures y consulta las vistas ya definidas, no
  reimplementa lógica de negocio que ya está en la base de datos. Login con JWT + bcrypt.
- **client/**: React (Vite). Consume la API, nunca se conecta directamente a SQL Server. Vistas
  separadas por rol.

## Regla de comentarios

Los comentarios describen **qué hace** el código, nunca el proceso de cómo se escribió ni
instrucciones dirigidas a otro desarrollador. No dejar rastro de que el código fue generado por
IA.

- Bien: `-- Procedimiento que matricula un alumno validando aforo y duplicidad`
- Mal: `-- Aquí validamos esto para que tu compañero entienda cómo generar el horario`
- Mal: cualquier comentario que narre el proceso de generación, mencione "IA", "Claude", o hable
  en segunda persona a un futuro lector del equipo.

Sin comentarios cuando el nombre del identificador ya es autoexplicativo. Sin docstrings largos.

## Convenciones

- SQL: snake_case, prefijos ya establecidos en el script (`usp_` procedures, `vw_` vistas,
  `fn_` funciones, `trg_` triggers, `IX_` índices, `CK_`/`FK_`/`PK_`/`UQ_` constraints).
- No modificar el modelo de datos (tablas, columnas, relaciones) sin que el usuario lo pida
  explícitamente — la lógica nueva se adapta en la capa de procedimientos/API, no en el esquema.
- No hardcodear credenciales; usar variables de entorno (`.env`, nunca commiteado).
