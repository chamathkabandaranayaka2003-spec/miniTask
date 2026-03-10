const STORAGE_KEY = 'budgetDashboardTheme';
const DEFAULT_ALLOWANCE = 2000;

const elements = {
  body: document.documentElement,
  themeToggle: document.getElementById('themeToggle'),
  themeLabel: document.getElementById('themeLabel'),
  monthSelect: document.getElementById('monthSelect'),
  allowanceValue: document.getElementById('allowanceValue'),
  remainingValue: document.getElementById('remainingValue'),
  burnRateValue: document.getElementById('burnRateValue'),
  needsValue: document.getElementById('needsValue'),
  wantsValue: document.getElementById('wantsValue'),
  savingsValue: document.getElementById('savingsValue'),
  chartCanvas: document.getElementById('burnChart'),
};

// Sample monthly spending data for demonstration.
// Each month contains a daily series (1..n days) for needs/wants/savings.
function makeSeries(days, base, variance, step) {
  return Array.from({ length: days }, (_, i) => {
    const oscillation = Math.sin((i / days) * Math.PI * 2);
    const jitter = (i % step) * (variance / step);
    return Number((base + oscillation * variance * 0.5 + jitter).toFixed(2));
  });
}

const monthlySpending = {
  January: {
    needs: makeSeries(30, 95, 35, 5),
    wants: makeSeries(30, 50, 40, 6),
    savings: makeSeries(30, 55, 18, 7),
  },
  February: {
    needs: makeSeries(28, 105, 30, 5),
    wants: makeSeries(28, 45, 42, 6),
    savings: makeSeries(28, 50, 15, 8),
  },
  March: {
    needs: makeSeries(30, 98, 33, 5),
    wants: makeSeries(30, 48, 38, 6),
    savings: makeSeries(30, 58, 22, 7),
  },
};

function getThemeFromStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'dark';
}

function persistTheme(isDark) {
  localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
}

function applyTheme(isDark) {
  elements.body.classList.toggle('dark', isDark);
  elements.themeToggle.setAttribute('aria-pressed', String(isDark));
  elements.themeLabel.textContent = isDark ? 'Dark' : 'Light';
}

function calculateTotals(spending) {
  const totals = { needs: 0, wants: 0, savings: 0 };
  for (const category of Object.keys(spending)) {
    totals[category] = spending[category].reduce((sum, value) => sum + value, 0);
  }
  return totals;
}

function calculateBurnRate(totalSpent, allowance) {
  if (allowance <= 0) return 0;
  return Math.min(100, (totalSpent / allowance) * 100);
}

function formatCurrency(value) {
  return value.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

function calculateDailyTotals(spending) {
  const days = spending.needs.map((_, idx) => {
    const dailySum = spending.needs[idx] + spending.wants[idx] + spending.savings[idx];
    return Number(dailySum.toFixed(2));
  });
  return days;
}

function calculateCumulative(values) {
  const cumulative = [];
  values.reduce((acc, value, idx) => {
    const next = acc + value;
    cumulative[idx] = Number(next.toFixed(2));
    return next;
  }, 0);
  return cumulative;
}

function buildLabels(dayCount) {
  return Array.from({ length: dayCount }, (_, i) => `Day ${i + 1}`);
}

function createChart(ctx, labels, allowedLine, expenseCumulative, theme) {
  const isDark = theme === 'dark';
  const overBudget = expenseCumulative.some((val) => val > allowedLine[0]);

  const accent = isDark ? 'rgba(0, 242, 255, 1)' : 'rgba(30, 64, 175, 1)';
  const accentFill = isDark ? 'rgba(0, 242, 255, 0.22)' : 'rgba(30, 64, 175, 0.16)';
  const warning = 'rgba(239, 68, 68, 1)';
  const warningFill = 'rgba(239, 68, 68, 0.2)';

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Allowance',
          data: allowedLine,
          borderColor: 'rgba(148, 163, 184, 0.6)',
          borderDash: [6, 6],
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
        },
        {
          label: 'Cumulative Expenses',
          data: expenseCumulative,
          borderColor: overBudget ? warning : accent,
          backgroundColor: overBudget ? warningFill : accentFill,
          fill: '-1',
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: 'rgba(255,255,255,0.9)',
          pointBorderColor: overBudget ? warning : accent,
          pointHoverRadius: 7,
          borderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: isDark ? 'rgba(231,238,252,0.85)' : 'rgba(16,42,67,0.85)' },
        },
        y: {
          grid: { color: isDark ? 'rgba(231,238,252,0.12)' : 'rgba(16,42,67,0.12)' },
          ticks: {
            color: isDark ? 'rgba(231,238,252,0.75)' : 'rgba(16,42,67,0.75)',
            callback: (value) => `$${value}`,
          },
        },
      },
      plugins: {
        legend: { display: true, position: 'top' },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: isDark ? 'rgba(5, 15, 30, 0.92)' : 'rgba(255, 255, 255, 0.92)',
          borderColor: isDark ? 'rgba(0, 242, 255, 0.45)' : 'rgba(30, 64, 175, 0.28)',
          borderWidth: 1,
          titleColor: isDark ? '#e7eefc' : '#0f172a',
          bodyColor: isDark ? '#e7eefc' : '#0f172a',
          callbacks: {
            title: (items) => items[0]?.label ?? '',
            label: (ctx) => {
              const value = ctx.parsed.y;
              return `${ctx.dataset.label}: ${formatCurrency(value)}`;
            },
          },
        },
      },
      animations: {
        tension: {
          duration: 700,
          easing: 'easeOutQuart',
          from: 0.4,
          to: 0.35,
        },
      },
    },
  });

  return chart;
}

