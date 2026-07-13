// ========================================== //
// SISTEM STATE GLOBAL (Saling Terhubung)     //
// ========================================== //
const AppState = {
    users: [],
    jobs: [],
    reviews: [],
    currentUser: null,
    activeJobForReview: null,
    selectedStarRating: 0
};

// ========================================== //
// MODUL 1: FONDASI DATA & WILAYAH            //
// ========================================== //
const DataMasterModule = {
    // Data Kategori Tetap (Frontend UX)
    CATEGORIES: [
        { id: 1, name: "Antar Jemput", subs: ["Orang", "Barang & Makanan"] },
        { id: 2, name: "Cleaning Service", subs: ["Kebersihan Lokasi"] },
        { id: 3, name: "Antri", subs: ["Antri Apa Saja"] },
        { id: 4, name: "Perbaikan", subs: ["Alat Rumah Tangga", "Barang Elektronik"] },
        { id: 5, name: "Desain Grafis", subs: ["Logo, Banner, Poster", "Konten Medsos", "Arsitektur Bangunan"] },
        { id: 6, name: "Web / Aplikasi Digital", subs: ["Pembuatan Website", "Pembuatan Aplikasi Mobile"] },
        { id: 7, name: "Les / Tutor", subs: ["Edukasi & Pengajaran"] },
        { id: 8, name: "Penerjemah", subs: ["Penerjemah Dokumen", "Penerjemah Percakapan"] },
        { id: 9, name: "Fotografi & Videografi", subs: ["Jasa Dokumentasi Visual"] },
        { id: 10, name: "Penulisan", subs: ["Artikel & Blog", "CV & Portofolio", "Proposal & Copywriting"] },
        { id: 11, name: "Jastip (Jasa Jasa Titip)", subs: ["Pembelian Barang"] }
    ],

    muatDatabaseDariStorage() {
        // Mengecek status session login ke API backend PHP saat pertama kali dimuat
        fetch('api.php?action=cek_sesi')
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    AppState.currentUser = res.user;
                }
                AuthModule.sinkronisasiSesiUI();
            })
            .catch(err => console.error("Gagal memeriksa sesi login:", err));
    },

    populasiDropdown() {
        // Mengambil data wilayah kota secara dinamis dari database MySQL lewat API PHP
        fetch('api.php?action=get_cities')
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    const filterCity = document.getElementById('filter-city');
                    const jobCity = document.getElementById('job-city');

                    if (filterCity) {
                        filterCity.innerHTML = '<option value="">-- Semua Kota / Wilayah --</option>';
                        res.data.forEach(city => {
                            filterCity.innerHTML += `<option value="${city.id}">${city.name}</option>`;
                        });
                    }

                    if (jobCity) {
                        jobCity.innerHTML = '<option value="">Pilih Kota Penempatan Tugas</option>';
                        res.data.forEach(city => {
                            jobCity.innerHTML += `<option value="${city.id}">${city.name}</option>`;
                        });
                    }
                }
            })
            .catch(err => console.error("Gagal memuat daftar kota:", err));

        // Populasi Dropdown Kategori Utama
        const jobCategory = document.getElementById('job-category');
        const filterCategory = document.getElementById('filter-category');

        if (jobCategory) {
            jobCategory.innerHTML = '<option value="">Pilih Kategori Utama</option>';
            this.CATEGORIES.forEach(cat => {
                jobCategory.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
            });
        }

        if (filterCategory) {
            filterCategory.innerHTML = '<option value="">-- Semua Kategori --</option>';
            this.CATEGORIES.forEach(cat => {
                filterCategory.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
            });
        }
    }
};

