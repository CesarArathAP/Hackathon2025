const express = require("express");
const path = require("path");
const app = express();
const controllers = require("./mvc/controllers/controladores");

// Parse JSON
app.use(express.json());

// Servir carpeta public
app.use(express.static(path.join(__dirname, "mvc/public")));

// Servir assets
app.use("/assets", express.static(path.join(__dirname, "mvc/assets")));

// Rutas API
app.use("/api", controllers);

// Página inicial (index)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "mvc/public/master.html"));
});

// Página Sobre Nosotros
app.get("/sobrenosotros", (req, res) => {
  res.sendFile(path.join(__dirname, "mvc/public/master.html"));
});

// Página Contáctenos
app.get("/contacto", (req, res) => {
  res.sendFile(path.join(__dirname, "mvc/public/master.html"));
});

// Página sobre nosotros usa master
app.get("/formulario", (req, res) => {
  res.sendFile(path.join(__dirname, "mvc/public/master.html"));
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
