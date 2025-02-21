document.addEventListener("DOMContentLoaded", function () {
    const submitBtn = document.getElementById("submitBtn");

    if (!submitBtn) {
        console.error("❌ Tombol submit tidak ditemukan!");
        return;
    }

    submitBtn.addEventListener("click", async function (event) {
        event.preventDefault(); // Mencegah form terkirim secara default

        // Ambil nilai input dari elemen HTML
        const username = document.getElementById("username")?.value.trim();
        const sni = document.getElementById("sni")?.value.trim();
        const protocol = document.getElementById("protocol")?.value;
        const captcha = document.getElementById("captcha")?.value; // Ambil dari input hidden

        console.log("📤 Data yang dikirim:", { username, sni, protocol, captcha });

        // Validasi input agar tidak kosong
        if (!username || !sni || !protocol || !captcha) {
            alert("⚠️ Semua kolom harus diisi!");
            return;
        }

        try {
            // Dapatkan serverid dan ssid secara otomatis
            const { serverid, ssid } = await fetchServerData();
            console.log("✅ Server ID:", serverid, "SSID:", ssid);

            // Pastikan protokol valid sebelum mengirim request
            const validProtocols = ["VLESS-WS", "VLESS-TCP", "VLESS-H2", "VLESS-GRPC", "VMESS-WS", "VMESS-TCP", "VMESS-H2", "VMESS-GRPC", "TROJAN-WS", "TROJAN-TCP", "TROJAN-GRPC", "TROJAN-H2"];
            if (!validProtocols.includes(protocol)) {
                console.error("❌ Protokol tidak valid:", protocol);
                alert("⚠️ Protokol yang dipilih tidak valid!");
                return;
            }

            // Buat body request secara dinamis berdasarkan input
            const requestBody = new URLSearchParams({
                "serverid": serverid,
                "username": username,
                "sni_bug": sni,
                "protocol": protocol,
                "ssid": ssid,
                "captcha": captcha
            });

            // URL tujuan dengan proxy CORS
            const apiUrl = "https://sparkling-limit-b5ca.corspass.workers.dev/?apiurl=https://www.fastssh.com/page/create-obfs-process";

            // Kirim permintaan POST
            const response = await fetch(apiUrl, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: requestBody
            });

            const responseText = await response.text();
            console.log("📥 Respons Mentah:", responseText);

            // Proses data akun dari respons HTML
            processAccountData(responseText);
        } catch (error) {
            console.error("❌ Terjadi Kesalahan:", error);
            alert("❌ Gagal membuat akun. Coba lagi nanti!");
        }
    });
});

// Fungsi untuk menangani reCAPTCHA
function onCaptchaSuccess(token) {
    console.log("✅ Captcha sukses:", token);
    document.getElementById("captcha").value = token; // Simpan token ke input hidden
}

// Fungsi untuk mengambil serverid dan ssid otomatis
async function fetchServerData() {
    const apiUrl = "https://sparkling-limit-b5ca.corspass.workers.dev/?apiurl=https://www.fastssh.com/page/create-obfs-process";

    try {
        const response = await fetch(apiUrl);
        const text = await response.text();

        // Parsing HTML untuk menemukan serverid dan ssid
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");

        // Coba cari elemen input hidden
        const serveridInput = doc.querySelector("input[name='serverid']");
        const ssidInput = doc.querySelector("input[name='ssid']");

        if (serveridInput && ssidInput) {
            return {
                serverid: serveridInput.value || "3", // Gunakan default jika kosong
                ssid: ssidInput.value || "320620"
            };
        }

        throw new Error("Elemen serverid atau ssid tidak ditemukan.");
    } catch (error) {
        console.error("Gagal mengambil serverid dan ssid:", error);
        return {
            serverid: "3", // Gunakan nilai default
            ssid: "320620"
        };
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

    console.log("✅ Parsed Account Data:", accountData);

    // Tampilkan hasil parsing di responseBox dalam format JSON yang lebih rapi
    const responseBox = document.getElementById("responseBox");
    if (responseBox) {
        responseBox.value = JSON.stringify(accountData, null, 2);
    }

    alert("✅ Akun berhasil dibuat! Cek hasil di response box.");
}