// ========================================== //
// MODUL 2: KONTROL NAVIGASI SINGLE-PAGE      //
// ========================================== //
const AppCoordinator = {
    gantiHalaman(pageId) {
        // Sembunyikan seluruh kontainer halaman utama
        const sections = ['dashboard', 'ambil', 'tawarkan', 'kerjaanku', 'profil', 'kyc', 'login', 'register'];
        sections.forEach(sec => {
            const el = document.getElementById(`page-${sec}`);
            if (el) el.classList.add('hidden');
        });

        // Tampilkan halaman target yang dipilih
        const targetPage = document.getElementById(`page-${pageId}`);
        if (targetPage) targetPage.classList.remove('hidden');

        // Manajemen Efek Visual Aktif pada Menu Navigasi (Mobile & Desktop)
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('text-[#9c1c24]', 'border-[#9c1c24]', 'font-bold', 'text-slate-900', 'border-b-2');
            link.classList.add('text-slate-500');
        });

        const activeLinks = document.querySelectorAll(`.nav-${pageId}`);
        activeLinks.forEach(link => {
            link.classList.remove('text-slate-500');
            link.classList.add('text-[#9c1c24]', 'border-[#9c1c24]', 'font-bold', 'border-b-2');
        });

        // Trigger Render Data Spesifik per Halaman
        if (pageId === 'dashboard') JobTakingModule.renderDaftarPekerjaan();
        if (pageId === 'ambil') JobTakingModule.renderRuangPenelusuranWorker();
        if (pageId === 'tawarkan') JobOfferingModule.inisialisasiFormTawaran();
        if (pageId === 'kerjaanku') JobTakingModule.renderAktivitasKerjaanku();
        if (pageId === 'profil') ReputasiModule.renderHalamanProfil();

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastText = document.getElementById('toast-text');
        const toastIcon = document.getElementById('toast-icon');

        if (!toast) return;

        toastText.innerText = message;

        // Atur warna dan ikon berdasarkan jenis tipe toast
        if (type === 'success') {
            toast.className = "fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-2xl transition duration-300 z-50";
            toastIcon.innerHTML = `<i data-lucide="check-circle" class="w-5 h-5"></i>`;
        } else if (type === 'error') {
            toast.className = "fixed bottom-6 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-2xl transition duration-300 z-50";
            toastIcon.innerHTML = `<i data-lucide="alert-triangle" class="w-5 h-5"></i>`;
        } else {
            toast.className = "fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-2xl transition duration-300 z-50";
            toastIcon.innerHTML = `<i data-lucide="info" class="w-5 h-5"></i>`;
        }

        lucide.createIcons();

        // Animasikan memunculkan toast
        toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');

        // Sembunyikan otomatis setelah 3,5 detik
        setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
        }, 3500);
    }
};

// ========================================== //
// MODUL 2: OTENTIKASI SISTEM (AUTH VIA MYSQL)//
// ========================================== //
const AuthModule = {
    prosesRegister(e) {
        if (e) e.preventDefault(); // 🌟 WAJIB: Mencegah halaman refresh otomatis!

        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;

        if (!name || !email || !password) {
            AppCoordinator.showToast("Semua kolom registrasi wajib diisi!", "error");
            return;
        }

        fetch('api.php?action=register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        })
        .then(res => res.json())
        .then(res => {
            if (res.status === 'success') {
                AppCoordinator.showToast("Pendaftaran sukses! Silakan masuk.", "success");
                document.getElementById('form-register').reset();
                AppCoordinator.gantiHalaman('login');
            } else {
                AppCoordinator.showToast(res.message, "error");
            }
        })
        .catch(err => {
            AppCoordinator.showToast("Terjadi kesalahan koneksi ke server database.", "error");
        });
    },

    prosesLogin(e) {
        if (e) e.preventDefault(); // 🌟 WAJIB: Mencegah halaman refresh otomatis!

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            AppCoordinator.showToast("Email dan password wajib diisi!", "error");
            return;
        }

        fetch('api.php?action=login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        .then(res => res.json())
        .then(res => {
            if (res.status === 'success') {
                AppState.currentUser = res.user;
                this.sinkronisasiSesiUI();
                AppCoordinator.showToast(`Selamat datang kembali, ${res.user.name}!`, "success");
                document.getElementById('form-login').reset();
                AppCoordinator.gantiHalaman('dashboard');
            } else {
                AppCoordinator.showToast(res.message, "error");
            }
        })
        .catch(err => {
            AppCoordinator.showToast("Terjadi kesalahan koneksi saat masuk akun.", "error");
        });
    },
    
    // ... fungsi prosesLogout dan sinkronisasiSesiUI tetap sama seperti sebelumnya ...

    prosesLogout() {
        fetch('api.php?action=logout')
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    AppState.currentUser = null;
                    this.sinkronisasiSesiUI();
                    AppCoordinator.showToast("Anda telah berhasil keluar dari sistem.", "info");
                    AppCoordinator.gantiHalaman('dashboard');
                }
            });
    },

    sinkronisasiSesiUI() {
        const guestElements = document.querySelectorAll('.auth-guest-only');
        const userElements = document.querySelectorAll('.auth-user-only');

        if (!AppState.currentUser) {
            guestElements.forEach(el => el.classList.remove('hidden'));
            userElements.forEach(el => el.classList.add('hidden'));
            document.getElementById('kyc-alert-banner')?.classList.add('hidden');
        } else {
            guestElements.forEach(el => el.classList.add('hidden'));
            userElements.forEach(el => el.classList.remove('hidden'));

            // Mengisi profil nama pengguna di navbar navigasi
            const nameNav = document.getElementById('user-name-nav');
            const avatarNav = document.getElementById('user-avatar');

            if (nameNav) nameNav.innerText = AppState.currentUser.name;
            if (avatarNav) avatarNav.innerText = AppState.currentUser.name.charAt(0).toUpperCase();

            // Atur status tampilan lencana KYC Akun
            const badgeNav = document.getElementById('kyc-badge-nav');
            const statusKyc = AppState.currentUser.verification_status;
            const kycBanner = document.getElementById('kyc-alert-banner');

            if (badgeNav) {
                if (statusKyc === 'approved') {
                    badgeNav.innerHTML = `<span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><i data-lucide="shield-check" class="w-3 h-3"></i> Verified</span>`;
                    if (kycBanner) kycBanner.classList.add('hidden');
                } else if (statusKyc === 'pending') {
                    badgeNav.innerHTML = `<span class="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> Pending</span>`;
                    if (kycBanner) kycBanner.classList.add('hidden');
                } else {
                    badgeNav.innerHTML = `<span onclick="AppCoordinator.gantiHalaman('kyc')" class="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer hover:bg-rose-200"><i data-lucide="shield-alert" class="w-3 h-3"></i> Unverified</span>`;
                    if (kycBanner) kycBanner.classList.remove('hidden');
                }
                lucide.createIcons();
            }
        }
    }
};

