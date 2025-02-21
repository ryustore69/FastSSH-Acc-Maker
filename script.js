document.addEventListener("DOMContentLoaded", function () {
    fetchServerData(); // Ambil serverid & ssid saat halaman dimuat
});

document.getElementById("submitBtn").addEventListener("click", async function (event) {
    event.preventDefault();

    // Ambil nilai dari input dan dropdown
    const serverid = document.getElementById("serverid").value;
    const ssid = document.getElementById("ssid").value;
    const username = document.getElementById("username").value;
    const sni = document.getElementById("sni").value;
    const protocolFull = document.getElementById("protocol").value; // Misal: "vless-ws"
    const [protocol, type] = protocolFull.toLowerCase().split("-"); // ["vless", "ws"]
    const security = type === "h2" || type === "grpc" || type === "tcp-xtls" ? "tls" : "none";
    const captcha = grecaptcha.getResponse();

    // ✅ Validasi input sebelum request
    if (!serverid || !ssid || !username || !sni || !protocol || !type) {
        alert("❌ Harap isi semua kolom!");
        return;
    }
    if (!captcha) {
        alert("⚠️ Harap selesaikan reCAPTCHA!");
        return;
    }

    console.log("🟢 Semua data valid, siap dikirim:", { serverid, ssid, username, sni, protocol, type, security, captcha });

    // ✅ Kirim request
    await sendRequest({ serverid, ssid, username, sni, protocol, type, security, captcha });
});

// ✅ Fungsi mengirim request ke server dengan proxy
async function sendRequest(requestData) {
    const formData = new URLSearchParams();
    formData.append("serverid", requestData.serverid);
    formData.append("ssid", requestData.ssid);
    formData.append("username", requestData.username);
    formData.append("sni", requestData.sni);
    formData.append("protocol", requestData.protocol);
    formData.append("type", requestData.type);
    formData.append("security", requestData.security);
    formData.append("encryption", "none"); // Wajib untuk VLESS
    formData.append("path", "/your-path"); // Contoh: "/vless-ws"
    formData.append("captcha", requestData.captcha);

    try {
        const proxyUrl = "https://corsmirror.com/v1?url=";
        const targetUrl = "https://www.fastssh.com/page/create-obfs-process";

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
    const textareaContent = responseData.match(/<textarea[^>]*>([\s\S]*?)<\/textarea>/i);
    
    if (textareaContent) {
        const config = textareaContent[1].trim();
        const match = config.match(
            /^(vless|trojan|vmess):\/\/([^@]+)@([^:]+):(\d+)\?.*?(?:type=([^&]+).*?&security=([^&]+).*?|#(.+))/
        );

        if (match) {
            const account = {
                protocol: match[1],
                uuid: match[2],
                server: match[3],
                port: match[4],
                type: match[5] || "ws",
                security: match[6] || "tls",
                remark: match[7] || "FastSSH"
            };
            console.log("✅ Account Created:", account);
            document.getElementById("responseBox").value = JSON.stringify(account, null, 2);
            return;
        }
    }

    console.error("❌ Failed to parse account data");
    document.getElementById("responseBox").value = "Akun gagal dibuat: Format respons tidak valid";
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
