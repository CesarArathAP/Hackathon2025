# Configuración de Base de Datos

## Variables de Entorno Requeridas

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Configuración de Base de Datos
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=u326020137_orb3x

# Configuración del Servidor
PORT=3000
```

## Uso de la Configuración

El archivo `config.js` exporta:
- `pool`: Pool de conexiones de MySQL
- `query(sql, params)`: Función para ejecutar queries
- `getConnection()`: Obtener una conexión del pool
- `testConnection()`: Probar la conexión a la base de datos

## Ejemplo de Uso

```javascript
const { query, testConnection } = require('./mvc/db/config');

// Probar conexión
await testConnection();

// Ejecutar query
const usuarios = await query('SELECT * FROM usuarios WHERE activo = 1');
```

