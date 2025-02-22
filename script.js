document.addEventListener("DOMContentLoaded", function () {
    const submitBtn = document.getElementById("submitBtn");

    submitBtn.addEventListener("click", async function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const sni = document.getElementById("sni").value.trim();
        const protocol = document.getElementById("protocol").value;

        if (!username || !sni || !protocol) {
            alert("⚠️ Semua kolom harus diisi sebelum mengirim!");
            return;
        }

        try {
            const { serverid, ssid, captcha } = await fetchServerDataAndCaptcha();
            if (!serverid || !ssid || !captcha) {
                throw new Error("Server ID, SSID, atau Captcha tidak valid!");
            }

            const requestBody = new URLSearchParams({
                "serverid": serverid,
                "username": username,
                "sni_bug": sni,
                "protocol": protocol,
                "ssid": ssid,
                "captcha": captcha
            });

            const apiUrl = "https://sparkling-limit-b5ca.corspass.workers.dev/?apiurl=https://www.fastssh.com/page/create-obfs-process";

            console.log("🚀 Mengirim permintaan ke:", apiUrl);
            console.log("📩 Payload:", Object.fromEntries(requestBody));

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: requestBody
            });

            const responseText = await response.text();
            console.log("✅ Respons Server:", responseText);

            document.getElementById("responseBox").value = responseText;
            processAccountData(responseText);

        } catch (error) {
            console.error("❌ Error:", error);
            alert("⚠️ Gagal membuat akun. Silakan coba lagi.");
        }
    });
});

/**
 * Fungsi untuk mengambil Server ID, SSID, dan Captcha dari halaman FastSSH
 */
async function fetchServerDataAndCaptcha() {
    const apiUrl = "https://sparkling-limit-b5ca.corspass.workers.dev/?apiurl=https://www.fastssh.com/page/create-obfs-account/server/3/obfs-asia-sg/";

    try {
        const response = await fetch(apiUrl);
        const text = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");

        const serveridInput = doc.querySelector("input[name='serverid']");
        const ssidInput = doc.querySelector("input[name='ssid']");
        const captchaInput = doc.querySelector("#g-recaptcha-response");

        if (serveridInput && ssidInput && captchaInput) {
            return {
                serverid: serveridInput.value,
                ssid: ssidInput.value,
                captcha: captchaInput.value
            };
        }

        throw new Error("Elemen serverid, ssid, atau captcha tidak ditemukan!");

    } catch (error) {
        console.error("❌ Gagal mengambil data server atau captcha:", error);
        return { serverid: null, ssid: null, captcha: null };
    }
}

// Fungsi untuk mengekstrak akun VLESS dari respons HTML
function processAccountData(responseText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(responseText, "text/html");
    const reportDiv = doc.getElementById("report");

    if (!reportDiv) {
        console.warn("⚠️ Elemen report tidak ditemukan dalam respons.");
        alert("⚠️ Tidak ada data akun dalam respons.");
        return;
    }

    const accountData = {
        status: "success",
        message: "✅ Akun berhasil dibuat!",
        validity: "7 hari",
        accounts: []
    };

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

    console.log("🔹 Data Akun yang Ditemukan:", accountData);

    const responseBox = document.getElementById("responseBox");
    responseBox.value = JSON.stringify(accountData, null, 2);

    alert("✅ Akun berhasil dibuat! Cek hasil di response box.");
}
