// === KONSTANTA & KONFIGURASI AWAL SMP ===
const MAPEL_KOLOM_A = [
    'Pendidikan Agama dan Budi Pekerti',
    'Pendidikan Pancasila dan Kewarganegaraan',
    'Bahasa Indonesia',
    'Matematika',
    'Ilmu Pengetahuan Alam',
    'Ilmu Pengetahuan Sosial',
    'Bahasa Inggris'
];

const MAPEL_KOLOM_B = [
    'Mulok',
    'Pendidikan Jasmani, Olahraga, dan Kesehatan',
    'Prakarya',
    'TIK'
];

const ALL_MAPEL_HEADER = [...MAPEL_KOLOM_A, ...MAPEL_KOLOM_B];
const KELAS_LIST = ['VII', 'VIII', 'IX'];

// Structure Data Default untuk Sekolah SMP Pertama
const DEFAULT_SCHOOL_DATA = {
    auth: { pass: 'raporsmp', changed: true },
    sekolah: {
        pemerintahYayasan: 'PEMERINTAH KABUPATEN TIMOR TENGAH SELATAN',
        namaSekolah: 'SMP NEGERI 1 SOE',
        npsn: '50102030',
        alamat: 'Jl. Ahmad Yani No. 12',
        kodePosTelp: '85511 / (0388) 21001',
        desaKelurahan: 'Soe',
        kecamatan: 'Kota Soe',
        kabupaten: 'Timor Tengah Selatan',
        provinsi: 'Nusa Tenggara Timur',
        website: 'www.smpn1soe.sch.id',
        email: 'info@smpn1soe.sch.id',
        logoUrl: 'assets/img/logo-tutwuri.png',
        tahunAjaran: '2026/2027',
        semester: '2 (Genap)',
        kepsekNama: 'Drs. Yosafat T., M.Pd',
        kepsekNip: '19680512 199303 1 005',
        tempatTanggalCetak: 'Soe, 19 Juni 2027'
    },
    wali: [
        { kelas: 'VII', nama: 'Maria B, S.Pd', nip: '19820101 200501 2 001', username: '50102030-VII', pass: 'wali7' },
        { kelas: 'VIII', nama: 'Stefanus N, S.Pd', nip: '19850202 200801 1 002', username: '50102030-VIII', pass: 'wali8' },
        { kelas: 'IX', nama: 'Wendelinus Christo Snae, SE', nip: '19900606 202001 1 006', username: '50102030-IX', pass: 'wali9' }
    ],
    siswa: [
        {
            noUrut: 1, kelas: 'IX', nis: '2024001', nisn: '0123456789', nama: 'Aditya Pratama',
            ttl: 'Soe, 12 Januari 2012', jk: 'Laki-Laki', agama: 'Katolik', statusKeluarga: 'Anak Kandung',
            anakKe: 1, alamat: 'Jl. Cendana No. 4', telp: '081234567890', sekolahAsal: 'SD Negeri 1 Soe',
            diterimaKelas: 'VII', diterimaTanggal: '15 Juli 2024', ayah: 'Markus Pratama', ibu: 'Esteria S',
            alamatOrangTua: 'Jl. Cendana No. 4', pekerjaanAyah: 'PNS', pekerjaanIbu: 'Ibu Rumah Tangga',
            namaWali: '-', alamatWali: '-', telpWali: '-', pekerjaanWali: '-'
        },
        {
            noUrut: 2, kelas: 'IX', nis: '2024002', nisn: '0123456790', nama: 'Beatrix Neno',
            ttl: 'Soe, 25 Maret 2012', jk: 'Perempuan', agama: 'Kristen Protestan', statusKeluarga: 'Anak Kandung',
            anakKe: 2, alamat: 'Jl. Mawar No. 10', telp: '081234567891', sekolahAsal: 'SD Negeri 2 Soe',
            diterimaKelas: 'VII', diterimaTanggal: '15 Juli 2024', ayah: 'Yohanes Neno', ibu: 'Marta R',
            alamatOrangTua: 'Jl. Mawar No. 10', pekerjaanAyah: 'Wiraswasta', pekerjaanIbu: 'Guru',
            namaWali: '-', alamatWali: '-', telpWali: '-', pekerjaanWali: '-'
        }
    ],
    nilai: []
};

// Database Multi-Sekolah
const DEFAULT_MULTI_DB = {
    schools: {
        "50102030": DEFAULT_SCHOOL_DATA
    }
};

let multiDb = JSON.parse(localStorage.getItem('RAPOR_SMP_MULTI_DB')) || DEFAULT_MULTI_DB;
let currentNpsn = sessionStorage.getItem('RAPOR_CURRENT_NPSN') || null;

// Sesi Multi-Role User
let currentUserRole = sessionStorage.getItem('RAPOR_USER_ROLE') || 'admin';
let currentWaliKelas = sessionStorage.getItem('RAPOR_WALI_KELAS') || null;

// Pointer 'db' mengarah pada sekolah yang sedang login
let db = (currentNpsn && multiDb.schools[currentNpsn]) ? multiDb.schools[currentNpsn] : null;

// Pastikan db.siswa dan db.nilai terdefinisi jika db ada
if (db) {
    if (!db.siswa) db.siswa = [];
    if (!db.nilai) db.nilai = [];
}

// === FIREBASE REALTIME SINKRONISASI ===
if (typeof realDB !== 'undefined') {
    realDB.ref('multiDb').on('value', (snapshot) => {
        const val = snapshot.val();
        if (val) {
            multiDb = val;
            localStorage.setItem('RAPOR_SMP_MULTI_DB', JSON.stringify(multiDb));
            if (currentNpsn && multiDb.schools[currentNpsn]) {
                db = multiDb.schools[currentNpsn];
                if (!db.siswa) db.siswa = [];
                if (!db.nilai) db.nilai = [];
            }
            if (sessionStorage.getItem('RAPOR_LOGGED_IN') === 'true') {
                checkAuth();
                if (db) renderView();
            }
        } else {
            saveDB();
        }
    });
}

function saveDB() {
    if (currentNpsn && db) {
        multiDb.schools[currentNpsn] = db;
    }
    localStorage.setItem('RAPOR_SMP_MULTI_DB', JSON.stringify(multiDb));

    if (typeof realDB !== 'undefined') {
        realDB.ref('multiDb').set(multiDb).catch(err => {
            console.error("Gagal menyimpan ke Firebase:", err);
        });
    }
}

let currentTab = 'dashboard';
let currentSiswaIndex = 0;
let selectedKelasFilter = 'SEMUA';

// === INISIALISASI APLIKASI ===
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    checkAuth();
    if (db) renderView();
});

function checkAuth() {
    const loggedIn = sessionStorage.getItem('RAPOR_LOGGED_IN');
    if (loggedIn === 'true' && currentNpsn && multiDb.schools[currentNpsn]) {
        db = multiDb.schools[currentNpsn];
        if (!db.siswa) db.siswa = [];
        if (!db.nilai) db.nilai = [];
        
        currentUserRole = sessionStorage.getItem('RAPOR_USER_ROLE') || 'admin';
        currentWaliKelas = sessionStorage.getItem('RAPOR_WALI_KELAS') || null;

        if (db.wali && db.wali.length > 0 && !db.wali[0].username) {
            db.wali.forEach(w => {
                w.username = `${db.sekolah.npsn}-${w.kelas}`;
                w.pass = `wali${w.kelas.toLowerCase()}`;
            });
            saveDB();
        }

        if (currentUserRole === 'wali' && currentWaliKelas) {
            selectedKelasFilter = currentWaliKelas;
        }

        document.getElementById('login-modal')?.classList.add('hidden');
        document.getElementById('main-app')?.classList.remove('hidden');
        
        const userDisplay = document.getElementById('user-display');
        if (userDisplay) {
            if (currentUserRole === 'admin') {
                userDisplay.innerHTML = `${db.sekolah.namaSekolah} <span class="px-1.5 py-0.5 text-[9px] bg-blue-500/20 text-blue-300 rounded font-bold">Admin Sekolah</span>`;
            } else {
                const wObj = db.wali.find(w => w.kelas === currentWaliKelas);
                userDisplay.innerHTML = `${wObj ? wObj.nama : 'Wali Kelas'} <span class="px-1.5 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-300 rounded font-bold">Wali Kelas ${currentWaliKelas}</span>`;
            }
        }
    } else {
        document.getElementById('login-modal')?.classList.remove('hidden');
        document.getElementById('main-app')?.classList.add('hidden');
    }
}

function toggleRegisterModal(show) {
    const regModal = document.getElementById('register-modal');
    const loginModal = document.getElementById('login-modal');
    
    if (show) {
        if (regModal) regModal.classList.remove('hidden');
        if (loginModal) loginModal.classList.add('hidden');
    } else {
        if (regModal) regModal.classList.add('hidden');
        if (loginModal) loginModal.classList.remove('hidden');
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function handleRegister(e) {
    e.preventDefault();
    const npsn = document.getElementById('reg-npsn').value.trim();
    const namaSekolah = document.getElementById('reg-nama').value.trim();
    const password = document.getElementById('reg-pass').value.trim();

    if (multiDb.schools && multiDb.schools[npsn]) {
        alert('NPSN Sekolah sudah terdaftar!');
        return;
    }

    if (!multiDb.schools) multiDb.schools = {};

    multiDb.schools[npsn] = {
        auth: { pass: password, changed: true },
        sekolah: {
            pemerintahYayasan: 'PEMERINTAH KABUPATEN / YAYASAN',
            namaSekolah: namaSekolah,
            npsn: npsn,
            alamat: 'Jl. Utama No. 1',
            kodePosTelp: '- / -',
            desaKelurahan: '-',
            kecamatan: '-',
            kabupaten: '-',
            provinsi: '-',
            website: '-',
            email: '-',
            logoUrl: 'assets/img/logo-tutwuri.png',
            tahunAjaran: '2026/2027',
            semester: '1 (Ganjil)',
            kepsekNama: '-',
            kepsekNip: '-',
            tempatTanggalCetak: '-'
        },
        wali: [
            { kelas: 'VII', nama: 'Wali Kelas VII', nip: '-', username: `${npsn}-VII`, pass: 'wali7' },
            { kelas: 'VIII', nama: 'Wali Kelas VIII', nip: '-', username: `${npsn}-VIII`, pass: 'wali8' },
            { kelas: 'IX', nama: 'Wali Kelas IX', nip: '-', username: `${npsn}-IX`, pass: 'wali9' }
        ],
        siswa: [],
        nilai: []
    };

    saveDB();
    alert(`Sekolah ${namaSekolah} berhasil didaftarkan!`);
    
    document.getElementById('form-register').reset();
    toggleRegisterModal(false);
    document.getElementById('login-user').value = npsn;
}

document.getElementById('form-login')?.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
        const userInput = document.getElementById('login-user').value.trim();
        const passInput = document.getElementById('login-pass').value.trim();

        if (multiDb.schools && multiDb.schools[userInput]) {
            const schoolAcc = multiDb.schools[userInput];
            if (passInput === schoolAcc.auth.pass) {
                currentNpsn = userInput;
                currentUserRole = 'admin';
                currentWaliKelas = null;
                selectedKelasFilter = 'SEMUA';

                sessionStorage.setItem('RAPOR_CURRENT_NPSN', currentNpsn);
                sessionStorage.setItem('RAPOR_USER_ROLE', 'admin');
                sessionStorage.removeItem('RAPOR_WALI_KELAS');
                sessionStorage.setItem('RAPOR_LOGGED_IN', 'true');
                
                db = multiDb.schools[currentNpsn];
                if (!db.siswa) db.siswa = [];
                if (!db.nilai) db.nilai = [];
                checkAuth();
                renderView();
                return;
            } else {
                alert('Password Admin Sekolah salah!');
                return;
            }
        }

        let waliFound = false;
        let passwordMatch = false;

        if (multiDb.schools) {
            Object.keys(multiDb.schools).forEach(npsnKey => {
                const school = multiDb.schools[npsnKey];
                if (school && school.wali) {
                    const wObj = school.wali.find(w => 
                        (w.username && w.username.toLowerCase() === userInput.toLowerCase()) ||
                        (w.kelas && w.kelas.toLowerCase() === userInput.toLowerCase())
                    );

                    if (wObj) {
                        waliFound = true;
                        if (wObj.pass === passInput) {
                            passwordMatch = true;
                            currentNpsn = npsnKey;
                            currentUserRole = 'wali';
                            currentWaliKelas = wObj.kelas;
                            selectedKelasFilter = wObj.kelas;

                            sessionStorage.setItem('RAPOR_CURRENT_NPSN', currentNpsn);
                            sessionStorage.setItem('RAPOR_USER_ROLE', 'wali');
                            sessionStorage.setItem('RAPOR_WALI_KELAS', currentWaliKelas);
                            sessionStorage.setItem('RAPOR_LOGGED_IN', 'true');

                            db = multiDb.schools[currentNpsn];
                            if (!db.siswa) db.siswa = [];
                            if (!db.nilai) db.nilai = [];
                            checkAuth();
                            renderView();
                        }
                    }
                }
            });
        }

        if (waliFound && !passwordMatch) {
            alert('Password Wali Kelas salah!');
            return;
        }

        if (!waliFound) {
            alert('Username atau Password tidak ditemukan!');
        }
    } catch (err) {
        console.error("Login Error:", err);
        alert("Terjadi kesalahan sistem saat login: " + err.message);
    }
});

