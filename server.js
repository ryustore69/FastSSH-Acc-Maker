const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/proxy", async (req, res) => {
  try {
    const response = await fetch("https://www.fastssh.com/page/create-obfs-process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": req.headers["user-agent"], // Gunakan user-agent browser
        "Referer": "https://www.fastssh.com/",
        "Origin": "https://www.fastssh.com/"
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.text();
    res.send(data);
  } catch (error) {
    res.status(500).send({ error: "Request gagal" });
  }
});

app.listen(3000, () => console.log("Proxy server running on port 3000"));
