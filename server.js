const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/proxy", async (req, res) => {
    try {
        const response = await axios.post("https://www.fastssh.com/page/create-obfs-process", req.body, {
            headers: { "Content-Type": "application/json" }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: "Request gagal" });
    }
});

app.listen(3000, () => console.log("Proxy berjalan di port 3000"));
