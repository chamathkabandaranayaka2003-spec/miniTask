const STORAGE_KEY = 'budgetDashboardTheme';
const CATEGORY_STORAGE_KEY = 'budgetDashboardCategories';
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
  iconPicker: document.getElementById('iconPicker'),
  iconGrid: document.querySelector('.icon-picker__grid'),
  iconPickerClose: document.querySelector('.icon-picker__close'),
  popup: document.getElementById('categoryPopup'),
  popupLabel: document.getElementById('popupLabel'),
  popupValue: document.getElementById('popupValue'),
  popupSlider: document.getElementById('popupSlider'),
  popupInput: document.getElementById('popupInput'),
};

const defaultCategories = [
  { id: 'needs', label: 'Needs', icon: 'home' },
  { id: 'wants', label: 'Wants', icon: 'heart' },
  { id: 'savings', label: 'Savings', icon: 'piggy-bank' },
];

const iconLibrary = {
  'home': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-6v-6H10v6H4a1 1 0 0 1-1-1V9.5z"/></svg>',
  'shopping-bag': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12l2 5H4l2-5z"/><path d="M4 7h16v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7z"/><path d="M9 11a3 3 0 0 1 6 0"/></svg>',
  'heart': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.7 5.7 0 0 0-8.1 0L12 5.3l-0.7-0.7a5.7 5.7 0 0 0-8.1 8.1l8.8 8.9 8.8-8.9a5.7 5.7 0 0 0 0-8.1z"/></svg>',
  'piggy-bank': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M19 10c0 3.866-3.134 7-7 7s-7-3.134-7-7 3.134-7 7-7 7 3.134 7 7z"/><path d="M9 10h.01"/><path d="M2 14v2a2 2 0 0 0 2 2h2"/><path d="M22 14v2a2 2 0 0 1-2 2h-2"/><path d="M9 17v4"/></svg>',
  'coffee': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a3 3 0 0 1 0 6h-1"/><path d="M2 8h16v8a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><path d="M6 2v4"/><path d="M10 2v4"/></svg>',
  'gift': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v8a2 2 0 0 1-2 2h-4v-10"/><path d="M4 12v8a2 2 0 0 0 2 2h4v-10"/><path d="M20 12h-16"/><path d="M12 22V12"/><path d="M12 6a3 3 0 0 1 3-3c1.654 0 3 1.346 3 3a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3c0-1.654 1.346-3 3-3a3 3 0 0 1 3 3z"/></svg>',
};

