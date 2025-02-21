document.addEventListener("DOMContentLoaded", function () {
    fetchServerData(); // Ambil serverid & ssid saat halaman dimuat
});

const proxyUrl = "https://corsmirror.com/v1?url=";
const targetUrl = "https://www.fastssh.com/page/create-obfs-process";

// ✅ Fungsi mengirim permintaan pembuatan akun
document.getElementById("submitBtn").addEventListener("click", async function (event) {
    event.preventDefault();

    const serverid = document.getElementById("serverid").value;
    const username = document.getElementById("username").value;
    const sni_bug = document.getElementById("sni").value;
    let protocol = document.getElementById("protocol").value.trim().toUpperCase(); // Selalu uppercase
    const ssid = document.getElementById("ssid").value;
    const captcha = grecaptcha.getResponse();

    // ✅ Pastikan semua field diisi
    if (!serverid || !username || !sni_bug || !protocol || !ssid || !captcha) {
        alert("❌ Harap isi semua kolom!");
        return;
    }

    // ✅ Validasi protocol
    const validProtocols = ["VLESS-WS", "VMESS-WS", "TROJAN", "VLESS-TCP"];
    if (!validProtocols.includes(protocol)) {
        alert("❌ ERROR: Protocol tidak valid! Coba salah satu dari: " + validProtocols.join(", "));
        return;
    }

    console.log("🔍 Data yang akan dikirim ke server:");
    console.table({ serverid, username, sni_bug, protocol, ssid, captcha });

    // ✅ Disable tombol untuk mencegah spam klik
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Processing...";

    try {
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                serverid, username, sni_bug, protocol, ssid, captcha
            })
        });

        console.log("✅ Fetch berhasil, menunggu response dari server...");

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const text = await response.text();
        console.log("✅ Response dari server:", text);

        document.getElementById("responseBox").value = text;

        if (text.includes("Please choose a correct protocol")) {
            alert("❌ ERROR: Protocol tidak valid! Cek kembali pilihan protocol.");
        } else if (text.includes("Wrong Captcha")) {
            alert("❌ ERROR: CAPTCHA tidak valid. Harap selesaikan ulang!");
            grecaptcha.reset();
        } else {
            alert("✅ Akun berhasil dibuat!");
        }
    } catch (error) {
        console.error("❌ Error:", error);
        alert("Terjadi kesalahan: " + error.message);
    } finally {
        // ✅ Re-enable tombol submit
        submitBtn.disabled = false;
        submitBtn.textContent = "Buat Akun";
    }
});

// ✅ Fungsi mengirim request ke server dengan proxy
async function sendRequest(requestData) {
    const formData = new URLSearchParams();

    formData.append("serverid", requestData.serverid);
    formData.append("ssid", requestData.ssid);
    formData.append("username", requestData.username);
    formData.append("sni", requestData.sni);
    formData.append("protocol", requestData.protocol); // Ambil dari pengguna
    formData.append("type", requestData.type); // Ambil dari pengguna
    formData.append("security", requestData.security);
    formData.append("encryption", "none"); // Wajib untuk VLESS
    formData.append("path", "/your-path"); // Pastikan path sesuai
    formData.append("captcha", requestData.captcha);

    console.log("📤 Payload yang dikirim:", Object.fromEntries(formData));

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

        fetch(url, options)
        .then(res => res.text())
        .then(text => {
            console.log("Respon dari FastSSH:", text);
            res.send(text);
        })
        .catch(err => console.error("Error saat menghubungi FastSSH:", err));


        const text = await response.text();
        console.log("✅ Raw Response:", text);

        const captcha = grecaptcha.getResponse();
        if (!captcha) {
            console.error("❌ CAPTCHA belum diisi atau tidak valid.");
            alert("❌ Harap selesaikan CAPTCHA sebelum mengirimkan formulir.");
            return;
        }
        console.log("✅ CAPTCHA:", captcha);

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
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

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