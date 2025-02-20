document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("submitBtn").addEventListener("click", async function () {
        await submitForm();
    });
});

async function submitForm() {
    try {
        if (typeof grecaptcha === "undefined") {
            alert("reCAPTCHA gagal dimuat! Pastikan koneksi internet stabil lalu refresh halaman.");
            return;
        }

        grecaptcha.ready(async function () {
            try {
                const siteKey = "YOUR_SITE_KEY"; // Ganti dengan site key yang benar dari Google reCAPTCHA
                const recaptchaToken = await grecaptcha.execute(siteKey, { action: "submit" });

                const username = document.getElementById("username").value.trim();
                const sni = document.getElementById("sni").value.trim();
                const protocol = document.getElementById("protocol").value;

                if (!username || !sni || !protocol) {
                    alert("Harap isi semua kolom sebelum mengirim.");
                    return;
                }

                const formData = new URLSearchParams();
                formData.append("username", username);
                formData.append("sni", sni);
                formData.append("protocol", protocol);
                formData.append("g-recaptcha-response", recaptchaToken);

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
    } catch (error) {
        console.error("Error:", error);
        alert("Kesalahan saat menghubungi server.");
    }
}
