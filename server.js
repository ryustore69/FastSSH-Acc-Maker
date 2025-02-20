const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/create-account", async (req, res) => {
    const { username, sni, protocol, recaptcha } = req.body;

    if (!username || !sni || !protocol || !recaptcha) {
        return res.status(400).json({ success: false, error: "Data tidak lengkap!" });
    }

    try {
        const fastsshResponse = await axios.post("https://fastssh.com/page/create-obfs-process", new URLSearchParams({
            username,
            sni,
            protocol,
            recaptcha
        }), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        res.send(fastsshResponse.data);
    } catch (error) {
        res.status(500).json({ success: false, error: "Gagal menghubungi server FastSSH." });
    }
});

app.listen(3000, () => console.log("Server berjalan di port 3000"));
