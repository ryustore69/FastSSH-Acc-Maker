document.addEventListener("DOMContentLoaded", async function () {
    console.log("🚀 Script Loaded");

    // 🔹 Ambil serverid & ssid jika tidak ada
    await fetchServerData();

    document.getElementById("submitBtn").addEventListener("click", async function (event) {
        event.preventDefault(); // Mencegah refresh halaman

        // ✅ Ambil elemen input
        const serveridInput = document.getElementById("serverid");
        const ssidInput = document.getElementById("ssid");
        const usernameInput = document.getElementById("username");
        const sniInput = document.getElementById("sni");
        const protocolInput = document.getElementById("protocol");
        const responseBox = document.getElementById("responseBox");

        // ✅ Validasi elemen
        if (!serveridInput || !ssidInput || !usernameInput || !sniInput || !protocolInput) {
            alert("❌ Input tidak lengkap! Pastikan semua elemen ditemukan.");
            return;
        }

        // ✅ Ambil nilai dari input
        const serverid = serveridInput.value.trim();
        const ssid = ssidInput.value.trim();
        const username = usernameInput.value.trim();
        const sni_bug = sniInput.value.trim();
        const protocol = protocolInput.value;
        const captcha = grecaptcha.getResponse();

        // ✅ Validasi input sebelum request
        if (!serverid || !ssid || !username || !sni_bug || !protocol) {
            alert("❌ Harap isi semua kolom!");
            return;
        }

        if (!captcha) {
            alert("⚠️ Harap selesaikan reCAPTCHA!");
            return;
        }

        console.log("🟢 Semua data valid, siap dikirim:", { serverid, ssid, username, sni_bug, protocol, captcha });

        // ✅ Kirim request menggunakan proxy untuk menghindari CORS
        await sendRequest({ serverid, ssid, username, sni_bug, protocol, captcha });
    });
});

// ✅ Fungsi mengirim request ke server dengan alternatif CORS
/* async function sendRequest(requestData) {
    try {
        const proxyUrl = "https://api.allorigins.win/raw?url=";
        const targetUrl = "https://www.fastssh.com/page/create-obfs-process";
        
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
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

        try {
            const result = JSON.parse(text);
            document.getElementById("responseBox").value = JSON.stringify(result, null, 2);
            processAccountData(result);
        } catch (e) {
            console.warn("⚠️ Response bukan JSON, menampilkan raw response...");
            document.getElementById("responseBox").value = text;
        }

        grecaptcha.reset();
    } catch (error) {
        console.error("❌ Error:", error);
        alert("Terjadi kesalahan saat menghubungi server: " + error.message);
        document.getElementById("responseBox").value = `Terjadi kesalahan: ${error.message}`;
    }
} */

    async function sendRequest(requestData) {
        try {
            const proxyUrl = "https://sparkling-limit-b5ca.corspass.workers.dev/url=";
            const targetUrl = "https://www.fastssh.com/page/create-obfs-process";
            
            const formData = new FormData();
            formData.append("serverid", requestData.serverid);
            formData.append("ssid", requestData.ssid);
            formData.append("username", requestData.username);
            formData.append("sni_bug", requestData.sni_bug);
            formData.append("protocol", requestData.protocol);
            formData.append("captcha", requestData.captcha);
    
            const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
                method: "POST",
                body: formData
            });
    
            const text = await response.text();
            console.log("✅ Raw Response:", text);
    
            try {
                const result = JSON.parse(text);
                document.getElementById("responseBox").value = JSON.stringify(result, null, 2);
                processAccountData(result);
            } catch (e) {
                console.warn("⚠️ Response bukan JSON, menampilkan raw response...");
                document.getElementById("responseBox").value = text;
            }
    
            grecaptcha.reset();
        } catch (error) {
            console.error("❌ Error:", error);
            alert("Terjadi kesalahan: " + error.message);
            document.getElementById("responseBox").value = `Terjadi kesalahan: ${error.message}`;
        }
    }    
    
// ✅ Fungsi parsing akun VPN dari respons HTML
function processAccountData(responseData) {
    const accountData = {
        status: "success",
        message: "✅ Akun berhasil dibuat",
        validity: "7 days",
        accounts: []
    };

    if (responseData && responseData.report) {
        const textareas = responseData.report.match(/<textarea[^>]*>(.*?)<\/textarea>/g);

        if (textareas) {
            textareas.forEach(textarea => {
                const value = textarea.replace(/<textarea[^>]*>|<\/textarea>/g, "").trim();
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
            });
        }
    }

    console.log("✅ Parsed Account Data:", accountData);
    document.getElementById("responseBox").value = JSON.stringify(accountData, null, 2);
}

// ✅ Fungsi mengambil `serverid` dan `ssid` dengan alternatif API
async function fetchServerData() {
    try {
        const targetUrl = "https://www.fastssh.com/page/create-obfs-account/server/3/obfs-asia-sg/";
        const proxyUrl = "https://api.allorigins.win/raw?url=";
        
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");

        // ✅ Pastikan elemen ditemukan
        const serveridElem = document.getElementById("serverid");
        const ssidElem = document.getElementById("ssid");

        if (!serveridElem || !ssidElem) {
            console.error("❌ Elemen serverid atau ssid tidak ditemukan di halaman!");
            return;
        }

        // ✅ Ambil nilai dari halaman yang di-fetch
        const fetchedServerid = doc.querySelector("input[name='serverid']")?.value || "";
        const fetchedSsid = doc.querySelector("input[name='ssid']")?.value || "";

        // ✅ Debugging nilai yang diambil
        console.log("🔍 Server ID dari halaman:", fetchedServerid);
        console.log("🔍 SSID dari halaman:", fetchedSsid);

        if (!fetchedServerid || !fetchedSsid) {
            console.warn("⚠️ Server ID atau SSID tidak ditemukan dalam halaman sumber.");
            return;
        }

        // ✅ Masukkan ke input di halaman
        serveridElem.value = fetchedServerid;
        ssidElem.value = fetchedSsid;

        console.log("✅ Server ID & SSID berhasil dimasukkan ke input.");
    } catch (error) {
        console.error("❌ Gagal mendapatkan serverid atau ssid:", error);
    }
}
