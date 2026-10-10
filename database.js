// Database Utama Kelas dan Siswa SMK Negeri 1 Tasikmalaya
// Anda dapat mengedit file ini kapan saja atau menambahkannya lewat aplikasi web.

let appData = {
    classes: [
        "X PPLG 1",
        "X PPLG 2",
        "X TJKT 1"
    ],
    students: [
        { id: 1, name: "Ahmad Fauzi", nis: "24251001", className: "X PPLG 1" },
        { id: 2, name: "Bella Safitri", nis: "24251002", className: "X PPLG 1" },
        { id: 3, name: "Candra Wijaya", nis: "24251003", className: "X PPLG 2" },
        { id: 4, name: "Dewi Lestari", nis: "24251004", className: "X TJKT 1" }
    ],
    presensi: {}
};

function saveData() {
    localStorage.setItem('ipas_github_db_v1', JSON.stringify(appData));
    updateStats();
}

// Sinkronisasi penyimpanan lokal dengan database.js
const localSaved = localStorage.getItem('ipas_github_db_v1');
if (localSaved) {
    try {
        appData = JSON.parse(localSaved);
    } catch (e) {
        console.error("Gagal memuat local storage");
    }
}