document.getElementById("submitBtn").addEventListener("click", async function () {
    const username = document.getElementById("username").value.trim();
    const sni = document.getElementById("sni").value.trim();
    const protocol = document.getElementById("protocol").value;
    const recaptchaResponse = grecaptcha.getResponse();
    const responseBox = document.getElementById("responseBox"); // Textarea untuk menampilkan JSON

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
        const response = await fetch("https://cors-anywhere-0.glitch.me/https://fast-sth-acc-maker.vercel.app/create-account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const text = await response.text(); // Ambil response dalam format teks

        try {
            const result = JSON.parse(text); // Coba parsing response sebagai JSON

            if (result.success) {
                responseBox.value = JSON.stringify(result, null, 2); // Tampilkan hasil JSON di textarea
                grecaptcha.reset(); // Reset reCAPTCHA setelah sukses
            } else {
                alert("Gagal membuat akun: " + (result.error || "Terjadi kesalahan tidak diketahui."));
                responseBox.value = JSON.stringify(result, null, 2); // Tetap tampilkan JSON meski gagal
            }
        } catch (e) {
            console.error("Respon bukan JSON:", text);
            alert("Terjadi kesalahan: Server mengembalikan data yang tidak valid.");
            responseBox.value = text; // Tampilkan respon mentah jika bukan JSON
        }

    } catch (error) {
        alert("Terjadi kesalahan saat menghubungi server: " + error.message);
        responseBox.value = `Terjadi kesalahan: ${error.message}`;
    }
});
