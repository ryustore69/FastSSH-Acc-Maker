document.addEventListener("DOMContentLoaded", function () {
    const submitBtn = document.getElementById("submitBtn");

    submitBtn.addEventListener("click", async function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const sni = document.getElementById("sni").value.trim();
        const protocol = document.getElementById("protocol").value;
        const captcha = document.getElementById("captcha").value;

        if (!username || !sni || !protocol || !captcha) {
            alert("⚠️ Semua kolom harus diisi!");
            return;
        }

        try {
            const { serverid, ssid } = await fetchServerData();
            console.log("🔹 Server ID:", serverid, "SSID:", ssid);

            if (!serverid || !ssid) {
                throw new Error("Server ID atau SSID tidak ditemukan!");
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

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: requestBody
            });

            const responseText = await response.text();
            console.log("✅ Respons Server:", responseText);
            document.getElementById("responseBox").value = responseText;

        } catch (error) {
            console.error("❌ Error:", error);
            alert("Gagal membuat akun. Silakan coba lagi.");
        }
    });
});

async function fetchServerData() {
    const apiUrl = "https://sparkling-limit-b5ca.corspass.workers.dev/?apiurl=https://www.fastssh.com/page/create-obfs-account/server/3/obfs-asia-sg/";

    try {
        const response = await fetch(apiUrl);
        const text = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");

        const serveridInput = doc.querySelector("input[name='serverid']");
        const ssidInput = doc.querySelector("input[name='ssid']");

        if (serveridInput && ssidInput) {
            return {
                serverid: serveridInput.value,
                ssid: ssidInput.value
            };
        }

        throw new Error("Elemen serverid atau ssid tidak ditemukan!");

    } catch (error) {
        console.error("Gagal mengambil data server:", error);
        return { serverid: null, ssid: null };
    }
}

// Fungsi untuk parsing akun VLESS dari respons HTML
function processAccountData(responseText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(responseText, "text/html");
    const reportDiv = doc.getElementById("report");

    if (!reportDiv) {
        console.error("❌ Elemen report tidak ditemukan dalam respons.");
        alert("⚠️ Tidak ada data akun dalam respons.");
        return;
    }

    const accountData = {
        status: "success",
        message: "✅ Akun berhasil dibuat!",
        validity: "7 hari",
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

    alert("✅ Akun berhasil dibuat! Cek hasil di response box.");
}
