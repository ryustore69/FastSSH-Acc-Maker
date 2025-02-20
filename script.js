document.addEventListener("DOMContentLoaded", async function () {
    console.log("🚀 Script Loaded");

    // 🔹 Ambil serverid & ssid saat halaman dimuat
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
        const sni = sniInput.value.trim();
        let protocol = protocolInput.value;
        const captcha = grecaptcha.getResponse();

        // ✅ Konversi nama `protocol` ke format yang diterima FastSSH
        const protocolMapping = {
            "vless-ws": "VLESS-WS",
            "vless-tcp": "VLESS-TCP",
            "vless-h2": "VLESS-H2",
            "vless-grpc": "VLESS-GRPC",
            "vless-tcp-xtls": "VLESS-TCP-XTLS",
            "vmess-ws": "VMESS-WS",
            "vmess-tcp": "VMESS-TCP",
            "vmess-h2": "VMESS-H2",
            "vmess-grpc": "VMESS-GRPC",
            "trojan-ws": "TROJAN-WS",
            "trojan-tcp": "TROJAN-TCP",
            "trojan-grpc": "TROJAN-GRPC",
            "trojan-h2": "TROJAN-H2"
        };

        if (protocolMapping[protocol]) {
            protocol = protocolMapping[protocol]; // Konversi ke format FastSSH
        } else {
            alert("❌ ERROR: Format protocol tidak valid! Cek kembali pilihan protocol.");
            return;
        }

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

        // ✅ Kirim request menggunakan proxy CORS
        await sendRequest({ serverid, ssid, username, sni, protocol, captcha });
    });
});

// ✅ Fungsi mengirim request ke server dengan proxy
async function sendRequest(requestData) {
    try {
        const proxyUrl = "https://corsmirror.com/v1?url=";
        const targetUrl = "https://www.fastssh.com/page/create-obfs-process";
        
        const formData = new FormData();
        formData.append("serverid", requestData.serverid);
        formData.append("ssid", requestData.ssid);
        formData.append("username", requestData.username);
        formData.append("sni", requestData.sni);
        formData.append("protocol", requestData.protocol);
        formData.append("captcha", requestData.captcha);

        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const text = await response.text();
        console.log("✅ Raw Response dari Server FastSSH:", text);

        // Cek jika server meminta protocol yang benar
        if (text.includes("Please choose a correct protocol")) {
            alert("❌ ERROR: Format protocol tidak valid! Cek kembali pilihan protocol.");
            return;
        }

        // ✅ Parsing data akun dari HTML response
        processAccountData(text);

        grecaptcha.reset();
    } catch (error) {
        console.error("❌ Error:", error);
        alert("Terjadi kesalahan saat menghubungi server: " + error.message);
        document.getElementById("responseBox").value = `Terjadi kesalahan: ${error.message}`;
    }
}

// ✅ Fungsi parsing akun VPN dari respons HTML
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

// ✅ Fungsi mengambil `serverid` dan `ssid`
async function fetchServerData() {
    try {
        const targetUrl = "https://www.fastssh.com/page/create-obfs-account/server/3/obfs-asia-sg/";
        const proxyUrl = "https://corsmirror.com/v1?url=";

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

        // ✅ Masukkan ke input di halaman
        serveridElem.value = fetchedServerid;
        ssidElem.value = fetchedSsid;

        console.log("✅ Server ID & SSID berhasil dimasukkan ke input.");
    } catch (error) {
        console.error("❌ Gagal mendapatkan serverid atau ssid:", error);
    }
}