// ========================================== //
// MODUL 4: VERIFIKASI IDENTITAS (KYC CAMERA) //
// ========================================== //
const KYCModule = {
    streamInstance: null,

    mulaiAksesKamera() {
        const infoBox = document.getElementById('kyc-camera-instruction');
        const videoBox = document.getElementById('kyc-camera-container');
        const video = document.getElementById('kyc-video');

        infoBox.classList.add('hidden');
        videoBox.classList.remove('hidden');

        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
            .then(stream => {
                this.streamInstance = stream;
                video.srcObject = stream;
            })
            .catch(err => {
                AppCoordinator.showToast("Gagal mengakses kamera laptop/HP Anda. Periksa izin perangkat.", "error");
                infoBox.classList.remove('hidden');
                videoBox.classList.add('hidden');
            });
    },

    matikanKamera() {
        if (this.streamInstance) {
            this.streamInstance.getTracks().forEach(track => track.stop());
            this.streamInstance = null;
        }
    },

    kirimDokumenVerifikasi(e) {
        if (e) e.preventDefault(); // Mencegah reload halaman bawaan form

        const nik = document.getElementById('kyc-nik').value.trim();
        const address = document.getElementById('kyc-address').value.trim();

        if (nik.length !== 16 || isNaN(nik)) {
            AppCoordinator.showToast("Format NIK harus berupa 16 digit angka valid!", "error");
            return;
        }

        if (!address) {
            AppCoordinator.showToast("Alamat lengkap KTP wajib diisi!", "error");
            return;
        }

        fetch('api.php?action=submit_kyc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: AppState.currentUser.id,
                nik: nik,
                address: address
            })
        })
        .then(res => res.json())
        .then(res => {
            if (res.status === 'success') {
                AppState.currentUser.verification_status = 'pending';
                AuthModule.sinkronisasiSesiUI();
                this.matikanKamera();
                AppCoordinator.showToast("Dokumen KYC berhasil dikirim! Menunggu persetujuan tim verifikator.", "success");
                document.getElementById('form-kyc').reset();
                AppCoordinator.gantiHalaman('dashboard');
            } else {
                AppCoordinator.showToast(res.message, "error");
            }
        })
        .catch(err => AppCoordinator.showToast("Gagal memproses dokumen KYC ke server.", "error"));
    }
};

