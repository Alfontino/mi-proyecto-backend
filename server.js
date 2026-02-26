const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./database"); // tu conexión a SQLite


const app = express();

// Middleware
app.use(cors()); // permite que tu frontend en Vercel/Railway haga fetch
app.use(express.json());

// Puerto dinámico para producción (Railway asigna uno)
const PORT = process.env.PORT || 8080;

// ------------------- RUTAS -------------------

// Registro de usuario
app.post("/register", async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.json({ success: false, message: "Faltan datos" });
    }

    // Hasheo de contraseña
    const hash = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO usuarios (usuario, password) VALUES (?, ?)",
      [usuario, hash],
      function (err) {
        if (err) {
          return res.json({ success: false, message: "Usuario ya existe" });
        }
        res.json({ success: true });
      }
    );
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.json({ success: false, message: "Faltan datos" });
    }

    db.get(
      "SELECT * FROM usuarios WHERE usuario = ?",
      [usuario],
      async (err, row) => {
        if (err) return res.json({ success: false, message: err.message });
        if (!row) return res.json({ success: false, message: "Usuario no encontrado" });

        const valido = await bcrypt.compare(password, row.password);
        res.json({ success: valido });
      }
    );
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Obtener todos los usuarios (solo nombres, sin passwords)
app.get("/usuarios", (req, res) => {
  db.all("SELECT usuario FROM usuarios", (err, rows) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(rows);
  });
});

// ------------------- INICIO DEL SERVIDOR -------------------
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
});