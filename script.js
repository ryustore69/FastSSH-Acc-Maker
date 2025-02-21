document.addEventListener("DOMContentLoaded", async function () {
    const submitBtn = document.getElementById("submitBtn");

    // Ambil serverid, ssid, dan captcha saat halaman dimuat
    await loadServerData();

    submitBtn.addEventListener("click", async function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const sni = document.getElementById("sni").value.trim();
        const protocol = document.getElementById("protocol").value;
        const captcha = document.getElementById("captcha").value.trim();
        const serverid = document.getElementById("serverid").value;
        const ssid = document.getElementById("ssid").value;

        if (!username || !sni || !protocol || !captcha || !serverid || !ssid) {
            alert("⚠️ Semua kolom harus diisi!");
            return;
        }

        try {
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

document.addEventListener("DOMContentLoaded", function () {
    const captchaImage = document.getElementById("captchaImage");
    const refreshBtn = document.getElementById("refreshCaptcha");
    const captchaInput = document.getElementById("captchaInput");

    async function fetchCaptcha() {
        try {
            let response = await fetch("https://www.fastssh.com/page/create-obfs-account/server/3/obfs-asia-sg/");
            let text = await response.text();

            // Cari URL gambar CAPTCHA dari HTML response
            let parser = new DOMParser();
            let doc = parser.parseFromString(text, "text/html");
            let captchaSrc = doc.querySelector("img[src*='captcha.php']").src;

            if (captchaSrc) {
                captchaImage.src = captchaSrc; // Atur gambar CAPTCHA di halaman
            } else {
                console.error("Gagal mengambil URL CAPTCHA.");
            }
        } catch (error) {
            console.error("Error mengambil CAPTCHA:", error);
        }
    }

    // Muat CAPTCHA saat halaman dimuat
    fetchCaptcha();

    // Tombol untuk refresh CAPTCHA
    refreshBtn.addEventListener("click", function () {
        fetchCaptcha();
    });
});


async function loadServerData() {
    const apiUrl = "https://sparkling-limit-b5ca.corspass.workers.dev/?apiurl=https://www.fastssh.com/page/create-obfs-account/server/3/obfs-asia-sg/";

    try {
        const response = await fetch(apiUrl);
        const text = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");

        const serveridInput = doc.querySelector("input[name='serverid']");
        const ssidInput = doc.querySelector("input[name='ssid']");
        const captchaImg = doc.querySelector("img[alt='Captcha']");

        if (serveridInput && ssidInput) {
            document.getElementById("serverid").value = serveridInput.value;
            document.getElementById("ssid").value = ssidInput.value;
        } else {
            throw new Error("Elemen serverid atau ssid tidak ditemukan!");
        }

        if (captchaImg) {
            document.getElementById("captchaImg").src = captchaImg.src;
        } else {
            throw new Error("Captcha tidak ditemukan!");
        }

        console.log("🔹 Data Server ID:", serveridInput.value, "SSID:", ssidInput.value);

    } catch (error) {
        console.error("Gagal mengambil data server:", error);
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
