document.getElementById("submitBtn").addEventListener("click", async function () {
    const username = document.getElementById("username").value.trim();
    const sni = document.getElementById("sni").value.trim();
    const protocol = document.getElementById("protocol").value;
    const recaptchaResponse = grecaptcha.getResponse();
    const responseBox = document.getElementById("responseBox"); // Textarea untuk menampilkan hasil

    if (!username || !sni || !protocol) {
        alert("Harap isi semua kolom!");
        return;
    }

    if (!recaptchaResponse) {
        alert("Harap selesaikan reCAPTCHA!");
        return;
    }

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("sni", sni);
    formData.append("protocol", protocol);
    formData.append("recaptcha", recaptchaResponse);

    try {
        const response = await fetch("https://fastssh.com/page/create-obfs-process", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        });

        const text = await response.text(); // Ambil response dalam format teks

        try {
            // Coba parsing sebagai JSON
            const result = JSON.parse(text);
            responseBox.value = JSON.stringify(result, null, 2);
        } catch (e) {
            // Jika bukan JSON, coba parsing sebagai HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, "text/html");

            // Cari teks yang berisi konfigurasi akun
            const reportDiv = doc.getElementById("report");
            if (reportDiv) {
                responseBox.value = reportDiv.innerText.trim();
            } else {
                responseBox.value = text; // Jika tidak ditemukan, tampilkan teks asli
            }
        }

        grecaptcha.reset(); // Reset reCAPTCHA setelah sukses

    } catch (error) {
        alert("Terjadi kesalahan saat menghubungi server: " + error.message);
        responseBox.value = `Terjadi kesalahan: ${error.message}`;
    }
});