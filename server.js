const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// ✅ Konfigurasi CORS agar mengizinkan request dari frontend
app.use(cors({
    origin: "https://fast-ssh-acc-maker.vercel.app", // Ganti dengan domain frontend Anda
    methods: "GET, POST, OPTIONS",
    allowedHeaders: "Content-Type, Authorization"
}));

app.use(bodyParser.json());

// ✅ Menangani preflight request OPTIONS
app.options("*", (req, res) => {
    res.sendStatus(200);
});

// ✅ Contoh endpoint untuk menerima request dari frontend
app.post("/api/create-account", async (req, res) => {
    try {
        const { username, sni, protocol, recaptcha } = req.body;

        if (!username || !sni || !protocol || !recaptcha) {
            return res.status(400).json({ success: false, error: "Data tidak lengkap!" });
        }

        res.json({ success: true, message: "Akun berhasil dibuat", data: { username, sni, protocol } });
    } catch (error) {
        res.status(500).json({ error: "Terjadi kesalahan pada server", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
