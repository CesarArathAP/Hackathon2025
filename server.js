require('dotenv').config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const controllers = require("./mvc/controllers/controladores");
const { testConnection } = require("./mvc/db/config");

const app = express();

// Middlewares
app.use(express.json());
app.use(bodyParser.json({ limit: "2mb" }));

// Servir carpeta public
app.use(express.static(path.join(__dirname, "mvc/public")));

// Servir assets
app.use("/assets", express.static(path.join(__dirname, "mvc/assets")));

// Servir archivos estáticos (para el segundo código)
app.use(express.static("."));

// ==================== FUNCIONES PARA IA ====================
// Inicializar modelo de IA
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Función para limpiar JSON que devuelve la IA
function cleanJSON(text) {
  return text.replace(/```json/gi, "").replace(/```/g, "").trim();
}

// Función para construir prompt para la IA
function buildPrompt(form) {
  return `
Eres un EXPERTO en catastro municipal con amplio conocimiento técnico.
Genera este JSON:
{
  "diagnostico_tecnico": "",
  "nivel_madurez": "",
  "recomendaciones_IUCA": "",
  "resumen_ejecutivo": ""
}
  todos esto con un limite de 50 palabras por segmento, cada cosa que generes de texto tiene que ser en español
Respuestas del formulario:
${JSON.stringify(form, null, 2)}
`;
}

// ==================== RUTAS API IA ====================
// Endpoint para generar diagnóstico con IA
app.post("/api/generate", async (req, res) => {
  try {
    const { form } = req.body;
    if (!form) return res.status(400).send("Falta el campo form");
    
    const prompt = buildPrompt(form);
    const result = await model.generateContent(prompt);
    let text = cleanJSON(result.response.text());
    let json;
    
    try {
      json = JSON.parse(text);
    } catch (err) {
      return res.status(200).json({ error: "JSON inválido", raw: text });
    }
    
    // Guardar globalmente para la página de resultado (temporal)
    global.ultimoDiagnostico = json;
    res.json({ diagnostico: json });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Endpoint para generar PDF
app.post("/api/pdf", (req, res) => {
  const diag = req.body;
  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];
  
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=diagnostico_catastral.pdf");
  
  doc.on("data", chunks.push.bind(chunks));
  doc.on("end", () => {
    const pdf = Buffer.concat(chunks);
    res.send(pdf);
  });
  
  doc.fontSize(22).text("Diagnóstico Catastral", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text("Diagnóstico Técnico:", { underline: true });
  doc.fontSize(12).text(diag.diagnostico_tecnico);
  doc.moveDown();
  doc.fontSize(14).text("Nivel de Madurez:", { underline: true });
  doc.fontSize(12).text(diag.nivel_madurez);
  doc.moveDown();
  doc.fontSize(14).text("Recomendaciones IUCA:", { underline: true });
  doc.fontSize(12).text(diag.recomendaciones_IUCA);
  doc.moveDown();
  doc.fontSize(14).text("Resumen Ejecutivo:", { underline: true });
  doc.fontSize(12).text(diag.resumen_ejecutivo);
  
  doc.end();
});

// ==================== RUTAS API ORIGINALES ====================
// Rutas de controladores originales
app.use("/api", controllers);

// ==================== RUTAS DE PÁGINAS ====================
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

// Página Formulario
app.get("/formulario", (req, res) => {
  res.sendFile(path.join(__dirname, "mvc/public/master.html"));
});

// Página Ofrecemos
app.get("/ofrecemos", (req, res) => {
  res.sendFile(path.join(__dirname, "mvc/public/master.html"));
});

// ==================== SERVIDOR ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}/`);
  // Probar conexión a la base de datos al iniciar
  await testConnection();
});