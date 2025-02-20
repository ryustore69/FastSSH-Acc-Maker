document.addEventListener("DOMContentLoaded", async function () {
    console.log("🚀 Script Loaded");

    // 🔹 Coba ambil serverid & ssid jika tidak ada
    await fetchServerData();

    document.getElementById("submitBtn").addEventListener("click", async function (event) {
        event.preventDefault(); // Mencegah refresh halaman

        // ✅ Ambil elemen dan pastikan mereka ada sebelum mengambil value
        const serveridInput = document.getElementById("serverid");
        const ssidInput = document.getElementById("ssid");

        const serverid = serveridInput ? serveridInput.value.trim() : "";
        const ssid = ssidInput ? ssidInput.value.trim() : "";
        const username = document.getElementById("username").value.trim();
        const sni_bug = document.getElementById("sni").value.trim();
        const protocol = document.getElementById("protocol").value;
        const captcha = grecaptcha.getResponse();
        const responseBox = document.getElementById("responseBox");

        // ✅ Validasi input, pastikan semua kolom diisi
        if (!serverid || !ssid || !username || !sni_bug || !protocol) {
            alert("❌ Harap isi semua kolom!");
            return;
        }

        if (!captcha) {
            alert("⚠️ Harap selesaikan reCAPTCHA!");
            return;
        }

        // ✅ Kirim data dengan serverid dan ssid
        const requestData = { serverid, username, sni_bug, protocol, ssid, captcha };

        try {
            // ✅ Gunakan proxy untuk menghindari CORS
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent("https://www.fastssh.com/page/create-obfs-process")}`;

            const response = await fetch(proxyUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": navigator.userAgent
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const text = await response.text();
            console.log("✅ Raw Response:", text);

            // ✅ Coba parse JSON jika memungkinkan, jika gagal tampilkan raw response
            let result;
            try {
                result = JSON.parse(text);
                responseBox.value = JSON.stringify(result, null, 2);
                processAccountData(text);
            } catch (e) {
                console.warn("⚠️ Response is not JSON, displaying raw response...");
                responseBox.value = text;
            }

            grecaptcha.reset(); // ✅ Reset reCAPTCHA setelah sukses
        } catch (error) {
            console.error("❌ Error:", error);
            alert("Terjadi kesalahan saat menghubungi server: " + error.message);
            responseBox.value = `Terjadi kesalahan: ${error.message}`;
        }
    });
});

// ✅ Fungsi untuk parsing akun VPN dari respons HTML
function processAccountData(responseText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(responseText, "text/html");
    const reportDiv = doc.getElementById("report");

    if (!reportDiv) {
        console.error("❌ Elemen report tidak ditemukan dalam respons.");
        return;
    }

    const accountData = {
        status: "success",
        message: "✅ Akun berhasil dibuat",
        validity: "7 days",
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

    console.log("✅ Parsed Account Data:", accountData);
    document.getElementById("responseBox").value = JSON.stringify(accountData, null, 2);
}

// ✅ Fungsi untuk mengambil `serverid` dan `ssid` jika belum ada
async function fetchServerData() {
    try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent("https://www.fastssh.com/")}`;

        const response = await fetch(proxyUrl);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");

        const serveridInput = document.getElementById("serverid");
        const ssidInput = document.getElementById("ssid");

        if (serveridInput) {
            serveridInput.value = doc.querySelector("input[name='serverid']")?.value || "";
        }
        if (ssidInput) {
            ssidInput.value = doc.querySelector("input[name='ssid']")?.value || "";
        }

        console.log("✅ Server ID & SSID berhasil diambil.");
    } catch (error) {
        console.error("❌ Gagal mendapatkan serverid atau ssid:", error);
    }
}
