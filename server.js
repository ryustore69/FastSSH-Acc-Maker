const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const qs = require("querystring");

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true })); // Tambahkan middleware ini

app.post("/proxy", async (req, res) => {
  try {
    const formData = qs.stringify(req.body); // Ubah JSON ke format URL-encoded

    const response = await fetch("https://www.fastssh.com/page/create-obfs-process", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": req.headers["user-agent"],
        "Referer": "https://www.fastssh.com/",
        "Origin": "https://www.fastssh.com/"
      },
      body: formData
    });

    const data = await response.text();
    res.send(data);
  } catch (error) {
    res.status(500).send({ error: "Request gagal" });
  }
});

app.listen(3000, () => console.log("Proxy server running on port 3000"));
