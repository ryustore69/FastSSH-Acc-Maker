require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const SITE_KEY = process.env.SITE_KEY;
const FASTSSH_URL = process.env.FASTSSH_URL;

// Route untuk verifikasi reCAPTCHA dan forward request ke FastSSH
app.post('/create-account', async (req, res) => {
    try {
        const { recaptchaResponse, formData } = req.body;

        // Verifikasi reCAPTCHA dengan Google
        const googleResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret: SITE_KEY,
                response: recaptchaResponse
            }
        });

        if (!googleResponse.data.success) {
            return res.status(400).json({ error: 'reCAPTCHA validation failed' });
        }

        // Kirim permintaan ke FastSSH
        const fastSshResponse = await axios.post(FASTSSH_URL, formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        res.json(fastSshResponse.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