function logout() {
    sessionStorage.clear();
    location.reload();
}

async function switchTab(tabId) {
    if (currentUserRole === 'wali' && tabId === 'identitas-sekolah') {
        alert("Akses dibatasi. Identitas Sekolah hanya dapat dikelola oleh Admin Sekolah.");
        return;
    }

    currentTab = tabId;
    const container = document.getElementById('content-container');
    if (container) {
        container.classList.remove('morph-active');
        container.classList.add('morph-enter');

        setTimeout(() => {
            renderView();
            container.classList.remove('morph-enter');
            container.classList.add('morph-active');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 200);
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.className = 'tab-btn px-4 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-white transition-all';
    });
    const activeTop = document.getElementById(`top-tab-${tabId.split('-')[0]}`);
    if (activeTop) activeTop.className = 'tab-btn px-4 py-2 text-xs font-medium rounded-lg text-white bg-blue-600 shadow-md transition-all';

    document.querySelectorAll('.side-btn').forEach(btn => {
        btn.className = 'side-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all';
    });
    const activeSide = document.getElementById(`side-tab-${tabId}`);
    if (activeSide) activeSide.className = 'side-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-400 bg-blue-600/10 border border-blue-500/20 transition-all';
}

function calculateRanksForKelas(kelasTarget) {
    if (!db || !db.siswa) return {};
    const siswaInKelas = db.siswa.filter(s => s.kelas === kelasTarget);
    
    const siswaTotals = siswaInKelas.map(siswa => {
        const nilaiObj = db.nilai ? db.nilai.find(n => n.nisn === siswa.nisn) : null;
        let total = 0;
        let count = 0;
        if (nilaiObj && nilaiObj.mapel) {
            Object.values(nilaiObj.mapel).forEach(m => {
                if (m.nilai !== '' && m.nilai !== null && !isNaN(m.nilai)) {
                    total += parseFloat(m.nilai);
                    count++;
                }
            });
        }
        return { nisn: siswa.nisn, total, count };
    });

    siswaTotals.sort((a, b) => b.total - a.total);

    const ranks = {};
    siswaTotals.forEach((item, index) => {
        ranks[item.nisn] = item.total > 0 ? (index + 1) : '-';
    });

    return ranks;
}

function getSiswaRank(siswa) {
    if (!siswa) return '-';
    const ranks = calculateRanksForKelas(siswa.kelas);
    const r = ranks[siswa.nisn];
    return r !== undefined ? r : '-';
}

function checkKelengkapanSiswa(siswa) {
    if (!siswa) return { status: false, persentase: 0 };
    
    const listMapel = [...MAPEL_KOLOM_A, ...MAPEL_KOLOM_B];
    const nilaiObj = db.nilai ? db.nilai.find(n => n.nisn === siswa.nisn) : null;
    if (!nilaiObj || !nilaiObj.mapel) return { status: false, persentase: 0 };

    let terisi = 0;
    listMapel.forEach(m => {
        if (nilaiObj.mapel[m] && nilaiObj.mapel[m].nilai !== '' && nilaiObj.mapel[m].nilai !== null) {
            terisi++;
        }
    });

    const persentase = Math.round((terisi / listMapel.length) * 100);
    return { status: persentase === 100, persentase };
}

async function loadView(fileName) {
    try {
        const response = await fetch(`views/${fileName}`);
        if (response.ok) return await response.text();
        return `<p class="text-red-400 p-4">Gagal memuat tampilan views/${fileName}</p>`;
    } catch (err) {
        return `<p class="text-red-400 p-4">Error memuat tampilan: ${err.message}</p>`;
    }
}

