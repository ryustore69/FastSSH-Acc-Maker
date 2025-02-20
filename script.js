document.getElementById("submitBtn").addEventListener("click", async function () {
    const username = document.getElementById("username").value.trim();
    const sni = document.getElementById("sni").value.trim();
    const protocol = document.getElementById("protocol").value;
    const recaptchaResponse = grecaptcha.getResponse();
    const responseBox = document.getElementById("responseBox"); // Textarea untuk hasil

    if (!username || !sni || !protocol) {
        alert("Harap isi semua kolom!");
        return;
    }

    if (!recaptchaResponse) {
        alert("Harap selesaikan reCAPTCHA!");
        return;
    }

    // ✅ Pastikan data didefinisikan sebelum dipakai
    const requestData = {
        username: username,
        sni: sni,
        protocol: protocol,
        recaptcha: recaptchaResponse
    };

    try {
        const response = await fetch("https://www.fastssh.com/page/create-obfs-process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData) // ✅ Menggunakan requestData, bukan "data" yang belum ada
        });

        const text = await response.text(); // Ambil response dalam format teks

        try {
            const result = JSON.parse(text); // Coba parsing response sebagai JSON

            if (result.success) {
                responseBox.value = JSON.stringify(result, null, 2); // Tampilkan hasil JSON di textarea
                grecaptcha.reset(); // Reset reCAPTCHA setelah sukses
            } else {
                alert("Gagal membuat akun: " + (result.error || "Terjadi kesalahan tidak diketahui."));
                responseBox.value = JSON.stringify(result, null, 2);
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
