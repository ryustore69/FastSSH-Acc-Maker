document.addEventListener("DOMContentLoaded", function () {
    fetchServerData(); // Ambil serverid & ssid saat halaman dimuat
});

const proxyUrl = "https://corsmirror.com/v1?url=";
const targetUrl = "https://www.fastssh.com/page/create-obfs-process";

document.getElementById("submitBtn").addEventListener("click", async function (event) {
    event.preventDefault();

    const serverid = document.getElementById("serverid").value.trim();
    const username = document.getElementById("username").value.trim();
    const sni_bug = document.getElementById("sni").value.trim();
    let protocol = document.getElementById("protocol").value.trim().toUpperCase();
    const ssid = document.getElementById("ssid").value.trim();
    const captcha = grecaptcha.getResponse(); // Ambil CAPTCHA

    if (!serverid || !username || !sni_bug || !protocol || !ssid || !captcha) {
        alert("❌ Harap isi semua kolom!");
        return;
    }

    console.log("🔍 Data yang akan dikirim ke server:");
    console.table({ serverid, username, sni_bug, protocol, ssid, "g-recaptcha-response": captcha });

    // Matikan tombol submit sementara
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Processing...";

    try {
        const formData = new URLSearchParams();
        formData.append("serverid", serverid);
        formData.append("username", username);
        formData.append("sni_bug", sni_bug);
        formData.append("protocol", protocol);
        formData.append("ssid", ssid);
        formData.append("g-recaptcha-response", captcha); // Sesuaikan dengan parameter asli

        console.log("📤 Payload yang dikirim:", Object.fromEntries(formData));

        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const text = await response.text();
        console.log("✅ Response dari server:", text);

        document.getElementById("responseBox").value = text;

        if (text.includes("Wrong Captcha")) {
            alert("❌ ERROR: CAPTCHA tidak valid. Harap selesaikan ulang!");
            grecaptcha.reset();
        } else if (text.includes("Please choose a correct protocol")) {
            alert("❌ ERROR: Protocol tidak valid! Cek kembali pilihan protocol.");
        } else {
            alert("✅ Akun berhasil dibuat!");
        }
    } catch (error) {
        console.error("❌ Error:", error);
        alert("Terjadi kesalahan: " + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Buat Akun";
    }
});

// ✅ Fungsi mengambil `serverid` dan `ssid`
async function fetchServerData() {
    try {
        const response = await fetch(proxyUrl + encodeURIComponent("https://www.fastssh.com/page/create-obfs-account/server/3/obfs-asia-sg/"));
        
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