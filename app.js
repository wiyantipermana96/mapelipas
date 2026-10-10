// Logika Aplikasi Utama SMK Negeri 1 Tasikmalaya

document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
});
document.getElementById('themeToggle').addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
});

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    const targetEl = document.getElementById('tab-' + tabId);
    if (targetEl) targetEl.classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('bg-slate-800', 'text-white'));
    const active = document.querySelector(`.nav-item[data-target="${tabId}"]`);
    if (active) active.classList.add('bg-slate-800', 'text-white');
    if (window.innerWidth < 1024) document.getElementById('sidebar').classList.add('-translate-x-full');
    
    if (tabId === 'rekap-presensi') renderRekapPresensiTable();
    if (tabId === 'input-nilai') renderScoreInputTable();
    if (tabId === 'rekap-nilai') renderGradeRecapTable();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initApp() {
    renderClassTable();
    populateClassDropdowns();
    renderStudentTable();
    
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('presensiDateInput');
    if (dateInput && !dateInput.value) dateInput.value = today;

    renderPresensiTable();
    renderRekapPresensiTable();
    loadTpInputsToUI();
    updateStats();
}

function updateStats() {
    document.getElementById('statTotalKelas').innerText = appData.classes.length + ' Kelas';
    document.getElementById('statTotalSiswa').innerText = appData.students.length + ' Siswa';
    document.getElementById('statTotalTests').innerText = appData.tests.length + ' Test';
}

function populateClassDropdowns() {
    const selects = ['selectStudentFilter', 'presensiClassSelect', 'modalStudentClass', 'selectRekapClass', 'selectScoreClass', 'selectGradeRecapClass'];
    selects.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = appData.classes.map(c => `<option value="${c}">${c}</option>`).join('');
        }
    });
    populateTestDropdown();
}

function populateTestDropdown() {
    const sel = document.getElementById('selectTestList');
    if (sel) {
        sel.innerHTML = appData.tests.map(t => `<option value="${t.id}">${t.name} (${t.desc})</option>`).join('');
    }
}

// --- MANAJEMEN MATERI MANUAL & SYNC KE MINGGU ---
function loadTpInputsToUI() {
    ['tp1', 'tp2', 'tp3'].forEach(tp => {
        if (appData.tpContent[tp]) {
            document.getElementById(`input${tp.toUpperCase()}Title`).value = appData.tpContent[tp].title || '';
            document.getElementById(`input${tp.toUpperCase()}Content`).value = appData.tpContent[tp].content || '';
            document.getElementById(`input${tp.toUpperCase()}Questions`).value = appData.tpContent[tp].questions || '';

            document.getElementById(`preview${tp.toUpperCase()}Title`).innerText = appData.tpContent[tp].title;
            document.getElementById(`preview${tp.toUpperCase()}Content`).innerHTML = `<p>${appData.tpContent[tp].content.replace(/\n/g, '<br>')}</p>`;
            document.getElementById(`preview${tp.toUpperCase()}Questions`).innerHTML = `<p>${appData.tpContent[tp].questions.replace(/\n/g, '<br>')}</p>`;
        }
    });
    if(document.getElementById('modul1Text')) document.getElementById('modul1Text').innerText = appData.tpContent.tp1.content;
    if(document.getElementById('modul2Text')) document.getElementById('modul2Text').innerText = appData.tpContent.tp1.questions;
    if(document.getElementById('modul5Text')) document.getElementById('modul5Text').innerText = appData.tpContent.tp2.content;
    if(document.getElementById('modul7Text')) document.getElementById('modul7Text').innerText = appData.tpContent.tp3.content;
}

function saveTpData(tp) {
    const title = document.getElementById(`input${tp.toUpperCase()}Title`).value;
    const content = document.getElementById(`input${tp.toUpperCase()}Content`).value;
    const questions = document.getElementById(`input${tp.toUpperCase()}Questions`).value;

    appData.tpContent[tp] = { title, content, questions };
    saveData();
    loadTpInputsToUI();
    alert(`Materi ${tp.toUpperCase()} berhasil disimpan dan otomatis disinkronkan ke modul mingguan!`);
}