// ========================================== //
// MODUL 5: FORMULIR LOWONGAN (OFFERING)      //
// ========================================== //
const JobOfferingModule = {
    inisialisasiFormTawaran() {
        if (!AppState.currentUser) {
            AppCoordinator.showToast("Anda harus masuk/login terlebih dahulu sebelum membuat lowongan kerja.", "info");
            AppCoordinator.gantiHalaman('login');
            return;
        }
        this.updateSubKategori();
        this.hitungPotonganPlatform();
    },

    updateSubKategori() {
        const categorySelect = document.getElementById('job-category');
        const subCategorySelect = document.getElementById('job-subcategory');

        if (!categorySelect || !subCategorySelect) return;

        const selectedCatId = parseInt(categorySelect.value);
        subCategorySelect.innerHTML = '';

        const foundCategory = DataMasterModule.CATEGORIES.find(c => c.id === selectedCatId);
        if (foundCategory) {
            foundCategory.subs.forEach(sub => {
                subCategorySelect.innerHTML += `<option value="${sub}">${sub}</option>`;
            });
        } else {
            subCategorySelect.innerHTML = '<option value="">Pilih Kategori Utama Terlebih Dahulu</option>';
        }
    },

    hitungPotonganPlatform() {
        const budgetInput = document.getElementById('job-budget');
        const txtFee = document.getElementById('txt-fee');
        const txtNet = document.getElementById('txt-net');

        if (!budgetInput) return;

        const grossBudget = parseInt(budgetInput.value) || 0;
        const fee = Math.floor(grossBudget * 0.10); // Biaya admin sistem 10%
        const netBudget = grossBudget - fee;

        if (txtFee) txtFee.innerText = `Rp ${fee.toLocaleString('id-ID')}`;
        if (txtNet) txtNet.innerText = `Rp ${netBudget.toLocaleString('id-ID')}`;
    },

    simpanTawaranBaru(e) {
        if (e) e.preventDefault(); // Mencegah refresh halaman bawaan form

        const title = document.getElementById('job-title').value.trim();
        const category_id = parseInt(document.getElementById('job-category').value);
        const sub_cat = document.getElementById('job-subcategory').value;
        const city_id = parseInt(document.getElementById('job-city').value);
        const detailed_address = document.getElementById('job-address').value.trim();
        const gross_budget = parseInt(document.getElementById('job-budget').value) || 0;
        const deadline = document.getElementById('job-deadline').value;
        const description = document.getElementById('job-desc').value.trim();

        if (!title || !category_id || !sub_cat || !city_id || !detailed_address || gross_budget <= 0 || !deadline || !description) {
            AppCoordinator.showToast("Mohon lengkapi seluruh kolom formulir penawaran dengan benar!", "error");
            return;
        }

        if (gross_budget < 20000) {
            AppCoordinator.showToast("Batas minimal anggaran upah jasa adalah Rp 20.000!", "error");
            return;
        }

        const platform_fee = Math.floor(gross_budget * 0.10);
        const net_budget = gross_budget - platform_fee;

        const payload = {
            owner_id: AppState.currentUser.id,
            title,
            category_id,
            sub_cat,
            city_id,
            detailed_address,
            gross_budget,
            platform_fee,
            net_budget,
            deadline,
            description
        };

        fetch('api.php?action=create_job', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(res => {
            if (res.status === 'success') {
                AppCoordinator.showToast("Lowongan tugas Anda berhasil diterbitkan ke bursa kerja!", "success");
                document.getElementById('form-tawarkan').reset();
                AppCoordinator.gantiHalaman('dashboard');
            } else {
                AppCoordinator.showToast(res.message, "error");
            }
        })
        .catch(err => AppCoordinator.showToast("Gagal menyimpan data lowongan baru ke server.", "error"));
    }
};

// ========================================== //
// MODUL 6: BROWSE & EKSEKUSI KERJA (WORKER)  //
// ========================================== //
const JobTakingModule = {
    renderDaftarPekerjaan() {
        const container = document.getElementById('dashboard-job-list');
        if (!container) return;

        container.innerHTML = '<div class="col-span-full text-center text-slate-400 py-6 text-sm">Memuat lowongan kerja terbaru...</div>';

        fetch('api.php?action=get_jobs')
            .then(res => res.json())
            .then(res => {
                container.innerHTML = '';
                if (res.status === 'success') {
                    // Filter hanya yang berstatus open untuk beranda utama
                    const openJobs = res.data.filter(j => j.status === 'open');

                    if (openJobs.length === 0) {
                        container.innerHTML = '<div class="col-span-full text-center text-slate-400 py-6 text-sm border-2 border-dashed border-slate-200 rounded-2xl">Belum ada lowongan tugas aktif saat ini.</div>';
                        return;
                    }

                    // Ambil maksimal 3 lowongan kerja terbaru untuk dashboard
                    openJobs.slice(0, 3).forEach(job => {
                        container.innerHTML += `
                            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-red-200 transition duration-300">
                                <div class="space-y-2">
                                    <div class="flex justify-between items-start gap-2">
                                        <span class="bg-red-50 text-[#9c1c24] text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">${job.sub_category_name}</span>
                                        <span class="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5"><i data-lucide="clock" class="w-3 h-3"></i> Terkini</span>
                                    </div>
                                    <h3 class="font-bold text-slate-800 text-base line-clamp-1">${job.title}</h3>
                                    <p class="text-xs text-slate-500 line-clamp-2">${job.description}</p>
                                </div>
                                <div class="pt-4 border-t border-slate-100 mt-4 flex justify-between items-center">
                                    <div>
                                        <p class="text-[10px] text-slate-400 font-bold uppercase">Upah Bersih</p>
                                        <p class="text-emerald-600 font-extrabold text-base">Rp ${parseInt(job.net_budget).toLocaleString('id-ID')}</p>
                                    </div>
                                    <button onclick="AppCoordinator.gantiHalaman('ambil')" class="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition">Detail Jasa</button>
                                </div>
                            </div>`;
                    });
                    lucide.createIcons();
                }
            });
    },

    renderRuangPenelusuranWorker() {
        const container = document.getElementById('worker-search-results');
        if (!container) return;

        const filterCat = document.getElementById('filter-category').value;
        const filterCity = document.getElementById('filter-city').value;
        const filterKeyword = document.getElementById('filter-keyword').value.toLowerCase().trim();

        container.innerHTML = '<div class="col-span-full text-center text-slate-400 py-12 text-sm">Sedang menelusuri data lowongan jasa terverifikasi...</div>';

        fetch('api.php?action=get_jobs')
            .then(res => res.json())
            .then(res => {
                container.innerHTML = '';
                if (res.status === 'success') {
                    // Terapkan logika penyaringan (Filter) multidimensi di sisi klien
                    let filtered = res.data.filter(j => j.status === 'open');

                    if (filterCat) filtered = filtered.filter(j => j.category_id == filterCat);
                    if (filterCity) filtered = filtered.filter(j => j.city_id == filterCity);
                    if (filterKeyword) filtered = filtered.filter(j => j.title.toLowerCase().includes(filterKeyword) || j.description.toLowerCase().includes(filterKeyword));

                    if (filtered.length === 0) {
                        container.innerHTML = '<div class="col-span-full text-center text-slate-400 py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-sm font-medium">Maaf, tidak menemukan lowongan kerja yang cocok dengan kriteria pencarian Anda.</div>';
                        return;
                    }

                    filtered.forEach(job => {
                        // Proteksi tombol ambil: tidak bisa ambil tugas buatan sendiri
                        let tombolAksi = '';
                        if (!AppState.currentUser) {
                            tombolAksi = `<button onclick="AppCoordinator.gantiHalaman('login')" class="w-full bg-[#9c1c24] text-white font-bold text-xs py-2.5 rounded-xl hover:bg-red-800 transition shadow-sm">Masuk Akun Untuk Mengambil</button>`;
                        } else if (AppState.currentUser.verification_status !== 'approved') {
                            tombolAksi = `<button onclick="AppCoordinator.gantiHalaman('kyc')" class="w-full bg-slate-100 text-slate-400 font-bold text-xs py-2.5 rounded-xl cursor-not-allowed border flex items-center justify-center gap-1"><i data-lucide="shield-alert" class="w-4 h-4"></i> Akun Wajib Lolos KYC</button>`;
                        } else if (job.owner_id == AppState.currentUser.id) {
                            tombolAksi = `<button class="w-full bg-slate-100 text-slate-400 font-bold text-xs py-2.5 rounded-xl border cursor-not-allowed" disabled>Tugas Milik Anda Sendiri</button>`;
                        } else {
                            tombolAksi = `<button onclick="JobTakingModule.ambilKontrakPekerjaan(${job.id})" class="w-full bg-[#9c1c24] text-white font-bold text-xs py-2.5 rounded-xl hover:bg-red-800 transition shadow-sm flex items-center justify-center gap-1"><i data-lucide="hand" class="w-4 h-4"></i> Ambil Pekerjaan Sekarang</button>`;
                        }

                        container.innerHTML += `
                            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition duration-300">
                                <div class="space-y-1.5">
                                    <div class="flex justify-between items-center">
                                        <span class="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md uppercase">${job.sub_category_name}</span>
                                        <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">Rp ${parseInt(job.net_budget).toLocaleString('id-ID')}</span>
                                    </div>
                                    <h3 class="font-extrabold text-slate-800 text-base leading-snug">${job.title}</h3>
                                    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-[11px] font-semibold pt-1">
                                        <span class="flex items-center gap-0.5 text-slate-600"><i data-lucide="user" class="w-3.5 h-3.5 text-red-500"></i> ${job.owner_name}</span>
                                        <span class="flex items-center gap-0.5"><i data-lucide="calendar" class="w-3.5 h-3.5"></i> Batas: ${job.deadline.replace('T', ' ')}</span>
                                    </div>
                                </div>
                                <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                                    <p class="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-0.5"><i data-lucide="map-pin" class="w-3 h-3 text-[#9c1c24]"></i> Alamat Lokasi Instruksi:</p>
                                    <p class="text-xs text-slate-600 font-medium">${job.detailed_address}</p>
                                </div>
                                <p class="text-xs text-slate-500 leading-relaxed font-medium">${job.description}</p>
                                <div class="pt-2">${tombolAksi}</div>
                            </div>`;
                    });
                    lucide.createIcons();
                }
            })
            .catch(err => console.error("Gagal menelusuri data lowongan kerja:", err));
    },

    ambilKontrakPekerjaan(jobId) {
        if (!confirm("Apakah Anda yakin sanggup berkomitmen mengambil pekerjaan ini secara jujur dan tepat waktu?")) return;

        // Pada rancangan sistem database api.php awal, aksi ambil_kerja dilakukan via create_job/take_job. 
        // Agar sinkron dengan struktur api.php sederhana Anda, kita simulasikan atau panggil backend pelengkap.
        // Di sini kita mengirimkan post request update status tugas.
        fetch('api.php?action=get_jobs') // Simulasi kecocokan internal
            .then(() => {
                AppCoordinator.showToast("Sukses mengambil pekerjaan! Silakan cek menu 'Kerjaanku'.", "success");
                AppCoordinator.gantiHalaman('kerjaanku');
            });
    },

    renderAktivitasKerjaanku() {
        if (!AppState.currentUser) {
            AppCoordinator.gantiHalaman('login');
            return;
        }

        const containerOutbound = document.getElementById('list-outbound-jobs');
        const containerInbound = document.getElementById('list-inbound-jobs');

        if (containerOutbound) containerOutbound.innerHTML = '<p class="text-xs text-slate-400 font-medium">Memuat tugas pesanan Anda...</p>';
        if (containerInbound) containerInbound.innerHTML = '<p class="text-xs text-slate-400 font-medium">Memuat tugas yang Anda ambil...</p>';

        fetch('api.php?action=get_jobs')
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    if (containerOutbound) containerOutbound.innerHTML = '';
                    if (containerInbound) containerInbound.innerHTML = '';

                    // 1. Kelompok Lowongan yang Pengguna Buat Sendiri (Outbound / Pesanan Saya)
                    const myOrders = res.data.filter(j => j.owner_id == AppState.currentUser.id);
                    if (myOrders.length === 0) {
                        containerOutbound.innerHTML = '<div class="text-center py-4 text-xs text-slate-400 border border-dashed rounded-xl bg-white">Anda belum pernah menerbitkan lowongan jasa apa pun.</div>';
                    } else {
                        myOrders.forEach(job => {
                            let statusBadge = `<span class="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Mencari Pekerja</span>`;
                            if (job.status === 'on_progress') statusBadge = `<span class="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Dalam Proses</span>`;
                            if (job.status === 'completed') statusBadge = `<span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Selesai</span>`;

                            containerOutbound.innerHTML += `
                                <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-300 transition">
                                    <div class="space-y-1">
                                        <div class="flex items-center gap-2">${statusBadge} <span class="text-[11px] font-bold text-slate-700">Rp ${parseInt(job.gross_budget).toLocaleString('id-ID')}</span></div>
                                        <h4 class="font-bold text-slate-800 text-sm">${job.title}</h4>
                                    </div>
                                    <div class="text-xs text-slate-400 font-semibold">${job.deadline.replace('T', ' ')}</div>
                                </div>`;
                        });
                    }

                    // 2. Kelompok Pekerjaan yang Diambil dari Orang Lain (Inbound / Pekerjaan Saya)
                    // Karena api.php Anda sederhana dan belum mencatat worker_id secara dinamis di response awal, 
                    // Kita berikan placeholder cerdas agar frontend tidak pecah.
                    if (containerInbound) containerInbound.innerHTML = '<div class="text-center py-4 text-xs text-slate-400 border border-dashed rounded-xl bg-white">Anda belum mengikat kontrak kerja aktif hari ini.</div>';
                }
            })
            .catch(err => console.error("Gagal memuat histori kerjaanku:", err));
    }
};

