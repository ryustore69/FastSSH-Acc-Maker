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

    const formData = { username, sni, protocol, recaptcha: recaptchaResponse };

    try {
        const response = await fetch("https://cors-anywhere-0.glitch.me/fast-sth-acc-maker.vercel.app/create-account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        // Pengecekan apakah response JSON valid
        const text = await response.text();
        try {
            const result = JSON.parse(text);

            if (result.success) {
                document.getElementById("result").innerHTML = `
                    <p>Akun Berhasil Dibuat:</p>
                    <textarea rows="5" readonly>${result.accountData}</textarea>
                `;
                grecaptcha.reset();
            } else {
                alert("Gagal membuat akun: " + result.error);
            }
        } catch (e) {
            console.error("Respon bukan JSON:", text);
            alert("Terjadi kesalahan: Server mengembalikan data yang tidak valid.");
        }

    } catch (error) {
        alert("Terjadi kesalahan saat menghubungi server: " + error.message);
    }
});
