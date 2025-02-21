document.addEventListener("DOMContentLoaded", function () {
    // Pastikan tombol ada sebelum menambahkan event listener
    const submitBtn = document.getElementById("submitBtn");
    if (!submitBtn) {
        console.error("Tombol submit tidak ditemukan!");
        return;
    }

    submitBtn.addEventListener("click", function () {
        // Ambil nilai input dari elemen HTML
        const username = document.getElementById("username")?.value.trim();
        const sni = document.getElementById("sni")?.value.trim();
        const protocol = document.getElementById("protocol")?.value.trim();
        const recaptcha = document.getElementById("recaptcha")?.value.trim();

        // Validasi input agar tidak kosong
        if (!username || !sni || !protocol || !recaptcha) {
            alert("Semua kolom harus diisi!");
            return;
        }

        // Buat body request secara dinamis berdasarkan input
        const requestBody = {
            username: username,
            sni: sni,
            protocol: protocol,
            recaptcha: recaptcha
        };

        // URL tujuan
        const apiUrl = "https://bypass-cors.vercel.app/?url=" + encodeURIComponent("https://www.fastssh.com/page/create-obfs-process");

        // Kirim permintaan POST
        fetch(apiUrl, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Success:", data);
            alert("Berhasil membuat akun!");
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Terjadi kesalahan saat mengirim data!");
        });
    });
});


// Fungsi untuk parsing akun VLESS dari respons HTML
function processAccountData(responseText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(responseText, "text/html");
    const reportDiv = doc.getElementById("report");

    if (!reportDiv) {
        console.error("Elemen report tidak ditemukan dalam respons.");
        return;
    }

    const accountData = {
        status: "success",
        message: "Account has been successfully created",
        validity: "7 days",
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
}
