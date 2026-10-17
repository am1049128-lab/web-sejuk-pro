/**
 * SEJUKPRO™ - Modern Interactive Air Conditioning Web Application
 * Core Script: BTU & PK Calculator Engine, CS Booking Portal,
 * AC Simulator, Troubleshooting Guide & UI Utilities.
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initLandscapeToggle();
  initMobileMenu();
  initNavbarScroll();
  initHeroAcSimulator();
  initBtuCalculator();
  initTroubleshooter();
  initBookingForm();
  initFaqAccordion();
  initFloatingWidget();
  initDateDefault();
  initSupabaseData();
});

/* ==========================================================================
   0. Landscape / Boxed Layout Toggle
   ========================================================================== */
function initLandscapeToggle() {
  const landscapeToggle = document.getElementById('landscapeToggle');
  const body = document.body;

  // Retrieve saved preference or default to landscape (null/'landscape' = landscape panoramic)
  const savedLayout = localStorage.getItem('sejukpro-layout');
  if (savedLayout === 'boxed') {
    body.classList.add('boxed-mode');
  }

  if (landscapeToggle) {
    landscapeToggle.addEventListener('click', () => {
      body.classList.toggle('boxed-mode');
      const isBoxed = body.classList.contains('boxed-mode');
      localStorage.setItem('sejukpro-layout', isBoxed ? 'boxed' : 'landscape');
      showToast(isBoxed ? 'Mode Tampilan: Normal (Boxed)' : 'Mode Tampilan: Landscape (Panoramic Wide)');
    });
  }
}

/* ==========================================================================
   1. Theme Toggle (Dark / Light Mode)
   ========================================================================== */
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  // Retrieve saved preference or default to 'dark'
  const savedTheme = localStorage.getItem('sejukpro-theme') || 'dark';
  body.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = body.getAttribute('data-theme');
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      body.setAttribute('data-theme', nextTheme);
      localStorage.setItem('sejukpro-theme', nextTheme);
      showToast(`Mode tampilan diganti ke ${nextTheme === 'dark' ? 'Gelap (Dark)' : 'Terang (Light)'}`);
    });
  }
}

/* ==========================================================================
   2. Mobile Navbar & Smooth Scroll
   ========================================================================== */
function initMobileMenu() {
  const hamburger = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    // Close when clicking nav links
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }
}

function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;

    if (navbar) {
      if (scrollPos > 40) {
        navbar.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.25)';
      } else {
        navbar.style.boxShadow = 'none';
      }
    }

    if (scrollTopBtn) {
      if (scrollPos > 350) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }
  });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* ==========================================================================
   3. Interactive Hero AC Unit Simulator
   ========================================================================== */
function initHeroAcSimulator() {
  const simTempDisplay = document.getElementById('simTempDisplay');
  const simTargetTemp = document.getElementById('simTargetTemp');
  const btnTempDown = document.getElementById('btnTempDown');
  const btnTempUp = document.getElementById('btnTempUp');
  const modeButtons = document.querySelectorAll('.mode-btn');
  const simWattage = document.getElementById('simWattage');
  const simStatusText = document.getElementById('acStatusText');
  const simModeIcon = document.getElementById('simModeIcon');

  let currentTemp = 18;
  let currentMode = 'cool';

  const modeData = {
    cool: { name: 'Mode: Cooling Standard', icon: '❄️', baseWatt: 520 },
    turbo: { name: 'Mode: Turbo Chill Fast', icon: '⚡', baseWatt: 780 },
    eco: { name: 'Mode: Eco Green Saver', icon: '🌱', baseWatt: 340 },
    dry: { name: 'Mode: Dry Dehumidifier', icon: '💧', baseWatt: 410 }
  };

  function updateSimulatorUI() {
    if (simTempDisplay) simTempDisplay.textContent = currentTemp;
    if (simTargetTemp) simTargetTemp.textContent = `${currentTemp}°C`;

    const info = modeData[currentMode] || modeData.cool;
    if (simModeIcon) simModeIcon.textContent = info.icon;
    if (simStatusText) simStatusText.textContent = info.name;

    // Calculate simulated wattage based on temperature and mode
    // Lower temperature = more cooling required
    const tempDelta = (26 - currentTemp) * 25; // 26 is baseline
    const calculatedWatt = Math.max(250, info.baseWatt + tempDelta);
    if (simWattage) simWattage.textContent = `${calculatedWatt} W`;
  }

  if (btnTempDown) {
    btnTempDown.addEventListener('click', () => {
      if (currentTemp > 16) {
        currentTemp--;
        updateSimulatorUI();
      }
    });
  }

  if (btnTempUp) {
    btnTempUp.addEventListener('click', () => {
      if (currentTemp < 30) {
        currentTemp++;
        updateSimulatorUI();
      }
    });
  }

  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      updateSimulatorUI();
    });
  });

  updateSimulatorUI();
}