async function renderView() {
    if (!db) return;
    if (!db.siswa) db.siswa = [];
    if (!db.nilai) db.nilai = [];

    const container = document.getElementById('content-container');
    if (!container) return;

    switch (currentTab) {
        case 'dashboard': 
            container.innerHTML = await loadView('dashboard.html');
            initDashboardData();
            break;
        case 'sampul': 
            container.innerHTML = await loadView('sampul.html');
            initSampulData();
            break;
        case 'identitas-sekolah': 
            container.innerHTML = await loadView('identitas-sekolah.html');
            initSekolahData();
            break;
        case 'identitas-siswa': 
            container.innerHTML = await loadView('identitas-siswa.html');
            initSiswaTable();
            break;
        case 'identitas-wali': 
            container.innerHTML = await loadView('identitas-wali.html');
            initWaliTable();
            break;
        case 'capaian': 
            container.innerHTML = await loadView('capaian.html');
            initCapaianData();
            break;
        case 'backup': 
            container.innerHTML = await loadView('backup.html');
            break;
        case 'panduan': 
            container.innerHTML = await loadView('panduan.html');
            break;
        default: 
            container.innerHTML = await loadView('dashboard.html');
            initDashboardData();
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function initDashboardData() {
    if (!db) return;
    if (!db.siswa) db.siswa = [];

    const elTotal = document.getElementById('dash-total-siswa');
    const elSekolah = document.getElementById('dash-nama-sekolah');
    const elNpsn = document.getElementById('dash-npsn-sekolah');
    const elTahun = document.getElementById('dash-tahun-ajaran');
    const elSem = document.getElementById('dash-semester');

    const totalSiswaFilter = currentUserRole === 'wali' 
        ? db.siswa.filter(s => s.kelas === currentWaliKelas).length 
        : db.siswa.length;

    if (elTotal) elTotal.innerHTML = `${totalSiswaFilter} <span class="text-xs font-normal text-slate-400">Siswa ${currentUserRole === 'wali' ? 'Kelas ' + currentWaliKelas : ''}</span>`;
    if (elSekolah) elSekolah.innerText = db.sekolah.namaSekolah;
    if (elNpsn) elNpsn.innerText = db.sekolah.npsn || currentNpsn;
    if (elTahun) elTahun.innerText = db.sekolah.tahunAjaran;
    if (elSem) elSem.innerText = `Semester: ${db.sekolah.semester}`;

    const targetSiswaList = currentUserRole === 'wali' 
        ? db.siswa.filter(s => s.kelas === currentWaliKelas)
        : db.siswa;

    const counts = { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0 };
    let totalNilaiMasuk = 0;

    targetSiswaList.forEach(s => {
        const n = db.nilai ? db.nilai.find(x => x.nisn === s.nisn) : null;
        if (n && n.mapel) {
            Object.values(n.mapel).forEach(m => {
                if (m.nilai !== '' && m.nilai !== null && !isNaN(m.nilai)) {
                    const details = getNilaiDetails(m.nilai);
                    const p = details.predikat.replace('+', '');
                    if (counts[p] !== undefined) counts[p]++;
                    totalNilaiMasuk++;
                }
            });
        }
    });

    const elStatPredikat = document.getElementById('dash-stat-predikat');
    if (elStatPredikat) {
        elStatPredikat.innerHTML = ['A', 'B', 'C', 'D', 'E'].map(p => {
            const pct = totalNilaiMasuk > 0 ? Math.round((counts[p] / totalNilaiMasuk) * 100) : 0;
            const color = p === 'A' ? 'bg-emerald-500' : p === 'B' ? 'bg-blue-500' : p === 'C' ? 'bg-amber-500' : 'bg-rose-500';
            return `
                <div>
                    <div class="flex justify-between text-xs mb-1">
                        <span class="text-slate-300 font-bold">Predikat ${p}</span>
                        <span class="text-slate-400">${counts[p]} Nilai (${pct}%)</span>
                    </div>
                    <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div class="h-full ${color} transition-all duration-500" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    let lengkapCount = 0;
    targetSiswaList.forEach(s => {
        if (checkKelengkapanSiswa(s).status) lengkapCount++;
    });

    const totalSiswa = targetSiswaList.length;
    const pctLengkap = totalSiswa > 0 ? Math.round((lengkapCount / totalSiswa) * 100) : 0;

    const elStatKelengkapan = document.getElementById('dash-stat-kelengkapan');
    if (elStatKelengkapan) {
        elStatKelengkapan.innerHTML = `
            <div class="flex justify-between items-center text-xs">
                <span class="text-slate-300">Siswa Rapor Lengkap:</span>
                <span class="font-bold text-emerald-400 text-sm">${lengkapCount} / ${totalSiswa} Siswa</span>
            </div>
            <div class="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-500 transition-all duration-500" style="width: ${pctLengkap}%"></div>
            </div>
            <p class="text-[11px] text-slate-400">${pctLengkap}% seluruh data nilai mata pelajaran telah terisi penuh.</p>
        `;
    }
}

function initSampulData() {
    if (!db) return;
    if (!db.siswa) db.siswa = [];

    const targetSiswa = currentUserRole === 'wali' 
        ? db.siswa.filter(s => s.kelas === currentWaliKelas)
        : db.siswa;

    const siswa = targetSiswa[currentSiswaIndex] || targetSiswa[0] || { nama: '................', nis: '....', nisn: '....' };
    
    const elLogo = document.getElementById('sampul-logo');
    const elNama = document.getElementById('sampul-nama-siswa');
    const elNis = document.getElementById('sampul-nis-nisn');
    const elYayasan = document.getElementById('sampul-yayasan');
    const elSekolah = document.getElementById('sampul-sekolah');
    const elTahun = document.getElementById('sampul-tahun');

    if (elLogo) {
        elLogo.src = db.sekolah.logoUrl || 'assets/img/logo-tutwuri.png';
        elLogo.onerror = function() {
            this.src = 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_Tut_Wuri_Handayani.png';
        };
    }
    if (elNama) elNama.innerText = siswa.nama;
    if (elNis) elNis.innerText = `${siswa.nis} / ${siswa.nisn}`;
    if (elYayasan) elYayasan.innerText = db.sekolah.pemerintahYayasan;
    if (elSekolah) elSekolah.innerText = db.sekolah.namaSekolah;
    if (elTahun) elTahun.innerText = `TAHUN AJARAN ${db.sekolah.tahunAjaran}`;
}

function initSekolahData() {
    if (!db) return;
    if (currentUserRole === 'wali') {
        alert("Menu Identitas Sekolah hanya dapat diubah oleh Admin Sekolah.");
        switchTab('dashboard');
        return;
    }
    if (document.getElementById('sek-yayasan')) document.getElementById('sek-yayasan').value = db.sekolah.pemerintahYayasan || '';
    if (document.getElementById('sek-nama')) document.getElementById('sek-nama').value = db.sekolah.namaSekolah || '';
    if (document.getElementById('sek-alamat')) document.getElementById('sek-alamat').value = db.sekolah.alamat || '';
    if (document.getElementById('sek-kodepos')) document.getElementById('sek-kodepos').value = db.sekolah.kodePosTelp || '';
    if (document.getElementById('sek-desa')) document.getElementById('sek-desa').value = db.sekolah.desaKelurahan || '';
    if (document.getElementById('sek-kecamatan')) document.getElementById('sek-kecamatan').value = db.sekolah.kecamatan || '';
    if (document.getElementById('sek-kabupaten')) document.getElementById('sek-kabupaten').value = db.sekolah.kabupaten || '';
    if (document.getElementById('sek-provinsi')) document.getElementById('sek-provinsi').value = db.sekolah.provinsi || '';
    if (document.getElementById('sek-logo')) document.getElementById('sek-logo').value = db.sekolah.logoUrl || '';
    if (document.getElementById('sek-tahun')) document.getElementById('sek-tahun').value = db.sekolah.tahunAjaran || '';
    if (document.getElementById('sek-semester')) document.getElementById('sek-semester').value = db.sekolah.semester || '';
    if (document.getElementById('sek-kepsek')) document.getElementById('sek-kepsek').value = db.sekolah.kepsekNama || '';
    if (document.getElementById('sek-nip')) document.getElementById('sek-nip').value = db.sekolah.kepsekNip || '';
    if (document.getElementById('sek-tempat-cetak')) document.getElementById('sek-tempat-cetak').value = db.sekolah.tempatTanggalCetak || '';
}

function saveIdentitasSekolah() {
    if (!db || !db.sekolah) return;
    if (currentUserRole === 'wali') {
        alert("Akses ditolak. Hanya Admin Sekolah yang dapat menyimpan data identitas sekolah.");
        return;
    }

    db.sekolah.pemerintahYayasan = document.getElementById('sek-yayasan').value;
    db.sekolah.namaSekolah = document.getElementById('sek-nama').value;
    db.sekolah.alamat = document.getElementById('sek-alamat').value;
    db.sekolah.kodePosTelp = document.getElementById('sek-kodepos').value;
    db.sekolah.desaKelurahan = document.getElementById('sek-desa').value;
    db.sekolah.kecamatan = document.getElementById('sek-kecamatan').value;
    db.sekolah.kabupaten = document.getElementById('sek-kabupaten').value;
    db.sekolah.provinsi = document.getElementById('sek-provinsi').value;
    db.sekolah.logoUrl = document.getElementById('sek-logo').value;
    db.sekolah.tahunAjaran = document.getElementById('sek-tahun').value;
    db.sekolah.semester = document.getElementById('sek-semester').value;
    db.sekolah.kepsekNama = document.getElementById('sek-kepsek').value;
    db.sekolah.kepsekNip = document.getElementById('sek-nip').value;
    db.sekolah.tempatTanggalCetak = document.getElementById('sek-tempat-cetak').value;

    saveDB();
    alert("Data Identitas Sekolah SMP berhasil disimpan!");
}

function printIdentitasSekolah() {
    if (!db || !db.sekolah) {
        alert("Data sekolah tidak ditemukan.");
        return;
    }
    const sek = db.sekolah;
    const printWin = window.open('', '_blank');
    printWin.document.write(`
        <html>
        <head>
            <title>Identitas Satuan Pendidikan - ${sek.namaSekolah}</title>
            <style>
                @page { size: 215mm 330mm; margin: 15mm; }
                body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.6; color: #000; }
                h2 { text-align: center; text-transform: uppercase; font-size: 14pt; margin-bottom: 25px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                td { padding: 6px 4px; vertical-align: top; }
                .ttd-box { float: right; text-align: center; margin-top: 40px; width: 250px; }
            </style>
        </head>
        <body onload="window.print()">
            <h2>IDENTITAS SATUAN PENDIDIKAN (SMP)</h2>
            <table>
                <tr><td width="35">1.</td><td width="220">Nama Sekolah</td><td width="15">:</td><td style="font-weight:bold;">${sek.namaSekolah}</td></tr>
                <tr><td>2.</td><td>NPSN</td><td>:</td><td>${sek.npsn || '-'}</td></tr>
                <tr><td>3.</td><td>Pemerintah / Yayasan</td><td>:</td><td>${sek.pemerintahYayasan}</td></tr>
                <tr><td>4.</td><td>Alamat Sekolah</td><td>:</td><td>${sek.alamat}</td></tr>
                <tr><td>5.</td><td>Kode Pos / Telepon</td><td>:</td><td>${sek.kodePosTelp}</td></tr>
                <tr><td>6.</td><td>Desa / Kelurahan</td><td>:</td><td>${sek.desaKelurahan}</td></tr>
                <tr><td>7.</td><td>Kecamatan</td><td>:</td><td>${sek.kecamatan}</td></tr>
                <tr><td>8.</td><td>Kabupaten / Kota</td><td>:</td><td>${sek.kabupaten}</td></tr>
                <tr><td>9.</td><td>Provinsi</td><td>:</td><td>${sek.provinsi}</td></tr>
                <tr><td>10.</td><td>Situs Web (Website)</td><td>:</td><td>${sek.website || '-'}</td></tr>
                <tr><td>11.</td><td>Email Sekolah</td><td>:</td><td>${sek.email || '-'}</td></tr>
                <tr><td>12.</td><td>Nama Kepala Sekolah</td><td>:</td><td style="font-weight:bold;">${sek.kepsekNama}</td></tr>
                <tr><td>13.</td><td>NIP Kepala Sekolah</td><td>:</td><td>${sek.kepsekNip}</td></tr>
            </table>

            <div style="margin-top: 40px; clear: both;">
                <div class="ttd-box">
                    <p>${sek.tempatTanggalCetak}</p>
                    <p>Kepala Sekolah,</p>
                    <br><br><br><br>
                    <p><strong><u>${sek.kepsekNama}</u></strong></p>
                    <p>NIP. ${sek.kepsekNip}</p>
                </div>
            </div>
        </body>
        </html>
    `);
    printWin.document.close();
}

function initSiswaTable() {
    if (!db) return;
    if (!db.siswa) db.siswa = [];
    
    db.siswa.sort((a, b) => (a.nama || '').localeCompare(b.nama || ''));

    if (currentUserRole === 'wali') {
        selectedKelasFilter = currentWaliKelas;
    }

    const filteredSiswa = selectedKelasFilter === 'SEMUA' ? db.siswa : db.siswa.filter(s => s.kelas === selectedKelasFilter);
    const tbody = document.getElementById('table-body-siswa');

    const filterEl = document.getElementById('filter-kelas-siswa');
    if (filterEl) {
        filterEl.value = selectedKelasFilter;
        if (currentUserRole === 'wali') filterEl.disabled = true;
    }

    if (!tbody) return;

    if (filteredSiswa.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-slate-500">Tidak ada data siswa untuk kelas ini.</td></tr>`;
        return;
    }

    tbody.innerHTML = filteredSiswa.map((s, idx) => {
        const actualIndex = db.siswa.findIndex(x => x.nisn === s.nisn);
        const rank = getSiswaRank(s);
        const statKelengkapan = checkKelengkapanSiswa(s);
        const badgeKelengkapan = statKelengkapan.status 
            ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">100% Lengkap</span>`
            : `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">${statKelengkapan.persentase}% Terisi</span>`;

        return `
            <tr>
                <td class="p-3">${idx + 1}</td>
                <td class="p-3 font-semibold text-white">
                    <div>${s.nama}</div>
                    <div class="mt-1">${badgeKelengkapan}</div>
                </td>
                <td class="p-3">${s.nis} / ${s.nisn}</td>
                <td class="p-3 font-bold text-blue-400">Kelas ${s.kelas}</td>
                <td class="p-3 text-center">
                    <span class="px-2.5 py-1 rounded-full text-xs font-extrabold ${rank !== '-' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-500'}">
                        Peringkat ${rank}
                    </span>
                </td>
                <td class="p-3">${s.jk}</td>
                <td class="p-3 text-center space-x-2">
                    <button onclick="openSiswaModal(${actualIndex})" class="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded">Edit</button>
                    <button onclick="deleteSiswa(${actualIndex})" class="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs rounded">Hapus</button>
                    <button onclick="printLembarIdentitas(${actualIndex})" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded">Cetak</button>
                </td>
            </tr>
        `;
    }).join('');
}

function printLembarIdentitas(idx) {
    if (!db || !db.siswa || !db.siswa[idx]) {
        alert("Data siswa tidak ditemukan.");
        return;
    }
    const s = db.siswa[idx];
    const printWin = window.open('', '_blank');
    printWin.document.write(`
        <html>
        <head>
            <title>Identitas Peserta Didik - ${s.nama}</title>
            <style>
                @page { size: 215mm 330mm; margin: 12.7mm; }
                body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.4; color: #000; }
                h2 { text-align: center; text-transform: uppercase; font-size: 13pt; margin-bottom: 20px; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; }
                td { padding: 4px; vertical-align: top; }
                .photo-box { width: 3cm; height: 4cm; border: 1px solid #000; text-align: center; line-height: 4cm; float: left; margin-top: 20px; }
                .ttd-box { float: right; text-align: center; margin-top: 20px; width: 250px; }
            </style>
        </head>
        <body onload="window.print()">
            <h2>KETERANGAN TENTANG DIRI PESERTA DIDIK</h2>
            <table>
                <tr><td width="30">1.</td><td width="200">Nama Peserta Didik (Lengkap)</td><td width="10">:</td><td style="font-weight:bold;">${s.nama}</td></tr>
                <tr><td>2.</td><td>NIS / NISN</td><td>:</td><td>${s.nis} / ${s.nisn}</td></tr>
                <tr><td>3.</td><td>Tempat, Tanggal Lahir</td><td>:</td><td>${s.ttl}</td></tr>
                <tr><td>4.</td><td>Jenis Kelamin</td><td>:</td><td>${s.jk}</td></tr>
                <tr><td>5.</td><td>Agama</td><td>:</td><td>${s.agama}</td></tr>
                <tr><td>6.</td><td>Status dalam Keluarga</td><td>:</td><td>${s.statusKeluarga}</td></tr>
                <tr><td>7.</td><td>Anak Ke-</td><td>:</td><td>${s.anakKe}</td></tr>
                <tr><td>8.</td><td>Alamat Peserta Didik</td><td>:</td><td>${s.alamat}</td></tr>
                <tr><td>9.</td><td>Nomor Telepon Rumah</td><td>:</td><td>${s.telp}</td></tr>
                <tr><td>10.</td><td>Sekolah Asal</td><td>:</td><td>${s.sekolahAsal}</td></tr>
                <tr><td>11.</td><td>Diterima di Sekolah Ini</td><td>:</td><td>Kelas ${s.diterimaKelas}, Tanggal ${s.diterimaTanggal}</td></tr>
                <tr><td>12.</td><td>Nama Orang Tua</td><td>:</td><td>a. Ayah: ${s.ayah}<br>b. Ibu: ${s.ibu}</td></tr>
                <tr><td>13.</td><td>Alamat Orang Tua</td><td>:</td><td>${s.alamatOrangTua}</td></tr>
                <tr><td>14.</td><td>Pekerjaan Orang Tua</td><td>:</td><td>a. Ayah: ${s.pekerjaanAyah}<br>b. Ibu: ${s.pekerjaanIbu}</td></tr>
                <tr><td>15.</td><td>Nama Wali Peserta Didik</td><td>:</td><td>${s.namaWali}</td></tr>
                <tr><td>16.</td><td>Alamat Wali</td><td>:</td><td>${s.alamatWali}</td></tr>
                <tr><td>17.</td><td>Pekerjaan Wali</td><td>:</td><td>${s.pekerjaanWali}</td></tr>
            </table>

            <div style="margin-top: 30px; clear: both;">
                <div class="photo-box">Pasfoto 3x4</div>
                <div class="ttd-box">
                    <p>${db.sekolah.tempatTanggalCetak}</p>
                    <p>Kepala Sekolah,</p>
                    <br><br><br>
                    <p><strong><u>${db.sekolah.kepsekNama}</u></strong></p>
                    <p>NIP. ${db.sekolah.kepsekNip}</p>
                </div>
            </div>
        </body>
        </html>
    `);
    printWin.document.close();
}

function initWaliTable() {
    if (!db) return;
    const tbody = document.getElementById('table-body-wali');
    if (!tbody) return;

    tbody.innerHTML = db.wali.map((w, idx) => {
        const isDisabled = (currentUserRole === 'wali' && w.kelas !== currentWaliKelas) ? 'disabled' : '';
        const isPassHidden = currentUserRole === 'wali' ? 'type="password"' : 'type="text"';

        return `
            <tr class="${isDisabled ? 'opacity-50 bg-slate-900/30' : ''}">
                <td class="p-3 font-bold text-blue-400">Kelas ${w.kelas}</td>
                <td class="p-3">
                    <input type="text" id="wali-nama-${idx}" value="${w.nama}" ${isDisabled} class="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white">
                </td>
                <td class="p-3">
                    <input type="text" id="wali-nip-${idx}" value="${w.nip}" ${isDisabled} class="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white">
                </td>
                <td class="p-3">
                    <div class="text-[10px] text-slate-400 font-mono mb-0.5">User: ${w.username}</div>
                    <input ${isPassHidden} id="wali-pass-${idx}" value="${w.pass}" ${isDisabled} class="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-amber-300 font-bold text-xs">
                </td>
                <td class="p-3 text-center">
                    <button onclick="saveWali(${idx})" ${isDisabled} class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded">
                        Simpan
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function initCapaianData() {
    if (!db) return;
    if (!db.siswa) db.siswa = [];

    if (currentUserRole === 'wali') {
        selectedKelasFilter = currentWaliKelas;
    }

    const filteredSiswa = selectedKelasFilter === 'SEMUA' ? db.siswa : db.siswa.filter(s => s.kelas === selectedKelasFilter);
    const selectSiswa = document.getElementById('siswa-select');
    const filterEl = document.getElementById('filter-kelas-nilai');

    if (filterEl) {
        filterEl.value = selectedKelasFilter;
        if (currentUserRole === 'wali') filterEl.disabled = true;
    }

    if (selectSiswa) {
        selectSiswa.innerHTML = filteredSiswa.map((s) => {
            const actualIndex = db.siswa.findIndex(x => x.nisn === s.nisn);
            return `<option value="${actualIndex}" ${actualIndex === currentSiswaIndex ? 'selected' : ''}>${s.nama} (Kelas ${s.kelas})</option>`;
        }).join('');
    }

    const editorBox = document.getElementById('rapor-sheet-editor');
    if (editorBox) {
        editorBox.innerHTML = loadRaporEditor();
    }
}

function saveWali(idx) {
    if (currentUserRole === 'wali' && db.wali[idx].kelas !== currentWaliKelas) {
        alert("Anda tidak memiliki akses mengubah data wali kelas lain.");
        return;
    }
    db.wali[idx].nama = document.getElementById(`wali-nama-${idx}`).value;
    db.wali[idx].nip = document.getElementById(`wali-nip-${idx}`).value;
    const passInput = document.getElementById(`wali-pass-${idx}`);
    if (passInput) db.wali[idx].pass = passInput.value.trim();

    saveDB();
    alert(`Data Wali Kelas ${db.wali[idx].kelas} berhasil disimpan!`);
}

function setKelasFilter(val) {
    if (currentUserRole === 'wali') {
        selectedKelasFilter = currentWaliKelas;
    } else {
        selectedKelasFilter = val;
    }
    renderView();
}

function openSiswaModal(idx) {
    if (!db) return;
    if (!db.siswa) db.siswa = [];

    const modal = document.getElementById('siswa-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

    const idxInput = document.getElementById('edit-siswa-index');
    if (idxInput) idxInput.value = idx;

    const selectKelas = document.getElementById('f-kelas');
    if (selectKelas) selectKelas.removeAttribute('disabled');

    const getVal = (id) => document.getElementById(id);

    if (idx === -1) {
        const title = document.getElementById('modal-siswa-title');
        if (title) title.innerText = "Tambah Peserta Didik Baru";
        
        const form = document.getElementById('form-full-siswa');
        if (form) form.reset();
        
        if (getVal('f-nis')) getVal('f-nis').value = '202400' + (db.siswa.length + 1);
        if (getVal('f-nisn')) getVal('f-nisn').value = '01234567' + Math.floor(10 + Math.random() * 89);
        
        if (currentUserRole === 'wali' && selectKelas) {
            selectKelas.value = currentWaliKelas;
            selectKelas.setAttribute('disabled', 'true');
        }
    } else {
        const title = document.getElementById('modal-siswa-title');
        if (title) title.innerText = "Edit Data Peserta Didik";
        
        const s = db.siswa[idx];
        if (s) {
            if (getVal('f-nama')) getVal('f-nama').value = s.nama || '';
            if (selectKelas) selectKelas.value = s.kelas || 'VII';
            if (getVal('f-nis')) getVal('f-nis').value = s.nis || '';
            if (getVal('f-nisn')) getVal('f-nisn').value = s.nisn || '';
            if (getVal('f-ttl')) getVal('f-ttl').value = s.ttl || '';
            if (getVal('f-jk')) getVal('f-jk').value = s.jk || 'Laki-Laki';
            if (getVal('f-agama')) getVal('f-agama').value = s.agama || 'Katolik';
            if (getVal('f-statusKeluarga')) getVal('f-statusKeluarga').value = s.statusKeluarga || 'Anak Kandung';
            if (getVal('f-anakKe')) getVal('f-anakKe').value = s.anakKe || 1;
            if (getVal('f-alamat')) getVal('f-alamat').value = s.alamat || '';
            if (getVal('f-telp')) getVal('f-telp').value = s.telp || '-';
            if (getVal('f-sekolahAsal')) getVal('f-sekolahAsal').value = s.sekolahAsal || '';
            if (getVal('f-diterimaKelas')) getVal('f-diterimaKelas').value = s.diterimaKelas || 'VII';
            if (getVal('f-diterimaTanggal')) getVal('f-diterimaTanggal').value = s.diterimaTanggal || '';
            if (getVal('f-ayah')) getVal('f-ayah').value = s.ayah || '';
            if (getVal('f-ibu')) getVal('f-ibu').value = s.ibu || '';
            if (getVal('f-alamatOrangTua')) getVal('f-alamatOrangTua').value = s.alamatOrangTua || '';
            if (getVal('f-pekerjaanAyah')) getVal('f-pekerjaanAyah').value = s.pekerjaanAyah || '';
            if (getVal('f-pekerjaanIbu')) getVal('f-pekerjaanIbu').value = s.pekerjaanIbu || '';
            if (getVal('f-namaWali')) getVal('f-namaWali').value = s.namaWali || '-';
            if (getVal('f-alamatWali')) getVal('f-alamatWali').value = s.alamatWali || '-';
            if (getVal('f-pekerjaanWali')) getVal('f-pekerjaanWali').value = s.pekerjaanWali || '-';
        }

        if (currentUserRole === 'wali' && selectKelas) {
            selectKelas.setAttribute('disabled', 'true');
        }
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeSiswaModal() {
    const modal = document.getElementById('siswa-modal');
    if (modal) modal.classList.add('hidden');
}

// === FUNGSI PERBAIKAN: MEMASTIKAN DB & SISWA TERLEBIH DAHULU SUDAH TERSEDIA ===
function saveFullSiswa(e) {
    if (e && e.preventDefault) e.preventDefault();
    try {
        if (!db) {
            alert("Database sekolah belum terhubung!");
            return;
        }
        if (!db.siswa) {
            db.siswa = [];
        }

        const idxInput = document.getElementById('edit-siswa-index');
        const idx = idxInput ? parseInt(idxInput.value) : -1;
        
        const selectKelas = document.getElementById('f-kelas');
        const targetKelas = currentUserRole === 'wali' 
            ? currentWaliKelas 
            : (selectKelas ? selectKelas.value : 'VII');

        const getVal = (id) => {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
        };

        const siswaObj = {
            noUrut: (idx === -1 || !db.siswa[idx]) ? (db.siswa.length + 1) : (db.siswa[idx].noUrut || (idx + 1)),
            nama: getVal('f-nama'),
            kelas: targetKelas,
            nis: getVal('f-nis'),
            nisn: getVal('f-nisn'),
            ttl: getVal('f-ttl'),
            jk: getVal('f-jk') || 'Laki-Laki',
            agama: getVal('f-agama') || 'Katolik',
            statusKeluarga: getVal('f-statusKeluarga') || 'Anak Kandung',
            anakKe: getVal('f-anakKe') || 1,
            alamat: getVal('f-alamat'),
            telp: getVal('f-telp') || '-',
            sekolahAsal: getVal('f-sekolahAsal'),
            diterimaKelas: getVal('f-diterimaKelas') || targetKelas,
            diterimaTanggal: getVal('f-diterimaTanggal'),
            ayah: getVal('f-ayah'),
            ibu: getVal('f-ibu'),
            alamatOrangTua: getVal('f-alamatOrangTua'),
            pekerjaanAyah: getVal('f-pekerjaanAyah'),
            pekerjaanIbu: getVal('f-pekerjaanIbu'),
            namaWali: getVal('f-namaWali') || '-',
            alamatWali: getVal('f-alamatWali') || '-',
            pekerjaanWali: getVal('f-pekerjaanWali') || '-'
        };

        if (idx === -1 || idx >= db.siswa.length) {
            db.siswa.push(siswaObj);
        } else {
            db.siswa[idx] = siswaObj;
        }

        saveDB();
        closeSiswaModal();
        renderView();
        alert("Data peserta didik berhasil disimpan!");
    } catch (err) {
        console.error("Gagal menyimpan data siswa:", err);
        alert("Terjadi kesalahan saat menyimpan data siswa: " + err.message);
    }
}

function deleteSiswa(idx) {
    if (!db || !db.siswa) return;
    if (currentUserRole === 'wali' && db.siswa[idx] && db.siswa[idx].kelas !== currentWaliKelas) {
        alert("Anda tidak dapat menghapus siswa kelas lain.");
        return;
    }
    if (confirm("Hapus data siswa ini?")) {
        db.siswa.splice(idx, 1);
        saveDB();
        renderView();
    }
}

function changeSiswaIndex(idx) {
    currentSiswaIndex = parseInt(idx);
    renderView();
}

function getNilaiDetails(nilaiVal) {
    if (nilaiVal === '' || nilaiVal === null || isNaN(nilaiVal)) {
        return { predikat: '-', capaian: '-', rekomendasi: '-' };
    }

    const val = parseFloat(nilaiVal);
    let predikat = '';
    let capaian = '';
    let rekomendasi = '';

    if (val === 100) predikat = 'A+';
    else if (val >= 93) predikat = 'A';
    else if (val >= 80) predikat = 'B';
    else if (val >= 70) predikat = 'C';
    else if (val >= 60) predikat = 'D';
    else predikat = 'E';

    if (predikat === 'A+' || predikat === 'A') {
        capaian = 'Menunjukkan penguasaan kompetensi yang sangat baik dan sempurna dalam memahami materi.';
        rekomendasi = 'Luar biasa! Pertahankan prestasi gemilang ini dan terus kembangkan potensi diri.';
    } else if (predikat === 'B') {
        capaian = 'Menunjukkan penguasaan kompetensi yang baik dalam memahami materi pembelajaran.';
        rekomendasi = 'Tingkat pemahaman materi baik, disarankan mempertahankan dan meningkatkan prestasimu.';
    } else if (predikat === 'C' || predikat === 'D') {
        capaian = 'Menunjukkan penguasaan kompetensi yang cukup namun membutuhkan latihan ekstra.';
        rekomendasi = 'Tingkat pemahaman materi Cukup/Kurang baik, disarankan bimbingan ekstra untuk meningkatkan lagi prestasimu.';
    } else {
        capaian = 'Belum mencapai ketuntasan kompetensi minimal yang diharapkan.';
        rekomendasi = 'Sangat memerlukan bimbingan ekstra dari guru dan perhatian serta pendampingan penuh di rumah.';
    }

    return { predikat, capaian, rekomendasi };
}

function updateRowCalc(mapelKey) {
    const parseVal = (id) => {
        const el = document.getElementById(id);
        if (!el || el.value === '' || isNaN(el.value)) return null;
        return parseFloat(el.value);
    };

    const uh1 = parseVal(`input-uh1-${mapelKey}`);
    const uh2 = parseVal(`input-uh2-${mapelKey}`);
    const uh3 = parseVal(`input-uh3-${mapelKey}`);
    const uts = parseVal(`input-uts-${mapelKey}`);
    const uas = parseVal(`input-uas-${mapelKey}`);

    const validValues = [uh1, uh2, uh3, uts, uas].filter(v => v !== null);

    let avgStr = '-';
    if (validValues.length > 0) {
        const sum = validValues.reduce((a, b) => a + b, 0);
        const avg = Math.round(sum / validValues.length);
        avgStr = avg;
    }

    const avgEl = document.getElementById(`input-nilai-${mapelKey}`);
    if (avgEl) {
        avgEl.value = avgStr === '-' ? '' : avgStr;
    }

    const details = getNilaiDetails(avgStr === '-' ? '' : avgStr);
    const predEl = document.getElementById(`predikat-${mapelKey}`);
    const capEl = document.getElementById(`capaian-${mapelKey}`);
    const rekEl = document.getElementById(`rekomendasi-${mapelKey}`);

    if (predEl) predEl.innerText = details.predikat;
    if (capEl) capEl.innerText = details.capaian;
    if (rekEl) rekEl.innerText = details.rekomendasi;
}

function loadRaporEditor() {
    if (!db) return '';
    if (!db.siswa) db.siswa = [];

    const targetSiswaList = currentUserRole === 'wali' 
        ? db.siswa.filter(s => s.kelas === currentWaliKelas)
        : db.siswa;

    const siswa = targetSiswaList[currentSiswaIndex] || targetSiswaList[0];
    if (!siswa) return `<p class="text-slate-400 p-4 text-center">Data siswa tidak ditemukan untuk kelas ini.</p>`;

    if (!db.nilai) db.nilai = [];
    let nilaiData = db.nilai.find(n => n.nisn === siswa.nisn);

    if (!nilaiData) {
        nilaiData = { 
            nisn: siswa.nisn, 
            mapel: {},
            ekstra: [
                { nama: 'Inovasi', predikat: 'A', ket: 'Sangat aktif dalam kegiatan inovasi dan karya sains' },
                { nama: 'Literasi', predikat: 'A', ket: 'Menunjukkan kemampuan membaca dan menulis yang sangat tinggi' },
                { nama: 'Belajar Kerja Nyata (BKN)', predikat: 'B', ket: 'Mampu bekerjasama dengan baik dalam proyek sosial' }
            ],
            absensi: { sakit: '0', izin: '0', alpa: '0' },
            catatan: 'Pertahankan prestasi belajar yang baik ini dan tingkatkan kedisiplinan.',
            keputusan: 'Naik Kelas'
        };
        MAPEL_KOLOM_A.forEach(m => { nilaiData.mapel[m] = { kkm: 70, uh1: '', uh2: '', uh3: '', uts: '', uas: '', nilai: '' }; });
        MAPEL_KOLOM_B.forEach(m => { nilaiData.mapel[m] = { kkm: 70, uh1: '', uh2: '', uh3: '', uts: '', uas: '', nilai: '' }; });
        db.nilai.push(nilaiData);
        saveDB();
    }

    if (!nilaiData.ekstra) {
        nilaiData.ekstra = [
            { nama: 'Inovasi', predikat: 'A', ket: 'Sangat aktif dalam kegiatan inovasi dan karya sains' },
            { nama: 'Literasi', predikat: 'A', ket: 'Menunjukkan kemampuan membaca dan menulis yang sangat tinggi' },
            { nama: 'Belajar Kerja Nyata (BKN)', predikat: 'B', ket: 'Mampu bekerjasama dengan baik dalam proyek sosial' }
        ];
    }
    if (!nilaiData.absensi) nilaiData.absensi = { sakit: '0', izin: '0', alpa: '0' };
    if (!nilaiData.catatan) nilaiData.catatan = 'Pertahankan prestasi belajar yang baik ini dan tingkatkan kedisiplinan.';
    if (!nilaiData.keputusan) nilaiData.keputusan = 'Naik Kelas';

    const rank = getSiswaRank(siswa);
    const isGenap = db.sekolah.semester.includes('2') || db.sekolah.semester.toLowerCase().includes('genap');

    const btnCetakRapor = currentUserRole === 'admin'
        ? `<button onclick="printRaporF4()" class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5">
                <i data-lucide="printer" class="w-3.5 h-3.5"></i> Cetak Rapor (F4)
           </button>`
        : `<span class="px-3 py-1.5 bg-slate-800 text-slate-400 text-xs rounded-lg border border-slate-700">Pencetakan oleh Admin Sekolah</span>`;

    const renderTableMapel = (listMapelKey) => listMapelKey.map((m, idx) => {
        const item = (nilaiData.mapel && nilaiData.mapel[m]) ? nilaiData.mapel[m] : { kkm: 70, uh1: '', uh2: '', uh3: '', uts: '', uas: '', nilai: '' };
        const details = getNilaiDetails(item.nilai);
        return `
            <tr>
                <td class="p-2 border border-slate-800 text-center font-bold text-slate-400">${idx + 1}</td>
                <td class="p-2 border border-slate-800 font-semibold text-white">${m}</td>
                <td class="p-1 border border-slate-800 text-center">
                    <input type="number" id="input-uh1-${m}" value="${item.uh1 ?? ''}" oninput="updateRowCalc('${m}')" min="0" max="100" placeholder="0" class="w-11 text-center py-1 rounded bg-slate-900 border border-slate-700 text-slate-200">
                </td>
                <td class="p-1 border border-slate-800 text-center">
                    <input type="number" id="input-uh2-${m}" value="${item.uh2 ?? ''}" oninput="updateRowCalc('${m}')" min="0" max="100" placeholder="0" class="w-11 text-center py-1 rounded bg-slate-900 border border-slate-700 text-slate-200">
                </td>
                <td class="p-1 border border-slate-800 text-center">
                    <input type="number" id="input-uh3-${m}" value="${item.uh3 ?? ''}" oninput="updateRowCalc('${m}')" min="0" max="100" placeholder="0" class="w-11 text-center py-1 rounded bg-slate-900 border border-slate-700 text-slate-200">
                </td>
                <td class="p-1 border border-slate-800 text-center">
                    <input type="number" id="input-uts-${m}" value="${item.uts ?? ''}" oninput="updateRowCalc('${m}')" min="0" max="100" placeholder="0" class="w-11 text-center py-1 rounded bg-slate-900 border border-slate-700 text-blue-300 font-semibold">
                </td>
                <td class="p-1 border border-slate-800 text-center">
                    <input type="number" id="input-uas-${m}" value="${item.uas ?? ''}" oninput="updateRowCalc('${m}')" min="0" max="100" placeholder="0" class="w-11 text-center py-1 rounded bg-slate-900 border border-slate-700 text-indigo-300 font-semibold">
                </td>
                <td class="p-2 border border-slate-800 text-center bg-slate-900/60">
                    <input type="number" id="input-nilai-${m}" value="${item.nilai ?? ''}" readonly class="w-12 text-center py-1 rounded bg-slate-950 border border-amber-500/50 text-amber-300 font-black cursor-not-allowed">
                </td>
                <td class="p-2 border border-slate-800 text-center font-bold text-blue-400" id="predikat-${m}">${details.predikat}</td>
                <td class="p-2 border border-slate-800 text-slate-300 text-[11px]" id="capaian-${m}">${details.capaian}</td>
                <td class="p-2 border border-slate-800 text-slate-400 text-[11px]" id="rekomendasi-${m}">${details.rekomendasi}</td>
            </tr>
        `;
    }).join('');

    return `
        <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div class="flex items-center gap-3">
                <span class="text-xs text-slate-300 font-bold">Aksi Rapor: ${siswa.nama}</span>
                <span class="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-black flex items-center gap-1.5">
                    <i data-lucide="trophy" class="w-3.5 h-3.5"></i> Peringkat Kelas: ${rank}
                </span>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="saveRaporNilai()" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5">
                    <i data-lucide="save" class="w-3.5 h-3.5"></i> Simpan
                </button>
                <button onclick="resetRaporNilai()" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5">
                    <i data-lucide="edit-2" class="w-3.5 h-3.5"></i> Edit / Reset
                </button>
                <button onclick="deleteRaporNilai()" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Hapus
                </button>
                ${btnCetakRapor}
            </div>
        </div>

        <div class="p-4 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
            <div class="flex items-center gap-4">
                <img src="${db.sekolah.logoUrl || 'assets/img/logo-tutwuri.png'}" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_Tut_Wuri_Handayani.png'" class="h-16 w-auto object-contain">
                <div>
                    <p class="font-bold text-white text-sm uppercase">${db.sekolah.pemerintahYayasan}</p>
                    <p class="font-black text-blue-400 text-lg uppercase">${db.sekolah.namaSekolah}</p>
                    <p class="text-slate-400">${db.sekolah.alamat} | ${db.sekolah.kodePosTelp}</p>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-900/40 p-3 rounded-xl border border-slate-800">
            <div><span class="text-slate-400">Nama Siswa:</span> <p class="font-bold text-white">${siswa.nama}</p></div>
            <div><span class="text-slate-400">NIS / NISN:</span> <p class="font-bold text-white">${siswa.nis} / ${siswa.nisn}</p></div>
            <div><span class="text-slate-400">Kelas / Sem:</span> <p class="font-bold text-white">Kelas ${siswa.kelas} / ${db.sekolah.semester}</p></div>
            <div><span class="text-slate-400">Tahun Ajaran:</span> <p class="font-bold text-white">${db.sekolah.tahunAjaran}</p></div>
        </div>

        <div class="space-y-4">
            <h3 class="text-sm font-bold text-blue-400 border-b border-slate-700 pb-1">PENILAIAN AKADEMIK & EKSTRAKURIKULER</h3>
            
            <div class="overflow-x-auto">
                <p class="text-xs font-bold text-slate-200 mb-2 uppercase">Kelompok A : Mata Pelajaran Utama</p>
                <table class="w-full text-left text-xs text-slate-300 border-collapse">
                    <thead class="bg-slate-900 text-slate-400 uppercase text-[10px]">
                        <tr>
                            <th class="p-2 border border-slate-700 text-center" rowspan="2">No</th>
                            <th class="p-2 border border-slate-700" rowspan="2">Mata Pelajaran</th>
                            <th class="p-1 border border-slate-700 text-center" colspan="3">Ulangan Harian</th>
                            <th class="p-1 border border-slate-700 text-center" rowspan="2">UTS (MID)</th>
                            <th class="p-1 border border-slate-700 text-center" rowspan="2">UAS</th>
                            <th class="p-2 border border-slate-700 text-center text-amber-400 font-black" rowspan="2">Rata2 (Rapor)</th>
                            <th class="p-2 border border-slate-700 text-center" rowspan="2">Predikat</th>
                            <th class="p-2 border border-slate-700" rowspan="2">Capaian Kompetensi</th>
                            <th class="p-2 border border-slate-700" rowspan="2">Rekomendasi Deskripsi</th>
                        </tr>
                        <tr>
                            <th class="p-1 border border-slate-700 text-center w-11">UH 1</th>
                            <th class="p-1 border border-slate-700 text-center w-11">UH 2</th>
                            <th class="p-1 border border-slate-700 text-center w-11">UH 3</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800">
                        ${renderTableMapel(MAPEL_KOLOM_A)}
                    </tbody>
                </table>
            </div>

            <div class="overflow-x-auto pt-2">
                <p class="text-xs font-bold text-slate-200 mb-2 uppercase">Kelompok B : Muatan Lokal & Keterampilan</p>
                <table class="w-full text-left text-xs text-slate-300 border-collapse">
                    <thead class="bg-slate-900 text-slate-400 uppercase text-[10px]">
                        <tr>
                            <th class="p-2 border border-slate-700 text-center" rowspan="2">No</th>
                            <th class="p-2 border border-slate-700" rowspan="2">Mata Pelajaran</th>
                            <th class="p-1 border border-slate-700 text-center" colspan="3">Ulangan Harian</th>
                            <th class="p-1 border border-slate-700 text-center" rowspan="2">UTS (MID)</th>
                            <th class="p-1 border border-slate-700 text-center" rowspan="2">UAS</th>
                            <th class="p-2 border border-slate-700 text-center text-amber-400 font-black" rowspan="2">Rata2 (Rapor)</th>
                            <th class="p-2 border border-slate-700 text-center" rowspan="2">Predikat</th>
                            <th class="p-2 border border-slate-700" rowspan="2">Capaian Kompetensi</th>
                            <th class="p-2 border border-slate-700" rowspan="2">Rekomendasi Deskripsi</th>
                        </tr>
                        <tr>
                            <th class="p-1 border border-slate-700 text-center w-11">UH 1</th>
                            <th class="p-1 border border-slate-700 text-center w-11">UH 2</th>
                            <th class="p-1 border border-slate-700 text-center w-11">UH 3</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800">
                        ${renderTableMapel(MAPEL_KOLOM_B)}
                    </tbody>
                </table>
            </div>

            <div class="pt-2">
                <p class="text-xs font-bold text-slate-200 mb-2 uppercase">Kelompok C : Kegiatan Ekstrakurikuler</p>
                <table class="w-full text-left text-xs text-slate-300 border-collapse">
                    <thead class="bg-slate-900 text-slate-400 uppercase">
                        <tr>
                            <th class="p-2 border border-slate-700 w-10 text-center">No</th>
                            <th class="p-2 border border-slate-700 w-48">Kegiatan Ekstrakurikuler</th>
                            <th class="p-2 border border-slate-700 w-24 text-center">Predikat</th>
                            <th class="p-2 border border-slate-700">Keterangan / Catatan Kegiatan</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800">
                        ${nilaiData.ekstra.map((e, idx) => `
                            <tr>
                                <td class="p-2 border border-slate-800 text-center">${idx + 1}</td>
                                <td class="p-2 border border-slate-800 font-medium text-white">
                                    <input type="text" id="ekstra-nama-${idx}" value="${e.nama}" class="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs">
                                </td>
                                <td class="p-2 border border-slate-800 text-center">
                                    <select id="ekstra-predikat-${idx}" class="px-2 py-1 bg-slate-900 border border-slate-700 rounded font-bold text-blue-400 text-xs">
                                        <option value="A" ${e.predikat === 'A' ? 'selected' : ''}>A (Sangat Baik)</option>
                                        <option value="B" ${e.predikat === 'B' ? 'selected' : ''}>B (Baik)</option>
                                        <option value="C" ${e.predikat === 'C' ? 'selected' : ''}>C (Cukup)</option>
                                        <option value="D" ${e.predikat === 'D' ? 'selected' : ''}>D (Kurang)</option>
                                    </select>
                                </td>
                                <td class="p-2 border border-slate-800">
                                    <input type="text" id="ekstra-ket-${idx}" value="${e.ket}" class="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300">
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="pt-2">
                <p class="text-xs font-bold text-slate-200 mb-2 uppercase">Ketidakhadiran (Absensi)</p>
                <div class="grid grid-cols-3 gap-4 max-w-md bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <div>
                        <label class="block text-slate-400 mb-1">Sakit (Hari)</label>
                        <input type="number" id="abs-sakit" value="${nilaiData.absensi.sakit}" min="0" class="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-white font-bold">
                    </div>
                    <div>
                        <label class="block text-slate-400 mb-1">Izin (Hari)</label>
                        <input type="number" id="abs-izin" value="${nilaiData.absensi.izin}" min="0" class="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-white font-bold">
                    </div>
                    <div>
                        <label class="block text-slate-400 mb-1">Tanpa Keterangan</label>
                        <input type="number" id="abs-alpa" value="${nilaiData.absensi.alpa}" min="0" class="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-white font-bold">
                    </div>
                </div>
            </div>

            <div class="pt-2">
                <p class="text-xs font-bold text-slate-200 mb-2 uppercase">Catatan Wali Kelas / Guru</p>
                <textarea id="catatan-guru" rows="3" class="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:border-blue-500">${nilaiData.catatan}</textarea>
            </div>

            ${isGenap ? `
                <div class="pt-2">
                    <p class="text-xs font-bold text-amber-400 mb-2 uppercase">Keputusan Akhir Tahun Ajaran</p>
                    <div class="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-4">
                        <span class="text-xs font-semibold text-slate-200">Berdasarkan pencapaian seluruh kompetensi, peserta didik dinyatakan:</span>
                        <select id="keputusan-sekolah" class="px-4 py-2 bg-slate-900 border border-amber-500 rounded-xl text-amber-300 font-extrabold text-xs">
                            <option value="Naik Kelas" ${nilaiData.keputusan === 'Naik Kelas' ? 'selected' : ''}>NAIK KELAS</option>
                            <option value="Tinggal Kelas" ${nilaiData.keputusan === 'Tinggal Kelas' ? 'selected' : ''}>TINGGAL KELAS</option>
                            <option value="Lulus" ${nilaiData.keputusan === 'Lulus' ? 'selected' : ''}>LULUS (Khusus Kelas IX)</option>
                        </select>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function saveRaporNilai() {
    if (!db) return;
    if (!db.siswa) db.siswa = [];

    const targetSiswaList = currentUserRole === 'wali' 
        ? db.siswa.filter(s => s.kelas === currentWaliKelas)
        : db.siswa;

    const siswa = targetSiswaList[currentSiswaIndex] || targetSiswaList[0];
    if (!siswa) return;

    if (!db.nilai) db.nilai = [];
    let nilaiObj = db.nilai.find(n => n.nisn === siswa.nisn);
    if (!nilaiObj) {
        nilaiObj = { nisn: siswa.nisn, mapel: {}, ekstra: [], absensi: {}, catatan: '', keputusan: 'Naik Kelas' };
        db.nilai.push(nilaiObj);
    }

    if (!nilaiObj.mapel) nilaiObj.mapel = {};

    const targetMapel = [...MAPEL_KOLOM_A, ...MAPEL_KOLOM_B];

    targetMapel.forEach(m => {
        const parseVal = (id) => {
            const el = document.getElementById(id);
            if (!el || el.value === '' || isNaN(el.value)) return '';
            return parseFloat(el.value);
        };

        const uh1 = parseVal(`input-uh1-${m}`);
        const uh2 = parseVal(`input-uh2-${m}`);
        const uh3 = parseVal(`input-uh3-${m}`);
        const uts = parseVal(`input-uts-${m}`);
        const uas = parseVal(`input-uas-${m}`);

        const avgEl = document.getElementById(`input-nilai-${m}`);
        const avgVal = (avgEl && avgEl.value !== '') ? parseFloat(avgEl.value) : '';

        nilaiObj.mapel[m] = {
            kkm: 70,
            uh1: uh1,
            uh2: uh2,
            uh3: uh3,
            uts: uts,
            uas: uas,
            nilai: avgVal
        };
    });

    nilaiObj.ekstra = [0, 1, 2].map(idx => ({
        nama: document.getElementById(`ekstra-nama-${idx}`)?.value || '',
        predikat: document.getElementById(`ekstra-predikat-${idx}`)?.value || 'A',
        ket: document.getElementById(`ekstra-ket-${idx}`)?.value || ''
    }));

    nilaiObj.absensi = {
        sakit: document.getElementById('abs-sakit')?.value || '0',
        izin: document.getElementById('abs-izin')?.value || '0',
        alpa: document.getElementById('abs-alpa')?.value || '0'
    };

    nilaiObj.catatan = document.getElementById('catatan-guru')?.value || '';
    const kepEl = document.getElementById('keputusan-sekolah');
    if (kepEl) nilaiObj.keputusan = kepEl.value;

    saveDB();
    alert(`Nilai Rapor siswa ${siswa.nama} berhasil disimpan!`);
    renderView();
}

function resetRaporNilai() {
    if (!db || !db.siswa) return;

    const targetSiswaList = currentUserRole === 'wali' 
        ? db.siswa.filter(s => s.kelas === currentWaliKelas)
        : db.siswa;

    const siswa = targetSiswaList[currentSiswaIndex];
    if (!siswa) return;

    if (confirm("Reset seluruh data nilai untuk siswa ini?")) {
        if (db.nilai) {
            const idx = db.nilai.findIndex(n => n.nisn === siswa.nisn);
            if (idx !== -1) {
                db.nilai.splice(idx, 1);
                saveDB();
                renderView();
            }
        }
    }
}

function deleteRaporNilai() {
    resetRaporNilai();
}

function printRaporF4() {
    if (currentUserRole === 'wali') {
        alert("Pencetakan Rapor dialokasikan khusus untuk Akun Admin Sekolah.");
        return;
    }
    if (!db || !db.siswa) return;

    const siswa = db.siswa[currentSiswaIndex] || db.siswa[0];
    if (!siswa) {
        alert("Data siswa belum tersedia.");
        return;
    }

    const wali = db.wali.find(w => w.kelas === siswa.kelas) || { nama: '................', nip: '................' };
    const nilaiObj = (db.nilai && db.nilai.find(n => n.nisn === siswa.nisn)) || { mapel: {}, ekstra: [], absensi: {}, catatan: '', keputusan: 'Naik Kelas' };
    const isGenap = db.sekolah.semester.includes('2') || db.sekolah.semester.toLowerCase().includes('genap');

    const printWin = window.open('', '_blank');
    printWin.document.write(`
        <html>
        <head>
            <title>Rapor ${siswa.nama} - Kelas ${siswa.kelas}</title>
            <style>
                @page { size: 215mm 330mm; margin: 12mm 15mm; }
                body { font-family: 'Times New Roman', serif; font-size: 10pt; line-height: 1.3; color: #000; }
                .kop-table { width: 100%; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
                .bio-table { width: 100%; margin-bottom: 10px; font-size: 9.5pt; }
                .bio-table td { padding: 2px 4px; vertical-align: top; }
                table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                table.data-table th, table.data-table td { border: 1px solid #000; padding: 4px 6px; font-size: 9pt; }
                table.data-table th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
                .title-sec { font-weight: bold; font-size: 10pt; margin-top: 8px; margin-bottom: 4px; text-transform: uppercase; }
                .box-catatan { border: 1px solid #000; padding: 8px; min-height: 45px; font-size: 9.5pt; margin-bottom: 10px; }
                .ttd-grid { width: 100%; margin-top: 15px; text-align: center; font-size: 9.5pt; page-break-inside: avoid; }
                .ttd-grid td { vertical-align: top; }
            </style>
        </head>
        <body onload="window.print()">
            <table class="kop-table">
                <tr>
                    <td width="15%" text-align="center">
                        <img src="${db.sekolah.logoUrl || 'assets/img/logo-tutwuri.png'}" style="height: 60px; width: auto;" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_Tut_Wuri_Handayani.png'">
                    </td>
                    <td text-align="center" style="text-align: center;">
                        <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">${db.sekolah.pemerintahYayasan}</div>
                        <div style="font-size: 14pt; font-weight: bold; text-transform: uppercase;">${db.sekolah.namaSekolah}</div>
                        <div style="font-size: 9pt;">${db.sekolah.alamat} | Kode Pos: ${db.sekolah.kodePosTelp}</div>
                    </td>
                    <td width="15%"></td>
                </tr>
            </table>

            <div style="text-align: center; font-weight: bold; font-size: 11pt; text-transform: uppercase; margin-bottom: 8px;">
                LAPORAN HASIL PENCAPAIAN KOMPETENSI PESERTA DIDIK SMP
            </div>

            <table class="bio-table">
                <tr>
                    <td width="18%">Nama Peserta Didik</td><td width="2%">:</td><td width="40%" style="font-weight:bold;">${siswa.nama}</td>
                    <td width="15%">Kelas</td><td width="2%">:</td><td width="23%">Kelas ${siswa.kelas}</td>
                </tr>
                <tr>
                    <td>NIS / NISN</td><td>:</td><td>${siswa.nis} / ${siswa.nisn}</td>
                    <td>Semester</td><td>:</td><td>${db.sekolah.semester}</td>
                </tr>
                <tr>
                    <td>Nama Sekolah</td><td>:</td><td>${db.sekolah.namaSekolah}</td>
                    <td>Tahun Ajaran</td><td>:</td><td>${db.sekolah.tahunAjaran}</td>
                </tr>
            </table>

            <div class="title-sec">KELOMPOK A (MATA PELAJARAN UTAMA)</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th width="5%">No</th>
                        <th width="32%">Mata Pelajaran</th>
                        <th width="8%">Nilai</th>
                        <th width="8%">Predik</th>
                        <th>Capaian Kompetensi & Rekomendasi Deskripsi</th>
                    </tr>
                </thead>
                <tbody>
                    ${MAPEL_KOLOM_A.map((m, i) => {
                        const valObj = (nilaiObj.mapel && nilaiObj.mapel[m]) ? nilaiObj.mapel[m] : { nilai: '' };
                        const d = getNilaiDetails(valObj.nilai);
                        return `
                            <tr>
                                <td style="text-align:center;">${i + 1}</td>
                                <td>${m}</td>
                                <td style="text-align:center; font-weight:bold;">${valObj.nilai !== undefined ? valObj.nilai : '-'}</td>
                                <td style="text-align:center; font-weight:bold;">${d.predikat}</td>
                                <td><strong>${d.capaian}</strong>${d.rekomendasi}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>

            <div class="title-sec">KELOMPOK B (MUATAN LOKAL & KETERAMPILAN)</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th width="5%">No</th>
                        <th width="32%">Mata Pelajaran</th>
                        <th width="8%">Nilai</th>
                        <th width="8%">Predik</th>
                        <th>Capaian Kompetensi & Rekomendasi Deskripsi</th>
                    </tr>
                </thead>
                <tbody>
                    ${MAPEL_KOLOM_B.map((m, i) => {
                        const valObj = (nilaiObj.mapel && nilaiObj.mapel[m]) ? nilaiObj.mapel[m] : { nilai: '' };
                        const d = getNilaiDetails(valObj.nilai);
                        return `
                            <tr>
                                <td style="text-align:center;">${i + 1}</td>
                                <td>${m}</td>
                                <td style="text-align:center; font-weight:bold;">${valObj.nilai !== undefined ? valObj.nilai : '-'}</td>
                                <td style="text-align:center; font-weight:bold;">${d.predikat}</td>
                                <td><strong>${d.capaian}</strong>${d.rekomendasi}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>

            <div class="title-sec">KELOMPOK C (KEGIATAN EKSTRAKURIKULER)</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th width="5%">No</th>
                        <th width="35%">Kegiatan Ekstrakurikuler</th>
                        <th width="12%">Predikat</th>
                        <th>Keterangan / Catatan Kegiatan</th>
                    </tr>
                </thead>
                <tbody>
                    ${(nilaiObj.ekstra || []).map((e, i) => `
                        <tr>
                            <td style="text-align:center;">${i + 1}</td>
                            <td>${e.nama || '-'}</td>
                            <td style="text-align:center; font-weight:bold;">${e.predikat || '-'}</td>
                            <td>${e.ket || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div style="display: flex; gap: 10px; width: 100%;">
                <div style="width: 40%;">
                    <div class="title-sec">KETIDAKHADIRAN (ABSENSI)</div>
                    <table class="data-table">
                        <tr><td>Sakit</td><td style="text-align:center; font-weight:bold;">${nilaiObj.absensi?.sakit || 0} hari</td></tr>
                        <tr><td>Izin</td><td style="text-align:center; font-weight:bold;">${nilaiObj.absensi?.izin || 0} hari</td></tr>
                        <tr><td>Tanpa Keterangan</td><td style="text-align:center; font-weight:bold;">${nilaiObj.absensi?.alpa || 0} hari</td></tr>
                    </table>
                </div>
                <div style="width: 60%;">
                    <div class="title-sec">CATATAN WALI KELAS</div>
                    <div class="box-catatan">
                        ${nilaiObj.catatan || 'Tingkatkan terus prestasi belajar dan semangat belajarmu.'}
                    </div>
                </div>
            </div>

            ${isGenap ? `
                <div style="border: 1px solid #000; padding: 6px; font-weight: bold; text-align: center; margin-top: 5px; font-size: 10pt; background-color: #f9f9f9;">
                    KEPUTUSAN: Berdasarkan pencapaian hasil belajar, peserta didik dinyatakan <span style="text-decoration: underline; text-transform: uppercase;">${nilaiObj.keputusan || 'NAIK KELAS'}</span>.
                </div>
            ` : ''}

            <table class="ttd-grid">
                <tr>
                    <td style="width: ${isGenap ? '33%' : '50%'};">
                        Mengetahui,<br>Orang Tua / Wali Peserta Didik
                        <br><br><br><br>
                        <strong>( ..................................... )</strong>
                    </td>
                    <td style="width: ${isGenap ? '33%' : '50%'};">
                        ${!isGenap ? `${db.sekolah.tempatTanggalCetak}<br>` : '<br>'}Wali Kelas ${siswa.kelas}
                        <br><br><br><br>
                        <strong><u>${wali.nama}</u></strong><br>
                        NIP. ${wali.nip}
                    </td>
                    ${isGenap ? `
                    <td style="width: 33%;">
                        ${db.sekolah.tempatTanggalCetak}<br>Kepala Sekolah
                        <br><br><br><br>
                        <strong><u>${db.sekolah.kepsekNama}</u></strong><br>
                        NIP. ${db.sekolah.kepsekNip}
                    </td>
                    ` : ''}
                </tr>
            </table>
        </body>
        </html>
    `);
    printWin.document.close();
}

function backupJSON() {
    if (currentUserRole === 'wali') {
        alert("Pencadangan data penuh dialokasikan khusus untuk Akun Admin Sekolah.");
        return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `BACKUP_RAPOR_SMP_${currentNpsn}_${new Date().toISOString().slice(0,10)}.json`);
    dlAnchorElem.click();
}

function restoreJSON(e) {
    if (currentUserRole === 'wali') {
        alert("Pemulihan data dialokasikan khusus untuk Akun Admin Sekolah.");
        return;
    }
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const data = JSON.parse(evt.target.result);
            if (data.sekolah) {
                db = data;
                if (!db.siswa) db.siswa = [];
                if (!db.nilai) db.nilai = [];
                saveDB();
                alert("Data Rapor SMP berhasil dipulihkan secara penuh!");
                location.reload();
            } else {
                alert("Format file backup JSON tidak valid!");
            }
        } catch (err) {
            alert("Gagal membaca file JSON!");
        }
    };
    reader.readAsText(file);
}

function prosesKenaikanKelasMasal() {
    if (currentUserRole === 'wali') {
        alert("Proses Kenaikan Kelas Masal hanya dapat dilakukan oleh Admin Sekolah.");
        return;
    }
    if (!db || !db.siswa || db.siswa.length === 0) {
        alert("Tidak ada data siswa untuk diproses!");
        return;
    }

    const konfirmasi = confirm(
        "Apakah Anda yakin ingin memproses Kenaikan Kelas Masal untuk Tahun Ajaran Baru?\n\n" +
        "1. Sistem akan otomatis mengunduh file Backup JSON sebagai arsip.\n" +
        "2. Siswa Kelas VII & VIII akan dinaikkan 1 tingkat.\n" +
        "3. Siswa Kelas IX akan dinyatakan LULUS & dikeluarkan dari daftar aktif.\n" +
        "4. Data nilai lama akan di-reset untuk tahun ajaran baru."
    );

    if (!konfirmasi) return;

    backupJSON();

    const mapKenaikan = {
        'VII': 'VIII',
        'VIII': 'IX'
    };

    let jumlahNaik = 0;
    let jumlahLulus = 0;
    const siswaAktifBaru = [];

    db.siswa.forEach(siswa => {
        if (siswa.kelas === 'IX') {
            jumlahLulus++;
        } else if (mapKenaikan[siswa.kelas]) {
            siswa.kelas = mapKenaikan[siswa.kelas];
            siswaAktifBaru.push(siswa);
            jumlahNaik++;
        } else {
            siswaAktifBaru.push(siswa);
        }
    });

    db.siswa = siswaAktifBaru;
    db.nilai = [];

    if (db.sekolah && db.sekolah.tahunAjaran) {
        const parts = db.sekolah.tahunAjaran.split('/');
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            const thnAwal = parseInt(parts[0]) + 1;
            const thnAkhir = parseInt(parts[1]) + 1;
            db.sekolah.tahunAjaran = `${thnAwal}/${thnAkhir}`;
        }
    }
    
    if (db.sekolah) {
        db.sekolah.semester = '1 (Ganjil)';
    }

    saveDB();

    alert(
        `Proses Kenaikan Kelas Berhasil Diproses!\n\n` +
        `• Siswa Naik Kelas: ${jumlahNaik} Siswa\n` +
        `• Siswa Lulus (Kelas IX): ${jumlahLulus} Siswa\n` +
        `• Tahun Ajaran Diperbarui: ${db.sekolah.tahunAjaran} - ${db.sekolah.semester}\n\n` +
        `File cadangan JSON riwayat lama telah berhasil diunduh.`
    );

    renderView();
}

// === FUNGSI EKSPOR & IMPOR CSV BIODATA SISWA KOLEKTIF ===

function downloadFormBiodataCSV() {
    const headers = [
        "Nama Lengkap", "Kelas (VII/VIII/IX)", "NIS", "NISN", "Tempat Tanggal Lahir", 
        "Jenis Kelamin (Laki-Laki/Perempuan)", "Agama", "Status Keluarga", "Anak Ke", 
        "Alamat Siswa", "Telepon", "Sekolah Asal", "Diterima di Kelas", "Diterima Tanggal", 
        "Nama Ayah", "Nama Ibu", "Alamat Orang Tua", "Pekerjaan Ayah", "Pekerjaan Ibu", 
        "Nama Wali", "Alamat Wali", "Pekerjaan Wali"
    ];
    const sample = [
        "Siti Rahma", "VII", "2024003", "0123456791", "Soe 15 Mei 2012", 
        "Perempuan", "Islam", "Anak Kandung", "1", "Jl. Diponegoro No. 5", 
        "081234567892", "SD Negeri 1 Soe", "VII", "15 Juli 2024", "Ahmad Hidayat", 
        "Nurhasanah", "Jl. Diponegoro No. 5", "PNS", "Wiraswasta", "-", "-", "-"
    ];
    
    let csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), sample.join(",")].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "TEMPLATE_BIODATA_SISWA_SMP.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function uploadFormBiodataCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!db) return;
    if (!db.siswa) db.siswa = [];

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split("\n");
        if (lines.length <= 1) {
            alert("File CSV kosong!");
            return;
        }

        let addedCount = 0;
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const row = lines[i].split(",").map(item => item.trim().replace(/^"|"$/g, ''));
            if (row.length >= 4 && row[0]) {
                const siswaObj = {
                    noUrut: db.siswa.length + 1,
                    nama: row[0],
                    kelas: row[1] || 'VII',
                    nis: row[2] || '',
                    nisn: row[3] || '',
                    ttl: row[4] || '-',
                    jk: row[5] || 'Laki-Laki',
                    agama: row[6] || '-',
                    statusKeluarga: row[7] || 'Anak Kandung',
                    anakKe: row[8] || '1',
                    alamat: row[9] || '-',
                    telp: row[10] || '-',
                    sekolahAsal: row[11] || '-',
                    diterimaKelas: row[12] || 'VII',
                    diterimaTanggal: row[13] || '-',
                    ayah: row[14] || '-',
                    ibu: row[15] || '-',
                    alamatOrangTua: row[16] || '-',
                    pekerjaanAyah: row[17] || '-',
                    pekerjaanIbu: row[18] || '-',
                    namaWali: row[19] || '-',
                    alamatWali: row[20] || '-',
                    pekerjaanWali: row[21] || '-'
                };
                db.siswa.push(siswaObj);
                addedCount++;
            }
        }

        saveDB();
        alert(`Berhasil mengimpor ${addedCount} data siswa baru!`);
        renderView();
    };
    reader.readAsText(file);
}

// === FUNGSI CETAK SAMPUL RAPOR (F4) ===

function printSampulF4() {
    if (!db || !db.siswa || db.siswa.length === 0) {
        alert("Data siswa belum tersedia untuk dicetak!");
        return;
    }
    const namaSiswa = document.getElementById('sampul-nama-siswa')?.innerText || 'Siswa';
    const printWin = window.open('', '_blank');
    const content = document.getElementById('cover-printable')?.outerHTML || '';
    
    printWin.document.write(`
        <html>
        <head>
            <title>Sampul Rapor SMP - ${namaSiswa}</title>
            <style>
                @page { size: 215mm 330mm; margin: 15mm; }
                body { font-family: 'Times New Roman', serif; color: #000; margin: 0; padding: 0; background: #fff; }
                .printable-sheet { width: 100%; height: 100%; text-align: center; display: flex; flex-direction: column; justify-content: space-between; border: none !important; box-shadow: none !important; }
            </style>
        </head>
        <body onload="window.print()">
            ${content}
        </body>
        </html>
    `);
    printWin.document.close();
}

// === FUNGSI EKSPOR & IMPOR CSV FORM NILAI KOLEKTIF ===

function downloadFormNilaiCSV() {
    if (!db || !db.siswa || db.siswa.length === 0) {
        alert("Belum ada data siswa untuk diunduh form nilainya!");
        return;
    }

    const mapelHeaders = [...MAPEL_KOLOM_A, ...MAPEL_KOLOM_B];
    const subHeaders = [];
    mapelHeaders.forEach(m => {
        subHeaders.push(`${m} (UH1)`, `${m} (UH2)`, `${m} (UH3)`, `${m} (UTS)`, `${m} (UAS)`);
    });

    const headerLine = ["NISN", "Nama Siswa", "Kelas", ...subHeaders].join(",");
    
    const rows = db.siswa.map(s => {
        const nilaiObj = db.nilai ? db.nilai.find(n => n.nisn === s.nisn) : null;
        const mapelVals = [];
        
        mapelHeaders.forEach(m => {
            const item = (nilaiObj && nilaiObj.mapel && nilaiObj.mapel[m]) ? nilaiObj.mapel[m] : { uh1: '', uh2: '', uh3: '', uts: '', uas: '' };
            mapelVals.push(item.uh1 ?? '', item.uh2 ?? '', item.uh3 ?? '', item.uts ?? '', item.uas ?? '');
        });

        return `"${s.nisn}","${s.nama}","${s.kelas}",` + mapelVals.join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headerLine, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FORM_NILAI_SMP_${db.sekolah.npsn}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function uploadFormNilaiCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!db) return;
    if (!db.nilai) db.nilai = [];

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split("\n");
        if (lines.length <= 1) {
            alert("File CSV kosong!");
            return;
        }

        const mapelHeaders = [...MAPEL_KOLOM_A, ...MAPEL_KOLOM_B];
        let updatedCount = 0;

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const row = lines[i].split(",").map(item => item.trim().replace(/^"|"$/g, ''));
            const nisn = row[0];

            if (nisn) {
                let nilaiObj = db.nilai.find(n => n.nisn === nisn);
                if (!nilaiObj) {
                    nilaiObj = { nisn: nisn, mapel: {}, ekstra: [], absensi: { sakit: '0', izin: '0', alpa: '0' }, catatan: '', keputusan: 'Naik Kelas' };
                    db.nilai.push(nilaiObj);
                }
                if (!nilaiObj.mapel) nilaiObj.mapel = {};

                let colIdx = 3;
                mapelHeaders.forEach(m => {
                    const parseVal = (v) => (v === '' || isNaN(v)) ? '' : parseFloat(v);
                    const uh1 = parseVal(row[colIdx]);
                    const uh2 = parseVal(row[colIdx + 1]);
                    const uh3 = parseVal(row[colIdx + 2]);
                    const uts = parseVal(row[colIdx + 3]);
                    const uas = parseVal(row[colIdx + 4]);

                    const validVals = [uh1, uh2, uh3, uts, uas].filter(v => v !== '');
                    let avgVal = '';
                    if (validVals.length > 0) {
                        const sum = validVals.reduce((a, b) => a + b, 0);
                        avgVal = Math.round(sum / validVals.length);
                    }

                    nilaiObj.mapel[m] = { kkm: 70, uh1, uh2, uh3, uts, uas, nilai: avgVal };
                    colIdx += 5;
                });
                updatedCount++;
            }
        }

        saveDB();
        alert(`Berhasil memperbarui nilai dari CSV untuk ${updatedCount} siswa!`);
        renderView();
    };
    reader.readAsText(file);
}
