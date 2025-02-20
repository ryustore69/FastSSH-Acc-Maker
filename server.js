const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Proxy endpoint
app.post("/api/create-account", async (req, res) => {
    try {
        const { username, sni, protocol, recaptcha } = req.body;

        if (!username || !sni || !protocol || !recaptcha) {
            return res.status(400).json({ success: false, error: "Data tidak lengkap!" });
        }

        // Forward request to FastSSH
        const fastSSHResponse = await axios.post("https://www.fastssh.com/page/create-obfs-process", req.body, {
            headers: {
                "Content-Type": "application/json",
                "Referer": "https://www.fastssh.com",  // Spoof Referer if needed
                "Origin": "https://www.fastssh.com"  // Spoof Origin if needed
            }
        });

        res.json(fastSSHResponse.data); // Return FastSSH's response
    } catch (error) {
        res.status(500).json({ error: "Gagal menghubungi FastSSH", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