/* ==========================================================================
   4. BTU & PK Interactive Calculator Engine
   ========================================================================== */
function initBtuCalculator() {
  // Tabs
  const tabDimensi = document.getElementById('tabDimensi');
  const tabLuas = document.getElementById('tabLuas');
  const paneDimensi = document.getElementById('paneModeDimensi');
  const paneLuas = document.getElementById('paneModeLuas');

  // Dimension inputs
  const inputPanjang = document.getElementById('inputPanjang');
  const inputLebar = document.getElementById('inputLebar');
  const inputTinggi = document.getElementById('inputTinggi');
  const valPanjang = document.getElementById('valPanjang');
  const valLebar = document.getElementById('valLebar');
  const valTinggi = document.getElementById('valTinggi');

  // Direct area input
  const inputLuas = document.getElementById('inputLuas');
  const valLuas = document.getElementById('valLuas');

  // Condition inputs
  const selectRoomType = document.getElementById('selectRoomType');
  const selectSunlight = document.getElementById('selectSunlight');
  const selectCeiling = document.getElementById('selectCeiling');
  const inputPeople = document.getElementById('inputPeople');
  const inputElectronics = document.getElementById('inputElectronics');

  // Cost inputs
  const inputHoursPerDay = document.getElementById('inputHoursPerDay');
  const valHoursDisplay = document.getElementById('valHoursDisplay');

  // Outputs
  const resBtuValue = document.getElementById('resBtuValue');
  const resRoomSummary = document.getElementById('resRoomSummary');
  const resPkTitle = document.getElementById('resPkTitle');
  const resPkCoverage = document.getElementById('resPkCoverage');
  const resAcTypeBadge = document.getElementById('resAcTypeBadge');
  const resAcTypeReason = document.getElementById('resAcTypeReason');
  const resWattage = document.getElementById('resWattage');
  const resMonthlyCost = document.getElementById('resMonthlyCost');

  // Action buttons
  const btnResetCalc = document.getElementById('btnResetCalc');
  const btnShareWaCalc = document.getElementById('btnShareWaCalc');
  const btnCopyCalcSummary = document.getElementById('btnCopyCalcSummary');

  let activeMode = 'dimensi'; // 'dimensi' | 'luas'

  // Tab switching
  if (tabDimensi && tabLuas) {
    tabDimensi.addEventListener('click', () => {
      activeMode = 'dimensi';
      tabDimensi.classList.add('active');
      tabLuas.classList.remove('active');
      paneDimensi.classList.add('active');
      paneLuas.classList.remove('active');
      calculateBTU();
    });

    tabLuas.addEventListener('click', () => {
      activeMode = 'luas';
      tabLuas.classList.add('active');
      tabDimensi.classList.remove('active');
      paneLuas.classList.add('active');
      paneDimensi.classList.remove('active');
      calculateBTU();
    });
  }

  function calculateBTU() {
    let p = parseFloat(inputPanjang.value) || 4;
    let l = parseFloat(inputLebar.value) || 3.5;
    let t = parseFloat(inputTinggi.value) || 3.0;
    let area = 0;
    let volume = 0;

    if (activeMode === 'dimensi') {
      area = p * l;
      volume = area * t;
      if (valPanjang) valPanjang.textContent = `${p.toFixed(1)} m`;
      if (valLebar) valLebar.textContent = `${l.toFixed(1)} m`;
      if (valTinggi) valTinggi.textContent = `${t.toFixed(1)} m`;
    } else {
      area = parseFloat(inputLuas.value) || 14;
      volume = area * 3.0; // standard assumption
      if (valLuas) valLuas.textContent = `${Math.round(area)} m²`;
    }

    // Baseline BTU per m2 according to room function
    const baseBtuPerM2 = parseFloat(selectRoomType.value) || 500;
    let baseBtu = area * baseBtuPerM2;

    // Ceiling height correction if higher than 3.0m
    if (activeMode === 'dimensi' && t > 3.0) {
      const heightMultiplier = t / 3.0;
      baseBtu = baseBtu * (1 + (heightMultiplier - 1) * 0.7);
    }

    // Sunlight modifier
    const sunMod = parseFloat(selectSunlight.value) || 1.0;
    baseBtu *= sunMod;

    // Roof / ceiling position modifier
    const roofMod = parseFloat(selectCeiling.value) || 1.0;
    baseBtu *= roofMod;

    // People heat load (approx 500 BTU/person for occupants beyond 2)
    const peopleCount = parseInt(inputPeople.value, 10) || 1;
    if (peopleCount > 2) {
      baseBtu += (peopleCount - 2) * 500;
    }

    // Electronics heat load (PC, TV, dispenser approx 400 BTU per device)
    const elecCount = parseInt(inputElectronics.value, 10) || 0;
    baseBtu += elecCount * 400;

    const totalBtu = Math.round(baseBtu);

    // Determine PK Category
    let pkTitle = '1/2 PK';
    let pkCoverage = 'Kapasitas ~5.000 BTU/hr';
    let wattRange = '320 - 390 Watt';
    let avgWatt = 360;

    if (totalBtu <= 5600) {
      pkTitle = '1/2 PK (0.5 Horsepower)';
      pkCoverage = 'Kapasitas pendinginan pabrik: ± 5.000 BTU/hr (Sangat Pas)';
      wattRange = '± 320 - 390 Watt';
      avgWatt = 350;
    } else if (totalBtu <= 7800) {
      pkTitle = '3/4 PK (0.75 Horsepower)';
      pkCoverage = 'Kapasitas pendinginan pabrik: ± 7.000 BTU/hr (Sangat Pas)';
      wattRange = '± 530 - 620 Watt';
      avgWatt = 580;
    } else if (totalBtu <= 10200) {
      pkTitle = '1 PK (1.0 Horsepower)';
      pkCoverage = 'Kapasitas pendinginan pabrik: ± 9.000 BTU/hr (Rekomendasi Utama)';
      wattRange = '± 690 - 840 Watt';
      avgWatt = 750;
    } else if (totalBtu <= 14000) {
      pkTitle = '1.5 PK (1.5 Horsepower)';
      pkCoverage = 'Kapasitas pendinginan pabrik: ± 12.000 BTU/hr';
      wattRange = '± 990 - 1.150 Watt';
      avgWatt = 1050;
    } else if (totalBtu <= 20000) {
      pkTitle = '2 PK (2.0 Horsepower)';
      pkCoverage = 'Kapasitas pendinginan pabrik: ± 18.000 BTU/hr';
      wattRange = '± 1.450 - 1.800 Watt';
      avgWatt = 1600;
    } else if (totalBtu <= 26000) {
      pkTitle = '2.5 PK (2.5 Horsepower)';
      pkCoverage = 'Kapasitas pendinginan pabrik: ± 24.000 BTU/hr';
      wattRange = '± 1.900 - 2.400 Watt';
      avgWatt = 2100;
    } else {
      const unitsNeeded = Math.ceil(totalBtu / 18000);
      pkTitle = `Multi-Unit / AC Cassette (${unitsNeeded} Unit × 2 PK)`;
      pkCoverage = `Kapasitas besar: > 26.000 BTU/hr. Disarankan pasang ${unitsNeeded} unit split terpisah atau AC Standing/Cassette.`;
      wattRange = `± ${unitsNeeded * 1500} Watt`;
      avgWatt = unitsNeeded * 1500;
    }

    // Hours per day calculation
    const hours = parseInt(inputHoursPerDay.value, 10) || 8;
    if (valHoursDisplay) valHoursDisplay.textContent = `${hours} Jam / hari`;

    // Monthly Electricity Cost Estimation
    // For Inverter AC, after reaching setpoint, power consumption stabilizes at ~50-65%
    const inverterDutyFactor = 0.60;
    const plnRatePerKwh = 1444.70; // Tarif Dasar Listrik PLN R-1 1300VA / 2200VA
    const kwhPerDay = (avgWatt * hours * inverterDutyFactor) / 1000;
    const monthlyCostMin = Math.round(kwhPerDay * 30 * plnRatePerKwh);
    const monthlyCostMax = Math.round(monthlyCostMin * 1.2); // margin standard

    // Update Output Elements
    if (resBtuValue) resBtuValue.textContent = totalBtu.toLocaleString('id-ID');
    if (resRoomSummary) {
      resRoomSummary.textContent = `Luas Ruangan: ${area.toFixed(1)} m² • Volume: ${volume.toFixed(1)} m³`;
    }
    if (resPkTitle) resPkTitle.textContent = pkTitle;
    if (resPkCoverage) resPkCoverage.textContent = pkCoverage;
    if (resWattage) resWattage.textContent = wattRange;
    if (resMonthlyCost) {
      resMonthlyCost.textContent = `± Rp ${monthlyCostMin.toLocaleString('id-ID')} - Rp ${monthlyCostMax.toLocaleString('id-ID')}`;
    }

    // Inverter Recommendation context
    if (hours >= 5) {
      if (resAcTypeBadge) resAcTypeBadge.textContent = 'AC Inverter Sangat Dianjurkan (Hemat 30-50%)';
      if (resAcTypeReason) {
        resAcTypeReason.innerHTML = `Dengan durasi pemakaian <strong>${hours} jam/hari</strong>, AC jenis <strong>Inverter</strong> akan jauh lebih hemat tagihan bulanan karena mesin bekerja dengan modulasi frekuensi cerdas saat suhu dingin telah tercapai.`;
      }
    } else {
      if (resAcTypeBadge) resAcTypeBadge.textContent = 'AC Standard / Low Watt Cukup Efisien';
      if (resAcTypeReason) {
        resAcTypeReason.innerHTML = `Untuk pemakaian singkat (< 5 jam/hari), AC <strong>Standard Low Watt</strong> dapat menjadi alternatif ekonomis dengan biaya pembelian unit awal yang lebih terjangkau.`;
      }
    }

    // Update WhatsApp & Copy payload state
    window._lastBtuResult = {
      area: area.toFixed(1),
      volume: volume.toFixed(1),
      btu: totalBtu,
      pk: pkTitle,
      hours: hours,
      costEst: `Rp ${monthlyCostMin.toLocaleString('id-ID')}`
    };
  }

  // Attach event listeners to all calculator inputs
  const inputsToListen = [
    inputPanjang, inputLebar, inputTinggi, inputLuas,
    selectRoomType, selectSunlight, selectCeiling,
    inputPeople, inputElectronics, inputHoursPerDay
  ];

  inputsToListen.forEach(input => {
    if (input) {
      input.addEventListener('input', calculateBTU);
      input.addEventListener('change', calculateBTU);
    }
  });

  // Reset button
  if (btnResetCalc) {
    btnResetCalc.addEventListener('click', () => {
      inputPanjang.value = 4;
      inputLebar.value = 3.5;
      inputTinggi.value = 3.0;
      inputLuas.value = 14;
      selectRoomType.value = '500';
      selectSunlight.value = '1.0';
      selectCeiling.value = '1.0';
      inputPeople.value = 2;
      inputElectronics.value = 1;
      inputHoursPerDay.value = 8;
      calculateBTU();
      showToast('Parameter kalkulator telah direset ke nilai default.');
    });
  }

  // WhatsApp Share button
  if (btnShareWaCalc) {
    btnShareWaCalc.addEventListener('click', () => {
      const data = window._lastBtuResult;
      if (!data) return;

      const message = `Halo CS SEJUKPRO, saya ingin konsultasi pemilihan unit AC berdasarkan hitungan Kalkulator BTU:\n\n` +
        `• Luas Ruangan: ${data.area} m²\n` +
        `• Total Kebutuhan: ${data.btu.toLocaleString('id-ID')} BTU/jam\n` +
        `• Rekomendasi Kapasitas: ${data.pk}\n` +
        `• Rencana Pemakaian: ${data.hours} jam/hari\n\n` +
        `Mohon rekomendasi merk dan estimasi biaya pemasangan terbaik. Terima kasih!`;

      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/6281226818063?text=${encoded}`, '_blank');
    });
  }

  // Copy Summary button
  if (btnCopyCalcSummary) {
    btnCopyCalcSummary.addEventListener('click', () => {
      const data = window._lastBtuResult;
      if (!data) return;

      const text = `HASIL HITUNGAN KALKULATOR BTU SEJUKPRO™\n` +
        `-----------------------------------------\n` +
        `Luas Ruangan : ${data.area} m²\n` +
        `Beban Dingin : ${data.btu.toLocaleString('id-ID')} BTU/hr\n` +
        `Kapasitas PK : ${data.pk}\n` +
        `Estimasi Watt: ~${data.hours} jam/hari (Est. Rp ${data.costEst}/bln)\n` +
        `Konsultasi Gratis: https://sejukpro.co.id`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          showToast('Ringkasan hasil BTU berhasil disalin ke clipboard!');
        });
      } else {
        showToast('Hasil berhasil dicatat.');
      }
    });
  }

  // Initial calculation
  calculateBTU();
}