function loadCategorySettings() {
  try {
    const stored = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

function persistCategorySettings(settings) {
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(settings));
}

function getCategorySetting(categoryId) {
  const settings = loadCategorySettings();
  return settings[categoryId] || {};
}

function setCategorySetting(categoryId, newData) {
  const settings = loadCategorySettings();
  settings[categoryId] = { ...(settings[categoryId] || {}), ...newData };
  persistCategorySettings(settings);
}

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

let currentIconCategoryId = null;
let currentPopupCategoryId = null;

function getCategoryIconSvg(iconKey) {
  return iconLibrary[iconKey] || iconLibrary.home;
}

function setCategoryTotal(categoryId, value) {
  categoryOverrideTotals[categoryId] = value;
  const currentMonthSpending = monthlySpending[elements.monthSelect.value];
  const totals = calculateTotals(currentMonthSpending);
  updateSummary(totals, DEFAULT_ALLOWANCE);
}

function showPopup(categoryId, anchorEl) {
  if (!elements.popup) return;
  currentPopupCategoryId = categoryId;

  const labelEl = document.querySelector(`.card__title[data-category-id="${categoryId}"]`);
  const value = getTotalWithOverride(categoryId, calculateTotals(monthlySpending[elements.monthSelect.value])[categoryId]);

  elements.popupLabel.textContent = labelEl ? labelEl.textContent : categoryId;
  elements.popupValue.textContent = formatCurrency(value);
  elements.popupSlider.value = value;
  elements.popupInput.value = value.toFixed(2);

  const rect = anchorEl.getBoundingClientRect();
  const offsetX = rect.left + rect.width / 2;
  const offsetY = rect.bottom + 14;

  elements.popup.style.left = `${offsetX}px`;
  elements.popup.style.top = `${offsetY}px`;
  elements.popup.setAttribute('aria-hidden', 'false');
}

function hidePopup() {
  if (!elements.popup) return;
  elements.popup.setAttribute('aria-hidden', 'true');
  if (currentPopupCategoryId) {
    const value = Number(elements.popupInput.value);
    if (!Number.isNaN(value)) {
      sendCategoryUpdate(currentPopupCategoryId, value);
    }
  }
  currentPopupCategoryId = null;
}

function setupPopupInteractions() {
  const iconEls = document.querySelectorAll('.card__icon');
  iconEls.forEach((icon) => {
    const categoryId = icon.dataset.categoryId;
    if (!categoryId) return;

    icon.addEventListener('pointerenter', () => showPopup(categoryId, icon));
    icon.addEventListener('pointerleave', (event) => {
      const to = event.relatedTarget;
      if (elements.popup && !elements.popup.contains(to)) {
        hidePopup();
      }
    });

    icon.addEventListener('click', () => showPopup(categoryId, icon));
  });

  if (!elements.popup) return;

  elements.popup.addEventListener('pointerleave', (event) => {
    const to = event.relatedTarget;
    if (!elements.popup.contains(to)) {
      hidePopup();
    }
  });

  elements.popupSlider.addEventListener('input', () => {
    const value = Number(elements.popupSlider.value);
    if (Number.isNaN(value)) return;
    elements.popupInput.value = value.toFixed(2);
    elements.popupValue.textContent = formatCurrency(value);
    if (currentPopupCategoryId) {
      setCategoryTotal(currentPopupCategoryId, value);
    }
  });

  elements.popupInput.addEventListener('input', () => {
    const value = Number(elements.popupInput.value);
    if (Number.isNaN(value)) return;
    elements.popupSlider.value = value;
    elements.popupValue.textContent = formatCurrency(value);
    if (currentPopupCategoryId) {
      setCategoryTotal(currentPopupCategoryId, value);
    }
  });

  document.addEventListener('click', (event) => {
    if (!elements.popup || elements.popup.getAttribute('aria-hidden') === 'true') return;
    if (!elements.popup.contains(event.target) && !event.target.closest('.card__icon')) {
      hidePopup();
    }
  });
}

function applyCategorySettings() {
  defaultCategories.forEach((category) => {
    const setting = getCategorySetting(category.id);
    const label = setting.label || category.label;
    const icon = setting.icon || category.icon;

    const titleEl = document.querySelector(`.card__title[data-category-id="${category.id}"]`);
    const iconEl = document.querySelector(`.card__icon[data-category-id="${category.id}"]`);

    if (titleEl) titleEl.textContent = label;
    if (iconEl) iconEl.innerHTML = getCategoryIconSvg(icon);
  });
}

async function sendCategoryUpdate(categoryId, total) {
  try {
    const response = await fetch('/updateCategory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId, total }),
    });
    if (!response.ok) throw new Error('Failed');

    pulseCard(categoryId);
    showSaveFeedback(categoryId);
  } catch (error) {
    console.warn('Failed to sync category:', error);
  }
}

function pulseCard(categoryId) {
  const card = document.querySelector(`.card[data-category-id="${categoryId}"]`);
  if (!card) return;
  card.classList.add('pulse');
  setTimeout(() => card.classList.remove('pulse'), 800);
}

function showSaveFeedback(categoryId) {
  const card = document.querySelector(`.card[data-category-id="${categoryId}"]`);
  if (!card) return;
  card.classList.add('saved');
  setTimeout(() => card.classList.remove('saved'), 700);
}

