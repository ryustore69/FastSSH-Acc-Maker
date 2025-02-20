const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/create-account", async (req, res) => {
    const { username, sni, protocol, recaptcha } = req.body;

    if (!username || !sni || !protocol || !recaptcha) {
        return res.status(400).json({ success: false, error: "Data tidak lengkap!" });
    }

    res.json({
        success: true,
        accountData: `Username: ${username}\nSNI: ${sni}\nProtocol: ${protocol}`
    });
});

app.listen(3000, () => console.log("Server berjalan di port 3000"));
