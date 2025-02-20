document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("submitBtn").addEventListener("click", async function () {
        const username = document.getElementById("username").value.trim();
        const sni = document.getElementById("sni").value.trim();
        const protocol = document.getElementById("protocol").value;
        const recaptchaResponse = grecaptcha.getResponse();

        if (!username || !sni || !protocol) {
            alert("Harap isi semua kolom!");
            return;
        }

        if (!recaptchaResponse) {
            alert("Harap selesaikan reCAPTCHA!");
            return;
        }

        const formData = {
            username,
            sni,
            protocol,
            recaptcha: recaptchaResponse
        };

        try {
            const response = await fetch("/create-account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                document.getElementById("result").innerHTML = `
                    <p>Akun Berhasil Dibuat:</p>
                    <textarea rows="5" readonly>${result.accountData}</textarea>
                `;
                grecaptcha.reset(); // Reset reCAPTCHA setelah berhasil
            } else {
                alert("Gagal membuat akun: " + result.error);
            }
        } catch (error) {
            alert("Terjadi kesalahan: " + error.message);
        }
    });
});