// --- MANAJEMEN KELAS ---
function renderClassTable() {
    const tbody = document.getElementById('classTableBody');
    tbody.innerHTML = appData.classes.map((c, idx) => {
        const count = appData.students.filter(s => s.className === c).length;
        return `
            <tr class="hover:bg-slate-50">
                <td class="p-3 border text-center font-medium">${idx + 1}</td>
                <td class="p-3 border font-bold">${c}</td>
                <td class="p-3 border">${count} Siswa</td>
                <td class="p-3 border text-center space-x-2">
                    <button onclick="editClass(${idx})" class="text-blue-600"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button onclick="deleteClass(${idx})" class="text-red-500"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}
function openClassModal(idx = -1) {
    document.getElementById('editClassIndex').value = idx;
    document.getElementById('inputClassName').value = idx >= 0 ? appData.classes[idx] : '';
    document.getElementById('modalClass').classList.remove('hidden');
}
function closeClassModal() { document.getElementById('modalClass').classList.add('hidden'); }
function saveClass() {
    const idx = parseInt(document.getElementById('editClassIndex').value);
    const val = document.getElementById('inputClassName').value.trim();
    if (!val) { alert('Nama kelas tidak boleh kosong!'); return; }
    if (idx >= 0) {
        const oldName = appData.classes[idx];
        appData.classes[idx] = val;
        appData.students.forEach(s => { if (s.className === oldName) s.className = val; });
    } else {
        if (appData.classes.includes(val)) { alert('Kelas sudah ada!'); return; }
        appData.classes.push(val);
    }
    saveData();
    renderClassTable();
    populateClassDropdowns();
    closeClassModal();
}
function editClass(idx) { openClassModal(idx); }
function deleteClass(idx) {
    const cName = appData.classes[idx];
    if (confirm(`Hapus kelas ${cName}?`)) {
        appData.classes.splice(idx, 1);
        appData.students = appData.students.filter(s => s.className !== cName);
        saveData();
        renderClassTable();
        populateClassDropdowns();
        renderStudentTable();
    }
}

// --- MANAJEMEN SISWA ---
function renderStudentTable() {
    const cls = document.getElementById('selectStudentFilter').value;
    const tbody = document.getElementById('studentTableBody');
    const filtered = appData.students.filter(s => s.className === cls);
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-500">Belum ada siswa di kelas ini.</td></tr>`;
        return;
    }
    tbody.innerHTML = filtered.map((s, idx) => `
        <tr class="hover:bg-slate-50">
            <td class="p-3 border text-center">${idx + 1}</td>
            <td class="p-3 border font-mono">${s.nis}</td>
            <td class="p-3 border font-bold">${s.name}</td>
            <td class="p-3 border"><span class="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-[10px]">${s.className}</span></td>
            <td class="p-3 border text-center space-x-2">
                <button onclick="editStudent(${s.id})" class="text-blue-600"><i class="fa-solid fa-pen-to-square"></i></button>
                <button onclick="deleteStudent(${s.id})" class="text-red-500"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}
function openStudentModal(id = -1) {
    document.getElementById('editStudentId').value = id;
    if (id >= 0) {
        const s = appData.students.find(item => item.id === id);
        if (s) {
            document.getElementById('modalStudentClass').value = s.className;
            document.getElementById('modalStudentName').value = s.name;
            document.getElementById('modalStudentNis').value = s.nis;
        }
    } else {
        document.getElementById('modalStudentName').value = '';
        document.getElementById('modalStudentNis').value = '';
    }
    document.getElementById('modalStudent').classList.remove('hidden');
}
function closeStudentModal() { document.getElementById('modalStudent').classList.add('hidden'); }
function saveStudent() {
    const id = parseInt(document.getElementById('editStudentId').value);
    const className = document.getElementById('modalStudentClass').value;
    const name = document.getElementById('modalStudentName').value.trim();
    const nis = document.getElementById('modalStudentNis').value.trim();
    if (!name || !nis) { alert('Nama dan NISN wajib diisi!'); return; }
    if (id >= 0) {
        const s = appData.students.find(item => item.id === id);
        if (s) { s.className = className; s.name = name; s.nis = nis; }
    } else {
        const newId = appData.students.length > 0 ? Math.max(...appData.students.map(item => item.id)) + 1 : 1;
        appData.students.push({ id: newId, name, nis, className });
    }
    saveData();
    renderStudentTable();
    closeStudentModal();
}
function editStudent(id) { openStudentModal(id); }
function deleteStudent(id) {
    if (confirm('Hapus siswa ini?')) {
        appData.students = appData.students.filter(s => s.id !== id);
        saveData();
        renderStudentTable();
    }
}
function downloadCsvTemplate() {
    const csvContent = "NISN;NAMA;KELAS\n24251001;Ahmad Fauzi;X PPLG 1\n24251002;Bella Safitri;X PPLG 1";
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_import_siswa.csv";
    a.click();
}
function handleExcelCsvImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const lines = e.target.result.split(/\r\n|\n/);
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].trim().split(';');
            if (parts.length >= 3) {
                const [nis, name, className] = parts.map(p => p.trim());
                if (nis && name && className) {
                    if (!appData.classes.includes(className)) appData.classes.push(className);
                    const newId = appData.students.length > 0 ? Math.max(...appData.students.map(s => s.id)) + 1 : 1;
                    appData.students.push({ id: newId, name, nis, className });
                }
            }
        }
        saveData();
        populateClassDropdowns();
        renderStudentTable();
        renderClassTable();
        alert('Berhasil mengimpor data siswa!');
        event.target.value = '';
    };
    reader.readAsText(file);
}

// --- PRESENSI & REKAP ---
function renderPresensiTable() {
    const cls = document.getElementById('presensiClassSelect').value;
    const dateVal = document.getElementById('presensiDateInput').value;
    const tbody = document.getElementById('presensiTableBody');
    const filtered = appData.students.filter(s => s.className === cls);
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-500">Tidak ada siswa.</td></tr>`;
        return;
    }
    tbody.innerHTML = filtered.map((s, idx) => {
        const key = `${cls}_${dateVal}_s${s.id}`;
        const rec = appData.presensi[key] || { status: "Hadir", notes: "" };
        return `
            <tr class="hover:bg-slate-50">
                <td class="p-3 border text-center">${idx + 1}</td>
                <td class="p-3 border font-bold">${s.name}</td>
                <td class="p-3 border font-mono">${s.nis}</td>
                <td class="p-3 border text-center">
                    <div class="inline-flex rounded-lg shadow-sm">
                        <button type="button" onclick="setPresStatus('${key}', 'Hadir')" class="px-2 py-1 text-[10px] font-bold rounded-l border ${rec.status === 'Hadir' ? 'bg-emerald-600 text-white' : 'bg-white'}">H</button>
                        <button type="button" onclick="setPresStatus('${key}', 'Izin')" class="px-2 py-1 text-[10px] font-bold border-t border-b ${rec.status === 'Izin' ? 'bg-blue-600 text-white' : 'bg-white'}">I</button>
                        <button type="button" onclick="setPresStatus('${key}', 'Sakit')" class="px-2 py-1 text-[10px] font-bold border-t border-b ${rec.status === 'Sakit' ? 'bg-amber-600 text-white' : 'bg-white'}">S</button>
                        <button type="button" onclick="setPresStatus('${key}', 'Alpa')" class="px-2 py-1 text-[10px] font-bold rounded-r border ${rec.status === 'Alpa' ? 'bg-red-600 text-white' : 'bg-white'}">A</button>
                    </div>
                </td>
                <td class="p-3 border"><input type="text" value="${rec.notes || ''}" onchange="setPresNotes('${key}', this.value)" class="w-full border rounded px-2 py-1 text-xs"></td>
            </tr>
        `;
    }).join('');
}
function setPresStatus(key, status) {
    if (!appData.presensi[key]) appData.presensi[key] = { status: "Hadir", notes: "" };
    appData.presensi[key].status = status;
    saveData();
    renderPresensiTable();
}
function setPresNotes(key, notes) {
    if (!appData.presensi[key]) appData.presensi[key] = { status: "Hadir", notes: "" };
    appData.presensi[key].notes = notes;
    saveData();
}
function savePresensiData() { saveData(); alert('Presensi tersimpan!'); }

function renderRekapPresensiTable() {
    const cls = document.getElementById('selectRekapClass').value;
    const tbody = document.getElementById('rekapPresensiTableBody');
    const filtered = appData.students.filter(s => s.className === cls);
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-slate-500">Tidak ada data siswa.</td></tr>`;
        return;
    }
    tbody.innerHTML = filtered.map((s, idx) => {
        let h = 0, i = 0, sak = 0, a = 0;
        for (let key in appData.presensi) {
            if (key.startsWith(`${cls}_`) && key.endsWith(`_s${s.id}`)) {
                const st = appData.presensi[key].status;
                if (st === 'Hadir') h++; else if (st === 'Izin') i++; else if (st === 'Sakit') sak++; else if (st === 'Alpa') a++;
            }
        }
        const total = h + i + sak + a;
        const percentage = total > 0 ? ((h / total) * 100).toFixed(1) : '100.0';
        return `
            <tr class="hover:bg-slate-50">
                <td class="p-3 border text-center">${idx + 1}</td>
                <td class="p-3 border font-mono">${s.nis}</td>
                <td class="p-3 border font-bold">${s.name}</td>
                <td class="p-3 border text-center text-emerald-600 font-bold">${h}</td>
                <td class="p-3 border text-center text-blue-600 font-bold">${i}</td>
                <td class="p-3 border text-center text-amber-600 font-bold">${sak}</td>
                <td class="p-3 border text-center text-red-600 font-bold">${a}</td>
                <td class="p-3 border text-center font-bold">${percentage}%</td>
            </tr>
        `;
    }).join('');
}

