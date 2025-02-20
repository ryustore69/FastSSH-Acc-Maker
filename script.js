document.addEventListener("DOMContentLoaded", async function () {
    console.log("🚀 Script Loaded");

    // 🔹 Ambil serverid & ssid saat halaman dimuat
    await fetchServerData();

    document.getElementById("submitBtn").addEventListener("click", async function (event) {
        event.preventDefault(); // Mencegah refresh halaman

        // ✅ Ambil elemen input
        const serverid = document.getElementById("serverid")?.value.trim();
        const ssid = document.getElementById("ssid")?.value.trim();
        const username = document.getElementById("username")?.value.trim();
        const sni = document.getElementById("sni")?.value.trim();
        const protocol = document.getElementById("protocol")?.value;
        const responseBox = document.getElementById("responseBox");
        const captcha = grecaptcha.getResponse();

        // ✅ Validasi input sebelum request
        if (!serverid || !ssid || !username || !sni || !protocol) {
            alert("❌ Harap isi semua kolom!");
            return;
        }
        if (!captcha) {
            alert("⚠️ Harap selesaikan reCAPTCHA!");
            return;
        }

        console.log("🟢 Semua data valid, siap dikirim:", { serverid, ssid, username, sni, protocol, captcha });

        // ✅ Kirim request
        await sendRequest({ serverid, ssid, username, sni, protocol, captcha });
    });
});

// ✅ Fungsi mengirim request ke server dengan proxy
async function sendRequest(requestData) {
    try {
        const proxyUrl = "https://corsmirror.com/v1?url=";
        const targetUrl = "https://www.fastssh.com/page/create-obfs-process";
        
        const formData = new URLSearchParams();
        Object.entries(requestData).forEach(([key, value]) => formData.append(key, value));
        
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const text = await response.text();
        console.log("✅ Raw Response:", text);

        // Periksa apakah respons meminta CAPTCHA ulang
        if (text.includes("Wrong Captcha")) {
            alert("❌ ERROR: CAPTCHA tidak valid. Harap selesaikan ulang!");
            grecaptcha.reset();
            return;
        }

        try {
            const result = JSON.parse(text);
            processAccountData(result);
        } catch (e) {
            console.warn("⚠️ Response bukan JSON, menampilkan raw response...");
            document.getElementById("responseBox").value = text;
        }

        grecaptcha.reset();
    } catch (error) {
        console.error("❌ Error:", error);
        alert("Terjadi kesalahan: " + error.message);
    }
}

// ✅ Fungsi parsing akun VPN dari respons HTML
function processAccountData(responseData) {
    const accountData = { status: "success", message: "✅ Akun berhasil dibuat", validity: "7 days", accounts: [] };

    if (responseData?.report) {
        const matches = responseData.report.match(/<textarea[^>]*>(.*?)<\/textarea>/g);

        if (matches) {
            matches.forEach(textarea => {
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

// ✅ Fungsi mengambil `serverid` dan `ssid`
async function fetchServerData() {
    try {
        const targetUrl = "https://www.fastssh.com/page/create-obfs-account/server/3/obfs-asia-sg/";
        const proxyUrl = "https://corsmirror.com/v1?url=";
        
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");

        const fetchedServerid = doc.querySelector("input[name='serverid']")?.value || "";
        const fetchedSsid = doc.querySelector("input[name='ssid']")?.value || "";

        if (!fetchedServerid || !fetchedSsid) {
            console.warn("⚠️ Server ID atau SSID tidak ditemukan dalam halaman sumber.");
            return;
        }

        document.getElementById("serverid").value = fetchedServerid;
        document.getElementById("ssid").value = fetchedSsid;

        console.log("✅ Server ID & SSID berhasil dimasukkan ke input.");
    } catch (error) {
        console.error("❌ Gagal mendapatkan serverid atau ssid:", error);
    }
}
