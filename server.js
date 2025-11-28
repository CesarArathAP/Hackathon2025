require('dotenv').config();
const express = require("express");
const path = require("path");
const fs = require("fs").promises;
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

// Servir carpeta de diagnósticos (ya está incluida en /assets)
// app.use("/diagnosticos", express.static(path.join(__dirname, "mvc", "assets", "diagnosticos")));

// Servir archivos estáticos
app.use(express.static("."));

// Crear carpeta para diagnósticos si no existe (en mvc/assets/diagnosticos)
const diagnosticosDir = path.resolve(__dirname, "mvc", "assets", "diagnosticos");
fs.mkdir(diagnosticosDir, { recursive: true }).catch(console.error);
console.log(`📁 Ruta de diagnósticos configurada: ${diagnosticosDir}`);

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
Todos esto con un límite de 50 palabras por segmento, cada cosa que generes de texto tiene que ser en español.

Respuestas del formulario:
${JSON.stringify(form, null, 2)}
`;
}

// Función para generar nombre único de archivo
function generarNombrePDF(idUsuario) {
  const timestamp = Date.now();
  const fecha = new Date().toISOString().split('T')[0];
  return `diagnostico_${idUsuario}_${fecha}_${timestamp}.pdf`;
}

// ==================== RUTAS API IA ====================
// Endpoint para generar diagnóstico con IA
app.post("/api/generate", async (req, res) => {
  try {
    const { form, id_usuario } = req.body;
    if (!form) return res.status(400).json({ error: "Falta el campo form" });
    
    console.log('🤖 Generando diagnóstico con IA...');
    const prompt = buildPrompt(form);
    const result = await model.generateContent(prompt);
    let text = cleanJSON(result.response.text());
    let json;
    
    try {
      json = JSON.parse(text);
    } catch (err) {
      console.error('❌ Error al parsear JSON de IA:', err);
      return res.status(200).json({ error: "JSON inválido", raw: text });
    }
    
    console.log('✓ Diagnóstico generado por IA');
    
    // Si tenemos id_usuario, guardar automáticamente en BD
    if (id_usuario) {
      try {
        const idUsuarioNum = parseInt(id_usuario, 10);
        if (!isNaN(idUsuarioNum) && idUsuarioNum > 0) {
          const { Diagnostico } = require("./mvc/models/modelos");
          
          // Generar nombre único para el PDF
          const nombrePDF = generarNombrePDF(idUsuarioNum);
          
          console.log(`📝 Guardando diagnóstico automáticamente en BD:`, {
            id_usuario: idUsuarioNum,
            nombre: nombrePDF,
            contactado: 1
          });
          
          const id_diagnostico = await Diagnostico.create({
            id_usuario: idUsuarioNum,
            nombre: nombrePDF,
            tiempo: new Date(),
            contactado: 1
          });
          
          console.log(`✓ Diagnóstico guardado automáticamente en BD con ID: ${id_diagnostico}`);
          
          // Agregar el ID del diagnóstico a la respuesta
          json.id_diagnostico = id_diagnostico;
          json.nombre_archivo = nombrePDF;
        }
      } catch (dbError) {
        console.error('⚠️ Error al guardar automáticamente en BD (continuando):', dbError.message);
        // No fallar la petición si falla el guardado automático
        // El usuario puede guardar manualmente después
      }
    }
    
    // Guardar globalmente para referencia temporal
    global.ultimoDiagnostico = json;
    
    res.json({ 
      diagnostico: json,
      message: "Diagnóstico generado exitosamente"
    });
  } catch (err) {
    console.error("❌ Error en /api/generate:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para generar y guardar PDF
app.post("/api/pdf/generate", async (req, res) => {
  try {
    const { diagnostico, id_usuario } = req.body;
    
    if (!diagnostico || !id_usuario) {
      return res.status(400).json({ 
        error: "Se requiere el diagnóstico y el id_usuario" 
      });
    }

    // Generar nombre único para el PDF
    const nombrePDF = generarNombrePDF(id_usuario);
    const rutaPDF = path.resolve(diagnosticosDir, nombrePDF);
    console.log(`📄 Guardando PDF en: ${rutaPDF}`);

    // Crear el PDF
    const doc = new PDFDocument({ margin: 50 });
    const writeStream = require('fs').createWriteStream(rutaPDF);

    doc.pipe(writeStream);

    // Título principal
    doc.fontSize(22).fillColor('#1b5e20').text("Diagnóstico Catastral", { align: "center" });
    doc.moveDown();
    doc.fillColor('#000000');
    
    // Fecha
    doc.fontSize(10).text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, { align: "right" });
    doc.moveDown(2);
    
    // Diagnóstico Técnico
    doc.fontSize(14).fillColor('#1b5e20').text("Diagnóstico Técnico:", { underline: true });
    doc.fillColor('#000000');
    doc.fontSize(12).text(diagnostico.diagnostico_tecnico || "N/A", { align: "justify" });
    doc.moveDown(1.5);
    
    // Nivel de Madurez
    doc.fontSize(14).fillColor('#1b5e20').text("Nivel de Madurez:", { underline: true });
    doc.fillColor('#000000');
    doc.fontSize(12).text(diagnostico.nivel_madurez || "N/A", { align: "justify" });
    doc.moveDown(1.5);
    
    // Recomendaciones IUCA
    doc.fontSize(14).fillColor('#1b5e20').text("Recomendaciones IUCA:", { underline: true });
    doc.fillColor('#000000');
    doc.fontSize(12).text(diagnostico.recomendaciones_IUCA || "N/A", { align: "justify" });
    doc.moveDown(1.5);
    
    // Resumen Ejecutivo
    doc.fontSize(14).fillColor('#1b5e20').text("Resumen Ejecutivo:", { underline: true });
    doc.fillColor('#000000');
    doc.fontSize(12).text(diagnostico.resumen_ejecutivo || "N/A", { align: "justify" });
    
    doc.end();

    // Esperar a que termine de escribirse el archivo
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    console.log(`✓ PDF guardado: ${nombrePDF}`);

    // Registrar en la base de datos
    let id_diagnostico = null;
    try {
      const { Diagnostico } = require("./mvc/models/modelos");
      
      // Validar que id_usuario sea un número válido
      const idUsuarioNum = parseInt(id_usuario, 10);
      if (isNaN(idUsuarioNum) || idUsuarioNum <= 0) {
        throw new Error(`ID de usuario inválido: ${id_usuario}`);
      }
      
      console.log(`📝 Intentando guardar diagnóstico en BD:`, {
        id_usuario: idUsuarioNum,
        nombre: nombrePDF,
        contactado: 1
      });
      
      id_diagnostico = await Diagnostico.create({
        id_usuario: idUsuarioNum,
        nombre: nombrePDF, // Solo guardamos el nombre del archivo
        tiempo: new Date(),
        contactado: 1 // 1 = Pendiente, 0 = Contactado
      });
      
      if (!id_diagnostico) {
        throw new Error('No se retornó un ID del diagnóstico creado');
      }
      
      console.log(`✓ Diagnóstico registrado en BD con ID: ${id_diagnostico}, contactado: 1 (Pendiente)`);
    } catch (dbError) {
      console.error("❌ Error al registrar en BD:", dbError);
      console.error("   Stack:", dbError.stack);
      // NO continuar si falla el guardado en BD - es crítico
      throw new Error(`Error al guardar diagnóstico en BD: ${dbError.message}`);
    }

    res.json({
      success: true,
      nombre_archivo: nombrePDF,
      id_diagnostico: id_diagnostico,
      ruta_descarga: `/api/diagnosticos/${id_diagnostico}/pdf`,
      message: "PDF generado y guardado exitosamente"
    });

  } catch (err) {
    console.error("Error al generar PDF:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para descargar PDF (alternativo, también está en el controlador)
app.get("/api/pdf/download/:nombreArchivo", async (req, res) => {
  try {
    const { nombreArchivo } = req.params;
    const rutaPDF = path.resolve(diagnosticosDir, nombreArchivo);

    // Verificar si existe
    try {
      await fs.access(rutaPDF);
    } catch {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    res.download(rutaPDF, nombreArchivo, (err) => {
      if (err) {
        console.error("Error al descargar:", err);
        res.status(500).json({ error: "Error al descargar el archivo" });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== RUTAS API ORIGINALES ====================
// Rutas de controladores originales (incluye /api/diagnosticos)
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

// Página de resultados
app.get("/resultado", (req, res) => {
  res.sendFile(path.join(__dirname, "resultado.html"));
});

// Página Dashboard
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "mvc/public/dashboard.html"));
});

// ==================== MANEJO DE ERRORES ====================
// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Middleware para errores generales
app.use((err, req, res, next) => {
  console.error("Error en servidor:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

// ==================== SERVIDOR ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`✓ Servidor ejecutándose en http://localhost:${PORT}/`);
  console.log(`✓ Carpeta de PDFs: ${diagnosticosDir}`);
  // Probar conexión a la base de datos al iniciar
  await testConnection();
});