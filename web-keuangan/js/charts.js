/**
 * KasKita - Visualisasi Grafik Keuangan (Chart.js)
 */

let cashflowChartInstance = null;
let categoryChartInstance = null;

const Charts = {
  renderCashflow(weeklyIncome, weeklyExpense) {
    const ctx = document.getElementById('cashflowChart');
    if (!ctx) return;

    if (cashflowChartInstance) {
      cashflowChartInstance.destroy();
    }

    const labels = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];

    cashflowChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Pemasukan Kas',
            data: weeklyIncome,
            backgroundColor: 'rgba(16, 185, 129, 0.85)',
            borderColor: '#059669',
            borderWidth: 1.5,
            borderRadius: 8,
            borderSkipped: false,
          },
          {
            label: 'Pengeluaran',
            data: weeklyExpense,
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: '#dc2626',
            borderWidth: 1.5,
            borderRadius: 8,
            borderSkipped: false,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: { family: "'Plus Jakarta Sans', sans-serif", weight: '600' },
              usePointStyle: true,
              boxWidth: 8
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 12,
            titleFont: { family: "'Outfit', sans-serif", size: 14 },
            bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: Rp ${Number(context.raw).toLocaleString('id-ID')}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: "'Plus Jakarta Sans', sans-serif" } }
          },
          y: {
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: {
              font: { family: "'Plus Jakarta Sans', sans-serif" },
              callback: function(value) {
                return 'Rp ' + (value >= 1000 ? (value / 1000) + 'k' : value);
              }
            }
          }
        }
      }
    });
  },

  renderCategory(categoryMap) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    if (categoryChartInstance) {
      categoryChartInstance.destroy();
    }

    const categories = Object.keys(categoryMap);
    const values = Object.values(categoryMap);

    if (categories.length === 0) {
      categories.push("Belum ada pengeluaran");
      values.push(1);
    }

    const palette = [
      '#6366f1', // Indigo
      '#10b981', // Emerald
      '#f59e0b', // Amber
      '#ec4899', // Pink
      '#06b6d4', // Cyan
      '#8b5cf6', // Violet
      '#f43f5e'  // Rose
    ];

    categoryChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: values,
          backgroundColor: palette.slice(0, categories.length),
          hoverOffset: 6,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
              usePointStyle: true,
              boxWidth: 8,
              padding: 12
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const val = context.raw;
                const percentage = total > 0 ? Math.round((val / total) * 100) : 0;
                return ` ${context.label}: Rp ${Number(val).toLocaleString('id-ID')} (${percentage}%)`;
              }
            }
          }
        },
        cutout: '68%'
      }
    });
  }
};
