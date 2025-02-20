const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();

// ✅ Allow all origins (or specify a domain)
app.use(cors({
    origin: "*", // Change to "https://yourfrontend.com" if needed
    methods: "GET, POST, OPTIONS",
    allowedHeaders: "Content-Type, Authorization"
}));

app.use(bodyParser.json());

// ✅ Handle preflight CORS requests
app.options("*", (req, res) => {
    res.sendStatus(200);
});

// ✅ Proxy endpoint to FastSSH
app.post("/api/create-account", async (req, res) => {
    try {
        const { username, sni, protocol, recaptcha } = req.body;

        if (!username || !sni || !protocol || !recaptcha) {
            return res.status(400).json({ success: false, error: "Missing required fields!" });
        }

        const fastSSHResponse = await axios.post("https://www.fastssh.com/page/create-obfs-process", req.body, {
            headers: {
                "Content-Type": "application/json",
                "Referer": "https://www.fastssh.com", // Spoof Referer if needed
                "Origin": "https://www.fastssh.com"  // Spoof Origin if needed
            }
        });

        res.json(fastSSHResponse.data); // Return FastSSH's response
    } catch (error) {
        res.status(500).json({ error: "Failed to contact FastSSH", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
