// ============================================================
// SEJUKPRO Admin Dashboard - JavaScript Logic
// Handles navigation, CRUD operations, charts, and Supabase integration
// ============================================================

// ============================================================
// NAVIGATION
// ============================================================

const pages = {
  dashboard: { title: 'Dashboard', breadcrumb: 'Overview & Analytics', load: loadDashboard },
  products: { title: 'Produk & Layanan', breadcrumb: 'Kelola Data Produk', load: loadProducts },
  payments: { title: 'Payment Methods', breadcrumb: 'Kelola Metode Pembayaran', load: loadPaymentMethods },
  bookings: { title: 'Data Booking', breadcrumb: 'Riwayat Pemesanan Pelanggan', load: loadBookings },
};

function navigateTo(pageId) {
  // Update sidebar active state
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector(`[data-page="${pageId}"]`);
  if (navItem) navItem.classList.add('active');

  // Update topbar
  const page = pages[pageId];
  if (page) {
    document.getElementById('pageTitle').textContent = page.title;
    document.getElementById('pageBreadcrumb').textContent = page.breadcrumb;
  }

  // Show page content
  document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
  const pageEl = document.getElementById('page' + pageId.charAt(0).toUpperCase() + pageId.slice(1));
  if (pageEl) pageEl.classList.add('active');

  // Load data
  if (page && page.load) page.load();

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
}

// Initialize navigation click handlers
document.querySelectorAll('.sidebar-nav .nav-item[data-page]').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    navigateTo(item.dataset.page);
  });
});

// Mobile sidebar toggle
document.getElementById('sidebarToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

function showToast(message, type = 'info') {
  const container = document.getElementById('adminToast');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ============================================================
// CONNECTION CHECK
// ============================================================

async function checkConnection() {
  const statusEl = document.getElementById('connectionStatus');
  try {
    await supabase.select('products', 'select=id&limit=1');
    statusEl.innerHTML = '<span class="status-dot"></span><span>Supabase Terhubung</span>';
    statusEl.classList.remove('error');
  } catch (err) {
    statusEl.innerHTML = '<span class="status-dot"></span><span>Koneksi Gagal</span>';
    statusEl.classList.add('error');
    showToast('Gagal terhubung ke Supabase. Pastikan tabel sudah dibuat.', 'error');
  }
}

// ============================================================
// DASHBOARD
// ============================================================

let chartInstances = {};

async function loadDashboard() {
  try {
    // Fetch all data
    const [bookings, products] = await Promise.all([
      supabase.select('bookings', 'select=*&order=created_at.desc'),
      supabase.select('products', 'select=*&is_active=eq.true'),
    ]);

    // Update stats
    document.getElementById('statTotalBookings').textContent = bookings.length;
    document.getElementById('statCompleted').textContent = bookings.filter(b => b.status === 'completed').length;
    document.getElementById('statPending').textContent = bookings.filter(b => b.status === 'pending').length;
    document.getElementById('statActiveProducts').textContent = products.length;

    // Render charts
    renderServicePieChart(bookings);
    renderStatusDoughnut(bookings);
    renderPaymentBarChart(bookings);

    // Render recent bookings table
    renderRecentBookings(bookings.slice(0, 5));

  } catch (err) {
    console.error('Dashboard load error:', err);
    showToast('Gagal memuat data dashboard', 'error');
  }
}

function renderServicePieChart(bookings) {
  const ctx = document.getElementById('chartServicePie');
  if (chartInstances.servicePie) chartInstances.servicePie.destroy();

  const serviceCounts = {};
  bookings.forEach(b => {
    const svc = b.service_type || 'Lainnya';
    serviceCounts[svc] = (serviceCounts[svc] || 0) + 1;
  });

  const labels = Object.keys(serviceCounts);
  const data = Object.values(serviceCounts);
  const colors = ['#38bdf8', '#6366f1', '#34d399', '#fb923c', '#f87171', '#a78bfa', '#fbbf24'];

  chartInstances.servicePie = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: '#0a0e1a',
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', font: { size: 11, family: 'Plus Jakarta Sans' }, padding: 12 }
        }
      }
    }
  });
}