function populateMonthOptions() {
  const monthNames = Object.keys(monthlySpending);
  monthNames.forEach((month) => {
    const option = document.createElement('option');
    option.value = month;
    option.textContent = month;
    elements.monthSelect.append(option);
  });
  elements.monthSelect.value = monthNames[0];
}

function updateChartData(chart, allowance, cumulative, theme) {
  const overBudget = cumulative.some((val) => val > allowance);
  const isDark = theme === 'dark';
  const accent = isDark ? 'rgba(0, 242, 255, 1)' : 'rgba(30, 64, 175, 1)';
  const accentFill = isDark ? 'rgba(0, 242, 255, 0.22)' : 'rgba(30, 64, 175, 0.16)';
  const warning = 'rgba(239, 68, 68, 1)';
  const warningFill = 'rgba(239, 68, 68, 0.2)';

  const labels = buildLabels(cumulative.length);
  chart.data.labels = labels;
  chart.data.datasets[0].data = Array(cumulative.length).fill(allowance);
  chart.data.datasets[1].data = cumulative;

  chart.data.datasets[1].borderColor = overBudget ? warning : accent;
  chart.data.datasets[1].backgroundColor = overBudget ? warningFill : accentFill;
  chart.data.datasets[1].pointBorderColor = overBudget ? warning : accent;

  chart.options.scales.x.ticks.color = isDark ? 'rgba(231,238,252,0.85)' : 'rgba(16,42,67,0.85)';
  chart.options.scales.y.ticks.color = isDark ? 'rgba(231,238,252,0.75)' : 'rgba(16,42,67,0.75)';
  chart.options.scales.y.grid.color = isDark ? 'rgba(231,238,252,0.12)' : 'rgba(16,42,67,0.12)';
  chart.options.plugins.tooltip.backgroundColor = isDark ? 'rgba(5, 15, 30, 0.92)' : 'rgba(255, 255, 255, 0.92)';
  chart.options.plugins.tooltip.borderColor = isDark ? 'rgba(0, 242, 255, 0.45)' : 'rgba(30, 64, 175, 0.28)';
  chart.options.plugins.tooltip.titleColor = isDark ? '#e7eefc' : '#0f172a';
  chart.options.plugins.tooltip.bodyColor = isDark ? '#e7eefc' : '#0f172a';

  chart.update();
}

function updateSummary(totals, allowance) {
  const totalSpent = totals.needs + totals.wants + totals.savings;
  const remaining = Math.max(0, allowance - totalSpent);
  const burnRate = calculateBurnRate(totalSpent, allowance);

  elements.needsValue.textContent = formatCurrency(totals.needs);
  elements.wantsValue.textContent = formatCurrency(totals.wants);
  elements.savingsValue.textContent = formatCurrency(totals.savings);

  elements.allowanceValue.textContent = formatCurrency(allowance);
  elements.remainingValue.textContent = formatCurrency(remaining);
  elements.burnRateValue.textContent = `${Math.round(burnRate)}%`;
}

function init() {
  const isDarkMode = getThemeFromStorage();
  applyTheme(isDarkMode);

  populateMonthOptions();

  const currentMonth = elements.monthSelect.value;
  const spending = monthlySpending[currentMonth];
  const totals = calculateTotals(spending);
  const dailyTotals = calculateDailyTotals(spending);
  const cumulative = calculateCumulative(dailyTotals);

  updateSummary(totals, DEFAULT_ALLOWANCE);

  const labels = buildLabels(cumulative.length);
  const baseline = Array(cumulative.length).fill(DEFAULT_ALLOWANCE);

  const chart = createChart(elements.chartCanvas, labels, baseline, cumulative, isDarkMode ? 'dark' : 'light');

  elements.monthSelect.addEventListener('change', () => {
    const selected = elements.monthSelect.value;
    const monthSpending = monthlySpending[selected];
    const monthTotals = calculateTotals(monthSpending);
    const monthDaily = calculateDailyTotals(monthSpending);
    const monthCumulative = calculateCumulative(monthDaily);

    updateSummary(monthTotals, DEFAULT_ALLOWANCE);
    updateChartData(chart, DEFAULT_ALLOWANCE, monthCumulative, elements.body.classList.contains('dark') ? 'dark' : 'light');
  });

  elements.themeToggle.addEventListener('click', () => {
    const nextMode = !elements.body.classList.contains('dark');
    applyTheme(nextMode);
    persistTheme(nextMode);

    // Reapply chart theme/colors while keeping current month data
    const currentMonthSpending = monthlySpending[elements.monthSelect.value];
    const currentDaily = calculateDailyTotals(currentMonthSpending);
    const currentCumulative = calculateCumulative(currentDaily);

    updateChartData(chart, DEFAULT_ALLOWANCE, currentCumulative, nextMode ? 'dark' : 'light');
  });
}

window.addEventListener('DOMContentLoaded', init);
