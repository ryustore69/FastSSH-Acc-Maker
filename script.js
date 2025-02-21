document.addEventListener("DOMContentLoaded", function () {
    const submitBtn = document.getElementById("submitBtn");

    if (!submitBtn) {
        console.error("Tombol submit tidak ditemukan!");
        return;
    }

    submitBtn.addEventListener("click", async function (event) {
        event.preventDefault(); // Mencegah form terkirim secara default

        // Ambil nilai input dari elemen HTML
        const username = document.getElementById("username")?.value.trim();
        const sni = document.getElementById("sni")?.value.trim();
        const protocol = document.getElementById("protocol")?.value;

        console.log("Data yang dikirim:", { username, sni, protocol });

        // Validasi input agar tidak kosong
        if (!username || !sni || !protocol) {
            alert("⚠️ Semua kolom harus diisi!");
            return;
        }

        try {
            // Dapatkan serverid, ssid, dan captcha dari halaman FastSSH
            const { serverid, ssid, captcha } = await fetchServerData();
            console.log("Server ID:", serverid, "SSID:", ssid, "Captcha:", captcha);

            if (!serverid || !ssid || !captcha) {
                throw new Error("Data serverid, ssid, atau captcha tidak ditemukan!");
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
            fetch(apiUrl, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: requestBody
            })
            .then(response => response.text()) // Karena respons adalah HTML
            .then(responseText => {
                console.log("Respons Mentah:", responseText);
                
                // Proses data akun dari respons HTML
                processAccountData(responseText);
            })
            .catch(error => {
                console.error("❌ Terjadi Kesalahan:", error);
                alert("❌ Gagal membuat akun. Coba lagi nanti!");
            });

        } catch (error) {
            console.error("Gagal mendapatkan serverid, ssid, atau captcha:", error);
            alert("❌ Tidak bisa mengambil serverid, ssid, atau captcha. Coba refresh halaman.");
        }
    });
});

// Fungsi untuk mengambil serverid, ssid, dan captcha otomatis
async function fetchServerData() {
    const apiUrl = "https://sparkling-limit-b5ca.corspass.workers.dev/?apiurl=https://www.fastssh.com/page/create-obfs-account/server/3/obfs-asia-sg/";

    try {
        const response = await fetch(apiUrl);
        const text = await response.text();
        
        // Parsing HTML untuk menemukan serverid, ssid, dan captcha
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");

        // Cari elemen yang berisi serverid dan ssid
        const serveridInput = doc.querySelector("input[name='serverid']");
        const ssidInput = doc.querySelector("input[name='ssid']");
        const captchaInput = doc.querySelector("input[name='captcha']");

        if (serveridInput && ssidInput && captchaInput) {
            return {
                serverid: serveridInput.value,
                ssid: ssidInput.value,
                captcha: captchaInput.value
            };
        }

        throw new Error("Elemen serverid, ssid, atau captcha tidak ditemukan.");
    } catch (error) {
        console.error("Gagal mengambil serverid, ssid, dan captcha:", error);
        return {
            serverid: null,
            ssid: null,
            captcha: null
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

    console.log("Parsed Account Data:", accountData);

    // Tampilkan hasil parsing di responseBox dalam format JSON yang lebih rapi
    const responseBox = document.getElementById("responseBox");
    responseBox.value = JSON.stringify(accountData, null, 2);

    alert("✅ Akun berhasil dibuat! Cek hasil di response box.");
}
