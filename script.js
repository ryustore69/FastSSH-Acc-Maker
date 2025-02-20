document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("submitBtn").addEventListener("click", async function () {
        await submitForm();
    });
});

async function submitForm() {
    if (typeof grecaptcha === "undefined") {
        alert("reCAPTCHA gagal dimuat! Pastikan koneksi internet stabil lalu refresh halaman.");
        return;
    }

    grecaptcha.ready(async function () {
        try {
            // Dapatkan token reCAPTCHA
            const recaptchaToken = await grecaptcha.execute("6LcpDQ8UAAAAAGcJOV1eC9WuOM6meGgn5-rVINkC", { action: "submit" });

            const formData = new URLSearchParams();
            formData.append("username", document.getElementById("username").value);
            formData.append("sni", document.getElementById("sni").value);
            formData.append("protocol", document.getElementById("protocol").value);
            formData.append("g-recaptcha-response", recaptchaToken);

            // URL target untuk permintaan akun VPN
            const targetUrl = "https://www.fastssh.com/page/create-obfs-process";

            const response = await fetch(targetUrl, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Referer": "https://www.fastssh.com/page/create-obfs-account/server/3/obfs-asia-sg/",
                    "Origin": "https://www.fastssh.com"
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error("Gagal membuat akun, coba lagi.");
            }

            const resultText = await response.text();
            document.getElementById("result").innerHTML = `<pre>${resultText}</pre>`;
        } catch (error) {
            alert("Terjadi kesalahan: " + error.message);
        }
    });
}
