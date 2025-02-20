document.getElementById("submitBtn").addEventListener("click", async function () {
    const serverid = document.getElementById("serverid").value.trim();
    const username = document.getElementById("username").value.trim();
    const sni_bug = document.getElementById("sni").value.trim();
    const protocol = document.getElementById("protocol").value;
    const ssid = document.getElementById("ssid").value.trim();
    const captcha = grecaptcha.getResponse();
    const responseBox = document.getElementById("responseBox");

    // Validasi input
    if (!serverid || !username || !sni_bug || !protocol || !ssid) {
        alert("Harap isi semua kolom!");
        return;
    }

    if (!captcha) {
        alert("Harap selesaikan reCAPTCHA!");
        return;
    }

    const requestData = { serverid, username, sni_bug, protocol, ssid, captcha };

    try {
        // Kirim request untuk membuat akun
        const response = await fetch("https://api.allorigins.win/raw?url=https://www.fastssh.com/page/create-obfs-process", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": navigator.userAgent, // Ambil User-Agent dari browser
                "Referer": "https://www.fastssh.com/",
                "Origin": "https://www.fastssh.com/"
            },
            body: JSON.stringify(requestData),
        });

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

            // Jika data akun tersedia, proses untuk ditampilkan
            processAccountData(text);
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

// Fungsi untuk parsing akun VLESS dari respons HTML
function processAccountData(responseText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(responseText, "text/html");
    const reportDiv = doc.getElementById("report");

    if (!reportDiv) {
        console.error("Elemen report tidak ditemukan dalam respons.");
        return;
    }

    const accountData = {
        status: "success",
        message: "Account has been successfully created",
        validity: "7 days",
        accounts: []
    };

    // Ambil semua textarea yang berisi akun VLESS
    const textareas = reportDiv.getElementsByTagName("textarea");

    for (let textarea of textareas) {
        const value = textarea.value.trim();
        const match = value.match(/vless:\/\/([^@]+)@([^:]+):(\d+)\?path=([^&]+)&security=([^&]+)&encryption=([^&]+)&type=([^&]+)(?:&sni=([^#]+))?#(.+)/);

        if (match) {
            accountData.accounts.push({
                uuid: match[1],
                server: match[2],
                port: match[3],
                path: decodeURIComponent(match[4]),
                security: match[5],
                encryption: match[6],
                type: match[7],
                sni: match[8] || "None",
                description: match[9]
            });
        }
    }

    console.log("Parsed Account Data:", accountData);

    // Tampilkan hasil parsing di responseBox dalam format JSON yang lebih rapi
    const responseBox = document.getElementById("responseBox");
    responseBox.value = JSON.stringify(accountData, null, 2);
}
