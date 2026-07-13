# EduGestor

Sistema de gestión académica para colegios (Inicial, Primaria, Secundaria). Proyecto final del
curso Base de Datos II — UNFV.

Stack: SQL Server (`database/`), API en Node.js/Express (`server/`), cliente en React (`client/`).
React nunca se conecta directo a SQL Server — todo pasa por la API.

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior.
- SQL Server (Express, Developer o cualquier edición), local o remoto.
- Una herramienta para ejecutar scripts `.sql`: [SQL Server Management Studio](https://learn.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms), Azure Data Studio, o `sqlcmd`.

## 1. Base de datos

### 1.1 Autenticación SQL

El servidor Node se conecta con **usuario y contraseña de SQL Server** (no con autenticación de
Windows). Si tu instancia solo tiene habilitada la autenticación de Windows:

1. En SSMS, conéctate con Windows Authentication, clic derecho sobre el servidor → **Properties → Security** → selecciona **SQL Server and Windows Authentication mode** → OK.
2. Reinicia el servicio de SQL Server (clic derecho sobre el servidor → **Restart**, o desde `services.msc`).
3. Crea un login para la app: **Security → Logins** → clic derecho → **New Login...** → nombre (ej. `edugestor_app`), **SQL Server authentication**, contraseña, destilda "Enforce password policy" si es un entorno local de desarrollo.

### 1.2 Puerto (solo si usas una instancia con nombre, ej. `SQLEXPRESS`)

Si tu servidor es `localhost\NOMBREINSTANCIA` en vez de `localhost` a secas, por defecto escucha
en un puerto dinámico. Para no depender de eso, fija un puerto fijo:

1. **SQL Server Configuration Manager** → **SQL Server Network Configuration → Protocols for `<instancia>`** → habilita **TCP/IP** si está deshabilitado.
2. Doble clic en **TCP/IP → pestaña IP Addresses** → baja hasta **IPAll** → borra "TCP Dynamic Ports" → pon `1433` en "TCP Port".
3. Reinicia el servicio de SQL Server.

Si tu instancia es la default (`localhost`, sin nombre), normalmente ya escucha en `1433` y puedes
saltarte este paso.

### 1.3 Crear la base de datos

Ejecuta los tres scripts **en orden** (con SSMS: File → Open → File, luego F5; o con `sqlcmd`):

```
database/01_schema.sql    -- crea la base EduGestor_SQLServer_Actualizado y las 17 tablas
database/02_seed.sql      -- datos de prueba (usuarios ya vienen con la contraseña demo1234 hasheada)
database/03_objects.sql   -- indices, vistas, funciones, procedimientos, triggers y cursores
```

Con `sqlcmd` (ajusta servidor/puerto/usuario a lo que hayas configurado):

```
sqlcmd -S localhost,1433 -U edugestor_app -P "<tu_password>" -C -i database/01_schema.sql
sqlcmd -S localhost,1433 -U edugestor_app -P "<tu_password>" -C -i database/02_seed.sql
sqlcmd -S localhost,1433 -U edugestor_app -P "<tu_password>" -C -i database/03_objects.sql
```

(El primer script necesita permiso para `CREATE DATABASE`; si tu login no lo tiene, corre
`01_schema.sql` con un usuario administrador y luego mapea `edugestor_app` como `db_owner` de
`EduGestor_SQLServer_Actualizado` en **Security → Logins → tu login → Properties → User Mapping**
antes de correr los otros dos scripts.)

## 2. Servidor (API)

```
cd server
npm install
cp .env.example .env
npm run dev
```

Completa `server/.env` con los datos reales de tu SQL Server:

```
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=EduGestor_SQLServer_Actualizado
DB_USER=edugestor_app
DB_PASSWORD=<tu_password>
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

JWT_SECRET=<una_cadena_aleatoria_larga>
```

La API queda escuchando en `http://localhost:4000/api`. Puedes probar que levantó bien con:

```
curl -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d "{\"correo_electronico\":\"secretaria@colegio.pe\",\"contrasenia\":\"demo1234\"}"
```

## 3. Cliente (React)

```
cd client
npm install
cp .env.example .env   # VITE_API_URL debe apuntar al server (por defecto http://localhost:4000/api)
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## Usuarios de prueba

Todos con contraseña `demo1234`:

| Correo | Rol |
|---|---|
| secretaria@colegio.pe | Secretaria |
| prof.perez@colegio.pe | Profesor |
| prof.garcia@colegio.pe | Profesor |
| ana.torres@colegio.pe | Alumno |
| luis.ramos@colegio.pe | Alumno |
| maria.lopez@colegio.pe | Alumno |

## Estructura del proyecto

```
database/   scripts SQL Server: esquema, datos de prueba, indices/vistas/SPs/triggers/cursores
server/     API Express — unica capa que se conecta a SQL Server (JWT + bcrypt)
client/     app React (Vite) — consume la API, separada por rol (Secretaria/Profesor/Alumno)
```
