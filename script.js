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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

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