function renderStatusDoughnut(bookings) {
  const ctx = document.getElementById('chartStatusDoughnut');
  if (chartInstances.statusDoughnut) chartInstances.statusDoughnut.destroy();

  const statusLabels = { pending: 'Pending', confirmed: 'Confirmed', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' };
  const statusColors = { pending: '#fb923c', confirmed: '#38bdf8', in_progress: '#a78bfa', completed: '#34d399', cancelled: '#f87171' };

  const statusCounts = {};
  bookings.forEach(b => {
    statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
  });

  const labels = Object.keys(statusCounts).map(k => statusLabels[k] || k);
  const data = Object.values(statusCounts);
  const colors = Object.keys(statusCounts).map(k => statusColors[k] || '#64748b');

  chartInstances.statusDoughnut = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: '#0a0e1a',
        borderWidth: 3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', font: { size: 11, family: 'Plus Jakarta Sans' }, padding: 12 }
        }
      }
    }
  });
}

function renderPaymentBarChart(bookings) {
  const ctx = document.getElementById('chartPaymentBar');
  if (chartInstances.paymentBar) chartInstances.paymentBar.destroy();

  const paymentCounts = {};
  bookings.forEach(b => {
    const pm = b.payment_method || 'Tidak Diketahui';
    paymentCounts[pm] = (paymentCounts[pm] || 0) + 1;
  });

  const labels = Object.keys(paymentCounts);
  const data = Object.values(paymentCounts);

  chartInstances.paymentBar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Jumlah Booking',
        data,
        backgroundColor: ['rgba(56, 189, 248, 0.6)', 'rgba(52, 211, 153, 0.6)', 'rgba(251, 191, 36, 0.6)', 'rgba(167, 139, 250, 0.6)'],
        borderColor: ['#38bdf8', '#34d399', '#fbbf24', '#a78bfa'],
        borderWidth: 1,
        borderRadius: 8,
        maxBarThickness: 60,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8', font: { size: 11, family: 'Plus Jakarta Sans' } },
          grid: { color: 'rgba(56, 189, 248, 0.05)' }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#94a3b8', stepSize: 1, font: { size: 11 } },
          grid: { color: 'rgba(56, 189, 248, 0.05)' }
        }
      }
    }
  });
}