// Global stepper helper function
window.adjustStep = function(id, delta) {
  const el = document.getElementById(id);
  if (!el) return;
  let val = parseInt(el.value, 10) || 0;
  const min = parseInt(el.min, 10) || 0;
  const max = parseInt(el.max, 10) || 100;
  val = Math.max(min, Math.min(max, val + delta));
  el.value = val;
  el.dispatchEvent(new Event('input'));
};

/* ==========================================================================
   5. Interactive Troubleshooting Diagnostic Tool
   ========================================================================== */
function initTroubleshooter() {
  const pills = document.querySelectorAll('.diag-pill');
  const diagIcon = document.getElementById('diagIcon');
  const diagTitle = document.getElementById('diagTitle');
  const diagSeverity = document.getElementById('diagSeverity');
  const diagCauses = document.getElementById('diagCauses');
  const diagFixes = document.getElementById('diagFixes');
  const diagAdvice = document.getElementById('diagAdvice');
  const btnBookFromDiag = document.getElementById('btnBookFromDiag');

  const issueData = {
    'kurang-dingin': {
      icon: '🌬️',
      title: 'AC Hanya Menghembuskan Angin Biasa (Kurang Dingin)',
      severity: 'Tingkat Penanganan: Perlu Servis Rutin / Cek Freon',
      servicePref: 'Cuci AC Standar',
      causes: [
        'Filter udara dan kisi evaporator tertutup lapisan debu tebal.',
        'Outdoor unit kotor sehingga pembuangan panas kompresor terhambat.',
        'Tekanan freon berkurang akibat kebocoran halus di sambungan pipa/nepel.',
        'Kapasitor starting kompresor melemah atau rusak.'
      ],
      fixes: [
        'Buka cover indoor, lepas saringan filter lalu cuci dengan air mengalir dan pasang kembali setelah kering.',
        'Pastikan remote berada pada mode COOL (simbol salju ❄️), bukan mode FAN atau DRY.',
        'Periksa apakah kipas luar (outdoor) berputar saat AC dihidupkan.'
      ],
      advice: '💡 Saran: Jangan biarkan AC dipaksa jalan di suhu 16°C jika tidak dingin karena kompresor bisa jebol. Segera jadwalkan servis cuci & cek tekanan freon.'
    },
    'bocor-air': {
      icon: '💧',
      title: 'Air Menetes / Bocor dari Bagian Bawah Indoor Unit',
      severity: 'Tingkat Penanganan: Mendesak (Cegah Rusak Plafon & Dinding)',
      servicePref: 'Deep Clean Chemical',
      causes: [
        'Talang drainase tersumbat lumut dan lendir debu membandel.',
        'Selang pembuangan air tertekuk atau kemiringan pipa buang tidak pas.',
        'Evaporator membeku (bunga es) akibat freon kurang lalu mencair tumpah.',
        'Isolasi pipa armaflex sudah getas atau berlubang menyebabkan kondensasi.'
      ],
      fixes: [
        'Tampung tetesan air sementara dengan ember atau kain tebal agar lantai tidak rusak.',
        'Matikan unit AC untuk menghentikan akumulasi embun kondensasi.',
        'Hindari menusuk lubang drainase dengan kawat keras yang dapat melubangi pipa plastik.'
      ],
      advice: '💡 Saran: Penanganan terbaik adalah Deep Clean & Flushing talang dengan jet steam bertekanan agar lumut tuntas 100%.'
    },
    'bau-apek': {
      icon: '🦨',
      title: 'Hembusan Udara Berbau Apek, Asam, atau Tak Sedap',
      severity: 'Tingkat Penanganan: Penting untuk Kesehatan Pernapasan',
      servicePref: 'Deep Clean Chemical',
      causes: [
        'Tumbuhnya koloni jamur dan bakteri di kisi-kisi evaporator yang lembap.',
        'Blower kipas indoor kotor dipenuhi debu hitam pekat.',
        'Ada bangkai serangga/cicak di dalam bodi indoor.',
        'Filter udara menyerap asap masakan, rokok, atau kelembaban ruangan.'
      ],
      fixes: [
        'Nyalakan AC dalam mode FAN (kipas saja) selama 30 menit untuk mengeringkan evaporator.',
        'Cuci filter dan semprotkan disinfektan ruangan khusus pendingin.',
        'Pastikan ventilasi kamar sesekali dibuka di pagi hari.'
      ],
      advice: '💡 Saran: Gunakan layanan Deep Clean + Desinfektan Fogging SEJUKPRO yang membunuh 99.9% kuman dan menghilangkan bau apek permanen.'
    },
    'berisik': {
      icon: '🔊',
      title: 'Unit Mengeluarkan Suara Berisik, Bergetar, atau Berderit',
      severity: 'Tingkat Penanganan: Perlu Pemeriksaan Mekanikal',
      servicePref: 'Perbaikan Teknis / Rusak',
      causes: [
        'Busing dinamo fan indoor kering atau aus.',
        'Braket outdoor longgar/baut kendor menyebabkan resonansi getaran di dinding.',
        'Baling-baling kipas outdoor terkena ranting atau patah sebagian.',
        'Kompresor mengalami gejala knocking karena kelebihan oli atau tekanan abnormal.'
      ],
      fixes: [
        'Cek apakah getaran berasal dari cover indoor yang belum terpasang rapat.',
        'Periksa apakah ada benda asing yang tersangkut di kisi pengaman luar outdoor.',
        'Jika suara berasal dari gesekan kompresor logam, segera matikan AC.'
      ],
      advice: '💡 Saran: Jangan abaikan getaran berlebih karena dapat menyebabkan nepel pipa patah dan freon terbuang habis.'
    },
    'mati-total': {
      icon: '⚡',
      title: 'AC Mati Total, Tidak Merespon Remote, atau Lampu Timer Berkedip',
      severity: 'Tingkat Penanganan: Masalah Kelistrikan / PCB Modul',
      servicePref: 'Perbaikan Teknis / Rusak',
      causes: [
        'Sekring / MCB khusus AC di panel listrik turun (trip).',
        'Baterai remote control habis atau sensor inframerah indoor kotor.',
        'Modul PCB elektronik indoor mengalami kerusakan akibat lonjakan voltase PLN.',
        'Lampu timer berkedip menandakan kode error sistem proteksi sensor suhu (thermistor).'
      ],
      fixes: [
        'Ganti baterai remote dengan yang baru atau coba hidupkan via tombol manual darurat di balik cover indoor.',
        'Cek MCB listrik apakah dalam posisi OFF lalu nyalakan kembali.',
        'Cabut colokan listrik AC selama 5 menit lalu colokkan kembali untuk mereset memori error.'
      ],
      advice: '💡 Saran: Jika lampu indikator tetap berkedip, teknisi kami siap memeriksa thermistor dan komponen PCB dengan multimeter digital.'
    }
  };

  let currentSelectedIssue = 'kurang-dingin';

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const issueKey = pill.dataset.issue;
      currentSelectedIssue = issueKey;
      const data = issueData[issueKey];
      if (!data) return;

      if (diagIcon) diagIcon.textContent = data.icon;
      if (diagTitle) diagTitle.textContent = data.title;
      if (diagSeverity) diagSeverity.textContent = data.severity;
      if (diagAdvice) diagAdvice.textContent = data.advice;

      if (diagCauses) {
        diagCauses.innerHTML = data.causes.map(c => `<li>${c}</li>`).join('');
      }

      if (diagFixes) {
        diagFixes.innerHTML = data.fixes.map(f => `<li>${f}</li>`).join('');
      }
    });
  });

  if (btnBookFromDiag) {
    btnBookFromDiag.addEventListener('click', () => {
      const data = issueData[currentSelectedIssue];
      if (data) {
        window.preselectService(data.servicePref, `Keluhan dari diagnosa: ${data.title}`);
      }
    });
  }
}

