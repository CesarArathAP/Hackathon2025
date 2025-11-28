require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
const controllers = require("./mvc/controllers/controladores");
const { testConnection } = require("./mvc/db/config");

// Parse JSON
app.use(express.json());

// Servir carpeta public
app.use(express.static(path.join(__dirname, "mvc/public")));

// Servir assets como carpeta pública
app.use("/assets", express.static(path.join(__dirname, "mvc/assets")));

// Rutas API
app.use("/api", controllers);

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "mvc/public/index.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/sobrenosotros.html"));
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  // Probar conexión a la base de datos al iniciar
  await testConnection();
});
