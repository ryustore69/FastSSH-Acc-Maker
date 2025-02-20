document.getElementById("submitBtn").addEventListener("click", async function () {
    const username = document.getElementById("username").value.trim();
    const sni = document.getElementById("sni").value.trim();
    const protocol = document.getElementById("protocol").value;
    const recaptchaResponse = grecaptcha.getResponse();
    const responseBox = document.getElementById("responseBox");

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
        const response = await fetch("https://www.fastssh.com/page/create-obfs-process", { // Change this!
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
                "Referer": "https://www.fastssh.com/",
                "Origin": "https://www.fastssh.com/"
            },
            body: JSON.stringify
            })
            .then(res => res.text())
            .then(data => console.log(data))
            .catch(error => console.error("Error:", error));

        const text = await response.text();
        console.log("Raw Response:", text);

        try {
            const result = JSON.parse(text);
            responseBox.value = JSON.stringify(result, null, 2);
            grecaptcha.reset();
        } catch (e) {
            console.warn("Response is not JSON, displaying raw response...");
            responseBox.value = text;
        }
    } catch (error) {
        alert("Terjadi kesalahan saat menghubungi server: " + error.message);
        responseBox.value = `Terjadi kesalahan: ${error.message}`;
    }
});