function renderRecentBookings(bookings) {
  const tbody = document.getElementById('recentBookingsBody');
  if (bookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="table-loading">Belum ada data booking</td></tr>';
    return;
  }
  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td><strong>${escHtml(b.customer_name)}</strong></td>
      <td>${escHtml(b.service_type)}</td>
      <td>${b.visit_date ? formatDate(b.visit_date) : '-'}</td>
      <td><span class="badge badge-${b.status}">${b.status}</span></td>
    </tr>
  `).join('');
}

// ============================================================
// PRODUCTS CRUD
// ============================================================

let productsData = [];

async function loadProducts() {
  const tbody = document.getElementById('productsBody');
  tbody.innerHTML = '<tr><td colspan="7" class="table-loading">Memuat data produk...</td></tr>';

  try {
    productsData = await supabase.select('products', 'select=*&order=sort_order.asc');
    renderProductsTable(productsData);
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" class="table-loading">Gagal memuat data produk</td></tr>';
    showToast('Gagal memuat produk: ' + err.message, 'error');
  }
}

function renderProductsTable(products) {
  const tbody = document.getElementById('productsBody');
  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="table-loading">Belum ada produk</td></tr>';
    return;
  }
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>${p.sort_order}</td>
      <td><strong>${escHtml(p.name)}</strong><br><small style="color:var(--text-muted)">${escHtml((p.description || '').substring(0, 60))}...</small></td>
      <td><strong>${escHtml(p.price_amount)}</strong><br><small style="color:var(--text-muted)">${escHtml(p.price_unit || '')}</small></td>
      <td>${p.badge_text ? `<span class="badge badge-${p.badge_type || 'default'}">${escHtml(p.badge_text)}</span>` : '-'}</td>
      <td>${p.is_featured ? '⭐' : '-'}</td>
      <td><span class="badge badge-${p.is_active ? 'active' : 'inactive'}">${p.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn-icon-sm" onclick="editProduct('${p.id}')" title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon-sm danger" onclick="deleteProduct('${p.id}')" title="Hapus">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openProductModal(product = null) {
  const modal = document.getElementById('productModal');
  const form = document.getElementById('productForm');
  form.reset();

  if (product) {
    document.getElementById('productModalTitle').textContent = 'Edit Produk';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productDesc').value = product.description || '';
    document.getElementById('productPriceLabel').value = product.price_label || '';
    document.getElementById('productPriceAmount').value = product.price_amount || '';
    document.getElementById('productPriceUnit').value = product.price_unit || '';
    document.getElementById('productFeatures').value = (product.features || []).join('\n');
    document.getElementById('productBadge').value = product.badge_text || '';
    document.getElementById('productBadgeType').value = product.badge_type || 'default';
    document.getElementById('productSortOrder').value = product.sort_order || 0;
    document.getElementById('productCtaText').value = product.cta_text || '';
    document.getElementById('productCtaValue').value = product.cta_service_value || '';
    document.getElementById('productFeatured').checked = product.is_featured || false;
    document.getElementById('productActive').checked = product.is_active !== false;
  } else {
    document.getElementById('productModalTitle').textContent = 'Tambah Produk Baru';
    document.getElementById('productId').value = '';
    document.getElementById('productActive').checked = true;
  }

  modal.classList.add('active');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('active');
}

function editProduct(id) {
  const product = productsData.find(p => p.id === id);
  if (product) openProductModal(product);
}

async function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('productId').value;
  const featuresText = document.getElementById('productFeatures').value;
  const features = featuresText.split('\n').map(f => f.trim()).filter(f => f);

  const data = {
    name: document.getElementById('productName').value,
    description: document.getElementById('productDesc').value,
    price_label: document.getElementById('productPriceLabel').value,
    price_amount: document.getElementById('productPriceAmount').value,
    price_unit: document.getElementById('productPriceUnit').value,
    features: features,
    badge_text: document.getElementById('productBadge').value || null,
    badge_type: document.getElementById('productBadgeType').value,
    sort_order: parseInt(document.getElementById('productSortOrder').value) || 0,
    cta_text: document.getElementById('productCtaText').value,
    cta_service_value: document.getElementById('productCtaValue').value,
    is_featured: document.getElementById('productFeatured').checked,
    is_active: document.getElementById('productActive').checked,
  };

  try {
    if (id) {
      await supabase.update('products', `id=eq.${id}`, data);
      showToast('Produk berhasil diperbarui!', 'success');
    } else {
      await supabase.insert('products', data);
      showToast('Produk baru berhasil ditambahkan!', 'success');
    }
    closeProductModal();
    loadProducts();
  } catch (err) {
    showToast('Gagal menyimpan produk: ' + err.message, 'error');
  }
}

async function deleteProduct(id) {
  if (!confirm('Yakin ingin menghapus produk ini?')) return;
  try {
    await supabase.delete('products', `id=eq.${id}`);
    showToast('Produk berhasil dihapus', 'success');
    loadProducts();
  } catch (err) {
    showToast('Gagal menghapus produk: ' + err.message, 'error');
  }
}

// ============================================================
// PAYMENT METHODS CRUD
// ============================================================

let paymentMethodsData = [];

async function loadPaymentMethods() {
  const tbody = document.getElementById('paymentsBody');
  tbody.innerHTML = '<tr><td colspan="6" class="table-loading">Memuat data payment...</td></tr>';

  try {
    paymentMethodsData = await supabase.select('payment_methods', 'select=*&order=sort_order.asc');
    renderPaymentTable(paymentMethodsData);
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" class="table-loading">Gagal memuat data</td></tr>';
    showToast('Gagal memuat payment methods: ' + err.message, 'error');
  }
}

function renderPaymentTable(methods) {
  const tbody = document.getElementById('paymentsBody');
  if (methods.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="table-loading">Belum ada payment method</td></tr>';
    return;
  }
  tbody.innerHTML = methods.map(m => `
    <tr>
      <td>${m.sort_order}</td>
      <td style="font-size:1.5rem">${m.icon || '💳'}</td>
      <td><strong>${escHtml(m.name)}</strong></td>
      <td>${escHtml(m.description || '-')}</td>
      <td><span class="badge badge-${m.is_active ? 'active' : 'inactive'}">${m.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn-icon-sm" onclick="editPaymentMethod('${m.id}')" title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon-sm danger" onclick="deletePaymentMethod('${m.id}')" title="Hapus">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openPaymentModal(method = null) {
  const modal = document.getElementById('paymentModal');
  document.getElementById('paymentForm').reset();

  if (method) {
    document.getElementById('paymentModalTitle').textContent = 'Edit Payment Method';
    document.getElementById('paymentMethodId').value = method.id;
    document.getElementById('paymentIcon').value = method.icon || '💳';
    document.getElementById('paymentName').value = method.name || '';
    document.getElementById('paymentDescription').value = method.description || '';
    document.getElementById('paymentSortOrder').value = method.sort_order || 0;
    document.getElementById('paymentActiveCheck').checked = method.is_active !== false;
  } else {
    document.getElementById('paymentModalTitle').textContent = 'Tambah Payment Method';
    document.getElementById('paymentMethodId').value = '';
    document.getElementById('paymentActiveCheck').checked = true;
  }

  modal.classList.add('active');
}

function closePaymentModal() {
  document.getElementById('paymentModal').classList.remove('active');
}

function editPaymentMethod(id) {
  const method = paymentMethodsData.find(m => m.id === id);
  if (method) openPaymentModal(method);
}

async function savePaymentMethod(e) {
  e.preventDefault();
  const id = document.getElementById('paymentMethodId').value;

  const data = {
    name: document.getElementById('paymentName').value,
    description: document.getElementById('paymentDescription').value,
    icon: document.getElementById('paymentIcon').value || '💳',
    sort_order: parseInt(document.getElementById('paymentSortOrder').value) || 0,
    is_active: document.getElementById('paymentActiveCheck').checked,
  };

  try {
    if (id) {
      await supabase.update('payment_methods', `id=eq.${id}`, data);
      showToast('Payment method berhasil diperbarui!', 'success');
    } else {
      await supabase.insert('payment_methods', data);
      showToast('Payment method baru berhasil ditambahkan!', 'success');
    }
    closePaymentModal();
    loadPaymentMethods();
  } catch (err) {
    showToast('Gagal menyimpan payment method: ' + err.message, 'error');
  }
}

async function deletePaymentMethod(id) {
  if (!confirm('Yakin ingin menghapus payment method ini?')) return;
  try {
    await supabase.delete('payment_methods', `id=eq.${id}`);
    showToast('Payment method berhasil dihapus', 'success');
    loadPaymentMethods();
  } catch (err) {
    showToast('Gagal menghapus: ' + err.message, 'error');
  }
}

// ============================================================
// BOOKINGS
// ============================================================

async function loadBookings() {
  const tbody = document.getElementById('bookingsBody');
  tbody.innerHTML = '<tr><td colspan="8" class="table-loading">Memuat data booking...</td></tr>';

  try {
    let query = 'select=*&order=created_at.desc';
    const filter = document.getElementById('bookingStatusFilter').value;
    if (filter) query += `&status=eq.${filter}`;

    const bookings = await supabase.select('bookings', query);
    renderBookingsTable(bookings);
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="8" class="table-loading">Gagal memuat data</td></tr>';
    showToast('Gagal memuat bookings: ' + err.message, 'error');
  }
}

function renderBookingsTable(bookings) {
  const tbody = document.getElementById('bookingsBody');
  if (bookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="table-loading">Tidak ada data booking</td></tr>';
    return;
  }
  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td>
        <strong>${escHtml(b.customer_name)}</strong>
      </td>
      <td><a href="https://wa.me/${formatPhoneWa(b.customer_phone)}" target="_blank" style="color:var(--accent-green);text-decoration:none">${escHtml(b.customer_phone)}</a></td>
      <td>${escHtml(b.service_type)}</td>
      <td>${escHtml(b.unit_count || '-')}</td>
      <td>${b.visit_date ? formatDate(b.visit_date) : '-'}<br><small style="color:var(--text-muted)">${escHtml(b.time_slot || '')}</small></td>
      <td>${escHtml(b.payment_method || '-')}</td>
      <td>
        <select class="status-select" onchange="updateBookingStatus('${b.id}', this.value)">
          <option value="pending" ${b.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="confirmed" ${b.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="in_progress" ${b.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
          <option value="completed" ${b.status === 'completed' ? 'selected' : ''}>Completed</option>
          <option value="cancelled" ${b.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-icon-sm" onclick="viewBookingDetail('${b.id}')" title="Lihat Detail">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="btn-icon-sm danger" onclick="deleteBooking('${b.id}')" title="Hapus">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function updateBookingStatus(id, newStatus) {
  try {
    await supabase.update('bookings', `id=eq.${id}`, { status: newStatus });
    showToast(`Status booking diubah ke: ${newStatus}`, 'success');
  } catch (err) {
    showToast('Gagal mengubah status: ' + err.message, 'error');
    loadBookings();
  }
}

let bookingsCache = [];
async function viewBookingDetail(id) {
  try {
    const bookings = await supabase.select('bookings', `id=eq.${id}`);
    if (bookings.length === 0) return;
    const b = bookings[0];

    document.getElementById('bookingDetailBody').innerHTML = `
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label">Nama Pelanggan</div>
          <div class="detail-value">${escHtml(b.customer_name)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">No. HP / WhatsApp</div>
          <div class="detail-value">${escHtml(b.customer_phone)}</div>
        </div>
        <div class="detail-item detail-full">
          <div class="detail-label">Alamat</div>
          <div class="detail-value">${escHtml(b.customer_address || '-')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Layanan</div>
          <div class="detail-value">${escHtml(b.service_type)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Jumlah Unit</div>
          <div class="detail-value">${escHtml(b.unit_count || '-')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Merk & Tipe AC</div>
          <div class="detail-value">${escHtml(b.ac_brand || '-')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Tanggal Kunjungan</div>
          <div class="detail-value">${b.visit_date ? formatDate(b.visit_date) : '-'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Jam Kedatangan</div>
          <div class="detail-value">${escHtml(b.time_slot || '-')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Pembayaran</div>
          <div class="detail-value">${escHtml(b.payment_method || '-')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Status</div>
          <div class="detail-value"><span class="badge badge-${b.status}">${b.status}</span></div>
        </div>
        <div class="detail-item detail-full">
          <div class="detail-label">Catatan</div>
          <div class="detail-value">${escHtml(b.notes || 'Tidak ada catatan')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Dibuat</div>
          <div class="detail-value">${formatDateTime(b.created_at)}</div>
        </div>
      </div>
    `;

    document.getElementById('bookingDetailModal').classList.add('active');
  } catch (err) {
    showToast('Gagal memuat detail booking', 'error');
  }
}

function closeBookingDetailModal() {
  document.getElementById('bookingDetailModal').classList.remove('active');
}

async function deleteBooking(id) {
  if (!confirm('Yakin ingin menghapus booking ini?')) return;
  try {
    await supabase.delete('bookings', `id=eq.${id}`);
    showToast('Booking berhasil dihapus', 'success');
    loadBookings();
  } catch (err) {
    showToast('Gagal menghapus booking: ' + err.message, 'error');
  }
}

// ============================================================
// UTILITIES
// ============================================================

function escHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return dateStr; }
}

function formatPhoneWa(phone) {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) clean = '62' + clean.substring(1);
  return clean;
}

// ============================================================
// AUTHENTICATION & SESSION MANAGEMENT
// ============================================================

let currentAdminUser = null;

function switchAuthTab(tab) {
  hideAuthAlert();
  const tabLogin = document.getElementById('tabBtnLogin');
  const tabRegister = document.getElementById('tabBtnRegister');
  const formLogin = document.getElementById('adminLoginForm');
  const formRegister = document.getElementById('adminRegisterForm');

  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    formLogin.style.display = 'flex';
    formRegister.style.display = 'none';
    const emailInput = document.getElementById('loginEmail');
    if (emailInput) emailInput.focus();
  } else {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    formRegister.style.display = 'flex';
    formLogin.style.display = 'none';
    const nameInput = document.getElementById('registerName');
    if (nameInput) nameInput.focus();
  }
}

function showAuthAlert(message, type = 'error') {
  const alertEl = document.getElementById('authAlert');
  const iconEl = document.getElementById('authAlertIcon');
  const textEl = document.getElementById('authAlertText');
  if (!alertEl) return;

  alertEl.className = `auth-alert ${type}`;
  iconEl.textContent = type === 'success' ? '✅' : '⚠️';
  textEl.textContent = message;
  alertEl.style.display = 'flex';
}

function hideAuthAlert() {
  const alertEl = document.getElementById('authAlert');
  if (alertEl) alertEl.style.display = 'none';
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';

  if (isPassword) {
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  } else {
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  }
}

function updateAdminProfileUI(user) {
  currentAdminUser = user;
  const emailEl = document.getElementById('adminEmailDisplay');
  const roleEl = document.getElementById('adminRoleDisplay');
  const avatarEl = document.getElementById('adminAvatar');

  if (!user) {
    if (emailEl) emailEl.textContent = 'Belum Login';
    if (roleEl) roleEl.textContent = 'Tamu';
    if (avatarEl) avatarEl.textContent = '??';
    return;
  }

  const email = user.email || 'admin@sejukpro.com';
  const name = user.user_metadata?.name || email.split('@')[0];
  const isDemo = user.is_demo || user.id === 'demo-admin-id';

  if (emailEl) emailEl.textContent = email;
  if (roleEl) roleEl.textContent = isDemo ? 'Demo Mode' : (user.user_metadata?.role || 'Super Admin');

  if (avatarEl) {
    const initials = name.substring(0, 2).toUpperCase();
    avatarEl.textContent = initials;
    avatarEl.title = `${name} (${email})`;
  }
}

function showLoginModal() {
  const overlay = document.getElementById('adminLoginOverlay');
  if (overlay) {
    overlay.classList.add('active');
    setTimeout(() => {
      const emailInput = document.getElementById('loginEmail');
      if (emailInput && !emailInput.value) emailInput.focus();
    }, 150);
  }
}

function hideLoginModal() {
  const overlay = document.getElementById('adminLoginOverlay');
  if (overlay) overlay.classList.remove('active');
  hideAuthAlert();
}

async function handleAdminLogin(event) {
  event.preventDefault();
  hideAuthAlert();

  const emailInput = document.getElementById('loginEmail');
  const pwdInput = document.getElementById('loginPassword');
  const submitBtn = document.getElementById('btnLoginSubmit');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnSpinner = submitBtn.querySelector('.btn-spinner');

  const email = emailInput.value.trim();
  const password = pwdInput.value;

  if (!email || !password) {
    showAuthAlert('Email dan kata sandi wajib diisi.');
    return;
  }

  // Set loading
  submitBtn.disabled = true;
  if (btnText) btnText.textContent = 'Memverifikasi...';
  if (btnSpinner) btnSpinner.style.display = 'inline-block';

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      showAuthAlert(error.message || 'Login gagal. Periksa kembali kredensial Anda.');
      return;
    }

    // Login Sukses
    showToast(`Selamat datang kembali, ${data.user.email}!`, 'success');
    updateAdminProfileUI(data.user);
    hideLoginModal();

    // Reset password field
    pwdInput.value = '';

    // Muat data dashboard
    checkConnection();
    loadDashboard();
  } catch (err) {
    showAuthAlert(err.message || 'Terjadi kesalahan sistem saat mencoba login.');
  } finally {
    submitBtn.disabled = false;
    if (btnText) btnText.textContent = 'Masuk ke Dashboard';
    if (btnSpinner) btnSpinner.style.display = 'none';
  }
}