/* ==========================================================================
   6. Customer Service Booking System & Modal Flow
   ========================================================================== */
window.preselectService = function(serviceName, customNotes = '') {
  const custService = document.getElementById('custService');
  const custNotes = document.getElementById('custNotes');
  const targetSection = document.getElementById('customer-service');

  if (custService) {
    for (let i = 0; i < custService.options.length; i++) {
      if (custService.options[i].value === serviceName) {
        custService.selectedIndex = i;
        break;
      }
    }
  }

  if (customNotes && custNotes) {
    custNotes.value = customNotes;
  }

  if (targetSection) {
    targetSection.scrollIntoView({ behavior: 'smooth' });
    showToast(`Layanan "${serviceName}" otomatis dipilih pada form pemesanan.`);
  }
};

function initDateDefault() {
  const custDate = document.getElementById('custDate');
  if (custDate) {
    // Set default visit date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    custDate.value = `${yyyy}-${mm}-${dd}`;
    custDate.min = `${yyyy}-${mm}-${dd}`;
  }
}

function initBookingForm() {
  const form = document.getElementById('bookingForm');
  const modal = document.getElementById('bookingSuccessModal');
  const modalSummary = document.getElementById('modalBookingSummary');
  const modalWaActionBtn = document.getElementById('modalWaActionBtn');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    const nameInput = document.getElementById('custName');
    const phoneInput = document.getElementById('custPhone');
    const addressInput = document.getElementById('custAddress');
    const serviceInput = document.getElementById('custService');
    const dateInput = document.getElementById('custDate');

    // Validation checks
    const fieldsToValidate = [
      { el: nameInput, cond: nameInput.value.trim().length >= 2 },
      { el: phoneInput, cond: phoneInput.value.trim().length >= 8 },
      { el: addressInput, cond: addressInput.value.trim().length >= 5 },
      { el: serviceInput, cond: serviceInput.value !== '' },
      { el: dateInput, cond: dateInput.value !== '' }
    ];

    fieldsToValidate.forEach(item => {
      const parent = item.el.closest('.form-field');
      if (!item.cond) {
        isValid = false;
        if (parent) parent.classList.add('invalid');
      } else {
        if (parent) parent.classList.remove('invalid');
      }
    });

    if (!isValid) {
      showToast('Mohon lengkapi seluruh kolom yang bertanda bintang (*).');
      return;
    }

    // Build payload
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const address = addressInput.value.trim();
    const service = serviceInput.value;
    const unitCount = document.getElementById('custUnitCount').value;
    const brand = document.getElementById('custBrand').value.trim() || 'Belum diisi';
    const date = dateInput.value;
    const slot = document.getElementById('custTimeSlot').value;
    const payment = document.getElementById('custPayment').value;
    const notes = document.getElementById('custNotes').value.trim() || 'Tidak ada catatan tambahan';

    const waText = `Halo CS SEJUKPRO, saya ingin memesan jadwal servis teknisi AC melalui website:\n\n` +
      `👤 *Nama:* ${name}\n` +
      `📱 *No. WhatsApp:* ${phone}\n` +
      `📍 *Alamat:* ${address}\n` +
      `🔧 *Layanan:* ${service}\n` +
      `❄️ *Jumlah Unit:* ${unitCount} (Merk: ${brand})\n` +
      `📅 *Tanggal Kunjungan:* ${date}\n` +
      `⏰ *Waktu Kedatangan:* ${slot}\n` +
      `💳 *Pembayaran:* ${payment}\n` +
      `📝 *Catatan Keluhan:* ${notes}\n\n` +
      `Mohon konfirmasi jadwal ketersediaan teknisi. Terima kasih!`;

    const encodedWa = encodeURIComponent(waText);
    const waUrl = `https://wa.me/6281226818063?text=${encodedWa}`;

    if (modalSummary) {
      modalSummary.innerHTML = `Terima kasih, <strong>${name}</strong>!<br>Pemesanan <strong>${service} (${unitCount})</strong> untuk tanggal <strong>${date}</strong> (${slot}) telah tercatat. Klik tombol hijau di bawah untuk langsung membuka chat WhatsApp dengan Customer Service kami.`;
    }

    if (modalWaActionBtn) {
      modalWaActionBtn.href = waUrl;
    }

    // Save booking to Supabase
    if (typeof supabase !== 'undefined') {
      const bookingData = {
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        service_type: service,
        unit_count: unitCount,
        ac_brand: brand !== 'Belum diisi' ? brand : null,
        visit_date: date,
        time_slot: slot,
        payment_method: payment,
        notes: notes,
        status: 'pending'
      };
      supabase.insert('bookings', bookingData)
        .then(() => {
          console.log('[Supabase] Booking saved successfully');
          showToast('Data booking berhasil tersimpan di Supabase!');
        })
        .catch(err => {
          console.warn('[Supabase] Failed to save booking:', err);
        });
    }

    if (modal) {
      modal.classList.add('show');
    }
  });

  if (modalCloseBtn && modal) {
    modalCloseBtn.addEventListener('click', () => {
      modal.classList.remove('show');
    });
  }

  // Close modal when clicking backdrop
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
  }
}