function downloadAttendanceExcel() {
    const cls = document.getElementById('selectRekapClass').value;
    const filtered = appData.students.filter(s => s.className === cls);
    let csv = "NISN;NAMA SISWA;KELAS;HADIR;IZIN;SAKIT;ALPA;PERSENTASE\n";
    filtered.forEach(s => {
        let h = 0, i = 0, sak = 0, a = 0;
        for (let key in appData.presensi) {
            if (key.startsWith(`${cls}_`) && key.endsWith(`_s${s.id}`)) {
                const st = appData.presensi[key].status;
                if (st === 'Hadir') h++; else if (st === 'Izin') i++; else if (st === 'Sakit') sak++; else if (st === 'Alpa') a++;
            }
        }
        const total = h + i + sak + a;
        const percentage = total > 0 ? ((h / total) * 100).toFixed(1) + '%' : '100.0%';
        csv += `${s.nis};${s.name};${s.className};${h};${i};${sak};${a};${percentage}\n`;
    });
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Rekap_Presensi_${cls.replace(/\s+/g, '_')}.csv`;
    a.click();
}

// --- MANAJEMEN NILAI ---
function openTestModal() {
    document.getElementById('inputTestName').value = '';
    document.getElementById('inputTestDesc').value = '';
    document.getElementById('modalTest').classList.remove('hidden');
}
function closeTestModal() { document.getElementById('modalTest').classList.add('hidden'); }
function saveNewTest() {
    const name = document.getElementById('inputTestName').value.trim();
    const desc = document.getElementById('inputTestDesc').value.trim();
    if (!name) { alert('Nama test wajib diisi!'); return; }
    const testId = 'test_' + Date.now();
    appData.tests.push({ id: testId, name, desc });
    saveData();
    populateTestDropdown();
    closeTestModal();
    document.getElementById('selectTestList').value = testId;
    renderScoreInputTable();
    alert('Test / Tugas baru berhasil dibuat!');
}

function renderScoreInputTable() {
    const testId = document.getElementById('selectTestList').value;
    const cls = document.getElementById('selectScoreClass').value;
    const tbody = document.getElementById('scoreInputTableBody');
    const filtered = appData.students.filter(s => s.className === cls);

    const testObj = appData.tests.find(t => t.id === testId);
    if (testObj) {
        document.getElementById('testInfoDescription').innerText = `Keterangan: ${testObj.desc || '-'}`;
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-500">Tidak ada siswa.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map((s, idx) => {
        const key = `${testId}_${cls}_s${s.id}`;
        const scoreData = appData.scores[key] || { score: '', notes: '' };
        return `
            <tr class="hover:bg-slate-50">
                <td class="p-3 border text-center">${idx + 1}</td>
                <td class="p-3 border font-mono">${s.nis}</td>
                <td class="p-3 border font-bold">${s.name}</td>
                <td class="p-3 border text-center">
                    <input type="number" min="0" max="100" value="${scoreData.score}" onchange="setScoreValue('${key}', 'score', this.value)" class="w-24 text-center border rounded px-2 py-1 text-xs font-bold">
                </td>
                <td class="p-3 border">
                    <input type="text" value="${scoreData.notes}" onchange="setScoreValue('${key}', 'notes', this.value)" placeholder="Catatan guru..." class="w-full border rounded px-2 py-1 text-xs">
                </td>
            </tr>
        `;
    }).join('');
}

function setScoreValue(key, field, val) {
    if (!appData.scores[key]) appData.scores[key] = { score: '', notes: '' };
    appData.scores[key][field] = val;
    saveData();
}

function saveAllScores() {
    saveData();
    alert('Nilai kelas berhasil disimpan!');
}

function renderGradeRecapTable() {
    const cls = document.getElementById('selectGradeRecapClass').value;
    const headerRow = document.getElementById('gradeRecapHeaderRow');
    const tbody = document.getElementById('gradeRecapTableBody');
    const filtered = appData.students.filter(s => s.className === cls);

    let headerHTML = `<th class="p-3 border w-16 text-center">No</th><th class="p-3 border">NISN</th><th class="p-3 border">Nama Siswa</th>`;
    appData.tests.forEach(t => {
        headerHTML += `<th class="p-3 border text-center">${t.name}</th>`;
    });
    headerHTML += `<th class="p-3 border text-center font-bold bg-slate-200">Rata-Rata</th>`;
    headerRow.innerHTML = headerHTML;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${3 + appData.tests.length + 1}" class="p-4 text-center text-slate-500">Tidak ada siswa.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map((s, idx) => {
        let rowHTML = `
            <tr class="hover:bg-slate-50">
                <td class="p-3 border text-center">${idx + 1}</td>
                <td class="p-3 border font-mono">${s.nis}</td>
                <td class="p-3 border font-bold">${s.name}</td>
        `;
        let totalScore = 0;
        let countTest = 0;
        appData.tests.forEach(t => {
            const key = `${t.id}_${cls}_s${s.id}`;
            const sc = appData.scores[key] ? appData.scores[key].score : '';
            rowHTML += `<td class="p-3 border text-center font-semibold">${sc !== '' ? sc : '-'}</td>`;
            if (sc !== '' && !isNaN(sc)) {
                totalScore += parseFloat(sc);
                countTest++;
            }
        });
        const avg = countTest > 0 ? (totalScore / countTest).toFixed(1) : '-';
        rowHTML += `<td class="p-3 border text-center font-bold text-primary-600 bg-slate-50">${avg}</td></tr>`;
        return rowHTML;
    }).join('');
}

function downloadGradeExcel() {
    const cls = document.getElementById('selectGradeRecapClass').value;
    const filtered = appData.students.filter(s => s.className === cls);
    
    let csv = "NISN;NAMA SISWA;KELAS";
    appData.tests.forEach(t => { csv += `;${t.name}`; });
    csv += ";RATA-RATA\n";

    filtered.forEach(s => {
        let line = `${s.nis};${s.name};${s.className}`;
        let totalScore = 0, countTest = 0;
        appData.tests.forEach(t => {
            const key = `${t.id}_${cls}_s${s.id}`;
            const sc = appData.scores[key] && appData.scores[key].score !== '' ? appData.scores[key].score : '';
            line += `;${sc}`;
            if (sc !== '' && !isNaN(sc)) { totalScore += parseFloat(sc); countTest++; }
        });
        const avg = countTest > 0 ? (totalScore / countTest).toFixed(1) : '';
        line += `;${avg}\n`;
        csv += line;
    });

    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Rekap_Nilai_${cls.replace(/\s+/g, '_')}.csv`;
    a.click();
}

function downloadWordDoc(weekNum, weekTitle) {
    const content = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Modul</title></head><body><h2>Modul IPAS - ${weekTitle}</h2><p>SMKN 1 Tasikmalaya | Guru: Wiyanti Dewi Permana, SST., M.Pd</p></body></html>`;
    const blob = new Blob(['\ufeff' + content], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Modul_${weekNum}.doc`;
    a.click();
}

window.onload = () => { initApp(); };