function setupValueEditing() {
  document.querySelectorAll('.card__value').forEach((input) => {
    const categoryId = input.dataset.categoryId;
    if (!categoryId) return;

    let debounceTimer = null;

    const applyValue = (value) => {
      categoryOverrideTotals[categoryId] = value;

      const currentMonthSpending = monthlySpending[elements.monthSelect.value];
      const totals = calculateTotals(currentMonthSpending);
      updateSummary(totals, DEFAULT_ALLOWANCE);
    };

    const scheduleSync = (value) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        sendCategoryUpdate(categoryId, value);
      }, 400);
    };

    const commitValue = () => {
      const rawValue = input.value.trim();
      const value = rawValue === '' ? 0 : Number(rawValue);
      if (Number.isNaN(value)) return;
      const fixed = Number(value.toFixed(2));
      input.value = fixed.toFixed(2);
      applyValue(fixed);
      sendCategoryUpdate(categoryId, fixed);
    };

    input.addEventListener('input', () => {
      const value = Number(input.value);
      if (Number.isNaN(value)) return;
      const fixed = Number(value.toFixed(2));
      applyValue(fixed);
      scheduleSync(fixed);
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commitValue();
        input.blur();
      }
    });

    input.addEventListener('blur', commitValue);
  });
}

function buildIconPicker() {
  if (!elements.iconGrid) return;

  elements.iconGrid.innerHTML = '';
  Object.keys(iconLibrary).forEach((key) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'icon-picker__item';
    button.setAttribute('data-icon-key', key);
    button.innerHTML = iconLibrary[key];
    button.addEventListener('click', () => {
      if (!currentIconCategoryId) return;
      setCategorySetting(currentIconCategoryId, { icon: key });
      applyCategorySettings();
      closeIconPicker();
    });

    elements.iconGrid.append(button);
  });
}

function openIconPicker(categoryId) {
  currentIconCategoryId = categoryId;
  if (!elements.iconPicker) return;
  elements.iconPicker.setAttribute('aria-hidden', 'false');
}

function closeIconPicker() {
  currentIconCategoryId = null;
  if (!elements.iconPicker) return;
  elements.iconPicker.setAttribute('aria-hidden', 'true');
}