/* ==========================================================================
   7. Interactive FAQ Accordion
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close other items
        faqItems.forEach(other => {
          if (other !== item) other.classList.remove('active');
        });

        // Toggle clicked item
        if (isActive) {
          item.classList.remove('active');
        } else {
          item.classList.add('active');
        }
      });
    }
  });
}

/* ==========================================================================
   8. Floating Support Widget & Quick WhatsApp Trigger
   ========================================================================== */
function initFloatingWidget() {
  const waTriggerBtn = document.getElementById('waTriggerBtn');
  const waPopupCard = document.getElementById('waPopupCard');
  const waCloseBtn = document.getElementById('waCloseBtn');

  if (waTriggerBtn && waPopupCard) {
    waTriggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      waPopupCard.classList.toggle('open');
    });

    if (waCloseBtn) {
      waCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        waPopupCard.classList.remove('open');
      });
    }

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!waPopupCard.contains(e.target) && e.target !== waTriggerBtn) {
        waPopupCard.classList.remove('open');
      }
    });
  }
}

window.openWaWithText = function(text) {
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/6281226818063?text=${encoded}`, '_blank');
  const popup = document.getElementById('waPopupCard');
  if (popup) popup.classList.remove('open');
};

/* ==========================================================================
   9. Toast Notification Utility
   ========================================================================== */
function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast toast-success';
  toast.innerHTML = `<span>✓</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3500);
}