async function handleAdminRegister(event) {
  event.preventDefault();
  hideAuthAlert();

  const nameInput = document.getElementById('registerName');
  const emailInput = document.getElementById('registerEmail');
  const pwdInput = document.getElementById('registerPassword');
  const submitBtn = document.getElementById('btnRegisterSubmit');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnSpinner = submitBtn.querySelector('.btn-spinner');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = pwdInput.value;

  if (!name || !email || !password) {
    showAuthAlert('Seluruh kolom formulir pendaftaran wajib diisi.');
    return;
  }

  if (password.length < 6) {
    showAuthAlert('Kata sandi minimal 6 karakter.');
    return;
  }

  submitBtn.disabled = true;
  if (btnText) btnText.textContent = 'Mendaftarkan...';
  if (btnSpinner) btnSpinner.style.display = 'inline-block';

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      metadata: { name }
    });

    if (error) {
      showAuthAlert(error.message || 'Pendaftaran admin gagal.');
      return;
    }

    showAuthAlert('Pendaftaran berhasil! Jika konfirmasi email aktif, silakan periksa inbox email Anda, atau Anda sekarang dapat langsung masuk.', 'success');
    showToast('Akun admin berhasil didaftarkan!', 'success');

    // Jika dapat auto-session
    if (data.session || data.access_token) {
      const user = data.user || { email, user_metadata: { name } };
      updateAdminProfileUI(user);
      setTimeout(() => {
        hideLoginModal();
        checkConnection();
        loadDashboard();
      }, 1000);
    } else {
      setTimeout(() => {
        switchAuthTab('login');
        const loginEmail = document.getElementById('loginEmail');
        if (loginEmail) loginEmail.value = email;
      }, 1500);
    }
  } catch (err) {
    showAuthAlert(err.message || 'Terjadi kesalahan saat pendaftaran.');
  } finally {
    submitBtn.disabled = false;
    if (btnText) btnText.textContent = 'Daftarkan Admin';
    if (btnSpinner) btnSpinner.style.display = 'none';
  }
}

