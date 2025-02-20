document.addEventListener("DOMContentLoaded", async function () {
    console.log("🚀 Script Loaded");

    // 🔹 Ambil serverid & ssid jika belum ada
    await fetchServerData();

    document.getElementById("submitBtn").addEventListener("click", async function (event) {
        event.preventDefault(); // Mencegah refresh halaman

        // ✅ Ambil elemen input
        const serverid = document.getElementById("serverid").value.trim();
        const ssid = document.getElementById("ssid").value.trim();
        const username = document.getElementById("username").value.trim();
        const sni_bug = document.getElementById("sni").value.trim();
        let protocol = document.getElementById("protocol").value;
        const captcha = grecaptcha.getResponse();
        const responseBox = document.getElementById("responseBox");

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
            alert("❌ Format protocol tidak valid! Cek kembali pilihan protocol.");
            return;
        }

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

        // ✅ Kirim request menggunakan proxy CORS
        await sendRequest({ serverid, ssid, username, sni_bug, protocol, captcha });
    });
});

// ✅ Fungsi mengirim request ke server dengan metode FormData
async function sendRequest(requestData) {
    try {
        const proxyUrl = "https://corsmirror.com/v1?url=";
        const targetUrl = "https://www.fastssh.com/page/create-obfs-process";

        const formData = new FormData();
        formData.append("serverid", requestData.serverid);
        formData.append("ssid", requestData.ssid);
        formData.append("username", requestData.username);
        formData.append("sni", requestData.sni_bug); // Gunakan key "sni" bukan "sni_bug"
        formData.append("protocol", requestData.protocol); // Kirim protocol yang telah diperbaiki
        formData.append("captcha", requestData.captcha);

        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
            method: "POST",
            body: formData
        });

        const text = await response.text();
        console.log("✅ Raw Response dari Server:", text);

        // ✅ Parsing data akun dari HTML response
        processAccountData(text);

        grecaptcha.reset(); // ✅ Reset reCAPTCHA setelah sukses
    } catch (error) {
        console.error("❌ Error:", error);
        alert("Terjadi kesalahan: " + error.message);
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
