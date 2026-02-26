const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./database");

const app = express();
app.use(express.static("public"));
app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>{
    res.redirect("/login.html");
});

// REGISTRO
app.post("/register", async (req, res) => {
    const { usuario, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    try {
        await db.query(
            "INSERT INTO usuarios (usuario, password) VALUES ($1,$2)",
            [usuario, hash]
        );
        res.json({ success: true });
    } catch {
        res.json({ success: false, message: "Usuario ya existe" });
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

        res.json({ success: valido });

    } catch (err) {
        console.log(err);
        res.json({ success:false });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log("Servidor listo en puerto", PORT);
});