function handleDemoLogin() {
  const { data } = supabase.auth.signInDemo('admin.demo@sejukpro.com');
  updateAdminProfileUI(data.user);
  hideLoginModal();
  showToast('Masuk dalam Mode Demo (Bypass Supabase Auth)', 'info');
  checkConnection();
  loadDashboard();
}

async function handleAdminLogout() {
  if (!confirm('Apakah Anda yakin ingin keluar (logout) dari panel admin?')) {
    return;
  }

  try {
    await supabase.auth.signOut();
    updateAdminProfileUI(null);
    showToast('Anda telah berhasil keluar.', 'info');
    showLoginModal();
  } catch (err) {
    console.error('Error saat logout:', err);
    showLoginModal();
  }
}

// Cek status autentikasi saat aplikasi pertama kali dimuat
async function checkAuthState() {
  const session = supabase.auth.getSession();

  if (session && session.user) {
    // Validasi atau perbarui data user
    updateAdminProfileUI(session.user);
    hideLoginModal();
    checkConnection();
    loadDashboard();

    // Verifikasi background token ke Supabase
    try {
      const liveUser = await supabase.auth.getUser();
      if (liveUser) {
        updateAdminProfileUI(liveUser);
      }
    } catch (e) {
      // jika expired token ditangani oleh supabase-config
    }
  } else {
    // Belum login: tampilkan login modal
    updateAdminProfileUI(null);
    showLoginModal();
  }
}

// ============================================================
// INITIALIZE & EVENT LISTENERS
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Bind Logout Buttons
  const sidebarLogout = document.getElementById('sidebarLogoutBtn');
  if (sidebarLogout) {
    sidebarLogout.addEventListener('click', (e) => {
      e.preventDefault();
      handleAdminLogout();
    });
  }

  const topbarLogout = document.getElementById('topbarLogoutBtn');
  if (topbarLogout) {
    topbarLogout.addEventListener('click', (e) => {
      e.preventDefault();
      handleAdminLogout();
    });
  }

  // Tangani event unauthorized (token habis masa berlakunya)
  window.addEventListener('supabase:unauthorized', () => {
    showToast('Sesi Anda telah berakhir. Silakan login kembali.', 'error');
    updateAdminProfileUI(null);
    showLoginModal();
  });

  // Periksa session admin
  checkAuthState();
});

