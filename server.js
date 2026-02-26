const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./database");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use("/frontend", express.static(path.join(__dirname, "frontend")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// REGISTRO
app.post("/register", async (req, res) => {
    try {
        const { usuario, password } = req.body;
        const hash = await bcrypt.hash(password, 10);

        await db.query(
            "INSERT INTO usuarios (usuario, password) VALUES ($1,$2)",
            [usuario, hash]
        );

        res.json({ success:true });

    } catch {
        res.json({ success:false, message:"Usuario ya existe" });
    }
});

// LOGIN
app.post("/login", async (req, res) => {
    try {
        const { usuario, password } = req.body;

        const result = await db.query(
            "SELECT * FROM usuarios WHERE usuario=$1",
            [usuario]
        );

        if (result.rows.length === 0)
            return res.json({ success:false });

        const valido = await bcrypt.compare(password, result.rows[0].password);
        res.json({ success:valido });

    } catch {
        res.json({ success:false });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Servidor listo en puerto", PORT));