// Database Utama Kelas, Siswa, Presensi, dan Nilai SMK Negeri 1 Tasikmalaya
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
    presensi: {},
    tpContent: {
        tp1: { title: "A. Pendahuluan Ekologi & Lingkungan", content: "Pernahkah kalian memperhatikan halaman sekolah pada pagi hari? Terdapat komponen biotik dan abiotik yang saling berinteraksi...", questions: "1. Jelaskan perbedaan komponen biotik dan abiotik!" },
        tp2: { title: "A. Pengertian Materi & Partikel Penyusun", content: "Materi adalah segala sesuatu yang mempunyai massa dan menempati ruang. Terdiri dari wujud padat, cair, dan gas...", questions: "1. Sebutkan contoh perubahan fisika dan kimia!" },
        tp3: { title: "A. Kebutuhan, Kelangkaan & Skala Prioritas", content: "Kelangkaan terjadi karena kebutuhan manusia tidak terbatas namun sumber daya alam terbatas...", questions: "1. Apa yang dimaksud dengan biaya peluang?" }
    },
    tests: [
        { id: "test_1", name: "Formatif 1: Makhluk Hidup", desc: "Ulangan Harian TP 1" }
    ],
    scores: {}
};

function saveData() {
    localStorage.setItem('ipas_github_db_v2', JSON.stringify(appData));
    if (typeof updateStats === 'function') updateStats();
}

// Sinkronisasi penyimpanan lokal dengan database.js
const localSaved = localStorage.getItem('ipas_github_db_v2');
if (localSaved) {
    try {
        appData = JSON.parse(localSaved);
    } catch (e) {
        console.error("Gagal memuat local storage");
    }
}