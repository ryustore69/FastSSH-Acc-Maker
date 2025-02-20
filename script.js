document.getElementById("submitBtn").addEventListener("click", async function () {
    const username = document.getElementById("username").value.trim();
    const sni = document.getElementById("sni").value.trim();
    const protocol = document.getElementById("protocol").value;
    const recaptchaResponse = grecaptcha.getResponse();
    const responseBox = document.getElementById("responseBox");

    // Validasi input
    if (!username || !sni || !protocol) {
        alert("Harap isi semua kolom!");
        return;
    }

    if (!recaptchaResponse) {
        alert("Harap selesaikan reCAPTCHA!");
        return;
    }

    const requestData = { username, sni, protocol, recaptcha: recaptchaResponse };

    try {
        const response = await fetch("https://api.allorigins.win/raw?url=https://www.fastssh.com/page/create-obfs-process", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": navigator.userAgent, // Ambil User-Agent secara dinamis
                "Referer": "https://www.fastssh.com/",
                "Origin": "https://www.fastssh.com/"
            },
            body: JSON.stringify(requestData),
        });

        // Periksa apakah respons sukses
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const text = await response.text();
        console.log("Raw Response:", text);

        // Coba parse JSON jika memungkinkan
        let result;
        try {
            result = JSON.parse(text);
            responseBox.value = JSON.stringify(result, null, 2);
        } catch (e) {
            console.warn("Response is not JSON, displaying raw response...");
            responseBox.value = text;
        }

        // Reset reCAPTCHA setelah sukses
        grecaptcha.reset();
    } catch (error) {
        console.error("Error:", error);
        alert("Terjadi kesalahan saat menghubungi server: " + error.message);
        responseBox.value = `Terjadi kesalahan: ${error.message}`;
    }
});