function setupCategoryEditing() {
  applyCategorySettings();
  buildIconPicker();

  document.querySelectorAll('.card__title[contenteditable="true"]').forEach((titleEl) => {
    titleEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        titleEl.blur();
      }
    });

    titleEl.addEventListener('blur', () => {
      const categoryId = titleEl.dataset.categoryId;
      if (!categoryId) return;
      const newLabel = titleEl.textContent.trim();
      if (!newLabel) return;
      setCategorySetting(categoryId, { label: newLabel });
    });
  });

  document.querySelectorAll('.card__edit').forEach((button) => {
    button.addEventListener('click', () => {
      const categoryId = button.dataset.categoryId;
      if (!categoryId) return;
      openIconPicker(categoryId);
    });
  });

  if (elements.iconPickerClose) {
    elements.iconPickerClose.addEventListener('click', closeIconPicker);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeIconPicker();
  });

  document.addEventListener('click', (event) => {
    if (!elements.iconPicker || elements.iconPicker.getAttribute('aria-hidden') === 'true') return;
    if (!elements.iconPicker.contains(event.target) && !event.target.closest('.card__edit')) {
      closeIconPicker();
    }
  });
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
      animation: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: isDark ? 'rgba(231,238,252,0.85)' : 'rgba(16,42,67,0.85)' },
        },
        y: {
          grid: { color: isDark ? 'rgba(231,238,252,0.12)' : 'rgba(16,42,67,0.12)' },
          ticks: {
            color: isDark ? 'rgba(231,238,252,0.75)' : 'rgba(16,42,67,0.75)',
            callback: (value) => `$${value.toFixed(2)}`,
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

  chart.update({
    duration: 0,
  });
}

const categoryOverrideTotals = {};
let burnChart = null;

function getTotalWithOverride(categoryId, computedTotal) {
  const override = categoryOverrideTotals[categoryId];
  return typeof override === 'number' ? override : computedTotal;
}

function formatCurrency(value) {
  return value.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function updateSummary(totals, allowance) {
  const needsTotal = getTotalWithOverride('needs', totals.needs);
  const wantsTotal = getTotalWithOverride('wants', totals.wants);
  const savingsTotal = getTotalWithOverride('savings', totals.savings);

  const totalSpent = needsTotal + wantsTotal + savingsTotal;
  const remaining = Math.max(0, allowance - totalSpent);
  const burnRate = calculateBurnRate(totalSpent, allowance);

  elements.needsValue.value = needsTotal.toFixed(2);
  elements.wantsValue.value = wantsTotal.toFixed(2);
  elements.savingsValue.value = savingsTotal.toFixed(2);

  elements.allowanceValue.textContent = formatCurrency(allowance);
  elements.remainingValue.textContent = formatCurrency(remaining);
  elements.burnRateValue.textContent = `${Math.round(burnRate)}%`;

  if (burnChart) {
    updateChartFromOverrides();
  }
}

function updateChartFromOverrides() {
  if (!burnChart) return;
  const currentMonthSpending = monthlySpending[elements.monthSelect.value];
  const monthTotals = calculateTotals(currentMonthSpending);
  const dailyTotals = calculateDailyTotals(currentMonthSpending);
  const cumulative = calculateCumulative(dailyTotals);

  const originalTotal = monthTotals.needs + monthTotals.wants + monthTotals.savings;
  const overrideTotal = getTotalWithOverride('needs', monthTotals.needs)
    + getTotalWithOverride('wants', monthTotals.wants)
    + getTotalWithOverride('savings', monthTotals.savings);

  const scale = originalTotal > 0 ? overrideTotal / originalTotal : 1;

  const adjusted = cumulative.map((value, idx) => {
    const scaled = value * scale;
    return Number(scaled.toFixed(2));
  });

  if (adjusted.length > 0) {
    adjusted[adjusted.length - 1] = Number(overrideTotal.toFixed(2));
  }

  updateChartData(burnChart, DEFAULT_ALLOWANCE, adjusted, elements.body.classList.contains('dark') ? 'dark' : 'light');
}

function setCardAnimationIndices() {
  document.querySelectorAll('.card').forEach((card, index) => {
    card.style.setProperty('--card-index', String(index));
  });
}

function init() {
  const isDarkMode = getThemeFromStorage();
  applyTheme(isDarkMode);

  setupCategoryEditing();
  setCardAnimationIndices();
  setupValueEditing();
  setupPopupInteractions();
  populateMonthOptions();

  const currentMonth = elements.monthSelect.value;
  const spending = monthlySpending[currentMonth];
  const totals = calculateTotals(spending);
  const dailyTotals = calculateDailyTotals(spending);
  const cumulative = calculateCumulative(dailyTotals);

  updateSummary(totals, DEFAULT_ALLOWANCE);

  const labels = buildLabels(cumulative.length);
  const baseline = Array(cumulative.length).fill(DEFAULT_ALLOWANCE);

  burnChart = createChart(elements.chartCanvas, labels, baseline, cumulative, isDarkMode ? 'dark' : 'light');

  elements.monthSelect.addEventListener('change', () => {
    const selected = elements.monthSelect.value;
    const monthSpending = monthlySpending[selected];
    const monthTotals = calculateTotals(monthSpending);

    updateSummary(monthTotals, DEFAULT_ALLOWANCE);
  });

  elements.themeToggle.addEventListener('click', () => {
    const nextMode = !elements.body.classList.contains('dark');
    applyTheme(nextMode);
    persistTheme(nextMode);

    // Reapply chart theme/colors while keeping current month data
    updateChartFromOverrides();
  });
}

window.addEventListener('DOMContentLoaded', init);