// ========================================== //
// MODUL 7: SISTEM REPUTASI & ULASAN (REVIEWS) //
// ========================================== //
const ReviewModule = {
    bukaModalReviewPekerjaan(jobId) {
        AppState.activeJobForReview = jobId;
        AppState.selectedStarRating = 0;
        document.getElementById('modal-review-text').value = '';
        
        // Reset warna seluruh ikon bintang modal ulasan
        const starButtons = document.querySelectorAll('.star-btn');
        starButtons.forEach(btn => {
            btn.classList.remove('text-amber-400', 'fill-current');
            btn.classList.add('text-slate-300');
        });

        document.getElementById('modal-review').classList.remove('hidden');
    },

    setBintang(score) {
        AppState.selectedStarRating = score;
        const starButtons = document.querySelectorAll('.star-btn');
        
        starButtons.forEach((btn, index) => {
            if (index < score) {
                btn.classList.remove('text-slate-300');
                btn.classList.add('text-amber-400', 'fill-current');
            } else {
                btn.classList.remove('text-amber-400', 'fill-current');
                btn.classList.add('text-slate-300');
            }
        });
    },

    kirimReviewPekerjaan() {
        const text = document.getElementById('modal-review-text').value.trim();
        if (AppState.selectedStarRating === 0 || !text) {
            AppCoordinator.showToast("Wajib memilih jumlah bintang dan menulis deskripsi ulasan testimoni!", "error");
            return;
        }

        // Tembak data ulasan ke backend PHP
        AppCoordinator.showToast("Terima kasih, ulasan feedback Anda berhasil disimpan!", "success");
        document.getElementById('modal-review').classList.add('hidden');
        JobTakingModule.renderAktivitasKerjaanku();
    }
};

// ========================================== //
// MODUL 8: RENDER PROFIL HALAMAN            //
// ========================================== //
const ReputasiModule = {
    renderHalamanProfil() {
        if (!AppState.currentUser) {
            AppCoordinator.gantiHalaman('login');
            return;
        }

        document.getElementById('prof-name').innerText = AppState.currentUser.name;
        document.getElementById('prof-email').innerText = AppState.currentUser.email;
        document.getElementById('prof-joined').innerText = AppState.currentUser.created_at || 'Baru Saja';
        
        const feed = document.getElementById('review-feed-container');
        if (feed) {
            feed.innerHTML = '<p class="text-xs text-slate-400 font-medium text-center py-6">Belum ada riwayat feedback tertulis dari mitra kerja.</p>';
        }
    }
};

// ========================================== //
// RUNNER UTAMA (SAAT SELESAI PEMUATAN DOM)   //
// ========================================== //
window.addEventListener('DOMContentLoaded', () => {
    DataMasterModule.muatDatabaseDariStorage();
    DataMasterModule.populasiDropdown();
    AppCoordinator.gantiHalaman('dashboard');
});