/* ==========================================================================
   10. Supabase Dynamic Data (Products & Payment Methods)
   ========================================================================== */

function getServiceIconSvg(iconType) {
  switch (iconType) {
    case 'snowflake':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14"/><circle cx="12" cy="12" r="3"/></svg>`;
    case 'gauge':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M16 12l-4-4-4 4M12 8v8"></path></svg>`;
    case 'wrench':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`;
    case 'bolt':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;
    case 'briefcase':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`;
    case 'droplet':
    default:
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`;
  }
}

async function initSupabaseData() {
  if (typeof supabase === 'undefined') return;

  // 1. Fetch & render products
  try {
    const products = await supabase.select('products', 'select=*&is_active=eq.true&order=sort_order.asc');
    if (products && products.length > 0) {
      renderDynamicProducts(products);
      populateServiceSelect(products);
    }
  } catch (err) {
    console.warn('[Supabase] Gunakan fallback produk statis:', err);
  }

  // 2. Fetch & render payment methods
  try {
    const paymentMethods = await supabase.select('payment_methods', 'select=*&is_active=eq.true&order=sort_order.asc');
    if (paymentMethods && paymentMethods.length > 0) {
      populatePaymentSelect(paymentMethods);
    }
  } catch (err) {
    console.warn('[Supabase] Gunakan fallback payment statis:', err);
  }
}

function renderDynamicProducts(products) {
  const container = document.getElementById('servicesGrid');
  if (!container) return;

  container.innerHTML = products.map(p => {
    const isFeatured = p.is_featured;
    const badgeHtml = p.badge_text
      ? `<div class="service-badge ${p.badge_type === 'gold' ? 'gold-badge' : ''}">${p.badge_text}</div>`
      : '';
    const featuresHtml = (p.features || []).map(f => `<span>✓ ${f}</span>`).join('');
    const ctaVal = p.cta_service_value || p.name;
    const btnClass = isFeatured ? 'btn btn-primary full-width' : 'btn btn-outline full-width';

    return `
      <div class="service-card glass-card ${isFeatured ? 'featured-service' : ''}">
        ${badgeHtml}
        <div class="service-icon">
          ${getServiceIconSvg(p.icon_type)}
        </div>
        <h3>${p.name}</h3>
        <p class="service-desc">${p.description || ''}</p>
        <div class="service-features">
          ${featuresHtml}
        </div>
        <div class="price-box">
          <span class="price-from">${p.price_label || 'Mulai dari'}</span>
          <span class="price-amount">${p.price_amount}</span>
          <span class="price-unit">${p.price_unit || ''}</span>
        </div>
        <a href="#customer-service" class="${btnClass}" onclick="preselectService('${ctaVal}')">${p.cta_text || 'Pesan Sekarang'}</a>
      </div>
    `;
  }).join('');
}

function populateServiceSelect(products) {
  const select = document.getElementById('custService');
  if (!select) return;

  const currentValue = select.value;
  select.innerHTML = '<option value="" disabled selected>Pilih Jenis Servis...</option>' +
    products.map(p => {
      const val = p.cta_service_value || p.name;
      const isSelected = currentValue === val ? 'selected' : '';
      return `<option value="${val}" ${isSelected}>${p.name} (${p.price_amount})</option>`;
    }).join('');
}

function populatePaymentSelect(methods) {
  const select = document.getElementById('custPayment');
  if (!select) return;

  const currentValue = select.value;
  select.innerHTML = methods.map(m => {
    const isSelected = currentValue === m.name ? 'selected' : '';
    const desc = m.description ? ` (${m.description})` : '';
    return `<option value="${m.name}" ${isSelected}>${m.name}${desc}</option>`;
  }).join('');
}
