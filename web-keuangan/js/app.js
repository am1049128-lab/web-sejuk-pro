/**
 * KasKita - Logika Utama Aplikasi Web Keuangan Kas Kelas
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  data: null,
  isAdmin: false,
  activeFilter: 'all', // 'all', 'owing', 'paid'
  searchQuery: '',
  activeTab: 'dashboard', // 'dashboard', 'matrix', 'expenses'

  init() {
    this.data = Storage.load();
    this.isAdmin = Storage.isLoggedIn();
    
    this.bindEvents();
    this.updateRoleUI();
    this.render();
  },

  bindEvents() {
    // Nav tabs
    document.querySelectorAll('[data-tab-target]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget.getAttribute('data-tab-target');
        this.switchTab(target);
      });
    });

    // Role switcher
    const btnLogin = document.getElementById('btnLoginModal');
    if (btnLogin) btnLogin.addEventListener('click', () => this.openLoginModal());

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) btnLogout.addEventListener('click', () => this.logout());

    // Search & filters
    const searchInput = document.getElementById('searchStudent');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderMatrix();
      });
    }

    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
      filterStatus.addEventListener('change', (e) => {
        this.activeFilter = e.target.value;
        this.renderMatrix();
      });
    }

    // Modal forms
    const formExpense = document.getElementById('formExpense');
    if (formExpense) {
      formExpense.addEventListener('submit', (e) => this.handleSaveExpense(e));
    }

    const formStudent = document.getElementById('formStudent');
    if (formStudent) {
      formStudent.addEventListener('submit', (e) => this.handleSaveStudent(e));
    }

    const formSettings = document.getElementById('formSettings');
    if (formSettings) {
      formSettings.addEventListener('submit', (e) => this.handleSaveSettings(e));
    }

    // Receipt preview upload
    const inputReceipt = document.getElementById('expenseReceipt');
    if (inputReceipt) {
      inputReceipt.addEventListener('change', (e) => this.handleReceiptPreview(e));
    }

    // Close modal clicks on backdrop
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
        }
      });
    });
  },

  switchTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('[data-tab-target]').forEach(btn => {
      btn.classList.remove('border-emerald-600', 'text-emerald-700', 'bg-emerald-50');
      btn.classList.add('text-slate-600', 'border-transparent');
    });

    const activeEl = document.getElementById(`tab-${tab}`);
    if (activeEl) activeEl.classList.remove('hidden');

    const activeBtn = document.querySelector(`[data-tab-target="${tab}"]`);
    if (activeBtn) {
      activeBtn.classList.remove('text-slate-600', 'border-transparent');
      activeBtn.classList.add('border-emerald-600', 'text-emerald-700', 'bg-emerald-50');
    }

    if (tab === 'dashboard') {
      this.renderCharts();
    }
  },

  updateRoleUI() {
    const adminBadges = document.querySelectorAll('.admin-only');
    const studentNotice = document.getElementById('studentModeNotice');
    const adminNotice = document.getElementById('adminModeNotice');
    const btnLoginModal = document.getElementById('btnLoginModal');
    const btnLogout = document.getElementById('btnLogout');

    if (this.isAdmin) {
      adminBadges.forEach(el => el.classList.remove('hidden'));
      if (studentNotice) studentNotice.classList.add('hidden');
      if (adminNotice) adminNotice.classList.remove('hidden');
      if (btnLoginModal) btnLoginModal.classList.add('hidden');
      if (btnLogout) btnLogout.classList.remove('hidden');
    } else {
      adminBadges.forEach(el => el.classList.add('hidden'));
      if (studentNotice) studentNotice.classList.remove('hidden');
      if (adminNotice) adminNotice.classList.add('hidden');
      if (btnLoginModal) btnLoginModal.classList.remove('hidden');
      if (btnLogout) btnLogout.classList.add('hidden');
    }
  },

  openLoginModal() {
    const modal = document.getElementById('modalLogin');
    const pinInput = document.getElementById('adminPinInput');
    const pinErr = document.getElementById('loginError');
    if (pinErr) pinErr.classList.add('hidden');
    if (pinInput) pinInput.value = '';
    if (modal) modal.classList.remove('hidden');
    if (pinInput) pinInput.focus();
  },

  verifyPin() {
    const pinInput = document.getElementById('adminPinInput');
    const pinErr = document.getElementById('loginError');
    const expectedPin = this.data.settings.adminPin || "1234";

    if (pinInput && pinInput.value.trim() === expectedPin) {
      this.isAdmin = true;
      Storage.setLogin(true);
      document.getElementById('modalLogin').classList.add('hidden');
      this.updateRoleUI();
      this.render();
      this.showToast('Login Berhasil!', 'Mode Bendahara diaktifkan.', 'success');
      if (window.confetti) {
        window.confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
      }
    } else {
      if (pinErr) {
        pinErr.textContent = 'PIN Bendahara salah! Gunakan default: 1234';
        pinErr.classList.remove('hidden');
      }
    }
  },

  logout() {
    this.isAdmin = false;
    Storage.setLogin(false);
    this.updateRoleUI();
    this.render();
    this.showToast('Keluar', 'Anda sekarang dalam Mode Siswa (Read-Only).', 'info');
  },

  render() {
    this.updateHeaderInfo();
    this.renderOverview();
    this.renderMatrix();
    this.renderExpenses();
    this.renderCharts();
  },

  updateHeaderInfo() {
    const s = this.data.settings;
    document.querySelectorAll('.class-title').forEach(el => el.textContent = s.className);
    document.querySelectorAll('.school-title').forEach(el => el.textContent = s.schoolName);
    document.querySelectorAll('.month-title').forEach(el => el.textContent = s.currentMonth);
    document.querySelectorAll('.cash-rate').forEach(el => el.textContent = `Rp ${Number(s.cashPerWeek).toLocaleString('id-ID')}/minggu`);

    // Update info rekening & bendahara di dashboard (kartu Metode Pembayaran)
    const elTreasurer = document.getElementById('infoTreasurerName');
    if (elTreasurer) elTreasurer.textContent = s.treasurerName || 'Bendahara Kelas';

    const elPaymentInfo = document.getElementById('infoPaymentDetail');
    if (elPaymentInfo) {
      const lines = (s.paymentInfo || 'BCA: 1234-5678-90 a.n Zahra Putri\nDana/GoPay: 0812-3456-7890').split('\n');
      elPaymentInfo.innerHTML = lines.map(l => `<span>${l}</span>`).join('<br>');
    }

    // Set form settings initial values
    const fClassName = document.getElementById('setClassName');
    if (fClassName) fClassName.value = s.className;
    const fSchoolName = document.getElementById('setSchoolName');
    if (fSchoolName) fSchoolName.value = s.schoolName;
    const fCashRate = document.getElementById('setCashRate');
    if (fCashRate) fCashRate.value = s.cashPerWeek;
    const fTreasurer = document.getElementById('setTreasurer');
    if (fTreasurer) fTreasurer.value = s.treasurerName || '';
    const fPhone = document.getElementById('setPhone');
    if (fPhone) fPhone.value = s.treasurerPhone || '';
    const fPaymentInfo = document.getElementById('setPaymentInfo');
    if (fPaymentInfo) fPaymentInfo.value = s.paymentInfo || '';
    const fMonth = document.getElementById('setMonth');
    if (fMonth) fMonth.value = s.currentMonth || '';
  },

  getFinancials() {
    const rate = Number(this.data.settings.cashPerWeek) || 5000;
    let totalIncome = 0;
    const weeklyIncome = [0, 0, 0, 0];

    this.data.students.forEach(st => {
      ['w1', 'w2', 'w3', 'w4'].forEach((w, idx) => {
        if (st.payments && st.payments[w]) {
          totalIncome += rate;
          weeklyIncome[idx] += rate;
        }
      });
    });

    let totalExpense = 0;
    const weeklyExpense = [0, 0, 0, 0];
    const categoryMap = {};

    this.data.expenses.forEach(exp => {
      const amt = Number(exp.amount) || 0;
      totalExpense += amt;

      // Group weekly expense by date
      const d = new Date(exp.date);
      const day = isNaN(d.getDate()) ? 1 : d.getDate();
      if (day <= 7) weeklyExpense[0] += amt;
      else if (day <= 14) weeklyExpense[1] += amt;
      else if (day <= 21) weeklyExpense[2] += amt;
      else weeklyExpense[3] += amt;

      const cat = exp.category || 'Lain-lain';
      categoryMap[cat] = (categoryMap[cat] || 0) + amt;
    });

    const balance = totalIncome - totalExpense;

    // Student compliance for current week (Week 4 or average)
    let totalPossibleWeeks = this.data.students.length * 4;
    let totalPaidWeeks = 0;
    this.data.students.forEach(st => {
      ['w1', 'w2', 'w3', 'w4'].forEach(w => {
        if (st.payments && st.payments[w]) totalPaidWeeks++;
      });
    });
    const complianceRate = totalPossibleWeeks > 0 ? Math.round((totalPaidWeeks / totalPossibleWeeks) * 100) : 0;

    return {
      totalIncome,
      totalExpense,
      balance,
      weeklyIncome,
      weeklyExpense,
      categoryMap,
      complianceRate
    };
  },

  renderOverview() {
    const fin = this.getFinancials();

    const elSaldo = document.getElementById('totalSaldo');
    if (elSaldo) elSaldo.textContent = `Rp ${fin.balance.toLocaleString('id-ID')}`;

    const elPemasukan = document.getElementById('totalPemasukan');
    if (elPemasukan) elPemasukan.textContent = `Rp ${fin.totalIncome.toLocaleString('id-ID')}`;

    const elPengeluaran = document.getElementById('totalPengeluaran');
    if (elPengeluaran) elPengeluaran.textContent = `Rp ${fin.totalExpense.toLocaleString('id-ID')}`;

    const elKepatuhan = document.getElementById('kepatuhanRate');
    if (elKepatuhan) elKepatuhan.textContent = `${fin.complianceRate}%`;

    const elStudentCount = document.getElementById('totalStudentCount');
    if (elStudentCount) elStudentCount.textContent = `${this.data.students.length} Siswa`;

    // Render Recent 5 Transactions in Overview
    const recentContainer = document.getElementById('recentTransactionsList');
    if (recentContainer) {
      if (this.data.expenses.length === 0) {
        recentContainer.innerHTML = `<p class="text-sm text-slate-400 py-4 text-center">Belum ada catatan pengeluaran bulan ini.</p>`;
      } else {
        const sorted = [...this.data.expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        recentContainer.innerHTML = sorted.map(exp => `
          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 transition-colors border border-slate-100">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">
                <i class="fa-solid fa-arrow-trend-down"></i>
              </div>
              <div>
                <p class="font-semibold text-slate-800 text-sm">${this.escape(exp.title)}</p>
                <div class="flex items-center space-x-2 text-xs text-slate-500">
                  <span>${exp.date}</span>
                  <span>•</span>
                  <span class="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">${this.escape(exp.category)}</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <p class="font-bold text-red-600 text-sm">-Rp ${Number(exp.amount).toLocaleString('id-ID')}</p>
              ${exp.receiptUrl ? `
                <button onclick="App.viewReceipt(${exp.id})" class="text-xs text-emerald-600 hover:underline font-medium">
                  <i class="fa-regular fa-image mr-1"></i>Bukti Nota
                </button>
              ` : '<span class="text-xs text-slate-400 italic">Tanpa Nota</span>'}
            </div>
          </div>
        `).join('');
      }
    }
  },

  renderCharts() {
    const fin = this.getFinancials();
    if (window.Charts) {
      Charts.renderCashflow(fin.weeklyIncome, fin.weeklyExpense);
      Charts.renderCategory(fin.categoryMap);
    }
  },

  renderMatrix() {
    const tbody = document.getElementById('matrixTableBody');
    if (!tbody) return;

    const rate = Number(this.data.settings.cashPerWeek) || 5000;
    let students = [...this.data.students];

    // Search filter
    if (this.searchQuery) {
      students = students.filter(st => 
        st.name.toLowerCase().includes(this.searchQuery) || 
        st.absen.toString().includes(this.searchQuery)
      );
    }

    // Status filter
    if (this.activeFilter === 'owing') {
      students = students.filter(st => {
        const owingWeeks = ['w1', 'w2', 'w3', 'w4'].filter(w => !st.payments || !st.payments[w]);
        return owingWeeks.length > 0;
      });
    } else if (this.activeFilter === 'paid') {
      students = students.filter(st => {
        const owingWeeks = ['w1', 'w2', 'w3', 'w4'].filter(w => !st.payments || !st.payments[w]);
        return owingWeeks.length === 0;
      });
    }

    if (students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-8 text-slate-400">
            <i class="fa-solid fa-user-xmark text-3xl mb-2 block"></i>
            Tidak ada data siswa yang cocok dengan kriteria pencarian.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = students.map((st) => {
      const p = st.payments || {};
      const unpaidList = [];
      if (!p.w1) unpaidList.push('Minggu 1');
      if (!p.w2) unpaidList.push('Minggu 2');
      if (!p.w3) unpaidList.push('Minggu 3');
      if (!p.w4) unpaidList.push('Minggu 4');

      const isAllPaid = unpaidList.length === 0;
      const debtAmount = unpaidList.length * rate;

      return `
        <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
          <td class="px-4 py-3 text-center font-bold text-slate-500 text-sm">${st.absen}</td>
          <td class="px-4 py-3 font-semibold text-slate-800 text-sm whitespace-nowrap sticky-col">
            <div class="flex items-center space-x-2">
              <span>${this.escape(st.name)}</span>
              ${st.gender === 'P' ? '<span class="text-pink-400 text-xs">♀</span>' : '<span class="text-blue-400 text-xs">♂</span>'}
            </div>
            ${st.phone ? `<span class="text-[11px] text-slate-400 font-normal block">${st.phone}</span>` : ''}
          </td>
          
          <!-- Minggu 1 -->
          <td class="px-3 py-3 text-center">
            ${this.renderWeekBadge(st.id, 'w1', p.w1)}
          </td>

          <!-- Minggu 2 -->
          <td class="px-3 py-3 text-center">
            ${this.renderWeekBadge(st.id, 'w2', p.w2)}
          </td>

          <!-- Minggu 3 -->
          <td class="px-3 py-3 text-center">
            ${this.renderWeekBadge(st.id, 'w3', p.w3)}
          </td>

          <!-- Minggu 4 -->
          <td class="px-3 py-3 text-center">
            ${this.renderWeekBadge(st.id, 'w4', p.w4)}
          </td>

          <!-- Status & Tunggakan -->
          <td class="px-4 py-3 text-center whitespace-nowrap">
            ${isAllPaid ? `
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold badge-lunas">
                <i class="fa-solid fa-circle-check mr-1.5 text-emerald-600"></i>LUNAS BULAN INI
              </span>
            ` : `
              <div class="inline-flex flex-col items-center">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold badge-nunggak">
                  Nunggak ${unpaidList.length} Minggu
                </span>
                <span class="text-xs font-bold text-rose-600 mt-0.5">Rp ${debtAmount.toLocaleString('id-ID')}</span>
              </div>
            `}
          </td>

          <!-- Aksi / Reminder WA -->
          <td class="px-4 py-3 text-center whitespace-nowrap">
            <div class="flex items-center justify-center space-x-1.5">
              ${!isAllPaid ? `
                <button onclick="App.openWhatsAppReminder(${st.id})" 
                        title="Ingatkan via WhatsApp"
                        class="px-2.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-all flex items-center space-x-1">
                  <i class="fa-brands fa-whatsapp text-sm"></i>
                  <span>Tagih WA</span>
                </button>
              ` : `
                <span class="text-xs text-slate-400 italic">✓ Beres</span>
              `}

              ${this.isAdmin ? `
                <button onclick="App.deleteStudent(${st.id})" title="Hapus Siswa" class="p-1.5 text-slate-400 hover:text-rose-600 transition-colors">
                  <i class="fa-solid fa-trash-can text-sm"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderWeekBadge(studentId, weekKey, isPaid) {
    if (this.isAdmin) {
      return `
        <button onclick="App.togglePayment(${studentId}, '${weekKey}')" 
                title="Klik untuk ubah status"
                class="w-8 h-8 rounded-full inline-flex items-center justify-center transition-all shadow-sm ${
                  isPaid 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200' 
                    : 'bg-rose-100 hover:bg-rose-200 text-rose-600 border border-rose-300'
                }">
          <i class="fa-solid ${isPaid ? 'fa-check' : 'fa-xmark'} text-xs"></i>
        </button>
      `;
    } else {
      return `
        <span onclick="App.notifyStudentReadOnly()" 
              class="w-7 h-7 rounded-full inline-flex items-center justify-center cursor-pointer ${
                isPaid 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-rose-50 text-rose-500 border border-rose-200'
              }">
          <i class="fa-solid ${isPaid ? 'fa-check' : 'fa-minus'} text-xs"></i>
        </span>
      `;
    }
  },

  notifyStudentReadOnly() {
    this.showToast('Mode Siswa (Read-Only)', 'Untuk mengubah status kas, login sebagai Bendahara.', 'info');
  },

  togglePayment(studentId, weekKey) {
    if (!this.isAdmin) return;

    const student = this.data.students.find(s => s.id === studentId);
    if (!student) return;

    if (!student.payments) student.payments = {};
    student.payments[weekKey] = !student.payments[weekKey];

    Storage.save(this.data);
    this.render();

    const statusText = student.payments[weekKey] ? 'LUNAS' : 'BELUM DIBAYAR';
    this.showToast('Status Diperbarui', `${student.name} - ${weekKey.toUpperCase()} diubah ke ${statusText}`, 'success');

    if (student.payments[weekKey] && window.confetti) {
      window.confetti({ particleCount: 20, spread: 45, origin: { y: 0.85 } });
    }
  },

  markAllWeekPaid(weekKey) {
    if (!this.isAdmin) return;
    if (!confirm(`Tandai SEMUA siswa LUNAS untuk ${weekKey.toUpperCase()}?`)) return;

    this.data.students.forEach(st => {
      if (!st.payments) st.payments = {};
      st.payments[weekKey] = true;
    });

    Storage.save(this.data);
    this.render();
    this.showToast('Semua Ditandai Lunas', `Seluruh siswa berhasil ditandai Lunas untuk ${weekKey.toUpperCase()}`, 'success');
    if (window.confetti) {
      window.confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
    }
  },

  openWhatsAppReminder(studentId) {
    const student = this.data.students.find(s => s.id === studentId);
    if (!student) return;

    const rate = Number(this.data.settings.cashPerWeek) || 5000;
    const p = student.payments || {};
    const unpaidList = [];
    if (!p.w1) unpaidList.push('Minggu 1');
    if (!p.w2) unpaidList.push('Minggu 2');
    if (!p.w3) unpaidList.push('Minggu 3');
    if (!p.w4) unpaidList.push('Minggu 4');

    if (unpaidList.length === 0) {
      this.showToast('Siswa Sudah Lunas', `${student.name} sudah melunasi seluruh kas bulan ini.`, 'success');
      return;
    }

    const totalDebt = unpaidList.length * rate;
    const settings = this.data.settings;

    // Template pesan ramah & santun
    const message = 
`Halo ${student.name} 😊, 
Mohon maaf mengganggu waktunya yaa.

Kami dari bendahara kas kelas *${settings.className}* ingin menginfokan rincian uang kas untuk bulan *${settings.currentMonth}*:
📌 *Status:* Menunggak ${unpaidList.length} minggu (${unpaidList.join(', ')})
💰 *Total Tagihan:* Rp ${totalDebt.toLocaleString('id-ID')}

Pembayaran bisa langsung diserahkan tunai ke bendahara di kelas, atau transfer via:
💳 *${settings.paymentInfo || 'Dana / Transfer Bank'}*

Terima kasih banyak atas kerjasamanya yaa, semoga berkah selalu! 🙏✨
_${settings.treasurerName || 'Bendahara Kelas'}_`;

    // Fill modal reminder
    const modal = document.getElementById('modalWhatsApp');
    const txtRecipient = document.getElementById('waRecipient');
    const txtPhone = document.getElementById('waPhoneInput');
    const txtMessage = document.getElementById('waMessagePreview');
    const btnSend = document.getElementById('btnSendWA');

    if (txtRecipient) txtRecipient.textContent = student.name;
    if (txtPhone) txtPhone.value = student.phone || '';
    if (txtMessage) txtMessage.value = message;

    if (btnSend) {
      btnSend.onclick = () => {
        let phone = (txtPhone ? txtPhone.value : '').replace(/\D/g, '');
        if (phone.startsWith('0')) {
          phone = '62' + phone.substring(1);
        } else if (!phone.startsWith('62')) {
          phone = '62' + phone;
        }

        // Save phone back to student record
        student.phone = txtPhone.value.trim();
        Storage.save(this.data);

        const encoded = encodeURIComponent(txtMessage.value);
        const waUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`;
        window.open(waUrl, '_blank');
        modal.classList.add('hidden');
      };
    }

    if (modal) modal.classList.remove('hidden');
  },

  renderExpenses() {
    const list = document.getElementById('expensesListContainer');
    if (!list) return;

    if (this.data.expenses.length === 0) {
      list.innerHTML = `
        <div class="text-center py-12 text-slate-400">
          <i class="fa-solid fa-receipt text-4xl mb-3 block"></i>
          Belum ada catatan pengeluaran kelas.
        </div>`;
      return;
    }

    const sorted = [...this.data.expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    list.innerHTML = sorted.map(exp => `
      <div class="glass-card glass-card-hover p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200/80">
        <div class="flex items-start space-x-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-sm border border-emerald-100">
            <i class="fa-solid fa-receipt"></i>
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100/70 text-emerald-800">
                ${this.escape(exp.category)}
              </span>
              <span class="text-xs text-slate-400 font-medium"><i class="fa-regular fa-calendar mr-1"></i>${exp.date}</span>
            </div>
            <h4 class="font-bold text-slate-800 text-base">${this.escape(exp.title)}</h4>
            ${exp.description ? `<p class="text-sm text-slate-600 mt-1 leading-relaxed">${this.escape(exp.description)}</p>` : ''}
          </div>
        </div>

        <div class="flex items-center justify-between md:justify-end md:space-x-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div class="text-left md:text-right">
            <span class="text-xs text-slate-400 block font-medium">Nominal Pengeluaran</span>
            <span class="text-lg font-extrabold text-rose-600">Rp ${Number(exp.amount).toLocaleString('id-ID')}</span>
          </div>

          <div class="flex items-center space-x-2">
            ${exp.receiptUrl ? `
              <button onclick="App.viewReceipt(${exp.id})" 
                      class="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center space-x-1.5 border border-slate-200">
                <i class="fa-solid fa-image text-emerald-600"></i>
                <span>Lihat Nota</span>
              </button>
            ` : `
              <span class="text-xs text-slate-400 italic px-2">Tanpa Foto Nota</span>
            `}

            ${this.isAdmin ? `
              <button onclick="App.deleteExpense(${exp.id})" 
                      title="Hapus Pengeluaran"
                      class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                <i class="fa-solid fa-trash-can text-sm"></i>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');
  },

  viewReceipt(expenseId) {
    const exp = this.data.expenses.find(e => e.id === expenseId);
    if (!exp || !exp.receiptUrl) return;

    const modal = document.getElementById('modalReceiptViewer');
    const img = document.getElementById('viewerReceiptImg');
    const title = document.getElementById('viewerReceiptTitle');
    const meta = document.getElementById('viewerReceiptMeta');

    if (img) img.src = exp.receiptUrl;
    if (title) title.textContent = exp.title;
    if (meta) meta.textContent = `Tanggal: ${exp.date} • Kategori: ${exp.category} • Nominal: Rp ${Number(exp.amount).toLocaleString('id-ID')}`;

    if (modal) modal.classList.remove('hidden');
  },

  handleReceiptPreview(event) {
    const file = event.target.files[0];
    const previewContainer = document.getElementById('receiptPreviewBox');
    const previewImg = document.getElementById('receiptPreviewImg');

    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 3MB");
        event.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (previewImg) previewImg.src = e.target.result;
        if (previewContainer) previewContainer.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    } else {
      if (previewContainer) previewContainer.classList.add('hidden');
    }
  },

  handleSaveExpense(e) {
    e.preventDefault();
    if (!this.isAdmin) return;

    const date = document.getElementById('expenseDate').value;
    const title = document.getElementById('expenseTitle').value.trim();
    const category = document.getElementById('expenseCategory').value;
    const amount = Number(document.getElementById('expenseAmount').value);
    const description = document.getElementById('expenseDesc').value.trim();
    const previewImg = document.getElementById('receiptPreviewImg');
    const receiptUrl = previewImg && previewImg.src && !previewImg.src.endsWith('#') ? previewImg.src : null;

    if (!title || !amount || isNaN(amount) || amount <= 0) {
      alert("Harap isi nama keperluan dan nominal pengeluaran dengan benar.");
      return;
    }

    const newExpense = {
      id: Date.now(),
      date: date || new Date().toISOString().split('T')[0],
      title,
      category,
      amount,
      description,
      receiptUrl
    };

    this.data.expenses.push(newExpense);
    Storage.save(this.data);

    // Reset Form
    e.target.reset();
    document.getElementById('receiptPreviewBox').classList.add('hidden');
    document.getElementById('modalAddExpense').classList.add('hidden');

    this.render();
    this.showToast('Pengeluaran Dicatat', `Berhasil mencatat pengeluaran: ${title}`, 'success');
  },

  deleteExpense(expenseId) {
    if (!this.isAdmin) return;
    const exp = this.data.expenses.find(e => e.id === expenseId);
    if (!exp) return;

    if (confirm(`Hapus pengeluaran "${exp.title}" senilai Rp ${Number(exp.amount).toLocaleString('id-ID')}?`)) {
      this.data.expenses = this.data.expenses.filter(e => e.id !== expenseId);
      Storage.save(this.data);
      this.render();
      this.showToast('Pengeluaran Dihapus', 'Data pengeluaran telah dihapus.', 'info');
    }
  },

  handleSaveStudent(e) {
    e.preventDefault();
    if (!this.isAdmin) return;

    const absen = document.getElementById('studentAbsen').value.trim();
    const name = document.getElementById('studentName').value.trim();
    const gender = document.getElementById('studentGender').value;
    const phone = document.getElementById('studentPhone').value.trim();

    if (!absen || !name) {
      alert("Harap isi nomor absen dan nama siswa.");
      return;
    }

    const newStudent = {
      id: Date.now(),
      absen: absen.padStart(2, '0'),
      name,
      gender,
      phone,
      payments: { w1: false, w2: false, w3: false, w4: false }
    };

    this.data.students.push(newStudent);
    // Sort by absen
    this.data.students.sort((a, b) => Number(a.absen) - Number(b.absen));
    Storage.save(this.data);

    e.target.reset();
    document.getElementById('modalAddStudent').classList.add('hidden');
    this.render();
    this.showToast('Siswa Ditambahkan', `${name} berhasil didaftarkan ke kas kelas.`, 'success');
  },

  deleteStudent(studentId) {
    if (!this.isAdmin) return;
    const st = this.data.students.find(s => s.id === studentId);
    if (!st) return;

    if (confirm(`Yakin ingin menghapus ${st.name} (Absen ${st.absen}) dari daftar kelas?`)) {
      this.data.students = this.data.students.filter(s => s.id !== studentId);
      Storage.save(this.data);
      this.render();
      this.showToast('Siswa Dihapus', `Data ${st.name} telah dihapus.`, 'info');
    }
  },

  handleSaveSettings(e) {
    e.preventDefault();
    if (!this.isAdmin) return;

    this.data.settings.className = document.getElementById('setClassName').value.trim() || 'XII MIPA 2';
    this.data.settings.schoolName = document.getElementById('setSchoolName').value.trim() || 'SMA Negeri 1';
    this.data.settings.cashPerWeek = Number(document.getElementById('setCashRate').value) || 5000;
    this.data.settings.treasurerName = document.getElementById('setTreasurer').value.trim();
    this.data.settings.treasurerPhone = document.getElementById('setPhone').value.trim();
    this.data.settings.paymentInfo = document.getElementById('setPaymentInfo').value.trim();
    this.data.settings.currentMonth = document.getElementById('setMonth').value.trim() || 'Oktober 2026';

    const newPin = document.getElementById('setNewPin').value.trim();
    if (newPin) {
      if (newPin.length < 4) {
        alert("PIN minimal 4 karakter!");
        return;
      }
      this.data.settings.adminPin = newPin;
    }

    Storage.save(this.data);
    document.getElementById('modalSettings').classList.add('hidden');
    this.render();
    this.showToast('Pengaturan Disimpan', 'Konfigurasi kas kelas berhasil diperbarui.', 'success');
  },

  resetAllData() {
    if (!this.isAdmin) return;
    if (confirm("PERINGATAN: Apakah Anda yakin ingin mereset seluruh data kembali ke kondisi awal demo? Semua perubahan Anda akan dikembalikan.")) {
      this.data = Storage.reset();
      this.render();
      this.showToast('Data Direset', 'Data kas telah dikembalikan ke kondisi default.', 'info');
    }
  },

  exportToCSV() {
    const s = this.data.settings;
    const fin = this.getFinancials();
    const rate = Number(s.cashPerWeek) || 5000;

    let csv = `\uFEFFLAPORAN KEUANGAN KAS KELAS ${s.className.toUpperCase()}\n`;
    csv += `Sekolah: ${s.schoolName}\n`;
    csv += `Periode: ${s.currentMonth}\n`;
    csv += `Total Saldo Kas: Rp ${fin.balance.toLocaleString('id-ID')}\n`;
    csv += `Total Pemasukan: Rp ${fin.totalIncome.toLocaleString('id-ID')}\n`;
    csv += `Total Pengeluaran: Rp ${fin.totalExpense.toLocaleString('id-ID')}\n\n`;

    // Data Siswa Matrix
    csv += `DAFTAR PEMBAYARAN KAS SISWA (Tarif: Rp ${rate.toLocaleString('id-ID')}/minggu)\n`;
    csv += `No Absen,Nama Siswa,Gender,No HP,Minggu 1,Minggu 2,Minggu 3,Minggu 4,Status,Tunggakan (Rp)\n`;

    this.data.students.forEach(st => {
      const p = st.payments || {};
      const unpaid = [!p.w1, !p.w2, !p.w3, !p.w4].filter(Boolean).length;
      const status = unpaid === 0 ? 'LUNAS' : `Nunggak ${unpaid} Minggu`;
      const debt = unpaid * rate;
      csv += `"${st.absen}","${st.name}","${st.gender}","${st.phone || '-'}","${p.w1 ? 'LUNAS' : 'BELUM'}","${p.w2 ? 'LUNAS' : 'BELUM'}","${p.w3 ? 'LUNAS' : 'BELUM'}","${p.w4 ? 'LUNAS' : 'BELUM'}","${status}",${debt}\n`;
    });

    // Data Pengeluaran
    csv += `\nRINCIAN PENGELUARAN KAS KELAS\n`;
    csv += `ID,Tanggal,Kategori,Keperluan,Nominal (Rp),Keterangan,Ada Bukti Nota\n`;
    this.data.expenses.forEach(exp => {
      csv += `${exp.id},"${exp.date}","${exp.category}","${exp.title}",${exp.amount},"${exp.description || '-'}","${exp.receiptUrl ? 'YA' : 'TIDAK'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Kas_${s.className.replace(/\s+/g, '_')}_${s.currentMonth.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast('Ekspor Berhasil', 'File CSV laporan kas kelas telah diunduh.', 'success');
  },

  openQRModal() {
    const modal = document.getElementById('modalQR');
    const container = document.getElementById('qrCodeCanvasContainer');
    if (container) container.innerHTML = '';

    const currentUrl = window.location.href;
    const txtLink = document.getElementById('qrShareLink');
    if (txtLink) txtLink.value = currentUrl;

    if (window.QRCode && container) {
      new QRCode(container, {
        text: currentUrl,
        width: 190,
        height: 190,
        colorDark: "#047857",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    }

    if (modal) modal.classList.remove('hidden');
  },

  printOfficialReport() {
    window.print();
  },

  showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const colors = {
      success: 'bg-emerald-600 text-white',
      info: 'bg-indigo-600 text-white',
      error: 'bg-rose-600 text-white'
    };

    const icons = {
      success: 'fa-solid fa-circle-check',
      info: 'fa-solid fa-circle-info',
      error: 'fa-solid fa-triangle-exclamation'
    };

    toast.className = `flex items-start space-x-3 p-4 rounded-xl shadow-xl ${colors[type] || colors.info} transform transition-all duration-300 translate-y-2 opacity-0 z-50 max-w-sm`;
    toast.innerHTML = `
      <i class="${icons[type] || icons.info} text-lg mt-0.5"></i>
      <div class="flex-1">
        <h5 class="font-bold text-sm leading-tight">${title}</h5>
        <p class="text-xs opacity-90 mt-0.5 leading-snug">${message}</p>
      </div>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  escape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
};
