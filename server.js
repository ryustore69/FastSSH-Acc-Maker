const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors()); // Izinkan semua request dari frontend
app.use(express.json()); // Parsing JSON body
app.use(express.urlencoded({ extended: true })); // Parsing form-data

// Proxy endpoint
app.post("/proxy", async (req, res) => {
    try {
        // Kirim request ke FastSSH
        const response = await axios.post("https://www.fastssh.com/page/create-obfs-process", req.body, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        // Kirim kembali respons dari server FastSSH ke frontend
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Error fetching data" });
    }
});

// Jalankan server di port 3000
app.listen(3000, () => console.log("Server running on port 3000"));
