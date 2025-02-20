const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/create-account", async (req, res) => {
    const { username, sni, protocol, recaptcha } = req.body;

    if (!username || !sni || !protocol || !recaptcha) {
        return res.json({ success: false, error: "Data tidak lengkap!" });
    }

    // Validasi reCAPTCHA
    const recaptchaSecret = "YOUR_SECRET_KEY";
    const recaptchaResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptcha}`, {
        method: "POST"
    }).then(res => res.json());

    if (!recaptchaResponse.success) {
        return res.json({ success: false, error: "Verifikasi reCAPTCHA gagal!" });
    }

    // Simulasi akun yang dibuat
    const accountData = `Username: ${username}\nSNI: ${sni}\nProtocol: ${protocol}`;

    res.json({ success: true, accountData });
});

app.listen(3000, () => console.log("Server berjalan di port 3000"));
